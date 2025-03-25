import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable base
const baseAirtable = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || ''
}).base(process.env.AIRTABLE_BASE_ID || '');

export async function POST(request: Request) {
  try {
    const { responseId, responses } = await request.json();

    if (responseId === undefined || responseId === null || responseId === '' || responses === undefined || responses === null) {
      return NextResponse.json({ success: false, error: 'Missing responseId or responses' }, { status: 400 });
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
        filterByFormula: `({responseId} = ${numericResponseId})`
      })
      .firstPage();

    if (!responseRecords || responseRecords.length === 0) {
      return NextResponse.json({ success: false, error: 'Assessment response not found' }, { status: 404 });
    }

    // Use the internal record id (record id) of the first matching record
    const record = responseRecords[0];
    // Update the record's responseContent field using the internal record id
    const updatedRecord = await baseAirtable('AssessmentResponses').update(record.id, {
      responseContent: JSON.stringify(responses)
    });

    return NextResponse.json({ success: true, record: updatedRecord });
  } catch (error: any) {
    console.error('Error saving assessment responses:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 