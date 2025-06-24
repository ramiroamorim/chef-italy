import React, { useState } from 'react';
import { useOptionalVisitorTracking } from '@/contexts/VisitorTrackingContext';

export default function TrackingDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const trackingContext = useOptionalVisitorTracking();

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development' || !trackingContext) {
    return null;
  }

  const { visitorData, isLoading, apiUsed, sessionId } = trackingContext;

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
        <div className="fixed bottom-16 right-4 z-50 bg-white border-2 border-purple-200 rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-purple-700">🍳 Chef Amélie Debug</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Status */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
              <span className="text-sm font-medium">
                {isLoading ? 'Carregando...' : 'Ativo'}
              </span>
            </div>
          </div>

          {/* Session ID */}
          <div className="mb-3">
            <p className="text-xs text-gray-600">Session ID:</p>
            <p className="text-xs font-mono bg-gray-100 p-1 rounded break-all">{sessionId}</p>
          </div>

          {/* API Usada */}
          <div className="mb-3">
            <p className="text-xs text-gray-600">API Usada:</p>
            <span className={`text-xs px-2 py-1 rounded ${
              apiUsed === 'apiip-net' ? 'bg-green-100 text-green-800' : 
              apiUsed === 'ip-api-free-fallback' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {apiUsed || 'N/A'}
            </span>
          </div>

          {/* Dados do Visitante */}
          {visitorData && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Localização:</p>
              <div className="text-xs bg-gray-50 p-2 rounded">
                <p>🌍 {visitorData.city}, {visitorData.country}</p>
                <p>📱 Mobile: {visitorData.mobile ? 'Sim' : 'Não'}</p>
                <p>🔧 {visitorData.isp}</p>
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
              Log Dados Completos
            </button>
            
            <button
              onClick={() => {
                const history = localStorage.getItem('chef_amelie_history');
                console.log('History:', JSON.parse(history || '[]'));
              }}
              className="w-full text-xs bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600"
            >
              Log Histórico
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('chef_amelie_visitor');
                localStorage.removeItem('chef_amelie_history');
                sessionStorage.removeItem('chef_amelie_session');
                window.location.reload();
              }}
              className="w-full text-xs bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
            >
              Reset Tracking
            </button>
          </div>
        </div>
      )}
    </>
  );
} 