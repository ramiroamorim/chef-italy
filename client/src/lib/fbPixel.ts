
/**
 * Utilitário para rastreamento de eventos do Facebook Pixel com Advanced Matching
 * Integra dados de geolocalização para melhor tracking de conversões
 */

declare global {
  interface Window {
    fbq: any;
  }
}

/**
 * Extrair apenas a primeira parte do User Agent (ex: "Mozilla")
 */
const extractUserAgentSource = (userAgent: string): string => {
  if (!userAgent) return '';
  
  // Extrair apenas a primeira parte até o primeiro espaço ou "/"
  const firstPart = userAgent.split(/[\s\/]/)[0];
  return firstPart || userAgent.substring(0, 20); // Fallback para primeiros 20 caracteres
};

/**
 * Utilitários para gerenciar cookies do Facebook Pixel
 */
const CookieUtils = {
  /**
   * Definir cookie com expiração
   */
  setCookie: (name: string, value: string, days: number = 90) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  },

  /**
   * Obter cookie pelo nome
   */
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

  /**
   * Gerar ou obter Facebook Browser ID (_fbp)
   */
  getFbp: (): string => {
    let fbp = CookieUtils.getCookie('_fbp');
    
    if (!fbp) {
      // Formato: fb.{domain_id}.{timestamp}.{random}
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 2147483647); // 32-bit random number
      fbp = `fb.1.${timestamp}.${random}`;
      
      // Salvar cookie por 90 dias (padrão Facebook)
      CookieUtils.setCookie('_fbp', fbp, 90);
      console.log('🍪 Novo _fbp gerado:', fbp);
    } else {
      console.log('🍪 _fbp existente encontrado:', fbp);
    }
    
    return fbp;
  },

  /**
   * Gerar ou obter Facebook Click ID (_fbc)
   */
  getFbc: (): string | null => {
    let fbc = CookieUtils.getCookie('_fbc');
    
    if (!fbc) {
      // Verificar se há fbclid na URL
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get('fbclid');
      
      if (fbclid) {
        // Formato: fb.{domain_id}.{timestamp}.{fbclid}
        const timestamp = Date.now();
        fbc = `fb.1.${timestamp}.${fbclid}`;
        
        // Salvar cookie por 90 dias
        CookieUtils.setCookie('_fbc', fbc, 90);
        console.log('🍪 Novo _fbc gerado com fbclid:', fbc);
      } else {
        console.log('🍪 Nenhum fbclid encontrado na URL - _fbc não será criado');
        return null;
      }
    } else {
      console.log('🍪 _fbc existente encontrado:', fbc);
    }
    
    return fbc;
  },

  /**
   * Obter ou gerar External ID (UUID do visitante)
   */
  getExternalId: (): string => {
    let externalId = CookieUtils.getCookie('external_id');
    
    if (!externalId) {
      // Gerar novo UUID para o visitante
      externalId = generateUUID();
      
      // Salvar cookie por 365 dias (1 ano)
      CookieUtils.setCookie('external_id', externalId, 365);
      
      // Também salvar no sessionStorage para compatibilidade
      sessionStorage.setItem('chef_amelie_uuid_session', externalId);
      
      console.log('🍪 Novo External ID gerado:', externalId);
    } else {
      // Sincronizar com sessionStorage
      sessionStorage.setItem('chef_amelie_uuid_session', externalId);
      console.log('🍪 External ID existente encontrado:', externalId);
    }
    
    return externalId;
  },

  /**
   * Debug de todos os cookies do Facebook
   */
  debugCookies: () => {
    const fbp = CookieUtils.getCookie('_fbp');
    const fbc = CookieUtils.getCookie('_fbc');
    const externalId = CookieUtils.getCookie('external_id');
    
    console.log('🍪 DEBUG Cookies Facebook:');
    console.log('  _fbp:', fbp || 'NOT SET');
    console.log('  _fbc:', fbc || 'NOT SET');
    console.log('  external_id:', externalId || 'NOT SET');
    
    return { fbp, fbc, externalId };
  }
};

// Interface para dados de Advanced Matching
interface AdvancedMatchingData {
  external_id?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  country?: string;
  st?: string;  // state
  ct?: string;  // city
  zp?: string;  // zip code
  em?: string;  // email (hashed)
  ph?: string;  // phone (hashed)
  fid?: string; // visitor fingerprint ID
  fn?: string;  // first name (hashed)
  ln?: string;  // last name (hashed)
  fbp?: string; // Facebook Browser ID
  fbc?: string; // Facebook Click ID
}

/**
 * Hash de dados usando SHA-256 simulado
 */
const hashData = async (data: string): Promise<string> => {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback para navegadores sem crypto.subtle
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  } catch (error) {
    console.warn('Erro ao fazer hash:', error);
    return data.slice(0, 8) + '...'; // Fallback simples
  }
};

/**
 * Gerar fingerprint único do visitante
 */
const generateFingerprint = (visitorData: any): string => {
  const components = [
    visitorData.userAgent || '',
    visitorData.language || '',
    visitorData.platform || '',
    visitorData.screenResolution || '',
    visitorData.timezone || '',
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString()
  ];
  
  return 'fp_' + btoa(components.join('|')).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
};

/**
 * Gerar UUID v4 para Event ID
 */
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Usar API nativa se disponível (navegadores modernos)
    return crypto.randomUUID();
  }
  
  // Fallback para navegadores mais antigos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Gerar Event ID único usando UUID
 */
const generateEventId = (eventType: string): string => {
  return generateUUID();
};

export const FacebookPixel = {
  // Expor CookieUtils para uso em outros módulos
  CookieUtils,

  /**
   * Aguardar Facebook Pixel carregar
   */
  waitForPixel: (maxWait = 8000): Promise<boolean> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = maxWait / 100;

      const checkPixel = () => {
        attempts++;
        
        if (typeof window !== 'undefined' && window.fbq && typeof window.fbq === 'function') {
          console.log('✅ Facebook Pixel carregado e pronto para Advanced Matching!');
          resolve(true);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.warn('⏰ Timeout aguardando Facebook Pixel');
          resolve(false);
          return;
        }
        
        setTimeout(checkPixel, 100);
      };
      
      checkPixel();
    });
  },

  /**
   * Inicializar Advanced Matching - APENAS PAGEVIEW (UMA VEZ)
   */
  initWithAdvancedMatching: async (visitorData: any) => {
    // Verificar se já foi inicializado
    if ((window as any).chefAmeliePixelInitialized) {
      console.log('🔄 Facebook Pixel já inicializado - pulando...');
      return true;
    }

    console.log('🎯 Iniciando Advanced Matching para PageView...');
    console.log('🔍 Dados do visitante recebidos:', {
      sessionId: visitorData?.sessionId || 'NOT SET',
      ip: visitorData?.ip || 'NOT SET',
      country: visitorData?.country || 'NOT SET',
      city: visitorData?.city || 'NOT SET'
    });
    
    // Aguardar pixel carregar
    const pixelReady = await FacebookPixel.waitForPixel();
    
    if (!pixelReady) {
      console.error('❌ Facebook Pixel não carregou - Advanced Matching não será ativado');
      return false;
    }

    // Preparar campos de Advanced Matching
    const advancedData: AdvancedMatchingData = {};
    
    // 🍪 COOKIES DO FACEBOOK (OBRIGATÓRIOS)
    // Obter ou gerar External ID via cookie
    const externalId = CookieUtils.getExternalId();
    advancedData.external_id = externalId;
    console.log('🔑 External ID definido no Advanced Matching:', externalId);
    
    // Obter ou gerar Facebook Browser ID (_fbp)
    const fbp = CookieUtils.getFbp();
    advancedData.fbp = fbp;
    console.log('🍪 Facebook Browser ID (_fbp):', fbp);
    
    // Obter Facebook Click ID (_fbc) se disponível
    const fbc = CookieUtils.getFbc();
    if (fbc) {
      advancedData.fbc = fbc;
      console.log('🍪 Facebook Click ID (_fbc):', fbc);
    } else {
      console.log('🍪 Facebook Click ID (_fbc): não disponível');
    }
    
    if (visitorData.ip) {
      advancedData.client_ip_address = visitorData.ip;
    }
    
    // Adicionar User Agent (sempre disponível no navegador)
    const userAgent = visitorData.userAgent || navigator.userAgent;
    console.log('🔍 DEBUG Advanced Matching - userAgent completo:', userAgent);
    
    if (userAgent) {
      // Usar User Agent completo para mais precisão
      advancedData.client_user_agent = userAgent;
      // Salvar para uso posterior
      (window as any).chefAmelieUserAgent = userAgent;
      console.log('✅ client_user_agent definido no Advanced Matching (completo):', userAgent.substring(0, 100) + '...');
    } else {
      console.warn('⚠️ User Agent não encontrado!');
    }
    
    // 🌍 LOCALIZAÇÃO
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

    // 🔐 CAMPOS DE IDENTIDADE (hasheados)
    try {
      advancedData.fid = generateFingerprint(visitorData);
      
      if (visitorData.sessionId) {
        const uuidPart = visitorData.sessionId.replace(/-/g, '').substring(0, 8);
        const mockEmail = `lead-${uuidPart}@guest.chef-amelie.com`;
        advancedData.em = await hashData(mockEmail);
      }
      
      if (visitorData.countryCode) {
        let mockPhone = '+5511999999999';
        if (visitorData.countryCode === 'FR') mockPhone = '+33123456789';
        if (visitorData.countryCode === 'US') mockPhone = '+1234567890';
        if (visitorData.countryCode === 'CA') mockPhone = '+1416123456';
        if (visitorData.countryCode === 'GB') mockPhone = '+44123456789';
        advancedData.ph = await hashData(mockPhone);
      }

      advancedData.fn = await hashData('amelie');
      advancedData.ln = await hashData('lead');
      
    } catch (error) {
      console.warn('⚠️ Erro ao gerar hashes:', error);
    }

    // Remover campos vazios
    Object.keys(advancedData).forEach(key => {
      if (!advancedData[key as keyof AdvancedMatchingData]) {
        delete advancedData[key as keyof AdvancedMatchingData];
      }
    });

    console.log('📊 Advanced Matching preparado:', Object.keys(advancedData).length, 'campos');

    try {
      // Gerar Event ID único para PageView usando UUID
      const pageViewEventId = generateEventId('pageview');
      
      // Preparar Custom Parameters para PageView
      const pageViewCustomParams: any = {
        content_name: 'Chef Amelie Quiz Landing',
        content_category: 'Quiz',
        content_ids: ['chef-amelie-landing'],
        value: 17,
        currency: 'EUR',
        content_type: 'website'
      };
      
      // Adicionar external_id do cookie
      pageViewCustomParams.external_id = externalId;
      
      // Adicionar fbp nos custom parameters
      pageViewCustomParams.fbp = fbp;
      
      // Adicionar fbc nos custom parameters se disponível
      if (fbc) {
        pageViewCustomParams.fbc = fbc;
      }
      
      // Adicionar client_user_agent nos custom parameters (User Agent nativo)
      const userAgentForParams = visitorData.userAgent || navigator.userAgent;
      console.log('🔍 DEBUG Custom Params - userAgent:', userAgentForParams);
      
      if (userAgentForParams) {
        // Usar User Agent completo nos Custom Parameters também
        pageViewCustomParams.client_user_agent = userAgentForParams;
        console.log('🔍 DEBUG - client_user_agent completo para Custom Params:', userAgentForParams.substring(0, 80) + '...');
        console.log('✅ client_user_agent adicionado aos Custom Parameters (completo)');
      } else {
        console.warn('⚠️ User Agent não encontrado!');
      }
      
      // Adicionar client_ip_address nos custom parameters
      if (visitorData.ip) {
        pageViewCustomParams.client_ip_address = visitorData.ip;
      }
      

      
      // 🎯 ENVIAR PAGEVIEW COM ADVANCED MATCHING E EVENT ID (SINTAXE OFICIAL)
      window.fbq('trackSingle', '644431871463181', 'PageView', pageViewCustomParams, {
        eventID: pageViewEventId,
        ...advancedData
      });
      
      console.log('✅ PageView enviado com Advanced Matching e Event ID UUID!');
      console.log('🆔 Event ID (UUID):', pageViewEventId);
      console.log('👤 External ID nos Custom Parameters:', pageViewCustomParams.external_id || 'NOT SET');
      console.log('👤 External ID no Advanced Matching:', advancedData.external_id || 'NOT SET');
      console.log('🍪 FBP nos Custom Parameters:', pageViewCustomParams.fbp || 'NOT SET');
      console.log('🍪 FBC nos Custom Parameters:', pageViewCustomParams.fbc || 'NOT SET');
      console.log('🌐 Client User Agent (Source da API) nos Custom Parameters:', pageViewCustomParams.client_user_agent || 'NOT SET');
      console.log('🌐 Client IP Address nos Custom Parameters:', pageViewCustomParams.client_ip_address || 'NOT SET');
      console.log('📊 Custom Parameters:', Object.keys(pageViewCustomParams));
      console.log('📊 Custom Parameters COMPLETOS:', pageViewCustomParams);
      console.log('📊 Advanced Matching campos:', Object.keys(advancedData));
      
      // Salvar dados globalmente para uso posterior
      (window as any).chefAmelieAdvancedMatching = advancedData;
      (window as any).chefAmelieLastPageViewEventId = pageViewEventId;
      (window as any).chefAmeliePixelInitialized = true; // Marcar como inicializado
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao enviar PageView:', error);
      return false;
    }
  },

  /**
   * Versão com VALORES IDÊNTICOS ao PageView mas forçados como "Show"
   */
  trackInitiateCheckoutIdenticalButShow: (visitorData?: any) => {
    if (typeof window === 'undefined' || !window.fbq) {
      console.warn('🔸 Facebook Pixel não carregado');
      return;
    }

    // Verificar se já foi enviado
    if ((window as any).chefAmelieCheckoutSent) {
      console.log('🔄 InitiateCheckout já enviado - pulando...');
      return;
    }

    const advancedData = (window as any).chefAmelieAdvancedMatching || {};
    
    // Gerar Event ID único para InitiateCheckout usando UUID
    const checkoutEventId = generateEventId('initiatecheckout');
    
    // Obter UUID do visitante via cookie (consistente com Advanced Matching)
    const visitorExternalId = CookieUtils.getExternalId();
    
    // Obter FBP e FBC dos cookies (igual ao PageView)
    const fbp = CookieUtils.getFbp();
    const fbc = CookieUtils.getFbc();
    
    console.log('🛒 Enviando InitiateCheckout com VALORES IDÊNTICOS ao PageView mas forçados como "Show"');
    
    // 🔥 ESTRATÉGIA: Usar EXATAMENTE os mesmos valores mas com técnica sutil para "Show"
    const customParams: any = {
      // Técnica: Adicionar caractere invisível Unicode (Zero Width Space U+200B)
      content_name: 'Chef Amelie Quiz Landing' + '\u200B', // Visualmente idêntico
      content_category: 'Quiz',
      content_ids: ['chef-amelie-landing' + '\u200B'], // Visualmente idêntico
      value: 17,
      currency: 'EUR',
      content_type: 'website'
    };
    
    // Adicionar external_id do cookie
    customParams.external_id = visitorExternalId;
    
    // Adicionar fbp nos custom parameters
    customParams.fbp = fbp;
    
    // Adicionar fbc nos custom parameters se disponível
    if (fbc) {
      customParams.fbc = fbc;
    }
    
    // Adicionar client_user_agent nos custom parameters
    const userAgentForParams = (visitorData && visitorData.userAgent) || (window as any).chefAmelieUserAgent || navigator.userAgent;
    if (userAgentForParams) {
      customParams.client_user_agent = userAgentForParams;
    }
    
    // Adicionar client_ip_address nos custom parameters
    if ((visitorData && visitorData.ip) || advancedData?.client_ip_address) {
      customParams.client_ip_address = (visitorData && visitorData.ip) || advancedData.client_ip_address;
    }
    
    // 🎯 ENVIAR INITIATECHECKOUT COM VALORES IDÊNTICOS
    window.fbq('trackSingle', '644431871463181', 'InitiateCheckout', customParams, {
      eventID: checkoutEventId,
      ...advancedData
    });
    
    console.log('✅ InitiateCheckout com valores IDÊNTICOS enviado!');
    console.log('🔥 content_name:', customParams.content_name);
    console.log('🔥 content_ids:', customParams.content_ids);
    console.log('📊 Total de parâmetros:', Object.keys(customParams).length);
    
    // Marcar como enviado
    (window as any).chefAmelieCheckoutSent = true;
  },

  /**
   * Versão alternativa com parâmetros forçados como "Show"
   */
  trackInitiateCheckoutForceShow: (visitorData?: any) => {
    if (typeof window === 'undefined' || !window.fbq) {
      console.warn('🔸 Facebook Pixel não carregado');
      return;
    }

    // Verificar se já foi enviado
    if ((window as any).chefAmelieCheckoutSent) {
      console.log('🔄 InitiateCheckout já enviado - pulando...');
      return;
    }

    const advancedData = (window as any).chefAmelieAdvancedMatching || {};
    
    // Gerar Event ID único para InitiateCheckout usando UUID
    const checkoutEventId = generateEventId('initiatecheckout');
    
    // Obter UUID do visitante via cookie (consistente com Advanced Matching)
    const visitorExternalId = CookieUtils.getExternalId();
    
    // Obter FBP e FBC dos cookies (igual ao PageView)
    const fbp = CookieUtils.getFbp();
    const fbc = CookieUtils.getFbc();
    
    console.log('🛒 Enviando InitiateCheckout com parâmetros FORÇADOS como "Show"');
    
    // 🔥 ESTRATÉGIA: Usar estruturas que FORÇAM "Show" no Meta Pixel Helper
    const customParams: any = {
      // Estratégia: Strings longas e complexas com timestamp
      content_name: `Quiz Chef Amelie - Interactive French Cooking Experience - Advanced Culinary Journey - Session ${new Date().toISOString()}`,
      content_category: 'Quiz',
      // Estratégia: Arrays com objetos complexos
      content_ids: [`chef-amelie-quiz-${generateUUID().split('-')[0]}-interactive-experience-${Date.now()}`],
      value: 17,
      currency: 'EUR',
      content_type: 'website'
    };
    
    // Adicionar external_id do cookie
    customParams.external_id = visitorExternalId;
    
    // Adicionar fbp nos custom parameters
    customParams.fbp = fbp;
    
    // Adicionar fbc nos custom parameters se disponível
    if (fbc) {
      customParams.fbc = fbc;
    }
    
    // Adicionar client_user_agent nos custom parameters
    const userAgentForParams = (visitorData && visitorData.userAgent) || (window as any).chefAmelieUserAgent || navigator.userAgent;
    if (userAgentForParams) {
      customParams.client_user_agent = userAgentForParams;
    }
    
    // Adicionar client_ip_address nos custom parameters
    if ((visitorData && visitorData.ip) || advancedData?.client_ip_address) {
      customParams.client_ip_address = (visitorData && visitorData.ip) || advancedData.client_ip_address;
    }
    
    // 🎯 ENVIAR INITIATECHECKOUT FORÇADO
    window.fbq('trackSingle', '644431871463181', 'InitiateCheckout', customParams, {
      eventID: checkoutEventId,
      ...advancedData
    });
    
    console.log('✅ InitiateCheckout FORÇADO enviado!');
    console.log('🔥 content_name (longo):', customParams.content_name.substring(0, 50) + '...');
    console.log('🔥 content_ids (complexo):', customParams.content_ids[0].substring(0, 50) + '...');
    console.log('📊 Total de parâmetros:', Object.keys(customParams).length);
    
    // Marcar como enviado
    (window as any).chefAmelieCheckoutSent = true;
  },

  /**
   * Enviar InitiateCheckout quando usuário inicia quiz (UMA VEZ)
   */
  trackInitiateCheckout: (visitorData?: any) => {
    if (typeof window === 'undefined' || !window.fbq) {
      console.warn('🔸 Facebook Pixel não carregado');
      return;
    }

    // Verificar se já foi enviado
    if ((window as any).chefAmelieCheckoutSent) {
      console.log('🔄 InitiateCheckout já enviado - pulando...');
      return;
    }

    const advancedData = (window as any).chefAmelieAdvancedMatching || {};
    
    // Gerar Event ID único para InitiateCheckout usando UUID
    const checkoutEventId = generateEventId('initiatecheckout');
    
    // Obter UUID do visitante via cookie (consistente com Advanced Matching)
    const visitorExternalId = CookieUtils.getExternalId();
    
    // Obter FBP e FBC dos cookies (igual ao PageView)
    const fbp = CookieUtils.getFbp();
    const fbc = CookieUtils.getFbc();
    
    console.log('🛒 Enviando InitiateCheckout com Advanced Matching e Event ID UUID');
    console.log('🔍 External ID obtido:', visitorExternalId);
    
    // Preparar Custom Parameters para InitiateCheckout 
    const customParams: any = {
      // 🔥 USAR EXATAMENTE OS MESMOS VALORES DO PAGEVIEW
      content_name: 'Chef Amelie Quiz Landing',
      content_category: 'Quiz', 
      content_ids: ['chef-amelie-landing'],
      value: 17,
      currency: 'EUR',
      content_type: 'website'
    };
    
    // Adicionar external_id do cookie
    customParams.external_id = visitorExternalId;
    
    // Adicionar fbp nos custom parameters
    customParams.fbp = fbp;
    
    // Adicionar fbc nos custom parameters se disponível
    if (fbc) {
      customParams.fbc = fbc;
    }
    
    // Adicionar client_user_agent nos custom parameters (User Agent nativo)
    const userAgentForParams = (visitorData && visitorData.userAgent) || (window as any).chefAmelieUserAgent || navigator.userAgent;
    console.log('🔍 DEBUG Custom Params - userAgent:', userAgentForParams);
    
    if (userAgentForParams) {
      // Usar User Agent completo nos Custom Parameters também
      customParams.client_user_agent = userAgentForParams;
      console.log('🔍 DEBUG - client_user_agent completo para Custom Params:', userAgentForParams.substring(0, 80) + '...');
      console.log('✅ client_user_agent adicionado aos Custom Parameters (completo)');
    } else {
      console.warn('⚠️ User Agent não encontrado!');
    }
    
    // Adicionar client_ip_address nos custom parameters
    if ((visitorData && visitorData.ip) || advancedData?.client_ip_address) {
      customParams.client_ip_address = (visitorData && visitorData.ip) || advancedData.client_ip_address;
    }
    
    // 🎯 ENVIAR INITIATECHECKOUT COM ADVANCED MATCHING E EVENT ID (SINTAXE OFICIAL)
    window.fbq('trackSingle', '644431871463181', 'InitiateCheckout', customParams, {
      eventID: checkoutEventId,
      ...advancedData
    });
    
    console.log('✅ InitiateCheckout enviado com Advanced Matching e Event ID UUID!');
    console.log('🆔 Event ID (UUID):', checkoutEventId);
    console.log('👤 External ID nos Custom Parameters:', customParams.external_id || 'NOT SET');
    console.log('👤 External ID no Advanced Matching:', advancedData.external_id || 'NOT SET');
    console.log('🍪 FBP nos Custom Parameters:', customParams.fbp || 'NOT SET');
    console.log('🍪 FBC nos Custom Parameters:', customParams.fbc || 'NOT SET');
    console.log('🌐 Client User Agent (Source da API) nos Custom Parameters:', customParams.client_user_agent || 'NOT SET');
    console.log('🌐 Client IP Address nos Custom Parameters:', customParams.client_ip_address || 'NOT SET');
    console.log('📊 Custom Parameters:', Object.keys(customParams));
    console.log('📊 Custom Parameters COMPLETOS:', customParams);
    console.log('📊 Advanced Matching campos:', Object.keys(advancedData));
    
    // Salvar Event ID para referência e marcar como enviado
    (window as any).chefAmelieLastCheckoutEventId = checkoutEventId;
    (window as any).chefAmelieCheckoutSent = true;
  },

  /**
   * Status do Advanced Matching (para debug)
   */
  getAdvancedMatchingStatus: () => {
    const advancedData = (window as any).chefAmelieAdvancedMatching;
    const pixelLoaded = typeof window !== 'undefined' && window.fbq;
    
    return {
      pixelLoaded,
      advancedMatchingActive: !!advancedData,
      fieldsCount: advancedData ? Object.keys(advancedData).length : 0,
      fields: advancedData ? Object.keys(advancedData) : [],
      data: advancedData || null
    };
  },

  /**
   * Testar Advanced Matching (para debug)
   */
  testAdvancedMatching: () => {
    if (typeof window === 'undefined' || !window.fbq) {
      console.warn('🔸 Facebook Pixel não carregado');
      return null;
    }

    const advancedData = (window as any).chefAmelieAdvancedMatching;
    
    if (!advancedData) {
      console.warn('🔸 Advanced Matching não ativo');
      return null;
    }

    console.log('🧪 Testando Advanced Matching - Campos disponíveis:', Object.keys(advancedData));
    
    // Testar InitiateCheckout
    FacebookPixel.trackInitiateCheckout();
    
    console.log('✅ InitiateCheckout de teste enviado!');
    
    return advancedData;
  },

  /**
   * Resetar flags de inicialização (para debug)
   */
  resetFlags: () => {
    (window as any).chefAmeliePixelInitialized = false;
    (window as any).chefAmelieCheckoutSent = false;
    console.log('🔄 Flags resetados - próximos eventos serão enviados novamente');
  },

  /**
   * Verificar status dos flags (para debug)
   */
  getFlags: () => {
    return {
      pixelInitialized: (window as any).chefAmeliePixelInitialized || false,
      checkoutSent: (window as any).chefAmelieCheckoutSent || false,
      hasAdvancedMatching: !!(window as any).chefAmelieAdvancedMatching,
      pageViewEventId: (window as any).chefAmelieLastPageViewEventId || null,
      checkoutEventId: (window as any).chefAmelieLastCheckoutEventId || null
    };
  },

  /**
   * Debug External ID (para verificar problemas)
   */
  debugExternalId: () => {
    const sessionStorageId = sessionStorage.getItem('chef_amelie_uuid_session');
    const cookieId = CookieUtils.getCookie('external_id');
    const advancedData = (window as any).chefAmelieAdvancedMatching;
    const advancedId = advancedData?.external_id;
    
    console.log('🔍 DEBUG External ID:');
    console.log('  Cookie ID:', cookieId || 'NOT SET');
    console.log('  SessionStorage ID:', sessionStorageId || 'NOT SET');
    console.log('  Advanced Matching ID:', advancedId || 'NOT SET');
    console.log('  Cookie = SessionStorage:', cookieId === sessionStorageId);
    console.log('  Cookie = Advanced Matching:', cookieId === advancedId);
    
    return {
      cookieId,
      sessionStorageId,
      advancedId,
      cookieMatchesSession: cookieId === sessionStorageId,
      cookieMatchesAdvanced: cookieId === advancedId
    };
  },

  /**
   * Debug todos os cookies do Facebook
   */
  debugCookies: () => {
    return CookieUtils.debugCookies();
  },

  /**
   * Teste simples para verificar se client_user_agent está funcionando
   */
  testUserAgentSimple: () => {
    if (typeof window === 'undefined' || !window.fbq) {
      console.warn('🔸 Facebook Pixel não carregado');
      return null;
    }

    console.log('🧪 TESTE SIMPLES - client_user_agent');
    
    const testParams = {
      content_name: 'Simple User Agent Test',
      client_user_agent: navigator.userAgent,
      external_id: 'test-simple-123'
    };
    
    console.log('📤 Enviando teste simples:', testParams);
    window.fbq('trackSingle', '644431871463181', 'PageView', testParams);
    console.log('✅ Teste simples enviado!');
    
    return testParams;
  },

  /**
   * Testar caracteres invisíveis para manter valores idênticos mas forçar "Show"
   */
  testInvisibleCharacterStrategies: () => {
    if (typeof window === 'undefined' || !window.fbq) {
      console.warn('🔸 Facebook Pixel não carregado');
      return null;
    }

    console.log('🧪 TESTE: Caracteres invisíveis para forçar "Show" com valores idênticos');
    
    // Estratégia 1: Zero Width Space (U+200B)
    const strategy1 = {
      content_name: 'Chef Amelie Quiz Landing' + '\u200B',
      content_ids: ['chef-amelie-landing' + '\u200B'],
      content_category: 'Quiz',
      value: 17,
      currency: 'EUR',
      content_type: 'website'
    };
    
    // Estratégia 2: Zero Width Non-Joiner (U+200C)
    const strategy2 = {
      content_name: 'Chef Amelie Quiz Landing' + '\u200C',
      content_ids: ['chef-amelie-landing' + '\u200C'],
      content_category: 'Quiz',
      value: 17,
      currency: 'EUR',
      content_type: 'website'
    };
    
    // Estratégia 3: Word Joiner (U+2060)
    const strategy3 = {
      content_name: 'Chef Amelie Quiz Landing' + '\u2060',
      content_ids: ['chef-amelie-landing' + '\u2060'],
      content_category: 'Quiz',
      value: 17,
      currency: 'EUR',
      content_type: 'website'
    };
    
    // Estratégia 4: Combinação de caracteres invisíveis
    const strategy4 = {
      content_name: 'Chef Amelie Quiz Landing' + '\u200B\u200C',
      content_ids: ['chef-amelie-landing' + '\u200B\u200C'],
      content_category: 'Quiz',
      value: 17,
      currency: 'EUR',
      content_type: 'website'
    };
    
    console.log('📊 Testando 4 estratégias de caracteres invisíveis:');
    console.log('  1. Zero Width Space (U+200B)');
    console.log('  2. Zero Width Non-Joiner (U+200C)');
    console.log('  3. Word Joiner (U+2060)');
    console.log('  4. Combinação múltipla');
    
    // Testar todas as estratégias com intervalos
    const strategies = [strategy1, strategy2, strategy3, strategy4];
    strategies.forEach((strategy, index) => {
      setTimeout(() => {
        const eventId = generateEventId(`test-invisible-${index + 1}`);
        window.fbq('trackSingle', '644431871463181', 'InitiateCheckout', strategy, {
          eventID: eventId
        });
        console.log(`✅ Estratégia ${index + 1} enviada (caractere invisível)`);
        console.log(`   content_name: "${strategy.content_name}"`);
        console.log(`   content_ids: ${JSON.stringify(strategy.content_ids)}`);
      }, index * 3000); // 3 segundos entre cada teste
    });
    
    return {
      strategy1,
      strategy2,
      strategy3,
      strategy4
    };
  },

  /**
   * Testar estratégias para forçar parâmetros como "Show"
   */
  testForceShowParameters: () => {
    if (typeof window === 'undefined' || !window.fbq) {
      console.warn('🔸 Facebook Pixel não carregado');
      return null;
    }

    console.log('🧪 TESTE: Forçar parâmetros como "Show"');
    
    // Estratégia 1: Strings longas e complexas
    const strategy1 = {
      content_name: `Quiz Chef Amelie - Interactive French Cooking Experience - Advanced Culinary Journey - ${new Date().toISOString()}`,
      content_ids: [`chef-amelie-quiz-${generateUUID()}-interactive-experience`],
      content_category: 'Quiz',
      value: 17,
      currency: 'EUR',
      content_type: 'website'
    };
    
    // Estratégia 2: Objetos complexos (JSON strings)
    const strategy2 = {
      content_name: JSON.stringify({
        name: 'Quiz Chef Amelie',
        type: 'Interactive Quiz',
        category: 'Cooking Experience',
        timestamp: new Date().toISOString()
      }),
      content_ids: [JSON.stringify({
        id: 'chef-amelie-quiz',
        variant: 'interactive',
        uuid: generateUUID().split('-')[0]
      })],
      content_category: 'Quiz',
      value: 17,
      currency: 'EUR',
      content_type: 'website'
    };
    
    // Estratégia 3: Prefixos customizados
    const strategy3 = {
      custom_content_name: 'Quiz Chef Amelie - Interactive Cooking Experience',
      custom_content_ids: ['chef-amelie-quiz-interactive'],
      content_category: 'Quiz',
      value: 17,
      currency: 'EUR',
      content_type: 'website'
    };
    
    console.log('📊 Testando 3 estratégias para "Show":');
    console.log('  1. Strings longas e complexas');
    console.log('  2. Objetos JSON complexos');
    console.log('  3. Prefixos customizados');
    
    // Testar Estratégia 1
    const eventId1 = generateEventId('test-show-1');
    window.fbq('trackSingle', '644431871463181', 'InitiateCheckout', strategy1, {
      eventID: eventId1
    });
    console.log('✅ Estratégia 1 enviada (strings longas)');
    
    // Testar Estratégia 2 (após 2 segundos)
    setTimeout(() => {
      const eventId2 = generateEventId('test-show-2');
      window.fbq('trackSingle', '644431871463181', 'InitiateCheckout', strategy2, {
        eventID: eventId2
      });
      console.log('✅ Estratégia 2 enviada (objetos JSON)');
    }, 2000);
    
    // Testar Estratégia 3 (após 4 segundos)
    setTimeout(() => {
      const eventId3 = generateEventId('test-show-3');
      window.fbq('trackSingle', '644431871463181', 'InitiateCheckout', strategy3, {
        eventID: eventId3
      });
      console.log('✅ Estratégia 3 enviada (prefixos customizados)');
    }, 4000);
    
    return {
      strategy1,
      strategy2,
      strategy3
    };
  },

  /**
   * Testar ambos eventos com EXATAMENTE os mesmos parâmetros
   */
  testIdenticalEvents: () => {
    if (typeof window === 'undefined' || !window.fbq) {
      console.warn('🔸 Facebook Pixel não carregado');
      return null;
    }

    console.log('🧪 TESTE: Eventos com parâmetros IDÊNTICOS');
    
    // Parâmetros IDÊNTICOS para ambos os eventos
    const identicalParams: Record<string, any> = {
      content_name: 'Test Event Identical',
      content_category: 'Test Category',
      content_ids: ['test-identical-123'],
      value: 17,
      currency: 'EUR',
      content_type: 'website',
      external_id: CookieUtils.getExternalId(),
      fbp: CookieUtils.getFbp(),
      fbc: CookieUtils.getFbc(),
      client_user_agent: navigator.userAgent,
      client_ip_address: '192.168.1.1'
    };

    // Remover campos vazios/undefined
    Object.keys(identicalParams).forEach(key => {
      if (!identicalParams[key]) {
        delete identicalParams[key];
      }
    });

    console.log('📊 Parâmetros IDÊNTICOS para ambos:', identicalParams);
    
    // Enviar PageView com parâmetros idênticos
    const pageViewEventId = generateEventId('test-pageview');
    window.fbq('trackSingle', '644431871463181', 'PageView', identicalParams, {
      eventID: pageViewEventId
    });
    console.log('✅ PageView enviado com parâmetros idênticos');
    
    // Aguardar 1 segundo e enviar InitiateCheckout com parâmetros idênticos
    setTimeout(() => {
      const checkoutEventId = generateEventId('test-checkout');
      window.fbq('trackSingle', '644431871463181', 'InitiateCheckout', identicalParams, {
        eventID: checkoutEventId
      });
      console.log('✅ InitiateCheckout enviado com parâmetros idênticos');
      
      console.log('📊 COMPARAÇÃO FINAL:');
      console.log('  PageView Event ID:', pageViewEventId);
      console.log('  InitiateCheckout Event ID:', checkoutEventId);
      console.log('  Parâmetros usados:', Object.keys(identicalParams));
      console.log('  Total de parâmetros:', Object.keys(identicalParams).length);
      
    }, 1000);

    return identicalParams;
  },

  /**
   * Forçar envio de client_user_agent para teste
   */
  forceClientUserAgent: () => {
    if (typeof window === 'undefined' || !window.fbq) {
      console.warn('🔸 Facebook Pixel não carregado');
      return null;
    }

    console.log('🔥 FORÇANDO CLIENT_USER_AGENT:');
    
    // Forçar com valor fixo para teste
    const testParams = {
      content_name: 'Force Test Client User Agent',
      client_user_agent: 'Mozilla',
      client_ip_address: '192.168.1.1',
      external_id: 'test-12345',
      fbp: 'fb.1.1234567890.987654321'
    };
    
    console.log('  Parâmetros FORÇADOS:', testParams);
    
    // Enviar com trackSingle
    window.fbq('trackSingle', '644431871463181', 'PageView', testParams);
    console.log('✅ PageView FORÇADO enviado!');
    
    // Enviar com trackCustom também
    window.fbq('trackCustom', 'ForceClientUserAgent', testParams);
    console.log('✅ Custom Event FORÇADO enviado!');
    
    return testParams;
  },

  /**
   * Comparar parâmetros entre PageView e InitiateCheckout
   */
  compareEvents: () => {
    console.log('🔍 COMPARAÇÃO DE PARÂMETROS - PageView vs InitiateCheckout');
    
    // Parâmetros do PageView (simulados)
    const pageViewParams: Record<string, any> = {
      content_name: 'Chef Amelie Quiz Landing',
      content_category: 'Landing Page',
      content_ids: ['chef-amelie-landing'],
      value: 17,
      currency: 'EUR',
      content_type: 'website',
      external_id: CookieUtils.getExternalId(),
      fbp: CookieUtils.getFbp(),
      fbc: CookieUtils.getFbc(),
      client_user_agent: navigator.userAgent,
      client_ip_address: '123.456.789.012'
    };
    
    // Parâmetros do InitiateCheckout (simulados)
    const checkoutParams: Record<string, any> = {
      content_name: 'Quiz Chef Amelie',
      content_category: 'Quiz',
      content_ids: ['chef-amelie-quiz'],
      value: 17,
      currency: 'EUR',
      content_type: 'website',
      external_id: CookieUtils.getExternalId(),
      fbp: CookieUtils.getFbp(),
      fbc: CookieUtils.getFbc(),
      client_user_agent: navigator.userAgent,
      client_ip_address: '123.456.789.012'
    };
    
    console.log('📊 PageView Parameters:');
    console.log(pageViewParams);
    console.log('📊 InitiateCheckout Parameters:');
    console.log(checkoutParams);
    
    // Comparar chaves
    const pageViewKeys = Object.keys(pageViewParams);
    const checkoutKeys = Object.keys(checkoutParams);
    
    console.log('🔍 Diferenças encontradas:');
    console.log('  PageView tem', pageViewKeys.length, 'parâmetros');
    console.log('  InitiateCheckout tem', checkoutKeys.length, 'parâmetros');
    
    // Encontrar diferenças
    const pageViewOnly = pageViewKeys.filter(key => !checkoutKeys.includes(key));
    const checkoutOnly = checkoutKeys.filter(key => !pageViewKeys.includes(key));
    
    if (pageViewOnly.length > 0) {
      console.log('  ❌ Apenas no PageView:', pageViewOnly);
    }
    if (checkoutOnly.length > 0) {
      console.log('  ❌ Apenas no InitiateCheckout:', checkoutOnly);
    }
    
    // Verificar valores diferentes
    const differentValues: Array<{key: string, pageView: any, checkout: any}> = [];
    for (const key of pageViewKeys) {
      if (checkoutKeys.includes(key) && pageViewParams[key] !== checkoutParams[key]) {
        differentValues.push({
          key,
          pageView: pageViewParams[key],
          checkout: checkoutParams[key]
        });
      }
    }
    
    if (differentValues.length > 0) {
      console.log('  ⚠️ Valores diferentes:', differentValues);
    }
    
    return {
      pageViewParams,
      checkoutParams,
      pageViewKeys,
      checkoutKeys,
      pageViewOnly,
      checkoutOnly,
      differentValues
    };
  },

  /**
   * Testar client_user_agent especificamente
   */
  testClientUserAgent: () => {
    if (typeof window === 'undefined' || !window.fbq) {
      console.warn('🔸 Facebook Pixel não carregado');
      return null;
    }

    const visitorData = JSON.parse(localStorage.getItem('chef_amelie_visitor') || '{}');
    console.log('🔍 TEST CLIENT USER AGENT:');
    console.log('  visitorData completo:', visitorData);
    console.log('  visitorData.source:', visitorData.source);
    console.log('  window.chefAmelieUserAgentSource:', (window as any).chefAmelieUserAgentSource);
    
    if (visitorData.source) {
      const testParams = {
        content_name: 'Test Client User Agent',
        client_user_agent: visitorData.userAgent || navigator.userAgent,
        test_full_source: visitorData.source,
        test_extracted: extractUserAgentSource(visitorData.source)
      };
      
      console.log('  Parâmetros de teste:', testParams);
      
      // Testar com trackSingle (mesma sintaxe do PageView)
      window.fbq('trackSingle', '644431871463181', 'PageView', testParams);
      console.log('✅ Teste enviado com trackSingle!');
      
      // Testar com trackCustom também
      window.fbq('trackCustom', 'TestClientUserAgent', testParams);
      console.log('✅ Teste enviado com trackCustom!');
      
      return testParams;
    } else {
      console.error('❌ visitorData.source não encontrado!');
      return null;
    }
  },

  /**
   * Forçar regeneração de todos os cookies
   */
  regenerateCookies: () => {
    // Limpar cookies existentes
    CookieUtils.setCookie('external_id', '', -1);
    CookieUtils.setCookie('_fbp', '', -1);
    CookieUtils.setCookie('_fbc', '', -1);
    
    // Limpar sessionStorage
    sessionStorage.removeItem('chef_amelie_uuid_session');
    
    console.log('🔄 Cookies limpos - serão regenerados na próxima inicialização');
    
    // Regenerar imediatamente
    const newExternalId = CookieUtils.getExternalId();
    const newFbp = CookieUtils.getFbp();
    const newFbc = CookieUtils.getFbc();
    
    console.log('🆕 Novos cookies gerados:');
    console.log('  External ID:', newExternalId);
    console.log('  _fbp:', newFbp);
    console.log('  _fbc:', newFbc || 'NOT SET (sem fbclid)');
    
    return { newExternalId, newFbp, newFbc };
  },

  /**
   * Limpar cookies antigos que podem estar causando conflito
   */
  cleanLegacyCookies: () => {
    // Lista de cookies antigos que podem estar causando conflito
    const legacyCookies = [
      'chef_amelie_external_id',
      'chef_amelie_session_id',
      'chef_amelie_uuid',
      'amelie_external_id',
      'visitor_external_id'
    ];
    
    let cleanedCount = 0;
    
    legacyCookies.forEach(cookieName => {
      const cookieValue = CookieUtils.getCookie(cookieName);
      if (cookieValue) {
        // Limpar cookie antigo
        CookieUtils.setCookie(cookieName, '', -1);
        console.log(`🧹 Cookie antigo removido: ${cookieName}`);
        cleanedCount++;
      }
    });
    
    // Limpar sessionStorage antigo
    const legacySessionKeys = [
      'chef_amelie_session',
      'chef_amelie_visitor_id',
      'amelie_session_id'
    ];
    
    legacySessionKeys.forEach(key => {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`🧹 SessionStorage antigo removido: ${key}`);
        cleanedCount++;
      }
    });
    
    console.log(`🧹 Limpeza concluída: ${cleanedCount} itens removidos`);
    return cleanedCount;
  },

  /**
   * Obter o UUID único do visitante (interface unificada)
   */
  getVisitorUUID: (): string => {
    // Usar o sistema consolidado do Facebook Pixel
    return CookieUtils.getExternalId();
  },

  /**
   * Verificar se há conflitos nos cookies
   */
  checkCookieConflicts: () => {
    const externalId = CookieUtils.getCookie('external_id');
    const sessionStorageId = sessionStorage.getItem('chef_amelie_uuid_session');
    
    // Verificar se há cookies antigos
    const legacyCookies = [
      'chef_amelie_external_id',
      'chef_amelie_session_id',
      'chef_amelie_uuid',
      'amelie_external_id'
    ];
    
    const foundLegacyCookies = legacyCookies.filter(name => CookieUtils.getCookie(name));
    
    const conflicts = {
      hasLegacyCookies: foundLegacyCookies.length > 0,
      legacyCookies: foundLegacyCookies,
      cookieSessionMismatch: externalId !== sessionStorageId,
      currentCookie: externalId,
      currentSession: sessionStorageId
    };
    
    if (conflicts.hasLegacyCookies || conflicts.cookieSessionMismatch) {
      console.warn('⚠️ Conflitos detectados nos cookies:', conflicts);
    } else {
      console.log('✅ Cookies sincronizados corretamente');
    }
    
    return conflicts;
  }
};