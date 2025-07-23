import { useState, useEffect } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import ProgressDots from "@/components/quiz/ProgressDots";
import QuizStep from "@/components/quiz/QuizStep";
import ProfileResult from "@/components/quiz/ProfileResult";
import SalesPage from "@/components/layout/SalesPage";
import { quizSteps } from "@/data";
import { FacebookPixel } from "@/lib/fbPixel";

export default function QuizApp() {
  const { 
    currentStep, 
    totalSteps, 
    answers, 
    handleOptionSelect, 
    handleNextStep, 
    showResult, 
    showSalesPage
  } = useQuiz(quizSteps.length);

  // Pré-carregar todas as imagens do quiz
  useEffect(() => {
    const preloadImages = () => {
      quizSteps.forEach(step => {
        if (step.image) {
          const img = new Image();
          img.src = step.image;
        }
        if (step.imageGrid) {
          step.imageGrid.forEach(gridImg => {
            const img = new Image();
            img.src = gridImg.src;
          });
        }
      });
    };

    preloadImages();
    FacebookPixel.trackQuizStart();
  }, []);

  return (
    <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-6 md:py-8 flex flex-col">
      {/* Progress Dots - only show during actual quiz, not on landing or sales page */}
      {currentStep > 0 && !showResult && !showSalesPage && (
        <ProgressDots 
          currentStep={currentStep} 
          totalSteps={totalSteps - 1} 
        />
      )}

      {/* Quiz Container */}
      <div className="quiz-container slide-transition flex-1 flex flex-col justify-center">
        {/* Quiz Steps */}
        {quizSteps.map((step, index) => (
          <QuizStep
            key={index}
            step={step}
            stepNumber={index}
            isVisible={currentStep === index && !showResult && !showSalesPage}
            onOptionSelect={handleOptionSelect}
            onNextStep={handleNextStep}
          />
        ))}

        {/* Profile Result */}
        {showResult && !showSalesPage && (
          <ProfileResult onViewSuggestions={() => handleNextStep()} />
        )}

        {/* Sales Page */}
        {showSalesPage && <SalesPage />}
      </div>
    </div>
  );
}
