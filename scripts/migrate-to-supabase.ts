#!/usr/bin/env tsx

/**
 * Script de migração dos dados JSON para Supabase
 * Chef Amélie - Sistema de tracking de visitantes e eventos Facebook
 * 
 * Este script:
 * 1. Lê os dados dos arquivos JSON existentes
 * 2. Conecta ao Supabase
 * 3. Migra os dados para as tabelas do Supabase
 * 4. Gera relatório da migração
 */

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
config({ path: path.resolve(process.cwd(), '.env') });

// Importar as funções do banco de dados
import { VisitorDatabase as JsonVisitorDatabase, FacebookEventDatabase as JsonFacebookEventDatabase } from '../server/database';

const DATABASE_DIR = path.join(process.cwd(), 'database', 'collections');
const VISITORS_FILE = path.join(DATABASE_DIR, 'visitors.json');
const FACEBOOK_EVENTS_FILE = path.join(DATABASE_DIR, 'facebook_events.json');

// Função para ler dados JSON
function readJsonFile<T>(filePath: string): T[] {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`📄 Arquivo não encontrado: ${filePath}`);
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    console.log(`📄 Arquivo lido: ${filePath} (${parsed.length} registros)`);
    return parsed;
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo ${filePath}:`, error);
    return [];
  }
}

// Função principal de migração
async function migrate() {
  console.log('🚀 Iniciando migração para Supabase...\n');

  // Verificar se as credenciais do Supabase estão configuradas
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ Credenciais do Supabase não configuradas!');
    console.log('📝 Configure as seguintes variáveis no arquivo .env:');
    console.log('   SUPABASE_URL=sua_url_do_supabase');
    console.log('   SUPABASE_SERVICE_KEY=sua_service_key');
    process.exit(1);
  }

  try {
    // Importar dinamicamente após as variáveis estarem carregadas
    const { testConnection, DatabaseUtils, VisitorDatabase, FacebookEventDatabase } = await import('../server/database-supabase');
    
    // Testar conexão com Supabase
    console.log('🔌 Testando conexão com Supabase...');
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Não foi possível conectar ao Supabase');
      console.log('📝 Verifique:');
      console.log('   1. Se as credenciais estão corretas');
      console.log('   2. Se as tabelas foram criadas (execute o SQL do arquivo database/supabase-schema.sql)');
      process.exit(1);
    }

  // Ler dados dos arquivos JSON
  console.log('\n📂 Lendo dados dos arquivos JSON...');
  const jsonVisitors = readJsonFile(VISITORS_FILE);
  const jsonEvents = readJsonFile(FACEBOOK_EVENTS_FILE);

  if (jsonVisitors.length === 0 && jsonEvents.length === 0) {
    console.log('📭 Nenhum dado encontrado para migrar');
    return;
  }

  console.log(`\n📊 Dados encontrados:`);
  console.log(`   Visitantes: ${jsonVisitors.length}`);
  console.log(`   Eventos Facebook: ${jsonEvents.length}`);

  // Confirmar migração
  console.log('\n⚠️  Esta operação irá migrar todos os dados para o Supabase');
  console.log('📝 Certifique-se de que:');
  console.log('   1. As tabelas foram criadas no Supabase');
  console.log('   2. Você tem backup dos dados JSON');
  console.log('   3. As credenciais do Supabase estão corretas\n');

    // Executar migração
    const result = await DatabaseUtils.migrateFromJson(jsonVisitors, jsonEvents);
    
    console.log('\n📈 Resultado da migração:');
    console.log('👤 Visitantes:');
    console.log(`   Total: ${result.visitors.total}`);
    console.log(`   Sucesso: ${result.visitors.success}`);
    console.log(`   Erros: ${result.visitors.errors}`);
    
    console.log('\n📊 Eventos Facebook:');
    console.log(`   Total: ${result.events.total}`);
    console.log(`   Sucesso: ${result.events.success}`);
    console.log(`   Erros: ${result.events.errors}`);

    if (result.visitors.errors === 0 && result.events.errors === 0) {
      console.log('\n✅ Migração concluída com sucesso!');
      
      // Gerar backup dos arquivos JSON originais
      const backupDir = path.join(DATABASE_DIR, 'backup-' + Date.now());
      fs.mkdirSync(backupDir, { recursive: true });
      
      if (fs.existsSync(VISITORS_FILE)) {
        fs.copyFileSync(VISITORS_FILE, path.join(backupDir, 'visitors.json'));
      }
      if (fs.existsSync(FACEBOOK_EVENTS_FILE)) {
        fs.copyFileSync(FACEBOOK_EVENTS_FILE, path.join(backupDir, 'facebook_events.json'));
      }
      
      console.log(`💾 Backup dos arquivos JSON criado em: ${backupDir}`);
      console.log('\n🔄 Para usar o Supabase como banco de dados:');
      console.log('   1. Substitua as importações de database.ts por database-supabase.ts');
      console.log('   2. Reinicie o servidor');
      
    } else {
      console.log('\n⚠️  Migração concluída com alguns erros');
      console.log('📝 Verifique os logs acima para detalhes dos erros');
    }

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Função para testar o Supabase sem migrar
async function test() {
  console.log('🧪 Testando integração com Supabase...\n');

  try {
    // Importar dinamicamente após as variáveis estarem carregadas
    const { testConnection, DatabaseUtils } = await import('../server/database-supabase');
    
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return;
    }

    // Testar estatísticas
    console.log('📊 Testando estatísticas...');
    const stats = await DatabaseUtils.getFullReport();
    console.log('Estatísticas atuais:', JSON.stringify(stats, null, 2));

    console.log('\n✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Função para exibir ajuda
function showHelp() {
  console.log('🔧 Script de migração para Supabase\n');
  console.log('Uso: npm run migrate [comando]\n');
  console.log('Comandos disponíveis:');
  console.log('  migrate    Migrar dados JSON para Supabase (padrão)');
  console.log('  test       Testar conexão e funcionalidades do Supabase');
  console.log('  help       Exibir esta ajuda\n');
  console.log('Exemplos:');
  console.log('  npm run migrate');
  console.log('  npm run migrate test');
  console.log('  npm run migrate help');
}

// Executar script
async function main() {
  const command = process.argv[2] || 'migrate';

  switch (command) {
    case 'migrate':
      await migrate();
      break;
    case 'test':
      await test();
      break;
    case 'help':
      showHelp();
      break;
    default:
      console.error(`❌ Comando desconhecido: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// Executar se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}