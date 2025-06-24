# Componentes UI Essenciais

Esta pasta contém os componentes UI essenciais que são utilizados no projeto Chef Amélie Dupont.

Mantemos aqui apenas os componentes que estamos usando ativamente no aplicativo, o que ajuda a:

1. **Reduzir o tamanho do bundle**
2. **Facilitar a manutenção**
3. **Acelerar o desenvolvimento**
4. **Evitar código não utilizado**

## Componentes Incluídos

- `button.tsx` - Botões personalizados
- `card.tsx` - Componentes de cartão para exibição de informações
- `toast.tsx` e `toaster.tsx` - Sistema de notificações
- `tooltip.tsx` - Dicas ao passar o mouse

## Como Usar

Importe os componentes diretamente desta pasta em vez da pasta ui completa:

```jsx
// ✅ Correto - importar dos componentes essenciais
import { Button } from "@/components/ui-essentials/button";

// ❌ Evitar - importar de todos os componentes
// import { Button } from "@/components/ui/button";
```