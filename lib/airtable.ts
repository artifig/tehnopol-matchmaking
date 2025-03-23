import Airtable from 'airtable';

/* Added a local type alias for Airtable records to avoid namespace errors */
type AirtableRecord<T> = { id: string; fields: T; get: (fieldName: string) => any };

/* Initialize Airtable with API Key and Base ID from environment variables */
const base = new Airtable({ apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || '' }).base(process.env.AIRTABLE_BASE_ID || '');

/**
 * Fetch records from a given Airtable table. Optionally specify a view (default is 'Grid view').
 * @param {string} tableName - The name of the Airtable table
 * @param {string} [view] - The view name to select records from
 * @returns {Promise<any[]>} - Resolves to an array of record fields
 */
export const fetchRecords = async (tableName: string, view: string = 'Grid view'): Promise<any[]> => {
  const records = await base(tableName).select({ view }).firstPage();
  return records.map(record => record.fields);
};

/**
 * Create a new record in a specified Airtable table.
 * @param {string} tableName - The name of the Airtable table
 * @param {object} fields - The fields for the new record
 * @returns {Promise<any>} - Resolves to the created record's fields
 */
export const createRecord = async (tableName: string, fields: object): Promise<any> => {
  const record = await base(tableName).create(fields);
  return record.fields;
};

/**
 * Update an existing record in a specified Airtable table.
 * @param {string} tableName - The name of the Airtable table
 * @param {string} recordId - The ID of the record to update
 * @param {object} fields - The fields to update
 * @returns {Promise<any>} - Resolves to the updated record's fields
 */
export const updateRecord = async (tableName: string, recordId: string, fields: object): Promise<any> => {
  const record = await base(tableName).update(recordId, fields);
  return record.fields;
};

/**
 * Delete a record from a specified Airtable table.
 * @param {string} tableName - The name of the Airtable table
 * @param {string} recordId - The ID of the record to delete
 * @returns {Promise<any>} - Resolves to the deleted record's fields
 */
export const deleteRecord = async (tableName: string, recordId: string): Promise<any> => {
  const record = await base(tableName).destroy(recordId);
  return record.fields;
}; 