#!/bin/bash

echo "🚀 Iniciando deploy..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -f "dist/index.js" ]; then
    echo "❌ Erro: Build falhou - arquivo dist/index.js não encontrado"
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo "📁 Arquivos gerados em: dist/"

# Verificar se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Parar aplicação existente se estiver rodando
echo "🛑 Parando aplicação existente..."
pm2 stop chef-amelie-app 2>/dev/null || true
pm2 delete chef-amelie-app 2>/dev/null || true

# Iniciar aplicação com PM2
echo "▶️ Iniciando aplicação com PM2..."
pm2 start ecosystem.config.js --env production

# Salvar configuração do PM2
pm2 save

echo "🎉 Deploy concluído com sucesso!"
echo "📊 Status da aplicação:"
pm2 status 