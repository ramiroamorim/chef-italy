import { motion } from "framer-motion";
import RadioOption from "@/components/quiz/RadioOption";
import Testimonial from "@/components/quiz/Testimonial";
import { QuizStepType } from "@/types/quiz";
import { testimonials } from "@/data";
import { RecipeImages } from "@/assets/imageExports";

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
        className="quiz-step landing-page text-center w-full pt-8 pb-4 min-h-screen bg-white"
      >
        {/* Título mais compacto */}
        {step.title && (
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-[#E07260] mb-4 text-center w-full">
            {step.title}
          </h1>
        )}

        {/* Blocos de texto organizados */}
        {step.textBlocks && (
          <div className="text-blocks mb-4">
            {step.textBlocks.map((text, i) => (
              <p
                key={i}
                className={
                  text.highlight
                    ? "text-primary font-medium text-sm sm:text-base md:text-lg text-center mb-4"
                    : "text-sm sm:text-base md:text-lg text-center mb-4"
                }
                dangerouslySetInnerHTML={{ __html: text.content }}
              />
            ))}
          </div>
        )}

        {/* Imagem principal centralizada */}
        {step.image && (
          <div className="my-1 sm:my-2 md:my-3 max-w-lg sm:max-w-2xl md:max-w-3xl mx-auto">
            <img
              src={step.image}
              alt={step.imageAlt || ""}
              className="w-full h-auto"
              loading="eager"
              decoding="async"
              style={{ maxHeight: '600px', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Seta para baixo */}
        <div className="arrow-down text-2xl sm:text-3xl text-[#E07260] my-2">▼</div>

        {/* Botão grande e destacado */}
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

        {/* Footer Text discreto */}
        {step.footerText && (
          <div className="footer-text text-xs sm:text-sm text-[#888] mt-2 text-center" dangerouslySetInnerHTML={{ __html: step.footerText }}></div>
        )}
      </motion.div>
    );
  }

  // Special layout for optimized sales step
  if (step.isOptimizedSalesStep) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="quiz-step px-2 sm:px-4 flex flex-col justify-center min-h-screen"
      >
        <div className="bg-[#FFF8F5] p-4 sm:p-6 rounded-md mb-6 sm:mb-8">
          <h1 style={{ 
            fontFamily: 'Georgia, "Times New Roman", serif', 
            fontStyle: 'italic', 
            color: '#B34431', 
            fontSize: '1.5rem', 
            lineHeight: '1.4', 
            marginBottom: '1rem', 
            fontWeight: 'normal' 
          }}>
            <span className="block">{step.title}</span>
            <span className="block">{step.subtitle}</span>
          </h1>
          
          <div className="mt-3 sm:mt-4">
            {step.bulletPoints && step.bulletPoints.map((point, i) => (
              <p key={i} className="mb-2 text-xs sm:text-sm">{point}</p>
            ))}
            
            {step.description && (
              <p 
                className="mb-2 text-xs sm:text-sm"
                dangerouslySetInnerHTML={{ __html: step.description }}
              />
            )}
          </div>
        </div>
        
        {step.buttonText && (
          <div className="text-center">
            <button 
              className="btn-primary btn-pulse w-full sm:w-auto py-3 sm:py-4 px-6 sm:px-10 font-medium text-base sm:text-lg rounded-full"
              onClick={onNextStep}
            >
              {step.buttonText}
            </button>
          </div>
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
      className="quiz-step px-2 flex flex-col min-h-screen pt-4"
    >
      {/* Title with highlighted text */}
      {step.title && (
        <h2 className="text-base sm:text-lg font-medium mb-3 text-center">
          <span className="text-primary font-semibold">Centinaia di donne </span>
          <span className="text-[#333333]">hanno già provato queste ricette e hanno visto il loro corpo trasformarsi.</span>
        </h2>
      )}

      {/* Testimonial Component - sem espaços extras */}
      <div className="flex-1 flex items-start justify-center">
        <Testimonial 
          testimonials={testimonials}
          onComplete={onNextStep}
        />
      </div>
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
      <div className="content-main flex-1 flex flex-col justify-center space-y-4">
      {/* Layout otimizado para Chef Profile */}
      {step.name === 'chef_profile' && (
        <div className="w-full">
          {/* Title aumentado para chef profile */}
          {step.title && (
            <div className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center">
              <span dangerouslySetInnerHTML={{ __html: step.title }} />
            </div>
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
              className="w-full max-w-md h-auto rounded-lg mb-1 sm:mb-2 mx-auto"
              loading="eager"
              decoding="async"
              style={{ 
                maxHeight: "200px",
                objectFit: "contain"
              }}
            />
          )}
        </div>
      )}
      
      {/* Title aumentado para etapa improve */}
      {step.title && step.name === 'improve' && (
        <div className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center" style={{ lineHeight: '1.3' }}>
          <span dangerouslySetInnerHTML={{ __html: step.title }} />
        </div>
      )}
      {/* Title menor para etapa recipes_experience */}
      {step.title && step.name === 'recipes_experience' && (
        <div className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center" style={{ lineHeight: '1.3' }}>
          <span dangerouslySetInnerHTML={{ __html: step.title }} />
        </div>
      )}
      {/* Layout especial para etapa result */}
      {step.name === 'result' && (
        <div className="profile-result max-w-md mx-auto my-5 sm:my-8 md:my-12 px-3 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-primary">Il tuo profilo gourmet:</h2>
          <h3 className="text-2xl sm:text-3xl font-normal text-[#333333] mb-6 sm:mb-8 md:mb-10">{step.title}</h3>
          
          {step.textBlocks && (
            <div className="space-y-5 sm:space-y-8 md:space-y-10 text-[#333333] text-left">
              {step.textBlocks.map((text, i) => (
                <p 
                  key={i} 
                  className="text-sm sm:text-base md:text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: text.content }}
                />
              ))}
            </div>
          )}
          
          {step.buttonText && (
            <div className="mt-8 sm:mt-10 md:mt-12">
              <div className="relative inline-block w-full mb-3 sm:mb-4">
                <div className="absolute inset-0 rounded-full opacity-30" 
                  style={{
                    background: "linear-gradient(90deg, #E78D7B 0%, #E07260 100%)",
                    animation: "ping 3s cubic-bezier(0.66, 0, 0, 1) infinite"
                  }}
                ></div>
                <button 
                  className="relative w-full py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg font-medium text-white"
                  style={{
                    background: "linear-gradient(90deg, #E78D7B 0%, #E07260 100%)",
                    boxShadow: "0 4px 15px rgba(224, 114, 96, 0.3)"
                  }}
                  onClick={onNextStep}
                >
                  {step.buttonText}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Title padrão para outros steps */}
      {step.title && step.name !== 'chef_profile' && step.name !== 'landing' && step.name !== 'improve' && step.name !== 'recipes_experience' && step.name !== 'result' && (
        <div className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center">
          <span dangerouslySetInnerHTML={{ __html: step.title }} />
        </div>
      )}
      {/* Description padrão */}
      {step.description && step.name !== 'chef_profile' && (
        <p 
          className="text-xs sm:text-sm text-center mb-2 sm:mb-3" 
          dangerouslySetInnerHTML={{ __html: step.description }}
        />
      )}
      {/* Image específica para temptations step */}
      {step.image && step.name === 'temptations' && (
        <img 
          src={step.image} 
          alt={step.imageAlt || ""} 
          className="w-full max-w-md h-auto rounded-lg mb-2 sm:mb-3 mx-auto"
          loading="eager"
          decoding="async"
          style={{ 
            maxHeight: "300px",
            objectFit: "contain"
          }}
        />
      )}
      {/* Image padrão para outros steps */}
      {step.image && step.name !== 'chef_profile' && step.name !== 'temptations' && (
        <img 
          src={step.image} 
          alt={step.imageAlt || ""} 
          className="w-full max-w-md h-auto rounded-lg mb-2 sm:mb-3 mx-auto"
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
              className="w-full max-w-md h-auto rounded-lg mx-auto"
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
        <div className="space-y-1 sm:space-y-2 text-[#555555] text-center px-2">
          {step.textBlocks.map((text, i) => (
            <p 
              key={i} 
              className={text.highlight ? "text-primary font-medium text-sm sm:text-base text-center" : "text-sm sm:text-base text-center"}
              dangerouslySetInnerHTML={{ __html: text.content }}
            />
          ))}
        </div>
      )}
      
            {/* Button do Chef Profile diretamente após o texto */}
      {step.buttonText && !step.options && step.name === 'chef_profile' && (
        <div className="relative w-full mt-3 sm:mt-4">
          <div className="absolute inset-0 rounded-full opacity-30" 
            style={{
              background: "linear-gradient(90deg, #E78D7B 0%, #E07260 100%)",
              animation: "ping 3s cubic-bezier(0.66, 0, 0, 1) infinite"
            }}
          ></div>
          <button 
            className="btn-primary relative w-full py-4 sm:py-5 px-8 sm:px-12 flex items-center justify-center z-10 text-xs sm:text-sm font-medium whitespace-nowrap" 
            onClick={onNextStep}
          >
            <span className="text-center leading-tight px-3">{step.buttonText}</span>
          </button>
        </div>
      )}
      {/* Text Blocks padrão para outros steps */}
      {step.textBlocks && step.name !== 'chef_profile' && step.name !== 'result' && (
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
      <div className="button-area flex-shrink-0 pb-4">
        {/* Button padrão para outros steps */}
        {step.buttonText && !step.options && step.name !== 'chef_profile' && step.name !== 'result' && (
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
