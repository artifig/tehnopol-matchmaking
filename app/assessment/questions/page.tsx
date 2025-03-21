"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

// Define categories with associated questions
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

// Options for answers
const options = ["Never", "Occasionally", "Often", "Always"];

// Type for a question
type Question = {
  id: string;
  question: string;
  category: string;
};

// Flatten categories into a single list of questions with category info
const allQuestions: Question[] = categories.flatMap((cat) =>
  cat.questions.map((q) => ({ ...q, category: cat.title }))
);

export default function AssessmentQuestions() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentIndex];

  // Compute starting index for each category
  const categoryStarts = useMemo<Record<string, number>>(() => {
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

  // Ref for active category button for smooth scrolling
  const activeCategoryButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (activeCategoryButtonRef.current) {
      activeCategoryButtonRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentQuestion.category]);

  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          {/* Header with progress bar */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h1 className="h1 font-red-hat-display mb-4">Assessment</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
              <div
                className="bg-orange-500 h-2.5 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="max-w-xl mx-auto w-full">
            {/* Mobile Dropdown Navigation */}
            <div className="block sm:hidden mb-4">
              <select
                className="btn text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-full flex items-center focus:outline-none"
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
                  <option key={category} value={category}>
                    {category}
                  </option>
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
                    ref={
                      currentQuestion.category === category
                        ? activeCategoryButtonRef
                        : undefined
                    }
                    className={`btn whitespace-nowrap flex items-center px-4 py-2 ${
                      currentQuestion.category === category
                        ? "text-white bg-orange-500 hover:bg-orange-400"
                        : "text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="max-w-xl mx-auto">
            <p className="mb-4 font-medium text-lg text-gray-700 dark:text-gray-300">
              {currentQuestion.question}
            </p>
            <div className="flex flex-col space-y-4 mb-8">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswerClick(option)}
                  className={`btn flex items-center justify-center px-6 py-3 ${
                    responses[currentQuestion.id] === option
                      ? "text-white bg-orange-500 hover:bg-orange-400"
                      : "text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
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
                  className="btn text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-full flex items-center justify-center px-6 py-3"
                >
                  <svg className="w-3 h-3 shrink-0 mt-px mr-2 rotate-180" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <path className="fill-current" d="M6.602 11l-.875-.864L9.33 6.534H0v-1.25h9.33L5.727 1.693l.875-.875 5.091 5.091z" />
                  </svg>
                  <span>Previous</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}