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
2.  **Start Page (`/assessment`):** User inputs `businessGoals` and selects `companyType`. An initial `AssessmentResponses` record is created in Airtable via `/api/assessment/createResponse`, returning a `responseId`.
3.  **Questions Page (`/assessment/questions`):** 
    - Fetches relevant `MethodCategories` and associated `MethodQuestions` via `/api/assessment/fetchCategories` based on `companyType` (from `localStorage`).
    - User answers questions.
    - Upon completion, all answers (mapping `questionId` -> `answerText`) are sent along with `responseId` (from `localStorage`) to `/api/assessment/saveResponses`.
    - The API saves the answers as a JSON string in the `responseContent` field of the corresponding `AssessmentResponses` record.
4.  **Results Page (`/assessment/results`):**
    - Fetches calculated `metrics` and matched `providers` from `/api/assessment/fetchResults` using `responseId` (from `localStorage`). **(Note: This API currently returns mock data; calculation logic needs implementation).**
    - Displays results, including a radar chart and provider cards.
    - Stores `metrics` and `providers` in `localStorage` before redirecting for report actions.
5.  **Contact Page (`/contact?action=download` or `?action=email`):**
    - Retrieves `metrics` and `providers` from `localStorage`.
    - User enters contact details.
    - **Download:** If `action=download`, clicking the button triggers client-side PDF generation (`@react-pdf/renderer`) using the retrieved data and user info, then initiates a download.
    - **Email:** If `action=email`, clicking the button currently shows a simulation alert. (Requires implementation of an email sending mechanism, likely via another API call).

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

## Future Development & TODOs

- **Implement `fetchResults` Logic:** Complete the core logic in `/api/assessment/fetchResults/route.ts` to:
    - Fetch and parse actual assessment data from Airtable.
    - Fetch scoring information from `MethodAnswers`.
    - Fetch question categories from `MethodQuestions`.
    - Calculate category scores based on responses.
    - Fetch provider data and implement matching logic (based on company type, categories, scores/maturity levels).
    - Handle extraction of attachment URLs (e.g., `providerLogo`).
- **Implement Email Report:** Create an API endpoint and integrate a service (e.g., SendGrid, Resend) to actually email the generated PDF report.
- **Refine Provider Matching Algorithm:** Improve the logic for matching solution providers based on assessment results.
- **Expand Questionnaire:** Add more questions and potentially refine categories.
- **Enhance UI/UX:** Improve the visual presentation and user experience based on testing and feedback.
- **Consider Individual Answer Saving:** Evaluate if the benefits of saving individual answers (as outlined in the placeholder) outweigh the complexity for future analytics needs.

## License

[Specify your project license here]

---

*Note: This project is under active development, and some functionalities are still work in progress.*
