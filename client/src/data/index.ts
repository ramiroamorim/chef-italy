/**
 * Ponto central para exportação de todos os dados da aplicação
 * Facilita a importação centralizada de dados em qualquer componente
 * 
 * Este arquivo serve como um hub central para todos os dados da aplicação,
 * permitindo que componentes importem dados de uma única fonte confiável.
 */

/**
 * Dados do quiz
 */
export { quizSteps } from './quiz/steps';

/**
 * Dados de testemunhos e imagens relacionadas
 */
export { testimonials, testimonialImages } from './testimonials';

/**
 * Configurações e constantes centralizadas
 * Re-exportando do arquivo de configuração para centralizar ainda mais as importações
 */
export { LINKS, COLORS, TEXTS, ANIMATIONS } from '@/config';