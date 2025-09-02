import React, { useRef, useCallback } from 'react';

interface ElementState {
  element: HTMLElement;
  originalHTML: string;
  originalStyles: CSSStyleDeclaration;
  originalClasses: string[];
  originalAttributes: { [key: string]: string };
  parentElement: HTMLElement | null;
  nextSibling: Node | null;
  computedStyles: { [key: string]: string };
  preservationId: string;
  timestamp: number;
}

interface ElementPreserverProps {
  onElementPreserved?: (element: HTMLElement, preservationId: string) => void;
  onElementRestored?: (element: HTMLElement, preservationId: string) => void;
}

const ElementPreserver: React.FC<ElementPreserverProps> = ({
  onElementPreserved,
  onElementRestored
}) => {
  const preservedElements = useRef<Map<string, ElementState>>(new Map());
  const preservationCounter = useRef(0);

  // Propiedades CSS críticas que deben preservarse
  const criticalCSSProperties = [
    'position', 'top', 'left', 'right', 'bottom',
    'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
    'borderRadius', 'borderWidth', 'borderStyle', 'borderColor',
    'background', 'backgroundColor', 'backgroundImage', 'backgroundSize',
    'backgroundPosition', 'backgroundRepeat', 'backgroundAttachment',
    'color', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle',
    'lineHeight', 'textAlign', 'textDecoration', 'textTransform',
    'display', 'visibility', 'opacity', 'zIndex', 'overflow',
    'overflowX', 'overflowY', 'transform', 'transformOrigin',
    'transition', 'animation', 'boxShadow', 'textShadow',
    'flex', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems',
    'grid', 'gridTemplate', 'gridArea', 'gap'
  ];

  /**
   * Preserva completamente un elemento antes de cualquier modificación
   */
  const preserveElement = useCallback((element: HTMLElement): string => {
    const preservationId = `preserve_${Date.now()}_${++preservationCounter.current}`;
    
    // Obtener estilos computados
    const computedStyles = window.getComputedStyle(element);
    const styleSnapshot: { [key: string]: string } = {};
    
    // Capturar todas las propiedades CSS críticas
    criticalCSSProperties.forEach(property => {
      styleSnapshot[property] = computedStyles.getPropertyValue(property);
    });

    // Capturar atributos originales
    const originalAttributes: { [key: string]: string } = {};
    Array.from(element.attributes).forEach(attr => {
      originalAttributes[attr.name] = attr.value;
    });

    // Crear estado de preservación
    const elementState: ElementState = {
      element,
      originalHTML: element.outerHTML,
      originalStyles: element.style,
      originalClasses: Array.from(element.classList),
      originalAttributes,
      parentElement: element.parentElement,
      nextSibling: element.nextElementSibling,
      computedStyles: styleSnapshot,
      preservationId,
      timestamp: Date.now()
    };

    // Guardar en el mapa de elementos preservados
    preservedElements.current.set(preservationId, elementState);
    
    // Marcar el elemento con el ID de preservación
    element.dataset.preservationId = preservationId;
    element.dataset.preserved = 'true';
    element.dataset.preservedAt = elementState.timestamp.toString();

    // Aplicar estilos inline para garantizar que se mantengan
    criticalCSSProperties.forEach(property => {
      const value = styleSnapshot[property];
      if (value && value !== 'none' && value !== 'auto' && value !== 'initial') {
        element.style.setProperty(property, value, 'important');
      }
    });

    console.log('🛡️ Elemento preservado:', {
      tag: element.tagName,
      id: preservationId,
      classes: elementState.originalClasses,
      styles: Object.keys(styleSnapshot).length
    });

    onElementPreserved?.(element, preservationId);
    return preservationId;
  }, [onElementPreserved]);

  /**
   * Restaura un elemento a su estado original preservado
   */
  const restoreElement = useCallback((preservationId: string): boolean => {
    const elementState = preservedElements.current.get(preservationId);
    if (!elementState) {
      console.warn('🚫 No se encontró estado preservado para:', preservationId);
      return false;
    }

    const { element, originalClasses, originalAttributes, computedStyles } = elementState;

    try {
      // Restaurar clases originales
      element.className = '';
      originalClasses.forEach(className => {
        if (className && !className.startsWith('text-editing')) {
          element.classList.add(className);
        }
      });

      // Restaurar atributos originales (excepto los de preservación)
      Object.entries(originalAttributes).forEach(([name, value]) => {
        if (!name.startsWith('data-preservation') && !name.startsWith('data-preserved')) {
          element.setAttribute(name, value);
        }
      });

      // Restaurar estilos computados críticos
      Object.entries(computedStyles).forEach(([property, value]) => {
        if (value && value !== 'none' && value !== 'auto' && value !== 'initial') {
          element.style.setProperty(property, value, 'important');
        }
      });

      // Limpiar marcadores de edición
      element.classList.remove('text-editing-active', 'hitbox-selected');
      element.removeAttribute('data-editing-id');
      element.removeAttribute('contenteditable');

      // Mantener marcadores de preservación para futuras referencias
      element.dataset.restored = 'true';
      element.dataset.restoredAt = Date.now().toString();

      console.log('🔄 Elemento restaurado:', {
        tag: element.tagName,
        id: preservationId,
        classes: Array.from(element.classList)
      });

      onElementRestored?.(element, preservationId);
      return true;
    } catch (error) {
      console.error('❌ Error restaurando elemento:', error);
      return false;
    }
  }, [onElementRestored]);

  /**
   * Restaura un elemento por referencia directa
   */
  const restoreElementByRef = useCallback((element: HTMLElement): boolean => {
    const preservationId = element.dataset.preservationId;
    if (!preservationId) {
      console.warn('🚫 Elemento no tiene ID de preservación');
      return false;
    }
    return restoreElement(preservationId);
  }, [restoreElement]);

  /**
   * Limpia elementos preservados antiguos (más de 5 minutos)
   */
  const cleanupOldPreservations = useCallback(() => {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutos

    for (const [id, state] of preservedElements.current.entries()) {
      if (now - state.timestamp > maxAge) {
        preservedElements.current.delete(id);
        console.log('🧹 Limpiando preservación antigua:', id);
      }
    }
  }, []);

  /**
   * Obtiene información de un elemento preservado
   */
  const getPreservationInfo = useCallback((preservationId: string) => {
    return preservedElements.current.get(preservationId);
  }, []);

  /**
   * Verifica si un elemento está preservado
   */
  const isElementPreserved = useCallback((element: HTMLElement): boolean => {
    return element.dataset.preserved === 'true' && !!element.dataset.preservationId;
  }, []);

  /**
   * Obtiene todos los elementos preservados
   */
  const getAllPreservedElements = useCallback(() => {
    return Array.from(preservedElements.current.values());
  }, []);

  // Exponer métodos a través de ref
  React.useImperativeHandle(React.createRef(), () => ({
    preserveElement,
    restoreElement,
    restoreElementByRef,
    cleanupOldPreservations,
    getPreservationInfo,
    isElementPreserved,
    getAllPreservedElements
  }));

  // Limpieza automática cada minuto
  React.useEffect(() => {
    const interval = setInterval(cleanupOldPreservations, 60000);
    return () => clearInterval(interval);
  }, [cleanupOldPreservations]);

  return null; // Este es un componente de utilidad sin UI
};

export default ElementPreserver;
export type { ElementState, ElementPreserverProps };

// Hook personalizado para usar el preservador
export const useElementPreserver = () => {
  const preserverRef = useRef<any>(null);
  
  return {
    preserveElement: (element: HTMLElement) => preserverRef.current?.preserveElement(element),
    restoreElement: (id: string) => preserverRef.current?.restoreElement(id),
    restoreElementByRef: (element: HTMLElement) => preserverRef.current?.restoreElementByRef(element),
    isElementPreserved: (element: HTMLElement) => preserverRef.current?.isElementPreserved(element),
    preserverRef
  };
};