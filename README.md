# Tehnopol Matchmaking

Tehnopol Matchmaking is a dynamic website offering a variety of pages and interactive experiences. The core feature of the website is our self-assessment tool located in the `/app/assessment` directory.

## Project Overview

- **Multiple Pages:** The project features a wide range of pages including static pages like About, Contact, and Blog, as well as dynamic content sections created with reusable components.
- **Self-Assessments:** The main purpose of the app is to provide users with self-assessments. This functionality is housed in the `/app/assessment` directory. The flow involves users stating their goals, selecting a company type, answering categorized questions, and receiving results with matched solution providers.
- **Airtable Integration:** Business logic and self-assessment data (questions, categories, answers, responses, providers) are managed through Airtable. The backend API routes (`/app/api/assessment/*`) interact with Airtable via helper functions (likely in `/lib/airtable.ts`).
- **PDF Report Generation:** Users can download a PDF report of their assessment results after providing contact information on the `/contact` page. Report generation happens client-side using `@react-pdf/renderer`.

## Directory Structure

- `/app`: Contains the main Next.js pages and route handlers.
  - `/app/assessment`: Contains the pages for the multi-step assessment flow (`/`, `/questions`, `/results`).
  - `/app/api/assessment`: Contains backend API routes for interacting with Airtable (fetching questions/categories, creating/saving responses, fetching results).
  - `/app/contact`: Contact page used for report download/email gating.
- `/components`: Reusable React components for UI elements, including specific assessment components and the PDF report generator (`/components/utils/generate-report.tsx`).
- `/lib`: Utilities and shared logic, potentially including the Airtable client setup (`/lib/airtable.ts`).
- `/public`: Static assets like images and logos.
- `/content`: Content files (e.g., blog posts).

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

## Assessment Workflow

1.  **Goal Input:** (Implicit or external) User defines business goals.
2.  **Start Page (`/assessment`):** User inputs `businessGoals` and selects `companyType`. An initial `AssessmentResponses` record is created in Airtable via `/api/assessment/createResponse`. This sets `responseStatus` to "New" and returns a `responseId`.
3.  **Questions Page (`/assessment/questions`):** 
    - Fetches relevant `MethodCategories`, associated `MethodQuestions`, and linked `MethodAnswers` (with IDs) via `/api/assessment/fetchCategories` based on `companyType` (from `localStorage`).
    - User answers questions, selecting an answer option.
    - Upon completion, all answers are collected as a map of `{ questionRecordId: answerRecordId }`.
    - This map is sent along with `responseId` (from `localStorage`) to `/api/assessment/saveResponses`.
    - The API saves the ID map as a JSON string in the `responseContent` field and updates the `responseStatus` to "Completed" in the corresponding `AssessmentResponses` record.
4.  **Results Page (`/assessment/results`):**
    - Fetches calculated `metrics` and matched `providers` from `/api/assessment/fetchResults` using `responseId` (from `localStorage`). This API route now:
        - Reads the `responseContent` (the ID map).
        - Fetches `MethodAnswers` to get the score for each `answerRecordId`.
        - Fetches `MethodQuestions` and `MethodCategories` to link questions to categories.
        - Calculates average scores per category.
        - Fetches `SolutionProviders` filtered by `MethodCompanyTypes`.
        - Formats the results.
    - Displays results, including a radar chart and provider cards.
    - Stores `metrics`, `providers`, and `responseId` in `localStorage` before redirecting for report actions.
5.  **Contact Page (`/contact?action=download` or `?action=email`):**
    - Retrieves `metrics`, `providers`, and `responseId` from `localStorage`.
    - User enters contact details (using form fields named after Airtable fields like `contactFirstName`, `contactPhoneNumber`, etc.).
    - Clicking Download/Email first calls `/api/assessment/updateContactInfo` to save the contact details (First Name, Last Name, Email, Phone, Company, Reg Number, Country) to the Airtable record using the `responseId`.
    - **Download:** If update is successful and `action=download`, it triggers client-side PDF generation (`@react-pdf/renderer`) using the retrieved assessment data and user info, then initiates a download.
    - **Email:** If update is successful and `action=email`, it currently shows a simulation alert. (Requires implementation of an email sending mechanism).

## Airtable Data Saving Strategy

Two primary approaches exist for saving user assessment responses to Airtable:

### 1. Current Approach: JSON in `responseContent` (Implemented - ID Mapping)

- **Description:** All question answers for a single assessment are stored as a single JSON string within the `responseContent` field of the main `AssessmentResponses` record. The JSON represents a map of `{ questionRecordId: answerRecordId }`.
- **API Endpoint:** `/api/assessment/saveResponses/route.ts`
- **Pros:** 
    - Simple saving logic (single record update).
    - Keeps all responses for one assessment together.
    - Uses record IDs for relationships, improving data integrity over storing text.
- **Cons:**
    - Still difficult to query/analyze individual answers directly in Airtable without parsing.
    - Requires parsing the JSON and additional lookups (Answer ID -> Score) in the `/api/assessment/fetchResults` API route for metric calculation.
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

**Current Recommendation:** The current **JSON in `responseContent` (ID Mapping)** approach is a good balance. It uses IDs for consistency while keeping the saving logic relatively simple. The processing complexity is contained within the `fetchResults` endpoint. Revisit the individual answer record approach only if direct Airtable reporting on individual answers becomes critical.

## Future Development & TODOs

- **Implement Email Report:** Create an API endpoint and integrate a service (e.g., SendGrid, Resend) to actually email the generated PDF report.
- **Refine Provider Matching Algorithm:** The `/api/assessment/fetchResults` currently only filters providers by `MethodCompanyTypes`. Enhance this logic to potentially rank or filter providers based on calculated category scores (`metrics`) or links to `MethodCategories` / `MethodMaturityLevels`.
- **Expand Questionnaire:** Add more questions and potentially refine categories.
- **Enhance UI/UX:** Improve the visual presentation and user experience based on testing and feedback.
- **Error Handling:** Add more robust error handling and user feedback, especially for API call failures (e.g., in `questions/page.tsx` when saving responses, or in `contact/page.tsx` when updating info).
- **Consider Individual Answer Saving:** Evaluate if the benefits of saving individual answers (as outlined in the placeholder) outweigh the complexity for future analytics needs.

## License

[Specify your project license here]

---

*Note: This project is under active development, and some functionalities are still work in progress.*
