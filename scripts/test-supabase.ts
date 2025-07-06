#!/usr/bin/env tsx

import { config } from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
config({ path: path.resolve(process.cwd(), '.env') });

console.log('🧪 Testando integração com Supabase...\n');

// Verificar credenciais
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase não encontradas!');
  console.log('📝 Configure as seguintes variáveis no arquivo .env:');
  console.log('   SUPABASE_URL=sua_url_do_supabase');
  console.log('   SUPABASE_SERVICE_KEY=sua_service_key');
  process.exit(1);
}

console.log('✅ Credenciais encontradas');
console.log(`📍 URL: ${process.env.SUPABASE_URL}`);
console.log(`🔑 Service Key: ${process.env.SUPABASE_SERVICE_KEY.substring(0, 50)}...`);

try {
  // Importar dinamicamente após as variáveis estarem carregadas
  const { testConnection, DatabaseUtils } = await import('../server/database-supabase');
  
  console.log('\n🔌 Testando conexão...');
  const connectionOk = await testConnection();
  
  if (!connectionOk) {
    console.error('❌ Falha na conexão');
    process.exit(1);
  }

  // Testar estatísticas
  console.log('\n📊 Testando estatísticas...');
  const stats = await DatabaseUtils.getFullReport();
  
  console.log('\n📈 Estatísticas atuais:');
  console.log(`👤 Visitantes: ${stats.visitors.total}`);
  console.log(`📊 Eventos: ${stats.events.total}`);
  console.log(`🎯 Taxa de conversão: ${stats.conversion.conversionRate}`);

  console.log('\n✅ Teste concluído com sucesso!');
  console.log('🚀 Supabase está pronto para uso!');
  
} catch (error) {
  console.error('❌ Erro no teste:', error);
  process.exit(1);
}