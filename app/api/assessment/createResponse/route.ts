import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { createRecord } from '@/lib/airtable';

// Initialize a separate Airtable base instance for querying linked records
const baseAirtable = new Airtable({ apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || '' }).base(process.env.AIRTABLE_BASE_ID || '');

export async function POST(request: Request) {
  try {
    const { businessGoals, companyType } = await request.json();
    if (!businessGoals || !companyType) {
      throw new Error('Missing required fields: businessGoals or companyType');
    }

    // Map the provided companyType value to the corresponding companyTypeId used in Airtable
    const companyTypeMapping: Record<string, string> = {
      startup: 'T1',
      scaleup: 'T2',
      'small-business': 'T3',
      enterprise: 'T4'
    };

    const mappedCompanyTypeId = companyTypeMapping[companyType.toLowerCase()];
    if (!mappedCompanyTypeId) {
      throw new Error('Invalid company type provided');
    }

    // Look up the corresponding record in MethodCompanyTypes table using the companyTypeId field
    const companyTypeRecords = await baseAirtable('MethodCompanyTypes')
      .select({
        filterByFormula: `{companyTypeId} = "${mappedCompanyTypeId}"`
      })
      .firstPage();

    if (!companyTypeRecords || companyTypeRecords.length === 0) {
      throw new Error('No matching company type found in Airtable');
    }
    const linkedRecordId = companyTypeRecords[0].id;

    // Create the AssessmentResponses record with businessGoals and the linked company type record
    // The linked field in AssessmentResponses is named 'MethodCompanyTypes'
    const recordData = {
      businessGoals,
      MethodCompanyTypes: [linkedRecordId],
      responseStatus: "New" // Set initial status
    };
    console.log("Creating AssessmentResponses record with data:", recordData);
    const record = await createRecord('AssessmentResponses', recordData);
    
    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('Error creating assessment response:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 