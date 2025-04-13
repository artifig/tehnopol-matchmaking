"use client";
// This page is now a client component

import PageIllustration from '@/components/page-illustration'
import Link from "next/link";
import { useRef, useState, useEffect, Suspense } from 'react';
import { AssessmentReport, downloadReport } from '../../components/utils/generate-report';
import { useRouter, useSearchParams } from "next/navigation";

// Define types for metrics and providers (should match types in results page and generate-report)
interface Metric {
  category: string;
  score: number;
  description: string;
}

interface Provider {
  name: string;
  logo: string;
  shortDescription: string;
  details: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
}

// Define the main content component that uses useSearchParams
function ContactContent() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action'); // Get action from URL

  // State for report data, loading, errors, and responseId
  const [metrics, setMetrics] = useState<Metric[] | null>(null);
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null); // Added state for responseId
  const [isSubmitting, setIsSubmitting] = useState(false); // Added state for submission status

  // Effect to load data from localStorage
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      const storedMetricsString = localStorage.getItem('reportMetrics');
      const storedProvidersString = localStorage.getItem('reportProviders');
      const storedResponseId = localStorage.getItem('reportResponseId'); // Get responseId

      if (!storedMetricsString || !storedProvidersString || !storedResponseId) { // Check for responseId
        throw new Error("Assessment data not found. Please return to the results page and try again.");
      }
      
      setResponseId(storedResponseId); // Set responseId state

      const parsedMetricsData = JSON.parse(storedMetricsString);
      const parsedProviders = JSON.parse(storedProvidersString);

      // Convert metrics object { category: { score, description } } 
      // back to array format { category, score, description } expected by report generator
      const metricsArray: Metric[] = Object.entries(parsedMetricsData).map(([category, result]) => ({
          category,
          score: (result as { score: number }).score, // Extract score
          description: (result as { description: string }).description // Extract description
      }));

      setMetrics(metricsArray);
      setProviders(parsedProviders);

      // Calculate overallScore from the array format
      const score = metricsArray.length > 0 
        ? Math.round(
            metricsArray.reduce((sum, metric) => sum + metric.score, 0) / metricsArray.length
          )
        : 0;
      setOverallScore(score);

    } catch (err: any) {
      console.error("Error loading report data from localStorage:", err);
      setError(err.message || "Failed to load report data.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  // --- Helper function to call the new update API ---
  // Expects contactData object with keys matching Airtable fields
  const updateContactInfo = async (contactData: Record<string, any>) => { 
    if (!responseId) {
        console.error("Response ID not found, cannot update contact info.");
        return false; // Indicate failure
    }
    try {
        // Payload now directly includes responseId and the contactData (keys already match Airtable fields)
        const payload = { 
            responseId, 
            ...contactData // Spread the contactData with Airtable field names
        };
        // Optional: Filter out any undefined values if necessary before sending
        // const filteredPayload = Object.entries(payload).reduce((acc, [key, value]) => {
        //     if (value !== undefined) acc[key] = value;
        //     return acc;
        // }, {} as Record<string, any>);

        const apiResponse = await fetch('/api/assessment/updateContactInfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload), // Send the payload
        });
        const result = await apiResponse.json();
        if (!result.success) {
            console.error("API Error updating contact info:", result.error);
            alert(`Failed to save contact information: ${result.error}`);
            return false; // Indicate failure
        }
        console.log("Contact info successfully saved.");
        return true; // Indicate success
    } catch (err) {
        console.error("Network/fetch error updating contact info:", err);
        alert("An error occurred while saving your contact information. Please try again.");
        return false; // Indicate failure
    }
};

  // Function to handle download click
  const handleDownloadClick = async () => {
    if (!formRef.current || !metrics || !providers || isSubmitting) return;
    if (!formRef.current.reportValidity()) return; // trigger HTML validation

    setIsSubmitting(true); // Disable button

    const formData = new FormData(formRef.current);
    // Gather form data using Airtable field names (matching NEW form field names)
    const contactData: Record<string, any> = {
      contactFirstName: formData.get('contactFirstName') as string,
      contactLastName: formData.get('contactLastName') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhoneNumber: formData.get('contactPhoneNumber') as string,
      contactCompanyName: formData.get('contactCompanyName') as string,
      contactCompanyRegistrationNumber: formData.get('contactCompanyRegistrationNumber') as string || undefined,
      contactCountry: formData.get('contactCountry') as string,
    };
    // Remove undefined registration number if empty
    if (contactData.contactCompanyRegistrationNumber === undefined) {
        delete contactData.contactCompanyRegistrationNumber;
    }
    console.log('Download button clicked with (Airtable keys):', contactData);
    
    // --> 1. Save contact info (updateContactInfo expects object with Airtable keys)
    const saveSuccess = await updateContactInfo(contactData);

    // --> 2. Proceed with download only if save was successful
    if (saveSuccess) {
        // Pass userInfo for the PDF report itself, mapping back to simpler names if needed by generator
        const reportUserInfo = { 
            firstName: contactData.contactFirstName, 
            lastName: contactData.contactLastName, 
            company: contactData.contactCompanyName, 
            email: contactData.contactEmail 
        };
        await handleDownload(reportUserInfo, metrics, overallScore, providers);
    } else {
        console.log("Contact info save failed, download aborted.");
    }
    setIsSubmitting(false); // Re-enable button
  };

  // Function to handle email click
  const handleEmailClick = async () => {
    if (!formRef.current || !metrics || !providers || isSubmitting) return;
    if (!formRef.current.reportValidity()) return; // trigger HTML validation

    setIsSubmitting(true); // Disable button

    const formData = new FormData(formRef.current);
    // Gather form data using Airtable field names (matching NEW form field names)
    const contactData: Record<string, any> = { 
      contactFirstName: formData.get('contactFirstName') as string,
      contactLastName: formData.get('contactLastName') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhoneNumber: formData.get('contactPhoneNumber') as string,
      contactCompanyName: formData.get('contactCompanyName') as string,
      contactCompanyRegistrationNumber: formData.get('contactCompanyRegistrationNumber') as string || undefined,
      contactCountry: formData.get('contactCountry') as string,
    };
     // Remove undefined registration number if empty
    if (contactData.contactCompanyRegistrationNumber === undefined) {
        delete contactData.contactCompanyRegistrationNumber;
    }
    const email = contactData.contactEmail;
    console.log('Email button clicked with (Airtable keys):', contactData);

    // --> 1. Save contact info (updateContactInfo expects object with Airtable keys)
    const saveSuccess = await updateContactInfo(contactData);

    // --> 2. Proceed with email only if save was successful
    if (saveSuccess) {
        handleEmail(email, metrics, overallScore, providers);
    } else {
        console.log("Contact info save failed, email aborted.");
    }
    setIsSubmitting(false); // Re-enable button
  };

  // Internal function to initiate download (now receives data as args)
  const handleDownload = async (userInfo: any, metricsData: Metric[] | null, score: number, providersData: Provider[] | null) => {
    if (!metricsData || !providersData) {
        alert('Report data is missing. Cannot generate report.');
        return;
    }
    console.log('Initiating download with userInfo:', userInfo);
    try {
      await downloadReport({ metrics: metricsData, overallScore: score, providers: providersData, userInfo });
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to generate report');
    }
  };

  // Internal function to handle email logic (now receives data as args)
  const handleEmail = (email: string, metricsData: Metric[] | null, score: number, providersData: Provider[] | null) => {
    if (!metricsData || !providersData) {
        alert('Report data is missing. Cannot send email.');
        return;
    }
    console.log('Sending report data to:', email, { metricsData, score, providersData });
    alert('Report sent to your email (simulation)');
  };

  // Render loading state
  if (isLoading) {
    return (
      <>
        <div className="relative max-w-6xl mx-auto h-0 pointer-events-none -z-1" aria-hidden="true">
          <PageIllustration />
        </div>
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="h1 font-red-hat-display mb-4">Loading...</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">Loading report data...</p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Render error state
  if (error) {
    return (
       <>
        <div className="relative max-w-6xl mx-auto h-0 pointer-events-none -z-1" aria-hidden="true">
          <PageIllustration />
        </div>
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="h1 font-red-hat-display mb-4 text-red-500">Error</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">{error}</p>
                <Link href="/assessment/results" className="btn text-white bg-orange-500 hover:bg-orange-400 mt-6">
                   Return to Results
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Main component render when data is loaded
  return (
    <>
      {/*  Page illustration */}
      <div className="relative max-w-6xl mx-auto h-0 pointer-events-none -z-1" aria-hidden="true">
        <PageIllustration />
      </div>

      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">

            {/* Page header */}
            <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
              <h1 className="h1 font-red-hat-display mb-4">
                Complete your details to receive your report
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Please provide your contact information.
              </p>
            </div>

            {/* Contact form - REORDERED and field names updated */}
            <form className="max-w-xl mx-auto" ref={formRef}>
              {/* First Name / Last Name Row */}
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="contactFirstName">First Name <span className="text-red-600">*</span></label>
                  <input id="contactFirstName" name="contactFirstName" type="text" className="form-input w-full" placeholder="Enter your first name" required />
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="contactLastName">Last Name <span className="text-red-600">*</span></label>
                  <input id="contactLastName" name="contactLastName" type="text" className="form-input w-full" placeholder="Enter your last name" required />
                </div>
              </div>
              {/* Email Row */}
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full px-3">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="contactEmail">Email <span className="text-red-600">*</span></label>
                  <input id="contactEmail" name="contactEmail" type="email" className="form-input w-full" placeholder="Enter your email address" required />
                </div>
              </div>
              {/* Phone Number Row */}
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full px-3">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="contactPhoneNumber">Phone Number <span className="text-red-600">*</span></label>
                  <input id="contactPhoneNumber" name="contactPhoneNumber" type="tel" className="form-input w-full" placeholder="Enter your phone number" required />
                </div>
              </div>
              {/* Company Name Row */}
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full px-3">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="contactCompanyName">Company <span className="text-red-600">*</span></label>
                  <input id="contactCompanyName" name="contactCompanyName" type="text" className="form-input w-full" placeholder="Enter your company name" required />
                </div>
              </div>
              {/* Company Registration Number Row */}
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full px-3">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="contactCompanyRegistrationNumber">Company Registration Number (Optional)</label>
                  <input id="contactCompanyRegistrationNumber" name="contactCompanyRegistrationNumber" type="text" className="form-input w-full" placeholder="Enter company registration number" />
                </div>
              </div>
              {/* Country Row */}
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full px-3">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="contactCountry">Country <span className="text-red-600">*</span></label>
                  <select id="contactCountry" name="contactCountry" className="form-select w-full" required>
                    <option>Estonia</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 mt-6">
                <div className="w-full px-3">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {/* Conditionally render Download button based on action or always show both */} 
                    {(action === 'download' || !action) && (
                      <button
                        type="button"
                        onClick={handleDownloadClick}
                        className={`btn text-white bg-orange-500 hover:bg-orange-400 w-full sm:w-auto flex items-center justify-center px-6 py-3 ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isSubmitting}
                      >
                        <span>{isSubmitting ? 'Processing...' : 'Download Report'}</span>
                        <svg className="w-3 h-3 shrink-0 mt-px ml-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                          <path className="fill-current" d="M6 8.825L11.4 3.425L10.675 2.7L6.75 6.625V0H5.25V6.625L1.325 2.7L0.6 3.425L6 8.825ZM0.75 12H11.25V10.5H0.75V12Z" />
                        </svg>
                      </button>
                    )}
                    {/* Conditionally render Email button based on action or always show both */}
                    {(action === 'email' || !action) && (
                      <button
                        type="button"
                        onClick={handleEmailClick}
                        className={`btn text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-full sm:w-auto flex items-center justify-center px-6 py-3 ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isSubmitting}
                      >
                        <span>{isSubmitting ? 'Processing...' : 'Email Report'}</span>
                        <svg className="w-3 h-3 shrink-0 mt-px ml-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                          <path className="fill-current" d="M10.5 0H1.5C0.675 0 0 0.675 0 1.5V10.5C0 11.325 0.675 12 1.5 12H10.5C11.325 12 12 11.325 12 10.5V1.5C12 0.675 11.325 0 10.5 0ZM10.5 3L6 6.75L1.5 3V1.5L6 5.25L10.5 1.5V3Z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>

          </div>
        </div>
      </section>
    </>
  )
}

// Default export wraps the main content in Suspense
export default function ContactPage() {
  // Simple fallback UI
  const fallbackUI = (
     <>
        <div className="relative max-w-6xl mx-auto h-0 pointer-events-none -z-1" aria-hidden="true">
          <PageIllustration />
        </div>
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="h1 font-red-hat-display mb-4">Loading Contact Form...</h1>
              </div>
            </div>
          </div>
        </section>
      </>
  );

  return (
    <Suspense fallback={fallbackUI}>
      <ContactContent />
    </Suspense>
  );
}
