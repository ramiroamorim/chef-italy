/**
 * Arquivo centralizador de imagens
 * 
 * Este arquivo exporta todas as imagens utilizadas no projeto de forma organizada.
 * Sempre importe imagens deste arquivo em vez de importar diretamente dos arquivos.
 */

// Chef Images
import chefProfile from './images/chef/chef-profile.png';
import chefAmelie from './images/chef/chef-amelie.png';

// Recipes Images
import recipeBook from './images/recipes/recipe-book-new.png'; // Imagem do livro de receitas
import recipeCollage from './images/recipes/recipe-book-collage.png';
import recipesGrid from './images/recipes/recipes-grid.png';
import recipesGridCollage from './images/recipes/recipes-grid-collage.png';
import recipesMain from './images/recipes/recipes-main.png';
import recipes from './images/recipes/recipes.png';
import bookPages from './images/book/book-pages.png';

// Testimonials Images
import testimonial1 from './images/testimonials/testimonial1.png';
import testimonial2 from './images/testimonials/testimonial2.png';
import testimonial3 from './images/testimonials/testimonial3.png';
import testimonial4 from './images/testimonials/testimonial4.png';
import testimonialBread from './images/testimonials/testimonial-bread.jpg';
import testimonialBrownie from './images/testimonials/testimonial-brownie.jpg';

// Thank You Page Images
import thankYouPage from './images/thank-you/thank-you-page.png';
import audioPreview from './images/thank-you/audio-preview.png';

// Export por categoria para organização
export const ChefImages = {
  profile: chefProfile,
  amelie: chefAmelie
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
  bread: testimonialBread,
  brownie: testimonialBrownie
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
  testimonialBread,
  testimonialBrownie,
  
  // Thank You Page Images
  thankYouPage,
  audioPreview
};