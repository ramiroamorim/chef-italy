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
        content: "Puoi ancora gustarti un piatto di <strong>lasagne alla bolognese</strong>, una <strong>crostata fatta in casa</strong> o un <strong>tiramisù vellutato</strong>..."
      },
      {
        content: "— Tutto <strong>senza glutine</strong>.<br>— <strong>Senza zucchero</strong>.<br>— <strong>Senza lattosio</strong>."
      },
      {
        content: "E sì, puoi anche fare il bis.<br><strong>Senza dolore. Senza gonfiore. Senza sensi di colpa.</strong>"
      },
      {
        content: "🎁 In meno di 60 secondi, scopri il tuo <strong>profilo di gola</strong> e accedi alla <em>collezione privata</em> con 500 ricette iconiche della Chef Amélie —"
      },
      {
        content: "Pensate per chi <strong>AMA la cucina italiana</strong>, ma ha dovuto smettere di mangiarla."
      }
    ],
    image: "https://cdn.xquiz.co/images/94f2084a-557c-43be-abcc-2ba23141cb46",
    imageAlt: "Ricette italiane senza glutine, senza zucchero, senza lattosio",
    buttonText: "👉🏻 Scopri ora il tuo profilo di gola",
    footerText: "Oltre <strong>100.000 donne italiane</strong> lo hanno già fatto.<br>Il test dura meno di un minuto.<br>Ma può ridarti il gusto della tua tavola."
  },
  
  // Step 1
  {
    name: "temptations",
    title: "<span class='text-[#333333]'>Anche senza zucchero, glutine e lattosio… quale di queste </span><span class='text-primary font-semibold'>tentazioni italiane</span><span class='text-[#333333]'> ti fa chiudere gli occhi solo al pensiero?</span>",
    image: "https://cdn.xquiz.co/images/94f2084a-557c-43be-abcc-2ba23141cb46",
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
    image: ChefImages.amelie,
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
  
  // Step 5
  {
    name: "result",
    title: "La Curiosa Golosa",
    textBlocks: [
      {
        content: "Sei il tipo che ama provare nuovi sapori, riscoprire versioni leggere dei piatti di una volta e sorprendere chi ami con ricette che non sembrano \"senza\"."
      },
      {
        content: "Il tuo palato cerca equilibrio: vuoi sentirti bene —<br>ma <strong>senza mai rinunciare al piacere di mangiare bene</strong>."
      },
      {
        content: "Quello che la Chef Sofia Moretti ha preparato per te è proprio questo:"
      },
      {
        content: "<strong>un mondo di ricette italiane</strong> con consistenze avvolgenti, profumi veri e ingredienti che nutrono davvero.",
        highlight: true
      }
    ],
    buttonText: "🍽️ Scopri i suggerimenti della Chef"
  },
  
  // Step 6
  {
    name: "sales_page",
    title: "500 ricette senza zucchero, senza glutine e senza lattosio",
    description: "che nutrono, aiutano a dimagrire con piacere e riportano il tuo corpo in equilibrio.",
    textBlocks: [
      {
        content: "📛 <strong>Nessuna dieta alla moda.</strong><br>🛒 <strong>Nessun ingrediente impossibile da trovare.</strong><br>🥀 <strong>Nessun piatto triste o insapore.</strong>"
      },
      {
        content: "Solo cucina vera, piena di gusto e libertà —<br>per le donne con intolleranze che <strong>non vogliono rinunciare a mangiare bene</strong>.<br><strong>Mai più.</strong>"
      },
      {
        content: "💚 <strong>È per te se...</strong><br>🌿 Hai intolleranze (glutine, lattosio, zucchero)<br>🥗 Vuoi dimagrire senza frustrazione né rinunce impossibili<br>😩 Sei stanca di piatti tristi, insipidi o industriali<br>✨ Cerchi un metodo semplice, duraturo, umano"
      },
      {
        content: "🚫 <strong>Non è per te se...</strong><br>🙅‍♀️ Non vuoi cambiare nemmeno una minima abitudine<br>🧪 Cerchi una pillola magica che \"risolve tutto\"<br>🌀 Preferisci restare nel caos alimentare<br>🍕 Rifiuti anche solo l'idea di cucinare un minimo"
      },
      {
        content: "⚠️ <strong>Queste ricette NON sono su Google.</strong><br>Non vengono da Pinterest, né da un blog copiato.<br>Sono nate nella cucina vera di Sofia Moretti —<br>testate, aggiustate, perfezionate per portare sollievo, nutrimento e piacere autentico a chi aveva rinunciato a mangiare con gioia.",
        highlight: true
      }
    ],
    buttonText: "👉🏻 VOGLIO IL PACCHETTO A 9€",
    priceText: "Valore reale del pacchetto: 34€<br>Oggi: solo 9€",
    urgencyText: "⚠️ Ultimi 20 accessi disponibili a 9€ soltanto!",
    guaranteeText: "📩 Consegna immediata via e-mail.<br>Nessun abbonamento. Nessun vincolo."
  }
];