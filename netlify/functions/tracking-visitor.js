const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase - usando variáveis de ambiente do Netlify
const supabaseUrl = process.env.SUPABASE_URL || 'https://gjqlmfyomxwfbfpqecqq.supabase.co';
// Usar service role key que tem mais permissões para operações do servidor
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcWxtZnlvbXh3ZmJmcHFlY3FxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY1MzAzOCwiZXhwIjoyMDY0MjI5MDM4fQ.pC8dIxYJWq4Qh7wyfEnkbDRNVR5SDTIbpvrBdeXgWHk';

// Configurações do Facebook CAPI - usando variáveis de ambiente do Netlify
// Nota: Este token pode estar expirado, precisa ser renovado no Facebook Business Manager
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
      keyType: supabaseKey.includes('service_role') ? 'service_role' : 'anon',
      sessionId: visitorData.external_id,
      hasSupabaseClient: !!supabase
    });

    if (!supabase) {
      console.log('⚠️ Supabase client não inicializado - salvando apenas localmente');
      return { success: false, message: 'Supabase client not initialized' };
    }

    const dbVisitorData = {
      session_id: visitorData.external_id,
      external_id: visitorData.external_id,
      fbp: visitorData.facebook_pixel?.fbp || visitorData.capi_data?.fbp,
      fbc: visitorData.facebook_pixel?.fbc || visitorData.capi_data?.fbc,
      ip: visitorData.visitor_data?.ip,
      country: visitorData.visitor_data?.country,
      country_code: visitorData.visitor_data?.country_code,
      city: visitorData.visitor_data?.city,
      region_name: visitorData.visitor_data?.region,
      state: visitorData.visitor_data?.region || visitorData.visitor_data?.state,
      zip: visitorData.visitor_data?.zip,
      postal_code: visitorData.visitor_data?.zip || visitorData.visitor_data?.postal_code,
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
      unix_timestamp: visitorData.unix_timestamp || Math.floor(Date.now() / 1000)
      // Não incluir timestamp - usar created_at/updated_at automáticos
    };

    console.log('📝 Dados para salvar:', JSON.stringify(dbVisitorData, null, 2));

    // Primeiro tentar verificar se a tabela existe
    const { data: tableInfo, error: tableError } = await supabase
      .from('visitors')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao verificar tabela visitors:', tableError);
      
      // Se for erro de API key, retornar erro mas não falhar toda a função
      if (tableError.message.includes('Invalid API key')) {
        console.log('⚠️ Supabase API key inválida - precisa ser renovada no dashboard do Supabase');
        return { success: false, message: 'Supabase API key invalid', error: tableError };
      }
      
      throw tableError;
    }

    // Tentar salvar os dados
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
      
      // Se for erro de API key, retornar erro mas não falhar toda a função
      if (error.message.includes('Invalid API key')) {
        console.log('⚠️ Supabase API key inválida - precisa ser renovada no dashboard do Supabase');
        return { success: false, message: 'Supabase API key invalid', error: error };
      }
      
      throw error;
    }

    console.log('✅ Visitante salvo no Supabase:', dbVisitorData.session_id);
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ Erro ao salvar no Supabase:', error);
    
    // Se é um erro de API key, retornar erro mas não falhar toda a função
    if (error.message && error.message.includes('Invalid API key')) {
      console.log('⚠️ Supabase API key inválida ou expirada - continuando sem Supabase');
      return { success: false, message: 'Supabase API key invalid or expired', error: error.message };
    }
    
    throw error;
  }
}

// Função para enviar evento para Facebook CAPI
async function sendEventToFacebookCAPI(visitorData) {
  try {
    console.log('🔍 Tentando enviar para Facebook CAPI...', {
      pixelId: FACEBOOK_PIXEL_ID,
      hasToken: !!FACEBOOK_ACCESS_TOKEN,
      tokenLength: FACEBOOK_ACCESS_TOKEN ? FACEBOOK_ACCESS_TOKEN.length : 0,
      sessionId: visitorData.external_id
    });

    if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_PIXEL_ID) {
      console.log('⚠️ Facebook CAPI desabilitado - credenciais não configuradas');
      return { success: false, message: 'Facebook CAPI credentials not configured' };
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
      
      // Se o token expirou, retornar erro mas não falhar toda a função
      if (result.error?.code === 190) {
        console.log('⚠️ Facebook access token expirado - precisa ser renovado no Facebook Business Manager');
        return { success: false, message: 'Facebook access token expired', error: result.error };
      }
      
      throw new Error(`Facebook CAPI error: ${result.error?.message || 'Unknown error'}`);
    }

    console.log('✅ Evento enviado para Facebook CAPI:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar para Facebook CAPI:', error);
    
    // Se é um erro de token expirado, retornar erro mas não falhar toda a função
    if (error.message.includes('access token') || error.message.includes('decrypted')) {
      console.log('⚠️ Facebook access token inválido ou expirado - continuando sem Facebook CAPI');
      return { success: false, message: 'Facebook access token invalid or expired', error: error.message };
    }
    
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

    // Processar resultados para melhor logging
    const supabaseResult = results[0].status === 'fulfilled' ? results[0].value : results[0].reason;
    const facebookResult = results[1].status === 'fulfilled' ? results[1].value : results[1].reason;

    console.log('📊 Resultados do processamento:', {
      supabase: {
        status: results[0].status,
        success: supabaseResult?.success !== false,
        error: supabaseResult?.message || (results[0].status === 'rejected' ? results[0].reason?.message : null)
      },
      facebook: {
        status: results[1].status,
        success: facebookResult?.success !== false,
        error: facebookResult?.message || (results[1].status === 'rejected' ? results[1].reason?.message : null)
      }
    });

    // Determinar se houve sucessos parciais
    const supabaseSuccess = results[0].status === 'fulfilled' && supabaseResult?.success !== false;
    const facebookSuccess = results[1].status === 'fulfilled' && facebookResult?.success !== false;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Visitor data processed successfully',
        sessionId: visitorData.external_id,
        timestamp: new Date().toISOString(),
        results: {
          supabase: {
            status: results[0].status,
            success: supabaseSuccess,
            message: supabaseResult?.message || (supabaseSuccess ? 'Success' : 'Failed')
          },
          facebook: {
            status: results[1].status,
            success: facebookSuccess,
            message: facebookResult?.message || (facebookSuccess ? 'Success' : 'Failed')
          }
        },
        warnings: [
          !supabaseSuccess ? 'Supabase integration failed - check API keys' : null,
          !facebookSuccess ? 'Facebook CAPI integration failed - check access token' : null
        ].filter(Boolean)
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