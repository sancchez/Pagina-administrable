import { TextEditingConfig } from '../types';

/**
 * Verifica si un elemento puede ser editado según la configuración
 */
export const canEditElement = (element: HTMLElement, config: TextEditingConfig): boolean => {
  // Verificar si el tipo de elemento está permitido
  if (!config.allowedElements.includes(element.tagName)) {
    return false;
  }
  
  // Verificar si el elemento tiene clases excluidas
  for (const excludedClass of config.excludedClasses) {
    if (element.classList.contains(excludedClass)) {
      return false;
    }
  }
  
  // Verificar si el elemento está dentro de un contenedor excluido
  for (const excludedClass of config.excludedClasses) {
    if (element.closest(`.${excludedClass}`)) {
      return false;
    }
  }
  
  // Verificar si el elemento ya está siendo editado
  if (element.contentEditable === 'true') {
    return false;
  }
  
  return true;
};

/**
 * Obtiene la posición de un elemento relativa a su contenedor
 */
export const getElementPosition = (element: HTMLElement, container?: HTMLElement) => {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0 };
  
  return {
    x: elementRect.left - containerRect.left,
    y: elementRect.top - containerRect.top,
    width: elementRect.width,
    height: elementRect.height
  };
};

/**
 * Determina si un elemento debe usar editor multilínea
 */
export const shouldUseMultiline = (element: HTMLElement, content: string): boolean => {
  const multilineElements = ['DIV', 'P', 'BLOCKQUOTE'];
  
  return (
    multilineElements.includes(element.tagName) ||
    content.includes('\n') ||
    content.length > 50
  );
};

/**
 * Copia los estilos computados de un elemento
 */
export const copyComputedStyles = (element: HTMLElement) => {
  const computedStyles = window.getComputedStyle(element);
  
  return {
    fontSize: computedStyles.fontSize,
    fontFamily: computedStyles.fontFamily,
    fontWeight: computedStyles.fontWeight,
    color: computedStyles.color,
    lineHeight: computedStyles.lineHeight,
    textAlign: computedStyles.textAlign,
    padding: computedStyles.padding,
    margin: computedStyles.margin
  };
};

/**
 * Sanitiza el contenido de texto
 */
export const sanitizeContent = (content: string, maxLength?: number): string => {
  let sanitized = content.trim();
  
  // Limitar longitud si se especifica
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remover caracteres peligrosos
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  return sanitized;
};

/**
 * Genera un ID único para el editor
 */
export const generateEditorId = (): string => {
  return `text-editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Verifica si un elemento está visible en el viewport
 */
export const isElementVisible = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Encuentra el elemento de texto más cercano
 */
export const findNearestTextElement = (element: HTMLElement, config: TextEditingConfig): HTMLElement | null => {
  // Primero verificar el elemento actual
  if (canEditElement(element, config)) {
    return element;
  }
  
  // Buscar en elementos padre
  let parent = element.parentElement;
  while (parent) {
    if (canEditElement(parent, config)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  
  // Buscar en elementos hijo
  const children = element.querySelectorAll('*');
  for (const child of Array.from(children)) {
    if (canEditElement(child as HTMLElement, config)) {
      return child as HTMLElement;
    }
  }
  
  return null;
};