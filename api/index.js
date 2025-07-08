// Função serverless simples para Vercel
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://chef-italy-miro.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Para rotas API, retornar JSON simples
  if (req.url.startsWith('/api/')) {
    res.status(200).json({ message: 'API funcionando', url: req.url });
    return;
  }

  // Para todas as outras rotas, servir o HTML do React
  try {
    const htmlPath = join(__dirname, '..', 'dist', 'public', 'index.html');
    const html = readFileSync(htmlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar página', details: error.message });
  }
}