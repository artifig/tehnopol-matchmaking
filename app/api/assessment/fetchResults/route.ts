import { NextRequest, NextResponse } from 'next/server';

// Placeholder for Airtable client or other data fetching logic
// import { airtable } from '@/lib/airtable'; // Assuming an airtable client exists

// Placeholder types (adjust as needed based on actual data structure)
interface AssessmentResponse {
  id: string;
  fields: {
    responseId?: string;
    responses?: string; // Assuming responses are stored as a JSON string
    // Add other relevant fields
  };
}

interface Provider {
  id: string;
  fields: {
    name: string;
    logo: string; // Assuming logo is a URL or path
    shortDescription: string;
    details: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    contactRole: string;
    // Add other relevant fields
  };
}

interface Metrics {
  [key: string]: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const responseId = searchParams.get('responseId');

  if (!responseId) {
    return NextResponse.json({ success: false, error: 'Missing responseId parameter' }, { status: 400 });
  }

  try {
    // --- Placeholder Logic ---
    // 1. Fetch assessment record using responseId
    // Example: const assessmentRecord = await airtable.getRecord('Assessments', responseId); // Replace with actual fetch
    console.log(`Fetching results for responseId: ${responseId}`);
    // Mock assessment data for now
    const mockAssessment: AssessmentResponse = {
        id: responseId,
        fields: {
            responseId: responseId,
            // Mock responses - replace with actual fetched data
            responses: JSON.stringify({
                'question1': 'Often',
                'question2': 'Always',
                'question3': 'Occasionally',
                // ... more responses
            })
        }
    };

    // 2. Fetch relevant providers (replace with actual logic, potentially based on assessment)
    // Example: const allProviders = await airtable.getRecords('Providers'); // Replace with actual fetch
    // Mock provider data for now
    const mockProviders: Provider[] = [
      {
        id: 'prov1',
        fields: {
            name: "Science and Business Park Tehnopol",
            logo: "/logo/logo-Tehnopol.png",
            shortDescription: "Expert in Business Strategy and Operations",
            details: "We are a team of experts in business strategy and operations with vast experience in supporting startups and scaleups.",
            contactName: "Rauno Varblas",
            contactRole: "Head of AI and Innovation",
            contactEmail: "rauno.varblas@tehnopol.ee",
            contactPhone: "+372 5123 4567"
        }
      },
       {
        id: 'prov2',
        fields: {
            name: "AI & Robotics Estonia",
            logo: "/logo/logo-AIRE.png",
            shortDescription: "Consortia of Estonian AI and Robotics academics",
            details: "We are flexible team of academics and support staff, ready to help you with your AI and robotics projects.",
            contactName: "Evelin Ebruk",
            contactRole: "Head of Client Relations",
            contactEmail: "evelin.ebruk@aire-edih.eu",
            contactPhone: "+372 5987 6543"
        }
      },
      {
        id: 'prov3',
        fields: {
            name: "Artifig",
            logo: "/logo/logo-Artifig.png",
            shortDescription: "Technical AI Solutions and Strategy",
            details: "We are a small team of experts in AI with an academic background, and plenty of business experience. We are dedicated to providing the best possible solutions for our clients.",
            contactName: "Otto Mättas",
            contactRole: "AI Solutions Architect",
            contactEmail: "otto@artifig.com",
            contactPhone: "+372 5662 8362"
        }
      }
    ];


    // 3. Calculate metrics based on responses (replace with actual calculation logic)
    // Example: const calculatedMetrics = calculateMetrics(assessmentRecord.fields.responses);
    // Mock metrics for now
    const mockMetrics: Metrics = {
      "Business Strategy": Math.floor(Math.random() * 51) + 50, // Random score 50-100
      "Operations": Math.floor(Math.random() * 51) + 50,
      "Growth & Marketing": Math.floor(Math.random() * 51) + 50,
      "Digital Maturity": Math.floor(Math.random() * 51) + 50,
      "Innovation Readiness": Math.floor(Math.random() * 51) + 50,
      "AI & Data Capabilities": Math.floor(Math.random() * 51) + 50,
      "Team & Skills": Math.floor(Math.random() * 51) + 50
    };

    // --- End Placeholder Logic ---

    // Reformat providers to match the frontend structure if necessary
    const formattedProviders = mockProviders.map(p => ({
        name: p.fields.name,
        logo: p.fields.logo,
        shortDescription: p.fields.shortDescription,
        details: p.fields.details,
        contactName: p.fields.contactName,
        contactEmail: p.fields.contactEmail,
        contactPhone: p.fields.contactPhone,
        contactRole: p.fields.contactRole,
    }));


    return NextResponse.json({
      success: true,
      metrics: mockMetrics,
      providers: formattedProviders,
    });

  } catch (error: any) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch results' }, { status: 500 });
  }
} 