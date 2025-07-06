import { useState, useEffect } from 'react';
import { useVisitorTracking } from '../../hooks/useVisitorTracking';
import { FacebookPixel } from '../../lib/fbPixel';

export default function TrackingDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const trackingContext = useVisitorTracking();

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development' || !trackingContext) {
    return null;
  }

  const { visitorData, isLoading, apiUsed, sessionId } = trackingContext;
  
  // Obter status do Advanced Matching
  const getAdvancedMatchingStatus = () => {
    try {
      return FacebookPixel.getAdvancedMatchingStatus();
    } catch {
      return {
        pixelLoaded: false,
        advancedMatchingActive: false,
        fieldsCount: 0,
        fields: [],
        data: null
      };
    }
  };

  const advancedStatus = getAdvancedMatchingStatus();

  return (
    <>
      {/* Botão flutuante para abrir/fechar */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-purple-500 text-white p-2 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
        title="Debug Tracking"
      >
        🔍
      </button>

      {/* Panel de debug */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-white p-4 rounded-lg shadow-xl border max-w-sm max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">🔧 Debug Tracking</h3>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Status Geral */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">Status:</p>
            <div className="text-xs">
              <span className={`px-2 py-1 rounded mr-1 ${isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {isLoading ? 'Carregando...' : 'Ativo ✅'}
              </span>
              <span className="text-gray-500">API: {apiUsed || 'N/A'}</span>
            </div>
          </div>

          {/* Facebook Pixel Advanced Matching Status */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">🎯 Facebook Pixel:</p>
            <div className="text-xs bg-blue-50 p-2 rounded space-y-1">
              <div className="flex justify-between">
                <span>Pixel carregado:</span>
                <span className={advancedStatus.pixelLoaded ? 'text-green-600' : 'text-red-600'}>
                  {advancedStatus.pixelLoaded ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Advanced Matching:</span>
                <span className={advancedStatus.advancedMatchingActive ? 'text-green-600' : 'text-red-600'}>
                  {advancedStatus.advancedMatchingActive ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Campos enviados:</span>
                <span className="font-medium">{advancedStatus.fieldsCount}</span>
              </div>
              {advancedStatus.fields.length > 0 && (
                <div>
                  <span className="text-gray-500">Campos: </span>
                  <span className="text-xs">{advancedStatus.fields.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Event IDs */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">🆔 Event IDs:</p>
            <div className="text-xs bg-green-50 p-2 rounded space-y-1">
              <div>
                <span className="text-gray-500">PageView: </span>
                <span className="font-mono text-xs">
                  {(window as any).chefAmelieLastPageViewEventId || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">InitiateCheckout: </span>
                <span className="font-mono text-xs">
                  {(window as any).chefAmelieLastCheckoutEventId || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* External ID */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">👤 External ID (Visitor UUID):</p>
            <div className="text-xs bg-blue-50 p-2 rounded">
              <span className="font-mono text-xs">
                {trackingContext?.sessionId || 'N/A'}
              </span>
            </div>
          </div>

          {/* Cookies do Facebook */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">🍪 Facebook Cookies:</p>
            <div className="text-xs bg-green-50 p-2 rounded space-y-1">
              <div>
                <span className="text-gray-500">_fbp: </span>
                <span className="font-mono text-xs">
                  {document.cookie.includes('_fbp=') ? 
                    document.cookie.split('_fbp=')[1]?.split(';')[0]?.substring(0, 20) + '...' : 
                    'NOT SET'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-500">_fbc: </span>
                <span className="font-mono text-xs">
                  {document.cookie.includes('_fbc=') ? 
                    document.cookie.split('_fbc=')[1]?.split(';')[0]?.substring(0, 20) + '...' : 
                    'NOT SET'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-500">external_id: </span>
                <span className="font-mono text-xs">
                  {document.cookie.includes('external_id=') ? 
                    document.cookie.split('external_id=')[1]?.split(';')[0]?.substring(0, 20) + '...' : 
                    'NOT SET'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Flags de Inicialização */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">🚩 Status dos Flags:</p>
            <div className="text-xs bg-yellow-50 p-2 rounded space-y-1">
              <div className="flex justify-between">
                <span>Pixel Inicializado:</span>
                <span className={(window as any).chefAmeliePixelInitialized ? 'text-green-600' : 'text-red-600'}>
                  {(window as any).chefAmeliePixelInitialized ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Checkout Enviado:</span>
                <span className={(window as any).chefAmelieCheckoutSent ? 'text-green-600' : 'text-red-600'}>
                  {(window as any).chefAmelieCheckoutSent ? '✅' : '❌'}
                </span>
              </div>
            </div>
          </div>

          {/* Session ID */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">Session ID:</p>
            <p className="text-xs font-mono bg-gray-100 p-1 rounded truncate">
              {sessionId || 'N/A'}
            </p>
          </div>

          {/* Dados de Localização */}
          {visitorData && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Localização:</p>
              <div className="text-xs bg-gray-50 p-2 rounded">
                <p>🌍 {visitorData.city}, {visitorData.country}</p>
                <p>📱 Mobile: {visitorData.mobile ? 'Sim' : 'Não'}</p>
                <p>🔧 {visitorData.isp}</p>
                {visitorData.ip && (
                  <p>📍 IP: {visitorData.ip.substring(0, 10)}...</p>
                )}
              </div>
            </div>
          )}

          {/* API Source */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">🔧 API Source:</p>
            <div className="text-xs bg-yellow-50 p-2 rounded">
              <span className="font-mono text-xs">
                {visitorData?.api_source || 'N/A'}
              </span>
            </div>
          </div>

          {/* User Agent Source da API */}
          {visitorData && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">🌐 User Agent (Source da API):</p>
              <div className="text-xs bg-green-50 p-2 rounded">
                <span className="font-mono text-xs">
                  {visitorData.source ? visitorData.source.substring(0, 50) + '...' : 'N/A'}
                </span>
              </div>
            </div>
          )}

          {/* UTM Parameters */}
          {visitorData && (visitorData.utm_source || visitorData.utm_medium || visitorData.utm_campaign) && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">UTM:</p>
              <div className="text-xs bg-blue-50 p-2 rounded">
                {visitorData.utm_source && <p>Source: {visitorData.utm_source}</p>}
                {visitorData.utm_medium && <p>Medium: {visitorData.utm_medium}</p>}
                {visitorData.utm_campaign && <p>Campaign: {visitorData.utm_campaign}</p>}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="space-y-2">
            <button
              onClick={() => console.log('Visitor Data:', visitorData)}
              className="w-full text-xs bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
            >
              📄 Log Dados Completos
            </button>
            
            <button
              onClick={() => {
                const status = FacebookPixel.getAdvancedMatchingStatus();
                console.log('🎯 Facebook Pixel Status:', status);
                alert(`🎯 Facebook Pixel:\n✅ Carregado: ${status.pixelLoaded}\n🎯 Advanced Matching: ${status.advancedMatchingActive}\n📊 Campos: ${status.fieldsCount}`);
              }}
              className="w-full text-xs bg-purple-500 text-white py-1 px-2 rounded hover:bg-purple-600"
            >
              🎯 Status FB Pixel
            </button>

            {/* Testar InitiateCheckout */}
            <button
              onClick={() => {
                FacebookPixel.trackInitiateCheckout(visitorData);
                alert('🛒 InitiateCheckout enviado com Advanced Matching!');
              }}
              className="w-full text-xs bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600"
            >
              🛒 Testar InitiateCheckout
            </button>

            {/* Comparar Parâmetros */}
            <button
              onClick={() => {
                const comparison = FacebookPixel.compareEvents();
                console.log('🔍 COMPARAÇÃO COMPLETA:', comparison);
                
                const differentValues = comparison.differentValues;
                const pageViewOnly = comparison.pageViewOnly;
                const checkoutOnly = comparison.checkoutOnly;
                
                let message = '🔍 COMPARAÇÃO DE PARÂMETROS:\n\n';
                message += `PageView: ${comparison.pageViewKeys.length} parâmetros\n`;
                message += `InitiateCheckout: ${comparison.checkoutKeys.length} parâmetros\n\n`;
                
                if (differentValues.length > 0) {
                  message += '⚠️ VALORES DIFERENTES:\n';
                  differentValues.forEach(diff => {
                    message += `• ${diff.key}: PageView="${diff.pageView}" vs Checkout="${diff.checkout}"\n`;
                  });
                  message += '\n';
                }
                
                if (pageViewOnly.length > 0) {
                  message += '❌ APENAS NO PAGEVIEW:\n';
                  pageViewOnly.forEach(param => message += `• ${param}\n`);
                  message += '\n';
                }
                
                if (checkoutOnly.length > 0) {
                  message += '❌ APENAS NO INITIATECHECKOUT:\n';
                  checkoutOnly.forEach(param => message += `• ${param}\n`);
                  message += '\n';
                }
                
                if (differentValues.length === 0 && pageViewOnly.length === 0 && checkoutOnly.length === 0) {
                  message += '✅ PARÂMETROS IDÊNTICOS!\n';
                  message += 'Se ainda há diferença no "Show", pode ser:\n';
                  message += '1. Timing do envio\n';
                  message += '2. Ordem dos parâmetros\n';
                  message += '3. Tipo de dados\n';
                }
                
                alert(message);
              }}
              className="w-full text-xs bg-orange-500 text-white py-1 px-2 rounded hover:bg-orange-600"
            >
              🔍 Comparar Parâmetros
            </button>

            {/* Testar Eventos Idênticos */}
            <button
              onClick={() => {
                FacebookPixel.testIdenticalEvents();
                alert('🧪 TESTE DE EVENTOS IDÊNTICOS!\n\nEnviando:\n1. PageView com parâmetros idênticos\n2. InitiateCheckout com parâmetros idênticos\n\nVerifique no Meta Pixel Helper:\n- Ambos devem ter mesma quantidade de "Show"\n- Verifique console para detalhes');
              }}
              className="w-full text-xs bg-purple-500 text-white py-1 px-2 rounded hover:bg-purple-600"
            >
              🧪 Testar Eventos Idênticos
            </button>

            {/* Testar Forçar "Show" */}
            <button
              onClick={() => {
                FacebookPixel.testForceShowParameters();
                alert('🔥 TESTE: FORÇAR PARÂMETROS COMO "SHOW"!\n\nEnviando 3 estratégias:\n1. Strings longas e complexas\n2. Objetos JSON complexos\n3. Prefixos customizados\n\nVerifique no Meta Pixel Helper:\n- Quais content_name e content_ids aparecem como "Show"\n- Console tem detalhes de cada estratégia');
              }}
              className="w-full text-xs bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
            >
              🔥 Forçar "Show"
            </button>

            {/* Testar InitiateCheckout Forçado */}
            <button
              onClick={() => {
                FacebookPixel.resetFlags();
                setTimeout(() => {
                  FacebookPixel.trackInitiateCheckoutForceShow(visitorData);
                }, 500);
                alert('🎯 INITIATECHECKOUT FORÇADO!\n\nEnviando InitiateCheckout com:\n✅ content_name LONGO\n✅ content_ids COMPLEXO\n\nVerifique no Meta Pixel Helper:\n- content_name deve aparecer como "Show"\n- content_ids deve aparecer como "Show"');
              }}
              className="w-full text-xs bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600"
            >
              🎯 InitiateCheckout Forçado
            </button>

            {/* Testar Valores Idênticos */}
            <button
              onClick={() => {
                FacebookPixel.resetFlags();
                setTimeout(() => {
                  FacebookPixel.trackInitiateCheckoutIdenticalButShow(visitorData);
                }, 500);
                alert('🎯 VALORES IDÊNTICOS AO PAGEVIEW!\n\nEnviando InitiateCheckout com:\n✅ content_name: "Chef Amelie Quiz Landing"\n✅ content_ids: ["chef-amelie-landing"]\n✅ + caractere invisível para forçar "Show"\n\nVerifique no Meta Pixel Helper:\n- Deve ter MESMO NOME do PageView\n- Mas aparecer como "Show"');
              }}
              className="w-full text-xs bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600"
            >
              🎯 Valores Idênticos + Show
            </button>

            {/* Testar Caracteres Invisíveis */}
            <button
              onClick={() => {
                FacebookPixel.testInvisibleCharacterStrategies();
                alert('🔍 TESTE DE CARACTERES INVISÍVEIS!\n\nEnviando 4 estratégias diferentes:\n1. Zero Width Space\n2. Zero Width Non-Joiner\n3. Word Joiner\n4. Combinação múltipla\n\nCada uma com 3 segundos de intervalo.\n\nVerifique no Meta Pixel Helper:\n- Qual mantém valores idênticos\n- Qual força "Show" melhor');
              }}
              className="w-full text-xs bg-indigo-500 text-white py-1 px-2 rounded hover:bg-indigo-600"
            >
              🔍 Testar Caracteres Invisíveis
            </button>

            {/* Copiar Event IDs */}
            <button
              onClick={() => {
                const eventIds = {
                  pageView: (window as any).chefAmelieLastPageViewEventId,
                  initiateCheckout: (window as any).chefAmelieLastCheckoutEventId,
                  externalId: trackingContext?.sessionId
                };
                console.log('🆔 Event IDs + External ID:', eventIds);
                navigator.clipboard?.writeText(JSON.stringify(eventIds, null, 2));
                alert('🆔 Event IDs + External ID copiados para clipboard!\n\nVerifique o console para detalhes.');
              }}
              className="w-full text-xs bg-indigo-500 text-white py-1 px-2 rounded hover:bg-indigo-600"
            >
              🆔 Copiar IDs
            </button>

            {/* Resetar Flags */}
            <button
              onClick={() => {
                FacebookPixel.resetFlags();
                alert('🔄 Flags resetados!\n\nAgora você pode testar os eventos novamente.');
                // Forçar re-render do componente
                setIsVisible(false);
                setTimeout(() => setIsVisible(true), 100);
              }}
              className="w-full text-xs bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
            >
              🔄 Resetar Flags
            </button>

            {/* Debug External ID */}
            <button
              onClick={() => {
                FacebookPixel.debugExternalId();
                alert('🔍 Debug External ID executado!\n\nVerifique o console para detalhes.');
              }}
              className="w-full text-xs bg-purple-500 text-white py-1 px-2 rounded hover:bg-purple-600"
            >
              🔍 Debug External ID
            </button>

            {/* Debug Cookies */}
            <button
              onClick={() => {
                const cookies = FacebookPixel.debugCookies();
                console.log('🍪 Facebook Cookies Debug:', cookies);
                alert(`🍪 Facebook Cookies:\n\n_fbp: ${cookies.fbp ? 'SET' : 'NOT SET'}\n_fbc: ${cookies.fbc ? 'SET' : 'NOT SET'}\nexternal_id: ${cookies.externalId ? 'SET' : 'NOT SET'}\n\nVerifique o console para detalhes completos.`);
              }}
              className="w-full text-xs bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600"
            >
              🍪 Debug Cookies
            </button>

            {/* Test User Agent Simples */}
            <button
              onClick={() => {
                const result = FacebookPixel.testUserAgentSimple();
                if (result) {
                  alert(`🧪 Teste Simples enviado!\n\nClient User Agent: ${result.client_user_agent}\n\nVerifique o console e o Meta Pixel Helper.`);
                } else {
                  alert('❌ Erro no teste - verifique o console.');
                }
              }}
              className="w-full text-xs bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600"
            >
              🧪 Test Simples User Agent
            </button>

            {/* Test User Agent */}
            <button
              onClick={() => {
                const result = FacebookPixel.testClientUserAgent();
                if (result) {
                  alert(`🔍 Test Client User Agent enviado!\n\nExtracted: ${result.test_extracted}\nFull: ${result.test_full_source.substring(0, 50)}...\n\nVerifique o console e o Meta Pixel Helper.`);
                } else {
                  alert('❌ Erro no teste - verifique o console.');
                }
              }}
              className="w-full text-xs bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600"
            >
              🔍 Test Client User Agent
            </button>

            {/* Force Client User Agent */}
            <button
              onClick={() => {
                const result = FacebookPixel.forceClientUserAgent();
                if (result) {
                  alert(`🔥 Client User Agent FORÇADO!\n\nclient_user_agent: ${result.client_user_agent}\nclient_ip_address: ${result.client_ip_address}\n\nVerifique o Meta Pixel Helper - deve aparecer!`);
                } else {
                  alert('❌ Erro no teste forçado - verifique o console.');
                }
              }}
              className="w-full text-xs bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
            >
              🔥 FORCE Client User Agent
            </button>

            {/* Regenerar Cookies */}
            <button
              onClick={() => {
                const newCookies = FacebookPixel.regenerateCookies();
                alert(`🔄 Cookies regenerados!\n\nNovo External ID: ${newCookies.newExternalId.substring(0, 8)}...\nNovo _fbp: ${newCookies.newFbp.substring(0, 20)}...\n\nRecarregue a página para ver os novos valores.`);
                // Forçar re-render do componente
                setIsVisible(false);
                setTimeout(() => setIsVisible(true), 100);
              }}
              className="w-full text-xs bg-orange-500 text-white py-1 px-2 rounded hover:bg-orange-600"
            >
              🔄 Regenerar Cookies
            </button>

            {/* Limpar Cookies Antigos */}
            <button
              onClick={() => {
                const cleanedCount = FacebookPixel.cleanLegacyCookies();
                alert(`🧹 Limpeza concluída!\n\n${cleanedCount} cookies/sessionStorage antigos removidos.\n\nVerifique o console para detalhes.`);
                // Forçar re-render do componente
                setIsVisible(false);
                setTimeout(() => setIsVisible(true), 100);
              }}
              className="w-full text-xs bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600"
            >
              🧹 Limpar Cookies Antigos
            </button>

            {/* Verificar Conflitos */}
            <button
              onClick={() => {
                const conflicts = FacebookPixel.checkCookieConflicts();
                const hasConflicts = conflicts.hasLegacyCookies || conflicts.cookieSessionMismatch;
                
                if (hasConflicts) {
                  alert(`⚠️ Conflitos detectados!\n\nCookies antigos: ${conflicts.legacyCookies.join(', ') || 'nenhum'}\nCookie ≠ Session: ${conflicts.cookieSessionMismatch ? 'SIM' : 'NÃO'}\n\nVerifique o console para detalhes.`);
                } else {
                  alert('✅ Cookies sincronizados corretamente!\n\nNenhum conflito detectado.');
                }
                
                console.log('🔍 Resultado da verificação de conflitos:', conflicts);
              }}
              className="w-full text-xs bg-purple-500 text-white py-1 px-2 rounded hover:bg-purple-600"
            >
              🔍 Verificar Conflitos
            </button>

            {/* Obter UUID Unificado */}
            <button
              onClick={() => {
                const uuid = FacebookPixel.getVisitorUUID();
                alert(`👤 UUID Unificado:\n\n${uuid}\n\nEste é o UUID único usado em todos os sistemas.`);
                console.log('👤 UUID Unificado:', uuid);
                navigator.clipboard?.writeText(uuid);
              }}
              className="w-full text-xs bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
            >
              👤 UUID Unificado
            </button>

            {/* Re-inicializar Facebook Pixel */}
            {visitorData && (
              <button
                onClick={async () => {
                  console.log('🔄 Reinicializando Facebook Pixel...');
                  const success = await FacebookPixel.initWithAdvancedMatching(visitorData);
                  if (success) {
                    alert('🔥 Facebook Pixel reinicializado com Advanced Matching!');
                  } else {
                    alert('❌ Falha ao reinicializar Facebook Pixel.');
                  }
                }}
                className="w-full text-xs bg-orange-500 text-white py-1 px-2 rounded hover:bg-orange-600"
              >
                🔄 Reiniciar FB Pixel
              </button>
            )}

            <button
              onClick={() => {
                const history = localStorage.getItem('chef_amelie_history');
                console.log('History:', JSON.parse(history || '[]'));
              }}
              className="w-full text-xs bg-gray-500 text-white py-1 px-2 rounded hover:bg-gray-600"
            >
              📚 Log Histórico
            </button>
          </div>

          {/* Instruções para Meta Pixel Helper */}
          {advancedStatus.advancedMatchingActive && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs text-green-800 font-medium">🎯 Meta Pixel Helper:</p>
              <p className="text-xs text-green-700">
                Instale a extensão e recarregue a página. Deve detectar {advancedStatus.fieldsCount} campos de Advanced Matching.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
} 