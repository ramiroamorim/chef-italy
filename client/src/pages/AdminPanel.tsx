import React, { useState, useEffect } from 'react';

interface Stats {
  visitors: {
    total: number;
    last_24h: number;
  };
  matches: {
    total: number;
    last_24h: number;
  };
  match_rate: number;
}

interface SalesCheck {
  success: boolean;
  sales_count: number;
  visitors_count: number;
  matches_count: number;
  new_matches: Array<{
    confidence: number;
    method: string;
    sale_id: string;
    visitor_city: string;
    time_diff: number;
  }>;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lastCheck, setLastCheck] = useState<SalesCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authTest, setAuthTest] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    token_preview?: string;
  } | null>(null);

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const response = await fetch('/api/hotmart/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  // Testar autenticação
  const testAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/hotmart/test-auth');
      const data = await response.json();
      setAuthTest(data);
    } catch (error) {
      console.error('Erro no teste de auth:', error);
      setAuthTest({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar vendas
  const checkSales = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/hotmart/check-sales');
      const data = await response.json();
      setLastCheck(data);
      await loadStats(); // Recarregar stats
    } catch (error) {
      console.error('Erro ao verificar vendas:', error);
      setLastCheck({ 
        success: false, 
        sales_count: 0,
        visitors_count: 0,
        matches_count: 0,
        new_matches: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔧 Painel Admin - Chef Amélie
        </h1>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testAuth}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            🔑 Testar Hotmart Auth
          </button>
          
          <button
            onClick={checkSales}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            💰 Verificar Vendas
          </button>
          
          <button
            onClick={loadStats}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            📊 Atualizar Stats
          </button>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">👤 Visitantes</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.visitors.total}</p>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-sm text-gray-700">{stats.visitors.last_24h} nas últimas 24h</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">🎯 Matches</h3>
              <p className="text-3xl font-bold text-green-600">{stats.matches.total}</p>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-sm text-gray-700">{stats.matches.last_24h} nas últimas 24h</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">📈 Taxa de Match</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.match_rate}%</p>
              <p className="text-sm text-gray-500">Precisão</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">⚡ Status</h3>
              <p className="text-lg font-bold text-green-600">
                {authTest?.success ? '✅ Online' : '❌ Offline'}
              </p>
              <p className="text-sm text-gray-500">Sistema</p>
            </div>
          </div>
        )}

        {/* Resultado do Teste de Autenticação */}
        {authTest && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">🔑 Teste de Autenticação</h2>
            <div className={`p-4 rounded-lg ${authTest.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className={`font-semibold ${authTest.success ? 'text-green-800' : 'text-red-800'}`}>
                {authTest.success ? '✅ Sucesso!' : '❌ Falhou'}
              </p>
              <p className="text-sm text-gray-700">
                {authTest.message || authTest.error}
              </p>
              {authTest.token_preview && (
                <p className="text-xs text-gray-600 font-mono">
                  Token: {authTest.token_preview}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Resultado da Verificação de Vendas */}
        {lastCheck && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">💰 Última Verificação de Vendas</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Vendas Encontradas</p>
                  <p className="text-2xl font-bold text-blue-600">{lastCheck.sales_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Visitantes Disponíveis</p>
                  <p className="text-2xl font-bold text-purple-600">{lastCheck.visitors_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Novos Matches</p>
                  <p className="text-2xl font-bold text-green-600">{lastCheck.matches_count}</p>
                </div>
              </div>
              
              {lastCheck.new_matches && lastCheck.new_matches.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">🎯 Matches Encontrados:</h3>
                  <div className="space-y-2">
                    {lastCheck.new_matches.map((match, index) => (
                      <div key={index} className="border p-3 rounded bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">
                            Venda: {match.sale_id}
                          </span>
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${
                            match.confidence >= 90 ? 'bg-green-200 text-green-800' :
                            match.confidence >= 70 ? 'bg-yellow-200 text-yellow-800' :
                            'bg-red-200 text-red-800'
                          }`}>
                            {match.confidence}% confiança
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          🏙️ {match.visitor_city} • ⏱️ {match.time_diff} min • 🔧 {match.method}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <p className="text-lg font-semibold">⏳ Processando...</p>
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📋 Como Usar</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li><strong>Testar Auth:</strong> Verifica se as credenciais da Hotmart estão funcionando</li>
            <li><strong>Verificar Vendas:</strong> Busca vendas recentes e tenta fazer match com visitantes</li>
            <li><strong>Monitorar Stats:</strong> Acompanha quantos visitantes e matches foram feitos</li>
            <li><strong>Taxa de Match:</strong> Percentual de visitantes que viraram vendas identificadas</li>
          </ol>
          
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>💡 Dica:</strong> Execute "Verificar Vendas" periodicamente para buscar novas vendas.
              O sistema faz match baseado em tempo + localização + UTMs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 