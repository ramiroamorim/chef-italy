# ✅ Checklist de Deploy - Easy Panel

## 🔧 Pré-Deploy

- [ ] ✅ Build testado localmente (`npm run build`)
- [ ] ✅ Arquivos `dist/` gerados corretamente
- [ ] ✅ Script `deploy.sh` criado e executável
- [ ] ✅ Configuração `ecosystem.config.js` criada
- [ ] ✅ Arquivo `.nvmrc` especificando Node.js 18
- [ ] ✅ Configuração Nginx criada (se necessário)

## 📦 Arquivos Criados

- [ ] ✅ `ecosystem.config.js` - Configuração PM2
- [ ] ✅ `deploy.sh` - Script de deploy automático
- [ ] ✅ `DEPLOY.md` - Guia completo de deploy
- [ ] ✅ `nginx.conf` - Configuração proxy reverso
- [ ] ✅ `.nvmrc` - Versão do Node.js
- [ ] ✅ `DEPLOY_CHECKLIST.md` - Este checklist

## 🚀 Deploy no Easy Panel

### 1. Upload dos Arquivos
- [ ] Fazer upload de todos os arquivos do projeto
- [ ] Incluir `node_modules` (ou instalar via `npm install`)
- [ ] Verificar se `.gitignore` está correto

### 2. Configuração do Servidor
- [ ] Instalar Node.js 18+ (se não estiver instalado)
- [ ] Configurar domínio para porta 3000
- [ ] Configurar proxy reverso (se necessário)

### 3. Execução do Deploy
```bash
# Opção 1: Script automático
./deploy.sh

# Opção 2: Comandos manuais
npm install
npm run build
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
```

### 4. Verificação
- [ ] ✅ Aplicação respondendo na porta 3000
- [ ] ✅ PM2 gerenciando o processo
- [ ] ✅ Logs sem erros críticos
- [ ] ✅ Domínio acessível

## 🔍 Comandos de Verificação

```bash
# Status da aplicação
pm2 status

# Logs da aplicação
pm2 logs chef-amelie-app

# Teste da aplicação
curl http://localhost:3000

# Monitoramento
pm2 monit
```

## 🛠️ Troubleshooting

### Problemas Comuns:
1. **Porta 3000 em uso**: `lsof -i :3000` e `kill -9 <PID>`
2. **Build falhou**: Limpar `node_modules` e `dist`, reinstalar
3. **PM2 não encontrado**: `npm install -g pm2`
4. **Permissões**: `chmod +x deploy.sh`

## 📞 Suporte

- Logs PM2: `pm2 logs chef-amelie-app`
- Status: `pm2 status`
- Monitoramento: `pm2 monit`

---

**Status do Deploy**: ✅ Pronto para deploy!
**Última verificação**: $(date) 