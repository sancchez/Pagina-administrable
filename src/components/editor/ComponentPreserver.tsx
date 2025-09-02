import React, { useEffect, useRef, useCallback } from 'react';

interface ComponentPreserverProps {
  preservedElements: Set<HTMLElement>;
  containerRef: React.RefObject<HTMLElement>;
}

interface ElementSnapshot {
  element: HTMLElement;
  originalHTML: string;
  originalStyles: CSSStyleDeclaration;
  originalClasses: string;
  originalAttributes: { [key: string]: string };
  parentElement: HTMLElement | null;
  nextSibling: Node | null;
}

class ComponentPreserver {
  private snapshots = new Map<HTMLElement, ElementSnapshot>();
  private preservedElements = new WeakSet<HTMLElement>();
  private mutationObserver: MutationObserver | null = null;
  private isRestoring = false;

  constructor(private containerRef: React.RefObject<HTMLElement>) {
    this.setupMutationObserver();
  }

  // Configurar observador de mutaciones
  private setupMutationObserver() {
    this.mutationObserver = new MutationObserver((mutations) => {
      if (this.isRestoring) return;
      
      mutations.forEach((mutation) => {
        // Detectar elementos que han sido modificados destructivamente
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              this.handleElementRemoval(element);
            }
          });
          
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              this.handleElementAddition(element);
            }
          });
        }
        
        // Detectar cambios de atributos destructivos
        if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
          const element = mutation.target as HTMLElement;
          this.handleAttributeChange(element, mutation.attributeName);
        }
      });
    });
  }

  // Crear snapshot de un elemento
  public createSnapshot(element: HTMLElement): void {
    if (this.snapshots.has(element)) return;
    
    const computedStyles = window.getComputedStyle(element);
    const snapshot: ElementSnapshot = {
      element,
      originalHTML: element.outerHTML,
      originalStyles: computedStyles,
      originalClasses: element.className,
      originalAttributes: this.getElementAttributes(element),
      parentElement: element.parentElement,
      nextSibling: element.nextSibling
    };
    
    this.snapshots.set(element, snapshot);
    this.preservedElements.add(element);
    
    // Marcar elemento como preservado
    element.setAttribute('data-preserved', 'true');
    element.setAttribute('data-preserve-id', this.generatePreserveId());
  }

  // Restaurar elemento desde snapshot
  public restoreElement(element: HTMLElement): boolean {
    const snapshot = this.snapshots.get(element);
    if (!snapshot) return false;
    
    this.isRestoring = true;
    
    try {
      // Restaurar HTML si ha sido modificado significativamente
      if (this.hasSignificantChanges(element, snapshot)) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = snapshot.originalHTML;
        const restoredElement = tempDiv.firstElementChild as HTMLElement;
        
        if (restoredElement && snapshot.parentElement) {
          if (snapshot.nextSibling) {
            snapshot.parentElement.insertBefore(restoredElement, snapshot.nextSibling);
          } else {
            snapshot.parentElement.appendChild(restoredElement);
          }
          
          // Remover elemento dañado
          if (element.parentElement) {
            element.parentElement.removeChild(element);
          }
          
          // Actualizar snapshot con nuevo elemento
          this.snapshots.delete(element);
          this.snapshots.set(restoredElement, {
            ...snapshot,
            element: restoredElement
          });
          
          return true;
        }
      } else {
        // Restaurar atributos y clases
        this.restoreAttributes(element, snapshot);
        this.restoreClasses(element, snapshot);
        return true;
      }
    } catch (error) {
      console.error('Error restaurando elemento:', error);
    } finally {
      this.isRestoring = false;
    }
    
    return false;
  }

  // Verificar si hay cambios significativos
  private hasSignificantChanges(element: HTMLElement, snapshot: ElementSnapshot): boolean {
    // Verificar si la estructura HTML ha cambiado drásticamente
    const currentHTML = element.outerHTML;
    const originalHTML = snapshot.originalHTML;
    
    // Comparar tags principales
    const currentTag = element.tagName;
    const originalTag = snapshot.element.tagName;
    
    if (currentTag !== originalTag) return true;
    
    // Verificar si se han perdido atributos importantes
    const importantAttrs = ['class', 'id', 'data-editable-type', 'data-movable'];
    for (const attr of importantAttrs) {
      const currentValue = element.getAttribute(attr);
      const originalValue = snapshot.originalAttributes[attr];
      
      if (originalValue && !currentValue) return true;
    }
    
    // Verificar si el contenido se ha simplificado demasiado
    if (originalHTML.length > 100 && currentHTML.length < originalHTML.length * 0.5) {
      return true;
    }
    
    return false;
  }

  // Restaurar atributos
  private restoreAttributes(element: HTMLElement, snapshot: ElementSnapshot): void {
    Object.entries(snapshot.originalAttributes).forEach(([name, value]) => {
      if (element.getAttribute(name) !== value) {
        element.setAttribute(name, value);
      }
    });
  }

  // Restaurar clases
  private restoreClasses(element: HTMLElement, snapshot: ElementSnapshot): void {
    if (element.className !== snapshot.originalClasses) {
      element.className = snapshot.originalClasses;
    }
  }

  // Obtener atributos de un elemento
  private getElementAttributes(element: HTMLElement): { [key: string]: string } {
    const attributes: { [key: string]: string } = {};
    
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }
    
    return attributes;
  }

  // Generar ID único para preservación
  private generatePreserveId(): string {
    return `preserve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Manejar eliminación de elementos
  private handleElementRemoval(element: HTMLElement): void {
    if (this.preservedElements.has(element)) {
      console.warn('Elemento preservado fue eliminado:', element);
      // Intentar restaurar automáticamente
      setTimeout(() => {
        this.restoreElement(element);
      }, 100);
    }
  }

  // Manejar adición de elementos
  private handleElementAddition(element: HTMLElement): void {
    // Verificar si es un elemento que reemplaza a uno preservado
    const preserveId = element.getAttribute('data-preserve-id');
    if (preserveId) {
      // Re-aplicar preservación
      this.preservedElements.add(element);
    }
  }

  // Manejar cambios de atributos
  private handleAttributeChange(element: HTMLElement, attributeName: string | null): void {
    if (!attributeName || !this.preservedElements.has(element)) return;
    
    const snapshot = this.snapshots.get(element);
    if (!snapshot) return;
    
    // Verificar si el cambio es destructivo
    const importantAttrs = ['class', 'data-editable-type', 'data-movable', 'data-gradient-editable'];
    
    if (importantAttrs.includes(attributeName)) {
      const currentValue = element.getAttribute(attributeName);
      const originalValue = snapshot.originalAttributes[attributeName];
      
      // Si se perdió un atributo importante, restaurarlo
      if (originalValue && !currentValue) {
        element.setAttribute(attributeName, originalValue);
      }
    }
  }

  // Iniciar observación
  public startObserving(): void {
    if (this.mutationObserver && this.containerRef.current) {
      this.mutationObserver.observe(this.containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true
      });
    }
  }

  // Detener observación
  public stopObserving(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  // Limpiar snapshots
  public clearSnapshots(): void {
    this.snapshots.clear();
    this.preservedElements = new WeakSet();
  }

  // Obtener elementos preservados
  public getPreservedElements(): HTMLElement[] {
    return Array.from(this.snapshots.keys());
  }

  // Destruir preservador
  public destroy(): void {
    this.stopObserving();
    this.clearSnapshots();
    this.mutationObserver = null;
  }
}

interface ComponentPreserverComponentProps {
  preservedElements: Set<HTMLElement>;
  containerRef: React.RefObject<HTMLElement>;
  enabled?: boolean;
  onElementSelect?: (element: HTMLElement) => void;
}

const ComponentPreserverComponent: React.FC<ComponentPreserverComponentProps> = ({ 
  preservedElements,
  containerRef, 
  enabled = true, 
  onElementSelect 
}) => {
  const preserverRef = useRef<ComponentPreserver | null>(null);

  // Inicializar preservador
  useEffect(() => {
    if (enabled && containerRef.current) {
      preserverRef.current = new ComponentPreserver(containerRef);
      preserverRef.current.startObserving();
      
      return () => {
        if (preserverRef.current) {
          preserverRef.current.destroy();
        }
      };
    }
  }, [enabled, containerRef]);

  // Función para preservar elemento seleccionado
  const preserveSelectedElement = useCallback((element: HTMLElement) => {
    if (preserverRef.current && element) {
      preserverRef.current.createSnapshot(element);
    }
  }, []);

  // Función para restaurar elemento
  const restoreElement = useCallback((element: HTMLElement) => {
    if (preserverRef.current && element) {
      return preserverRef.current.restoreElement(element);
    }
    return false;
  }, []);

  // Exponer funciones al componente padre
  useEffect(() => {
    if (enabled && containerRef.current) {
      // Agregar funciones al contenedor para acceso externo
      (containerRef.current as any).preserveElement = preserveSelectedElement;
      (containerRef.current as any).restoreElement = restoreElement;
    }
  }, [enabled, preserveSelectedElement, restoreElement]);

  return null; // Componente invisible
};

export default ComponentPreserverComponent;
export { ComponentPreserver };