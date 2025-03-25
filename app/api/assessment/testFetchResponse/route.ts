import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable base
const baseAirtable = new Airtable({ apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || '' }).base(process.env.AIRTABLE_BASE_ID || '');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const responseIdParam = searchParams.get('responseId');
    if (!responseIdParam) {
      return NextResponse.json({ success: false, error: 'Missing responseId parameter' }, { status: 400 });
    }

    const numericResponseId = Number(responseIdParam);
    if (isNaN(numericResponseId)) {
      return NextResponse.json({ success: false, error: 'Invalid responseId parameter' }, { status: 400 });
    }

    const records = await baseAirtable('AssessmentResponses')
      .select({
        filterByFormula: `({responseId} = ${numericResponseId})`
      })
      .firstPage();

    if (!records || records.length === 0) {
      return NextResponse.json({ success: false, error: 'No record found' }, { status: 404 });
    }

    const record = records[0];
    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('Error in testFetchResponse:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
} 