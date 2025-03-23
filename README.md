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

   - Add the required environment variables, including the Airtable API keys.
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

## Future Development

- Complete the implementation of the Airtable integration for self-assessments.
- Expand the questionnaire logic and scoring.
- Enhance UI/UX across all pages based on user feedback.

## License

[Specify your project license here]

---

*Note: This project is under active development, and some functionalities are still work in progress.*
