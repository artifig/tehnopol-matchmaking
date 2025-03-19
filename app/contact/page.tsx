"use client";
// This page is now a client component

import PageIllustration from '@/components/page-illustration'
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { AssessmentReport, downloadReport } from '../../components/utils/generate-report';
import { useRef } from 'react';

// Mock data - in real app, this would come from your backend/state management
const metrics = [
  { category: "Business Strategy", value: 76 },
  { category: "Operations", value: 54 },
  { category: "Growth & Marketing", value: 89 },
  { category: "Digital Maturity", value: 65 },
  { category: "Innovation Readiness", value: 72 },
  { category: "AI & Data Capabilities", value: 68 },
  { category: "Team & Skills", value: 81 }
];

const providers = [
  {
    name: "Science and Business Park Tehnopol",
    logo: "/logo/logo-Tehnopol.png",
    shortDescription: "Expert in Business Strategy and Operations",
    details: "We are a team of experts in business strategy and operations with vast experience in supporting startups and scaleups.",
    contactName: "Rauno Varblas",
    contactRole: "Head of AI and Innovation",
    contactEmail: "rauno.varblas@tehnopol.ee",
    contactPhone: "+372 5123 4567"
  },
  {
    name: "AI & Robotics Estonia",
    logo: "/logo/logo-AIRE.png",
    shortDescription: "Consortia of Estonian AI and Robotics academics",
    details: "We are flexible team of academics and support staff, ready to help you with your AI and robotics projects.",
    contactName: "Evelin Ebruk",
    contactRole: "Head of Client Relations",
    contactEmail: "evelin.ebruk@aire-edih.eu",
    contactPhone: "+372 5987 6543"
  },
  {
    name: "Artifig",
    logo: "/logo/logo-Artifig.png",
    shortDescription: "Technical AI Solutions and Strategy",
    details: "We are a small team of experts in AI with an academic background, and plenty of business experience. We are dedicated to providing the best possible solutions for our clients.",
    contactName: "Otto Mättas",
    contactRole: "AI Solutions Architect",
    contactEmail: "otto@artifig.com",
    contactPhone: "+372 5662 8362"
  }
];

const overallScore = Math.round(
  metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length
);

export default function Contact() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const goals = searchParams.get('goals') || "";
  const formRef = useRef<HTMLFormElement>(null);

  const handleDownloadClick = async () => {
    if (!formRef.current) return;
    if (!formRef.current.reportValidity()) return; // trigger HTML validation

    const formData = new FormData(formRef.current);
    const userInfo = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
    };
    console.log('Download button clicked with:', userInfo);
    await handleDownload(userInfo);
  };

  const handleEmailClick = () => {
    if (!formRef.current) return;
    if (!formRef.current.reportValidity()) return; // trigger HTML validation

    const formData = new FormData(formRef.current);
    const email = formData.get('email') as string;
    console.log('Email button clicked with email:', email);
    handleEmail(email);
  };

  const handleDownload = async (userInfo: any) => {
    console.log('Initiating download with userInfo:', userInfo);
    try {
      await downloadReport({ metrics, overallScore, providers, userInfo });
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to generate report');
    }
  };

  const handleEmail = (email: string) => {
    // Here you would typically send the report via email
    console.log('Sending report to:', email);
    alert('Report sent to your email');
  };

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
                {action ? 'Complete your details to continue' : 'Get started with the assessment'}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {action ? 'Please provide your contact information to receive the report.' : "We'll match you with the best people to help you achieve your business goals."}
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
              {!action && (
                <>
                  <div className="flex flex-wrap -mx-3 mb-5">
                    <div className="w-full px-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium" htmlFor="message">Business Goals</label>
                        <span className="text-sm text-gray-500">Optional</span>
                      </div>
                      <textarea id="message" name="message" rows={4} className="form-textarea w-full" placeholder="What business goals do you want to achieve?" defaultValue={goals}></textarea>
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-5">
                    <div className="w-full px-3">
                      <div className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-3">Tell us about your business</div>
                      <label className="flex items-center mb-2">
                        <input type="radio" className="form-radio" name="businessType" value="startup" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-3">Startup</span>
                      </label>
                      <label className="flex items-center mb-2">
                        <input type="radio" className="form-radio" name="businessType" value="scaleup" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-3">Scaleup</span>
                      </label>
                      <label className="flex items-center mb-2">
                        <input type="radio" className="form-radio" name="businessType" value="sme" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-3">SME</span>
                      </label>
                      <label className="flex items-center mb-2">
                        <input type="radio" className="form-radio" name="businessType" value="enterprise" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-3">Enterprise</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
              <div className="flex flex-wrap -mx-3 mt-6">
                <div className="w-full px-3">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
