# Estrutura de Assets

Esta pasta contém todos os assets utilizados no projeto Chef Amélie Dupont, organizados por categoria.

## Organização

- `/images`: Imagens gerais da aplicação
- `/quiz`: Imagens específicas usadas no quiz
- `/screenshots`: Capturas de tela para referência
- `/references`: Imagens de referência do design original
- `icons.tsx`: Componente contendo ícones SVG utilizados no projeto
- `*.png`: Imagens específicas usadas em múltiplas partes da aplicação

## Diretrizes

1. **Adicionar Novos Assets**:
   - Coloque novos assets na pasta correspondente à sua função
   - Utilize nomes claros e descritivos, seguindo o padrão kebab-case (ex: `recipe-grid.png`)
   - Para imagens grandes, considere otimizá-las antes de adicionar

2. **Remover ou Substituir Assets**:
   - Ao substituir uma imagem, mantenha o mesmo nome para evitar quebrar referências
   - Ao remover uma imagem, verifique todas as importações no código

3. **Organização**:
   - Mantenha a estrutura de pastas organizada
   - Se uma nova categoria for necessária, crie uma pasta dedicada

## Importando Assets

Para importar assets no código, utilize o caminho relativo com o alias `@assets`:

```jsx
// ✅ Importando uma imagem
import recipeGrid from "@assets/recipe-grid.png";

// ✅ Importando um ícone
import { ChefIcon } from "@assets/icons";
```