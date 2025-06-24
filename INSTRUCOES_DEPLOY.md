# 🚀 Instruções Rápidas - Deploy Easy Panel

## 📦 Arquivo ZIP Criado
**`chef-amelie-deploy.zip`** (285MB) - Pronto para upload!

## ⚡ Deploy Rápido

### 1. Upload no Easy Panel
- Fazer upload do arquivo `chef-amelie-deploy.zip`
- Extrair o conteúdo no servidor

### 2. Configuração Automática
O projeto já está configurado com todos os arquivos necessários:
- ✅ `package.json` com scripts corretos
- ✅ `Procfile` para especificar comando de start
- ✅ `app.json` com configurações do Heroku
- ✅ `Dockerfile` como alternativa
- ✅ `easypanel.json` para configuração específica

### 3. Variáveis de Ambiente
```bash
NODE_ENV=production
PORT=80
```

### 4. Comandos de Deploy
```bash
# Opção 1: Automático
./deploy.sh

# Opção 2: Manual
npm install
npm run build
npm start
```

## 🔧 Se o Easy Panel não reconhecer automaticamente:

### Configuração Manual:
1. **Framework**: Node.js
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Port**: `80`

### Ou usar Docker:
1. **Tipo**: Docker
2. O sistema usará o `Dockerfile` automaticamente

## 📋 Checklist Final
- [ ] Upload do ZIP feito
- [ ] Arquivos extraídos
- [ ] Deploy iniciado
- [ ] Aplicação respondendo na porta 80
- [ ] Domínio configurado

## 🎯 Resultado Esperado
- ✅ Aplicação rodando sem erros
- ✅ Build automático funcionando
- ✅ Porta 80 respondendo
- ✅ Hot reload desabilitado (produção)

---
**Status**: ✅ Pronto para deploy!
**Arquivo**: `chef-amelie-deploy.zip` 