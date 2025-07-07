/**
 * Configurações centralizadas da aplicação
 * Arquivo que contém todas as constantes, URLs e configurações importantes
 */

// Links externos
export const LINKS = {
  SALES: {
    BUY_URL: "https://pay.hotmart.com/D98080625O?off=1n1vmmyz&checkoutMode=10"
  }
};

// Cores principais da aplicação
export const COLORS = {
  PRIMARY: "#B34431",  // Tom de vermelho escuro usado em textos importantes
  PRIMARY_DARK: "#993322", // Versão mais escura para hover
  PRIMARY_LIGHT: "#FFF1EE", // Fundo claro para seções destacadas
  SUCCESS: "#57C084", // Verde para botões de ação/compra
  SUCCESS_DARK: "#45A26C", // Verde mais escuro para hover
  WARNING: "#FF9800", // Laranja para bonus e destaques
  ERROR: "#F44336", // Vermelho para alertas e limites
  INFO: "#2196F3", // Azul para informações
  BACKGROUND: "#FFFFFF", // Fundo branco padrão
  TEXT: "#333333", // Texto principal
  BORDER_LIGHT: "#F5DED9" // Bordas claras
};

// Tempos de animações
export const ANIMATIONS = {
  TESTIMONIAL_AUTO_ADVANCE: 5000, // 5 segundos
  CAROUSEL_TRANSITION: 300, // 0.3 segundos
  MIN_SWIPE_DISTANCE: 50 // pixels
};

// Textos compartilhados
export const TEXTS = {
  QUIZ: {
    PROGRESS: "Passaggio {current} di {total}",
    NEXT_BUTTON: "CONTINUA",
    TESTIMONIAL_SWIPE: "Scorri ➤ per vedere cosa dicono."
  },
  SALES: {
    PRICE: {
      ORIGINAL: "34€",
      CURRENT: "9€",
      REMAINING: "Ultimi 20 accessi disponibili a 9€ soltanto!"
    },
    BUY_BUTTON: "👉🏻 VOGLIO IL PACCHETTO A 9€",
    DELIVERY: "Consegna immediata via e-mail. Nessun abbonamento. Nessun vincolo.",
    BONUSES: [
      {
        title: "🎁 Bonus 1: Guida alle sostituzioni intelligenti",
        description: "Sostituisci zucchero, farina o latte senza perdere il gusto."
      },
      {
        title: "🎁 Bonus 2: Mappa della sazietà naturale",
        description: "Costruisci piatti che saziano senza eccesso."
      },
      {
        title: "🎁 Bonus 3: Protocollo intestino + glicemia",
        description: "Migliora la tua digestione e la tua energia quotidiana."
      },
      {
        title: "🎁 Bonus 4: Lista della spesa intelligente",
        description: "Risparmia tempo con prodotti semplici, testati, approvati."
      }
    ],
    CLOSING_TEXT: [
      "Non è una dieta.",
      "Non è una promessa vuota.",
      "È una scorciatoia verso quello che volevi da anni:",
      "mangiare con piacere, senza dolore.",
      "E oggi ti costa meno di un piatto insipido al ristorante."
    ]
  },
  WEBHOOK: {
    ENABLED: true, // ✅ Ativado para enviar ao nosso servidor
    URL: 'http://localhost:3000/api/tracking/visitor',
    TIMEOUT: 10000
  }
};