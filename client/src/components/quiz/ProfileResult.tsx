import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { FacebookPixel } from "../../lib/fbPixel";

// Componente de botão pulsante coral
const CoralPulseButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
  return (
    <div className="relative inline-block w-full mb-3 sm:mb-4">
      <div className="absolute inset-0 rounded-full opacity-30" 
        style={{
          background: "linear-gradient(90deg, #E78D7B 0%, #E07260 100%)",
          animation: "ping 3s cubic-bezier(0.66, 0, 0, 1) infinite"
        }}
      ></div>
      <button 
        onClick={onClick}
        className="relative w-full py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg font-normal text-white"
        style={{ 
          background: "linear-gradient(90deg, #E78D7B 0%, #E07260 100%)",
          boxShadow: "0 4px 15px rgba(224, 114, 96, 0.3)"
        }}
      >
        {children}
      </button>
    </div>
  );
};

interface ProfileResultProps {
  onViewSuggestions: () => void;
}

export default function ProfileResult({ onViewSuggestions }: ProfileResultProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="profile-result max-w-md mx-auto my-5 sm:my-8 md:my-12 px-3 sm:px-6"
    >
      <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-primary">Il tuo profilo di gola:</h2>
      <h3 className="text-2xl sm:text-3xl font-normal text-[#333333] mb-6 sm:mb-8 md:mb-10">La Curiosa Golosa</h3>

      <div className="space-y-5 sm:space-y-8 md:space-y-10 text-[#333333] text-left">
        <p className="text-sm sm:text-base md:text-lg leading-relaxed">
          Sei il tipo che ama provare nuovi sapori, riscoprire versioni leggere dei piatti di una volta e sorprendere chi ami con ricette che non sembrano "senza".
        </p>
        
        <p className="text-sm sm:text-base md:text-lg leading-relaxed">
          Il tuo palato cerca equilibrio: vuoi sentirti bene —<br />
          ma <strong>senza mai rinunciare al piacere di mangiare bene</strong>.
        </p>
        
        <p className="text-sm sm:text-base md:text-lg leading-relaxed">
          Quello che la Chef Sofia Moretti ha preparato per te è proprio questo:
        </p>
        
        <p className="text-sm sm:text-base md:text-lg leading-relaxed font-semibold">
          <strong>un mondo di ricette italiane</strong> con consistenze avvolgenti, profumi veri e ingredienti che nutrono davvero.
        </p>
      </div>

      <div className="mt-8 sm:mt-10 md:mt-12">
        <CoralPulseButton onClick={onViewSuggestions}>
          🍽️ Scopri i suggerimenti della Chef
        </CoralPulseButton>
      </div>
    </motion.div>
  );
}
