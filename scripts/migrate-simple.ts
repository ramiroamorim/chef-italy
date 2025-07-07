
#!/usr/bin/env tsx

import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Carregar variáveis de ambiente
config({ path: path.resolve(process.cwd(), '.env') });

console.log('🚀 Iniciando migração para Supabase...\n');

// Verificar credenciais
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase não encontradas!');
  process.exit(1);
}

// Arquivos de dados
const DATABASE_DIR = path.join(process.cwd(), 'database', 'collections');
const VISITORS_FILE = path.join(DATABASE_DIR, 'visitors.json');
const FACEBOOK_EVENTS_FILE = path.join(DATABASE_DIR, 'facebook_events.json');

// Função para ler JSON
function readJsonFile<T>(filePath: string): T[] {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`📄 Arquivo não encontrado: ${filePath}`);
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    console.log(`📄 Arquivo lido: ${path.basename(filePath)} (${parsed.length} registros)`);
    return parsed;
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo ${filePath}:`, error);
    return [];
  }
}

async function migrate() {
  try {
    // Importar Supabase dinamicamente
    const { testConnection, DatabaseUtils } = await import('../server/database-supabase');
    
    console.log('🔌 Testando conexão com Supabase...');
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Não foi possível conectar ao Supabase');
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

    console.log('\n🔄 Executando migração...');
    
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
      
      // Criar backup
      const backupDir = path.join(DATABASE_DIR, 'backup-' + Date.now());
      fs.mkdirSync(backupDir, { recursive: true });
      
      if (fs.existsSync(VISITORS_FILE)) {
        fs.copyFileSync(VISITORS_FILE, path.join(backupDir, 'visitors.json'));
      }
      if (fs.existsSync(FACEBOOK_EVENTS_FILE)) {
        fs.copyFileSync(FACEBOOK_EVENTS_FILE, path.join(backupDir, 'facebook_events.json'));
      }
      
      console.log(`💾 Backup criado em: ${backupDir}`);
      console.log('\n🔄 Para usar o Supabase:');
      console.log('   1. Substitua as importações de database.ts por database-supabase.ts');
      console.log('   2. Reinicie o servidor');
      
    } else {
      console.log('\n⚠️  Migração concluída com alguns erros');
    }

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar
migrate();