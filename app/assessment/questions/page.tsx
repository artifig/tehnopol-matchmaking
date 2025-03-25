"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

// Update the types at the top
type Category = {
  id: string;
  categoryText_en: string;
  categoryDescription_en: string;
};

type Question = {
  id: string;
  question: string;
  category: string;
};

// Remove the hard-coded categories array and replace with mock questions generator
const generateMockQuestions = (categoryId: string, categoryTitle: string): Question[] => {
  return [
    { id: `${categoryId}-q1`, question: `How well does your company align with ${categoryTitle}?`, category: categoryTitle },
    { id: `${categoryId}-q2`, question: `What specific initiatives have you implemented in ${categoryTitle}?`, category: categoryTitle },
    { id: `${categoryId}-q3`, question: `How do you measure success in ${categoryTitle}?`, category: categoryTitle },
    { id: `${categoryId}-q4`, question: `What challenges have you faced in ${categoryTitle}?`, category: categoryTitle },
    { id: `${categoryId}-q5`, question: `What improvements are you planning in ${categoryTitle}?`, category: categoryTitle },
  ];
};

// Options for answers
const options = ["Never", "Occasionally", "Often", "Always"];

export default function AssessmentQuestions() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const currentQuestion = allQuestions[currentIndex];

  // Compute starting index for each category
  const categoryStarts = useMemo<Record<string, number>>(() => {
    if (!allQuestions.length) return {};
    const mapping: Record<string, number> = {};
    allQuestions.forEach((question, index) => {
      if (!mapping[question.category]) {
        mapping[question.category] = index;
      }
    });
    return mapping;
  }, [allQuestions]);

  // Fetch categories and generate questions
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      const selectedCompanyType = localStorage.getItem('selectedCompanyType');
      if (!selectedCompanyType) {
        console.error('No company type selected');
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/assessment/fetchCategories?companyType=${selectedCompanyType}`);
        const data = await response.json();
        if (data.success) {
          // Use categories directly from Airtable without sorting
          setCategories(data.categories);
          // Generate mock questions for each category
          const questions = data.categories.flatMap((category: Category) => 
            generateMockQuestions(category.id, category.categoryText_en)
          );
          setAllQuestions(questions);
          setTotalQuestions(questions.length);
        } else {
          console.error('Error fetching categories:', data.error);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

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

  const progressPercentage = allQuestions.length ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  // Ref for active category button for smooth scrolling
  const activeCategoryButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (activeCategoryButtonRef.current && currentQuestion?.category) {
      activeCategoryButtonRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentQuestion?.category]);

  if (isLoading) {
    return (
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="h1 font-red-hat-display mb-4">Loading...</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">Please wait while we load your assessment.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
          {allQuestions.length > 0 && (
            <div className="max-w-xl mx-auto w-full">
              {/* Mobile Dropdown Navigation */}
              <div className="block sm:hidden mb-4">
                <select
                  className="btn text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-full flex items-center focus:outline-none"
                  value={currentQuestion?.category || ''}
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
                        currentQuestion?.category === category
                          ? activeCategoryButtonRef
                          : undefined
                      }
                      className={`btn whitespace-nowrap flex items-center px-4 py-2 ${
                        currentQuestion?.category === category
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
          )}

          {/* Question Card */}
          {currentQuestion && (
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
          )}
        </div>
      </div>
    </section>
  );
}