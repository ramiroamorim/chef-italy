# Database Collections

Esta pasta contém os dados coletados pelo sistema de tracking.

## Estrutura

### `/collections/visitors.json`
Armazena dados completos dos visitantes coletados pela API de geolocalização.

### `/collections/facebook_events.json`
Armazena todos os eventos enviados para o Facebook Pixel com dados hasheados em SHA256.

## Schema dos Dados

### Visitor Data
```json
{
  "sessionId": "UUID único do visitante",
  "ip": "IP address",
  "country": "País",
  "countryCode": "Código do país",
  "city": "Cidade",
  "regionName": "Estado/Região",
  "zip": "CEP/Código postal",
  "latitude": "Latitude",
  "longitude": "Longitude",
  "timezone": "Timezone",
  "currency": "Moeda",
  "isp": "Provedor de internet",
  "userAgent": "User agent completo",
  "pageUrl": "URL da página",
  "referrer": "Referrer",
  "utm_source": "UTM source",
  "utm_medium": "UTM medium", 
  "utm_campaign": "UTM campaign",
  "timestamp": "Data/hora ISO"
}
```

### Facebook Event Data
```json
{
  "eventType": "PageView | InitiateCheckout",
  "eventId": "UUID único do evento",
  "sessionId": "UUID do visitante",
  "customParameters": {
    "zp": "SHA256 hash do CEP formatado",
    "ct": "SHA256 hash da cidade formatada",
    "st": "SHA256 hash do estado formatado",
    "country": "SHA256 hash do país formatado",
    "client_ip_address": "IP address",
    "client_user_agent": "User agent",
    "external_id": "UUID do visitante",
    "fbp": "Facebook Browser ID",
    "fbc": "Facebook Click ID (se disponível)"
  },
  "originalData": {
    "zip": "CEP original (08550-000)",
    "city": "Cidade original (Poá)", 
    "state": "Estado original (São Paulo)",
    "country": "País original (Brazil)"
  },
  "formattedData": {
    "zip": "CEP formatado para Facebook (08550)",
    "city": "Cidade formatada para Facebook (poa)",
    "state": "Estado formatado para Facebook (sp)",
    "country": "País formatado para Facebook (br)"
  },
  "timestamp": "Data/hora ISO"
}
```

## Formatação para Facebook

Os dados são formatados conforme a documentação do Facebook antes de serem hasheados:

- **Country**: Código ISO lowercase (BR → br)
- **State**: Sigla do estado lowercase (São Paulo → sp)
- **City**: Lowercase sem acentos (Poá → poa)
- **Zip**: Apenas números, primeiros 5 dígitos (08550-000 → 08550)

## Uso

Os dados são automaticamente salvos quando:
1. Um visitante acessa a página (dados de geolocalização)
2. Eventos do Facebook Pixel são disparados (PageView, InitiateCheckout)

Os dados reais (não hasheados) são salvos para análise posterior, enquanto apenas os hashes SHA256 são enviados para o Facebook.