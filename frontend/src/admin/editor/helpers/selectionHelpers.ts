import { Editor, Component } from 'grapesjs';

// Tipos para información de elementos
export interface ElementInfo {
  tagName: string;
  id?: string;
  classes: string[];
  text?: string;
  src?: string;
  href?: string;
  type: 'text' | 'image' | 'link' | 'button' | 'container' | 'section' | 'other';
  hasChildren: boolean;
  parentType?: string;
}

/**
 * Obtiene información detallada del elemento seleccionado
 */
export const getSelectedElementInfo = (editor: Editor): ElementInfo | null => {
  const selected = editor.getSelected();
  if (!selected) return null;

  const tagName = selected.get('tagName') || '';
  const attributes = selected.getAttributes();
  const classes = selected.getClasses();
  const parent = selected.parent();
  
  // Determinar tipo de elemento
  let type: ElementInfo['type'] = 'other';
  
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'].includes(tagName.toLowerCase())) {
    const textContent = getElementTextContent(selected);
    if (textContent && textContent.trim().length > 0) {
      type = 'text';
    } else {
      type = 'container';
    }
  } else if (tagName.toLowerCase() === 'img') {
    type = 'image';
  } else if (tagName.toLowerCase() === 'a') {
    type = 'link';
  } else if (tagName.toLowerCase() === 'button' || classes.some(cls => cls.includes('btn'))) {
    type = 'button';
  } else if (tagName.toLowerCase() === 'section') {
    type = 'section';
  } else if (['div', 'article', 'aside', 'header', 'footer', 'main'].includes(tagName.toLowerCase())) {
    type = 'container';
  }

  return {
    tagName: tagName.toLowerCase(),
    id: attributes.id,
    classes: classes,
    text: getElementTextContent(selected),
    src: attributes.src,
    href: attributes.href,
    type,
    hasChildren: selected.components().length > 0,
    parentType: parent ? parent.get('tagName')?.toLowerCase() : undefined
  };
};

/**
 * Obtiene el contenido de texto de un elemento
 */
export const getElementTextContent = (component: Component): string => {
  if (!component) return '';
  
  // Si es un elemento de texto directo
  const content = component.get('content');
  if (typeof content === 'string') {
    return content.replace(/<[^>]*>/g, '').trim();
  }
  
  // Si tiene componentes hijos, buscar texto en ellos
  const children = component.components();
  if (children.length > 0) {
    return children.models
      .map(child => getElementTextContent(child))
      .filter(text => text.length > 0)
      .join(' ')
      .trim();
  }
  
  return '';
};

/**
 * Formatea información del elemento para mostrar en UI
 */
export const formatElementInfoForDisplay = (info: ElementInfo | null): string => {
  if (!info) return 'Ningún elemento seleccionado';
  
  let display = info.tagName.toUpperCase();
  
  if (info.id) {
    display += `#${info.id}`;
  }
  
  if (info.classes.length > 0) {
    display += `.${info.classes.slice(0, 2).join('.')}`;
    if (info.classes.length > 2) {
      display += '...';
    }
  }
  
  if (info.text && info.text.length > 0) {
    const truncatedText = info.text.length > 20 
      ? info.text.substring(0, 20) + '...' 
      : info.text;
    display += ` "${truncatedText}"`;
  }
  
  return display;
};

/**
 * Verifica si el elemento seleccionado puede ser alineado
 */
export const canAlignElement = (editor: Editor): boolean => {
  const selected = editor.getSelected();
  if (!selected) return false;
  
  const tagName = selected.get('tagName')?.toLowerCase();
  const style = selected.getStyle();
  
  // Elementos que pueden ser alineados
  const alignableElements = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'img', 'button', 'a'];
  
  if (!alignableElements.includes(tagName || '')) return false;
  
  // No alinear elementos con position absolute/fixed
  if (style.position === 'absolute' || style.position === 'fixed') return false;
  
  return true;
};

/**
 * Verifica si el elemento seleccionado puede ser convertido a circular
 */
export const canMakeCircular = (editor: Editor): boolean => {
  const selected = editor.getSelected();
  if (!selected) return false;
  
  const tagName = selected.get('tagName')?.toLowerCase();
  
  // Elementos que pueden ser circulares
  const circularElements = ['img', 'div', 'button', 'span'];
  
  return circularElements.includes(tagName || '');
};

/**
 * Verifica si el elemento seleccionado puede recibir imágenes pegadas
 */
export const canReceivePastedImage = (editor: Editor): boolean => {
  const selected = editor.getSelected();
  if (!selected) return true; // Si no hay selección, se puede pegar en el wrapper
  
  const tagName = selected.get('tagName')?.toLowerCase();
  
  // Si es una imagen, se puede reemplazar
  if (tagName === 'img') return true;
  
  // Si es un contenedor, se puede agregar
  const containerElements = ['div', 'section', 'article', 'aside', 'header', 'footer', 'main'];
  
  return containerElements.includes(tagName || '');
};

/**
 * Obtiene acciones rápidas disponibles para el elemento seleccionado
 */
export const getAvailableQuickActions = (editor: Editor): string[] => {
  const actions: string[] = [];
  
  if (canAlignElement(editor)) {
    actions.push('align-left', 'align-center', 'align-right');
  }
  
  if (canMakeCircular(editor)) {
    actions.push('make-circular');
  }
  
  if (canReceivePastedImage(editor)) {
    actions.push('paste-image');
  }
  
  // Acciones siempre disponibles
  actions.push('paste-from-clipboard');
  
  return actions;
};

/**
 * Aplica alineación al elemento seleccionado
 */
export const applyAlignment = (editor: Editor, alignment: 'left' | 'center' | 'right'): boolean => {
  const selected = editor.getSelected();
  if (!selected || !canAlignElement(editor)) return false;
  
  const tagName = selected.get('tagName')?.toLowerCase();
  const style = selected.getStyle();
  const parent = selected.parent();
  const parentStyle = parent ? parent.getStyle() : {};
  
  try {
    // Lógica de alineación según el contexto del elemento
    if (style.position === 'absolute') {
      // Elementos con posición absoluta
      switch (alignment) {
        case 'left':
          selected.addStyle({ left: '0', right: 'auto', transform: 'none' });
          break;
        case 'center':
          selected.addStyle({ left: '50%', right: 'auto', transform: 'translateX(-50%)' });
          break;
        case 'right':
          selected.addStyle({ right: '0', left: 'auto', transform: 'none' });
          break;
      }
    } else if (parentStyle.display === 'flex') {
      // Elementos dentro de contenedores flex
      switch (alignment) {
        case 'left':
          parent?.addStyle({ 'justify-content': 'flex-start' });
          break;
        case 'center':
          parent?.addStyle({ 'justify-content': 'center' });
          break;
        case 'right':
          parent?.addStyle({ 'justify-content': 'flex-end' });
          break;
      }
    } else if (parentStyle.display === 'grid') {
      // Elementos dentro de contenedores grid
      switch (alignment) {
        case 'left':
          selected.addStyle({ 'justify-self': 'start' });
          break;
        case 'center':
          selected.addStyle({ 'justify-self': 'center' });
          break;
        case 'right':
          selected.addStyle({ 'justify-self': 'end' });
          break;
      }
    } else if (style.display === 'inline' || style.display === 'inline-block') {
      // Elementos inline
      switch (alignment) {
        case 'left':
          parent?.addStyle({ 'text-align': 'left' });
          break;
        case 'center':
          parent?.addStyle({ 'text-align': 'center' });
          break;
        case 'right':
          parent?.addStyle({ 'text-align': 'right' });
          break;
      }
    } else if (tagName === 'img' || tagName === 'svg') {
      // Imágenes y SVGs
      switch (alignment) {
        case 'left':
          selected.addStyle({ margin: '0 auto 0 0', display: 'block' });
          break;
        case 'center':
          selected.addStyle({ margin: '0 auto', display: 'block' });
          break;
        case 'right':
          selected.addStyle({ margin: '0 0 0 auto', display: 'block' });
          break;
      }
    } else {
      // Elementos de texto y otros
      selected.addStyle({ 'text-align': alignment });
    }
    
    return true;
  } catch (error) {
    console.error('Error aplicando alineación:', error);
    return false;
  }
};

/**
 * Convierte elemento a circular
 */
export const makeElementCircular = (editor: Editor): boolean => {
  const selected = editor.getSelected();
  if (!selected || !canMakeCircular(editor)) return false;
  
  try {
    selected.addStyle({ 'border-radius': '50%' });
    return true;
  } catch (error) {
    console.error('Error haciendo elemento circular:', error);
    return false;
  }
};

/**
 * Obtiene el path completo del elemento en el DOM
 */
export const getElementPath = (editor: Editor): string => {
  const selected = editor.getSelected();
  if (!selected) return '';
  
  const path: string[] = [];
  let current: Component | null = selected;
  
  while (current && current !== editor.getWrapper()) {
    const tagName = current.get('tagName')?.toLowerCase() || 'unknown';
    const classes = current.getClasses();
    const id = current.getAttributes().id;
    
    let selector = tagName;
    if (id) {
      selector += `#${id}`;
    }
    if (classes.length > 0) {
      selector += `.${classes.slice(0, 2).join('.')}`;
    }
    
    path.unshift(selector);
    current = current.parent();
  }
  
  return path.join(' > ');
};

/**
 * Cuenta elementos del mismo tipo en la página
 */
export const countSimilarElements = (editor: Editor): number => {
  const selected = editor.getSelected();
  if (!selected) return 0;
  
  const tagName = selected.get('tagName')?.toLowerCase();
  if (!tagName) return 0;
  
  const allComponents = editor.getWrapper()?.find(`[data-gjs-type="${tagName}"]`) || [];
  return allComponents.length;
};

/**
 * Verifica si el elemento tiene estilos personalizados
 */
export const hasCustomStyles = (editor: Editor): boolean => {
  const selected = editor.getSelected();
  if (!selected) return false;
  
  const style = selected.getStyle();
  return Object.keys(style).length > 0;
};

/**
 * Obtiene información de rendimiento del elemento
 */
export const getElementPerformanceInfo = (editor: Editor): { 
  depth: number; 
  childrenCount: number; 
  hasImages: boolean; 
  hasVideos: boolean; 
} => {
  const selected = editor.getSelected();
  if (!selected) return { depth: 0, childrenCount: 0, hasImages: false, hasVideos: false };
  
  // Calcular profundidad
  let depth = 0;
  let current: Component | null = selected;
  while (current && current !== editor.getWrapper()) {
    depth++;
    current = current.parent();
  }
  
  // Contar hijos
  const childrenCount = selected.components().length;
  
  // Verificar contenido multimedia
  const hasImages = selected.find('img').length > 0;
  const hasVideos = selected.find('video').length > 0;
  
  return { depth, childrenCount, hasImages, hasVideos };
};

/**
 * Sugiere optimizaciones para el elemento seleccionado
 */
export const getSuggestions = (editor: Editor): string[] => {
  const selected = editor.getSelected();
  if (!selected) return [];
  
  const suggestions: string[] = [];
  const info = getElementPerformanceInfo(editor);
  const elementInfo = getSelectedElementInfo(editor);
  
  // Sugerencias basadas en profundidad
  if (info.depth > 10) {
    suggestions.push('Elemento muy anidado, considera simplificar la estructura');
  }
  
  // Sugerencias basadas en hijos
  if (info.childrenCount > 20) {
    suggestions.push('Muchos elementos hijos, considera usar paginación o lazy loading');
  }
  
  // Sugerencias para imágenes
  if (elementInfo?.type === 'image' && !elementInfo.src?.includes('placeholder')) {
    suggestions.push('Considera optimizar el tamaño de la imagen');
  }
  
  // Sugerencias para texto
  if (elementInfo?.type === 'text' && elementInfo.text && elementInfo.text.length > 500) {
    suggestions.push('Texto muy largo, considera dividirlo en párrafos');
  }
  
  // Sugerencias para contenedores
  if (elementInfo?.type === 'container' && !hasCustomStyles(editor)) {
    suggestions.push('Considera agregar estilos para mejorar la apariencia');
  }
  
  return suggestions;
};