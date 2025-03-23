# Scripts Folder

This folder contains utility and test scripts used to verify integrations and functionality in this project.

## Test Airtable Script

The `test-airtable.ts` script is designed to quickly test the Airtable connector by fetching records from a specified Airtable table.

### Prerequisites

- Node.js installed.
- `ts-node` must be available (e.g. run it via `npx ts-node`).
- Valid Airtable credentials: a Personal Access Token and a Base ID.

### Environment Variables

The script requires the following environment variables:

- **AIRTABLE_PERSONAL_ACCESS_TOKEN**: Your Airtable Personal Access Token.
- **AIRTABLE_BASE_ID**: Your Airtable Base ID.

These can be set in a `.env.local` file at the project root or provided directly via the shell.

#### Using a `.env.local` File

Ensure your `.env.local` contains:

```
AIRTABLE_PERSONAL_ACCESS_TOKEN=your_personal_access_token
AIRTABLE_BASE_ID=your_base_id
```

To load these variables for the test script without installing additional packages, you can export them using your shell. For example, in a Unix-like shell:

```bash
set -a && source .env.local && set +a && npx ts-node --esm --experimental-specifier-resolution=node scripts/test-airtable.ts
```

#### Providing Variables on the Command Line

Alternatively, run the test script by passing the environment variables directly:

```bash
AIRTABLE_PERSONAL_ACCESS_TOKEN=your_personal_access_token AIRTABLE_BASE_ID=your_base_id npx ts-node --esm --experimental-specifier-resolution=node scripts/test-airtable.ts
```

### Running the Test Script

The script performs the following actions:

1. Outputs diagnostic logs indicating whether the Airtable Personal Access Token and Base ID are loaded.
2. Attempts to fetch records from a specified Airtable table (default: `MethodCompanyTypes`).
3. Prints the fetched records to the console if successful, or displays an error message if something goes wrong.

### Code Note

At the top of `test-airtable.ts`, there is a comment:

```typescript
// @ts-ignore: Importing .ts file is allowed in this test file
```

This directive suppresses a linter error regarding the import of a `.ts` file. Although the linter may warn about importing a file with a `.ts` extension, this warning is safe to ignore when running the script with the appropriate ts-node flags.

### Troubleshooting

- **Missing Environment Variables:** Verify that your environment variables are set correctly. Check the diagnostic log output to ensure that the Personal Access Token and Base ID are loaded.
- **Module Import Issues:** If you encounter issues with module resolution, be sure to use the flags `--esm` and `--experimental-specifier-resolution=node` when running ts-node.
- **Linter Warnings:** The ts-ignore directive at the top of the file is used to bypass linter warnings about the `.ts` file import. This does not affect the execution of the script.
- **General Errors:** Ensure that your Airtable credentials are correct and that the specified table exists in your Airtable base.

---

This script is intended solely for testing purposes and should not be included in production builds. 