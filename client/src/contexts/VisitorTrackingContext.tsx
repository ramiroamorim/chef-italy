import React, { createContext, useContext, ReactNode } from 'react';
import { useVisitorTracking } from '@/hooks/useVisitorTracking';
import { VisitorData } from '@/types/tracking';

// Tipos do contexto
interface VisitorTrackingContextType {
  visitorData: VisitorData | null;
  isLoading: boolean;
  apiUsed: string | null;
  sessionId: string;
  trackEvent: (eventName: string, eventData?: any) => void;
  refreshTracking: () => void;
}

// Criação do contexto
const VisitorTrackingContext = createContext<VisitorTrackingContextType | undefined>(undefined);

// Provider do contexto
interface VisitorTrackingProviderProps {
  children: ReactNode;
}

export function VisitorTrackingProvider({ children }: VisitorTrackingProviderProps) {
  const trackingData = useVisitorTracking();

  return (
    <VisitorTrackingContext.Provider value={trackingData}>
      {children}
    </VisitorTrackingContext.Provider>
  );
}

// Hook para usar o contexto
export function useVisitorTrackingContext() {
  const context = useContext(VisitorTrackingContext);
  
  if (context === undefined) {
    throw new Error('useVisitorTrackingContext deve ser usado dentro de um VisitorTrackingProvider');
  }
  
  return context;
}

// Hook opcional para componentes que podem não ter o contexto
export function useOptionalVisitorTracking() {
  return useContext(VisitorTrackingContext);
} 