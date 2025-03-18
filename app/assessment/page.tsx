"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

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

type Question = {
  id: string;
  question: string;
  category: string;
};

// Flatten categories into a single list of questions with category info
const allQuestions: Question[] = categories.flatMap((cat) => 
  cat.questions.map((q) => ({ ...q, category: cat.title }))
);

export default function AssessmentPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  
  const currentQuestion = allQuestions[currentIndex];
  const totalQuestions = allQuestions.length;
  
  const categoryStarts = React.useMemo(() => {
    const mapping: Record<string, number> = {};
    allQuestions.forEach((question, index) => {
      if (!mapping[question.category]) {
        mapping[question.category] = index;
      }
    });
    return mapping;
  }, [allQuestions]);

  const handleCategorySelect = (startIndex: number) => {
    setCurrentIndex(startIndex);
  };

  const handleAnswerClick = (value: string) => {
    const newResponses = { ...responses, [currentQuestion.id]: value };
    setResponses(newResponses);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log("Assessment Responses:", newResponses);
      router.push("/assessment/results");
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  const activeCategoryButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (activeCategoryButtonRef.current) {
      activeCategoryButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentQuestion.category]);

  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h1 className="h1 font-red-hat-display mb-4">Assessment</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
              <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 mb-6">
            {/* Mobile Dropdown Navigation */}
            <div className="block sm:hidden mb-4">
              <select
                className="btn w-full py-2 px-4 rounded-md text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 focus:outline-none"
                value={currentQuestion.category}
                onChange={(e) => {
                  const selected = e.target.value;
                  const startIndex = categoryStarts[selected];
                  if (startIndex !== undefined) {
                    handleCategorySelect(startIndex);
                  }
                }}
              >
                {Object.entries(categoryStarts).map(([category, startIndex]) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Desktop Horizontal Scroll Navigation */}
            <div className="hidden sm:block overflow-x-auto scroll-smooth">
              <div className="flex space-x-4 pb-2">
                {Object.entries(categoryStarts).map(([category, startIndex]) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(startIndex)}
                    ref={currentQuestion.category === category ? activeCategoryButtonRef : undefined}
                    className={`btn px-4 py-2 rounded-md whitespace-nowrap ${currentQuestion.category === category ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow rounded-lg p-8">
            <p className="mb-4 font-medium text-lg text-gray-700 dark:text-gray-300">{currentQuestion.question}</p>
            <div className="flex flex-col space-y-4 mb-8">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswerClick(option)}
                  className={`btn px-6 py-3 rounded-md ${responses[currentQuestion.id] === option ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex justify-start">
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="btn bg-gray-300 text-gray-700 hover:bg-gray-400 px-6 py-3 rounded-md"
                >
                  Previous
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}