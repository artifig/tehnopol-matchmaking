"use client";
// This page is now a client component

import PageIllustration from '@/components/page-illustration'
import Link from "next/link";
import { useRef, useState, useEffect } from 'react';
import { AssessmentReport, downloadReport } from '../../components/utils/generate-report';
import { useRouter, useSearchParams } from "next/navigation";

// Define types for metrics and providers (should match types in results page and generate-report)
interface Metric {
  category: string;
  value: number;
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

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action'); // Get action from URL

  // State for report data, loading, and errors
  const [metrics, setMetrics] = useState<Metric[] | null>(null);
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to load data from localStorage
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      const storedMetricsString = localStorage.getItem('reportMetrics');
      const storedProvidersString = localStorage.getItem('reportProviders');

      if (!storedMetricsString || !storedProvidersString) {
        throw new Error("Assessment data not found. Please return to the results page and try again.");
      }

      const parsedMetrics = JSON.parse(storedMetricsString);
      const parsedProviders = JSON.parse(storedProvidersString);

      // Convert metrics object back to array format expected by report generator
      const metricsArray = Object.entries(parsedMetrics).map(([category, value]) => ({ category, value: value as number }));

      setMetrics(metricsArray);
      setProviders(parsedProviders);

      // Calculate overallScore
      const score = Math.round(
        metricsArray.reduce((sum, metric) => sum + metric.value, 0) / metricsArray.length
      );
      setOverallScore(score);

    } catch (err: any) {
      console.error("Error loading report data from localStorage:", err);
      setError(err.message || "Failed to load report data.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle download click
  const handleDownloadClick = async () => {
    if (!formRef.current || !metrics || !providers) return;
    if (!formRef.current.reportValidity()) return; // trigger HTML validation

    const formData = new FormData(formRef.current);
    const userInfo = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
    };
    console.log('Download button clicked with:', userInfo);
    // Call the internal handleDownload with fetched data
    await handleDownload(userInfo, metrics, overallScore, providers);
  };

  // Function to handle email click
  const handleEmailClick = () => {
    if (!formRef.current || !metrics || !providers) return;
    if (!formRef.current.reportValidity()) return; // trigger HTML validation

    const formData = new FormData(formRef.current);
    const email = formData.get('email') as string;
    console.log('Email button clicked with email:', email);
    // Call the internal handleEmail with fetched data
    handleEmail(email, metrics, overallScore, providers);
  };

  // Internal function to initiate download (now receives data as args)
  const handleDownload = async (userInfo: any, metricsData: Metric[], score: number, providersData: Provider[]) => {
    console.log('Initiating download with userInfo:', userInfo);
    try {
      // Use the passed data, not the old mock data
      await downloadReport({ metrics: metricsData, overallScore: score, providers: providersData, userInfo });
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to generate report');
    }
  };

  // Internal function to handle email logic (now receives data as args)
  const handleEmail = (email: string, metricsData: Metric[], score: number, providersData: Provider[]) => {
    // Here you would typically send the report via email
    // This would likely involve calling an API endpoint
    console.log('Sending report data to:', email, { metricsData, score, providersData });
    // Placeholder alert
    alert('Report sent to your email (simulation)');
    // Consider clearing localStorage or redirecting after sending
    // localStorage.removeItem('reportMetrics');
    // localStorage.removeItem('reportProviders');
    // router.push('/thank-you'); // Example redirect
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

            {/* Contact form */}
            <form className="max-w-xl mx-auto" ref={formRef}>
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="first-name">First Name <span className="text-red-600">*</span></label>
                  <input id="first-name" name="firstName" type="text" className="form-input w-full" placeholder="Enter your first name" required />
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="last-name">Last Name <span className="text-red-600">*</span></label>
                  <input id="last-name" name="lastName" type="text" className="form-input w-full" placeholder="Enter your last name" required />
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full px-3">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="email">Email <span className="text-red-600">*</span></label>
                  <input id="email" name="email" type="email" className="form-input w-full" placeholder="Enter your email address" required />
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full px-3">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="company">Company <span className="text-red-600">*</span></label>
                  <input id="company" name="company" type="text" className="form-input w-full" placeholder="Enter your company name" required />
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full px-3">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="phone">Phone Number <span className="text-red-600">*</span></label>
                  <input id="phone" name="phone" type="tel" className="form-input w-full" placeholder="Enter your phone number" required />
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full px-3">
                  <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="country">Country <span className="text-red-600">*</span></label>
                  <select id="country" name="country" className="form-select w-full" required>
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
                        className="btn text-white bg-orange-500 hover:bg-orange-400 w-full sm:w-auto flex items-center justify-center px-6 py-3"
                      >
                        <span>Download Report</span>
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
                        className="btn text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-full sm:w-auto flex items-center justify-center px-6 py-3"
                      >
                        <span>Email Report</span>
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
