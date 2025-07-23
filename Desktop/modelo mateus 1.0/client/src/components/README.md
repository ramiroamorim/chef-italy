# Componentes do Projeto Chef Amélie Dupont

Esta pasta contém todos os componentes React utilizados no projeto, organizados por domínio.

## Estrutura

- `/layout`: Componentes para estrutura básica de páginas (cabeçalho, rodapé, etc.)
- `/quiz`: Componentes específicos do quiz/questionário  
- `/recipe`: Componentes relacionados à exibição de receitas
- `/testimonial`: Componentes para exibição de depoimentos
- `/ui`: Biblioteca completa de componentes UI (shadcn)
- `/ui-essentials`: Componentes UI essenciais e otimizados

## Componentes UI - Estratégia de Uso

Para garantir um bundle otimizado e uma estrutura de código clara, adotamos a seguinte estratégia:

### 1. Componentes UI Essenciais (ui-essentials)

A pasta `/ui-essentials` contém apenas os componentes que estamos usando ativamente no projeto. Esses componentes são otimizados para nosso caso de uso específico.

**RECOMENDADO:** Para novos componentes ou funcionalidades, sempre importe da pasta `/ui-essentials` primeiro:

```jsx
// ✅ Correto - Usar componentes essenciais
import { Button } from "@/components/ui-essentials/button";
```

### 2. Biblioteca Completa de UI (ui)

A pasta `/ui` contém a biblioteca completa de componentes shadcn. Mantemos esta pasta como referência e para casos onde precisamos de componentes adicionais.

**APENAS QUANDO NECESSÁRIO:** Se precisar de um componente que não existe em `/ui-essentials`, importe-o de `/ui`:

```jsx
// ⚠️ Use apenas quando necessário
import { Accordion } from "@/components/ui/accordion";
```

Se um componente de `/ui` começar a ser usado frequentemente, considere movê-lo para `/ui-essentials`.

## Domínios de Componentes

Cada pasta de domínio (`/quiz`, `/recipe`, etc.) contém componentes específicos para aquela parte da aplicação. Isso melhora a legibilidade e manutenção do código.

## Adicionando Novos Componentes

1. Determine o domínio apropriado para o novo componente
2. Use componentes de `/ui-essentials` sempre que possível
3. Mantenha o código limpo, com props bem tipadas e documentação quando necessário