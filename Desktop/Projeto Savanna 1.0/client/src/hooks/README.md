# Hooks Personnalisés

Cette structure contient tous les hooks personnalisés utilisés dans l'application Chef Amélie Dupont.

## Hooks Disponibles

- `useMobile.ts` - Hook pour détecter si l'appareil est mobile
- `useQuiz.ts` - Hook principal pour gérer l'état et la logique du quiz
- `useToast.ts` - Hook pour afficher des notifications toast

## Utilisation

```tsx
// Exemple d'utilisation du hook useQuiz
import { useQuiz } from "@/hooks/useQuiz";

function QuizComponent() {
  const { 
    currentStep,
    userAnswers,
    handleAnswer,
    nextStep,
    prevStep
  } = useQuiz();
  
  // ...
}
```