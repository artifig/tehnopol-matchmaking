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
    // Fetch the MethodCategories records using the filter formula
    const categoryRecords = await baseAirtable('MethodCategories')
      .select({ 
        filterByFormula: filterFormula,
        sort: [{ field: 'categoryId', direction: 'asc' }]
      })
      .firstPage();
    // Map the results to include the id, categoryText_en, and categoryDescription_en
    const categories = categoryRecords.map(record => ({
      id: record.id,
      categoryText_en: record.fields.categoryText_en,
      categoryDescription_en: record.fields.categoryDescription_en
    }));
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Error fetching assessment categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}