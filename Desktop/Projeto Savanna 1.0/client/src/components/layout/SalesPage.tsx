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

// Componente de botão pulsante verde
const GreenPulseButton = ({ href, children }: { href: string; children: React.ReactNode }) => {
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
        className="relative inline-block w-full py-3 sm:py-4 px-6 sm:px-10 text-base sm:text-lg font-bold rounded-full text-white"
        style={{ 
          backgroundColor: COLORS.SUCCESS,
          boxShadow: `0 4px 10px rgba(87, 192, 132, 0.3)`,
          transition: "background-color 0.3s ease"
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
    <p style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>Valeur réelle du pack : <span className="line-through">34€</span></p>
    <p style={{ fontSize: "1.35rem", fontWeight: "bold", color: COLORS.PRIMARY, marginBottom: "1rem" }}>Aujourd'hui : seulement 17€</p>
    <p style={{ fontSize: "1.05rem", fontWeight: "bold", color: COLORS.ERROR, marginBottom: "1.5rem" }}>⚠️ Dernières 20 unités disponibles à 17€ seulement !</p>
    
    <GreenPulseButton href={buyUrl}>
      JE VEUX LE PACK POUR 17€
    </GreenPulseButton>
    
    <p style={{ fontSize: "1.05rem" }}>📩 Livraison immédiate par e-mail. Sans abonnement. Sans engagement.</p>
  </div>
);

export default function SalesPage() {
  // Usando a URL do botão de compra do arquivo centralizado de configurações
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
            <span className="block">500 recettes sans sucre, sans</span>
            <span className="block">gluten et sans lactose</span>
            <span className="block">qui nourrissent, font mincir</span>
            <span className="block">avec plaisir</span>
            <span className="block">et rééquilibrent votre corps.</span>
          </h1>

          <div className="mt-3 sm:mt-4">
            <p className="mb-2 text-xs sm:text-sm">Pas de régime à la mode. Pas d'ingrédients impossibles à trouver. Pas de plats tristes.</p>
            <p className="mb-2 text-xs sm:text-sm">Seulement une cuisine <strong>vraie, savoureuse et libératrice</strong> — pour les femmes avec des restrictions qui veulent encore <strong>se régaler sans peur.</strong></p>
          </div>
        </div>

        {/* Imagem única da grade de receitas conforme a referência */}
        <div className="mb-8 border border-gray-200 rounded-md overflow-hidden">
          <img 
            src={RecipeImages.gridCollage} 
            alt="Collection de recettes sans sucre, sans gluten et sans lactose"
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
          }}>💚 Pour qui c'est:</h3>
          <ul style={{
            listStyle: "none",
            padding: "0 0 0 4px",
            margin: "0",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8"
          }}>
            <li>🌿 Femmes avec intolérances (gluten, lactose, sucre)</li>
            <li>🥗 Celles qui veulent mincir sans frustration</li>
            <li>😩 Celles fatiguées des plats tristes et sans goût</li>
            <li>✨ Celles qui veulent une méthode simple et durable</li>
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
          }}>🚫 Pour qui ce n'est pas:</h3>
          <ul style={{
            listStyle: "none",
            padding: "0 0 0 4px",
            margin: "0",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8"
          }}>
            <li>🙅‍♀️ Celles qui ne veulent pas changer leurs habitudes</li>
            <li>🧪 Celles qui cherchent une solution magique</li>
            <li>🌀 Celles qui préfèrent rester dans le désordre</li>
            <li style={{ 
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              fontSize: "0.95rem"
            }}>🍕 Celles qui refusent de cuisiner même un minimum</li>
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
            Vous ne trouverez pas ces recettes sur Google.
          </p>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.6",
            textAlign: "center",
            color: "#333333",
            margin: "0"
          }}>
            Elles sont nées dans la vraie cuisine d'Amélie — pas sur Pinterest, ni dans un blog copié-collé. Chaque plat a été pensé pour <span style={{ fontWeight: "700" }}>apaiser, nourrir</span>... et redonner du <span style={{ fontWeight: "700" }}>plaisir</span> à celles qui avaient renoncé.
          </p>
        </div>
        

        

        


        {/* Imagem das páginas do livro */}
        <div className="mb-4 sm:mb-5 overflow-hidden">
          <img 
            src={RecipeImages.book} 
            alt="Pages du livre de recettes sans sucre"
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
