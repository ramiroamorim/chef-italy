/**
 * Arquivo centralizador de imagens
 * 
 * Este arquivo exporta todas as imagens utilizadas no projeto de forma organizada.
 * Sempre importe imagens deste arquivo em vez de importar diretamente dos arquivos.
 */

// Chef Images
import chefProfile from './images/chef/chef-profile.png';
import chefAmelie from './images/chef/chef-amelie.png';
import chefSofia from './images/chef/chef-sofia.png';

// Quiz Images
import etapa01 from './images/quiz/etapa-01.png';
import etapa02 from './images/quiz/etapa-02.png';
import etapa07 from './images/quiz/etapa-07.png';

// Recipes Images
import recipeBook from './images/recipes/recipe-book-new.png'; // Imagem do livro de receitas
import recipeCollage from './images/recipes/recipe-book-collage.png';
import recipesGrid from './images/recipes/recipes-grid.png';
import recipesGridCollage from './images/recipes/recipes-grid-collage.png';
import recipesMain from './images/recipes/recipes-main.png';
import recipes from './images/recipes/recipes.png';
import bookPages from './images/book/book-pages.png';

// Testimonials Images
import testimonial1 from './images/testimonials/1193d754-5e03-42cf-853f-fc59bc7e7db4.JPG';
import testimonial2 from './images/testimonials/370efb68-9d8e-432b-b0c5-ef26c792e228.JPG';
import testimonial3 from './images/testimonials/3abb9dd0-e903-498e-913d-f645ae8b6b3f.JPG';
import testimonial4 from './images/testimonials/5ed6dd62-8472-4170-8264-fac63010f762.JPG';
import testimonialBread from './images/testimonials/6975f17a-7bbb-4e4e-acce-d969cd21f7f5.JPG';
import testimonialBrownie from './images/testimonials/b0c8599b-036e-4648-9387-b81e1545dd9a.JPG';
import testimonial5 from './images/testimonials/b4570fb2-95e0-4474-bc46-2076f0827c19.JPG';
import testimonial6 from './images/testimonials/d233cffd-a5c4-45b1-b3a0-24f08356bf37.JPG';
import testimonial7 from './images/testimonials/dccaaad7-af99-4612-9ff4-f5cd49a8bc5b.JPG';
import imagePageOffer from './images/testimonials/image-02-page-offer.jpg';+6

// Thank You Page Images
import thankYouPage from './images/thank-you/thank-you-page.png';
import audioPreview from './images/thank-you/audio-preview.png';

// Export por categoria para organização
export const ChefImages = {
  profile: chefProfile,
  amelie: chefAmelie,
  sofia: chefSofia
};

export const QuizImages = {
  etapa01,
  etapa02,
  etapa07
};

export const RecipeImages = {
  book: recipeBook,
  collage: recipeCollage,
  grid: recipesGrid,
  gridCollage: recipesGridCollage,
  main: recipesMain,
  recipes: recipes,
  bookPages: bookPages
};

export const TestimonialImages = {
  testimonial1,
  testimonial2,
  testimonial3,
  testimonial4,
  testimonial5,
  testimonial6,
  testimonial7,
  bread: testimonialBread,
  brownie: testimonialBrownie,
  pageOffer: imagePageOffer
};

export const ThankYouImages = {
  page: thankYouPage,
  audioPreview: audioPreview
};

// Exportação plana para compatibilidade com código existente
export {
  // Chef Images
  chefProfile,
  chefAmelie,
  chefSofia,
  
  // Quiz Images
  etapa01,
  etapa02,
  etapa07,
  
  // Recipe Images
  recipeBook,
  recipeCollage,
  recipesGrid,
  recipesGridCollage,
  recipesMain,
  recipes,
  
  // Testimonial Images
  testimonial1,
  testimonial2,
  testimonial3,
  testimonial4,
  testimonial5,
  testimonial6,
  testimonial7,
  testimonialBread,
  testimonialBrownie,
  imagePageOffer,
  
  // Thank You Page Images
  thankYouPage,
  audioPreview
};