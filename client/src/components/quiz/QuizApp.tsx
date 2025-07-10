import { useState, useEffect } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import ProgressDots from "@/components/quiz/ProgressDots";
import QuizStep from "@/components/quiz/QuizStep";
import ProfileResult from "@/components/quiz/ProfileResult";
import SalesPage from "@/components/layout/SalesPage";
import { quizSteps } from "@/data";
import { FacebookPixel } from "@/lib/fbPixel";
import { useVisitorTrackingContext } from "@/contexts/VisitorTrackingContext";

export default function QuizApp() {
  const { 
    currentStep, 
    totalSteps, 
    answers, 
    answeredSteps,
    handleOptionSelect, 
    handleNextStep, 
    showResult, 
    showPostProfile,
    showSalesPage
  } = useQuiz(quizSteps.length);
  
  // Obter dados do visitante para passar ao InitiateCheckout
  const trackingContext = useVisitorTrackingContext();
  const { visitorData } = trackingContext;

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

    const initQuizTracking = async () => {
      preloadImages();
      // Disparar InitiateCheckout quando o quiz é iniciado (com dados do visitante)
      if (visitorData) {
        await FacebookPixel.trackInitiateCheckout(visitorData);
      }
    };

    initQuizTracking();
  }, [visitorData]);


  return (
    <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-6 md:py-8 flex flex-col">
      {/* Progress Dots - only show during actual quiz, not on landing or sales page */}
      {currentStep > 0 && !showResult && !showPostProfile && !showSalesPage && (
        <ProgressDots 
          currentStep={currentStep} 
          totalSteps={6} 
          answeredSteps={answeredSteps}
        />
      )}

      {/* Quiz Container */}
      <div className="quiz-container slide-transition flex-1 flex flex-col justify-center">
        {/* Quiz Step atual */}
        {!showResult && !showPostProfile && !showSalesPage && (
          <QuizStep
            step={quizSteps[currentStep]}
            stepNumber={currentStep}
            isVisible={true}
            onOptionSelect={handleOptionSelect}
            onNextStep={handleNextStep}
          />
        )}

        {/* Profile Result */}
        {showResult && !showPostProfile && !showSalesPage && (
          <ProfileResult onViewSuggestions={() => handleNextStep()} />
        )}

        {/* Post Profile Step */}
        {showPostProfile && !showSalesPage && (
          <QuizStep
            step={quizSteps.find(step => step.name === 'post_profile_engagement') || quizSteps[0]}
            stepNumber={-1}
            isVisible={true}
            onOptionSelect={handleOptionSelect}
            onNextStep={handleNextStep}
          />
        )}

        {/* Sales Page */}
        {showSalesPage && <SalesPage />}
      </div>
    </div>
  );
}
