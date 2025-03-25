import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize a separate Airtable base instance for querying
const baseAirtable = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || ''
}).base(process.env.AIRTABLE_BASE_ID || '');

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
    const linkedCategories = companyTypeRecord.fields.MethodCategories as string[];
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
        sort: [{ field: 'categoryId', direction: 'asc' }]
      })
      .firstPage();

    // Map each category to include linked question IDs with explicit type cast and filtering
    const categoriesWithQuestionsIds = categoryRecords.map(record => ({
      id: record.id,
      categoryText_en: record.fields.categoryText_en,
      categoryDescription_en: record.fields.categoryDescription_en,
      methodQuestions: Array.isArray(record.fields.MethodQuestions) ? record.fields.MethodQuestions.filter((item): item is string => typeof item === 'string') : []
    }));

    // Gather unique question IDs from all categories
    const allQuestionIds = Array.from(new Set(categoriesWithQuestionsIds.flatMap(cat => cat.methodQuestions)));

    // Initialize questions mapping with proper type
    let questionsMapping: Record<string, { id: string; questionText_en: string }> = {};
    if (allQuestionIds.length > 0) {
      const orConditionsQ = allQuestionIds.map(id => `RECORD_ID() = "${id}"`).join(', ');
      const filterFormulaQ = `OR(${orConditionsQ})`;
      const questionRecords = await baseAirtable('MethodQuestions')
        .select({
          filterByFormula: filterFormulaQ,
          sort: [{ field: 'questionId', direction: 'asc' }]
        })
        .firstPage();
      questionsMapping = questionRecords.reduce((acc, record) => {
        acc[record.id] = {
          id: record.id,
          questionText_en: typeof record.fields.questionText_en === 'string' ? record.fields.questionText_en : ''
        };
        return acc;
      }, {} as Record<string, { id: string; questionText_en: string }>);
    }

    // Attach fetched questions to each category
    const categoriesWithQuestions = categoriesWithQuestionsIds.map(cat => ({
      ...cat,
      questions: (cat.methodQuestions as string[])
        .map((qid: string) => questionsMapping[qid])
        .filter((q) => q !== undefined)
    }));

    return NextResponse.json({ success: true, categories: categoriesWithQuestions });
  } catch (error: any) {
    console.error('Error fetching assessment categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}