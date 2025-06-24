
/**
 * Utilitário para detectar e resolver conflitos com scripts de terceiros
 */

export const ScriptUtils = {
  /**
   * Verifica se há conflitos conhecidos com scripts de terceiros
   */
  checkForScriptConflicts: () => {
    const conflicts = [];
    
    // Verificar se o fetch foi modificado
    if (window.fetch && window.fetch.toString().includes('utmify')) {
      conflicts.push('Utmify modified fetch function');
    }
    
    // Verificar se há interceptadores de rede ativos
    if ((window as any).pixelId && !(window as any).utmifyLoaded) {
      conflicts.push('Utmify pixel loaded but not initialized');
    }
    
    return conflicts;
  },
  
  /**
   * Força o carregamento de scripts críticos após outros scripts
   */
  ensureCriticalScripts: () => {
    // Aguardar outros scripts carregarem
    setTimeout(() => {
      const conflicts = ScriptUtils.checkForScriptConflicts();
      if (conflicts.length > 0) {
        console.warn('Script conflicts detected:', conflicts);
      }
    }, 2000);
  }
};

// Auto-executar verificação
document.addEventListener('DOMContentLoaded', () => {
  ScriptUtils.ensureCriticalScripts();
});
