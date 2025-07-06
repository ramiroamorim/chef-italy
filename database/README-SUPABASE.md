# Migração para Supabase - Chef Amélie

Este guia explica como migrar o sistema de armazenamento de dados de arquivos JSON para o Supabase.

## 📋 Pré-requisitos

1. **Conta no Supabase**: Criar uma conta em [supabase.com](https://supabase.com)
2. **Projeto no Supabase**: Criar um novo projeto
3. **Credenciais**: Obter a URL e as chaves do projeto

## 🚀 Passo a passo da migração

### 1. Configurar credenciais do Supabase

Edite o arquivo `.env` e adicione suas credenciais do Supabase:

```env
# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_KEY=sua_service_key_aqui
```

**Onde encontrar as credenciais:**
- Acesse seu projeto no Supabase
- Vá em `Settings` > `API`
- Copie a `URL` e as chaves `anon` e `service_role`

### 2. Criar as tabelas no Supabase

Execute o SQL do arquivo `database/supabase-schema.sql` no seu projeto Supabase:

1. No painel do Supabase, vá em `SQL Editor`
2. Crie uma nova query
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Execute a query

Isso criará:
- Tabela `visitors` (dados de visitantes)
- Tabela `facebook_events` (eventos do Facebook Pixel)
- Índices para performance
- Funções para estatísticas
- Políticas de segurança (RLS)

### 3. Testar a conexão

Antes de migrar, teste se tudo está funcionando:

```bash
npm run test:supabase
```

Este comando irá:
- Testar a conexão com o Supabase
- Verificar se as tabelas existem
- Executar algumas operações básicas

### 4. Executar a migração

Com tudo configurado, execute a migração:

```bash
npm run migrate:supabase
```

O script irá:
- Ler os dados dos arquivos JSON
- Migrar visitantes para a tabela `visitors`
- Migrar eventos para a tabela `facebook_events`
- Criar backup dos arquivos JSON originais
- Exibir relatório da migração

### 5. Atualizar o código para usar Supabase

Após a migração bem-sucedida, atualize as importações no código:

**Arquivos que precisam ser atualizados:**

1. `server/routes.ts`
2. Qualquer outro arquivo que importe de `./database`

**Substituir:**
```typescript
import { VisitorDatabase, FacebookEventDatabase, DatabaseUtils } from './database';
```

**Por:**
```typescript
import { VisitorDatabase, FacebookEventDatabase, DatabaseUtils } from './database-supabase';
```

### 6. Reiniciar o servidor

```bash
npm run dev
```

## 📊 Estrutura das tabelas

### Tabela `visitors`
Armazena dados de visitantes coletados pelo sistema de tracking.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único (gerado automaticamente) |
| `session_id` | VARCHAR(255) | ID da sessão do visitante |
| `ip` | VARCHAR(45) | Endereço IP |
| `country` | VARCHAR(100) | País |
| `country_code` | VARCHAR(2) | Código do país |
| `city` | VARCHAR(100) | Cidade |
| `region_name` | VARCHAR(100) | Estado/região |
| `zip` | VARCHAR(20) | CEP |
| `latitude` | DECIMAL(10,8) | Latitude |
| `longitude` | DECIMAL(11,8) | Longitude |
| `timezone` | VARCHAR(50) | Fuso horário |
| `currency` | VARCHAR(3) | Moeda |
| `isp` | VARCHAR(255) | Provedor de internet |
| `user_agent` | TEXT | User agent do navegador |
| `page_url` | TEXT | URL da página |
| `referrer` | TEXT | Referrer |
| `utm_*` | VARCHAR(255) | Parâmetros UTM |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

### Tabela `facebook_events`
Armazena eventos do Facebook Pixel enviados via CAPI.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único |
| `event_type` | VARCHAR(50) | Tipo do evento |
| `event_id` | VARCHAR(255) | ID do evento |
| `session_id` | VARCHAR(255) | ID da sessão |
| `custom_parameters` | JSONB | Parâmetros customizados |
| `original_data` | JSONB | Dados originais |
| `formatted_data` | JSONB | Dados formatados |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

## 🔧 Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run test:supabase` | Testa a conexão com Supabase |
| `npm run migrate:supabase` | Executa a migração completa |

## 🔒 Segurança

O projeto implementa Row Level Security (RLS) no Supabase:
- Apenas a service role tem acesso completo aos dados
- Todas as operações são feitas via backend
- As chaves nunca são expostas no frontend

## 📈 Vantagens do Supabase

1. **Escalabilidade**: Banco PostgreSQL gerenciado
2. **Performance**: Índices otimizados para consultas frequentes
3. **Backup automático**: Dados seguros com backup automático
4. **Real-time**: Capacidade de subscrições em tempo real
5. **API automática**: APIs REST e GraphQL geradas automaticamente
6. **Dashboard**: Interface web para visualizar e gerenciar dados

## 🔄 Rollback (voltar ao sistema JSON)

Se precisar voltar ao sistema de arquivos JSON:

1. Restaure os backups dos arquivos JSON
2. Reverta as importações nos arquivos de código
3. Reinicie o servidor

Os backups são criados automaticamente em `database/collections/backup-[timestamp]/`

## 🐛 Troubleshooting

### Erro de conexão
- Verifique se as credenciais estão corretas
- Confirme se o projeto Supabase está ativo
- Teste a conectividade de rede

### Erro nas tabelas
- Execute novamente o SQL de criação das tabelas
- Verifique se todas as funções foram criadas
- Confirme as permissões RLS

### Erro na migração
- Verifique os logs para identificar registros específicos com erro
- Confirme se os dados JSON estão no formato correto
- Execute a migração novamente (é seguro re-executar)

## 📞 Suporte

Para problemas específicos da migração:
1. Verifique os logs do console
2. Confirme as configurações do Supabase
3. Execute o teste de conexão primeiro

A migração preserva todos os dados existentes e cria backups automáticos para segurança.