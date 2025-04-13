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
  [questionRecordId: string]: string; // questionRecordId -> answerRecordId
}

interface AnswerScoreMap {
  [answerRecordId: string]: number; // answerRecordId -> answerScore
}

interface QuestionCategoryMap {
  [questionRecordId: string]: { categoryId: string; categoryName: string };
}

interface CategoryResult {
    score: number;
    description: string;
}

interface CalculatedMetrics {
  [categoryName: string]: CategoryResult;
}

interface CategoryScores {
  [categoryName: string]: { sum: number; count: number };
}

interface FormattedProvider {
  name: string;
  logo: string | null; // URL or null if missing
  shortDescription: string;
  details: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
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

    // --- 2. Parse Response Content (QuestionID -> AnswerID map) ---
    let parsedResponses: ParsedResponses;
    try {
      parsedResponses = JSON.parse(responseContentString);
    } catch (e) {
      console.error(`Failed to parse responseContent JSON for record: ${assessmentRecord.id}`, e);
      return NextResponse.json({ success: false, error: 'Corrupted assessment data found' }, { status: 500 });
    }

    // --- 3. Fetch MethodAnswers (Scoring Map: AnswerRecordID -> Score) ---
    // Fetch only the answers relevant to this assessment if possible,
    // otherwise fetch all and build map.
    // For simplicity here, fetching all.
    const answerRecords = await base(TBL_ANSWERS).select({ fields: ['answerScore'] }).all(); // Only need score
    const answerScoreMap: AnswerScoreMap = {};
    answerRecords.forEach(record => {
      // Map Answer Record ID to its score
      if (typeof record.fields.answerScore === 'number') {
        answerScoreMap[record.id] = record.fields.answerScore;
      }
    });

    // --- 4. Fetch MethodCategories & MethodQuestions (Category Map) ---
    const categoryRecords = await base(TBL_CATEGORIES).select({ fields: ['categoryText_en', 'categoryDescription_en'] }).all();
    const categoryNameToIdMap = new Map<string, string>(); // categoryText_en -> record.id
    const categoryDataMap = new Map<string, { id: string; description: string }>(); // Map name -> {id, description}
    categoryRecords.forEach(record => {
      const name = record.fields.categoryText_en as string;
      const description = record.fields.categoryDescription_en as string || ''; // Get description
      if (name) {
        categoryNameToIdMap.set(name, record.id);
        categoryDataMap.set(name, { id: record.id, description }); // Store description
      }
    });

    const questionRecords = await base(TBL_QUESTIONS).select({ fields: ['MethodCategories'] }).all();
    const questionCategoryMap: QuestionCategoryMap = {};
    questionRecords.forEach(record => {
      const linkedCategoryIds = record.fields.MethodCategories as string[] | undefined;
      if (linkedCategoryIds && linkedCategoryIds.length > 0) {
        const categoryId = linkedCategoryIds[0]; // Assuming one category per question
        const categoryName = categoryRecords.find(cr => cr.id === categoryId)?.fields.categoryText_en as string;
        if (categoryId && categoryName) {
          questionCategoryMap[record.id] = { categoryId, categoryName };
        }
      }
    });

    // --- 5. Calculate Metrics (Using Answer IDs) ---
    const categoryScores: CategoryScores = {};
    for (const questionId in parsedResponses) {
      const answerId = parsedResponses[questionId]; // This is now Answer Record ID
      const categoryInfo = questionCategoryMap[questionId];
      const score = answerScoreMap[answerId]; // Get score using Answer Record ID

      if (categoryInfo && score !== undefined) {
        const categoryName = categoryInfo.categoryName;
        if (!categoryScores[categoryName]) {
          categoryScores[categoryName] = { sum: 0, count: 0 };
        }
        categoryScores[categoryName].sum += score;
        categoryScores[categoryName].count += 1;
      } else {
        // More specific warning
        console.warn(`Missing category info for questionId: ${questionId} OR score for answerId: ${answerId}`);
      }
    }

    // Create the final metrics object including descriptions
    const calculatedMetrics: CalculatedMetrics = {};
    for (const categoryName in categoryScores) {
      const { sum, count } = categoryScores[categoryName];
      const categoryData = categoryDataMap.get(categoryName);
      calculatedMetrics[categoryName] = {
          score: count > 0 ? Math.round((sum / count)) : 0,
          description: categoryData?.description || 'No description available.' // Add description
      };
    }
    console.log("Calculated Metrics (with descriptions):", calculatedMetrics);

    // --- 6. Identify Low-Score Categories ---
    const metricsArray = Object.entries(calculatedMetrics);
    metricsArray.sort(([, resultA], [, resultB]) => resultA.score - resultB.score); // Sort ascending by score
    // Target categories - e.g., the lowest 2 scoring categories
    const targetCategoryNames = metricsArray.slice(0, 2).map(([name]) => name);
    const targetCategoryIds = targetCategoryNames
        .map(name => categoryNameToIdMap.get(name))
        .filter((id): id is string => id !== undefined);
    
    console.log("Targeting providers for low-score categories:", targetCategoryNames, "with IDs:", targetCategoryIds);

    // --- 7. Fetch and Filter Solution Providers --- 
    let allProviderRecords: Readonly<AirtableRecord[]> = [];
    let companyTypeFilteredProviders: AirtableRecord[] = [];
    let categoryFilteredProviders: AirtableRecord[] = []; 

    // **ADDED LOGGING**: Log the companyTypeId being used for the filter
    console.log(`Filtering providers using Company Type ID: ${companyTypeId}`); 

    // Fetch ALL active providers (or remove filterByFormula if count is small)
    // Remove the complex SEARCH formula
    allProviderRecords = await base(TBL_PROVIDERS) 
      .select({
        // filterByFormula: `SEARCH("${companyTypeId}", ARRAYJOIN({MethodCompanyTypes}))`, // REMOVED
        // Example: Filter by active if needed: filterByFormula: `{isActive} = 1`,
        fields: [ 
          'providerName_en',
          'providerLogo',
          'providerDescription_en', 
          'providerContactName',
          'providerContactEmail',
          'providerContactPhone',
          'MethodCompanyTypes',
          'MethodCategories' // Keep fetching categories for the next step
        ]
      })
      .all();
    console.log(`Fetched ${allProviderRecords.length} total providers.`);

    // **NEW**: Filter by Company Type ID in code
    companyTypeFilteredProviders = allProviderRecords.filter(record => {
        const linkedCompanyTypes = (record.fields as any).MethodCompanyTypes as string[] | undefined;
        return linkedCompanyTypes?.includes(companyTypeId); // Check if the array includes the ID
    });
    console.log(`Found ${companyTypeFilteredProviders.length} providers matching company type ID: ${companyTypeId}.`);

    // Filter by Target Categories (only if providers found and target IDs exist)
    if (targetCategoryIds.length > 0 && companyTypeFilteredProviders.length > 0) {
        categoryFilteredProviders = companyTypeFilteredProviders.filter(record => {
            const linkedProviderCategories = (record.fields as any).MethodCategories as string[] | undefined;
            if (!linkedProviderCategories) return false;
            const isMatch = linkedProviderCategories.some(providerCatId => targetCategoryIds.includes(providerCatId));
            return isMatch;
        });
        console.log(`Found ${categoryFilteredProviders.length} providers matching company type AND target categories.`);
    } else {
        // If no target categories or no providers after company type filter, use the companyTypeFiltered list
        categoryFilteredProviders = companyTypeFilteredProviders; 
        if (targetCategoryIds.length === 0) {
             console.log("No target categories identified, using all providers matching company type.");
        } else {
             console.log("No providers matched company type, skipping category filter.");
        }
    }
    
    // --- 8. Format Providers --- 
    // Format the *final* filtered list
    const formattedProviders: FormattedProvider[] = categoryFilteredProviders.map(record => ({
      name: record.fields.providerName_en as string || 'N/A',
      logo: getLogoUrl(record.fields.providerLogo),
      shortDescription: (record.fields.providerDescription_en as string || 'No description available.').substring(0, 100) + '...', 
      details: record.fields.providerDescription_en as string || 'No details available.', 
      contactName: record.fields.providerContactName as string || 'N/A',
      contactEmail: record.fields.providerContactEmail as string || 'N/A',
      contactPhone: record.fields.providerContactPhone as string || 'N/A'
    }));
    

    // --- 9. Return Response --- 
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