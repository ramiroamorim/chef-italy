# 📱 Facebook CAPI - Configuração e Monitoramento

Este guia mostra como verificar se os eventos estão sendo enviados para o Facebook Conversions API.

## ✅ Como verificar se os eventos estão sendo enviados

### 1. **Verificar Logs do Servidor**
Quando você acessa a aplicação, deve ver no console do servidor:
```
📱 Enviando evento para Facebook CAPI...
✅ CAPI: Evento enviado com sucesso! { logId: 'capi_xxx', eventType: 'PageView' }
```

### 2. **Acessar Monitor CAPI**
- URL: `http://localhost:3000/capi-monitor` (quando implementado)
- Ou via API: `http://localhost:3000/api/capi/stats`

### 3. **Verificar APIs de Monitoramento**

#### Estatísticas CAPI
```bash
curl http://localhost:3000/api/capi/stats
```

#### Logs de Envios
```bash
curl http://localhost:3000/api/capi/logs
```

#### Testar Conexão
```bash
curl -X POST http://localhost:3000/api/capi/test
```

## 🔧 Configuração do Facebook Access Token

### Passo 1: Obter Access Token
1. Acesse: https://developers.facebook.com/tools/explorer/
2. Selecione sua aplicação Facebook
3. Escolha o Pixel ID: `644431871463181`
4. Adicione a permissão: `ads_management`
5. Gere o token
6. Copie o token gerado

### Passo 2: Configurar no Servidor
1. Crie um arquivo `.env` na raiz do projeto:
```bash
FACEBOOK_ACCESS_TOKEN=seu_token_aqui
NODE_ENV=development
```

2. Reinicie o servidor:
```bash
npm run dev
```

## 🧪 Como testar se está funcionando

### Teste Automático
1. Acesse: `http://localhost:3000`
2. Aguarde carregar a página (evento PageView será enviado)
3. Inicie o quiz (evento InitiateCheckout será enviado)
4. Verifique os logs do servidor

### Teste Manual via API
```bash
# Testar conexão
curl -X POST http://localhost:3000/api/capi/test

# Enviar evento manual
curl -X POST http://localhost:3000/api/capi/send-event \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "PageView",
    "user_data": {
      "external_id": "test-user-123",
      "client_ip_address": "127.0.0.1",
      "country": "br",
      "ct": "sao paulo",
      "st": "sp",
      "zp": "01000"
    },
    "custom_data": {
      "content_name": "Test Event",
      "currency": "BRL",
      "value": 1.00
    }
  }'
```

## 📊 O que acontece quando funciona

### 1. **Evento Processado**
- ✅ Dados formatados conforme Facebook (br, sp, poa, 08550)
- ✅ SHA256 hash aplicado nos dados sensíveis
- ✅ Evento salvo no banco de dados local

### 2. **Enviado para Facebook CAPI**
- ✅ Dados convertidos para formato CAPI
- ✅ Enviado via HTTPS para Facebook
- ✅ Resposta de confirmação recebida

### 3. **Logs de Confirmação**
```json
{
  "success": true,
  "response": {
    "events_received": 1,
    "fbtrace_id": "facebook-trace-id"
  },
  "logId": "capi_1234567890_abc123"
}
```

## ❌ Problemas Comuns

### 1. **Access Token não configurado**
```
❌ CAPI: Access Token não configurado!
```
**Solução**: Configure FACEBOOK_ACCESS_TOKEN no .env

### 2. **Token inválido ou expirado**
```
❌ CAPI: Erro ao enviar evento: Invalid access token
```
**Solução**: Gere um novo token no Facebook Developers

### 3. **Permissões insuficientes**
```
❌ CAPI: Erro ao enviar evento: Insufficient permissions
```
**Solução**: Certifique-se que o token tem permissão 'ads_management'

## 🔍 Verificação no Facebook

### Events Manager
1. Acesse: https://www.facebook.com/events_manager2/
2. Selecione o Pixel ID: `644431871463181`
3. Vá em "Diagnostics" ou "Test Events"
4. Procure pelos eventos enviados via CAPI

### Test Events (Modo Desenvolvimento)
Quando NODE_ENV=development, os eventos são enviados com `test_event_code`, facilitando a identificação no Facebook.

## 🚀 Status Atual

- ✅ Sistema CAPI implementado
- ✅ Formatação de dados conforme Facebook
- ✅ Monitoramento e logs
- ✅ APIs de verificação
- ⚠️ Requer configuração do Access Token
- ⚠️ Página de monitoramento em desenvolvimento

## 📋 Próximos Passos

1. Configurar FACEBOOK_ACCESS_TOKEN
2. Testar envio de eventos
3. Verificar no Facebook Events Manager
4. Implementar página de monitoramento visual
5. Configurar alertas para falhas