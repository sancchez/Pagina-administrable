import React, { useEffect, useRef, useCallback } from 'react';
import GradientTextEditor from './GradientTextEditor';
import UniversalTextEditor from './frameworks/text/UniversalTextEditor';
import EmojiPicker from './frameworks/interactive/EmojiPicker';
import TableEditor from './frameworks/data/TableEditor';
import ButtonEditor from './frameworks/interactive/ButtonEditor';
import MediaEditor from './frameworks/media/MediaEditor';
import LayoutEditor from './frameworks/layout/LayoutEditor';
import BackgroundRenderer from './BackgroundRenderer';
import ComponentPreserver from './ComponentPreserver';

interface HitboxManagerProps {
  containerRef: React.RefObject<HTMLElement>;
  enabled: boolean;
  onElementSelect?: (element: HTMLElement | null) => void;
}

interface ElementBounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

const HitboxManager: React.FC<HitboxManagerProps> = ({ containerRef, enabled, onElementSelect }) => {
  const dragState = useRef({
    isDragging: false,
    isResizing: false,
    element: null as HTMLElement | null,
    startX: 0,
    startY: 0,
    elementStartX: 0,
    elementStartY: 0,
    resizeDirection: null as string | null,
    originalBounds: null as ElementBounds | null
  });

  // Estado para el sistema de movimiento de objetos
  const movementState = useRef({
    selectedForMovement: null as HTMLElement | null,
    isMovementActive: false
  });

  // Debounce para optimizar detección de elementos
  
  // Cache para elementos detectados
  const elementCache = useRef<Map<string, HTMLElement[]>>(new Map());
  const cacheInvalidationTime = useRef<number>(0);

  const selectedElement = useRef<HTMLElement | null>(null);
  const preservedElements = useRef<Set<HTMLElement>>(new Set());
  const [showGradientEditor, setShowGradientEditor] = React.useState(false);
  const [gradientEditorPosition, setGradientEditorPosition] = React.useState({ x: 0, y: 0 });
  
  // Estados para los nuevos editores
  const [showUniversalTextEditor, setShowUniversalTextEditor] = React.useState(false);
  const [universalTextEditorPosition, setUniversalTextEditorPosition] = React.useState({ x: 0, y: 0 });
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = React.useState({ x: 0, y: 0 });
  const [showTableEditor, setShowTableEditor] = React.useState(false);
  const [tableEditorPosition, setTableEditorPosition] = React.useState({ x: 0, y: 0 });
  const [showButtonEditor, setShowButtonEditor] = React.useState(false);
  const [buttonEditorPosition, setButtonEditorPosition] = React.useState({ x: 0, y: 0 });
  const [showMediaEditor, setShowMediaEditor] = React.useState(false);
  const [mediaEditorPosition, setMediaEditorPosition] = React.useState({ x: 0, y: 0 });
  const [showLayoutEditor, setShowLayoutEditor] = React.useState(false);
  const [layoutEditorPosition, setLayoutEditorPosition] = React.useState({ x: 0, y: 0 });

  // Utility function to get precise element bounds
  const getElementBounds = useCallback((element: HTMLElement): ElementBounds => {
    const rect = element.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) {
      return {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      };
    }

    return {
      top: rect.top - containerRect.top,
      left: rect.left - containerRect.left,
      right: rect.right - containerRect.left,
      bottom: rect.bottom - containerRect.top,
      width: rect.width,
      height: rect.height
    };
  }, [containerRef]);

  // Función para limpiar hitboxes fantasma
  const cleanupPhantomHitboxes = useCallback(() => {
    if (!containerRef.current) return;
    
    const existingHitboxes = containerRef.current.querySelectorAll('.hitbox-overlay');
    existingHitboxes.forEach(hitbox => {
      const targetId = hitbox.getAttribute('data-target-id');
      if (targetId) {
        const targetElement = containerRef.current?.querySelector(`[data-element-id="${targetId}"]`);
        if (!targetElement) {
          // Remover hitbox huérfano
          hitbox.remove();
        }
      }
    });
  }, [containerRef]);

  // Función para seleccionar elemento para movimiento
  const selectElementForMovement = useCallback((element: HTMLElement | null) => {
    // Limpiar selección anterior
    if (movementState.current.selectedForMovement) {
      movementState.current.selectedForMovement.classList.remove('movement-selected');
      movementState.current.selectedForMovement.style.outline = '';
    }

    movementState.current.selectedForMovement = element;
    movementState.current.isMovementActive = element !== null;

    if (element) {
      element.classList.add('movement-selected');
      element.style.outline = '2px solid #ff6b35';
      element.style.cursor = 'move';
      console.log('🎯 Elemento seleccionado para movimiento:', element.tagName, element.className);
    }
  }, []);

  // Función para deseleccionar elemento de movimiento
  const deselectMovementElement = useCallback(() => {
    if (movementState.current.selectedForMovement) {
      movementState.current.selectedForMovement.classList.remove('movement-selected');
      movementState.current.selectedForMovement.style.outline = '';
      movementState.current.selectedForMovement.style.cursor = '';
      console.log('🎯 Elemento deseleccionado de movimiento');
    }
    movementState.current.selectedForMovement = null;
    movementState.current.isMovementActive = false;
  }, []);
  
  // Get element depth in DOM tree
  const getElementDepth = useCallback((element: HTMLElement): number => {
    let depth = 0;
    let current = element;
    while (current.parentElement && current !== containerRef.current) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  }, [containerRef]);

  // Enhanced function to get element at specific point with improved precision
  const getElementAtPoint = useCallback((x: number, y: number): HTMLElement | null => {
    if (!containerRef.current) return null;

    // Get all elements at the point
    const elementsAtPoint = document.elementsFromPoint(x, y);
    
    // Filter to only include elements within our container and that are movable
    const validElements = elementsAtPoint.filter(el => {
      const htmlEl = el as HTMLElement;
      return containerRef.current?.contains(htmlEl) && 
             htmlEl !== containerRef.current &&
             !htmlEl.classList.contains('resize-handle') &&
             !htmlEl.classList.contains('prose') &&
             !htmlEl.classList.contains('editor-container');
    }) as HTMLElement[];

    if (validElements.length === 0) return null;

    // Get cached elements for comparison
    const cacheKey = 'movable-elements';
    const now = Date.now();
    let allElements: HTMLElement[] = [];
    
    if (now - cacheInvalidationTime.current < 1000 && elementCache.current.has(cacheKey)) {
      // Usar elementos del cache si es reciente (menos de 1 segundo)
      allElements = elementCache.current.get(cacheKey) || [];
    } else {
      // Regenerar cache de elementos
      const definiteElements = Array.from(containerRef.current.querySelectorAll(
        'img, table, div[data-shape], div[data-resizable], div[data-movable], button, hr, blockquote, ul, ol, li, form, fieldset, iframe, video, audio, canvas, svg, figure, aside, section, article, nav, header, footer, main'
      )) as HTMLElement[];
    
      // Filter out empty or invalid elements with improved logic
      const validDefiniteElements = definiteElements.filter(el => {
        // Always include data-shape elements (geometric shapes)
        if (el.hasAttribute('data-shape')) return true;
        
        // Always include specific element types
        if (['IMG', 'TABLE', 'BUTTON', 'HR', 'BLOCKQUOTE'].includes(el.tagName)) return true;
        
        // For divs, check if they have real content or are resizable
        if (el.tagName === 'DIV') {
          // Skip if it's a container or wrapper element
          if (el.classList.contains('prose') || el.classList.contains('editor-container')) return false;
          
          return el.hasAttribute('data-resizable') || 
                 (el.textContent?.trim().length ?? 0) > 3 ||
                 el.querySelector('img, button, input, select, textarea');
        }
        
        return false;
      });
      
      // Add text elements only if they have substantial content and are not nested
      const textElements = containerRef.current ? Array.from(containerRef.current.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p'
      )) as HTMLElement[] : [];
      
      const validTextElements = textElements.filter(el => {
        const hasAnyContent = (el.textContent?.trim().length || 0) > 0; // Detectar cualquier contenido visible
        const hasSpecialContent = el.querySelector('img, button, input, select, textarea');
        const isNotEmpty = (el.textContent?.trim() || '') !== '' && (el.textContent?.trim() || '') !== '\u00A0';
        const isNotManualEmpty = !el.classList.contains('manual-empty');
        const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0; // Verificar que el elemento sea visible
        
        // Skip if it's inside another detectable element
        const isNested = el.closest('div[data-shape], table, blockquote') !== null;
        
        return (hasAnyContent || hasSpecialContent) && isNotEmpty && isNotManualEmpty && isVisible && !isNested;
      });
      
      allElements = [...validDefiniteElements, ...validTextElements];
      
      // Cache the elements
      elementCache.current.set(cacheKey, allElements);
      cacheInvalidationTime.current = now;
    }

    // Find the best match from valid elements at point
    const candidateElements = validElements
      .filter(el => {
        // Check if element is in our movable elements list
        return allElements.includes(el) || 
               // Or if it's a text element that should be selectable
               (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P'].includes(el.tagName) && 
                (el.textContent?.trim().length || 0) > 0);
      })
      .map(element => {
        const bounds = getElementBounds(element);
        const zIndex = parseInt(window.getComputedStyle(element).zIndex) || 0;
        return { element, bounds, zIndex };
      })
      .sort((a, b) => {
        // First by z-index (higher first)
        if (a.zIndex !== b.zIndex) return b.zIndex - a.zIndex;
        
        // Then by DOM depth (deeper elements first)
        const aDepth = getElementDepth(a.element);
        const bDepth = getElementDepth(b.element);
        return bDepth - aDepth;
      });

    return candidateElements.length > 0 ? candidateElements[0].element : null;
  }, [containerRef, getElementBounds, getElementDepth]);

  // Enhanced element selection with visual feedback and structure preservation
  const selectElement = useCallback((element: HTMLElement | null) => {
    // Clear previous selection
    if (selectedElement.current) {
      selectedElement.current.style.outline = 'none';
      selectedElement.current.classList.remove('hitbox-selected');
      selectedElement.current.style.outlineOffset = '';
    }

    selectedElement.current = element;
    
    if (element) {
      // Preserve element before selection
      preservedElements.current.add(element);
      
      // Apply selection styling with better visual feedback
      element.style.outline = '2px solid #3b82f6';
      element.style.outlineOffset = '2px';
      element.classList.add('hitbox-selected');
      
      // Ensure element maintains its structure and visibility
      const originalDisplay = element.style.display;
      const originalVisibility = element.style.visibility;
      const originalOpacity = element.style.opacity;
      
      // Store original values to prevent loss
      if (!element.dataset.originalDisplay && originalDisplay) {
        element.dataset.originalDisplay = originalDisplay;
      }
      if (!element.dataset.originalVisibility && originalVisibility) {
        element.dataset.originalVisibility = originalVisibility;
      }
      if (!element.dataset.originalOpacity && originalOpacity) {
        element.dataset.originalOpacity = originalOpacity;
      }
      
      // Ensure element remains visible and interactive
      if (element.style.display === 'none') {
        element.style.display = element.dataset.originalDisplay || 'block';
      }
      if (element.style.visibility === 'hidden') {
        element.style.visibility = 'visible';
      }
      if (element.style.opacity === '0') {
        element.style.opacity = element.dataset.originalOpacity || '1';
      }
      
      console.log('🎯 Elemento seleccionado y preservado:', element.tagName, element.className);
    } else {
      console.log('🎯 Selección limpiada');
    }

    onElementSelect?.(element);
  }, [onElementSelect]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    // Store original styles before movement to preserve them
  const preserveElementStyles = (element: HTMLElement) => {
    const computedStyle = window.getComputedStyle(element);
    const stylesToPreserve = {
      background: element.style.background || computedStyle.background,
      backgroundImage: element.style.backgroundImage || computedStyle.backgroundImage,
      backgroundClip: element.style.backgroundClip || computedStyle.backgroundClip,
      webkitBackgroundClip: element.style.webkitBackgroundClip || (computedStyle as any).webkitBackgroundClip,
      webkitTextFillColor: element.style.webkitTextFillColor || (computedStyle as any).webkitTextFillColor,
      color: element.style.color || computedStyle.color,
      fontSize: element.style.fontSize || computedStyle.fontSize,
      fontWeight: element.style.fontWeight || computedStyle.fontWeight,
      textAlign: element.style.textAlign || computedStyle.textAlign,
      lineHeight: element.style.lineHeight || computedStyle.lineHeight,
      letterSpacing: element.style.letterSpacing || computedStyle.letterSpacing,
      textDecoration: element.style.textDecoration || computedStyle.textDecoration,
      textShadow: element.style.textShadow || computedStyle.textShadow,
      borderRadius: element.style.borderRadius || computedStyle.borderRadius,
      border: element.style.border || computedStyle.border,
      boxShadow: element.style.boxShadow || computedStyle.boxShadow,
      padding: element.style.padding || computedStyle.padding,
      margin: element.style.margin || computedStyle.margin
    };
    
    element.setAttribute('data-preserved-styles', JSON.stringify(stylesToPreserve));
  };

  // Restore preserved styles after movement
  const restoreElementStyles = (element: HTMLElement) => {
    const preservedStyles = element.getAttribute('data-preserved-styles');
    if (preservedStyles) {
      try {
        const styles = JSON.parse(preservedStyles);
        Object.entries(styles).forEach(([property, value]) => {
          if (value && value !== 'initial' && value !== 'inherit') {
            (element.style as any)[property] = value;
          }
        });
      } catch (e) {
        console.warn('Error restoring preserved styles:', e);
      }
    }
  };

  // Enhanced function to make elements movable with precise hitboxes
  const makeElementsMovable = () => {
      // Select elements that should definitely be movable - expanded list
      const definiteElements = Array.from(container.querySelectorAll(
        'img, table, div[data-shape], div[data-resizable], div[data-movable], button, hr, blockquote, ul, ol, li, form, fieldset, iframe, video, audio, canvas, svg, figure, aside, section, article, nav, header, footer, main'
      )) as HTMLElement[];
      
      // Filter out empty or invalid elements with improved logic
      const validElements = definiteElements.filter(el => {
        // Always include data-shape elements (geometric shapes)
        if (el.hasAttribute('data-shape') || el.hasAttribute('data-resizable') || el.hasAttribute('data-movable')) return true;
        
        // Always include specific element types
        if (['IMG', 'TABLE', 'BUTTON', 'HR', 'BLOCKQUOTE', 'IFRAME', 'VIDEO', 'AUDIO', 'CANVAS', 'SVG', 'FIGURE'].includes(el.tagName)) return true;
        
        // Include semantic HTML5 elements if they have content
        if (['ASIDE', 'SECTION', 'ARTICLE', 'NAV', 'HEADER', 'FOOTER', 'MAIN'].includes(el.tagName)) {
          return (el.textContent?.trim().length || 0) > 5 || el.querySelector('img, button, input, select, textarea, video, audio');
        }
        
        // Include lists if they have items
        if (['UL', 'OL'].includes(el.tagName)) {
          return el.querySelectorAll('li').length > 0;
        }
        
        // Include list items if they have content
        if (el.tagName === 'LI') {
          return (el.textContent?.trim().length || 0) > 0;
        }
        
        // Include forms and fieldsets
        if (['FORM', 'FIELDSET'].includes(el.tagName)) {
          return el.querySelector('input, select, textarea, button') !== null;
        }
        
        // For divs, check if they have real content or are resizable
        if (el.tagName === 'DIV') {
          // Skip if it's a container or wrapper element
          if (el.classList.contains('prose') || el.classList.contains('editor-container')) return false;
          
          return el.hasAttribute('data-resizable') || 
                 el.hasAttribute('data-shape') ||
                 el.hasAttribute('data-movable') ||
                 ((el.textContent?.trim().length || 0) > 3) ||
                 el.querySelector('img, button, input, select, textarea, video, audio, canvas, svg');
        }
        
        return false;
      });
      
      // Select text elements but filter them strictly and avoid nesting - expanded list
      const textElements = Array.from(container?.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, span, div, pre, code, em, strong, b, i, u, mark, small, del, ins, sub, sup, q, cite, abbr, time, address'
      ) || []) as HTMLElement[];
      
      const validTextElements = textElements.filter(el => {
        const hasAnyContent = (el.textContent?.trim().length || 0) > 0; // Detectar cualquier contenido visible
        const hasSpecialContent = el.querySelector('img, button, input, select, textarea, video, audio, canvas, svg');
        const isNotEmpty = (el.textContent?.trim() || '') !== '' && (el.textContent?.trim() || '') !== '\u00A0';
        const isNotManualEmpty = !el.classList.contains('manual-empty');
        const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0; // Verificar que el elemento sea visible
        
        // Skip if it's inside another detectable element (but allow nested text formatting)
        const isNested = el.closest('div[data-shape], table, blockquote, figure') !== null;
        
        // For heading and paragraph elements, always include if they have content
        if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P'].includes(el.tagName)) {
          return (hasAnyContent || hasSpecialContent) && isNotEmpty && isNotManualEmpty && isVisible && !isNested;
        }
        
        // For other text elements, require more substantial content or special elements
        const hasSubstantialContent = (el.textContent?.trim().length || 0) > 5;
        const isStandaloneElement = !el.closest('h1, h2, h3, h4, h5, h6, p, li') && !isNested;
        
        return (hasSubstantialContent || hasSpecialContent) && isNotEmpty && isNotManualEmpty && isVisible && isStandaloneElement;
      });
      
      const allElements = [...validElements, ...validTextElements];

      allElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        
        // Verificar que el elemento tenga contenido real o sea un elemento específico
        const hasTextContent = htmlElement.textContent?.trim() !== '';
        const isSpecialElement = ['IMG', 'TABLE', 'HR', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(htmlElement.tagName);
        const hasDataAttributes = htmlElement.hasAttribute('data-shape') || htmlElement.hasAttribute('data-resizable') || htmlElement.hasAttribute('data-movable');
        const isVisualElement = htmlElement.offsetWidth > 0 && htmlElement.offsetHeight > 0;
        const hasChildElements = htmlElement.querySelector('img, button, input, select, textarea, svg, canvas') !== null;
        
        const hasRealContent = hasTextContent || isSpecialElement || hasDataAttributes || hasChildElements;
        
        // Agregar hitbox a todos los elementos visibles con contenido o elementos especiales
        if (!hasRealContent || !isVisualElement) {
          return;
        }
        
        // Add movement attributes if not present
        if (!htmlElement.hasAttribute('data-movable')) {
          htmlElement.setAttribute('data-movable', 'true');
        }

        // Preserve original styles before making movable
        preserveElementStyles(htmlElement);

        // Ensure proper positioning for movement
        if (!htmlElement.style.position || htmlElement.style.position === 'static') {
          htmlElement.style.position = 'relative';
        }
        
        // Add hover effects with improved precision
        const handleMouseEnter = () => {
          if (!dragState.current.isDragging && !dragState.current.isResizing && selectedElement.current !== htmlElement) {
            // Check if it's a text element (headings, paragraphs, and other text elements)
            const isTextElement = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'EM', 'STRONG', 'B', 'I', 'U', 'MARK', 'SMALL', 'DEL', 'INS', 'SUB', 'SUP', 'Q', 'CITE', 'ABBR', 'TIME', 'ADDRESS', 'PRE', 'CODE'].includes(htmlElement.tagName);
            
            // Check if it's a structural/semantic element
            const isStructuralElement = ['DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'NAV', 'HEADER', 'FOOTER', 'MAIN', 'FIGURE', 'BLOCKQUOTE'].includes(htmlElement.tagName);
            
            // Check if it's a media/interactive element
            const isMediaElement = ['IMG', 'VIDEO', 'AUDIO', 'CANVAS', 'SVG', 'IFRAME'].includes(htmlElement.tagName);
            
            // Check if it's a form/input element
            const isFormElement = ['FORM', 'FIELDSET', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(htmlElement.tagName);
            
            // Check if it's a list element
            const isListElement = ['UL', 'OL', 'LI'].includes(htmlElement.tagName);
            
            // Set outline color and cursor based on element type
            if (isTextElement && (htmlElement.textContent && htmlElement.textContent.trim().length > 0)) {
              htmlElement.style.outline = '2px dashed #3b82f6';
              htmlElement.style.cursor = 'text';
            } else if (isMediaElement || htmlElement.hasAttribute('data-shape') || htmlElement.hasAttribute('data-resizable')) {
              htmlElement.style.outline = '2px solid #ef4444';
              htmlElement.style.cursor = 'move';
            } else if (isFormElement) {
              htmlElement.style.outline = '2px solid #f59e0b';
              htmlElement.style.cursor = 'move';
            } else if (isListElement) {
              htmlElement.style.outline = '2px solid #8b5cf6';
              htmlElement.style.cursor = 'move';
            } else if (isStructuralElement || htmlElement.hasAttribute('data-movable')) {
              htmlElement.style.outline = '2px solid #10b981';
              htmlElement.style.cursor = 'move';
            } else if (['TABLE', 'HR'].includes(htmlElement.tagName)) {
              htmlElement.style.outline = '2px solid #06b6d4';
              htmlElement.style.cursor = 'move';
            } else {
              htmlElement.style.outline = '1px dashed #3b82f6';
              htmlElement.style.cursor = 'move';
            }
            
            htmlElement.style.outlineOffset = '1px';
          }
        };

        const handleMouseLeave = () => {
          if (!dragState.current.isDragging && !dragState.current.isResizing && selectedElement.current !== htmlElement) {
            htmlElement.style.outline = 'none';
            htmlElement.style.cursor = '';
          }
        };

        // Remove existing listeners to prevent duplicates
        htmlElement.removeEventListener('mouseenter', handleMouseEnter);
        htmlElement.removeEventListener('mouseleave', handleMouseLeave);
        
        // Add new listeners
        htmlElement.addEventListener('mouseenter', handleMouseEnter);
        htmlElement.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    // Function to restore element from preserved state
  const restorePreservedElement = (element: HTMLElement): boolean => {
    if (!element.dataset.preservationId) {
      return false;
    }

    try {
      const preservedStyles = element.dataset.preservedStyles;
      if (preservedStyles) {
        const styles = JSON.parse(preservedStyles);
        
        // Restore critical styles if they've been modified
        const currentStyle = window.getComputedStyle(element);
        const stylesToRestore: string[] = [];
        
        Object.entries(styles).forEach(([property, value]) => {
          const currentValue = currentStyle.getPropertyValue(property);
          if (currentValue !== value && value !== 'initial' && value !== 'auto') {
            stylesToRestore.push(`${property}: ${value}`);
          }
        });
        
        if (stylesToRestore.length > 0) {
          const currentStyleAttr = element.getAttribute('style') || '';
          const newStyle = currentStyleAttr + '; ' + stylesToRestore.join('; ');
          element.setAttribute('style', newStyle);
        }
      }
      
      // Restore original class name if modified
      const originalClassName = element.dataset.originalClassName;
      if (originalClassName && originalClassName !== element.className) {
        element.className = originalClassName;
      }
      
      console.log('✅ HitboxManager: Elemento restaurado exitosamente:', element.tagName);
      return true;
    } catch (error) {
      console.error('❌ HitboxManager: Error restaurando elemento:', error);
      return false;
    }
  };

  // Manejador de clic derecho para selección de movimiento
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Usar detección precisa para encontrar el elemento objetivo
      const targetElement = getElementAtPoint(e.clientX, e.clientY);
      if (!targetElement) {
        // Clic derecho en espacio vacío - deseleccionar elemento actual
        deselectMovementElement();
        return;
      }

      // Preservar elemento inmediatamente
      preservedElements.current.add(targetElement);
      
      // Seleccionar elemento para movimiento
      selectElementForMovement(targetElement);
      
      console.log('🖱️ Clic derecho: Elemento seleccionado para movimiento:', targetElement.tagName);
    };

    // Enhanced mouse down handler with precise hit detection and component preservation
  const handleMouseDown = (e: MouseEvent) => {
      // Skip if clicking on resize handles
      if ((e.target as HTMLElement).classList.contains('resize-handle')) {
        return;
      }

      // Si hay un elemento seleccionado para movimiento, manejar el movimiento
      if (movementState.current.selectedForMovement && e.button === 0) {
        const selectedElement = movementState.current.selectedForMovement;
        
        // Configurar estado de arrastre para el elemento seleccionado
        const rect = selectedElement.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        
        dragState.current = {
          isDragging: false, // Se activará en handleMouseMove
          isResizing: false,
          element: selectedElement,
          startX: e.clientX,
          startY: e.clientY,
          elementStartX: rect.left - (containerRect?.left || 0) + (containerRef.current?.scrollLeft || 0),
          elementStartY: rect.top - (containerRect?.top || 0) + (containerRef.current?.scrollTop || 0),
          resizeDirection: null,
          originalBounds: getElementBounds(selectedElement)
        };
        
        // Preparar elemento para movimiento
        if (selectedElement.style.position !== 'absolute') {
          selectedElement.setAttribute('data-original-position', selectedElement.style.position || 'static');
          selectedElement.setAttribute('data-original-left', selectedElement.style.left || '');
          selectedElement.setAttribute('data-original-top', selectedElement.style.top || '');
        }
        
        document.body.style.cursor = 'grabbing';
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Use precise hit detection to find the target element
      const targetElement = getElementAtPoint(e.clientX, e.clientY);
      if (!targetElement) {
        // Click on empty space - deselect current element and movement
        selectElement(null);
        deselectMovementElement();
        return;
      }

      // CRITICAL: Preserve element immediately upon interaction
      preservedElements.current.add(targetElement);
      
      // Enhanced preservation with CSS state capture
      const preservationId = `preserve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      if (!targetElement.dataset.preservationId) {
        const computedStyle = window.getComputedStyle(targetElement);
        
        // Store comprehensive element state
        targetElement.dataset.preservationId = preservationId;
        targetElement.dataset.originalHtml = targetElement.outerHTML;
        targetElement.dataset.originalTextContent = targetElement.textContent || '';
        targetElement.dataset.originalClassName = targetElement.className;
        targetElement.dataset.originalStyle = targetElement.getAttribute('style') || '';
        
        // Store critical computed styles
        const criticalStyles = {
          color: computedStyle.color,
          backgroundColor: computedStyle.backgroundColor,
          fontSize: computedStyle.fontSize,
          fontFamily: computedStyle.fontFamily,
          fontWeight: computedStyle.fontWeight,
          textAlign: computedStyle.textAlign,
          lineHeight: computedStyle.lineHeight,
          padding: computedStyle.padding,
          margin: computedStyle.margin,
          border: computedStyle.border,
          borderRadius: computedStyle.borderRadius,
          display: computedStyle.display,
          position: computedStyle.position
        };
        
        targetElement.dataset.preservedStyles = JSON.stringify(criticalStyles);
        
        if (targetElement.parentElement) {
          targetElement.dataset.originalParentTag = targetElement.parentElement.tagName;
        }
        
        console.log('🛡️ HitboxManager: Elemento preservado con estilos completos:', targetElement.tagName, preservationId);
      }

      // Check if it's a text element that should be handled by TextEditingEvents
      const isTextElement = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'BLOCKQUOTE', 'SPAN', 'A', 'BUTTON'].includes(targetElement.tagName);
      const isEditableDiv = targetElement.tagName === 'DIV' && 
        (targetElement.textContent?.trim().length || 0) > 0 &&
        !targetElement.hasAttribute('data-shape') &&
        !targetElement.hasAttribute('data-resizable');

      // For text elements, let TextEditingEvents handle the click for direct editing
      if (isTextElement || isEditableDiv) {
        // Don't prevent default for text elements - let TextEditingEvents handle it
        selectElement(targetElement);
        console.log('🎯 HitboxManager: Elemento de texto preservado y seleccionado:', targetElement.tagName, targetElement.className);
        return;
      }

      // For non-text elements, proceed with normal hitbox behavior
      console.log('🎯 HitboxManager: Elemento no-texto preservado:', targetElement.tagName, targetElement.className);
      e.preventDefault();
      e.stopPropagation();

      // Select the element
      selectElement(targetElement);

      // Get precise element bounds using getBoundingClientRect for accuracy
      const rect = targetElement.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      // Store original position properties for potential drag operation
      const originalPosition = targetElement.style.position;
      const originalLeft = targetElement.style.left;
      const originalTop = targetElement.style.top;
      
      const bounds = getElementBounds(targetElement);
      
      // Configure drag state but don't change positioning yet - wait for actual drag
      dragState.current = {
        isDragging: false, // Start as false, will be true when drag actually starts
        isResizing: false,
        element: targetElement,
        startX: e.clientX,
        startY: e.clientY,
        elementStartX: rect.left - (containerRect?.left || 0) + (containerRef.current?.scrollLeft || 0),
        elementStartY: rect.top - (containerRect?.top || 0) + (containerRef.current?.scrollTop || 0),
        resizeDirection: null,
        originalBounds: bounds
      };

      // Store original styles for potential restoration
      targetElement.setAttribute('data-original-position', originalPosition || 'relative');
      targetElement.setAttribute('data-original-left', originalLeft || '');
      targetElement.setAttribute('data-original-top', originalTop || '');

      // Don't add drag styles immediately - only on actual drag start
      
      // Change document cursor
      document.body.style.cursor = 'grabbing';
    };

    // Enhanced double click handler with multiple editor integration
    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      if (!target || !containerRef.current?.contains(target)) return;
      
      // Si hay un elemento seleccionado para movimiento y el doble clic es fuera de él, deseleccionar
      if (movementState.current.selectedForMovement) {
        const targetElement = getElementAtPoint(e.clientX, e.clientY);
        if (!targetElement || targetElement !== movementState.current.selectedForMovement) {
          deselectMovementElement();
          console.log('🖱️ Doble clic fuera: Elemento deseleccionado de movimiento');
          return;
        }
      }
      
      // Preservar el elemento antes de cualquier edición
      preservedElements.current.add(target);
      
      // Check if element has gradient editing capability
      if (target.hasAttribute('data-gradient-editable') || target.closest('[data-gradient-editable]')) {
        const editableElement = target.hasAttribute('data-gradient-editable') 
          ? target 
          : target.closest('[data-gradient-editable]') as HTMLElement;
        
        if (editableElement) {
          preservedElements.current.add(editableElement);
          setGradientEditorPosition({ x: e.clientX + 10, y: e.clientY + 10 });
          selectElement(editableElement);
          setShowGradientEditor(true);
          return;
        }
      }
      
      // Editor universal de texto para elementos de texto
      const textTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV'];
      if (textTags.includes(target.tagName) && target.textContent?.trim()) {
        preservedElements.current.add(target);
        setUniversalTextEditorPosition({ x: e.clientX + 10, y: e.clientY + 10 });
        selectElement(target);
        setShowUniversalTextEditor(true);
        return;
      }
      
      // Editor de tablas
      if (target.tagName === 'TABLE' || target.closest('table')) {
        const table = target.tagName === 'TABLE' ? target : target.closest('table') as HTMLElement;
        if (table) {
          preservedElements.current.add(table);
          setTableEditorPosition({ x: e.clientX + 10, y: e.clientY + 10 });
          selectElement(table);
          setShowTableEditor(true);
          return;
        }
      }
      
      // Editor de botones
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button') as HTMLElement;
        if (button) {
          preservedElements.current.add(button);
          setButtonEditorPosition({ x: e.clientX + 10, y: e.clientY + 10 });
          selectElement(button);
          setShowButtonEditor(true);
          return;
        }
      }
      
      // Editor de medios
      const mediaTags = ['IMG', 'VIDEO', 'AUDIO', 'IFRAME'];
      if (mediaTags.includes(target.tagName)) {
        preservedElements.current.add(target);
        setMediaEditorPosition({ x: e.clientX + 10, y: e.clientY + 10 });
        selectElement(target);
        setShowMediaEditor(true);
        return;
      }
      
      // Editor de layout para contenedores
      if (target.hasAttribute('data-layout-container') || 
          (target.style.display && ['grid', 'flex'].includes(target.style.display))) {
        preservedElements.current.add(target);
        setLayoutEditorPosition({ x: e.clientX + 10, y: e.clientY + 10 });
        selectElement(target);
        setShowLayoutEditor(true);
        return;
      }
      
      // Original double click logic for other elements
      // Skip if clicking on resize handles
      if ((e.target as HTMLElement).classList.contains('resize-handle')) {
        return;
      }

      // Use precise hit detection to find the target element
      const targetElement = getElementAtPoint(e.clientX, e.clientY);
      if (!targetElement) {
        return;
      }

      // Preservar el elemento encontrado
      preservedElements.current.add(targetElement);

      // Check if it's a text element that should be handled by TextEditingEvents
      const isTextElement = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'BLOCKQUOTE', 'SPAN', 'A', 'BUTTON'].includes(targetElement.tagName);
      const isEditableDiv = targetElement.tagName === 'DIV' && 
        (targetElement.textContent?.trim().length || 0) > 0 &&
        !targetElement.hasAttribute('data-shape') &&
        !targetElement.hasAttribute('data-resizable');

      // For text elements, just select them - TextEditingEvents will handle editing
      if (isTextElement || isEditableDiv) {
        selectElement(targetElement);
        console.log('🎯 HitboxManager: Seleccionando elemento de texto para edición:', targetElement.tagName);
        return;
      }

      // For non-text elements (shapes, images, etc.), proceed with normal selection
      selectElement(targetElement);
      console.log('🎯 HitboxManager: Seleccionando elemento no-texto:', targetElement.tagName);
    };

    // Enhanced mouse move handler with boundary checking
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current.element || !containerRef.current) return;

      // Check if we should start dragging (threshold detection)
      if (!dragState.current.isDragging && !dragState.current.isResizing) {
        const deltaX = e.clientX - dragState.current.startX;
        const deltaY = e.clientY - dragState.current.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Only start dragging if mouse moved more than 5 pixels
        if (distance > 5) {
          // Now actually start the drag - apply positioning changes
          const targetElement = dragState.current.element;
          
          // Only change to absolute positioning if not already absolute
          if (targetElement.style.position !== 'absolute') {
            const rect = targetElement.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            
            // Preserve styles before changing position
            preserveElementStyles(targetElement);
            
            // Store original positioning info before changing to absolute
            targetElement.setAttribute('data-original-position', targetElement.style.position || 'static');
            targetElement.setAttribute('data-original-left', targetElement.style.left || '');
            targetElement.setAttribute('data-original-top', targetElement.style.top || '');
            
            // Change to absolute positioning to remove from document flow
            targetElement.style.position = 'absolute';
            const leftPos = rect.left - containerRect.left + (containerRef.current?.scrollLeft || 0);
            const topPos = rect.top - containerRect.top + (containerRef.current?.scrollTop || 0);
            targetElement.style.left = `${leftPos}px`;
            targetElement.style.top = `${topPos}px`;
            
            // Update elementStart positions to current absolute positions
            dragState.current.elementStartX = leftPos;
            dragState.current.elementStartY = topPos;
          }
          
          // Add drag styles with better visual feedback - maintain full visibility
          targetElement.style.zIndex = '1000';
          targetElement.style.outline = '3px solid #3b82f6';
          targetElement.style.opacity = '1'; // Keep full opacity for visibility
          targetElement.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
          targetElement.style.transition = 'none'; // Disable transitions during drag
          
          // Mark as actually dragging
          dragState.current.isDragging = true;
        } else {
          return; // Don't process movement until threshold is met
        }
      }

      e.preventDefault();

      if (dragState.current.isDragging) {
         const deltaX = e.clientX - dragState.current.startX;
         const deltaY = e.clientY - dragState.current.startY;
         
         // Calculate new position based on initial element position plus delta
         let newX = dragState.current.elementStartX + deltaX;
         let newY = dragState.current.elementStartY + deltaY;
 
         // Enhanced boundary checking to keep element within container with scroll support
         if (containerRef.current && dragState.current.originalBounds) {
           const containerRect = containerRef.current.getBoundingClientRect();
           const elementWidth = dragState.current.originalBounds.width;
           const elementHeight = dragState.current.originalBounds.height;

           // Get container's content area (excluding padding/border)
           const containerStyle = window.getComputedStyle(containerRef.current);
           const containerPaddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
           const containerPaddingTop = parseFloat(containerStyle.paddingTop) || 0;
           const containerPaddingRight = parseFloat(containerStyle.paddingRight) || 0;
           const containerPaddingBottom = parseFloat(containerStyle.paddingBottom) || 0;
           
           // Get scroll dimensions for proper boundary calculation
           const scrollWidth = containerRef.current.scrollWidth;
           const scrollHeight = containerRef.current.scrollHeight;
           
           // Calculate available space considering scroll area
           const availableWidth = Math.max(containerRect.width, scrollWidth) - containerPaddingLeft - containerPaddingRight;
           const availableHeight = Math.max(containerRect.height, scrollHeight) - containerPaddingTop - containerPaddingBottom;
           
           // Define safe boundaries with minimum margins
           const minMargin = 10;
           const minX = containerPaddingLeft + minMargin;
           const minY = containerPaddingTop + minMargin;
           const maxX = availableWidth - elementWidth - minMargin + containerPaddingLeft;
           const maxY = availableHeight - elementHeight - minMargin + containerPaddingTop;
           
           // Constrain to container bounds with enhanced safety checks
           newX = Math.max(minX, Math.min(newX, Math.max(minX, maxX)));
           newY = Math.max(minY, Math.min(newY, Math.max(minY, maxY)));
           
           // Final validation - ensure element stays completely within bounds
           if (newX < containerPaddingLeft || newY < containerPaddingTop || 
               newX + elementWidth > availableWidth + containerPaddingLeft ||
               newY + elementHeight > availableHeight + containerPaddingTop) {
             // Reset to safe position if validation fails
             newX = Math.max(minX, containerPaddingLeft + 20);
             newY = Math.max(minY, containerPaddingTop + 20);
             console.warn('Element position corrected to prevent overflow');
           }
         }

         // Apply smooth positioning with precise coordinates
         dragState.current.element.style.left = `${newX}px`;
         dragState.current.element.style.top = `${newY}px`;
         dragState.current.element.style.transform = 'none'; // Reset any existing transforms
       } else if (dragState.current.isResizing && dragState.current.originalBounds) {
         // Handle resizing with precise calculations
         const deltaX = e.clientX - dragState.current.startX;
         const deltaY = e.clientY - dragState.current.startY;
         const direction = dragState.current.resizeDirection;
         const bounds = dragState.current.originalBounds;
         
         let newWidth = bounds.width;
         let newHeight = bounds.height;
         let newLeft = dragState.current.elementStartX;
         let newTop = dragState.current.elementStartY;
         
         // Calculate new dimensions based on resize direction
         switch (direction) {
           case 'se': // Southeast
             newWidth = bounds.width + deltaX;
             newHeight = bounds.height + deltaY;
             break;
           case 'sw': // Southwest
             newWidth = bounds.width - deltaX;
             newHeight = bounds.height + deltaY;
             newLeft = dragState.current.elementStartX + deltaX;
             break;
           case 'ne': // Northeast
             newWidth = bounds.width + deltaX;
             newHeight = bounds.height - deltaY;
             newTop = dragState.current.elementStartY + deltaY;
             break;
           case 'nw': // Northwest
             newWidth = bounds.width - deltaX;
             newHeight = bounds.height - deltaY;
             newLeft = dragState.current.elementStartX + deltaX;
             newTop = dragState.current.elementStartY + deltaY;
             break;
           case 'n': // North
             newHeight = bounds.height - deltaY;
             newTop = dragState.current.elementStartY + deltaY;
             break;
           case 's': // South
             newHeight = bounds.height + deltaY;
             break;
           case 'e': // East
             newWidth = bounds.width + deltaX;
             break;
           case 'w': // West
             newWidth = bounds.width - deltaX;
             newLeft = dragState.current.elementStartX + deltaX;
             break;
         }
         
         // Apply minimum size constraints
         const minWidth = 30;
         const minHeight = 20;
         
         if (newWidth < minWidth) {
           if (direction?.includes('w')) {
             newLeft = dragState.current.elementStartX + (bounds.width - minWidth);
           }
           newWidth = minWidth;
         }
         
         if (newHeight < minHeight) {
           if (direction?.includes('n')) {
             newTop = dragState.current.elementStartY + (bounds.height - minHeight);
           }
           newHeight = minHeight;
         }
         
         // Apply the new dimensions and position
         dragState.current.element.style.width = `${newWidth}px`;
         dragState.current.element.style.height = `${newHeight}px`;
         dragState.current.element.style.left = `${newLeft}px`;
         dragState.current.element.style.top = `${newTop}px`;
       }
    };

    // Enhanced mouse up handler with proper cleanup
    const handleMouseUp = () => {
      if (!dragState.current.element) return;

      const element = dragState.current.element;
      const wasDragging = dragState.current.isDragging;
      const wasResizing = dragState.current.isResizing;

      // If we were actually dragging or resizing, clean up drag styles
      if (wasDragging || wasResizing) {
        // Validate element is still in DOM and within container bounds
        if (!containerRef.current?.contains(element)) {
          console.warn('Element moved outside container, attempting to restore');
          // Try to restore element to a safe position
          if (containerRef.current) {
            containerRef.current.appendChild(element);
            element.style.left = '20px';
            element.style.top = '20px';
          }
        }

        // Restore original positioning if it was changed
        const originalPosition = element.getAttribute('data-original-position');
        const originalLeft = element.getAttribute('data-original-left');
        const originalTop = element.getAttribute('data-original-top');
        
        if (originalPosition && originalPosition !== 'absolute') {
          element.style.position = originalPosition === 'static' ? '' : originalPosition;
          element.style.left = originalLeft || '';
          element.style.top = originalTop || '';
        }

        // Restore preserved styles after movement
        restoreElementStyles(element);

        // Clean up stored original positioning attributes
        element.removeAttribute('data-original-position');
        element.removeAttribute('data-original-left');
        element.removeAttribute('data-original-top');

        // Restore styles with smooth transition
        element.style.zIndex = '';
        element.style.opacity = '';
        element.style.boxShadow = '';
        element.style.transition = 'all 0.2s ease';
        
        // Reset transition after animation
        setTimeout(() => {
          if (element.style.transition) {
            element.style.transition = '';
          }
        }, 200);
      } else {
        // Just a click, clean up stored attributes without changing styles
        element.removeAttribute('data-original-position');
        element.removeAttribute('data-original-left');
        element.removeAttribute('data-original-top');
      }
      
      // Keep selection outline
      if (selectedElement.current === element) {
        element.style.outline = '2px solid #3b82f6';
        element.style.outlineOffset = '2px';
      } else {
        element.style.outline = 'none';
      }
      
      // Restore cursor
      document.body.style.cursor = '';

      // Reset drag state
      dragState.current = {
        isDragging: false,
        isResizing: false,
        element: null,
        startX: 0,
        startY: 0,
        elementStartX: 0,
        elementStartY: 0,
        resizeDirection: null,
        originalBounds: null
      };
    };

    // Enhanced resize functionality with multiple handles
    const makeElementsResizable = () => {
      const resizableElements = container.querySelectorAll('[data-resizable="true"], img, table, div[data-shape]');
      
      resizableElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        
        // Remove existing resize handles to prevent duplicates
        const existingHandles = htmlElement.querySelectorAll('.resize-handle');
        existingHandles.forEach(handle => handle.remove());
        
        // Ensure proper positioning
        if (!htmlElement.style.position || htmlElement.style.position === 'static') {
          htmlElement.style.position = 'relative';
        }
        
        // Create resize handles for different directions
        const handles = [
          { class: 'resize-handle-se', cursor: 'se-resize', position: 'bottom: -5px; right: -5px;', direction: 'se' },
          { class: 'resize-handle-sw', cursor: 'sw-resize', position: 'bottom: -5px; left: -5px;', direction: 'sw' },
          { class: 'resize-handle-ne', cursor: 'ne-resize', position: 'top: -5px; right: -5px;', direction: 'ne' },
          { class: 'resize-handle-nw', cursor: 'nw-resize', position: 'top: -5px; left: -5px;', direction: 'nw' },
          { class: 'resize-handle-n', cursor: 'n-resize', position: 'top: -5px; left: 50%; transform: translateX(-50%);', direction: 'n' },
          { class: 'resize-handle-s', cursor: 's-resize', position: 'bottom: -5px; left: 50%; transform: translateX(-50%);', direction: 's' },
          { class: 'resize-handle-e', cursor: 'e-resize', position: 'top: 50%; right: -5px; transform: translateY(-50%);', direction: 'e' },
          { class: 'resize-handle-w', cursor: 'w-resize', position: 'top: 50%; left: -5px; transform: translateY(-50%);', direction: 'w' }
        ];
        
        handles.forEach(({ class: className, cursor, position, direction }) => {
          const resizeHandle = document.createElement('div');
          resizeHandle.className = `resize-handle ${className}`;
          resizeHandle.style.cssText = `
            position: absolute;
            ${position}
            width: 10px;
            height: 10px;
            background: #3b82f6;
            border: 2px solid white;
            border-radius: 50%;
            cursor: ${cursor};
            opacity: 0;
            transition: opacity 0.2s, transform 0.2s;
            z-index: 1001;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          `;
          
          htmlElement.appendChild(resizeHandle);
          
          // Handle resize start
          resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const bounds = getElementBounds(htmlElement);
            
            dragState.current = {
              isDragging: false,
              isResizing: true,
              element: htmlElement,
              startX: e.clientX,
              startY: e.clientY,
              elementStartX: bounds.left,
              elementStartY: bounds.top,
              resizeDirection: direction,
              originalBounds: bounds
            };
            
            document.body.style.cursor = cursor;
            htmlElement.style.outline = '2px solid #3b82f6';
          });
        });
        
        // Show/hide handles on hover
        const showHandles = () => {
          if (!dragState.current.isDragging && !dragState.current.isResizing) {
            const handles = htmlElement.querySelectorAll('.resize-handle');
            handles.forEach(handle => {
              (handle as HTMLElement).style.opacity = '1';
              (handle as HTMLElement).style.transform += ' scale(1.1)';
            });
          }
        };
        
        const hideHandles = () => {
          if (!dragState.current.isDragging && !dragState.current.isResizing) {
            const handles = htmlElement.querySelectorAll('.resize-handle');
            handles.forEach(handle => {
              (handle as HTMLElement).style.opacity = '0';
              (handle as HTMLElement).style.transform = (handle as HTMLElement).style.transform.replace(' scale(1.1)', '');
            });
          }
        };
        
        htmlElement.addEventListener('mouseenter', showHandles);
        htmlElement.addEventListener('mouseleave', hideHandles);
      });
    };

    // Inicializar el sistema
    makeElementsMovable();
    makeElementsResizable();

    // Agregar event listeners
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('dblclick', handleDoubleClick);
    container.addEventListener('contextmenu', handleRightClick);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Observer para elementos dinámicos con invalidación de cache
    const observer = new MutationObserver(() => {
      // Invalidar cache cuando hay cambios en el DOM
      elementCache.current.clear();
      cacheInvalidationTime.current = 0;
      
      // Limpiar hitboxes fantasma
      cleanupPhantomHitboxes();
      
      makeElementsMovable();
      makeElementsResizable();
    });

    observer.observe(container, {
      childList: true,
      subtree: true
    });

    // Listen for custom element added events
    const handleElementAdded = () => {
      console.log('🎯 Elemento añadido detectado, regenerando hitboxes');
      // Invalidar cache
      elementCache.current.clear();
      cacheInvalidationTime.current = 0;
      
      // Regenerar hitboxes
      setTimeout(() => {
        makeElementsMovable();
        makeElementsResizable();
      }, 50);
    };

    container.addEventListener('elementAdded', handleElementAdded as EventListener);

    // Cleanup
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('dblclick', handleDoubleClick);
      container.removeEventListener('contextmenu', handleRightClick);
      container.removeEventListener('elementAdded', handleElementAdded as EventListener);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      observer.disconnect();
      
      // Clear selection and styles
      selectElement(null);
      deselectMovementElement();
      document.body.style.cursor = '';
      
      // Reset drag state
      dragState.current = {
        isDragging: false,
        isResizing: false,
        element: null,
        startX: 0,
        startY: 0,
        elementStartX: 0,
        elementStartY: 0,
        resizeDirection: null,
        originalBounds: null
      };
      
      // Reset movement state
      movementState.current = {
        selectedForMovement: null,
        isMovementActive: false
      };
    };
  }, [enabled, containerRef, selectElement, getElementAtPoint, getElementBounds]);

  // Add CSS styles for better visual feedback
  React.useEffect(() => {
    const styleId = 'hitbox-manager-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      .hitbox-selected {
        position: relative !important;
      }
      
      .movement-selected {
        outline: 2px solid #ff6b35 !important;
        outline-offset: 2px;
        cursor: move !important;
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3) !important;
        transition: all 0.2s ease;
      }
      
      .movement-selected:hover {
        box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4) !important;
        transform: translateY(-1px);
      }
      
      .resize-handle {
        user-select: none;
        pointer-events: auto;
      }
      
      .resize-handle:hover {
        background: #2563eb !important;
        transform: scale(1.2) !important;
      }
      
      [data-movable="true"]:hover {
        transition: outline 0.2s ease;
      }
      
      .hitbox-selected .resize-handle {
        opacity: 1 !important;
      }
    `;
    
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  return (
    <>
      {showGradientEditor && selectedElement.current && (
        <GradientTextEditor
          element={selectedElement.current}
          position={gradientEditorPosition}
          onClose={() => setShowGradientEditor(false)}
        />
      )}
      
      {showUniversalTextEditor && selectedElement.current && (
        <UniversalTextEditor
          element={selectedElement.current}
          position={universalTextEditorPosition}
          onClose={() => setShowUniversalTextEditor(false)}
        />
      )}
      
      {showEmojiPicker && (
         <EmojiPicker
           position={emojiPickerPosition}
           onEmojiSelect={(emoji) => {
             if (selectedElement.current) {
               selectedElement.current.textContent += emoji;
             }
             setShowEmojiPicker(false);
           }}
           onClose={() => setShowEmojiPicker(false)}
         />
       )}
      
      {showTableEditor && (
        <TableEditor
          position={tableEditorPosition}
          onTableCreate={(tableHTML) => {
            if (selectedElement.current && containerRef.current) {
              selectedElement.current.outerHTML = tableHTML;
            }
          }}
          onClose={() => setShowTableEditor(false)}
          existingTable={selectedElement.current as HTMLTableElement}
        />
      )}
      
      {showButtonEditor && (
        <ButtonEditor
          position={buttonEditorPosition}
          onButtonCreate={(buttonHTML) => {
            if (selectedElement.current && containerRef.current) {
              selectedElement.current.outerHTML = buttonHTML;
            }
          }}
          onClose={() => setShowButtonEditor(false)}
          existingButton={selectedElement.current as HTMLButtonElement}
        />
      )}
      
      {showMediaEditor && selectedElement.current && (
        <MediaEditor
          element={selectedElement.current}
          position={mediaEditorPosition}
          onClose={() => setShowMediaEditor(false)}
        />
      )}
      
      {showLayoutEditor && (
        <LayoutEditor
          position={layoutEditorPosition}
          onLayoutCreate={(layoutHTML) => {
            if (selectedElement.current && containerRef.current) {
              selectedElement.current.outerHTML = layoutHTML;
            }
          }}
          onClose={() => setShowLayoutEditor(false)}
          existingLayout={selectedElement.current || null}
        />
      )}
      
      {/* Renderizador de fondo real de la página */}
      <BackgroundRenderer containerRef={containerRef} />
      
      {/* Sistema de preservación de componentes */}
      <ComponentPreserver 
        preservedElements={preservedElements.current}
        containerRef={containerRef}
      />
    </>
  );
};

export default HitboxManager;