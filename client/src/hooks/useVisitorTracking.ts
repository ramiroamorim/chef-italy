import { useState, useEffect, useCallback } from 'react';
import { LocationData, VisitorData, ApiConfig, ApiResponse } from '@/types/tracking';
import { TEXTS } from '../config';

// Configuração da API - apiip.net
const IP_API_CONFIG: ApiConfig = {
  API_KEY: '087ff054-97df-45e5-891e-4829a3c73650', // Sua chave real do apiip.net
  BASE_URL: 'https://apiip.net/api/check',
  FIELDS: '', // apiip.net retorna todos os campos por padrão
  FORCE_PRO: true
};

export function useVisitorTracking() {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiUsed, setApiUsed] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Gerar Session ID
  const generateSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('chef_amelie_session');
    if (!sessionId) {
      sessionId = 'amelie_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
      sessionStorage.setItem('chef_amelie_session', sessionId);
    }
    return sessionId;
  }, []);

  // Coletar dados básicos do navegador
  const collectBasicData = useCallback((): Partial<VisitorData> => {
    return {
      sessionId: sessionId,
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
      utm_term: getUTMParameter('utm_term')
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
      
      // apiip.net tem estrutura diferente de resposta
      if (data && data.ip) {
        return {
          ip: data.ip,
          continent: data.continentName,
          continentCode: data.continentCode,
          country: data.countryName,
          countryCode: data.countryCode2,
          region: data.regionName,
          regionName: data.regionName,
          city: data.cityName,
          district: data.district,
          zip: data.zipCode,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timeZone?.name,
          offset: data.timeZone?.offset,
          currency: data.currency?.code,
          isp: data.isp,
          org: data.org,
          as: data.as,
          asname: data.asname,
          mobile: data.mobile,
          proxy: data.proxy,
          hosting: data.hosting,
          api_source: 'apiip-net',
          api_key_used: true,
          timestamp: new Date().toISOString()
        };
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
        return {
          ip: data.query,
          country: data.country,
          countryCode: data.countryCode,
          regionName: data.regionName,
          city: data.city,
          zip: data.zip,
          latitude: data.lat,
          longitude: data.lon,
          timezone: data.timezone,
          isp: data.isp,
          mobile: data.mobile,
          proxy: data.proxy,
          hosting: data.hosting,
          api_source: 'ip-api-free-fallback',
          api_key_used: false,
          timestamp: new Date().toISOString()
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
      // Preparar dados para envio
      const webhookData = {
        event_type: 'visitor_tracking',
        timestamp: new Date().toISOString(),
        external_id: data.sessionId, // CHAVE PARA MATCH COM HOTMART
        visitor_data: {
          ip: data.ip,
          country: data.country,
          country_code: data.countryCode,
          region: data.regionName,
          city: data.city,
          zip: data.zip,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          currency: data.currency,
          isp: data.isp,
          mobile: data.mobile,
          proxy: data.proxy,
          hosting: data.hosting,
          api_source: data.api_source
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
          country: data.countryCode?.toLowerCase(),
          st: data.regionName,
          ct: data.city,
          zp: data.zip,
          client_ip_address: data.ip,
          client_user_agent: data.userAgent
        }
      };

      // Verificar se webhook está habilitada
      if (!TEXTS.WEBHOOK.ENABLED) {
        console.log('🔕 Webhook desabilitada - apenas salvando localmente');
        
        // Apenas armazenar dados localmente
        const fbData = {
          external_id: data.sessionId,
          country: data.countryCode?.toLowerCase(),
          st: data.regionName,
          ct: data.city,
          zp: data.zip
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
        st: data.regionName,
        ct: data.city,
        zp: data.zip
      };
      (window as any).chefAmelieFBData = fbData;
      
    } catch (error) {
      console.error('❌ Erro detalhado ao enviar webhook:', error);
    }
  }, []);

  // Inicializar tracking
  const initTracking = useCallback(async () => {
    console.log('🍳 Chef Amélie - Iniciando tracking PRO...');
    setIsLoading(true);

    const newSessionId = generateSessionId();
    setSessionId(newSessionId);

    // Coletar dados básicos imediatamente
    const basicData = collectBasicData();

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

  // Track de eventos customizados (apenas registra, não envia automaticamente)
  const trackEvent = useCallback((eventName: string, eventData?: any) => {
    if (visitorData) {
      console.log(`📊 Evento registrado: ${eventName}`, {
        ...eventData,
        session_id: visitorData.sessionId,
        visitor_country: visitorData.country,
        visitor_city: visitorData.city
      });
      // Facebook Pixel pode ser usado manualmente quando necessário
      // FacebookPixel.trackCustomEvent(eventName, eventData);
    }
  }, [visitorData]);

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