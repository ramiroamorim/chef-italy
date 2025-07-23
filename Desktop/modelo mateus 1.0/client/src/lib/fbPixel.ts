/**
 * Utilitário para rastreamento de eventos do Facebook Pixel
 * Facilita o disparo de eventos de conversão em diferentes pontos da aplicação
 */

declare global {
  interface Window {
    fbq: any;
  }
}

export const FacebookPixel = {
  /**
   * Rastreia evento de início do quiz
   */
  trackQuizStart: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout');
    }
  },

  /**
   * Rastreia evento de conclusão do quiz
   */
  trackQuizComplete: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration');
    }
  },

  /**
   * Rastreia evento de visualização da página de vendas
   */
  trackViewContent: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent');
    }
  },

  /**
   * Rastreia evento de clique no botão de compra
   */
  trackPurchaseClick: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart');
    }
  },

  /**
   * Rastreia evento de visualização da página de agradecimento
   */
  trackThankYouPage: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: 49.90,
        currency: 'EUR'
      });
    }
  },

  /**
   * Rastreia evento personalizado
   */
  trackCustomEvent: (eventName: string, parameters?: any) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, parameters);
    }
  }
};