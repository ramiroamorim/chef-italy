import React from "react";
import { LINKS, COLORS, TEXTS } from "@/config";
import { ChefImages, TestimonialImages } from '@/assets/imageExports';
// Importando as imagens diretamente para garantir que o Vite processe corretamente
import recipeBookImage from '@/assets/images/recipes/recipe-book.png';
import recipeBookNewImage from '@/assets/images/recipes/recipe-book-new.png'; // Imagem nova para a segunda ocorrência
import recipesMainImage from '@/assets/images/recipes/recipes-main.png';
import recipesGridCollageImage from '@/assets/images/recipes/recipes-grid-collage.png';

// Objeto modificado com referências diretas
const RecipeImages = {
  book: recipeBookImage,
  main: recipesMainImage,
  gridCollage: recipesGridCollageImage
};

// Componente de botão pulsante verde - versão robusta
const GreenPulseButton = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Logs detalhados para debug
    console.log('🛒 CLICK DETECTADO - Botão da Hotmart');
    console.log('🔗 URL:', href);
    console.log('🖱️ Event details:', {
      type: e.type,
      button: e.button,
      buttons: e.buttons,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey
    });
    
    // Verificar se há popup blockers
    console.log('🔒 Verificando popup blockers...');
    
    // Múltiplas tentativas de abertura para garantir funcionamento
    try {
      // Método 1: window.open com timeout
      console.log('🚀 Tentativa 1: window.open');
      const newWindow = window.open(href, '_blank', 'noopener,noreferrer');
      
      // Aguardar e verificar se abriu
      setTimeout(() => {
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          console.log('⚠️ Popup bloqueado ou falhou - tentando método 2');
          try {
            window.location.assign(href);
          } catch (assignError) {
            console.log('⚠️ location.assign falhou - tentando método 3');
            window.location.href = href;
          }
        } else {
          console.log('✅ Popup aberto com sucesso!');
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Erro na tentativa 1:', error);
      // Método 2: location.assign
      try {
        console.log('🚀 Tentativa 2: location.assign');
        window.location.assign(href);
      } catch (assignError) {
        console.error('❌ Erro na tentativa 2:', assignError);
        // Método 3: location.href (fallback final)
        console.log('🚀 Tentativa 3: location.href');
        window.location.href = href;
      }
    }
  };
  
  return (
    <div className="relative inline-block w-full md:w-auto mb-4">
      <div className="absolute inset-0 rounded-full opacity-30" 
        style={{
          backgroundColor: COLORS.SUCCESS,
          animation: "ping 3s cubic-bezier(0.66, 0, 0, 1) infinite"
        }}
      ></div>
      <a 
        href={href}
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleClick}
        className="relative inline-block w-full py-3 sm:py-4 px-6 sm:px-10 text-base sm:text-lg font-bold rounded-full text-white cursor-pointer"
        style={{ 
          backgroundColor: COLORS.SUCCESS,
          boxShadow: `0 4px 10px rgba(87, 192, 132, 0.3)`,
          transition: "background-color 0.3s ease",
          textDecoration: "none",
          display: "block",
          textAlign: "center",
          pointerEvents: "auto"
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.SUCCESS_DARK}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.SUCCESS}
      >
        {children}
      </a>
    </div>
  );
};

// Componente para exibir a seção de preço e botão de compra
const PriceSection = ({ buyUrl }: { buyUrl: string }) => (
  <div className="py-5 sm:py-6 px-4 sm:px-6 text-center mb-6 sm:mb-8 rounded-lg border" 
    style={{ 
      backgroundColor: "#FFF5F5", 
      borderColor: "#FFE5E5" 
    }}>
    <p style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>Valore reale del pack: <span className="line-through">34€</span></p>
    <p style={{ fontSize: "1.35rem", fontWeight: "bold", color: COLORS.PRIMARY, marginBottom: "1rem" }}>Oggi: solo 17€</p>
    <p style={{ fontSize: "1.05rem", fontWeight: "bold", color: COLORS.ERROR, marginBottom: "1.5rem" }}>⚠️ Ultime 20 unità disponibili a soli 17€!</p>
    
    <GreenPulseButton href={buyUrl}>
      VOGLIO IL PACK A 17€
    </GreenPulseButton>
    
    <p style={{ fontSize: "1.05rem" }}>📩 Consegna immediata via email. Senza abbonamento. Senza impegno.</p>
  </div>
);

export default function SalesPage() {
  // URL limpa da Hotmart - sem parâmetros extras
  const buyUrl = LINKS.SALES.BUY_URL;
  
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[500px] mx-auto px-3 sm:px-4 py-6 sm:py-8 text-[#333]">
        {/* Cabeçalho da página */}
        <div className="bg-[#FFF8F5] p-4 sm:p-6 rounded-md mb-6 sm:mb-8">
          <h1 style={{ 
            fontFamily: "Georgia, 'Times New Roman', serif", 
            fontStyle: "italic",
            color: "#B34431",
            fontSize: "1.5rem",
            lineHeight: "1.4",
            marginBottom: "1rem",
            fontWeight: "normal"
          }}>
            <span className="block">500 ricette senza zucchero, senza</span>
            <span className="block">glutine e senza lattosio</span>
            <span className="block">che nutrono, fanno dimagrire</span>
            <span className="block">con piacere</span>
            <span className="block">e riequilibrano il tuo corpo.</span>
          </h1>

          <div className="mt-3 sm:mt-4">
            <p className="mb-2 text-xs sm:text-sm">Nessuna dieta di moda. Nessun ingrediente impossibile da trovare. Nessun piatto triste.</p>
            <p className="mb-2 text-xs sm:text-sm">Solo una cucina <strong>vera, gustosa e liberatrice</strong> — per le donne con restrizioni che vogliono ancora <strong>deliziarsi senza paura.</strong></p>
          </div>
        </div>

        {/* Imagem única da grade de receitas conforme a referência */}
        <div className="mb-8 border border-gray-200 rounded-md overflow-hidden">
          <img 
            src={RecipeImages.gridCollage} 
            alt="Collezione di ricette senza zucchero, senza glutine e senza lattosio"
            className="w-full h-auto"
          />
        </div>

        {/* Pour qui c'est: section */}
        <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-md border-l-4 bg-[#F1F9F1] border-[#57C084]">
          <h3 style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "1.05rem",
            fontWeight: "700",
            color: "#57C084",
            marginBottom: "10px"
          }}>💚 Per chi è:</h3>
          <ul style={{
            listStyle: "none",
            padding: "0 0 0 4px",
            margin: "0",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8"
          }}>
            <li>🌿 Donne con intolleranze (glutine, lattosio, zucchero)</li>
            <li>🥗 Quelle che vogliono dimagrire senza frustrazione</li>
            <li>😩 Quelle stanche di piatti tristi e senza sapore</li>
            <li>✨ Quelle che vogliono un metodo semplice e duraturo</li>
          </ul>
        </div>

        {/* Pour qui ce n'est pas: section */}
        <div style={{
          backgroundColor: "#FFF5F5",
          marginBottom: "20px",
          padding: "14px 16px",
          borderRadius: "8px",
          borderLeft: "4px solid #F44336"
        }}>
          <h3 style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "1.05rem",
            fontWeight: "700",
            color: "#F44336",
            marginBottom: "10px"
          }}>🚫 Per chi non è:</h3>
          <ul style={{
            listStyle: "none",
            padding: "0 0 0 4px",
            margin: "0",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8"
          }}>
            <li>🙅‍♀️ Quelle che non vogliono cambiare le loro abitudini</li>
            <li>🧪 Quelle che cercano una soluzione magica</li>
            <li>🌀 Quelle che preferiscono rimanere nel disordine</li>
            <li style={{ 
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              fontSize: "0.95rem"
            }}>🍕 Quelle che rifiutano di cucinare anche un minimo</li>
          </ul>
        </div>

        {/* Recettes exclusives section */}
        <div style={{
          backgroundColor: "#FFF1EE", 
          padding: "24px 16px",
          marginBottom: "20px",
          borderRadius: "12px",
          border: "1px solid #F5DED9",
          borderLeft: "4px solid #B34431"
        }}>
          <p style={{ 
            fontFamily: "Georgia, serif", 
            fontStyle: "italic",
            color: "#B34431",
            fontSize: "1.05rem",
            lineHeight: "1.3",
            marginBottom: "16px",
            textAlign: "center",
            fontWeight: "bold"
          }}>
            Non troverai queste ricette su Google.
          </p>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.6",
            textAlign: "center",
            color: "#333333",
            margin: "0"
          }}>
            Sono nate nella vera cucina di Amélie — non su Pinterest, né in un blog copiato. Ogni piatto è stato pensato per <span style={{ fontWeight: "700" }}>placare, nutrire</span>... e ridare <span style={{ fontWeight: "700" }}>piacere</span> a quelle che avevano rinunciato.
          </p>
        </div>
        

        

        


        {/* Imagem das páginas do livro */}
        <div className="mb-4 sm:mb-5 overflow-hidden">
          <img 
            src={RecipeImages.book} 
            alt="Pagine del libro di ricette senza zucchero"
            className="w-full h-auto rounded-xl shadow-lg"
            style={{ 
              border: "1px solid #f0f0f0",
              maxWidth: "100%",
              display: "block",
              margin: "0 auto"
            }}
            onError={(e) => {
              console.error("Erro ao carregar imagem:", e);
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Previne loop infinito
              // Tentar usar uma URL absoluta como fallback
              if (RecipeImages && RecipeImages.main) {
                target.src = RecipeImages.main;
              }
            }}
          />
        </div>

        {/* Ce que vous allez recevoir section */}
        <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-md border-l-4 bg-[#F5F9FF] border-[#2196F3]">
          <h2 style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "1.05rem", 
            fontWeight: "700", 
            color: "#2196F3", 
            marginBottom: "10px" 
          }}>📦 Ce que vous allez recevoir :</h2>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem", 
            marginBottom: "10px",
            lineHeight: "1.8"
          }}>Un accès à <span style={{ color: "#B34431", fontWeight: "bold" }}>500 recettes exclusives</span> créées et testées par la Cheffe Amélie — organisées pour nourrir, apaiser et régaler votre quotidien.</p>
          
          <ul style={{
            listStyle: "none",
            padding: "0 0 0 4px",
            margin: "0",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8"
          }}>
            <li>🍽️ <span style={{ color: "#B34431", fontWeight: "bold" }}>100 petits-déjeuners & collations</span> — pour bien démarrer la journée, sans pic de sucre</li>
            <li>🥦 <span style={{ color: "#B34431", fontWeight: "bold" }}>300 déjeuners & dîners</span> — faciles, nourrissants et équilibrés, pour tous les jours</li>
            <li>🍫 <span style={{ color: "#B34431", fontWeight: "bold" }}>100 desserts gourmands</span> — sans sucre raffiné, mais pleins de plaisir</li>
            <li>🧭 <span style={{ color: "#B34431", fontWeight: "bold" }}>Recettes classées par objectif</span> : digestion, satiété, inflammation, énergie</li>
          </ul>
        </div>



        {/* Bonus exclusifs section */}
        <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-md border-l-4 bg-[#FFF8E8] border-[#FF9800]">
          <h2 style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "1.05rem", 
            fontWeight: "700", 
            color: "#FF9800", 
            marginBottom: "10px" 
          }}>🎁 Bonus exclusifs inclus aujourd'hui :</h2>
          
          <ul style={{
            listStyle: "none",
            padding: "0",
            margin: "0",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          }}>
            <li style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "0.95rem", fontWeight: "bold", margin: "0 0 4px 0", lineHeight: "1.8" }}>🎁 Bonus 1 : Guide de substitutions intelligentes</p>
              <p style={{ fontSize: "0.95rem", marginLeft: "1rem", margin: "0", lineHeight: "1.8" }}>Remplacez sucre, farine ou lait sans perdre le goût.</p>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "0.95rem", fontWeight: "bold", margin: "0 0 4px 0", lineHeight: "1.8" }}>🎁 Bonus 2 : Carte de satiété naturelle</p>
              <p style={{ fontSize: "0.95rem", marginLeft: "1rem", margin: "0", lineHeight: "1.8" }}>Construisez des assiettes qui rassasient sans excès.</p>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "0.95rem", fontWeight: "bold", margin: "0 0 4px 0", lineHeight: "1.8" }}>🎁 Bonus 3 : Protocole intestin + glycémie</p>
              <p style={{ fontSize: "0.95rem", marginLeft: "1rem", margin: "0", lineHeight: "1.8" }}>Améliorez votre digestion et votre énergie au quotidien.</p>
            </li>
            <li style={{ marginBottom: "0" }}>
              <p style={{ fontSize: "0.95rem", fontWeight: "bold", margin: "0 0 4px 0", lineHeight: "1.8" }}>🎁 Bonus 4 : Liste de courses intelligente</p>
              <p style={{ fontSize: "0.95rem", marginLeft: "1rem", margin: "0", lineHeight: "1.8" }}>Gagnez du temps avec des produits simples, testés, validés.</p>
            </li>
          </ul>
        </div>

        {/* Texto adicional conforme a referência */}
        <div style={{
          backgroundColor: "#FFF9F3", 
          padding: "24px 16px",
          marginBottom: "24px",
          borderRadius: "12px",
          border: "1px solid #F5E9DE",
          borderLeft: "4px solid #B34431"
        }}>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8",
            color: "#333333",
            marginBottom: "12px",
            fontWeight: "normal"
          }}>
            Ce n'est pas un régime. Ce n'est pas une promesse vide.
          </p>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8",
            color: "#333333",
            marginBottom: "12px",
            fontWeight: "normal"
          }}>
            C'est un raccourci vers ce que vous vouliez depuis des années : <span style={{ color: "#B34431", fontWeight: "600" }}>manger avec plaisir, sans douleur.</span>
          </p>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8",
            color: "#333333",
            marginBottom: "0",
            fontWeight: "normal"
          }}>
            Et aujourd'hui, ça vous coûte moins qu'un plat fade au resto.
          </p>
        </div>
        
        {/* Imagem do livro de receitas após o texto */}
        <div className="mb-5 sm:mb-6 overflow-hidden">
          <img 
            src={recipeBookNewImage} 
            alt="Livre de recettes Chef Amélie Dupont"
            className="w-full h-auto rounded-xl shadow-lg"
            style={{ 
              border: "1px solid #f0f0f0",
              maxWidth: "100%",
              display: "block",
              margin: "0 auto"
            }}
            onError={(e) => {
              console.error("Erro ao carregar imagem:", e);
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Previne loop infinito
              // Tentar usar uma URL absoluta como fallback
              if (RecipeImages && RecipeImages.main) {
                target.src = RecipeImages.main;
              }
            }}
          />
        </div>

        {/* Seção de preço e compra */}
        <PriceSection buyUrl={buyUrl} />

        {/* Duas imagens de testemunhos/mensagens */}
        <div className="mb-5 sm:mb-6 space-y-3 sm:space-y-4">
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <img 
              src={TestimonialImages.bread} 
              alt="Témoignage client - pain sans gluten"
              className="w-full h-auto"
            />
          </div>
          
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <img 
              src={TestimonialImages.brownie} 
              alt="Témoignage client - brownie sans sucre"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Seção final de preço e compra */}
        <PriceSection buyUrl={buyUrl} />

        {/* Assinatura da Chef */}
        <div className="text-center mb-6 mt-12 pt-4 pb-2" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem", 
            marginBottom: "10px", 
            color: "#666666", 
            lineHeight: "1.8"
          }}>
            Avec tout mon cœur — pour que vous puissiez enfin manger avec liberté et plaisir.
          </p>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "1.05rem", 
            fontStyle: "italic", 
            fontWeight: "500", 
            color: "#B34431"
          }}>
            Cheffe Amélie Dupont
          </p>
        </div>
      </div>
    </div>
  );
}
