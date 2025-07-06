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
    title: "Ti hanno mentito.",
    textBlocks: [
      {
        content: "Puoi mangiare un <strong>brownie fondente</strong>, una <strong>brioche soffice</strong>, o una <strong>crostata cioccolato-nocciola</strong> — <em>senza zucchero, senza glutine, senza lattosio.</em>"
      },
      {
        content: "E riprenderti. Senza sensi di colpa."
      },
      {
        content: "🎁 In 1 minuto, scopri il tuo <strong>profilo gourmet</strong> e accedi alla <em>collezione privata</em> di 500 ricette emblematiche della Chef Amélie."
      }
    ],
    image: "https://cdn.xquiz.co/images/94f2084a-557c-43be-abcc-2ba23141cb46",
    imageAlt: "Dolci senza zucchero, senza glutine, senza lattosio",
    buttonText: "Scopri il mio profilo gourmet",
    footerText: "Più di <strong>30.000 donne</strong> hanno già scoperto il loro<br>Questo test richiede solo 60 secondi"
  },
  
  // Step 1
  {
    name: "discourage",
    title: "<span class='text-[#333333]'>Quando provi a </span><span class='text-primary font-semibold'>mangiare più sano</span><span class='text-[#333333]'>... cosa ti </span><span class='text-primary font-semibold'>scoraggia</span><span class='text-[#333333]'> di più?</span>",
    options: [
      {
        value: "fades",
        label: "I piatti sono spesso insipidi o secchi"
      },
      {
        value: "faim",
        label: "Ho ancora fame dopo aver mangiato"
      },
      {
        value: "idees",
        label: "Non so cosa cucinare nel quotidiano"
      },
      {
        value: "abandon",
        label: "Abbandono dopo qualche giorno"
      }
    ]
  },
  
  // Step 2
  {
    name: "dessert",
    title: "<span class='text-primary font-semibold'>Anche senza zucchero, senza glutine, senza lattosio... </span><span class='text-[#333333]'>quale di queste prelibatezze ti fa venire più voglia?</span>",
    image: RecipeImages.grid,
    imageAlt: "Collezione di dolci senza zucchero, senza glutine, senza lattosio",
    options: [
      {
        value: "brownie",
        label: "🍫 Brownie fondente ancora tiepido"
      },
      {
        value: "brioche",
        label: "🥐 Brioche soffice alla cannella"
      },
      {
        value: "tartelette",
        label: "🥧 Crostata cioccolato-nocciola"
      },
      {
        value: "baguette",
        label: "🥖 Baguette croccante e calda"
      }
    ]
  },
  
  // Step 3
  {
    name: "tried_recipes",
    title: "<span class='text-[#333333]'>Hai mai provato a seguire delle </span><span class='text-primary font-semibold'>ricette \"sane\" </span><span class='text-[#333333]'>trovate su internet?</span><br><span class='text-[#333333]'>Quelle che promettono tutto... ma che finiscono </span><span class='text-primary font-semibold'>troppo complicate, troppo insipide </span><span class='text-[#333333]'>o </span><span class='text-primary font-semibold'>completamente fallite</span><span class='text-[#333333]'>?</span>",
    options: [
      {
        value: "disappointed",
        label: "😔 Sì, ho provato... e sono rimasta delusa"
      },
      {
        value: "sometimes",
        label: "😐 Ho provato, a volte funziona"
      },
      {
        value: "no_trust",
        label: "🧐 No, non mi fido delle ricette del web"
      }
    ]
  },
  
  // Step 4
  {
    name: "chef_profile",
    image: ChefImages.amelie,
    imageAlt: "Chef Amélie Dupont",
    title: "Un incontro con la Chef Amélie Dupont",
    description: "La sua storia, la sua missione, le sue ricette.",
    textBlocks: [
      {
        content: "Nata ad Aix-en-Provence, Amélie Dupont è cresciuta tra pani caldi, erbe fresche e ricette di famiglia trasmesse da sua madre."
      },
      {
        content: "Formata all'Institut Saint-Louis di Marsiglia, ha lavorato in ristoranti locali impegnati in una cucina naturale e anti-infiammatoria."
      },
      {
        content: "Ma è dopo aver scoperto le sue intolleranze che decide di creare un nuovo approccio:"
      },
      {
        content: "Ricette semplici, gourmet, senza zucchero, senza glutine, senza lattosio — e piene di piacere.",
        highlight: true
      },
      {
        content: "Oggi condivide più di 500 ricette pensate per trasformare il quotidiano di migliaia di donne."
      }
    ],
    buttonText: "Scopri come le sue ricette possono aiutarmi"
  },
  
  // Step 5
  {
    name: "improve",
    title: "<span class='text-primary font-semibold'>Cosa vorresti migliorare </span><span class='text-[#333333]'>in priorità oggi?</span>",
    options: [
      {
        value: "digestion",
        label: "🥗 Ridurre il gonfiore e migliorare la digestione"
      },
      {
        value: "sugar",
        label: "🍬 Stabilizzare la glicemia e ridurre la voglia di zucchero"
      },
      {
        value: "weight",
        label: "⚖️ Perdere peso senza frustrazione né dieta estrema"
      },
      {
        value: "energy",
        label: "💪 Ritrovare la mia energia e uscire dalla stanchezza cronica"
      },
      {
        value: "all",
        label: "🌱 Tutto questo insieme (e finalmente sentirmi bene nel mio corpo)"
      }
    ]
  },
  
  // Step 6
  {
    name: "testimonials",
    title: "<span class='text-primary font-semibold'>Centinaia di donne </span><span class='text-[#333333]'>hanno già testato queste ricette e visto il loro corpo trasformarsi.</span>",
    description: "<span class='text-primary'>Scorri ➤ per vedere cosa dicono.</span>",
    isTestimonialStep: true,
    buttonText: "🔍 SCOPRI IL MIO PROFILO"
  }
];