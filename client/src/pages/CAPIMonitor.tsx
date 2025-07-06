import React, { useState, useEffect } from 'react';

interface CAPIStats {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: string;
  lastEventTime: string | null;
  configStatus: {
    accessTokenConfigured: boolean;
    pixelId: string;
    apiVersion: string;
  };
}

interface CAPILog {
  logId: string;
  timestamp: string;
  status: 'success' | 'error';
  eventData?: any;
  response?: any;
  error?: string;
  statusCode?: number;
}

export default function CAPIMonitor() {
  const [stats, setStats] = useState<CAPIStats | null>(null);
  const [logs, setLogs] = useState<CAPILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/capi/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas CAPI:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/capi/logs?limit=50');
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Erro ao buscar logs CAPI:', error);
    }
  };

  const testCAPI = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/capi/test', { method: 'POST' });
      const data = await response.json();
      
      alert(data.success ? 
        `✅ Teste bem-sucedido: ${data.message}` : 
        `❌ Teste falhou: ${data.message}`
      );
      
      // Atualizar dados após teste
      await fetchStats();
      await fetchLogs();
    } catch (error) {
      alert('❌ Erro ao testar CAPI');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchLogs()]);
      setLoading(false);
    };

    loadData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Carregando monitoramento CAPI...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📱 Facebook CAPI Monitor
          </h1>
          <p className="text-gray-600">
            Monitoramento em tempo real dos eventos enviados para Facebook Conversions API
          </p>
        </div>

        {/* Configuração Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Status da Configuração</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${stats?.configStatus.accessTokenConfigured ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="font-semibold">Access Token</div>
              <div className={stats?.configStatus.accessTokenConfigured ? 'text-green-700' : 'text-red-700'}>
                {stats?.configStatus.accessTokenConfigured ? '✅ Configurado' : '❌ Não configurado'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-100">
              <div className="font-semibold">Pixel ID</div>
              <div className="text-blue-700">{stats?.configStatus.pixelId}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-100">
              <div className="font-semibold">API Version</div>
              <div className="text-gray-700">{stats?.configStatus.apiVersion}</div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📊 Estatísticas</h2>
            <button
              onClick={testCAPI}
              disabled={testing}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {testing ? 'Testando...' : '🧪 Testar CAPI'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-100">
              <div className="text-2xl font-bold text-blue-700">{stats?.totalEvents || 0}</div>
              <div className="text-sm text-blue-600">Total de Eventos</div>
            </div>
            <div className="p-4 rounded-lg bg-green-100">
              <div className="text-2xl font-bold text-green-700">{stats?.successfulEvents || 0}</div>
              <div className="text-sm text-green-600">Sucessos</div>
            </div>
            <div className="p-4 rounded-lg bg-red-100">
              <div className="text-2xl font-bold text-red-700">{stats?.failedEvents || 0}</div>
              <div className="text-sm text-red-600">Falhas</div>
            </div>
            <div className="p-4 rounded-lg bg-purple-100">
              <div className="text-2xl font-bold text-purple-700">{stats?.successRate || '0%'}</div>
              <div className="text-sm text-purple-600">Taxa de Sucesso</div>
            </div>
          </div>
          
          {stats?.lastEventTime && (
            <div className="mt-4 text-sm text-gray-600">
              Último evento: {new Date(stats.lastEventTime).toLocaleString('pt-BR')}
            </div>
          )}
        </div>

        {/* Avisos */}
        {!stats?.configStatus.accessTokenConfigured && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
            <div className="font-semibold text-yellow-800 mb-2">⚠️ Configuração Necessária</div>
            <div className="text-yellow-700">
              Para enviar eventos para o Facebook CAPI, configure o FACEBOOK_ACCESS_TOKEN no arquivo .env
              <br />
              <span className="text-sm">
                1. Acesse: <a href="https://developers.facebook.com/tools/explorer/" target="_blank" className="underline">Facebook Graph API Explorer</a><br />
                2. Gere um token com permissão 'ads_management'<br />
                3. Configure no arquivo .env: FACEBOOK_ACCESS_TOKEN=seu_token_aqui
              </span>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Logs de Eventos</h2>
          
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento CAPI registrado ainda
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.logId}
                  className={`p-4 rounded-lg border-l-4 ${
                    log.status === 'success' 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">
                      {log.status === 'success' ? '✅' : '❌'} {log.eventData?.event_name || 'Evento'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  
                  {log.status === 'success' ? (
                    <div className="text-sm text-green-700">
                      Enviado com sucesso para Facebook
                      {log.response?.events_received && (
                        <span> • {log.response.events_received} evento(s) recebido(s)</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">
                      Erro: {log.error || 'Erro desconhecido'}
                    </div>
                  )}
                  
                  <details className="mt-2">
                    <summary className="text-sm text-gray-600 cursor-pointer">Ver detalhes</summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Auto-refresh indicator */}
        <div className="mt-4 text-center text-sm text-gray-500">
          🔄 Atualização automática a cada 30 segundos
        </div>
      </div>
    </div>
  );
}