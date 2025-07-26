/**
 * Dados dos testemunhos que aparecem no carrossel
 * Cada testemunho contém uma mensagem e uma imagem associada
 */

import { TestimonialType } from "@/types/quiz";

// Importação das imagens (usando o alias do vite para a pasta assets)
import testimonialImage1 from '@/assets/images/testimonials/testimonial1.png';
import testimonialImage2 from '@/assets/images/testimonials/testimonial2.png';
import testimonialImage3 from '@/assets/images/testimonials/testimonial3.png';
import testimonialImage4 from '@/assets/images/testimonials/testimonial4.png';

// Array com as imagens importadas para uso fácil
export const testimonialImages = [
  testimonialImage1,
  testimonialImage2,
  testimonialImage3,
  testimonialImage4
];

export const testimonials: TestimonialType[] = [
  {
    message: "Avant je me réveillais gonflée, fatiguée, perdue.<br>En 21 jours avec le Plan Express j'ai perdu 3,1kg, mes vêtements tombent mieux...<br>Mais surtout : je me sens en paix à table. C'est nouveau.",
    time: "",
    image: testimonialImages[0],
    imageAlt: "Témoignage avec photos avant/après"
  },
  {
    message: "Je n'ai jamais eu autant de plaisir à cuisiner sans sucre 😍",
    time: "",
    image: testimonialImages[1],
    imageAlt: "Témoignage cuisine sans sucre"
  },
  {
    message: "Je suis choquée...<br>Pas une seule fringale cette semaine.<br>J'ai mangé normalement, j'ai cuisiné rapide, et pourtant je me sens PLUS LÉGÈRE que jamais.<br>C'est la première fois que je ne culpabilise pas à table.",
    time: "",
    image: testimonialImages[2],
    imageAlt: "Témoignage Le Plan Express"
  },
  {
    message: "Je peux enfin manger du sucré sans craindre pour ma glycémie. Je suis diabétique et c'est toujours compliqué de trouver des desserts qui soient bons et sans sucre. J'ai fait votre brownie et il était parfait. Juste sucré comme il faut, la texture nickel... Franchement, je ne pensais pas que c'était possible. Merci pour ces recettes!!! 🙏🙏🙏",
    time: "",
    image: testimonialImages[3],
    imageAlt: "Témoignage brownie sans sucre pour diabétique"
  },
  {
    message: "Amelie, bonjour..... J'ai perdu 4 kilos sans même m'en rendre compte. J'ai pris votre livre pour manger plus sainement, et au final, ça m'a aussi aidée à perdre du poids. Les recettes sont rassasiantes et équilibrées, du coup j'ai arrêté de grignoter n'importe quoi. Maintenant, je mange bien, sans frustration, et je me sens mieux 🙏❤️❤️",
    time: "",
    image: testimonialImages[0],
    imageAlt: "Témoignage perte de poids"
  },
  {
    message: "Mon fils m'a demandé de refaire les cookies du Plan Express. Avant il détestait mes recettes \"sans sucre\". Maintenant il dit que je cuisine comme une chef... ❤️ merci",
    time: "14:55",
    image: testimonialImages[1],
    imageAlt: "Témoignage cookies sans sucre"
  },
  {
    message: "Vos recettes sont merveilleuses<br>Je digère mieux, je me sens plus légère... et je mange enfin avec plaisir.",
    time: "",
    image: testimonialImages[2],
    imageAlt: "Témoignage digestion améliorée"
  },
  {
    message: "adorées !<br>Grâce à tes recettes, j'ai enfin trouvé l'équilibre. Je mange avec plaisir, je digère bien... et j'ai perdu 4 kg sans y penser.",
    time: "",
    image: testimonialImages[3],
    imageAlt: "Témoignage équilibre alimentaire"
  },
  {
    message: "Chef, je ne sais pas comment vous remercier. J'ai toujours eu des problèmes digestifs et je pensais que c'était normal d'être ballonnée tout le temps. Depuis que j'ai testé quelques recettes de votre livre, mon transit va beaucoup mieux. Je me sens plus légère, et en plus, tout est vraiment bon. Je n'aurais jamais cru qu'une alimentation sans gluten et sans lactose pouvait être aussi gourmande. Merci.",
    time: "",
    image: testimonialImages[0],
    imageAlt: "Témoignage problèmes digestifs résolus"
  },
  {
    message: "Salut chef! C'est Béatrice qui parle.... Mon fils est coeliaque et enfin, on mange tous la même chose. Avant, je faisais des plats à part pour lui, mais souvent, il n'aimait pas trop. Avec vos recettes, tout le monde mange pareil et adore. Le pain à la patate douce est devenu son préféré. Merci pour ces idées, ça change tout au quotidien.",
    time: "2:42 PM",
    image: testimonialImages[1],
    imageAlt: "Témoignage coeliaque"
  },
  {
    message: "Amelie, bonsoir!! Franchement, je suis trop contente. Depuis que j'ai découvert mon intolérance au lactose, j'avais arrêté de faire des desserts parce que rien ne me plaisait vraiment. Mais hier, j'ai fait votre gâteau aux carottes et il était parfait. Moelleux, savoureux, et le glaçage sans sucre est trop bon. Ça fait plaisir de pouvoir se faire plaisir sans culpabiliser 🙏❤️",
    time: "7:46 PM",
    image: testimonialImages[2],
    imageAlt: "Témoignage intolérance au lactose"
  },
  {
    message: "Je pensais devoir dire adieu au pain, mais grâce à vos recettes, j'en remange enfin!! J'ai toujours adoré le pain au petit-déj, mais depuis que j'ai arrêté le gluten, toutes les alternatives étaient sèches et fades. J'ai essayé votre pain à l'avoine et j'ai été bluffée par la texture et le goût. Il est moelleux et savoureux, même ma famille l'adore. Merci pour ce livre!!!! 😋❤️",
    time: "5:33 AM",
    image: testimonialImages[3],
    imageAlt: "Témoignage pain sans gluten"
  }
];