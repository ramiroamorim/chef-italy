#!/bin/bash

# Script de deploy otimizado para Chef Amélie Dupont
echo "🚀 Iniciando processo de build e deploy..."

# Limpar diretório de build anterior
echo "🧹 Limpando diretório de build anterior..."
rm -rf dist

# Executar build do frontend e backend
echo "🔨 Construindo aplicação frontend e backend..."
npm run build

# Verificar se a build foi bem-sucedida
if [ $? -ne 0 ]; then
  echo "❌ Erro no processo de build! Abortando deploy."
  exit 1
fi

# Garantir que a estrutura de arquivos estáticos esteja correta
echo "📁 Organizando estrutura de arquivos estáticos..."

# Verificar se a pasta de public existe
if [ ! -d "dist/public/assets" ]; then
  echo "⚠️ Pasta de assets não foi criada corretamente, criando estrutura..."
  mkdir -p dist/public/assets
fi

# Copiar imagens essenciais se não estiverem presentes
echo "🖼️ Copiando assets essenciais..."
cp -n public/images/* dist/public/images/ 2>/dev/null || true
cp -n public/testimonials/* dist/public/testimonials/ 2>/dev/null || true
cp -n public/testimonial-images/* dist/public/testimonial-images/ 2>/dev/null || true

# Otimizar tamanho dos arquivos JS/CSS
echo "⚡ Otimizando arquivos para produção..."
find dist -name "*.js" -o -name "*.css" | xargs gzip -9 -k 2>/dev/null || true

# Verificação final da estrutura
echo "✅ Verificando estrutura final do build..."
find dist -type f | sort

echo "✨ Build concluído e otimizado com sucesso!"
echo "🌐 Para iniciar o servidor de produção, execute: npm run start"