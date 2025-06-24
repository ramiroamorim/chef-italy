# Arquivos Estáticos da Aplicação

Esta pasta contém todos os arquivos estáticos da aplicação Chef Amélie Dupont que são servidos diretamente pelo servidor web.

## Estrutura da Pasta

- `/assets`: Arquivos gerados pelo build (CSS, JS, imagens otimizadas)
- `/images`: Imagens estáticas usadas na aplicação
- `/testimonial-images`: Imagens dos depoimentos de clientes
- `/testimonials`: Fotos dos clientes que deram depoimentos
- `styles.css`: Estilos CSS globais (não processados pelo Tailwind)
- `app.js`: JavaScript para manipulação de elementos do DOM

## Diretrizes para Novos Arquivos

1. **Imagens de Interface**: Coloque em `/public/images/`
2. **Imagens de Testimonials**: Coloque em `/public/testimonial-images/`
3. **Arquivos JavaScript**: Para scripts que devem ser carregados diretamente no HTML, coloque-os na raiz da pasta `public`
4. **Estilos CSS**: Para estilos globais não processados pelo Tailwind, adicione à pasta raiz como `nome-do-estilo.css`

## Importante

- **NÃO** coloque arquivos na pasta `/public/assets/` - esta pasta é gerenciada pelo processo de build
- **NÃO** modifique o arquivo `index.html` - ele é gerado pelo processo de build
- Prefira adicionar imagens em `client/src/assets/` para que sejam otimizadas pelo Vite durante o build

## Quando Usar `public` vs `client/src/assets`

- **Use `public/`**: Para arquivos que precisam manter exatamente o mesmo nome e caminho, ou que precisam ser acessados por URL direta.
- **Use `client/src/assets/`**: Para imagens referenciadas no código React e que se beneficiarão da otimização de assets do Vite.