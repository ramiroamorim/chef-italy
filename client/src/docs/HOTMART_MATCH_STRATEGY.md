# 🎯 Estratégia de Match Hotmart (Sem Querystring)

## 📋 Visão Geral

Sistema para fazer match entre dados de tracking e vendas da Hotmart **SEM** passar parâmetros na URL de checkout, usando credenciais da API e múltiplos critérios.

## 🔑 Credenciais Necessárias da Hotmart

### 1. **Token de API**
- Acesso à API REST da Hotmart
- Consultar vendas realizadas
- Obter dados completos do comprador

### 2. **Webhook Secret**
- Validar webhooks recebidos
- Garantir segurança dos dados

### 3. **Client ID + Secret**
- Autenticação OAuth
- Renovação automática de tokens

## 🧩 Métodos de Match (por prioridade)

### **Método 1: Timestamp + Geolocalização** ⭐⭐⭐
```javascript
function matchByTimeAndLocation(saleData, visitorData) {
  const saleTime = new Date(saleData.purchase_date);
  const visitorTime = new Date(visitorData.timestamp);
  
  // Diferença máxima de 45 minutos
  const timeDiff = Math.abs(saleTime - visitorTime);
  const maxDiff = 45 * 60 * 1000;
  
  if (timeDiff <= maxDiff) {
    // Verificar localização se disponível
    const locationMatch = (
      saleData.buyer_country === visitorData.countryCode ||
      saleData.buyer_city === visitorData.city
    );
    
    return {
      match: true,
      confidence: locationMatch ? 95 : 80,
      method: 'time-location'
    };
  }
  
  return { match: false };
}
```

### **Método 2: Behavioral Fingerprint** ⭐⭐
```javascript
function matchByBehavior(saleData, visitorData) {
  // Criar "impressão digital" do comportamento
  const fingerprint = {
    userAgent: visitorData.userAgent,
    screenResolution: visitorData.screenResolution,
    timezone: visitorData.timezone,
    language: visitorData.language
  };
  
  // Score baseado em similaridades
  let score = 0;
  if (saleData.device_info?.user_agent === fingerprint.userAgent) score += 40;
  if (saleData.device_info?.screen === fingerprint.screenResolution) score += 30;
  if (saleData.timezone === fingerprint.timezone) score += 20;
  if (saleData.language === fingerprint.language) score += 10;
  
  return {
    match: score >= 60,
    confidence: score,
    method: 'behavioral'
  };
}
```

### **Método 3: IP + User Agent** ⭐⭐
```javascript
function matchByTechnicalData(saleData, visitorData) {
  const ipMatch = saleData.buyer_ip === visitorData.ip;
  const uaMatch = saleData.user_agent === visitorData.userAgent;
  
  if (ipMatch && uaMatch) {
    return { match: true, confidence: 90, method: 'ip-ua' };
  } else if (ipMatch) {
    return { match: true, confidence: 70, method: 'ip-only' };
  }
  
  return { match: false };
}
```

### **Método 4: UTM Reconstruction** ⭐
```javascript
function matchByUTMPattern(saleData, visitorData) {
  // Se Hotmart mantém UTMs originais
  const utmMatch = (
    saleData.utm_source === visitorData.utm_source &&
    saleData.utm_campaign === visitorData.utm_campaign
  );
  
  const timeMatch = Math.abs(
    new Date(saleData.purchase_date) - new Date(visitorData.timestamp)
  ) <= 60 * 60 * 1000; // 1 hora
  
  return {
    match: utmMatch && timeMatch,
    confidence: utmMatch ? 85 : 50,
    method: 'utm-pattern'
  };
}
```

## 🔄 Fluxo Completo de Match

### **1. Coleta de Dados (Nossa Webhook)**
```javascript
// Salvar dados detalhados do visitante
function saveVisitorData(trackingData) {
  const visitorRecord = {
    session_id: trackingData.sessionId,
    timestamp: trackingData.timestamp,
    ip: trackingData.ip,
    country: trackingData.country,
    city: trackingData.city,
    user_agent: trackingData.userAgent,
    screen_resolution: trackingData.screenResolution,
    timezone: trackingData.timezone,
    language: trackingData.language,
    utm_data: trackingData.marketing_data,
    behavior_fingerprint: createFingerprint(trackingData)
  };
  
  // Salvar no banco de dados com TTL de 7 dias
  saveToDatabase('visitors', visitorRecord, 7 * 24 * 60 * 60);
}
```

### **2. Recebimento da Venda (Webhook Hotmart)**
```javascript
async function handleHotmartSale(saleData) {
  console.log('💰 Nova venda recebida:', saleData);
  
  // Buscar visitantes nas últimas 24 horas
  const recentVisitors = await getVisitorsInTimeRange(
    Date.now() - 24 * 60 * 60 * 1000,
    Date.now()
  );
  
  // Tentar match com cada método
  let bestMatch = null;
  let bestConfidence = 0;
  
  for (const visitor of recentVisitors) {
    const methods = [
      matchByTimeAndLocation,
      matchByBehavior, 
      matchByTechnicalData,
      matchByUTMPattern
    ];
    
    for (const method of methods) {
      const result = method(saleData, visitor);
      if (result.match && result.confidence > bestConfidence) {
        bestMatch = { visitor, sale: saleData, ...result };
        bestConfidence = result.confidence;
      }
    }
  }
  
  if (bestMatch && bestConfidence >= 70) {
    console.log(`✅ Match encontrado! Confiança: ${bestConfidence}%`);
    await sendToCAPI(bestMatch);
  } else {
    console.log('❌ Nenhum match encontrado');
  }
}
```

### **3. Envio para Facebook CAPI**
```javascript
async function sendToCAPI(matchData) {
  const capiPayload = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(new Date(matchData.sale.purchase_date).getTime() / 1000),
      user_data: {
        // Dados do visitante (mais precisos)
        client_ip_address: matchData.visitor.ip,
        client_user_agent: matchData.visitor.user_agent,
        // Dados da venda
        em: hashEmail(matchData.sale.buyer_email),
        ph: hashPhone(matchData.sale.buyer_phone),
        country: matchData.visitor.country?.toLowerCase(),
        ct: matchData.visitor.city,
        st: matchData.visitor.region
      },
      custom_data: {
        currency: matchData.sale.currency,
        value: matchData.sale.price,
        content_ids: [matchData.sale.product_id]
      }
    }]
  };
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FB_ACCESS_TOKEN}`
    },
    body: JSON.stringify(capiPayload)
  });
  
  console.log('📊 Enviado para Facebook CAPI:', response.status);
}
```

## 🚀 API da Hotmart - Consulta de Vendas

### **Autenticação**
```javascript
async function getHotmartToken() {
  const response = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(CLIENT_ID + ':' + CLIENT_SECRET)}`
    },
    body: JSON.stringify({
      grant_type: 'client_credentials'
    })
  });
  
  const data = await response.json();
  return data.access_token;
}
```

### **Consultar Vendas Recentes**
```javascript
async function getRecentSales() {
  const token = await getHotmartToken();
  
  const response = await fetch('https://developers.hotmart.com/payments/api/v1/sales', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const sales = await response.json();
  
  // Processar cada venda para match
  sales.items.forEach(sale => {
    handleHotmartSale(sale);
  });
}
```

## 📊 Vantagens desta Abordagem

### ✅ **Pros:**
- **Sem poluição da URL** - checkout limpo
- **Match inteligente** - múltiplos critérios
- **Alta precisão** - 70-95% de confiança
- **Retroativo** - pode processar vendas passadas
- **Flexível** - adicionar novos métodos facilmente

### ⚠️ **Considerações:**
- **Janela de tempo** - visitor e sale devem estar próximos
- **Múltiplos dispositivos** - usuário pode usar celular para ver e PC para comprar
- **VPN/Proxy** - pode afetar match por IP
- **Dados incompletos** - Hotmart pode não enviar todos os campos

## 🎯 Configuração Recomendada

1. **Webhook ativa** para capturar visitantes
2. **Webhook Hotmart** configurada para receber vendas
3. **API da Hotmart** para buscar vendas retroativas
4. **Sistema de score** para escolher melhor match
5. **Logs detalhados** para monitoramento 