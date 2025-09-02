import React, { useState, useRef, useCallback } from 'react';

interface DragDropAreaProps {
  children: React.ReactNode;
  onContentChange?: (content: string, immediate?: boolean) => void;
  className?: string;
}

interface DragState {
  isDragging: boolean;
  draggedElement: HTMLElement | null;
  dropTarget: HTMLElement | null;
  placeholder: HTMLElement | null;
}

const DragDropArea: React.FC<DragDropAreaProps> = ({
  children,
  onContentChange,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedElement: null,
    dropTarget: null,
    placeholder: null
  });

  const createPlaceholder = useCallback(() => {
    const placeholder = document.createElement('div');
    placeholder.className = 'drag-placeholder';
    placeholder.style.cssText = `
      height: 4px;
      background-color: #3b82f6;
      border-radius: 2px;
      margin: 8px 0;
      opacity: 0.8;
      transition: all 0.2s ease;
    `;
    return placeholder;
  }, []);

  const startDrag = useCallback((element: HTMLElement) => {
    console.log('🚀 Iniciando drag para elemento:', element.tagName, element.textContent?.substring(0, 50));
    
    const placeholder = createPlaceholder();
    
    setDragState({
      isDragging: true,
      draggedElement: element,
      dropTarget: null,
      placeholder
    });

    // Insertar placeholder después del elemento
    if (element.parentNode) {
      element.parentNode.insertBefore(placeholder, element.nextSibling);
    }

    // Estilo visual para el elemento arrastrado
    element.style.opacity = '0.6';
    element.style.transform = 'rotate(1deg) scale(1.02)';
    element.style.zIndex = '1001';
    element.style.pointerEvents = 'none';
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      // Enhanced boundary checking to prevent elements from leaving the page
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Define safe margins from viewport edges
      const margin = 50;
      const minX = margin;
      const minY = margin;
      const maxX = viewportWidth - margin;
      const maxY = viewportHeight - margin;
      
      // Constrain mouse position within safe bounds
      const constrainedX = Math.max(minX, Math.min(maxX, e.clientX));
      const constrainedY = Math.max(minY, Math.min(maxY, e.clientY));
      
      // Additional check to ensure element stays within container bounds
      const containerMinX = containerRect.left;
      const containerMinY = containerRect.top;
      const containerMaxX = containerRect.right;
      const containerMaxY = containerRect.bottom;
      
      const finalX = Math.max(containerMinX, Math.min(containerMaxX, constrainedX));
      const finalY = Math.max(containerMinY, Math.min(containerMaxY, constrainedY));

      const elements = Array.from(
        containerRef.current.querySelectorAll(
          'h1, h2, h3, h4, h5, h6, p, div, img, table, blockquote, ul, ol, li'
        )
      ).filter(el => {
        return el !== element && 
               el !== placeholder && 
               !el.classList.contains('drag-handle') &&
               !el.classList.contains('drag-placeholder') &&
               el.textContent?.trim() !== '';
      });

      let closestElement: Element | null = null;
      let closestDistance = Infinity;
      let insertBefore = false;

      // Use constrained mouse position for calculations
      const mouseY = finalY - containerRect.top;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const containerRelativeTop = rect.top - containerRect.top;
        const centerY = containerRelativeTop + rect.height / 2;
        const distance = Math.abs(mouseY - centerY);

        if (distance < closestDistance && distance < 120) {
          closestDistance = distance;
          closestElement = el;
          insertBefore = mouseY < centerY;
        }
      });

      // Si no hay elemento cercano, verificar si estamos al inicio o final del contenedor
      if (!closestElement && elements.length > 0) {
        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];
        const firstRect = firstElement.getBoundingClientRect();
        const lastRect = lastElement.getBoundingClientRect();
        
        // Si estamos arriba del primer elemento, insertar al inicio
        if (mouseY < firstRect.top - containerRect.top) {
          closestElement = firstElement;
          insertBefore = true;
        }
        // Si estamos debajo del último elemento, insertar al final
        else if (mouseY > lastRect.bottom - containerRect.top) {
          closestElement = lastElement;
          insertBefore = false;
        }
      }

      if (closestElement && placeholder.parentNode) {
        const closestHTMLElement = closestElement as HTMLElement;
        try {
          if (insertBefore) {
            if (closestHTMLElement.parentNode) {
              closestHTMLElement.parentNode.insertBefore(placeholder, closestHTMLElement);
            }
          } else {
            if (closestHTMLElement.parentNode) {
              closestHTMLElement.parentNode.insertBefore(placeholder, closestHTMLElement.nextSibling);
            }
          }
        } catch (error) {
          console.warn('Error al mover placeholder:', error);
        }
      }
    };

    const handleMouseUp = () => {
      console.log('🏁 Finalizando drag');
      
      // Verificar que el elemento aún existe en el DOM
      if (!element || !document.contains(element)) {
        console.error('Elemento perdido durante el drag');
        // Limpiar placeholder si existe
        if (placeholder && placeholder.parentNode) {
          placeholder.remove();
        }
        return;
      }
      
      if (placeholder && placeholder.parentNode) {
        try {
          // Verificar que el placeholder aún está en el DOM
          if (document.contains(placeholder)) {
            // Mover el elemento a la posición del placeholder
            placeholder.parentNode.insertBefore(element, placeholder);
            placeholder.remove();
          } else {
            // Si el placeholder se perdió, restaurar el elemento a su contenedor
            if (containerRef.current && !containerRef.current.contains(element)) {
              containerRef.current.appendChild(element);
            }
          }

          // Restaurar estilos siempre
          element.style.opacity = '';
          element.style.transform = '';
          element.style.zIndex = '';
          element.style.pointerEvents = '';

          // Notificar cambio de contenido inmediatamente para drag & drop
          if (onContentChange && containerRef.current) {
            console.log('📤 Notificando cambio de contenido después del drag');
            onContentChange(containerRef.current.innerHTML, true);
          }

          // Reagregar handles después del movimiento
          setTimeout(() => {
            addDragHandles();
          }, 100);
        } catch (error) {
          console.error('Error al finalizar drag:', error);
          // Restauración de emergencia
          if (element) {
            element.style.opacity = '';
            element.style.transform = '';
            element.style.zIndex = '';
            element.style.pointerEvents = '';
            
            // Asegurar que el elemento esté en el contenedor
            if (containerRef.current && !containerRef.current.contains(element)) {
              containerRef.current.appendChild(element);
            }
          }
          
          // Limpiar placeholder
          if (placeholder && placeholder.parentNode) {
            placeholder.remove();
          }
        }
      } else {
        // Si no hay placeholder, solo restaurar estilos
        element.style.opacity = '';
        element.style.transform = '';
        element.style.zIndex = '';
        element.style.pointerEvents = '';
      }

      setDragState({
        isDragging: false,
        draggedElement: null,
        dropTarget: null,
        placeholder: null
      });

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [createPlaceholder, onContentChange]);

  const addDragHandles = useCallback(() => {
    if (!containerRef.current) return;

    // Limpiar handles existentes primero
    const existingHandles = containerRef.current.querySelectorAll('.drag-handle');
    existingHandles.forEach(handle => handle.remove());

    // Buscar elementos editables de manera más específica y mejorada
    const elements = containerRef.current.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, img, table, blockquote, ul, ol, li:not(:empty), div[data-shape], div[data-movable], div[data-resizable]'
    );

    elements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Filtrar elementos que no deberían tener handles con mejor lógica
      if (htmlElement.classList.contains('drag-handle') || 
          htmlElement.classList.contains('drag-placeholder') ||
          htmlElement.closest('.drag-handle') ||
          htmlElement.tagName === 'BR' ||
          htmlElement.closest('.prose') === null) { // Solo elementos dentro de .prose
        return;
      }
      
      // Elementos geométricos y movibles siempre deben tener handles
      const isGeometricShape = htmlElement.hasAttribute('data-shape');
      const isMovableElement = htmlElement.hasAttribute('data-movable');
      const isResizableElement = htmlElement.hasAttribute('data-resizable');
      
      // Si es un elemento geométrico o movible, no aplicar filtros adicionales
      if (!isGeometricShape && !isMovableElement && !isResizableElement) {
        // Aplicar filtros solo para elementos de texto
        if (htmlElement.textContent?.trim() === '' && htmlElement.tagName !== 'IMG') {
          return;
        }
        
        // Mejorar la detección para elementos anidados
        const isNestedInEditableElement = htmlElement.closest('h1, h2, h3, h4, h5, h6, p, blockquote, li') !== htmlElement;
        if (isNestedInEditableElement && htmlElement.tagName !== 'IMG') {
          return;
        }
      }

      const handle = document.createElement('div');
      handle.className = 'drag-handle';
      handle.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="12" r="1"/>
          <circle cx="9" cy="5" r="1"/>
          <circle cx="9" cy="19" r="1"/>
          <circle cx="15" cy="12" r="1"/>
          <circle cx="15" cy="5" r="1"/>
          <circle cx="15" cy="19" r="1"/>
        </svg>
      `;
      handle.style.cssText = `
        position: absolute;
        left: -40px;
        top: 50%;
        transform: translateY(-50%);
        width: 28px;
        height: 28px;
        background: #ffffff;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        cursor: grab;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1000;
        color: #6b7280;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        backdrop-filter: blur(4px);
      `;

      // Store original position and styles to prevent jumping
      const computedStyle = window.getComputedStyle(htmlElement);
      
      // Only set position relative if absolutely necessary and store original
      if (computedStyle.position === 'static') {
        htmlElement.setAttribute('data-original-position', 'static');
        htmlElement.style.position = 'relative';
      }

      // Don't modify minHeight or padding to prevent layout shifts
      // The handle will be positioned absolutely and won't require these changes
      
      // Mejorar la detección del área clickeable
      // Usar cursor apropiado según el tipo de elemento
      if (isGeometricShape || isMovableElement || isResizableElement) {
        htmlElement.style.cursor = 'pointer';
      } else {
        htmlElement.style.cursor = 'text';
      }
      htmlElement.setAttribute('data-editable', 'true');

      htmlElement.appendChild(handle);

      // Eventos de hover mejorados con mejor feedback visual
      const showHandle = () => {
        handle.style.opacity = '1';
        handle.style.transform = 'translateY(-50%) scale(1.1)';
        handle.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.3)';
        htmlElement.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
      };

      const hideHandle = () => {
        if (!dragState.isDragging) {
          handle.style.opacity = '0';
          handle.style.transform = 'translateY(-50%) scale(1)';
          handle.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          htmlElement.style.backgroundColor = '';
        }
      };

      htmlElement.addEventListener('mouseenter', showHandle);
      htmlElement.addEventListener('mouseleave', hideHandle);

      // Eventos de drag mejorados
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handle.style.cursor = 'grabbing';
        startDrag(htmlElement);
      });

      handle.addEventListener('mouseenter', () => {
        handle.style.borderColor = '#3b82f6';
        handle.style.color = '#3b82f6';
        handle.style.backgroundColor = '#f8fafc';
        handle.style.transform = 'translateY(-50%) scale(1.15)';
      });

      handle.addEventListener('mouseleave', () => {
        if (!dragState.isDragging) {
          handle.style.borderColor = '#e5e7eb';
          handle.style.color = '#6b7280';
          handle.style.backgroundColor = '#ffffff';
          handle.style.transform = 'translateY(-50%) scale(1.1)';
        }
      });
    });

    console.log('🎯 Handles agregados a', elements.length, 'elementos');
  }, [dragState.isDragging, startDrag]);



  // Agregar handles cuando el contenido cambie
  React.useEffect(() => {
    const timer = setTimeout(() => {
      addDragHandles();
    }, 200);

    return () => clearTimeout(timer);
  }, [children, addDragHandles]);

  // Observer para detectar cambios en el DOM y reagregar handles
  React.useEffect(() => {
    if (!containerRef.current) return;

    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Solo actualizar si se agregaron/removieron elementos significativos
          const addedNodes = Array.from(mutation.addedNodes);
          const removedNodes = Array.from(mutation.removedNodes);
          
          const significantChange = [...addedNodes, ...removedNodes].some(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              return !element.classList.contains('drag-handle') && 
                     !element.classList.contains('drag-placeholder') &&
                     element.tagName !== 'BR';
            }
            return false;
          });
          
          if (significantChange) {
            shouldUpdate = true;
          }
        }
      });
      
      if (shouldUpdate) {
        console.log('🔄 DOM cambió, reagregando handles');
        setTimeout(() => {
          addDragHandles();
        }, 100);
      }
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [addDragHandles]);

  // Agregar handles al montar el componente
  React.useEffect(() => {
    const timer = setTimeout(() => {
      addDragHandles();
    }, 500); // Delay inicial más largo para asegurar que el contenido esté renderizado

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`drag-drop-area ${className}`}
      style={{
        position: 'relative',
        paddingLeft: '48px', // Espacio ampliado para los handles
        minHeight: '200px' // Altura mínima para mejor UX
      }}
    >
      {children}
      
      <style>{`
        .drag-drop-area :global(.drag-handle:hover) {
          background-color: #e5e7eb !important;
          color: #374151 !important;
        }
        
        .drag-drop-area :global(.drag-handle:active) {
          cursor: grabbing !important;
          background-color: #d1d5db !important;
        }
      `}</style>
    </div>
  );
};

export default DragDropArea;