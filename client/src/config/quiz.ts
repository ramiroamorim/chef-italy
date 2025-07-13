/**
 * Configurações específicas do quiz
 * Inclui configurações para garantir funcionamento em produção
 */

export const QUIZ_CONFIG = {
  // Configurações para reset de estado
  RESET: {
    FORCE_RESET_TIMEOUT: 0, // Timeout para force reset
    CLEAR_PERSISTENT_STORAGE: true, // Limpar storage persistente
    AGGRESSIVE_RESET: true, // Reset mais agressivo em produção
    DEBUG_LOGS: true // Logs para debug em produção
  },
  
  // Configurações de timing
  TIMING: {
    OPTION_SELECT_DELAY: 500, // Delay após selecionar opção
    STEP_TRANSITION_DELAY: 100, // Delay na transição de etapa
    FORCE_RERENDER_DELAY: 50 // Delay para force rerender
  },
  
  // Configurações de produção
  PRODUCTION: {
    FORCE_UNIQUE_KEYS: true, // Force keys únicas para reset
    CLEAR_CACHE_ON_STEP_CHANGE: true, // Limpar cache ao mudar etapa
    PREVENT_STATE_PERSISTENCE: true, // Prevenir persistência de estado
  }
};

/**
 * Função para verificar se estamos em produção
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production' || import.meta.env.PROD;
};

/**
 * Função para limpar completamente o estado do quiz
 */
export const clearQuizState = () => {
  if (!QUIZ_CONFIG.RESET.CLEAR_PERSISTENT_STORAGE) return;
  
  try {
    // Limpar localStorage
    const localKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('quiz_') || key.startsWith('react_')
    );
    localKeys.forEach(key => localStorage.removeItem(key));
    
    // Limpar sessionStorage
    const sessionKeys = Object.keys(sessionStorage).filter(key => 
      key.startsWith('quiz_') || key.startsWith('react_')
    );
    sessionKeys.forEach(key => sessionStorage.removeItem(key));
    
    // Log para debug
    if (QUIZ_CONFIG.RESET.DEBUG_LOGS && isProduction()) {
      console.log('[QUIZ] Estado limpo:', {
        localKeysCleared: localKeys.length,
        sessionKeysCleared: sessionKeys.length,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    // Ignorar erros de storage
    if (QUIZ_CONFIG.RESET.DEBUG_LOGS) {
      console.warn('[QUIZ] Erro ao limpar storage:', error);
    }
  }
};

/**
 * Função para debug do estado atual
 */
export const debugQuizState = (stepName: string, currentAnswer: string | null) => {
  if (!QUIZ_CONFIG.RESET.DEBUG_LOGS) return;
  
  console.log(`[QUIZ DEBUG] ${stepName}:`, {
    currentAnswer,
    isProduction: isProduction(),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent.substring(0, 50)
  });
}; 