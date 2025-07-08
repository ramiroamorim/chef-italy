/**
 * Dados dos testemunhos que aparecem no carrossel
 * Cada testemunho contém uma mensagem e uma imagem associada
 */

import { TestimonialType } from "@/types/quiz";

// Importação das imagens (usando o alias do vite para a pasta assets)
import testimonialImage1 from '@/assets/images/testimonials/1193d754-5e03-42cf-853f-fc59bc7e7db4.JPG';
import testimonialImage2 from '@/assets/images/testimonials/370efb68-9d8e-432b-b0c5-ef26c792e228.JPG';
import testimonialImage3 from '@/assets/images/testimonials/3abb9dd0-e903-498e-913d-f645ae8b6b3f.JPG';
import testimonialImage4 from '@/assets/images/testimonials/5ed6dd62-8472-4170-8264-fac63010f762.JPG';

// Array com as imagens importadas para uso fácil
export const testimonialImages = [
  testimonialImage1,
  testimonialImage2,
  testimonialImage3,
  testimonialImage4
];

export const testimonials: TestimonialType[] = [
  {
    message: "Prima mi svegliavo gonfia, stanca, confusa.<br>In 21 giorni con il Piano Express ho perso 3,1kg, i miei vestiti cadono meglio...<br>Ma soprattutto: mi sento in pace a tavola. È una novità.",
    time: "",
    image: testimonialImages[0],
    imageAlt: "Testimonianza con foto prima/dopo"
  },
  {
    message: "Non ho mai avuto tanto piacere a cucinare senza zucchero 😍",
    time: "",
    image: testimonialImages[1],
    imageAlt: "Testimonianza cucina senza zucchero"
  },
  {
    message: "Sono scioccata...<br>Nemmeno una voglia improvvisa questa settimana.<br>Ho mangiato normalmente, ho cucinato veloce, eppure mi sento PIÙ LEGGERA che mai.<br>È la prima volta che non mi sento in colpa a tavola.",
    time: "",
    image: testimonialImages[2],
    imageAlt: "Testimonianza Il Piano Express"
  },
  {
    message: "Posso finalmente mangiare dolci senza temere per la mia glicemia. Sono diabetica ed è sempre complicato trovare dessert che siano buoni e senza zucchero. Ho fatto il vostro brownie ed era perfetto. Dolce al punto giusto, consistenza perfetta... Francamente, non pensavo fosse possibile. Grazie per queste ricette!!! 🙏🙏🙏",
    time: "",
    image: testimonialImages[3],
    imageAlt: "Testimonianza brownie senza zucchero per diabetica"
  },
  {
    message: "Amelie, ciao..... Ho perso 4 chili senza nemmeno rendermene conto. Ho preso il vostro libro per mangiare più sano, e alla fine mi ha anche aiutato a perdere peso. Le ricette sono sazianti ed equilibrate, così ho smesso di sgranocchiare qualunque cosa. Ora mangio bene, senza frustrazione, e mi sento meglio 🙏❤️❤️",
    time: "",
    image: testimonialImages[0],
    imageAlt: "Testimonianza perdita di peso"
  },
  {
    message: "Mio figlio mi ha chiesto di rifare i biscotti del Piano Express. Prima odiava le mie ricette \"senza zucchero\". Ora dice che cucino come una chef... ❤️ grazie",
    time: "14:55",
    image: testimonialImages[1],
    imageAlt: "Testimonianza biscotti senza zucchero"
  },
  {
    message: "Le vostre ricette sono meravigliose<br>Digerisco meglio, mi sento più leggera... e finalmente mangio con piacere.",
    time: "",
    image: testimonialImages[2],
    imageAlt: "Testimonianza digestione migliorata"
  },
  {
    message: "adorate!<br>Grazie alle tue ricette, ho finalmente trovato l'equilibrio. Mangio con piacere, digerisco bene... e ho perso 4 kg senza pensarci.",
    time: "",
    image: testimonialImages[3],
    imageAlt: "Testimonianza equilibrio alimentare"
  },
  {
    message: "Chef, je ne sais pas comment vous remercier. J'ai toujours eu des problèmes digestifs et je pensais que c'était normal essere sempre gonfia tout le temps. Depuis que j'ai testé quelques recettes de votre livre, mon transit va beaucoup mieux. Je me sens plus légère, et en plus, tout est vraiment bon. Je n'aurais jamais cru qu'une alimentation sans gluten et sans lactose pouvait être aussi gourmande. Merci.",
    time: "",
    image: testimonialImages[0],
    imageAlt: "Testimonianza problemi digestivi risolti"
  },
  {
    message: "Ciao chef! Sono Beatrice che parla.... Mio figlio è celiaco et enfin, on mange tous la même chose. Avant, je faisais des plats à part pour lui, mais souvent, il n'aimait pas trop. Avec vos recettes, tout le monde mange pareil et adore. Le pain à la patate douce est devenu son préféré. Merci pour ces idées, ça change tout au quotidien.",
    time: "2:42 PM",
    image: testimonialImages[1],
    imageAlt: "Testimonianza celiaco"
  },
  {
    message: "Amelie, buonasera!! Francamente, sono troppo contenta. Depuis que j'ai découvert mon intolérance au lactose, avevo smesso di fare dolci parce que rien ne me plaisait vraiment. Mais hier, ho fatto la vostra torta alle carote et il était parfait. Moelleux, savoureux, et le glaçage sans sucre est trop bon. Ça fait plaisir de pouvoir se faire plaisir sans culpabiliser 🙏❤️",
    time: "7:46 PM",
    image: testimonialImages[2],
    imageAlt: "Testimonianza intolleranza al lattosio"
  },
  {
    message: "Pensavo di dover dire addio al pane, mais grazie alle vostre ricette, finalmente ne mangio di nuovo!! J'ai toujours adoré le pain au petit-déj, mais depuis que j'ai arrêté le gluten, toutes les alternatives étaient sèches et fades. J'ai essayé votre pain à l'avoine et j'ai été bluffée par la texture et le goût. Il est moelleux et savoureux, même ma famille l'adore. Merci pour ce livre!!!! 😋❤️",
    time: "5:33 AM",
    image: testimonialImages[3],
    imageAlt: "Testimonianza pane senza glutine"
  }
];