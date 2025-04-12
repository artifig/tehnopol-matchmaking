import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable base
const baseAirtable = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || ''
}).base(process.env.AIRTABLE_BASE_ID || '');

export async function POST(request: Request) {
  try {
    // Expects responseId and responses object (QuestionRecordID -> AnswerRecordID)
    const { responseId, responses } = await request.json(); 

    if (responseId === undefined || responseId === null || responseId === '' || responses === undefined || responses === null || typeof responses !== 'object') {
      return NextResponse.json({ success: false, error: 'Missing or invalid responseId or responses object' }, { status: 400 });
    }

    // Convert responseId to a number since the responseId field in Airtable is numeric
    const numericResponseId = Number(responseId);
    console.log('Received responseId:', responseId, 'Converted numericResponseId:', numericResponseId);
    if (isNaN(numericResponseId)) {
      return NextResponse.json({ success: false, error: 'Invalid responseId: not a number' }, { status: 400 });
    }

    // Query the AssessmentResponses table to find the record with the custom responseId
    const responseRecords = await baseAirtable('AssessmentResponses')
      .select({
        filterByFormula: `({responseId} = ${numericResponseId})`,
        maxRecords: 1 // Ensure only one record is fetched
      })
      .firstPage();

    if (!responseRecords || responseRecords.length === 0) {
      return NextResponse.json({ success: false, error: 'Assessment response not found' }, { status: 404 });
    }

    // Use the internal record id (record id) of the first matching record
    const record = responseRecords[0];
    
    // Prepare data for update: Stringify the responses (QuestionID -> AnswerID map) 
    // and set the status to Completed
    const fieldsToUpdate = {
      responseContent: JSON.stringify(responses), // Store the ID map as JSON
      responseStatus: "Completed" 
    };
    console.log(`Updating record ${record.id} with responseContent (ID map) and status:`, fieldsToUpdate);
    
    // Update the record
    const updatedRecord = await baseAirtable('AssessmentResponses').update(record.id, fieldsToUpdate);

    return NextResponse.json({ success: true, record: updatedRecord });
  } catch (error: any) {
    console.error('Error saving assessment responses:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 