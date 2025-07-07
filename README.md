<<<<<<< HEAD
# Chef Amélie Dupont - Quiz App

Uma aplicação interativa de quiz que identifica o perfil gastronômico do usuário e oferece a coleção de receitas da Chef Amélie Dupont.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

- `/client`: Código-fonte do frontend React
  - `/src`: Componentes, hooks e lógica da aplicação
    - `/assets`: Imagens e recursos organizados por categoria
    - `/components`: Componentes organizados por domínio (quiz, recipe, layout, etc.)
    - `/data`: Dados estáticos usados na aplicação
    - `/hooks`: Custom hooks React
    - `/types`: Definições de tipos TypeScript
- `/server`: Código-fonte do backend Express
- `/shared`: Esquemas e tipos compartilhados entre frontend e backend
- `/public`: Arquivos estáticos servidos diretamente
- `/dist`: Build final para deploy (gerado pelos scripts de build)

## Deploy

Para fazer o deploy da aplicação:

1. **Build**: Execute `npm run build` para criar os arquivos de build na pasta `/dist`
2. **Execução**: Execute `npm run start` para iniciar o servidor de produção

O processo de build compila o frontend React com Vite e o backend com esbuild, unindo tudo na pasta `/dist`.

## Desenvolvimento

Para executar o projeto em modo de desenvolvimento:

```bash
npm run dev
```

Isso inicia o servidor Express e o servidor de desenvolvimento Vite simultaneamente.
=======
# chef-italy
>>>>>>> f4f19a2d2f66f2810cff5aeb89f7dfdfd797e16a
