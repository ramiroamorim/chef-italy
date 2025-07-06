import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "@/assets/icons";

// Importação das imagens de forma centralizada
import { TestimonialImages, RecipeImages } from "@/assets/imageExports";

// Array com as imagens importadas
const testimonialImages = [
  TestimonialImages.testimonial1,
  TestimonialImages.testimonial2,
  TestimonialImages.testimonial3,
  TestimonialImages.testimonial4
];

// Usamos o tipo importado da pasta centralizada
import { TestimonialType } from "@/types/quiz";

// Renomeamos para manter compatibilidade com o código existente
type TestimonialData = TestimonialType;

interface TestimonialProps {
  testimonials: TestimonialData[];
  onComplete: () => void;
}

export default function Testimonial({ testimonials, onComplete }: TestimonialProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Pré-carregar todas as imagens do carrossel
  useEffect(() => {
    testimonialImages.forEach(imageSrc => {
      const img = new Image();
      img.src = imageSrc;
    });
  }, []);

  const handlePrev = () => {
    if (isLoading) return;
    setIsLoading(true);
    setCurrentIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleNext = () => {
    if (isLoading) return;
    setIsLoading(true);
    
    if (currentIndex === testimonials.length - 1) {
      onComplete();
      return;
    }
    
    setCurrentIndex(prev => prev + 1);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleViewProfile = () => {
    onComplete();
  };

  const current = testimonials[currentIndex] || testimonials[0];

  if (!current) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center min-h-[400px] w-full px-2 sm:px-4">
      <div className="relative w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="testimonial h-full w-full"
          >
            <div className="testimonial-content bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden"
                 style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.08)', minHeight: '300px', height: '100%' }}>
              
              <div className="relative flex-grow">
                <div className="relative w-full h-[280px] rounded-xl overflow-hidden">
                  <img 
                    src={testimonialImages[currentIndex % testimonialImages.length]}
                    alt={current.imageAlt || "Recettes Chef Amélie Dupont"} 
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = RecipeImages.main;
                    }}
                  />
                  
                  {/* Botões de navegação sobre a imagem */}
                  <button 
                    onClick={handlePrev}
                    disabled={isLoading}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 transition-colors text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg z-10 disabled:opacity-50"
                    aria-label="Testimonianza precedente"
                  >
                    <ChevronLeft />
                  </button>
                  
                  <button 
                    onClick={handleNext}
                    disabled={isLoading}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${currentIndex === testimonials.length - 1 ? 'bg-primary/80 hover:bg-primary' : 'bg-black/60 hover:bg-black/80'} transition-colors text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg z-10 disabled:opacity-50`}
                    aria-label={currentIndex === testimonials.length - 1 ? "Scopri il mio profilo" : "Testimonianza successiva"}
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
              
              {current.time && (
                <div className="text-right px-3 py-2 bg-white/95">
                  <span style={{ 
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    fontSize: "0.9rem",
                    color: "#666666",
                    fontWeight: "500"
                  }}>{current.time}</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center items-center gap-2 my-3 sm:my-4 px-0 sm:px-2">
        <div className="flex gap-1 sm:gap-1.5 items-center">
          {testimonials.map((_, index) => (
            <span 
              key={index} 
              className={`block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary scale-125' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      <div className="text-center mt-5 sm:mt-8">
        <button 
          className="btn-primary btn-pulse w-full sm:w-auto py-3 sm:py-4 px-6 sm:px-10 font-medium text-sm sm:text-base rounded-full"
          onClick={handleViewProfile}
        >
          🔍 SCOPRI IL MIO PROFILO
        </button>
      </div>
    </div>
  );
}