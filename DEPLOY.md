# 🚀 Guia de Deploy - Easy Panel

## 📋 Pré-requisitos

- Node.js 18+ instalado
- NPM ou Yarn
- PM2 (será instalado automaticamente)

## 🔧 Configuração do Easy Panel

### 1. Configuração do Domínio
- Configure o domínio para apontar para a porta 3000
- Ou use proxy reverso para redirecionar da porta 80/443 para 3000

### 2. Variáveis de Ambiente (se necessário)
```bash
NODE_ENV=production
PORT=3000
```

## 📦 Deploy Automático

### Opção 1: Script Automático
```bash
./deploy.sh
```

### Opção 2: Comandos Manuais
```bash
# 1. Instalar dependências
npm install

# 2. Build do projeto
npm run build

# 3. Instalar PM2 (se não estiver instalado)
npm install -g pm2

# 4. Iniciar aplicação
pm2 start ecosystem.config.js --env production

# 5. Salvar configuração
pm2 save
```

## 🔍 Verificação

### Status da Aplicação
```bash
pm2 status
pm2 logs chef-amelie-app
```

### Teste da Aplicação
```bash
curl http://localhost:3000
```

## 🛠️ Comandos Úteis

### Reiniciar Aplicação
```bash
pm2 restart chef-amelie-app
```

### Parar Aplicação
```bash
pm2 stop chef-amelie-app
```

### Ver Logs
```bash
pm2 logs chef-amelie-app --lines 100
```

### Monitoramento
```bash
pm2 monit
```

## 📁 Estrutura de Arquivos

Após o build, os arquivos principais estarão em:
- `dist/index.js` - Servidor principal
- `dist/public/` - Arquivos estáticos do cliente

## ⚠️ Troubleshooting

### Erro: Porta já em uso
```bash
# Verificar processos na porta 3000
lsof -i :3000

# Matar processo se necessário
kill -9 <PID>
```

### Erro: Build falhou
```bash
# Limpar cache e node_modules
rm -rf node_modules dist
npm install
npm run build
```

### Erro: PM2 não encontrado
```bash
npm install -g pm2
```

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do PM2: `pm2 logs chef-amelie-app`
2. Logs do sistema: `journalctl -u pm2-ramiroamorim`
3. Status do processo: `pm2 status` 