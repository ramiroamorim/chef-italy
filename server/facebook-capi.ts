/**
 * 📱 Facebook Conversions API (CAPI) Integration
 * Sistema para enviar eventos diretamente para o Facebook via servidor
 */

import * as crypto from 'crypto';

// Configuração dinâmica do Facebook CAPI (avaliada em tempo real)
function getFacebookCAPIConfig() {
  return {
    PIXEL_ID: process.env.FACEBOOK_PIXEL_ID || '1053618620169381', // Configurar no .env
    ACCESS_TOKEN: process.env.FACEBOOK_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE', // Configurar no .env
    API_VERSION: 'v21.0',
    BASE_URL: 'https://graph.facebook.com'
  };
}

// Debug: Log da configuração inicial
console.log('🔧 CAPI: Configuração inicial:', {
  hasAccessToken: !!process.env.FACEBOOK_ACCESS_TOKEN,
  tokenLength: process.env.FACEBOOK_ACCESS_TOKEN?.length || 0,
  tokenStart: process.env.FACEBOOK_ACCESS_TOKEN?.substring(0, 10) || 'NONE',
  isValid: process.env.FACEBOOK_ACCESS_TOKEN !== 'YOUR_ACCESS_TOKEN_HERE'
});

// Armazenar logs de envios
const capiLogs: any[] = [];
const MAX_LOGS = 100;

// Interface para dados do evento CAPI
interface CAPIEventData {
  event_name: string;
  event_time: number;
  event_id?: string;
  user_data: {
    external_id?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    em?: string; // email hash
    ph?: string; // phone hash
    country?: string;
    st?: string; // state
    ct?: string; // city
    zp?: string; // zip
    fbp?: string; // facebook browser id
    fbc?: string; // facebook click id
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_name?: string;
    content_category?: string;
    content_type?: string;
  };
  action_source: 'website';
}

/**
 * Hash de dados usando SHA256
 */
function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Preparar dados do usuário com hash
 */
function prepareUserData(rawData: any): any {
  const userData: any = {};
  
  // External ID (UUID do visitante)
  if (rawData.external_id) {
    userData.external_id = rawData.external_id;
  }
  
  // IP e User Agent (não hasheados)
  if (rawData.client_ip_address) {
    userData.client_ip_address = rawData.client_ip_address;
  }
  
  if (rawData.client_user_agent) {
    userData.client_user_agent = rawData.client_user_agent;
  }
  
  // Dados de localização (hasheados conforme exigido pelo Facebook)
  if (rawData.country) {
    userData.country = hashData(rawData.country.toLowerCase());
  }
  
  if (rawData.st) {
    userData.st = hashData(rawData.st.toLowerCase());
  }
  
  if (rawData.ct) {
    userData.ct = hashData(rawData.ct.toLowerCase());
  }
  
  if (rawData.zp) {
    userData.zp = hashData(rawData.zp.replace(/[^0-9]/g, ''));
  }
  
  // Facebook IDs
  if (rawData.fbp) {
    userData.fbp = rawData.fbp;
  }
  
  if (rawData.fbc) {
    userData.fbc = rawData.fbc;
  }
  
  // Email e telefone (hasheados)
  if (rawData.email) {
    userData.em = hashData(rawData.email);
  }
  
  if (rawData.phone) {
    userData.ph = hashData(rawData.phone);
  }
  
  return userData;
}

/**
 * Enviar evento para Facebook CAPI
 */
export async function sendEventToCAPI(eventData: Partial<CAPIEventData>): Promise<{
  success: boolean;
  response?: any;
  error?: string;
  logId: string;
}> {
  const logId = `capi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  const config = getFacebookCAPIConfig();
  
  // Validar configuração
  if (!config.ACCESS_TOKEN || config.ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
    const logEntry = {
      logId,
      timestamp,
      status: 'error',
      error: 'Facebook Access Token não configurado',
      eventData: eventData
    };
    
    capiLogs.push(logEntry);
    console.error('❌ CAPI: Access Token não configurado!');
    
    return {
      success: false,
      error: 'Access Token não configurado',
      logId
    };
  }
  
  try {
    // Preparar dados do evento
    const capiEvent: CAPIEventData = {
      event_name: eventData.event_name || 'PageView',
      event_time: eventData.event_time || Math.floor(Date.now() / 1000),
      event_id: eventData.event_id,
      user_data: prepareUserData(eventData.user_data || {}),
      custom_data: eventData.custom_data || {},
      action_source: 'website'
    };
    
    // URL da API
    const url = `${config.BASE_URL}/${config.API_VERSION}/${config.PIXEL_ID}/events`;
    
    // Payload para Facebook
    const payload = {
      data: [capiEvent],
      test_event_code: process.env.NODE_ENV === 'development' ? 
        (process.env.FACEBOOK_TEST_EVENT_CODE || 'TEST12345') : undefined
    };
    
    console.log('📱 CAPI: Enviando evento para Facebook:', {
      event_name: capiEvent.event_name,
      user_data_fields: Object.keys(capiEvent.user_data),
      custom_data_fields: Object.keys(capiEvent.custom_data || {}),
      url: url.replace(config.ACCESS_TOKEN, 'HIDDEN'),
      test_mode: !!payload.test_event_code
    });
    
    // Enviar para Facebook
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    // Log do resultado
    const logEntry = {
      logId,
      timestamp,
      status: response.ok ? 'success' : 'error',
      eventData: capiEvent,
      payload,
      response: responseData,
      statusCode: response.status,
      url: url.replace(config.ACCESS_TOKEN, 'HIDDEN')
    };
    
    capiLogs.push(logEntry);
    
    // Manter apenas últimos logs
    if (capiLogs.length > MAX_LOGS) {
      capiLogs.splice(0, capiLogs.length - MAX_LOGS);
    }
    
    if (response.ok) {
      console.log('✅ CAPI: Evento enviado com sucesso!', {
        events_received: responseData.events_received,
        fbtrace_id: responseData.fbtrace_id
      });
      
      return {
        success: true,
        response: responseData,
        logId
      };
    } else {
      console.error('❌ CAPI: Erro ao enviar evento:', {
        status: response.status,
        error: responseData
      });
      
      return {
        success: false,
        error: responseData.error?.message || 'Erro desconhecido',
        logId
      };
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    const logEntry = {
      logId,
      timestamp,
      status: 'error',
      error: errorMessage,
      eventData
    };
    
    capiLogs.push(logEntry);
    
    console.error('❌ CAPI: Erro na requisição:', error);
    
    return {
      success: false,
      error: errorMessage,
      logId
    };
  }
}

/**
 * Testar conexão com Facebook CAPI
 */
export async function testCAPIConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Enviar evento de teste
    const testEvent = await sendEventToCAPI({
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        external_id: 'test-user-' + Date.now(),
        client_ip_address: '127.0.0.1',
        client_user_agent: 'Mozilla/5.0 (Test) Chrome/100.0.0.0',
        country: 'br',
        ct: 'sao paulo',
        st: 'sp',
        zp: '01000'
      },
      custom_data: {
        content_name: 'CAPI Test Event',
        currency: 'BRL',
        value: 1.00
      }
    });
    
    return {
      success: testEvent.success,
      message: testEvent.success ? 'Conexão CAPI funcionando!' : 'Erro na conexão CAPI',
      details: testEvent
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao testar CAPI',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Obter logs de envios CAPI
 */
export function getCAPILogs(limit: number = 20): any[] {
  return capiLogs.slice(-limit).reverse(); // Mais recentes primeiro
}

/**
 * Obter estatísticas CAPI
 */
export function getCAPIStats(): {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: string;
  lastEventTime: string | null;
  configStatus: {
    accessTokenConfigured: boolean;
    pixelId: string;
    apiVersion: string;
  };
} {
  const config = getFacebookCAPIConfig();
  const totalEvents = capiLogs.length;
  const successfulEvents = capiLogs.filter(log => log.status === 'success').length;
  const failedEvents = totalEvents - successfulEvents;
  const successRate = totalEvents > 0 ? ((successfulEvents / totalEvents) * 100).toFixed(1) + '%' : '0%';
  const lastEventTime = capiLogs.length > 0 ? capiLogs[capiLogs.length - 1].timestamp : null;
  
  return {
    totalEvents,
    successfulEvents,
    failedEvents,
    successRate,
    lastEventTime,
    configStatus: {
      accessTokenConfigured: config.ACCESS_TOKEN !== 'YOUR_ACCESS_TOKEN_HERE' && !!config.ACCESS_TOKEN,
      pixelId: config.PIXEL_ID,
      apiVersion: config.API_VERSION
    }
  };
}

/**
 * Enviar eventos coletados do frontend para CAPI
 */
export async function forwardFrontendEventToCAPI(frontendEventData: any): Promise<any> {
  try {
    // Extrair dados do evento do frontend
    const { customParameters, originalData, formattedData, eventType, eventId, sessionId } = frontendEventData;
    
    // Preparar dados para CAPI
    const capiEventData = {
      event_name: eventType, // 'PageView' ou 'InitiateCheckout'
      event_time: frontendEventData.unix_timestamp || Math.floor(new Date(frontendEventData.timestamp).getTime() / 1000),
      event_id: eventId,
      user_data: {
        external_id: sessionId,
        client_ip_address: customParameters.client_ip_address,
        client_user_agent: customParameters.client_user_agent,
        fbp: customParameters.fbp,
        fbc: customParameters.fbc,
        // Usar dados formatados para Facebook
        country: formattedData?.country,
        st: formattedData?.state,
        ct: formattedData?.city,
        zp: formattedData?.zip
      },
      custom_data: {
        content_name: customParameters.content_name?.replace(/[\u200B-\u200D\uFEFF\u180E\u17B5\u2060\u061C]/g, ''), // Remover caracteres invisíveis
        content_category: customParameters.content_category?.replace(/[\u200B-\u200D\uFEFF\u180E\u17B5\u2060\u061C]/g, ''),
        content_type: customParameters.content_type?.replace(/[\u200B-\u200D\uFEFF\u180E\u17B5\u2060\u061C]/g, ''),
        currency: customParameters.currency,
        value: customParameters.value
      }
    };
    
    console.log('🔄 CAPI: Encaminhando evento do frontend:', {
      eventType,
      sessionId,
      hasFormattedData: !!formattedData,
      formattedData
    });
    
    // Enviar para CAPI
    return await sendEventToCAPI(capiEventData);
    
  } catch (error) {
    console.error('❌ CAPI: Erro ao encaminhar evento do frontend:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      logId: 'forward_error_' + Date.now()
    };
  }
}