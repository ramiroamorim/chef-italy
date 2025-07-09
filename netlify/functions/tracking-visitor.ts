import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    
    // Log dos dados recebidos
    console.log('Visitor data received:', visitorData);
    
    // Aqui você pode adicionar a lógica para:
    // 1. Salvar no Supabase
    // 2. Enviar para Facebook CAPI
    // 3. Processar webhooks do Hotmart
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Visitor data received successfully' 
      }),
    };
  } catch (error) {
    console.error('Error processing visitor data:', error);
    
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