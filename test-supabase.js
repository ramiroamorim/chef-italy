import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://gjqlmfyomxwfbfpqecqq.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcWxtZnlvbXh3ZmJmcHFlY3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTMwMzgsImV4cCI6MjA2NDIyOTAzOH0.5HVG2LrFX-wl60K8ItFWIyO1RKAl_Cxs1d2USX_z1bU';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcWxtZnlvbXh3ZmJmcHFlY3FxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY1MzAzOCwiZXhwIjoyMDY0MjI5MDM4fQ.pC8dIxYJWq4Qh7wyfEnkbDRNVR5SDTIbpvrBdeXgWHk';

async function testSupabaseKeys() {
  console.log('🔍 Testando chaves do Supabase...\n');
  
  // Testar chave anon
  console.log('1. Testando ANON KEY...');
  try {
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data, error } = await anonClient.from('visitors').select('*').limit(1);
    
    if (error) {
      console.log('❌ ANON KEY falhou:', error.message);
    } else {
      console.log('✅ ANON KEY funcionou!');
    }
  } catch (error) {
    console.log('❌ ANON KEY erro:', error.message);
  }
  
  console.log('\n2. Testando SERVICE KEY...');
  try {
    const serviceClient = createClient(supabaseUrl, serviceKey);
    const { data, error } = await serviceClient.from('visitors').select('*').limit(1);
    
    if (error) {
      console.log('❌ SERVICE KEY falhou:', error.message);
    } else {
      console.log('✅ SERVICE KEY funcionou!');
    }
  } catch (error) {
    console.log('❌ SERVICE KEY erro:', error.message);
  }
  
  console.log('\n3. Testando se a tabela visitors existe...');
  try {
    const serviceClient = createClient(supabaseUrl, serviceKey);
    
    // Verificar se a tabela existe
    const { data, error } = await serviceClient.from('visitors').select('*').limit(1);
    
    if (error) {
      console.log('❌ Tabela visitors não existe ou erro:', error.message);
      console.log('Hint:', error.hint);
    } else {
      console.log('✅ Tabela visitors existe e está acessível!');
      console.log('Total de registros de teste:', data?.length || 0);
    }
  } catch (error) {
    console.log('❌ Erro ao verificar tabela:', error.message);
  }
  
  console.log('\n4. Verificando schema da tabela visitors...');
  try {
    const serviceClient = createClient(supabaseUrl, serviceKey);
    
    // Pegar todos os registros para ver o schema
    const { data, error } = await serviceClient.from('visitors').select('*');
    
    if (error) {
      console.log('❌ Erro ao ler tabela:', error.message);
    } else {
      console.log('✅ Tabela visitors tem', data.length, 'registros');
      if (data.length > 0) {
        console.log('Exemplo de registro:', data[0]);
        console.log('Colunas disponíveis:', Object.keys(data[0]));
      }
    }
  } catch (error) {
    console.log('❌ Erro ao verificar schema:', error.message);
  }
  
  console.log('\n5. Testando inserção com dados básicos...');
  try {
    const serviceClient = createClient(supabaseUrl, serviceKey);
    
    const testData = {
      session_id: 'test-' + Date.now(),
      external_id: 'test-' + Date.now(),
      ip: '127.0.0.1',
      city: 'Test City',
      country: 'Test Country'
    };
    
    const { data, error } = await serviceClient
      .from('visitors')
      .insert([testData]);
    
    if (error) {
      console.log('❌ Erro ao inserir dados:', error.message);
      console.log('Hint:', error.hint);
    } else {
      console.log('✅ Dados inseridos com sucesso!');
    }
  } catch (error) {
    console.log('❌ Erro ao inserir dados:', error.message);
  }
}

testSupabaseKeys();