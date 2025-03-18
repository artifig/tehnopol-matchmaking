"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  {
    title: "Category 1: Business Strategy",
    questions: [
      { id: "q1", question: "How clear is your business vision?" },
      { id: "q2", question: "How frequently do you review your strategic goals?" },
      { id: "q3", question: "Do you have a documented business strategy?" },
    ],
  },
  {
    title: "Category 2: Operations",
    questions: [
      { id: "q4", question: "How efficient is your current operational workflow?" },
      { id: "q5", question: "Do you regularly measure your operational metrics?" },
      { id: "q6", question: "How often do you optimize your processes?" },
    ],
  },
  {
    title: "Category 3: Growth & Marketing",
    questions: [
      { id: "q7", question: "How frequently do you launch new marketing campaigns?" },
      { id: "q8", question: "Are you satisfied with your lead generation process?" },
      { id: "q9", question: "Do you actively track your customer acquisition cost?" },
    ],
  },
];

const options = ["Never", "Occasionally", "Often", "Always"];

export default function AssessmentPage() {
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const handleOptionChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Assessment Responses:", responses);
    // Placeholder navigation to results page
    router.push("/assessment/results");
  };

  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h1 className="h1 font-red-hat-display mb-4">Assessment</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Please answer the following questions to get started.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            {categories.map((category, idx) => (
              <div key={idx} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{category.title}</h2>
                <div className="space-y-6">
                  {category.questions.map((q) => (
                    <div key={q.id}>
                      <p className="mb-2 font-medium">{q.question}</p>
                      <div className="flex space-x-4">
                        {options.map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="radio"
                              name={q.id}
                              value={option}
                              checked={responses[q.id] === option}
                              onChange={() => handleOptionChange(q.id, option)}
                              className="form-radio h-4 w-4 text-orange-600"
                            />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="text-center">
              <button
                type="submit"
                className="btn bg-orange-500 text-white hover:bg-orange-600 px-6 py-3 rounded-md"
              >
                Submit Assessment
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}