/**
 * Facebook Pixel com Advanced Matching - Versão Simplificada
 * Integração limpa e focada apenas no essencial
 */

declare global {
  interface Window {
    fbq: any;
  }
}

// Interface para dados do visitante
interface VisitorData {
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  zip?: string;
}

/**
 * Utilitários para cookies do Facebook
 */
const CookieUtils = {
  setCookie: (name: string, value: string, days: number = 90) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  },

  getCookie: (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  // Gerar ou obter External ID
  getExternalId: (): string => {
    let externalId = CookieUtils.getCookie('external_id');
    
    if (!externalId) {
      externalId = generateUUID();
      CookieUtils.setCookie('external_id', externalId, 365);
      sessionStorage.setItem('chef_amelie_uuid_session', externalId);
    } else {
      sessionStorage.setItem('chef_amelie_uuid_session', externalId);
    }
    
    return externalId;
  },

  // Gerar ou obter Facebook Browser ID (_fbp)
  getFbp: (): string => {
    let fbp = CookieUtils.getCookie('_fbp');
    
    if (!fbp) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 2147483647);
      fbp = `fb.1.${timestamp}.${random}`;
      CookieUtils.setCookie('_fbp', fbp, 90);
    }
    
    return fbp;
  },

  // Gerar ou obter Facebook Click ID (_fbc)
  getFbc: (): string | null => {
    let fbc = CookieUtils.getCookie('_fbc');
    
    if (!fbc) {
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get('fbclid');
      
      if (fbclid) {
        const timestamp = Date.now();
        fbc = `fb.1.${timestamp}.${fbclid}`;
        CookieUtils.setCookie('_fbc', fbc, 90);
      } else {
        return null;
      }
    }
    
    return fbc;
  }
};

/**
 * Gerar UUID v4
 */
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Preparar dados de Advanced Matching
 */
const prepareAdvancedMatching = (visitorData: VisitorData) => {
  const advancedData: any = {
    external_id: CookieUtils.getExternalId(),
    fbp: CookieUtils.getFbp()
  };

  const fbc = CookieUtils.getFbc();
  if (fbc) {
    advancedData.fbc = fbc;
  }

  if (visitorData.ip) {
    advancedData.client_ip_address = visitorData.ip;
  }

  if (visitorData.userAgent) {
    advancedData.client_user_agent = visitorData.userAgent;
  }

  if (visitorData.countryCode) {
    advancedData.country = visitorData.countryCode.toLowerCase();
  }

  if (visitorData.regionName) {
    advancedData.st = visitorData.regionName;
  }

  if (visitorData.city) {
    advancedData.ct = visitorData.city;
  }

  if (visitorData.zip) {
    advancedData.zp = visitorData.zip;
  }

  return advancedData;
};

/**
 * Aguardar Facebook Pixel carregar
 */
const waitForPixel = (maxWait = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = maxWait / 100;

    const checkPixel = () => {
      attempts++;
      
      if (typeof window !== 'undefined' && window.fbq && typeof window.fbq === 'function') {
        resolve(true);
        return;
      }
      
      if (attempts >= maxAttempts) {
        resolve(false);
        return;
      }
      
      setTimeout(checkPixel, 100);
    };
    
    checkPixel();
  });
};

/**
 * Enviar evento para o servidor (CAPI)
 */
const sendToServer = async (eventType: string, eventId: string, customParams: any, visitorData: VisitorData) => {
  try {
    const eventData = {
      eventType,
      eventId,
      sessionId: CookieUtils.getExternalId(),
      customParameters: customParams,
      originalData: {
        zip: visitorData.zip,
        city: visitorData.city,
        state: visitorData.regionName,
        country: visitorData.countryCode
      },
      timestamp: new Date().toISOString()
    };
    
    await fetch('/api/database/facebook-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    
    console.log(`✅ Evento ${eventType} salvo no servidor`);
  } catch (error) {
    console.warn(`⚠️ Erro ao salvar ${eventType} no servidor:`, error);
  }
};

export const FacebookPixel = {
  CookieUtils,

  /**
   * Inicializar com PageView
   */
  init: async (visitorData: VisitorData) => {
    if ((window as any).chefAmeliePixelInitialized) {
      return true;
    }

    console.log('🎯 Inicializando Facebook Pixel...');
    
    const pixelReady = await waitForPixel();
    if (!pixelReady) {
      console.error('❌ Facebook Pixel não carregou');
      return false;
    }

    const advancedData = prepareAdvancedMatching(visitorData);
    const eventId = generateUUID();
    
    const customParams: any = {
      content_name: 'Chef Amelie Quiz Landing',
      content_category: 'Quiz',
      content_ids: ['chef-amelie-landing'],
      value: 17,
      currency: 'EUR',
      content_type: 'website',
      external_id: advancedData.external_id,
      fbp: advancedData.fbp
    };

    if (advancedData.fbc) {
      customParams.fbc = advancedData.fbc;
    }

    if (visitorData.userAgent) {
      customParams.client_user_agent = visitorData.userAgent;
    }

    if (visitorData.ip) {
      customParams.client_ip_address = visitorData.ip;
    }

    // Enviar PageView
    window.fbq('trackSingle', '1053618620169381', 'PageView', customParams, {
      eventID: eventId,
      ...advancedData
    });
    
    console.log('✅ PageView enviado:', eventId);
    
    // Salvar no servidor
    await sendToServer('PageView', eventId, customParams, visitorData);
    
    // Salvar dados globalmente
    (window as any).chefAmelieAdvancedMatching = advancedData;
    (window as any).chefAmeliePixelInitialized = true;
    
    return true;
  },

  /**
   * Enviar InitiateCheckout
   */
  trackInitiateCheckout: async (visitorData?: VisitorData) => {
    if (typeof window === 'undefined' || !window.fbq) {
      console.warn('🔸 Facebook Pixel não carregado');
      return;
    }

    if ((window as any).chefAmelieCheckoutSent) {
      console.log('🔄 InitiateCheckout já enviado');
      return;
    }

    const advancedData = (window as any).chefAmelieAdvancedMatching || {};
    const eventId = generateUUID();
    
    const customParams: any = {
      content_name: 'Chef Amelie Quiz Landing',
      content_category: 'Quiz',
      content_ids: ['chef-amelie-landing'],
      value: 17,
      currency: 'EUR',
      content_type: 'website',
      external_id: CookieUtils.getExternalId(),
      fbp: CookieUtils.getFbp()
    };

    const fbc = CookieUtils.getFbc();
    if (fbc) {
      customParams.fbc = fbc;
    }

    if (visitorData?.userAgent) {
      customParams.client_user_agent = visitorData.userAgent;
    }

    if (visitorData?.ip || advancedData?.client_ip_address) {
      customParams.client_ip_address = visitorData?.ip || advancedData.client_ip_address;
    }

    // Enviar InitiateCheckout
    window.fbq('trackSingle', '1053618620169381', 'InitiateCheckout', customParams, {
      eventID: eventId,
      ...advancedData
    });
    
    console.log('✅ InitiateCheckout enviado:', eventId);
    
    // Salvar no servidor
    if (visitorData) {
      await sendToServer('InitiateCheckout', eventId, customParams, visitorData);
    }
    
    (window as any).chefAmelieCheckoutSent = true;
  },

  /**
   * Obter status
   */
  getStatus: () => {
    return {
      pixelLoaded: typeof window !== 'undefined' && !!window.fbq,
      initialized: !!(window as any).chefAmeliePixelInitialized,
      checkoutSent: !!(window as any).chefAmelieCheckoutSent,
      externalId: CookieUtils.getExternalId(),
      fbp: CookieUtils.getFbp(),
      fbc: CookieUtils.getFbc()
    };
  },

  /**
   * Reset flags (para debug)
   */
  reset: () => {
    (window as any).chefAmeliePixelInitialized = false;
    (window as any).chefAmelieCheckoutSent = false;
    console.log('🔄 Flags resetados');
  }
};