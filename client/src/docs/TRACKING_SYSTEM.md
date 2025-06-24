# 🍳 Chef Amélie - Sistema de Tracking React

Sistema modular e profissional de tracking de visitantes migrado de HTML para React hooks.

## 📋 Visão Geral

O sistema foi **migrado do HTML para React hooks** para melhor:
- ✅ **Modularidade**: Código organizado em hooks e contextos
- ✅ **Manutenibilidade**: Fácil de atualizar e debugar
- ✅ **Performance**: Timing otimizado (1s vs 3s)
- ✅ **Segurança**: API keys melhor protegidas
- ✅ **TypeScript**: Tipos seguros em toda aplicação

## 🏗️ Arquitetura

```
src/
├── hooks/
│   └── useVisitorTracking.ts      # Hook principal
├── contexts/
│   └── VisitorTrackingContext.tsx # Contexto React
├── types/
│   └── tracking.ts                # Tipos TypeScript
├── components/
│   └── debug/
│       └── TrackingDebug.tsx      # Debug em desenvolvimento
└── lib/
    └── fbPixel.ts                 # Facebook Pixel (existente)
```

## 🚀 Como Usar

### 1. Básico - Hook Direto
```tsx
import { useVisitorTracking } from '@/hooks/useVisitorTracking';

function MyComponent() {
  const { visitorData, isLoading, trackEvent } = useVisitorTracking();
  
  const handleButtonClick = () => {
    trackEvent('button_clicked', { button_name: 'comprar' });
  };
  
  return (
    <div>
      {isLoading ? 'Carregando...' : `Visitante: ${visitorData?.city}`}
    </div>
  );
}
```

### 2. Avançado - Contexto Global
```tsx
import { useVisitorTrackingContext } from '@/contexts/VisitorTrackingContext';

function AnyComponent() {
  const { visitorData, trackEvent } = useVisitorTrackingContext();
  
  useEffect(() => {
    trackEvent('page_viewed', { page: 'quiz_step_1' });
  }, []);
  
  return <div>Dados disponíveis globalmente!</div>;
}
```

## 📊 Dados Coletados

### Localização (API Pro)
```typescript
{
  ip: "123.456.789.0",
  country: "France",
  countryCode: "FR",
  city: "Paris",
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: "Europe/Paris",
  currency: "EUR",
  mobile: false,
  proxy: false,
  api_source: "ip-api-pro"
}
```

### Navegador
```typescript
{
  userAgent: "Mozilla/5.0...",
  language: "fr-FR",
  platform: "MacIntel",
  screenResolution: "1920x1080",
  windowSize: "1200x800"
}
```

### Marketing
```typescript
{
  utm_source: "google",
  utm_medium: "cpc", 
  utm_campaign: "chef_amelie_quiz",
  referrer: "https://google.com"
}
```

## 🎯 Eventos de Tracking

### Automáticos
- `page_view` - Carregamento da página
- `quiz_started` - Início do quiz
- `api_success/failure` - Status da API

### Manuais
```tsx
// Exemplo: Tracking de conversão
trackEvent('purchase_intent', {
  product: 'recipe_book',
  price: 17,
  currency: 'EUR'
});

// Exemplo: Engagement
trackEvent('quiz_completed', {
  total_time: 120, // segundos
  answers: userAnswers
});
```

## 🔧 Configurações

### API de Geolocalização
```typescript
// client/src/hooks/useVisitorTracking.ts
const IP_API_CONFIG = {
  API_KEY: '35485993-5dcd-4c7a-9102-121d840bde7f',
  BASE_URL: 'https://apiip.net/api/check',
  FORCE_PRO: true // false para permitir fallback para ip-api.com
};
```

### Facebook Pixel
```typescript
// Automaticamente integrado
// Events: ViewContent, InitiateCheckout, etc.
```

## 🐛 Debug

### Componente Debug (Desenvolvimento)
- Botão flutuante 🔍 no canto inferior direito
- Mostra dados em tempo real
- Buttons para log e reset
- Só aparece em `NODE_ENV=development`

### Console
```javascript
// Verificar dados do visitante
console.log(localStorage.getItem('chef_amelie_visitor'));

// Histórico de visitas
console.log(localStorage.getItem('chef_amelie_history'));
```

## 📈 Performance

| Métrica | Antes (HTML) | Agora (React) |
|---------|-------------|---------------|
| **Timing** | 3000ms delay | 1000ms delay |
| **Modularidade** | Monolítico | Hooks/Context |
| **Tipos** | JavaScript | TypeScript |
| **Debug** | Console logs | Interface visual |
| **Manutenção** | Difícil | Fácil |

## 🔐 Segurança

### Melhorias Implementadas
- ✅ **API Key**: Ainda no frontend, mas melhor organizada
- ✅ **HTTPS**: Todas as chamadas de API
- ✅ **Error Handling**: Tratamento robusto de erros
- ✅ **Fallback**: Sistema de backup automático

### Próximos Passos (Recomendado)
- 🔄 **Backend Proxy**: Mover API key para servidor
- 🔄 **LGPD Compliance**: Sistema de consentimento
- 🔄 **Rate Limiting**: Controle de requisições

## 🚨 Migration Notes

### O que mudou:
1. ❌ **Removido**: Script de 300+ linhas do HTML
2. ✅ **Adicionado**: Sistema modular React
3. ✅ **Melhorado**: Performance e manutenibilidade

### Compatibilidade:
- ✅ **LocalStorage**: Mesmo formato de dados
- ✅ **Facebook Pixel**: Mesma integração
- ✅ **UTM Tracking**: Funcionalidade mantida
- ✅ **Session IDs**: Formato compatível

## 🎛️ Comandos Úteis

### Desenvolvimento
```bash
# Ver dados no console do navegador
localStorage.getItem('chef_amelie_visitor')

# Reset completo
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Produção
```bash
# Verificar se está funcionando
curl -X GET "https://seu-site.com" -H "User-Agent: TestBot"
```

## 📞 Troubleshooting

### Problemas Comuns

1. **"useVisitorTrackingContext error"**
   - Solução: Verificar se componente está dentro de `<VisitorTrackingProvider>`

2. **"API Pro falhou"**
   - Solução: Verificar chave da API e cota disponível

3. **"Dados não aparecem"**
   - Solução: Aguardar 1-2 segundos ou verificar console

4. **"Facebook Pixel não funciona"**
   - Solução: Verificar se `fbq` está definido globalmente

---

## 🎉 Status

✅ **Sistema migrado com sucesso!**  
🚀 **Pronto para produção**  
🔧 **Debug tools disponíveis**  
📊 **Tracking ativo**  

**Desenvolvido com ❤️ para Chef Amélie Dupont** 