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

  // Para todas as outras rotas, servir HTML do React
  const html = `<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Chef Sofia Moretti - Quiz Profilo di Gola</title>
    <meta name="description" content="Scopri il tuo profilo di gola e accedi alla collezione privata di 500 ricette senza zucchero, senza glutine e senza lattosio della Chef Sofia Moretti." />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    
    <!-- Facebook Pixel Code -->
    <script>
      try {
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;t.onerror=function(){console.warn('Facebook Pixel failed to load');};
        s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', '644431871463181');
        console.log('🎯 Facebook Pixel inicializado - aguardando React...');
        
      } catch(e) {
        console.warn('Facebook Pixel initialization failed:', e);
      }
    </script>
    
    <script src="https://cdn.utmify.com.br/scripts/utms/latest.js" data-utmify-prevent-subids async defer></script>
    <script type="module" crossorigin src="/assets/index-Dt7G1mXY.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-BCwOgHYb.css">
  </head>

  <body>
    <noscript><img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=644431871463181&ev=PageView&noscript=1"
    /></noscript>
    
    <div id="root"></div>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}