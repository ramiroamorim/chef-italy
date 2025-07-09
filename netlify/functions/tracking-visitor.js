const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://gjqlmfyomxwfbfpqecqq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcWxtZnlvbXh3ZmJmcHFlY3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTMwMzgsImV4cCI6MjA2NDIyOTAzOH0.5HVG2LrFX-wl60K8ItFWIyO1RKAl_Cxs1d2USX_z1bU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurações do Facebook CAPI
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || 'EAASsZARGMYwQBO7xs0TgXDK6g9LxuofBwdZCvuKsWVxbFy0TZCDaiwjuf335OXHRTCMfJFcUUQ1WyE31cCOQl6dAd53gdG6XZBXwMBkRO7u11sUaZCi8d0JZBTExZATtAe7eiJ3chxONU9kVYysAZBMVET3G3Ypy1y1JjsAZC3bAobWpjZBQblc4ptmUhCTDgZAM5IE9AZDZD';
const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || '644431871463181';

// Função para salvar visitante no Supabase
async function saveVisitorToSupabase(visitorData) {
  try {
    console.log('🔍 Tentando salvar no Supabase...', {
      url: supabaseUrl,
      hasKey: !!supabaseKey,
      sessionId: visitorData.external_id
    });

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

    const { data, error } = await supabase
      .from('visitors')
      .insert([dbVisitorData]);

    if (error) {
      console.error('❌ Erro ao salvar visitante no Supabase:', error);
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
  console.log('🚀 Função iniciada:', {
    method: event.httpMethod,
    headers: event.headers,
    hasBody: !!event.body
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
    const visitorData = JSON.parse(event.body || '{}');
    
    console.log('👤 Novo visitante recebido:', {
      sessionId: visitorData.external_id,
      city: visitorData.visitor_data?.city,
      country: visitorData.visitor_data?.country,
      timestamp: visitorData.timestamp,
      rawData: JSON.stringify(visitorData, null, 2)
    });

    // Processar em paralelo
    const results = await Promise.allSettled([
      saveVisitorToSupabase(visitorData),
      sendEventToFacebookCAPI(visitorData)
    ]);

    console.log('📊 Resultados do processamento:', {
      supabase: results[0].status,
      facebook: results[1].status,
      supabaseError: results[0].status === 'rejected' ? results[0].reason : null,
      facebookError: results[1].status === 'rejected' ? results[1].reason : null
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
        stack: error.stack
      }),
    };
  }
};