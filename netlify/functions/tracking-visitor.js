const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase - usando variáveis de ambiente do Netlify
const supabaseUrl = process.env.SUPABASE_URL || 'https://gjqlmfyomxwfbfpqecqq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcWxtZnlvbXh3ZmJmcHFlY3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTMwMzgsImV4cCI6MjA2NDIyOTAzOH0.5HVG2LrFX-wl60K8ItFWIyO1RKAl_Cxs1d2USX_z1bU';

// Configurações do Facebook CAPI - usando variáveis de ambiente do Netlify
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || 'EAASsZARGMYwQBO7xs0TgXDK6g9LxuofBwdZCvuKsWVxbFy0TZCDaiwjuf335OXHRTCMfJFcUUQ1WyE31cCOQl6dAd53gdG6XZBXwMBkRO7u11sUaZCi8d0JZBTExZATtAe7eiJ3chxONU9kVYysAZBMVET3G3Ypy1y1JjsAZC3bAobWpjZBQblc4ptmUhCTDgZAM5IE9AZDZD';
const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || '644431871463181';

// Inicializar Supabase client
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Supabase client:', error);
}

// Função para salvar visitante no Supabase
async function saveVisitorToSupabase(visitorData) {
  try {
    console.log('🔍 Tentando salvar no Supabase...', {
      url: supabaseUrl,
      hasKey: !!supabaseKey,
      sessionId: visitorData.external_id,
      hasSupabaseClient: !!supabase
    });

    if (!supabase) {
      throw new Error('Supabase client não foi inicializado');
    }

    const dbVisitorData = {
      session_id: visitorData.external_id,
      external_id: visitorData.external_id,
      fbp: visitorData.facebook_pixel?.fbp || visitorData.capi_data?.fbp,
      ip: visitorData.visitor_data?.ip,
      country: visitorData.visitor_data?.country,
      country_code: visitorData.visitor_data?.country_code,
      city: visitorData.visitor_data?.city,
      region_name: visitorData.visitor_data?.region,
      zip: visitorData.visitor_data?.zip,
      latitude: visitorData.visitor_data?.latitude,
      longitude: visitorData.visitor_data?.longitude,
      timezone: visitorData.visitor_data?.timezone,
      currency: visitorData.visitor_data?.currency,
      isp: visitorData.visitor_data?.isp,
      user_agent: visitorData.page_data?.user_agent,
      page_url: visitorData.page_data?.url,
      referrer: visitorData.page_data?.referrer,
      utm_source: visitorData.marketing_data?.utm_source,
      utm_medium: visitorData.marketing_data?.utm_medium,
      utm_campaign: visitorData.marketing_data?.utm_campaign,
      utm_content: visitorData.marketing_data?.utm_content,
      utm_term: visitorData.marketing_data?.utm_term,
      timestamp: visitorData.timestamp || new Date().toISOString()
    };

    console.log('📝 Dados para salvar:', JSON.stringify(dbVisitorData, null, 2));

    // Usar upsert para evitar erros de duplicação
    const { data, error } = await supabase
      .from('visitors')
      .upsert([dbVisitorData], {
        onConflict: 'session_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('❌ Erro ao salvar visitante no Supabase:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('✅ Visitante salvo no Supabase:', dbVisitorData.session_id);
    return data;
  } catch (error) {
    console.error('❌ Erro ao salvar no Supabase:', error);
    throw error;
  }
}

// Função para enviar evento para Facebook CAPI
async function sendEventToFacebookCAPI(visitorData) {
  try {
    console.log('🔍 Tentando enviar para Facebook CAPI...', {
      pixelId: FACEBOOK_PIXEL_ID,
      hasToken: !!FACEBOOK_ACCESS_TOKEN,
      sessionId: visitorData.external_id
    });

    if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_PIXEL_ID) {
      throw new Error('Facebook access token ou pixel ID não configurado');
    }

    const eventData = {
      data: [
        {
          event_name: 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          event_id: visitorData.external_id,
          event_source_url: visitorData.page_data?.url,
          user_data: {
            external_id: visitorData.external_id,
            fbp: visitorData.facebook_pixel?.fbp || visitorData.capi_data?.fbp,
            client_ip_address: visitorData.visitor_data?.ip,
            client_user_agent: visitorData.page_data?.user_agent,
            country: visitorData.visitor_data?.country_code,
            city: visitorData.visitor_data?.city,
            state: visitorData.visitor_data?.region,
            zip_code: visitorData.visitor_data?.zip
          },
          custom_data: {
            utm_source: visitorData.marketing_data?.utm_source,
            utm_medium: visitorData.marketing_data?.utm_medium,
            utm_campaign: visitorData.marketing_data?.utm_campaign,
            utm_content: visitorData.marketing_data?.utm_content,
            utm_term: visitorData.marketing_data?.utm_term
          }
        }
      ],
      test_event_code: process.env.NODE_ENV === 'development' ? 'TEST12345' : undefined
    };

    console.log('📝 Dados para Facebook CAPI:', JSON.stringify(eventData, null, 2));

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FACEBOOK_ACCESS_TOKEN}`
        },
        body: JSON.stringify(eventData)
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro ao enviar para Facebook CAPI:', result);
      console.error('❌ Status da resposta:', response.status);
      console.error('❌ Headers da resposta:', response.headers);
      throw new Error(`Facebook CAPI error: ${result.error?.message || 'Unknown error'}`);
    }

    console.log('✅ Evento enviado para Facebook CAPI:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar para Facebook CAPI:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  // Log inicial com informações da função
  console.log('🚀 Netlify Function iniciada:', {
    method: event.httpMethod,
    path: event.path,
    hasBody: !!event.body,
    bodyLength: event.body ? event.body.length : 0,
    headers: event.headers,
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      hasFacebookToken: !!process.env.FACEBOOK_ACCESS_TOKEN,
      hasFacebookPixel: !!process.env.FACEBOOK_PIXEL_ID,
      nodeEnv: process.env.NODE_ENV
    }
  });

  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ Preflight request handled');
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    if (!event.body) {
      throw new Error('Request body is required');
    }

    const visitorData = JSON.parse(event.body);
    
    console.log('👤 Novo visitante recebido:', {
      sessionId: visitorData.external_id,
      city: visitorData.visitor_data?.city,
      country: visitorData.visitor_data?.country,
      timestamp: visitorData.timestamp,
      hasRequiredData: {
        external_id: !!visitorData.external_id,
        visitor_data: !!visitorData.visitor_data,
        page_data: !!visitorData.page_data,
        marketing_data: !!visitorData.marketing_data
      }
    });

    // Validar dados básicos
    if (!visitorData.external_id) {
      throw new Error('external_id é obrigatório');
    }

    // Processar em paralelo
    const results = await Promise.allSettled([
      saveVisitorToSupabase(visitorData),
      sendEventToFacebookCAPI(visitorData)
    ]);

    console.log('📊 Resultados do processamento:', {
      supabase: results[0].status,
      facebook: results[1].status,
      supabaseError: results[0].status === 'rejected' ? results[0].reason?.message : null,
      facebookError: results[1].status === 'rejected' ? results[1].reason?.message : null
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Visitor data processed successfully',
        sessionId: visitorData.external_id,
        timestamp: new Date().toISOString(),
        results: {
          supabase: results[0].status,
          facebook: results[1].status
        }
      }),
    };
  } catch (error) {
    console.error('❌ Erro ao processar dados do visitante:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};