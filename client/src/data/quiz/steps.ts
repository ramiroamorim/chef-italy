/**
 * Passos/etapas do quiz
 * Contém todas as perguntas e opções que o usuário verá durante o quiz
 */

import { QuizStepType } from "@/types/quiz";
import { RecipeImages, ChefImages, QuizImages } from '@/assets/imageExports';

export const quizSteps: QuizStepType[] = [
  // Step 0 - Landing Page
  {
    name: "landing",
    title: "Ti hanno mentito.",
    textBlocks: [
      {
        content: `Puoi ancora gustarti un piatto di <strong>lasagne alla bolognese</strong>, una <strong>crostata fatta in casa</strong> o un <strong>tiramisù vellutato</strong>… <span style="font-style:italic">-senza glutine, senza zucchero, senza lattosio.</span>`
      },
      {
        content: "E sì, puoi anche fare il bis. <strong>Senza dolore.</strong>"
      },
      {
        content: "🎁 In 1 minuto, scopri il tuo <strong>profilo di gola</strong> e accedi alla <em>collezione privata</em> con 500 ricette iconiche della Chef Sofia Moretti."
      }
    ],
    image: QuizImages.etapa01,
    imageAlt: "Ricette italiane senza glutine, senza zucchero, senza lattosio",
    buttonText: "👉🏻 Scopri ora il tuo profilo di gola",
    footerText: "Oltre <strong>100.000 donne italiane</strong> lo hanno già fatto.<br>Il test dura meno di un minuto.<br>Ma può ridarti il gusto della tua tavola."
  },
  // Step 1 - Nova etapa após landing
  {
    name: "healthy_discouragement",
    title: "Quando cerchi di <span style=\"color:#E07260\">mangiare in modo più sano….</span> cosa ti <span style=\"color:#E07260\">scoraggia</span> di più?",
    options: [
      {
        value: "insipidi",
        label: "I piatti sono spesso insipidi o secchi"
      },
      {
        value: "fame",
        label: "Ho ancora fame dopo aver mangiato"
      },
      {
        value: "cucinare",
        label: "Non so cosa cucinare ogni giorno"
      },
      {
        value: "rinuncio",
        label: "Rinuncio dopo pochi giorni"
      }
    ]
  },
  
  // Step 1
  {
    name: "temptations",
    title: "<span class='text-[#333333]'>Anche senza zucchero, glutine e lattosio… quale di queste </span><span class='text-primary font-semibold'>tentazioni italiane</span><span class='text-[#333333]'> ti fa chiudere gli occhi solo al pensiero?</span>",
    image: QuizImages.etapa02,
    imageAlt: "Tentazioni italiane senza glutine, senza zucchero, senza lattosio",
    options: [
      {
        value: "focaccia",
        label: "🍕 Focaccia appena sfornata, con rosmarino e olio extravergine che profuma la cucina"
      },
      {
        value: "budino",
        label: "🍮 Budino al cioccolato fondente, vellutato, servito ancora tiepido"
      },
      {
        value: "tortino",
        label: "🧁 Mini tortino al limone con scorza di Sorrento e glassa dolce (senza zucchero raffinato)"
      },
      {
        value: "torta",
        label: "🥧 Torta soffice alle mele e cannella, come la faceva la nonna — ma senza zucchero né farina bianca"
      }
    ]
  },
  
  // Step 2
  {
    name: "recipes_experience",
    title: "<span class='text-[#333333]'>Hai mai provato a seguire quelle </span><span class='text-primary font-semibold'>ricette \"salutari\" trovate online</span><span class='text-[#333333]'>?</span><br><span class='text-[#333333]'>Quelle che promettono miracoli…</span><br><span class='text-[#333333]'>...ma alla fine sono </span><span class='text-primary font-semibold'>troppo complicate, insipide o vengono una schifezza</span><span class='text-[#333333]'>?</span>",
    options: [
      {
        value: "disappointed",
        label: "😩 Sì, ci ho provato… e sono rimasta delusa (più di una volta)"
      },
      {
        value: "sometimes",
        label: "😐 Qualche volta funzionano… ma spesso mancano di gusto"
      },
      {
        value: "no_trust",
        label: "🙄 No, non mi fido delle ricette trovate in giro sul web"
      }
    ]
  },
  
  // Step 3
  {
    name: "chef_profile",
    image: ChefImages.sofia,
    imageAlt: "Chef Sofia Moretti",
    title: "Un incontro con la Chef Sofia Moretti",
    description: "La sua storia. La sua missione. Le sue ricette che hanno ridato speranza a migliaia di donne italiane.",
    textBlocks: [
      {
        content: "👩🏻‍🍳 <strong>Chef Sofia Moretti</strong>"
      },
      {
        content: "Nata a Parma, cresciuta tra profumo di pane appena sfornato, sughi della nonna e ricette scritte a mano su fogli unti d'olio."
      },
      {
        content: "Per Sofia, la cucina è sempre stata <strong>memoria, cura e identità</strong>."
      },
      {
        content: "Si è formata all'Accademia di Cucina Naturale di Firenze, specializzandosi in <strong>cucina anti-infiammatoria e nutrizione per donne mature</strong>."
      },
      {
        content: "Ma è solo dopo aver scoperto le sue stesse intolleranze a glutine, lattosio e zuccheri raffinati…<br>...che ha capito quanto fosse devastante rinunciare ai piatti della propria infanzia."
      },
      {
        content: "È lì che ha deciso di creare una <strong>rivoluzione</strong>:<br>Una cucina italiana vera, piena di gusto — <strong>ma che non fa male</strong>.",
        highlight: true
      },
      {
        content: "🎯 Ricette semplici, senza ingredienti proibitivi.<br><strong>Senza sensi di colpa.</strong><br><strong>Senza dolore.</strong><br><strong>Solo sapore, tradizione e leggerezza.</strong>"
      },
      {
        content: "Oggi condivide oltre 500 ricette con donne che hanno perso il piacere di mangiare — e lo vogliono ritrovare"
      }
    ],
    buttonText: "Scopri come le sue ricette possono aiutare anche te"
  },
  
  // Step 4
  {
    name: "improve",
    title: "<span class='text-[#333333]'>Cosa vorresti </span><span class='text-primary font-semibold'>migliorare per prima cosa</span><span class='text-[#333333]'> — già da oggi?</span>",
    options: [
      {
        value: "digestion",
        label: "🍝 Ridurre il gonfiore e tornare a digerire bene (senza rinunciare alla tua pasta preferita)"
      },
      {
        value: "sugar",
        label: "🍫 Stabilizzare la glicemia e liberarti da quella voglia continua di dolci"
      },
      {
        value: "weight",
        label: "⚖️ Perdere peso senza frustrazione né diete estreme (senza dire addio alla cucina italiana)"
      },
      {
        value: "energy",
        label: "💥 Ritrovare l'energia e uscire da quella stanchezza che non passa mai"
      },
      {
        value: "all",
        label: "🧘‍♀️ Tutto questo insieme (e finalmente sentirmi bene nel mio corpo, ogni giorno)"
      }
    ]
  },
  
  // Step 5 - Testimonials
  {
    name: "testimonials",
    title: "Centinaia di donne hanno già provato queste ricette e hanno visto il loro corpo trasformarsi.",
    isTestimonialStep: true
  },
  
  // Step 6 - Result (La Curiosa Golosa)
  {
    name: "result",
    title: "La Curiosa Golosa",
    textBlocks: [
      {
        content: "Sei una donna che ama esplorare, assaggiare, scoprire. Per te, il cibo non è solo nutrimento: è piacere, curiosità, avventura."
      },
      {
        content: "Ti piace sperimentare sapori nuovi, ma senza rinunciare ai comfort food che ti fanno sentire a casa."
      },
      {
        content: "Dalle tue risposte emerge una personalità che cerca equilibrio tra benessere e gusto vero. Non vuoi rinunce drastiche, ma soluzioni intelligenti che ti permettano di mangiare con gioia — senza conseguenze."
      },
      {
        content: "Le ricette di Sofia Moretti sono perfette per te: ti offrono la libertà di esplorare nuovi sapori, mantenendo quel comfort e quella soddisfazione che cerchi in ogni pasto.",
        highlight: true
      }
    ],
    buttonText: "Scopri le tue ricette personalizzate"
  },
  
  // Step 7 - Post-Profile Engagement
  {
    name: "post_profile_engagement",
    title: "Ecco cosa succede quando <span class='text-primary font-semibold'>La Curiosa Golosa</span> incontra le ricette giuste...",
    isOptimizedSalesStep: true,
    subtitle: "📚 La tua collezione privata è pronta",
    description: "Oltre <strong>500 ricette</strong> selezionate personalmente da Sofia Moretti per il tuo profilo specifico.",
    bulletPoints: [
      "✅ Ricette che soddisfano la tua curiosità SENZA farti rinunciare al gusto",
      "✅ Piatti che ti permettono di esplorare nuovi sapori mantenendo i comfort food",
      "✅ Soluzioni intelligenti per mangiare con gioia e senza conseguenze",
      "✅ Accesso immediato alla collezione completa + bonus esclusivi"
    ],
    buttonText: "Accedi alla Mia Collezione Privata"
  },
  
];