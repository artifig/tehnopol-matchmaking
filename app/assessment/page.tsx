"use client";
export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBusinessGoals = searchParams.get("goals") || "";
  const [businessGoals, setBusinessGoals] = useState(initialBusinessGoals);
  const [companyType, setCompanyType] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting assessment with", { businessGoals, companyType });
    router.push("/assessment/questions");
  };

  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          {/* Page header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h1 className="h1 font-red-hat-display mb-4">
              Start Your Assessment
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Please enter your business goals and select your company type to begin.
            </p>
          </div>
  
          {/* Form */}
          <form className="max-w-xl mx-auto" onSubmit={handleSubmit}>
            <div className="flex flex-wrap -mx-3 mb-5">
              <div className="w-full px-3 mb-5">
                <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="businessGoals">
                  Business Goals <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="businessGoals"
                  value={businessGoals}
                  onChange={(e) => setBusinessGoals(e.target.value)}
                  className="form-textarea w-full"
                  placeholder="Enter your business goals..."
                  required
                  rows={4}
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-3 mb-5">
              <div className="w-full px-3">
                <label className="block text-gray-800 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="companyType">
                  Company Type <span className="text-red-600">*</span>
                </label>
                <select
                  id="companyType"
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value)}
                  className="form-select w-full"
                  required
                >
                  <option value="">Select Company Type</option>
                  <option value="startup">Startup</option>
                  <option value="scaleup">Scaleup</option>
                  <option value="small-business">Small Business (SME)</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap -mx-3 mt-6">
              <div className="w-full px-3">
                <button type="submit" className="btn text-white bg-orange-500 hover:bg-orange-400 w-full flex items-center">
                  <span>Start Assessment</span>
                  <svg className="w-3 h-3 shrink-0 mt-px ml-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <path className="fill-current" d="M6.602 11l-.875-.864L9.33 6.534H0v-1.25h9.33L5.727 1.693l.875-.875 5.091 5.091z" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
  
        </div>
      </div>
    </section>
  );
}

export default function StartAssessment() {
  return (
    <Suspense fallback={<div>Loading assessment...</div>}>
      <AssessmentContent />
    </Suspense>
  );
}