import React from "react";
import { LINKS, COLORS, TEXTS } from "@/config";
import { ChefImages, TestimonialImages } from '@/assets/imageExports';
// Importando as imagens diretamente para garantir que o Vite processe corretamente
import recipeBookImage from '@/assets/images/recipes/Perfil Chef Sofia.png book .png';
import recipeBookNewImage from '@/assets/images/recipes/Perfil Chef Sofia.png'; // Imagem nova para a segunda ocorrência
import recipesMainImage from '@/assets/images/recipes/recipes-main.png';
import etapa07Image from '@/assets/images/quiz/etapa-07.png';

// Objeto modificado com referências diretas
const RecipeImages = {
  book: recipeBookImage,
  main: recipesMainImage,
  gridCollage: etapa07Image
};

// Componente de botão pulsante verde - versão simplificada e funcional 
const GreenPulseButton = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Logs para debug
    console.log('🛒 CLICK DETECTADO - Botão da Hotmart'); // botao ok  
    console.log('🔗 URL:', href);
    
    // Permitir comportamento padrão do link - não prevenir
    // O navegador irá abrir em nova aba naturalmente
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
    <p style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>Valore reale del pacchetto: <span className="line-through">34€</span></p>
    <p style={{ fontSize: "1.35rem", fontWeight: "bold", color: COLORS.PRIMARY, marginBottom: "1rem" }}>Oggi: solo 17€</p>
    <p style={{ fontSize: "1.05rem", fontWeight: "bold", color: COLORS.ERROR, marginBottom: "1.5rem" }}>⚠️ Ultimi 20 accessi disponibili a 17€ soltanto!</p>
    
    <GreenPulseButton href={buyUrl}>
      👉🏻 VOGLIO IL PACCHETTO A 17€
    </GreenPulseButton>
    
    <p style={{ fontSize: "1.05rem" }}>📩 Consegna immediata via e-mail.<br />Nessun abbonamento. Nessun vincolo.</p>
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
            <span className="block">500 ricette senza zucchero, senza glutine e senza lattosio</span>
            <span className="block">che nutrono, aiutano a dimagrire con piacere</span>
            <span className="block">e riportano il tuo corpo in equilibrio.</span>
          </h1>

          <div className="mt-3 sm:mt-4">
            <p className="mb-2 text-xs sm:text-sm">Niente diete alla moda. Niente ingredienti impossibili da trovare. Niente piatti tristi.<br />Solo una cucina <strong>autentica, gustosa e liberatoria</strong> — per le donne con intolleranze che vogliono <strong>ancora godersi il cibo, senza paura</strong>.</p>
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
          }}>💚 È per te se...</h3>
          <ul style={{
            listStyle: "none",
            padding: "0 0 0 4px",
            margin: "0",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8"
          }}>
            <li>🌿 Hai intolleranze (glutine, lattosio, zucchero)</li>
            <li>🥗 Vuoi dimagrire senza frustrazione né rinunce impossibili</li>
            <li>😩 Sei stanca di piatti tristi, insipidi o industriali</li>
            <li>✨ Cerchi un metodo semplice, duraturo, umano</li>
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
          }}>🚫 Non è per te se...</h3>
          <ul style={{
            listStyle: "none",
            padding: "0 0 0 4px",
            margin: "0",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8"
          }}>
            <li>🙅‍♀️ Non vuoi cambiare nemmeno una minima abitudine</li>
            <li>🧪 Cerchi una pillola magica che "risolve tutto"</li>
            <li>🌀 Preferisci restare nel caos alimentare</li>
            <li style={{ 
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              fontSize: "0.95rem"
            }}>🍕 Rifiuti anche solo l'idea di cucinare un minimo</li>
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
            Queste ricette non le troverai su Google.
          </p>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8",
            textAlign: "center",
            color: "#333333",
            margin: "0"
          }}>
            Sono nate nella vera cucina di Sofia — non su Pinterest, né su un blog copiato e incollato.<br />Ogni piatto è stato pensato per calmare, nutrire… e restituire il piacere a chi aveva ormai rinunciato
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
          }}>📦 Cosa ricevi subito:</h2>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem", 
            marginBottom: "10px",
            lineHeight: "1.8"
          }}>Un accesso completo a <span style={{ color: "#B34431", fontWeight: "bold" }}>500 ricette esclusive</span>, create e testate dalla Chef Sofia per:</p>
          
          <ul style={{
            listStyle: "none",
            padding: "0 0 0 4px",
            margin: "0",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8"
          }}>
            <li>🍽️ <span style={{ color: "#B34431", fontWeight: "bold" }}>100 colazioni & spuntini</span> — per iniziare la giornata senza picchi glicemici</li>
            <li>🥦 <span style={{ color: "#B34431", fontWeight: "bold" }}>300 pranzi & cene</span> — facili, nutrienti, antinfiammatori</li>
            <li>🍫 <span style={{ color: "#B34431", fontWeight: "bold" }}>100 dolci golosi</span> — senza zucchero raffinato, ma pieni di gusto</li>
            <li>🧭 <span style={{ color: "#B34431", fontWeight: "bold" }}>Ricette organizzate per obiettivo</span>: digestione, sazietà, energia, infiammazione</li>
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
          }}>🎁 BONUS ESCLUSIVI OGGI:</h2>
          
          <ul style={{
            listStyle: "none",
            padding: "0",
            margin: "0",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          }}>
            <li style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "0.95rem", fontWeight: "bold", margin: "0 0 4px 0", lineHeight: "1.8" }}>🎁 Bonus 1: Guida alle sostituzioni intelligenti</p>
              <p style={{ fontSize: "0.95rem", marginLeft: "1rem", margin: "0", lineHeight: "1.8" }}>Sostituisci zucchero, farina e latte senza perdere sapore</p>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "0.95rem", fontWeight: "bold", margin: "0 0 4px 0", lineHeight: "1.8" }}>🎁 Bonus 2: Mappa della sazietà naturale</p>
              <p style={{ fontSize: "0.95rem", marginLeft: "1rem", margin: "0", lineHeight: "1.8" }}>Componi piatti che saziano senza eccessi né ansia</p>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "0.95rem", fontWeight: "bold", margin: "0 0 4px 0", lineHeight: "1.8" }}>🎁 Bonus 3: Protocollo intestino + glicemia</p>
              <p style={{ fontSize: "0.95rem", marginLeft: "1rem", margin: "0", lineHeight: "1.8" }}>Ritrova energia e digestione stabile ogni giorno</p>
            </li>
            <li style={{ marginBottom: "0" }}>
              <p style={{ fontSize: "0.95rem", fontWeight: "bold", margin: "0 0 4px 0", lineHeight: "1.8" }}>🎁 Bonus 4: Lista della spesa intelligente</p>
              <p style={{ fontSize: "0.95rem", marginLeft: "1rem", margin: "0", lineHeight: "1.8" }}>Risparmia tempo con ingredienti semplici, testati, approvati</p>
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
            Non è una dieta. Non è una promessa vuota.
          </p>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8",
            color: "#333333",
            marginBottom: "12px",
            fontWeight: "normal"
          }}>
            È una scorciatoia verso ciò che desideri da anni:<br />mangiare con piacere, <span style={{ color: "#B34431", fontWeight: "600" }}>senza dolore</span>.
          </p>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "0.95rem",
            lineHeight: "1.8",
            color: "#333333",
            marginBottom: "0",
            fontWeight: "normal"
          }}>
            E oggi… ti costa meno di un piatto insipido al ristorante.
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
              maxWidth: "110%",
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
              src={TestimonialImages.testimonial6} 
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
            Con tutto il mio cuore — perché tu possa finalmente mangiare con libertà e piacere.
          </p>
          <p style={{ 
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontSize: "1.05rem", 
            fontStyle: "italic", 
            fontWeight: "500", 
            color: "#B34431"
          }}>
            Chef Sofia Moretti
          </p>
        </div>
      </div>
    </div>
  );
}