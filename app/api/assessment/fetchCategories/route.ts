import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize a separate Airtable base instance for querying
const baseAirtable = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || ''
}).base(process.env.AIRTABLE_BASE_ID || '');

// Define types for clarity
interface AnswerOption {
  id: string; // MethodAnswers Record ID
  text: string; // answerText_en
}

interface Question {
  id: string; // MethodQuestions Record ID
  questionText_en: string;
  answers: AnswerOption[]; // Add possible answers
}

interface Category {
  id: string; // MethodCategories Record ID
  categoryText_en: string;
  categoryDescription_en: string;
  questions: Question[]; // Embed full questions with answers
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyType = searchParams.get('companyType');
    if (!companyType) {
      return NextResponse.json(
        { success: false, error: 'Missing companyType query parameter' },
        { status: 400 }
      );
    }
    // Map the provided companyType value to the corresponding companyTypeId
    const companyTypeMapping: Record<string, string> = {
      startup: 'T1',
      scaleup: 'T2',
      'small-business': 'T3',
      enterprise: 'T4'
    };
    const mappedCompanyTypeId = companyTypeMapping[companyType.toLowerCase()];
    if (!mappedCompanyTypeId) {
      return NextResponse.json(
        { success: false, error: 'Invalid company type provided' },
        { status: 400 }
      );
    }
    // Look up the corresponding record in MethodCompanyTypes table using the companyTypeId field
    const companyTypeRecords = await baseAirtable('MethodCompanyTypes')
      .select({
        filterByFormula: `{companyTypeId} = "${mappedCompanyTypeId}"`
      })
      .firstPage();
    if (!companyTypeRecords || companyTypeRecords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No matching company type found in Airtable' },
        { status: 404 }
      );
    }
    // Extract the linked MethodCategories field (an array of record ids)
    const companyTypeRecord = companyTypeRecords[0];
    // Use explicit any cast for linked field access
    const linkedCategories = (companyTypeRecord.fields as any).MethodCategories as string[];
    if (!linkedCategories || linkedCategories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No linked categories found for this company type' },
        { status: 404 }
      );
    }
    // Build a filter formula to fetch the categories from MethodCategories table.
    const orConditions = linkedCategories
      .map(id => `RECORD_ID() = "${id}"`)
      .join(', ');
    const filterFormula = `OR(${orConditions})`;
    // Fetch the MethodCategories records using the filter formula with sorting
    const categoryRecords = await baseAirtable('MethodCategories')
      .select({ 
        filterByFormula: filterFormula,
        fields: ['categoryText_en', 'categoryDescription_en', 'MethodQuestions'], // Specify fields
        sort: [{ field: 'categoryId', direction: 'asc' }]
      })
      .all(); // Use .all() to get all relevant categories

    // --- Prepare to fetch Questions and Answers --- 
    const allQuestionIds = Array.from(new Set(categoryRecords.flatMap(cat => (cat.fields as any).MethodQuestions || []))) as string[];
    let questionsMap: Map<string, Question> = new Map();
    let answersMap: Map<string, AnswerOption[]> = new Map(); // questionId -> AnswerOption[]

    // --- Fetch MethodAnswers First (to link them to questions later) ---
    // Assuming a reasonable number of total answer options; otherwise, filter by linked questions
    const answerOptionRecords = await baseAirtable('MethodAnswers')
      .select({ fields: ['answerText_en', 'MethodQuestions'] }) // Need linked question IDs
      .all();
      
    // Build a map of questionId -> array of its AnswerOptions
    answerOptionRecords.forEach(ansRec => {
      // Use explicit any cast for linked field access
      const questionIds = (ansRec.fields as any).MethodQuestions as string[] | undefined;
      // Ensure answerText_en is treated as a string
      const answerText = typeof ansRec.fields.answerText_en === 'string' ? ansRec.fields.answerText_en : ''; 
      if (questionIds && questionIds.length > 0 && answerText) { // Ensure answerText is valid
        const answerOption: AnswerOption = {
          id: ansRec.id,
          text: answerText // Use validated answerText
        };
        questionIds.forEach(qId => {
          if (!answersMap.has(qId)) {
            answersMap.set(qId, []);
          }
          answersMap.get(qId)!.push(answerOption);
        });
      }
    });

    // --- Fetch MethodQuestions --- 
    if (allQuestionIds.length > 0) {
      const questionFilterFormula = `OR(${allQuestionIds.map(id => `RECORD_ID() = "${id}"`).join(', ')})`;
      const questionRecords = await baseAirtable('MethodQuestions')
        .select({
          filterByFormula: questionFilterFormula,
          fields: ['questionText_en'], // Only need text now
          sort: [{ field: 'questionId', direction: 'asc' }]
        })
        .all();
        
      // Populate questionsMap, attaching the pre-fetched answers
      questionRecords.forEach(qRec => {
        // Ensure questionText_en is treated as a string
        const questionText = typeof qRec.fields.questionText_en === 'string' ? qRec.fields.questionText_en : '';
        questionsMap.set(qRec.id, {
          id: qRec.id,
          questionText_en: questionText, // Use validated questionText
          answers: answersMap.get(qRec.id) || [] // Get answers from the map
        });
      });
    }

    // --- Combine data into the final structure --- 
    const categoriesWithData: Category[] = categoryRecords.map(catRec => {
      // Use explicit any cast for linked field access
      const questionIds = (catRec.fields as any).MethodQuestions as string[] || [];
      return {
        id: catRec.id,
        categoryText_en: typeof catRec.fields.categoryText_en === 'string' ? catRec.fields.categoryText_en : '', // Add type check
        categoryDescription_en: typeof catRec.fields.categoryDescription_en === 'string' ? catRec.fields.categoryDescription_en : '', // Add type check
        questions: questionIds
          .map(qid => questionsMap.get(qid)) // Get full question object from map
          .filter((q): q is Question => q !== undefined) // Type guard and filter undefined
      };
    });

    return NextResponse.json({ success: true, categories: categoriesWithData });
  } catch (error: any) {
    console.error('Error fetching assessment categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}