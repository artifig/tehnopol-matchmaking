import { NextRequest, NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable base
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || ''
}).base(process.env.AIRTABLE_BASE_ID || '');

const TBL_RESPONSES = 'AssessmentResponses';

// Use exact Airtable field names as expected keys in the request body
interface RequestBody {
  responseId: string | number;
  contactFirstName?: string;  // Changed from firstName
  contactLastName?: string;   // Changed from lastName
  contactCompanyName?: string; // Changed from company
  contactEmail?: string;      // Already matching
  contactCompanyRegistrationNumber?: string; // Changed from companyRegistrationNumber (number conversion happens later)
  contactPhoneNumber?: string; // Changed from phone
  contactCountry?: string;    // Already matching
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    // Destructure using the exact Airtable field names
    const { 
        responseId, 
        contactFirstName, 
        contactLastName, 
        contactCompanyName, 
        contactEmail, 
        contactCompanyRegistrationNumber, // String from form
        contactPhoneNumber, 
        contactCountry 
    } = body;

    // --- Validation ---
    if (responseId === undefined || responseId === null || responseId === '') {
      return NextResponse.json({ success: false, error: 'Missing responseId' }, { status: 400 });
    }
    // Validate based on the new destructured names
    if (!contactFirstName || !contactLastName || !contactCompanyName || !contactEmail || !contactPhoneNumber || !contactCountry) {
        console.warn('Request body for updateContactInfo might be missing some required fields:', body);
    }

    const numericResponseId = Number(responseId);
    if (isNaN(numericResponseId)) {
      return NextResponse.json({ success: false, error: 'Invalid responseId format' }, { status: 400 });
    }

    // --- Find Airtable Record ID --- 
    console.log(`Attempting to find AssessmentResponse with responseId: ${numericResponseId}`);
    const responseRecords = await base(TBL_RESPONSES)
      .select({
        filterByFormula: `({responseId} = ${numericResponseId})`,
        fields: [],
        maxRecords: 1
      })
      .firstPage();

    if (!responseRecords || responseRecords.length === 0) {
      console.error(`Assessment response not found for responseId: ${numericResponseId}`);
      return NextResponse.json({ success: false, error: 'Assessment response not found' }, { status: 404 });
    }
    const airtableRecordId = responseRecords[0].id;
    console.log(`Found Airtable record ID: ${airtableRecordId}`);

    // --- Prepare Fields for Update (Now using direct variable names) --- 
    const fieldsToUpdate: Record<string, any> = {};
    
    if (contactFirstName) {
      fieldsToUpdate.contactFirstName = contactFirstName;
    }
    if (contactLastName) {
        fieldsToUpdate.contactLastName = contactLastName;
    }
    if (contactCompanyName) {
      fieldsToUpdate.contactCompanyName = contactCompanyName;
    }
    if (contactEmail) {
      fieldsToUpdate.contactEmail = contactEmail;
    }
    if (contactCompanyRegistrationNumber) {
        // Convert string from form to number for Airtable
        const regNum = parseInt(contactCompanyRegistrationNumber, 10);
        if (!isNaN(regNum)) {
             fieldsToUpdate.contactCompanyRegistrationNumber = regNum;
        } else {
             console.warn(`Invalid contactCompanyRegistrationNumber received: ${contactCompanyRegistrationNumber}. Skipping update.`);
        }
    }
    if (contactPhoneNumber) {
        fieldsToUpdate.contactPhoneNumber = contactPhoneNumber;
    }
    if (contactCountry) {
        fieldsToUpdate.contactCountry = contactCountry;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid contact fields provided for update' }, { status: 400 });
    }

    // --- Update Airtable Record --- 
    console.log(`Updating record ${airtableRecordId} with fields:`, fieldsToUpdate);
    const updatedRecord = await base(TBL_RESPONSES).update(airtableRecordId, fieldsToUpdate);

    return NextResponse.json({ success: true, recordId: updatedRecord.id });

  } catch (error: any) {
    console.error('Error updating contact info:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update contact info' }, { status: 500 });
  }
} 