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
    PROGRESS: "Étape {current} sur {total}",
    NEXT_BUTTON: "CONTINUER",
    TESTIMONIAL_SWIPE: "Faites glisser ➤ pour voir ce qu'elles disent."
  },
  SALES: {
    PRICE: {
      ORIGINAL: "34€",
      CURRENT: "17€",
      REMAINING: "Dernières 20 unités disponibles à 17€ seulement!"
    },
    BUY_BUTTON: "JE VEUX LE PACK POUR 17€",
    DELIVERY: "Livraison immédiate par e-mail. Sans abonnement. Sans engagement.",
    BONUSES: [
      {
        title: "🎁 Bonus 1 : Guide de substitutions intelligentes",
        description: "Remplacez sucre, farine ou lait sans perdre le goût."
      },
      {
        title: "🎁 Bonus 2 : Carte de satiété naturelle",
        description: "Construisez des assiettes qui rassasient sans excès."
      },
      {
        title: "🎁 Bonus 3 : Protocole intestin + glycémie",
        description: "Améliorez votre digestion et votre énergie au quotidien."
      },
      {
        title: "🎁 Bonus 4 : Liste de courses intelligente",
        description: "Gagnez du temps avec des produits simples, testés, validés."
      }
    ],
    CLOSING_TEXT: [
      "Ce n'est pas un régime.",
      "Ce n'est pas une promesse vide.",
      "C'est un raccourci vers ce que vous vouliez depuis des années :",
      "manger avec plaisir, sans douleur.",
      "Et aujourd'hui, ça vous coûte moins qu'un plat fade au resto."
    ]
  },
  WEBHOOK: {
    ENABLED: true, // ✅ Ativado para enviar ao nosso servidor
    URL: 'http://localhost:3000/api/tracking/visitor',
    TIMEOUT: 10000
  }
};