/**
 * Passos/etapas do quiz
 * Contém todas as perguntas e opções que o usuário verá durante o quiz
 */

import { QuizStepType } from "@/types/quiz";
import { RecipeImages, ChefImages } from '@/assets/imageExports';

export const quizSteps: QuizStepType[] = [
  // Step 0 - Landing Page
  {
    name: "landing",
    title: "On vous a menti.",
    textBlocks: [
      {
        content: "Vous pouvez manger un <strong>brownie fondant</strong>, une <strong>brioche moelleuse</strong>, ou une <strong>tartelette chocolat-noisette</strong> — <em>sans sucre, sans gluten, sans lactose.</em>"
      },
      {
        content: "Et vous resservir. Sans culpabilité."
      },
      {
        content: "🎁 En 1 minute, découvrez votre <strong>profil gourmand</strong> et accédez à la <em>collection privée</em> de 500 recettes emblématiques de la Chef Amélie."
      }
    ],
    image: "https://cdn.xquiz.co/images/94f2084a-557c-43be-abcc-2ba23141cb46",
    imageAlt: "Desserts sans sucre, sans gluten, sans lactose",
    buttonText: "Découvrir mon profil gourmand",
    footerText: "Plus de <strong>30 000 femmes</strong> ont déjà découvert le leur<br>Ce test ne prend que 60 secondes"
  },
  
  // Step 1
  {
    name: "discourage",
    title: "<span class='text-[#333333]'>Quand vous essayez de </span><span class='text-primary font-semibold'>manger plus sainement</span><span class='text-[#333333]'>... qu'est-ce qui vous </span><span class='text-primary font-semibold'>décourage</span><span class='text-[#333333]'> le plus ?</span>",
    options: [
      {
        value: "fades",
        label: "Les plats sont souvent fades ou secs"
      },
      {
        value: "faim",
        label: "J'ai encore faim après avoir mangé"
      },
      {
        value: "idees",
        label: "Je ne sais pas quoi cuisiner au quotidien"
      },
      {
        value: "abandon",
        label: "J'abandonne au bout de quelques jours"
      }
    ]
  },
  
  // Step 2
  {
    name: "dessert",
    title: "<span class='text-primary font-semibold'>Même sans sucre, sans gluten, sans lactose... </span><span class='text-[#333333]'>quelle de ces gourmandises vous donne le plus envie ?</span>",
    image: RecipeImages.grid,
    imageAlt: "Collection de desserts sans sucre, sans gluten, sans lactose",
    options: [
      {
        value: "brownie",
        label: "🍫 Brownie fondant encore tiède"
      },
      {
        value: "brioche",
        label: "🥐 Brioche moelleuse à la cannelle"
      },
      {
        value: "tartelette",
        label: "🥧 Tartelette chocolat-noisette"
      },
      {
        value: "baguette",
        label: "🥖 Baguette croustillante et chaude"
      }
    ]
  },
  
  // Step 3
  {
    name: "tried_recipes",
    title: "<span class='text-[#333333]'>Vous avez déjà essayé de suivre des </span><span class='text-primary font-semibold'>recettes \"saines\" </span><span class='text-[#333333]'>trouvées sur internet ?</span><br><span class='text-[#333333]'>Celles qui promettent tout... mais qui finissent </span><span class='text-primary font-semibold'>trop compliquées, trop fades </span><span class='text-[#333333]'>ou </span><span class='text-primary font-semibold'>complètement ratées </span><span class='text-[#333333]'>?</span>",
    options: [
      {
        value: "disappointed",
        label: "😔 Oui, j'ai essayé... et j'ai été déçue"
      },
      {
        value: "sometimes",
        label: "😐 J'ai essayé, parfois ça marche"
      },
      {
        value: "no_trust",
        label: "🧐 Non, je ne fais pas confiance aux recettes du net"
      }
    ]
  },
  
  // Step 4
  {
    name: "chef_profile",
    image: ChefImages.amelie,
    imageAlt: "Chef Amélie Dupont",
    title: "Une rencontre avec la Cheffe Amélie Dupont",
    description: "Son histoire, sa mission, ses recettes.",
    textBlocks: [
      {
        content: "Née à Aix-en-Provence, Amélie Dupont a grandi entre les pains chauds, les herbes fraîches et les recettes familiales transmises par sa mère."
      },
      {
        content: "Formée à l'Institut Saint-Louis à Marseille, elle a travaillé dans des restaurants locaux engagés dans une cuisine naturelle et anti-inflammatoire."
      },
      {
        content: "Mais c'est après avoir elle-même découvert ses intolérances qu'elle décide de créer une nouvelle approche :"
      },
      {
        content: "Des recettes simples, gourmandes, sans sucre, sans gluten, sans lactose — et pleines de plaisir.",
        highlight: true
      },
      {
        content: "Aujourd'hui, elle partage plus de 500 recettes conçues pour transformer le quotidien de milliers de femmes."
      }
    ],
    buttonText: "Voir comment ses recettes peuvent m'aider"
  },
  
  // Step 5
  {
    name: "improve",
    title: "<span class='text-primary font-semibold'>Qu'est-ce que vous aimeriez améliorer </span><span class='text-[#333333]'>en priorité aujourd'hui ?</span>",
    options: [
      {
        value: "digestion",
        label: "🥗 Réduire les ballonnements et améliorer ma digestion"
      },
      {
        value: "sugar",
        label: "🍬 Stabiliser ma glycémie et réduire les envies de sucre"
      },
      {
        value: "weight",
        label: "⚖️ Perdre du poids sans frustration ni régime extrême"
      },
      {
        value: "energy",
        label: "💪 Retrouver mon énergie et sortir de la fatigue chronique"
      },
      {
        value: "all",
        label: "🌱 Tout ça à la fois (et enfin me sentir bien dans mon corps)"
      }
    ]
  },
  
  // Step 6
  {
    name: "testimonials",
    title: "<span class='text-primary font-semibold'>Centaines de femmes </span><span class='text-[#333333]'>ont déjà testé ces recettes et vu leur corps se transformer.</span>",
    description: "<span class='text-primary'>Faites glisser ➤ pour voir ce qu'elles disent.</span>",
    isTestimonialStep: true,
    buttonText: "🔍 DÉCOUVRIR MON PROFIL"
  }
];