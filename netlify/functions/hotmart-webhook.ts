import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurações do Facebook CAPI
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN!;
const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID!;

// Função para salvar webhook no Supabase
async function saveWebhookToSupabase(webhookData: any) {
  try {
    const { data, error } = await supabase
      .from('hotmart_webhooks')
      .insert([{
        event_type: webhookData.event,
        transaction_id: webhookData.data?.transaction,
        product_id: webhookData.data?.product?.id,
        product_name: webhookData.data?.product?.name,
        buyer_email: webhookData.data?.buyer?.email,
        buyer_name: webhookData.data?.buyer?.name,
        buyer_country: webhookData.data?.buyer?.address?.country,
        buyer_city: webhookData.data?.buyer?.address?.city,
        purchase_value: webhookData.data?.purchase?.price?.value,
        purchase_currency: webhookData.data?.purchase?.price?.currency_code,
        purchase_date: webhookData.data?.purchase?.approved_date,
        raw_data: webhookData,
        timestamp: new Date().toISOString()
      }]);

    if (error) {
      console.error('Erro ao salvar webhook no Supabase:', error);
      throw error;
    }

    console.log('✅ Webhook salvo no Supabase:', webhookData.data?.transaction);
    return data;
  } catch (error) {
    console.error('❌ Erro ao salvar webhook no Supabase:', error);
    throw error;
  }
}

// Função para enviar evento de compra para Facebook CAPI
async function sendPurchaseEventToFacebookCAPI(webhookData: any) {
  try {
    const eventData = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(new Date(webhookData.data?.purchase?.approved_date).getTime() / 1000),
          event_id: webhookData.data?.transaction,
          user_data: {
            email: webhookData.data?.buyer?.email,
            first_name: webhookData.data?.buyer?.name?.split(' ')[0],
            last_name: webhookData.data?.buyer?.name?.split(' ').slice(1).join(' '),
            country: webhookData.data?.buyer?.address?.country,
            city: webhookData.data?.buyer?.address?.city,
            state: webhookData.data?.buyer?.address?.state,
            zip_code: webhookData.data?.buyer?.address?.zip_code
          },
          custom_data: {
            currency: webhookData.data?.purchase?.price?.currency_code || 'EUR',
            value: webhookData.data?.purchase?.price?.value || 0,
            product_id: webhookData.data?.product?.id,
            product_name: webhookData.data?.product?.name,
            transaction_id: webhookData.data?.transaction
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
      console.error('❌ Erro ao enviar compra para Facebook CAPI:', result);
      throw new Error(`Facebook CAPI error: ${result.error?.message || 'Unknown error'}`);
    }

    console.log('✅ Evento de compra enviado para Facebook CAPI:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar compra para Facebook CAPI:', error);
    throw error;
  }
}

export const handler: Handler = async (event, context) => {
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
    const webhookData = JSON.parse(event.body || '{}');
    
    console.log('🛒 Webhook do Hotmart recebido:', {
      event: webhookData.event,
      transaction: webhookData.data?.transaction,
      product: webhookData.data?.product?.name,
      buyer: webhookData.data?.buyer?.email,
      value: webhookData.data?.purchase?.price?.value,
      timestamp: webhookData.data?.purchase?.approved_date
    });

    // Processar apenas eventos de compra aprovada
    if (webhookData.event === 'PURCHASE_APPROVED') {
      // Processar em paralelo
      const promises = [];

      // 1. Salvar no Supabase
      promises.push(saveWebhookToSupabase(webhookData));

      // 2. Enviar para Facebook CAPI
      promises.push(sendPurchaseEventToFacebookCAPI(webhookData));

      // Aguardar todas as operações
      await Promise.allSettled(promises);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Purchase webhook processed successfully',
          transaction: webhookData.data?.transaction,
          timestamp: new Date().toISOString()
        }),
      };
    } else {
      // Apenas salvar outros tipos de webhook
      await saveWebhookToSupabase(webhookData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Webhook received and stored',
          event: webhookData.event,
          timestamp: new Date().toISOString()
        }),
      };
    }
  } catch (error) {
    console.error('❌ Erro ao processar webhook do Hotmart:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};