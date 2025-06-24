interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressDots({ currentStep, totalSteps }: ProgressDotsProps) {
  return (
    <div className="flex justify-center mb-3 sm:mb-5 md:mb-6">
      {[...Array(totalSteps)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mx-0.5 sm:mx-1 ${
            i < currentStep ? "bg-primary" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}
