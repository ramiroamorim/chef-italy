interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
  answeredSteps: Set<number>;
}

export default function ProgressDots({ currentStep, totalSteps, answeredSteps }: ProgressDotsProps) {
  return (
    <div className="flex justify-center mb-3 sm:mb-5 md:mb-6">
      {[...Array(totalSteps)].map((_, i) => {
        const stepIndex = i + 1; // Os steps começam em 1 (excluindo landing)
        const isAnswered = answeredSteps.has(stepIndex);
        const isCurrent = stepIndex === currentStep;
        
        return (
          <div
            key={i}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mx-0.5 sm:mx-1 ${
              isAnswered ? "bg-primary" : isCurrent ? "bg-primary/50" : "bg-gray-300"
            }`}
          />
        );
      })}
    </div>
  );
}
