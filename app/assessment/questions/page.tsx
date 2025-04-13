"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

// Update the types at the top to match the new API response
interface AnswerOption {
  id: string; // Answer Record ID
  text: string; // Answer Text
}

interface Question {
  id: string; // Question Record ID
  questionText_en: string;
  category: string; // Added category text back for display/navigation logic
  answers: AnswerOption[];
}

interface Category {
  id: string;
  categoryText_en: string;
  categoryDescription_en: string;
  questions: Question[];
}

// Removed old Question/Category types
// Removed hardcoded options array

export default function AssessmentQuestions() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  // Responses state now stores QuestionID -> AnswerID
  const [responses, setResponses] = useState<Record<string, string>>({}); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]); // Now holds Question objects with answers
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const currentQuestion = useMemo(() => allQuestions[currentIndex], [allQuestions, currentIndex]); // Memoize current question
  // Get the current category object based on the current question
  const currentCategory = useMemo(() => {
      return categories.find(cat => cat.questions.some(q => q.id === currentQuestion?.id));
  }, [categories, currentQuestion]);

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

  // Fetch categories and questions (with answers) from the updated API
  useEffect(() => {
    const fetchAssessmentData = async () => {
      setIsLoading(true);
      const selectedCompanyType = localStorage.getItem('selectedCompanyType');
      if (!selectedCompanyType) {
        console.error('No company type selected');
        setIsLoading(false);
        // TODO: Redirect or show error message
        return;
      }
      try {
        const response = await fetch(`/api/assessment/fetchCategories?companyType=${selectedCompanyType}`);
        const data = await response.json();
        if (data.success) {
          const fetchedCategories: Category[] = data.categories;
          setCategories(fetchedCategories);
          
          // Extract questions, adding category text back for navigation logic
          const questionsWithCategoryText = fetchedCategories.flatMap(category =>
            category.questions.map(q => ({ ...q, category: category.categoryText_en }))
          );
          setAllQuestions(questionsWithCategoryText);
          setTotalQuestions(questionsWithCategoryText.length);

        } else {
          console.error('Error fetching assessment data:', data.error);
        }
      } catch (error) {
        console.error('Error fetching assessment data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessmentData();
  }, []);

  const handleCategorySelect = (startIndex: number) => {
    setCurrentIndex(startIndex);
  };

  // Update handleAnswerClick to store the ANSWER RECORD ID
  const handleAnswerClick = async (answerId: string) => {
    if (!currentQuestion) return;
    // Store Question Record ID -> Answer Record ID
    const newResponses = { ...responses, [currentQuestion.id]: answerId }; 
    setResponses(newResponses);

    // Save logic remains mostly the same, but sends the new responses format
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Last question answered: save responses
      const responseId = localStorage.getItem('responseId');
      if (!responseId) {
        console.error('Response ID not found in localStorage');
        // TODO: Handle error - maybe redirect?
      } else {
        try {
          console.log("Submitting responses:", newResponses); // Log the new format
          const saveResponse = await fetch('/api/assessment/saveResponses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ responseId, responses: newResponses }) // Send new format
          });
          const saveData = await saveResponse.json();
          if (!saveData.success) {
            console.error('Error saving responses:', saveData.error);
            // TODO: Handle save error - show message?
          } else {
            // Only navigate if save was successful
            router.push('/assessment/results');
          }
        } catch (error) {
          console.error('Error submitting responses:', error);
           // TODO: Handle fetch error - show message?
        }
      }
      // Removed navigation from here - happens only on successful save
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

          {/* Category Navigation and Description */}
          {allQuestions.length > 0 && (
            <div className="max-w-xl mx-auto w-full mb-6"> {/* Added margin-bottom */}
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

              {/* Display Current Category Description */} 
              {currentCategory && currentCategory.categoryDescription_en && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentCategory.categoryDescription_en}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Question Card */}
          {currentQuestion && (
            <div className="max-w-xl mx-auto">
              <p className="mb-4 font-medium text-lg text-gray-700 dark:text-gray-300">
                {currentQuestion.questionText_en}
              </p>
              <div className="flex flex-col space-y-4 mb-8">
                {/* Map over the answers fetched for the current question */} 
                {currentQuestion.answers.map((answerOption) => (
                  <button
                    key={answerOption.id} // Use Answer Record ID as key
                    type="button"
                    onClick={() => handleAnswerClick(answerOption.id)} // Pass Answer Record ID
                    className={`btn flex items-center justify-center px-6 py-3 ${
                      // Check if the stored response for this question is this answer's ID
                      responses[currentQuestion.id] === answerOption.id 
                        ? "text-white bg-orange-500 hover:bg-orange-400"
                        : "text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {answerOption.text} {/* Display Answer Text */}
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