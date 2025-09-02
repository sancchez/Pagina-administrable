import { TextEditingConfig } from '../types';

/**
 * Utilidades adicionales para el sistema de edición de texto
 */
export class TextEditingUtils {
  /**
   * Calcula la posición óptima para el editor flotante
   */
  static calculateOptimalPosition(
    element: HTMLElement,
    editorWidth: number = 300,
    editorHeight: number = 100
  ): { top: number; left: number; placement: 'above' | 'below' | 'left' | 'right' } {
    const rect = element.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    };

    // Calcular espacios disponibles
    const spaceAbove = rect.top;
    const spaceBelow = viewport.height - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewport.width - rect.right;

    let placement: 'above' | 'below' | 'left' | 'right' = 'below';
    let top = rect.bottom + viewport.scrollY + 5;
    let left = rect.left + viewport.scrollX;

    // Determinar la mejor posición
    if (spaceBelow >= editorHeight) {
      placement = 'below';
      top = rect.bottom + viewport.scrollY + 5;
    } else if (spaceAbove >= editorHeight) {
      placement = 'above';
      top = rect.top + viewport.scrollY - editorHeight - 5;
    } else if (spaceRight >= editorWidth) {
      placement = 'right';
      top = rect.top + viewport.scrollY;
      left = rect.right + viewport.scrollX + 5;
    } else if (spaceLeft >= editorWidth) {
      placement = 'left';
      top = rect.top + viewport.scrollY;
      left = rect.left + viewport.scrollX - editorWidth - 5;
    }

    // Ajustar para que no se salga del viewport
    if (left + editorWidth > viewport.width + viewport.scrollX) {
      left = viewport.width + viewport.scrollX - editorWidth - 10;
    }
    if (left < viewport.scrollX) {
      left = viewport.scrollX + 10;
    }
    if (top + editorHeight > viewport.height + viewport.scrollY) {
      top = viewport.height + viewport.scrollY - editorHeight - 10;
    }
    if (top < viewport.scrollY) {
      top = viewport.scrollY + 10;
    }

    return { top, left, placement };
  }

  /**
   * Crea un elemento de respaldo temporal
   */
  static createBackupElement(element: HTMLElement): HTMLElement {
    const backup = element.cloneNode(true) as HTMLElement;
    backup.setAttribute('data-backup', 'true');
    backup.style.display = 'none';
    return backup;
  }

  /**
   * Restaura un elemento desde su respaldo
   */
  static restoreFromBackup(element: HTMLElement, backup: HTMLElement): void {
    const parent = element.parentNode;
    if (parent && backup) {
      backup.style.display = '';
      backup.removeAttribute('data-backup');
      parent.replaceChild(backup, element);
    }
  }

  /**
   * Valida el contenido antes de guardarlo
   */
  static validateContent(
    content: string,
    element: HTMLElement,
    config: TextEditingConfig
  ): { isValid: boolean; errors: string[]; sanitizedContent: string } {
    const errors: string[] = [];
    let sanitizedContent = content.trim();

    // Validar longitud
    if (config.maxLength && sanitizedContent.length > config.maxLength) {
      errors.push(`El contenido excede el límite de ${config.maxLength} caracteres`);
      sanitizedContent = sanitizedContent.substring(0, config.maxLength);
    }

    // Validar contenido vacío
    if (sanitizedContent.length === 0) {
      errors.push('El contenido no puede estar vacío');
    }

    // Validar caracteres especiales según el tipo de elemento
    const tagName = element.tagName.toLowerCase();
    if (['a'].includes(tagName)) {
      // Para enlaces, validar que no contengan caracteres problemáticos
      const invalidChars = /[<>"']/g;
      if (invalidChars.test(sanitizedContent)) {
        sanitizedContent = sanitizedContent.replace(invalidChars, '');
      }
    }

    // Validar HTML básico
    const htmlTags = /<[^>]*>/g;
    if (htmlTags.test(sanitizedContent)) {
      // Remover tags HTML básicos para seguridad
      sanitizedContent = sanitizedContent.replace(htmlTags, '');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedContent
    };
  }

  /**
   * Detecta el tipo de contenido y sugiere el editor apropiado
   */
  static detectContentType(element: HTMLElement): {
    type: 'text' | 'multiline' | 'rich' | 'code';
    suggestions: string[];
  } {
    const tagName = element.tagName.toLowerCase();
    const content = element.textContent || '';
    const suggestions: string[] = [];

    // Detectar por tag
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      return { type: 'text', suggestions: ['Usar texto corto y descriptivo'] };
    }

    if (['p', 'div'].includes(tagName)) {
      if (content.length > 100) {
        suggestions.push('Considerar dividir en párrafos más cortos');
      }
      return { type: 'multiline', suggestions };
    }

    if (tagName === 'code' || element.classList.contains('code')) {
      return { type: 'code', suggestions: ['Usar sintaxis apropiada'] };
    }

    if (tagName === 'a') {
      suggestions.push('Usar texto descriptivo para el enlace');
      return { type: 'text', suggestions };
    }

    // Detectar por contenido
    if (content.includes('\n') || content.length > 50) {
      return { type: 'multiline', suggestions };
    }

    return { type: 'text', suggestions };
  }

  /**
   * Genera sugerencias de mejora para el contenido
   */
  static generateContentSuggestions(content: string, element: HTMLElement): string[] {
    const suggestions: string[] = [];
    const tagName = element.tagName.toLowerCase();

    // Sugerencias por longitud
    if (content.length < 3) {
      suggestions.push('El contenido es muy corto');
    } else if (content.length > 200 && ['h1', 'h2', 'h3'].includes(tagName)) {
      suggestions.push('Los títulos deberían ser más concisos');
    }

    // Sugerencias por formato
    if (content.includes('  ')) {
      suggestions.push('Evitar espacios dobles');
    }

    if (content !== content.trim()) {
      suggestions.push('Remover espacios al inicio y final');
    }

    // Sugerencias específicas por elemento
    if (tagName === 'a' && content.toLowerCase().includes('click')) {
      suggestions.push('Evitar "click aquí", usar texto descriptivo');
    }

    if (['h1', 'h2', 'h3'].includes(tagName) && content.endsWith('.')) {
      suggestions.push('Los títulos generalmente no terminan en punto');
    }

    return suggestions;
  }

  /**
   * Calcula métricas del contenido
   */
  static calculateContentMetrics(content: string): {
    characters: number;
    words: number;
    lines: number;
    readabilityScore: number;
  } {
    const characters = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lines = content.split('\n').length;
    
    // Puntuación simple de legibilidad (basada en longitud de palabras)
    const avgWordLength = words > 0 ? characters / words : 0;
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordLength - 5) * 10));

    return {
      characters,
      words,
      lines,
      readabilityScore: Math.round(readabilityScore)
    };
  }

  /**
   * Crea un historial de cambios
   */
  static createChangeHistory(): {
    add: (content: string, timestamp?: number) => void;
    undo: () => string | null;
    redo: () => string | null;
    canUndo: () => boolean;
    canRedo: () => boolean;
    clear: () => void;
  } {
    let history: Array<{ content: string; timestamp: number }> = [];
    let currentIndex = -1;

    return {
      add: (content: string, timestamp = Date.now()) => {
        // Remover elementos después del índice actual
        history = history.slice(0, currentIndex + 1);
        history.push({ content, timestamp });
        currentIndex = history.length - 1;
        
        // Limitar historial a 50 entradas
        if (history.length > 50) {
          history = history.slice(-50);
          currentIndex = history.length - 1;
        }
      },
      
      undo: () => {
        if (currentIndex > 0) {
          currentIndex--;
          return history[currentIndex].content;
        }
        return null;
      },
      
      redo: () => {
        if (currentIndex < history.length - 1) {
          currentIndex++;
          return history[currentIndex].content;
        }
        return null;
      },
      
      canUndo: () => currentIndex > 0,
      canRedo: () => currentIndex < history.length - 1,
      clear: () => {
        history = [];
        currentIndex = -1;
      }
    };
  }

  /**
   * Debounce para optimizar llamadas frecuentes
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle para limitar frecuencia de ejecución
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}