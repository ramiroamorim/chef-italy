import React from 'react';
import recipeBookImage from '@/assets/images/recipes/recipe-book.png';

/**
 * Componente simples para exibir a grade de receitas do Chef Amélie
 * Usado em várias partes da aplicação para mostrar o catálogo de receitas
 * 
 * Este componente foi movido para pasta /components/recipe para seguir a
 * convenção de organização por domínio em vez de por tipo de componente
 */
export const RecipeGrid: React.FC = () => {
  return (
    <div className="w-full p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
      <img 
        src={recipeBookImage} 
        alt="500 Recettes Délicieuses Sans Gluten, Sans Sucre, Sans Lactose"
        className="w-full h-auto rounded-lg"
      />
    </div>
  );
};