# 🔗 Integração Webhook - Sistema de Match de Dados

## 📋 Visão Geral

Sistema para conectar dados de tracking de visitantes com dados de vendas da Hotmart via webhook, permitindo match perfeito para envio via Facebook CAPI (Conversions API).

## 🔄 Fluxo de Dados

### 1. Tracking de Visitante
```
Usuário entra no site → Coleta dados → Envia para webhook
```

### 2. Venda na Hotmart
```
Usuário compra → Hotmart envia dados → Webhook recebe
```

### 3. Match dos Dados
```
Sistema faz match via external_id → Combina dados → Envia via CAPI
```

## 📤 Estrutura dos Dados Enviados

### Webhook URL
```
https://projeto01-n8n.easypanel.host/webhook/ArthurAPI
```

### Método: POST

### Estrutura JSON:
```json
{
  "event_type": "visitor_tracking",
  "timestamp": "2025-01-24T10:30:00.000Z",
  "external_id": "chef_1737714600000_abc123", // CHAVE PARA MATCH
  "visitor_data": {
    "ip": "192.168.1.1",
    "country": "Brazil",
    "country_code": "BR",
    "region": "São Paulo",
    "city": "São Paulo",
    "zip": "01000-000",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "timezone": "America/Sao_Paulo",
    "currency": "BRL",
    "isp": "Net Virtua",
    "mobile": false,
    "proxy": false,
    "hosting": false,
    "api_source": "apiip-net"
  },
  "page_data": {
    "url": "https://seusite.com",
    "title": "Chef Amelie - 500 Receitas",
    "referrer": "https://google.com",
    "user_agent": "Mozilla/5.0...",
    "language": "pt-BR",
    "platform": "desktop",
    "screen_resolution": "1920x1080",
    "window_size": "1200x800"
  },
  "marketing_data": {
    "utm_source": "facebook",
    "utm_medium": "cpc",
    "utm_campaign": "receitas",
    "utm_content": "banner1",
    "utm_term": "receitas sem gluten"
  },
  "capi_data": {
    // Dados já formatados para Facebook CAPI
    "external_id": "chef_1737714600000_abc123",
    "country": "br",
    "st": "São Paulo",
    "ct": "São Paulo",
    "zp": "01000-000",
    "client_ip_address": "192.168.1.1",
    "client_user_agent": "Mozilla/5.0..."
  }
}
```

## 🎯 Chave de Match: external_id

O `external_id` é gerado com o formato:
```
chef_{timestamp}_{random}
```

**Exemplo:** `chef_1737714600000_abc123`

Este ID único permite fazer o match perfeito entre:
- ✅ Dados de tracking (quando usuário entra no site)
- ✅ Dados de venda (quando usuário compra na Hotmart)

## 🔧 Como Usar os Dados

### 1. Receber no Webhook
```javascript
// Sua webhook recebe os dados de tracking
app.post('/webhook/ArthurAPI', (req, res) => {
  const trackingData = req.body;
  
  // Salvar dados de tracking
  saveTrackingData(trackingData);
  
  res.json({ success: true });
});
```

### 2. Match com Dados da Hotmart
```javascript
// Quando receber dados de venda da Hotmart
function matchTrackingWithSale(saleData) {
  const external_id = saleData.external_id; // Vem da Hotmart
  
  // Buscar dados de tracking correspondente
  const trackingData = findTrackingData(external_id);
  
  if (trackingData) {
    // MATCH PERFEITO! Combinar dados
    const combinedData = {
      ...trackingData.capi_data,
      purchase_value: saleData.purchase_value,
      currency: saleData.currency,
      product_id: saleData.product_id
    };
    
    // Enviar para Facebook CAPI
    sendToFacebookCAPI(combinedData);
  }
}
```

### 3. Envio para Facebook CAPI
```javascript
function sendToFacebookCAPI(data) {
  const capiPayload = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        external_id: data.external_id,
        country: data.country,
        st: data.st,
        ct: data.ct,
        zp: data.zp,
        client_ip_address: data.client_ip_address,
        client_user_agent: data.client_user_agent
      },
      custom_data: {
        currency: data.currency,
        value: data.purchase_value
      }
    }]
  };
  
  // Enviar para Facebook Conversions API
  fetch(`https://graph.facebook.com/${FB_PIXEL_ID}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FB_ACCESS_TOKEN}`
    },
    body: JSON.stringify(capiPayload)
  });
}
```

## 🚀 Configuração Atual

- ✅ Webhook configurada: `https://projeto01-n8n.easypanel.host/webhook/ArthurAPI`
- ✅ Método: POST
- ✅ Headers: `Content-Type: application/json`
- ✅ Timeout: 10 segundos
- ✅ Retry: Automático em caso de falha
- ✅ API de geolocalização: apiip.net (chave configurada)

## 📊 Monitoramento

### Logs no Console:
```
📤 Enviando dados para webhook: {...}
✅ Dados enviados com sucesso para webhook
❌ Erro ao enviar para webhook: 500 Internal Server Error
```

### Debug no Desenvolvimento:
- Botão roxo no canto inferior direito
- Mostra todos os dados coletados
- Histórico das últimas 20 visitas

## 🔒 Segurança

- ✅ Dados sensíveis não são logados
- ✅ IPs são hasheados quando necessário
- ✅ Tokens e chaves não aparecem no frontend
- ✅ HTTPS obrigatório para webhook

## ⚡ Performance

- ✅ Envio assíncrono (não bloqueia página)
- ✅ Timeout configurado
- ✅ Fallback em caso de erro
- ✅ Cache local como backup 