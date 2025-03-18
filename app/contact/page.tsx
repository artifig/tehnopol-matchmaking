"use client";

import PageIllustration from '@/components/page-illustration'
import Link from "next/link";
import { useSearchParams } from 'next/navigation';

export default function Contact() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const goals = searchParams.get('goals') || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const buttonAction = formData.get('action');
    
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', Object.fromEntries(formData));

    // For results page actions, we'll handle both download and email
    if (action === 'download' || action === 'email') {
      // Save the contact information first
      console.log('Saving contact information...');
      
      if (buttonAction === 'download') {
        handleDownload();
      }
      if (buttonAction === 'email') {
        handleEmail(formData.get('email') as string);
      }
    } else {
      // Regular contact form submission - redirect to assessment
      window.location.href = '/assessment';
    }
  };

  const handleDownload = () => {
    // Here you would typically generate and trigger the report download
    console.log('Downloading report...');
    alert('Report download started');
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
            <form className="max-w-xl mx-auto" onSubmit={handleSubmit}>
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
                  {action ? (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        type="submit"
                        name="action"
                        value="download"
                        className="btn text-white bg-orange-500 hover:bg-orange-400 w-full sm:w-auto flex items-center justify-center px-6 py-3"
                      >
                        <span>Download Report</span>
                        <svg className="w-3 h-3 shrink-0 mt-px ml-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                          <path className="fill-current" d="M6 8.825L11.4 3.425L10.675 2.7L6.75 6.625V0H5.25V6.625L1.325 2.7L0.6 3.425L6 8.825ZM0.75 12H11.25V10.5H0.75V12Z" />
                        </svg>
                      </button>
                      <button
                        type="submit"
                        name="action"
                        value="email"
                        className="btn text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-full sm:w-auto flex items-center justify-center px-6 py-3"
                      >
                        <span>Email Report</span>
                        <svg className="w-3 h-3 shrink-0 mt-px ml-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                          <path className="fill-current" d="M10.5 0H1.5C0.675 0 0 0.675 0 1.5V10.5C0 11.325 0.675 12 1.5 12H10.5C11.325 12 12 11.325 12 10.5V1.5C12 0.675 11.325 0 10.5 0ZM10.5 3L6 6.75L1.5 3V1.5L6 5.25L10.5 1.5V3Z" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <button 
                        type="submit"
                        className="btn text-white bg-orange-500 hover:bg-orange-400 w-full sm:w-auto flex items-center justify-center px-6 py-3"
                      >
                        <span>Start Assessment</span>
                        <svg className="w-3 h-3 shrink-0 mt-px ml-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                          <path className="fill-current" d="M6.602 11l-.875-.864L9.33 6.534H0v-1.25h9.33L5.727 1.693l.875-.875 5.091 5.091z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>

          </div>
        </div>
      </section>
    </>
  )
}
