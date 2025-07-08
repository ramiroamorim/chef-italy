// Função serverless para Vercel
export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Para rotas API, retornar JSON simples
  if (req.url.startsWith('/api/')) {
    res.status(200).json({ message: 'API funcionando', url: req.url });
    return;
  }

  // Para todas as outras rotas, servir HTML simples que carrega o React
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chef Amélie - Quiz Personalizado</title>
    <script type="module" crossorigin src="/assets/index-Dt7G1mXY.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-BCwOgHYb.css">
</head>
<body>
    <div id="root"></div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}