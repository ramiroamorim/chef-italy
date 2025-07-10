import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "@/assets/icons";

// Importação das imagens de forma centralizada
import { TestimonialImages, RecipeImages } from "@/assets/imageExports";

// Array com as imagens importadas
const testimonialImages = [
  TestimonialImages.testimonial6, // Primeira: d233cffd-a5c4-45b1-b3a0-24f08356bf37.JPG
  TestimonialImages.pageOffer,    // Segunda: image-02-page-offer.jpg
  TestimonialImages.testimonial2, // Resto aleatório
  TestimonialImages.testimonial1,
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
    <div className="flex flex-col justify-start items-center w-full mt-2">
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto mt-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="testimonial h-full w-full"
          >
            <div className="testimonial-content bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden"
                 style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
              
              <div className="relative flex-grow">
              <div className="relative w-full h-140 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 m-1 sm:m-2 flex items-center justify-center border-2 border-gray-300/60">
                  <img 
                    src={testimonialImages[currentIndex % testimonialImages.length]}
                    alt={current.imageAlt || "Recettes Chef Amélie Dupont"} 
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                    decoding="async"
                    style={{
                      objectPosition: 'center center',
                      filter: 'brightness(1.02) contrast(1.05)',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = RecipeImages.main;
                    }}
                  />
                  
                  {/* Moldura interna para dar efeito de profundidade */}
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none"></div>
                  
                  {/* Botões de navegação sobre a imagem */}
                  <button 
                    onClick={handlePrev}
                    disabled={isLoading}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/80 hover:bg-black/95 transition-all duration-200 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg z-10 disabled:opacity-50 hover:scale-110 backdrop-blur-sm"
                    aria-label="Testimonianza precedente"
                  >
                    <ChevronLeft />
                  </button>
                  
                  <button 
                    onClick={handleNext}
                    disabled={isLoading}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${currentIndex === testimonials.length - 1 ? 'bg-primary/90 hover:bg-primary' : 'bg-black/80 hover:bg-black/95'} transition-all duration-200 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg z-10 disabled:opacity-50 hover:scale-110 backdrop-blur-sm`}
                    aria-label={currentIndex === testimonials.length - 1 ? "Scopri il mio profilo" : "Testimonianza successiva"}
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
              
              {current.time && (
                <div className="text-right px-4 py-3 bg-white/95">
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

      <div className="flex justify-center items-center gap-2 my-1 px-0 sm:px-2">
        <div className="flex gap-1 sm:gap-1.5 items-center">
          {testimonials.map((_, index) => (
            <span 
              key={index} 
              className={`block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary scale-125' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      <div className="text-center mt-3 sm:mt-6">
        <button 
          className="btn-primary btn-pulse w-full sm:w-auto py-3 sm:py-4 px-6 sm:px-10 font-medium text-sm sm:text-base rounded-full max-w-xs sm:max-w-sm mx-auto"
          onClick={handleViewProfile}
        >
          🔍 SCOPRI IL MIO PROFILO
        </button>
      </div>
    </div>
  );
}