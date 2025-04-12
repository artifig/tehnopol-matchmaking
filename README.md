# Tehnopol Matchmaking

Tehnopol Matchmaking is a dynamic website offering a variety of pages and interactive experiences. The core feature of the website is our self-assessment tool located in the `/app/assessment` directory.

## Project Overview

- **Multiple Pages:** The project features a wide range of pages including static pages like About, Contact, and Blog, as well as dynamic content sections created with reusable components.
- **Self-Assessments:** The main purpose of the app is to provide users with self-assessments. This functionality is housed in the `/app/assessment` directory.
- **Airtable Integration:** Business logic and self-assessment data are managed through Airtable. Our backend logic is designed to pull content directly from Airtable using our API integration in `/lib/airtable.ts`. (Note: Some parts of this integration remain undefined as we incrementally implement this feature.)

## Directory Structure

- `/app`: Contains the main pages and the self-assessment tool (`/app/assessment`).
- `/components`: Reusable components that drive the UI.
- `/lib`: Utilities and API integrations (including Airtable connection logic).
- `/scripts`: Supplementary scripts for automation and testing.

## Getting Started

1. Clone the repository.

2. Install dependencies:
   - Run:
     ```bash
     npm install
     # or
     yarn install
     ```

3. Set up your environment variables:
   - Create a `.env.local` file in the root directory.
     ```bash
     AIRTABLE_PERSONAL_ACCESS_TOKEN=your_personal_access_token
     AIRTABLE_BASE_ID=your_base_id
     ```
   - Add the required environment variables, including the personal access token and the base ID.
   - Note: The app is currently running in production on Vercel where the environment variables are defined directly. The `.env.local` file is only for local development and testing purposes.

4. Run the project locally for development:
   - Run:
     ```bash
     npm run dev
     # or
     yarn dev
     ```

5. To make sure the code compiles:
   - Run:
     ```bash
     npm run build
     # or
     yarn build
     ```

## Airtable Data Saving Strategy

Two primary approaches exist for saving user assessment responses to Airtable:

### 1. Current Approach: JSON in `responseContent` (Implemented)

- **Description:** All question answers for a single assessment are stored as a single JSON string within the `responseContent` field of the main `AssessmentResponses` record.
- **API Endpoint:** `/api/assessment/saveResponses/route.ts`
- **Pros:** 
    - Simple saving logic (single record update).
    - Keeps all responses for one assessment together.
- **Cons:**
    - Difficult to query/analyze individual answers directly in Airtable.
    - Requires parsing and processing the JSON string within the `/api/assessment/fetchResults` API route for metric calculation.
- **Status:** This is the currently active implementation.

### 2. Alternative Approach: Individual Answer Records (Placeholder)

- **Description:** Each answer is saved as a separate record in a dedicated `AssessmentAnswers` table (hypothetical, needs creation). Each record links back to the main `AssessmentResponses` record, the `MethodQuestions` record, and the `MethodAnswers` record.
- **API Endpoint:** `/api/assessment/saveIndividualResponses/route.ts` (Placeholder - Not currently used)
- **Pros:**
    - More normalized data structure, aligning with relational database principles.
    - Enables easier querying, reporting, and analysis of individual answers directly within Airtable.
    - Potentially allows for simpler metric calculations using Airtable rollups/formulas (though complex logic might still require the API).
- **Cons:**
    - More complex saving logic (multiple record creations per assessment).
    - Requires creating and managing an additional `AssessmentAnswers` table.
    - Potentially higher Airtable API usage and potentially slower saving process due to multiple writes (especially needing batching for >10 answers).
- **Status:** A placeholder API route exists to demonstrate the concept, but it is not integrated into the application flow.

**Current Recommendation:** Stick with the **JSON in `responseContent`** approach for now, as it aligns with the existing implementation and concentrates the processing logic in the `fetchResults` endpoint. Revisit the individual answer record approach if direct Airtable analytics on individual answers becomes a critical requirement.

## Future Development

- Complete the implementation of the Airtable integration for self-assessments.
- Expand the questionnaire logic and scoring.
- Enhance UI/UX across all pages based on user feedback.

## License

[Specify your project license here]

---

*Note: This project is under active development, and some functionalities are still work in progress.*
