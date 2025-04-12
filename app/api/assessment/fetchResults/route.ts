import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Assuming base Airtable client is configured elsewhere or initialize here
// Ensure AIRTABLE_PERSONAL_ACCESS_TOKEN and AIRTABLE_BASE_ID are in your .env.local
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || ''
}).base(process.env.AIRTABLE_BASE_ID || '');

// --- Airtable Table Names (adjust if different) ---
const TBL_RESPONSES = 'AssessmentResponses';
const TBL_ANSWERS = 'MethodAnswers';
const TBL_QUESTIONS = 'MethodQuestions';
const TBL_CATEGORIES = 'MethodCategories';
const TBL_PROVIDERS = 'SolutionProviders';

// --- Type Definitions (based on schema and expected output) ---
interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

interface ParsedResponses {
  [questionId: string]: string; // questionId -> answerText_en
}

interface AnswerScoreMap {
  [answerText: string]: number; // answerText_en -> answerScore
}

interface QuestionCategoryMap {
  [questionRecordId: string]: string; // MethodQuestions Record ID -> categoryText_en
}

interface CategoryScores {
  [categoryName: string]: { sum: number; count: number };
}

interface CalculatedMetrics {
  [categoryName: string]: number; // categoryText_en -> average score (0-100)
}

interface FormattedProvider {
  name: string;
  logo: string | null; // URL or null if missing
  shortDescription: string;
  details: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
}

// Helper function to safely get attachment URL
const getLogoUrl = (attachments: any): string | null => {
  if (Array.isArray(attachments) && attachments.length > 0 && attachments[0].url) {
    return attachments[0].url;
  }
  return null;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const responseId = searchParams.get('responseId');

  if (!responseId) {
    return NextResponse.json({ success: false, error: 'Missing responseId parameter' }, { status: 400 });
  }

  const numericResponseId = Number(responseId);
  if (isNaN(numericResponseId)) {
    return NextResponse.json({ success: false, error: 'Invalid responseId format' }, { status: 400 });
  }

  try {
    console.log(`Fetching results for numericResponseId: ${numericResponseId}`);

    // --- 1. Fetch AssessmentResponses Record ---
    const responseRecords = await base(TBL_RESPONSES)
      .select({ filterByFormula: `({responseId} = ${numericResponseId})`, maxRecords: 1 })
      .firstPage();

    if (!responseRecords || responseRecords.length === 0) {
      console.error(`Assessment response not found for responseId: ${numericResponseId}`);
      return NextResponse.json({ success: false, error: 'Assessment response not found' }, { status: 404 });
    }
    const assessmentRecord = responseRecords[0];
    const responseContentString = assessmentRecord.fields.responseContent as string;
    const linkedCompanyTypeIds = assessmentRecord.fields.MethodCompanyTypes as string[] | undefined; // Link field

    if (!responseContentString || !linkedCompanyTypeIds || linkedCompanyTypeIds.length === 0) {
      console.error(`Missing responseContent or MethodCompanyTypes link for record: ${assessmentRecord.id}`);
      return NextResponse.json({ success: false, error: 'Incomplete assessment data found' }, { status: 400 });
    }
    const companyTypeId = linkedCompanyTypeIds[0]; // Assuming single link for now

    // --- 2. Parse Response Content ---
    let parsedResponses: ParsedResponses;
    try {
      parsedResponses = JSON.parse(responseContentString);
    } catch (e) {
      console.error(`Failed to parse responseContent JSON for record: ${assessmentRecord.id}`, e);
      return NextResponse.json({ success: false, error: 'Corrupted assessment data found' }, { status: 500 });
    }

    // --- 3. Fetch MethodAnswers (Scoring Map) ---
    const answerRecords = await base(TBL_ANSWERS).select({ fields: ['answerText_en', 'answerScore'] }).all();
    const answerScoreMap: AnswerScoreMap = {};
    answerRecords.forEach(record => {
      if (record.fields.answerText_en && typeof record.fields.answerScore === 'number') {
        answerScoreMap[record.fields.answerText_en as string] = record.fields.answerScore;
      }
    });

    // --- 4. Fetch MethodCategories & MethodQuestions (Category Map) ---
    const categoryRecords = await base(TBL_CATEGORIES).select({ fields: ['categoryText_en'] }).all();
    const categoryNameMap = new Map<string, string>(); // record.id -> categoryText_en
    categoryRecords.forEach(record => {
      if (record.fields.categoryText_en) {
        categoryNameMap.set(record.id, record.fields.categoryText_en as string);
      }
    });

    const questionRecords = await base(TBL_QUESTIONS).select({ fields: ['MethodCategories'] }).all();
    const questionCategoryMap: QuestionCategoryMap = {};
    questionRecords.forEach(record => {
      const linkedCategoryIds = record.fields.MethodCategories as string[] | undefined;
      if (linkedCategoryIds && linkedCategoryIds.length > 0) {
        const categoryName = categoryNameMap.get(linkedCategoryIds[0]);
        if (categoryName) {
          questionCategoryMap[record.id] = categoryName;
        }
      }
    });

    // --- 5. Calculate Metrics ---
    const categoryScores: CategoryScores = {};
    for (const questionId in parsedResponses) {
      const answerText = parsedResponses[questionId];
      const categoryName = questionCategoryMap[questionId];
      const score = answerScoreMap[answerText];

      if (categoryName !== undefined && score !== undefined) {
        if (!categoryScores[categoryName]) {
          categoryScores[categoryName] = { sum: 0, count: 0 };
        }
        categoryScores[categoryName].sum += score;
        categoryScores[categoryName].count += 1;
      } else {
        console.warn(`Missing category or score for questionId: ${questionId}, answer: ${answerText}`);
      }
    }

    const calculatedMetrics: CalculatedMetrics = {};
    for (const categoryName in categoryScores) {
      const { sum, count } = categoryScores[categoryName];
      calculatedMetrics[categoryName] = count > 0 ? Math.round((sum / count)) : 0; // Calculate average, handle division by zero
    }

    // --- 6. Fetch and Filter Solution Providers ---
    // Filter providers based on the company type linked to the assessment
    const providerRecords = await base(TBL_PROVIDERS)
      .select({
        filterByFormula: `SEARCH("${companyTypeId}", ARRAYJOIN({MethodCompanyTypes}))`,
        fields: [
          'providerName_en',
          'providerLogo',
          'providerDescription_en',
          'providerContactName',
          'providerContactEmail',
          'providerContactPhone',
          // Add any other fields needed for display or more complex matching later
          // e.g., MethodCategories, MethodMaturityLevels
        ]
      })
      .all();

    // --- 7. Format Providers ---
    const formattedProviders: FormattedProvider[] = providerRecords.map(record => ({
      name: record.fields.providerName_en as string || 'N/A',
      logo: getLogoUrl(record.fields.providerLogo), // Use helper to get URL
      shortDescription: (record.fields.providerDescription_en as string || 'No description available.').substring(0, 100) + '...', // Example: Use full description or create a dedicated short desc field
      details: record.fields.providerDescription_en as string || 'No details available.',
      contactName: record.fields.providerContactName as string || 'N/A',
      contactEmail: record.fields.providerContactEmail as string || 'N/A',
      contactPhone: record.fields.providerContactPhone as string || 'N/A',
      contactRole: record.fields.providerContactRole as string || 'N/A' // Assuming contactRole exists
    }));

    // --- 8. Return Response ---
    return NextResponse.json({
      success: true,
      metrics: calculatedMetrics,
      providers: formattedProviders,
    });

  } catch (error: any) {
    console.error('Error fetching assessment results:', error);
    // Log the specific error stack if available
    if (error.stack) {
      console.error(error.stack);
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch results' }, { status: 500 });
  }
} 