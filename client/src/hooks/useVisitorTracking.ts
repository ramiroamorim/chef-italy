import { useState, useEffect, useCallback } from 'react';
import { LocationData, VisitorData, ApiConfig, ApiResponse } from '@/types/tracking';
import { TEXTS } from '../config';
import { FacebookPixel } from '@/lib/fbPixel';

// Configuração da API - apiip.net
const IP_API_CONFIG: ApiConfig = {
  API_KEY: import.meta.env.VITE_APIIP_NET_API_KEY || '087ff054-97df-45e5-891e-4829a3c73650', // Sua chave real do apiip.net
  BASE_URL: 'https://apiip.net/api/check',
  FIELDS: '', // apiip.net retorna todos os campos por padrão
  FORCE_PRO: true
};

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
 * Gerar UUID v4 para identificação única de leads/visitantes
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

export function useVisitorTracking() {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiUsed, setApiUsed] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Gerar UUID único para cada visitante/lead (usando sistema unificado do Facebook Pixel)
  const generateSessionId = useCallback(() => {
    // Primeira execução: limpar cookies antigos que podem estar causando conflito
    try {
      FacebookPixel.cleanLegacyCookies();
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cookies antigos:', error);
    }
    
    // Verificar conflitos antes de prosseguir
    let conflicts;
    try {
      conflicts = FacebookPixel.checkCookieConflicts();
    } catch (error) {
      console.warn('⚠️ Erro ao verificar conflitos:', error);
    }
    
    // Usar o sistema unificado do Facebook Pixel
    let sessionId: string | null = null;
    
    try {
      // Usar interface unificada do Facebook Pixel
      sessionId = FacebookPixel.getVisitorUUID();
      console.log('🍪 UUID obtido do sistema unificado:', sessionId);
    } catch (error) {
      console.warn('⚠️ Erro ao acessar sistema unificado, usando fallback:', error);
      
      // Fallback usando getCookie diretamente
      const getCookie = (name: string): string | null => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
      };
      
      sessionId = getCookie('external_id');
      
      if (!sessionId) {
        // Gerar novo UUID para este visitante/lead
        sessionId = generateUUID();
        console.log('🆔 Novo UUID gerado para visitante/lead (fallback):', sessionId);
        
        // Salvar no cookie usando o mesmo padrão do Facebook Pixel
        const setCookie = (name: string, value: string, days: number = 365) => {
          const expires = new Date();
          expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
          document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
        };
        
        setCookie('external_id', sessionId, 365);
      } else {
        console.log('🍪 UUID do cookie encontrado (fallback):', sessionId);
      }
    }
    
    // Sempre sincronizar com sessionStorage
    if (sessionId) {
      sessionStorage.setItem('chef_amelie_uuid_session', sessionId);
    }
    
    return sessionId || generateUUID();
  }, []);

  // Coletar dados básicos do navegador
  const collectBasicData = useCallback((sessionIdParam?: string): Partial<VisitorData> => {
    // Usar sessionId passado como parâmetro ou o do state
    const currentSessionId = sessionIdParam || sessionId;
    
    // Garantir que temos fbp sempre
    let fbpValue: string | undefined;
    let fbcValue: string | undefined;
    try {
      fbpValue = FacebookPixel.CookieUtils.getFbp();
      console.log('🍪 FBP capturado no collectBasicData:', fbpValue);
      
      // Tentar capturar fbc também
      fbcValue = FacebookPixel.CookieUtils.getFbc?.() || undefined;
      console.log('🍪 FBC capturado no collectBasicData:', fbcValue);
    } catch (error) {
      console.warn('⚠️ Erro ao capturar FBP/FBC:', error);
    }
    
    const currentTimestamp = new Date();
    
    return {
      sessionId: currentSessionId,
      fbp: fbpValue, // Garantir que fbp seja sempre incluído
      fbc: fbcValue, // Facebook Click ID
      external_id: currentSessionId, // Garantir que external_id seja igual ao sessionId
      pageUrl: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      pageLoadTime: performance.timing ? 
        performance.timing.loadEventEnd - performance.timing.navigationStart : undefined,
      site: 'chef-amelie-dupont',
      quiz_visitor: true,
      utm_source: getUTMParameter('utm_source'),
      utm_medium: getUTMParameter('utm_medium'),
      utm_campaign: getUTMParameter('utm_campaign'),
      utm_content: getUTMParameter('utm_content'),
      utm_term: getUTMParameter('utm_term'),
      unix_timestamp: Math.floor(currentTimestamp.getTime() / 1000) // Unix timestamp para CAPI
    };
  }, [sessionId]);

  // Extrair parâmetros UTM
  const getUTMParameter = useCallback((param: string): string | undefined => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || undefined;
  }, []);

  // Chamada para API Pro de geolocalização - apiip.net
  const getLocationDataPro = useCallback(async (): Promise<LocationData | null> => {
    try {
      // Sintaxe correta do apiip.net
      const url = `${IP_API_CONFIG.BASE_URL}?accessKey=${IP_API_CONFIG.API_KEY}`;
      
      console.log('🔑 Usando apiip.net:', url.replace(IP_API_CONFIG.API_KEY, 'HIDDEN_KEY'));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ChefAmelieTracker/1.0'
        }
      });

      console.log('📡 Status da resposta:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Resposta da apiip.net:', data);
      console.log('🔍 DEBUG - Campo source na API:', data.source);
      console.log('🔍 DEBUG - Todos os campos da API:', Object.keys(data));
      
      // apiip.net tem estrutura diferente de resposta
      if (data && data.ip) {
        const currentTimestamp = new Date();
        const locationData = {
          ip: data.ip,
          continent: data.continentName,
          continentCode: data.continentCode,
          country: data.countryName,
          countryCode: data.countryCode, // CORRIGIDO: era countryCode2
          region: data.regionName,
          regionName: data.regionName,
          state: data.regionName || data.region, // Estado/Província
          city: data.city, // CORRIGIDO: era cityName
          district: data.district,
          zip: data.postalCode, // CORRIGIDO: era zipCode
          postalCode: data.postalCode, // Campo adicional para compatibilidade
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timeZone?.id, // CORRIGIDO: era name
          offset: data.timeZone?.utcOffset, // CORRIGIDO: era offset
          currency: data.currency?.code,
          isp: data.connection?.isp, // CORRIGIDO: ISP está em connection
          org: data.connection?.descr, // CORRIGIDO: organizacao está em connection.descr
          as: data.connection?.asn, // CORRIGIDO: ASN está em connection
          asname: data.connection?.descr, // CORRIGIDO: mesmo que org
          mobile: data.userAgent?.isMobile, // CORRIGIDO: mobile está em userAgent
          source: data.source || data.user_agent || navigator.userAgent, // User Agent da API ou fallback
          proxy: data.proxy, // Este pode não existir
          hosting: data.hosting, // Este pode não existir
          api_source: 'apiip-net',
          api_key_used: true,
          timestamp: currentTimestamp.toISOString(),
          unix_timestamp: Math.floor(currentTimestamp.getTime() / 1000) // Unix timestamp para CAPI
        };
        
        console.log('🔍 DEBUG - LocationData mapeado:', locationData);
        console.log('🔍 DEBUG - source no locationData:', locationData.source);
        console.log('🔍 DEBUG - data.source da API:', data.source);
        console.log('🔍 DEBUG - data.user_agent da API:', data.user_agent);
        console.log('🔍 DEBUG - navigator.userAgent:', navigator.userAgent);
        console.log('🔍 DEBUG - extractUserAgentSource result:', extractUserAgentSource(locationData.source));
        return locationData;
      } else {
        console.error('❌ apiip.net retornou dados inválidos:', data);
        throw new Error(data?.message || 'Resposta inválida da API');
      }
      
    } catch (error) {
      console.error('❌ Erro detalhado na apiip.net:', error);
      console.error('🔍 Verificar:', {
        apiKey: IP_API_CONFIG.API_KEY.substring(0, 8) + '...',
        url: IP_API_CONFIG.BASE_URL,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }, []);

  // Fallback para API gratuita (ip-api.com)
  const getFallbackLocationData = useCallback(async (): Promise<LocationData | null> => {
    if (IP_API_CONFIG.FORCE_PRO) {
      console.log('🚫 Fallback desabilitado - apenas apiip.net');
      return null;
    }
    
    try {
      console.log('🔄 Usando fallback (ip-api.com gratuito)...');
      
      const response = await fetch('http://ip-api.com/json/?lang=fr');
      const data = await response.json();
      
      if (data.status === 'success') {
        const currentTimestamp = new Date();
        return {
          ip: data.query,
          country: data.country,
          countryCode: data.countryCode,
          regionName: data.regionName,
          state: data.regionName || data.region, // Estado/Província
          city: data.city,
          zip: data.zip,
          postalCode: data.zip, // Campo adicional para compatibilidade
          latitude: data.lat,
          longitude: data.lon,
          timezone: data.timezone,
          isp: data.isp,
          mobile: data.mobile,
          source: navigator.userAgent, // Usar User Agent do navegador como fallback
          proxy: data.proxy,
          hosting: data.hosting,
          api_source: 'ip-api-free-fallback',
          api_key_used: false,
          timestamp: currentTimestamp.toISOString(),
          unix_timestamp: Math.floor(currentTimestamp.getTime() / 1000) // Unix timestamp para CAPI
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro no fallback:', error);
      return null;
    }
  }, []);

  // Salvar dados no localStorage
  const saveVisitorData = useCallback((data: VisitorData) => {
    try {
      localStorage.setItem('chef_amelie_visitor', JSON.stringify(data));
      
      // Histórico de visitas
      const history = JSON.parse(localStorage.getItem('chef_amelie_history') || '[]');
      history.push({
        timestamp: data.timestamp,
        sessionId: data.sessionId,
        ip: data.ip,
        city: data.city,
        country: data.country,
        api_used: apiUsed,
        page: data.pageUrl
      });
      
      // Manter apenas últimas 20 visitas
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      
      localStorage.setItem('chef_amelie_history', JSON.stringify(history));
      
      console.log('💾 Dados salvos - API usada:', apiUsed);
      
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
    }
  }, [apiUsed]);

  // Enviar dados para webhook da plataforma de vendas
  const sendToWebhook = useCallback(async (data: VisitorData) => {
    try {
      // 🎯 ATIVAR FACEBOOK PIXEL COM ADVANCED MATCHING
      console.log('🔥 Iniciando Facebook Pixel com Advanced Matching...');
      const pixelSuccess = await FacebookPixel.initWithAdvancedMatching(data);
      
      if (pixelSuccess) {
        console.log('✅ Facebook Pixel Advanced Matching configurado com sucesso!');
      } else {
        console.warn('⚠️ Facebook Pixel Advanced Matching falhou, mas continuando...');
      }
      
      // Preparar dados para envio
      const webhookData = {
        event_type: 'visitor_tracking',
        timestamp: new Date().toISOString(),
        external_id: data.sessionId, // CHAVE PARA MATCH COM HOTMART
        visitor_data: {
          ip: data.ip,
          country: data.country,
          country_code: data.countryCode,
          state: data.state || data.regionName, // Estado/Província
          region: data.regionName,
          city: data.city,
          zip: data.zip,
          postal_code: data.postalCode || data.zip, // Código postal alternativo
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          currency: data.currency,
          isp: data.isp,
          mobile: data.mobile,
          proxy: data.proxy,
          hosting: data.hosting,
          api_source: data.api_source,
          unix_timestamp: data.unix_timestamp || Math.floor(Date.now() / 1000)
        },
        page_data: {
          url: data.pageUrl,
          title: data.pageTitle,
          referrer: data.referrer,
          user_agent: data.userAgent,
          language: data.language,
          platform: data.platform,
          screen_resolution: data.screenResolution,
          window_size: data.windowSize
        },
        marketing_data: {
          utm_source: data.utm_source,
          utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign,
          utm_content: data.utm_content,
          utm_term: data.utm_term
        },
        capi_data: {
          // Dados formatados para CAPI
          external_id: data.sessionId,
          fbp: data.fbp, // Incluir fbp nos dados CAPI
          fbc: data.fbc, // Incluir fbc nos dados CAPI
          country: data.countryCode?.toLowerCase(),
          st: data.state || data.regionName, // Estado/Província
          ct: data.city,
          zp: data.zip || data.postalCode, // CEP/Código postal
          client_ip_address: data.ip,
          client_user_agent: data.userAgent,
          unix_timestamp: data.unix_timestamp || Math.floor(Date.now() / 1000) // Unix timestamp para CAPI
        },
        facebook_pixel: {
          // Status do Advanced Matching e dados do Facebook
          advanced_matching_success: pixelSuccess,
          fields_sent: pixelSuccess ? Object.keys((window as any).chefAmelieAdvancedMatching || {}).length : 0,
          fbp: data.fbp, // Incluir fbp também nos dados do Facebook Pixel
          fbc: data.fbc, // Incluir fbc também nos dados do Facebook Pixel
          external_id: data.external_id || data.sessionId, // Incluir external_id
          unix_timestamp: data.unix_timestamp || Math.floor(Date.now() / 1000) // Unix timestamp para CAPI
        }
      };

      // Verificar se webhook está habilitada
      if (!TEXTS.WEBHOOK.ENABLED) {
        console.log('🔕 Webhook desabilitada - apenas salvando localmente');
        
        // Apenas armazenar dados localmente
        const fbData = {
          external_id: data.sessionId,
          country: data.countryCode?.toLowerCase(),
          st: data.state || data.regionName, // Estado/Província
          ct: data.city,
          zp: data.zip || data.postalCode, // CEP/Código postal
          fbp: data.fbp,
          fbc: data.fbc,
          client_ip_address: data.ip,
          client_user_agent: data.userAgent,
          unix_timestamp: data.unix_timestamp || Math.floor(Date.now() / 1000)
        };
        (window as any).chefAmelieFBData = fbData;
        return;
      }

      console.log('📤 Enviando dados para nosso servidor:', webhookData);

      // Enviar para nosso servidor local
      const response = await fetch(TEXTS.WEBHOOK.URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        const result = await response.text();
        console.log('✅ Dados enviados com sucesso para webhook:', result);
      } else {
        console.error('❌ Erro ao enviar para webhook:', response.status, response.statusText);
      }

      // Também armazenar dados localmente para backup
      const fbData = {
        external_id: data.sessionId,
        country: data.countryCode?.toLowerCase(),
        st: data.state || data.regionName, // Estado/Província
        ct: data.city,
        zp: data.zip || data.postalCode, // CEP/Código postal
        fbp: data.fbp,
        fbc: data.fbc,
        client_ip_address: data.ip,
        client_user_agent: data.userAgent,
        unix_timestamp: data.unix_timestamp || Math.floor(Date.now() / 1000) // Unix timestamp para CAPI
      };
      (window as any).chefAmelieFBData = fbData;
      
    } catch (error) {
      console.error('❌ Erro detalhado ao enviar webhook:', error);
    }
  }, []);

  // Track de eventos customizados (removido - apenas logging local)
  const trackEvent = useCallback((eventName: string, eventData?: any) => {
    if (visitorData) {
      console.log(`📊 Evento registrado: ${eventName}`, {
        ...eventData,
        session_id: visitorData.sessionId,
        visitor_country: visitorData.country,
        visitor_city: visitorData.city
      });
    }
  }, [visitorData]);

  // Inicializar tracking
  const initTracking = useCallback(async () => {
    console.log('🍳 Chef Amélie - Iniciando tracking PRO...');
    setIsLoading(true);

    const newSessionId = generateSessionId();
    setSessionId(newSessionId);

    // Coletar dados básicos imediatamente, passando o sessionId
    const basicData = collectBasicData(newSessionId);
    
    console.log('🔍 DEBUG - BasicData com sessionId:', {
      sessionId: basicData.sessionId,
      external_id: basicData.external_id,
      fbp: basicData.fbp
    });

    // Tentar obter dados de localização
    setTimeout(async () => {
      console.log('📍 Tentando apiip.net primeiro...');
      
      const locationData = await getLocationDataPro();
      let finalApiUsed = 'apiip-net';
      
      if (!locationData) {
        console.error('❌ apiip.net falhou - tentando fallback');
        const fallbackData = await getFallbackLocationData();
        finalApiUsed = 'ip-api-free-fallback';
        
        if (fallbackData) {
          const fullData: VisitorData = {
            ...basicData,
            ...fallbackData,
            api_used: finalApiUsed,
            api_key_valid: fallbackData.api_key_used || false
          } as VisitorData;
          
          console.log('🔍 DEBUG FALLBACK - FullData criado:', fullData);
          console.log('🔍 DEBUG FALLBACK - source no fullData:', fullData.source);
          
          setApiUsed(finalApiUsed);
          setVisitorData(fullData);
          saveVisitorData(fullData);
          await sendToWebhook(fullData);
          
          console.log('⚠️ Dados obtidos via API gratuita (fallback)');
        }
      } else {
        const fullData: VisitorData = {
          ...basicData,
          ...locationData,
          api_used: finalApiUsed,
          api_key_valid: locationData.api_key_used || false
        } as VisitorData;
        
        console.log('🔍 DEBUG - FullData criado:', fullData);
        console.log('🔍 DEBUG - source no fullData:', fullData.source);
        
        setApiUsed(finalApiUsed);
        setVisitorData(fullData);
        saveVisitorData(fullData);
        await sendToWebhook(fullData);
        
        console.log('✅ Sucesso com apiip.net!', fullData);
        console.log('💰 API utilizada:', finalApiUsed);
      }

      setIsLoading(false);
    }, 1000); // Reduzido de 3000ms para 1000ms
  }, [generateSessionId, collectBasicData, getLocationDataPro, getFallbackLocationData, saveVisitorData, sendToWebhook]);

  // Inicializar quando o componente monta
  useEffect(() => {
    initTracking();
  }, [initTracking]);

  return {
    visitorData,
    isLoading,
    apiUsed,
    sessionId,
    trackEvent,
    refreshTracking: initTracking
  };
} 