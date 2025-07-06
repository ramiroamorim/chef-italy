#!/usr/bin/env tsx

import { config } from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
config({ path: path.resolve(process.cwd(), '.env') });

console.log('🔍 Testando variáveis de ambiente...\n');

console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Definida' : '❌ Não encontrada');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não encontrada');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Definida' : '❌ Não encontrada');

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY && process.env.SUPABASE_ANON_KEY) {
  console.log('\n✅ Todas as variáveis estão definidas!');
  
  // Agora teste a conexão
  console.log('\n🔌 Testando conexão com Supabase...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Teste simples
    const { data, error } = await supabase
      .from('visitors')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
    } else {
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
      console.log('📊 Tabela visitors acessível');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
  }
  
} else {
  console.log('\n❌ Algumas variáveis estão faltando');
  console.log('📝 Verifique o arquivo .env');
}