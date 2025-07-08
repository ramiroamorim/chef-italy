import { useState } from "react";

/**
 * Interface que define o formato das respostas do quiz
 * Armazena pares chave-valor onde a chave é o identificador da pergunta
 * e o valor é a resposta selecionada pelo usuário
 */
export type Answer = {
  [key: string]: string;
};

/**
 * Hook personalizado para gerenciar o estado e a lógica do quiz
 * 
 * @param totalSteps Número total de etapas do quiz
 * @returns Um objeto com o estado atual e funções para manipular o quiz
 */
export function useQuiz(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0); // Começa em 0 para a página inicial
  const [answers, setAnswers] = useState<Answer>({});
  const [showResult, setShowResult] = useState(false);
  const [showSalesPage, setShowSalesPage] = useState(false);

  /**
   * Manipula a seleção de uma opção em uma etapa do quiz
   * 
   * @param name Identificador da pergunta
   * @param value Valor da resposta selecionada
   */
  const handleOptionSelect = (name: string, value: string) => {
    setAnswers(prev => ({ ...prev, [name]: value }));
    
    // Avança automaticamente para a próxima etapa após a seleção
    setTimeout(() => {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else {
        setShowResult(true);
      }
    }, 500);
  };

  /**
   * Avança para a próxima etapa do quiz manualmente
   * Se estiver na última etapa, mostra o resultado
   * Se já estiver mostrando o resultado, vai para a página de vendas
   */
  const handleNextStep = () => {
    if (currentStep < totalSteps - 2) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === totalSteps - 2) {
      // Se estamos na penúltima etapa (testimonials), vamos para o resultado
      setShowResult(true);
    } else if (showResult) {
      // Se já estamos mostrando o resultado, ir para a página de vendas completa
      setShowSalesPage(true);
      setShowResult(false);
    }
  };

  return {
    currentStep,
    totalSteps,
    answers,
    handleOptionSelect,
    handleNextStep,
    showResult,
    showSalesPage
  };
}