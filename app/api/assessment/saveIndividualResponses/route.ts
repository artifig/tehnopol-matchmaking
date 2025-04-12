import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable base
const baseAirtable = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || ''
}).base(process.env.AIRTABLE_BASE_ID || '');

/*
 * ==========================
 * PLACEHOLDER API ROUTE
 * ==========================
 * This route demonstrates an alternative approach to saving assessment responses.
 * Instead of storing all responses as a JSON string in the main AssessmentResponses record,
 * it saves each answer as a separate record in a hypothetical "AssessmentAnswers" table.
 *
 * !!! THIS IS NOT CURRENTLY USED BY THE APPLICATION !!!
 * It requires:
 *   1. An "AssessmentAnswers" table in Airtable with fields to link to:
 *      - AssessmentResponses (Link)
 *      - MethodQuestions (Link)
 *      - MethodAnswers (Link)
 *      - (Optional) The actual answer score/text if denormalizing.
 *   2. Modifications to the frontend to call this endpoint instead of saveResponses.
 *   3. Potential performance considerations due to multiple write operations.
 */

interface RequestBody {
  responseId: string | number;
  responses: Record<string, string>; // e.g., { "questionRecordId1": "answerText1", "questionRecordId2": "answerText2" }
}

export async function POST(request: NextRequest) {
  console.warn("WARNING: Placeholder API route saveIndividualResponses called. This route is not fully implemented.");

  try {
    const { responseId, responses }: RequestBody = await request.json();

    if (!responseId || !responses || Object.keys(responses).length === 0) {
      return NextResponse.json({ success: false, error: 'Missing responseId or responses' }, { status: 400 });
    }

    const numericResponseId = Number(responseId);
    if (isNaN(numericResponseId)) {
      return NextResponse.json({ success: false, error: 'Invalid responseId' }, { status: 400 });
    }

    // --- Step 1: Find the main AssessmentResponses record --- 
    const assessmentResponseRecords = await baseAirtable('AssessmentResponses')
      .select({ filterByFormula: `({responseId} = ${numericResponseId})` })
      .firstPage();

    if (!assessmentResponseRecords || assessmentResponseRecords.length === 0) {
      return NextResponse.json({ success: false, error: 'Assessment response not found' }, { status: 404 });
    }
    const assessmentResponseRecordId = assessmentResponseRecords[0].id;

    // --- Step 2: Prepare data for creating individual answer records ---
    const answerRecordsToCreate: any[] = [];
    const questionIds = Object.keys(responses);
    const answerTexts = Object.values(responses);

    // --- OPTIONAL BUT RECOMMENDED: Pre-fetch MethodQuestions and MethodAnswers records --- 
    // This avoids querying Airtable inside the loop. Fetch all relevant questions and answers at once.
    // Example: 
    // const questionFilter = `OR(${questionIds.map(id => `RECORD_ID() = '${id}'`).join(',')})`;
    // const questionRecords = await baseAirtable('MethodQuestions').select({ filterByFormula: questionFilter }).all();
    // const questionMap = new Map(questionRecords.map(r => [r.id, r])); // Map Record ID to Record
    // 
    // const answerFilter = `OR(${answerTexts.map(text => `{answerText_en} = '${text}'`).join(',')})`;
    // const answerOptionRecords = await baseAirtable('MethodAnswers').select({ filterByFormula: answerFilter }).all();
    // const answerMap = new Map(answerOptionRecords.map(r => [r.fields.answerText_en, r.id])); // Map Answer Text to Record ID

    for (const questionId of questionIds) {
      const answerText = responses[questionId];

      // --- Look up linked record IDs (Inefficient way: query inside loop) ---
      // It's better to pre-fetch as shown above.
      // const methodQuestionRecordId = questionId; // Assuming frontend sends Airtable Record IDs
      // const methodAnswerRecords = await baseAirtable('MethodAnswers')
      //   .select({ filterByFormula: `{answerText_en} = "${answerText}"` })
      //   .firstPage();
      // const methodAnswerRecordId = methodAnswerRecords?.[0]?.id;
      
      // --- Get linked record IDs using pre-fetched maps (Efficient way) --- 
      // const methodQuestionRecordId = questionMap.get(questionId)?.id;
      // const methodAnswerRecordId = answerMap.get(answerText);

      // Placeholder: Replace with actual lookup logic (using pre-fetched maps is best)
      const methodQuestionRecordId = questionId; // Replace with actual lookup
      const methodAnswerRecordId = "recPlaceholderAnswerID"; // Replace with actual lookup

      if (methodQuestionRecordId && methodAnswerRecordId) {
        answerRecordsToCreate.push({
          fields: {
            // Field names in your hypothetical "AssessmentAnswers" table
            'AssessmentResponseLink': [assessmentResponseRecordId],
            'MethodQuestionLink': [methodQuestionRecordId],
            'MethodAnswerLink': [methodAnswerRecordId],
            // Optional: Store score directly for easier rollups
            // 'AnswerScore': answerMap.get(answerText)?.fields.answerScore 
          }
        });
      } else {
        console.warn(`Could not find linked records for Question ID: ${questionId} or Answer Text: ${answerText}`);
      }
    }

    // --- Step 3: Create records in the "AssessmentAnswers" table --- 
    // Airtable limits batch creation to 10 records per request.
    // You'll need to chunk answerRecordsToCreate if it's larger than 10.
    if (answerRecordsToCreate.length > 0) {
      // Example for a hypothetical "AssessmentAnswers" table
      // const createdAnswerRecords = await baseAirtable('AssessmentAnswers').create(answerRecordsToCreate);
      console.log("Placeholder: Would create these records in AssessmentAnswers:", JSON.stringify(answerRecordsToCreate, null, 2));
      // return NextResponse.json({ success: true, createdRecords: createdAnswerRecords });
      return NextResponse.json({ success: true, message: "Placeholder: Individual answers processed." });
    } else {
      return NextResponse.json({ success: false, error: 'No valid answer records could be prepared' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error saving individual assessment responses (Placeholder):', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 