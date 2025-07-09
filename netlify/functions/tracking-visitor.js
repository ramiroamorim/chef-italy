const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurações do Facebook CAPI
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;

// Função para salvar visitante no Supabase
async function saveVisitorToSupabase(visitorData) {
  try {
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

    const { data, error } = await supabase
      .from('visitors')
      .insert([dbVisitorData]);

    if (error) {
      console.error('Erro ao salvar visitante no Supabase:', error);
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
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
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
      timestamp: visitorData.timestamp
    });

    // Processar em paralelo
    const promises = [];

    // 1. Salvar no Supabase
    promises.push(saveVisitorToSupabase(visitorData));

    // 2. Enviar para Facebook CAPI
    promises.push(sendEventToFacebookCAPI(visitorData));

    // Aguardar todas as operações
    await Promise.allSettled(promises);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Visitor data processed successfully',
        sessionId: visitorData.external_id,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('❌ Erro ao processar dados do visitante:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || 'Unknown error'
      }),
    };
  }
};