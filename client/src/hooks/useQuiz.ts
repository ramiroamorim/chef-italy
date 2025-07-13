import { useState, useEffect } from "react";
import { QUIZ_CONFIG, clearQuizState, debugQuizState } from "../config/quiz";

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
  const [answeredSteps, setAnsweredSteps] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [showPostProfile, setShowPostProfile] = useState(false);
  const [showSalesPage, setShowSalesPage] = useState(false);
  const [currentStepAnswer, setCurrentStepAnswer] = useState<string | null>(null);

  /**
   * Manipula a seleção de uma opção em uma etapa do quiz
   * 
   * @param name Identificador da pergunta
   * @param value Valor da resposta selecionada
   */
  const handleOptionSelect = (name: string, value: string) => {
    // Atualizar apenas a resposta da etapa atual
    setCurrentStepAnswer(value);
    setAnswers(prev => ({ ...prev, [name]: value }));
    
    // Marcar o step atual como respondido
    setAnsweredSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(currentStep);
      return newSet;
    });
    
    // Avança automaticamente para a próxima etapa após a seleção
    setTimeout(() => {
      // Limpar a resposta da etapa atual ANTES de avançar
      setCurrentStepAnswer(null);
      
      // Debug da seleção
      debugQuizState(`Option selected: ${name}`, value);
      
      if (currentStep < 5) {
        // Se estamos antes da etapa improve (5), continuar normalmente
        setCurrentStep(prev => prev + 1);
      } else if (currentStep === 5) {
        // Se estamos na etapa improve (5), vamos para testimonials (6)
        setCurrentStep(prev => prev + 1);
      }
    }, QUIZ_CONFIG.TIMING.OPTION_SELECT_DELAY);
  };

  /**
   * Avança para a próxima etapa do quiz manualmente
   * Se estiver na última etapa, mostra o resultado
   * Se já estiver mostrando o resultado, vai para a etapa pós-perfil
   * Se já estiver na etapa pós-perfil, vai para a página de vendas
   */
  const handleNextStep = () => {
    // Limpar a resposta da etapa atual sempre que avançar
    setCurrentStepAnswer(null);
    
    // Etapas: 0=landing, 1=healthy_discouragement, 2=temptations, 3=recipes_experience, 4=chef_profile, 5=improve, 6=testimonials, 7=result, 8=post_profile_engagement
    if (showResult) {
      // Se já estamos mostrando o resultado, ir direto para a página de vendas
      setShowSalesPage(true);
      setShowResult(false);
    } else if (showPostProfile) {
      // Se já estamos na etapa pós-perfil, ir para a página de vendas completa
      setShowSalesPage(true);
      setShowPostProfile(false);
    } else if (currentStep < 6) {
      // Se estamos antes da etapa de testimonials (6), continuar normalmente
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 6) {
      // Se estamos na etapa de testimonials (6), vamos para o resultado (7)
      setShowResult(true);
    }
  };

  /**
   * Função para resetar o estado da resposta atual quando necessário
   */
  const resetCurrentStepAnswer = () => {
    setCurrentStepAnswer(null);
  };

  // UseEffect para garantir que o reset acontece quando mudamos de etapa
  useEffect(() => {
    // Reset mais agressivo para garantir em produção
    setCurrentStepAnswer(null);
    
    // Limpar qualquer estado persistente usando configuração
    if (QUIZ_CONFIG.PRODUCTION.CLEAR_CACHE_ON_STEP_CHANGE) {
      clearQuizState();
    }
    
    // Force rerender para garantir que o estado foi limpo
    const timeoutId = setTimeout(() => {
      setCurrentStepAnswer(null);
      
      // Debug usando função configurada
      debugQuizState(`Step ${currentStep}`, null);
    }, QUIZ_CONFIG.RESET.FORCE_RESET_TIMEOUT);
    
    return () => clearTimeout(timeoutId);
  }, [currentStep]);

  return {
    currentStep,
    totalSteps,
    answers,
    answeredSteps,
    currentStepAnswer,
    handleOptionSelect,
    handleNextStep,
    resetCurrentStepAnswer,
    showResult,
    showPostProfile,
    showSalesPage,
    // Debug info para verificar em produção
    _debug: {
      currentStepAnswer,
      currentStep,
      answers
    }
  };
}