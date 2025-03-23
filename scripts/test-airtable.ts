// @ts-ignore: Importing .ts file is allowed in this test file
import { fetchRecords } from "../lib/airtable.ts";

// Diagnostic logs to ensure environment variables are loaded (avoid printing actual secrets)
console.log("Airtable Personal Access Token:", process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN ? "Loaded" : "Missing");
console.log("Airtable Base ID:", process.env.AIRTABLE_BASE_ID ? "Loaded" : "Missing");

(async () => {
  const testTableName = "MethodCompanyTypes"; // Replace with your actual table name
  try {
    const records = await fetchRecords(testTableName);
    console.log(`Fetched records from '${testTableName}':`, records);
  } catch (error) {
    console.error(`Error fetching records from '${testTableName}':`, error);
  }
})(); 