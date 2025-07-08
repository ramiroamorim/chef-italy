/**
 * Tipos relacionados ao quiz e fluxo do usuário
 * Este arquivo centraliza todas as definições de tipos para o quiz
 */

/**
 * Representa um item de imagem com src e texto alternativo
 * Usado em galerias de imagens e grids no quiz
 */
export interface ImageItem {
  src: string;
  alt: string;
}

/**
 * Representa um bloco de texto com opção de destaque
 * Usado em diversos passos do quiz para mostrar informações
 */
export interface TextBlock {
  content: string;
  highlight?: boolean;
}

/**
 * Representa uma opção de resposta para as perguntas do quiz
 * Contém um valor interno e um texto para exibição
 */
export interface Option {
  value: string;
  label: string;
}

/**
 * Define a estrutura completa de um passo do quiz
 * Cada passo pode ter diferentes elementos como título, imagens, texto e opções
 */
export interface QuizStepType {
  name: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  imageGrid?: ImageItem[];
  textBlocks?: TextBlock[];
  options?: Option[];
  buttonText?: string;
  footerText?: string;
  isTestimonialStep?: boolean;
  isOptimizedSalesStep?: boolean;
  bulletPoints?: string[];
  priceText?: string;
  urgencyText?: string;
  guaranteeText?: string;
}

/**
 * Define a estrutura de um testemunho no carrossel
 * Inclui a mensagem, horário (opcional) e imagem relacionada
 */
export interface TestimonialType {
  message: string;
  time: string;
  image?: string;
  imageAlt?: string;
}