import { motion } from "framer-motion";
import RadioOption from "@/components/quiz/RadioOption";
import Testimonial from "@/components/quiz/Testimonial";
import { QuizStepType } from "@/types/quiz";
import { testimonials } from "@/data";

interface QuizStepProps {
  step: QuizStepType;
  stepNumber: number;
  isVisible: boolean;
  onOptionSelect: (name: string, value: string) => void;
  onNextStep: () => void;
}

export default function QuizStep({ 
  step, 
  stepNumber, 
  isVisible, 
  onOptionSelect, 
  onNextStep 
}: QuizStepProps) {
  if (!isVisible) return null;
  
  // Special layout for landing page (step 0)
  if (step.name === 'landing') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="quiz-step landing-page text-center px-2 sm:px-4"
      >
        {/* Title */}
        {step.title && (
          <h1 className="text-2xl sm:text-3xl md:text-4xl">{step.title}</h1>
        )}

        {/* Text Blocks */}
        {step.textBlocks && (
          <div className="text-blocks">
            {step.textBlocks.map((text, i) => (
              <p 
                key={i} 
                className={text.highlight ? "text-primary font-medium text-sm sm:text-base md:text-lg" : "text-sm sm:text-base md:text-lg"}
                dangerouslySetInnerHTML={{ __html: text.content }}
              />
            ))}
          </div>
        )}

        {/* Image - Food images grid com otimização */}
        {step.image && (
          <div className="my-3 sm:my-4 md:my-5 max-w-md mx-auto">
            <img 
              src={step.image} 
              alt={step.imageAlt || ""} 
              className="w-full h-auto"
              loading="eager"
              decoding="async"
              style={{ 
                maxHeight: "300px",
                objectFit: "contain"
              }}
            />
          </div>
        )}
        
        {/* Down arrow indicator */}
        <div className="arrow-down text-2xl sm:text-3xl">▼</div>

        {/* Button with pulse animation */}
        {step.buttonText && (
          <div className="relative w-full sm:w-auto sm:mx-auto mt-3 sm:mt-4 mb-4 sm:mb-6">
            <button 
              className="btn-primary btn-pulse w-full sm:w-auto sm:px-12 md:px-16 py-3 sm:py-4 md:py-5 font-medium text-base sm:text-lg mx-auto block"
              onClick={onNextStep}
            >
              {step.buttonText}
            </button>
          </div>
        )}

        {/* Footer Text */}
        {step.footerText && (
          <div className="footer-text" dangerouslySetInnerHTML={{ __html: step.footerText }}></div>
        )}
      </motion.div>
    );
  }

  // Special layout for testimonial step
  if (step.isTestimonialStep) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="quiz-step"
      >
        {/* Title */}
        {step.title && (
          <h2 
            className="text-xl md:text-2xl font-medium mb-4 text-center"
            dangerouslySetInnerHTML={{ __html: step.title }}
          />
        )}

        {/* Testimonial Component */}
        <Testimonial 
          testimonials={testimonials}
          onComplete={onNextStep}
        />
      </motion.div>
    );
  }

  // Standard layout for quiz steps
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="quiz-step px-2 sm:px-4 flex flex-col justify-between min-h-screen"
    >
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
      {/* Layout otimizado para Chef Profile */}
      {step.name === 'chef_profile' && (
        <div className="w-full">
          {/* Title maior para melhor legibilidade */}
          {step.title && (
            <h2 
              className="text-base sm:text-xl font-medium mb-1 sm:mb-2 text-center"
              dangerouslySetInnerHTML={{ __html: step.title }}
            />
          )}
          
          {/* Description com tamanho aumentado */}
          {step.description && (
            <p 
              className="text-sm sm:text-base text-center mb-1 sm:mb-2" 
              dangerouslySetInnerHTML={{ __html: step.description }}
            />
          )}
          
          {/* Image reduzida para mobile para economizar espaço */}
          {step.image && (
            <img 
              src={step.image} 
              alt={step.imageAlt || ""} 
              className="w-full h-auto rounded-lg mb-1 sm:mb-2"
              loading="eager"
              decoding="async"
              style={{ 
                maxHeight: "140px",
                objectFit: "contain"
              }}
            />
          )}
        </div>
      )}
      
      {/* Title padrão para outros steps */}
      {step.title && step.name !== 'chef_profile' && (
        <h2 
          className="text-sm sm:text-lg font-medium mb-2 sm:mb-3 text-center"
          dangerouslySetInnerHTML={{ __html: step.title }}
        />
      )}
      {/* Description padrão */}
      {step.description && step.name !== 'chef_profile' && (
        <p 
          className="text-xs sm:text-sm text-center mb-2 sm:mb-3" 
          dangerouslySetInnerHTML={{ __html: step.description }}
        />
      )}
      {/* Image padrão para outros steps */}
      {step.image && step.name !== 'chef_profile' && (
        <img 
          src={step.image} 
          alt={step.imageAlt || ""} 
          className="w-full h-auto rounded-lg mb-2 sm:mb-3"
          loading="eager"
          decoding="async"
          style={{ 
            maxHeight: "200px",
            objectFit: "contain"
          }}
        />
      )}
      {/* Image Grid com otimização */}
      {step.imageGrid && (
        <div className="flex justify-center my-2 sm:my-3">
          {step.imageGrid.map((img, i) => (
            <img 
              key={i}
              src={img.src} 
              alt={img.alt} 
              className="w-full max-w-2xl h-auto rounded-lg"
              loading="eager"
              decoding="async"
              style={{ 
                maxHeight: "180px",
                objectFit: "contain"
              }}
            />
          ))}
        </div>
      )}
      {/* Text Blocks com tamanho otimizado para Chef Profile */}
      {step.textBlocks && step.name === 'chef_profile' && (
        <div className="space-y-1 sm:space-y-2 text-[#555555]">
          {step.textBlocks.map((text, i) => (
            <p 
              key={i} 
              className={text.highlight ? "text-primary font-medium text-sm sm:text-base" : "text-sm sm:text-base"}
              dangerouslySetInnerHTML={{ __html: text.content }}
            />
          ))}
        </div>
      )}
      {/* Text Blocks padrão para outros steps */}
      {step.textBlocks && step.name !== 'chef_profile' && (
        <div className="space-y-2 sm:space-y-3 text-[#555555]">
          {step.textBlocks.map((text, i) => (
            <p 
              key={i} 
              className={text.highlight ? "text-primary font-medium text-xs sm:text-sm" : "text-xs sm:text-sm"}
              dangerouslySetInnerHTML={{ __html: text.content }}
            />
          ))}
        </div>
      )}
      {/* Options */}
      {step.options && (
        <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
          {step.options.map((option, i) => (
            <RadioOption 
              key={i}
              name={step.name}
              value={option.value}
              label={option.label}
              onSelect={() => onOptionSelect(step.name, option.value)}
            />
          ))}
        </div>
      )}
      </div>

      {/* Botões fixos na parte inferior */}
      <div className="flex-shrink-0 pb-4">
        {/* Button otimizado para Chef Profile */}
        {step.buttonText && !step.options && step.name === 'chef_profile' && (
          <div className="relative w-full">
            <div className="absolute inset-0 rounded-full opacity-30" 
              style={{
                background: "linear-gradient(90deg, #E78D7B 0%, #E07260 100%)",
                animation: "ping 3s cubic-bezier(0.66, 0, 0, 1) infinite"
              }}
            ></div>
            <button 
              className="btn-primary relative w-full py-4 px-6 flex items-center justify-center z-10 text-base font-medium" 
              onClick={onNextStep}
            >
              <span>{step.buttonText}</span>
            </button>
          </div>
        )}
        {/* Button padrão para outros steps */}
        {step.buttonText && !step.options && step.name !== 'chef_profile' && (
          <div className="relative w-full">
            <div className="absolute inset-0 rounded-full opacity-30" 
              style={{
                background: "linear-gradient(90deg, #E78D7B 0%, #E07260 100%)",
                animation: "ping 3s cubic-bezier(0.66, 0, 0, 1) infinite"
              }}
            ></div>
            <button 
              className="btn-primary relative w-full py-4 px-6 flex items-center justify-center z-10 text-base font-medium" 
              onClick={onNextStep}
            >
              <span>{step.buttonText}</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
