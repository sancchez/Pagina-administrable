import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Scissors, Clipboard, Trash2, MoveUp, MoveDown, CopyPlus, Edit3 } from 'lucide-react';

interface ContextMenuProps {
  containerRef: React.RefObject<HTMLElement>;
  enabled: boolean;
  onAction?: (action: string, element: HTMLElement | null) => void;
  style?: React.CSSProperties;
}

interface MenuPosition {
  x: number;
  y: number;
}

interface ClipboardData {
  html: string;
  element: HTMLElement;
  timestamp: number;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ containerRef, enabled, onAction, style }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const clipboardRef = useRef<ClipboardData | null>(null);

  // Initialize clipboard from localStorage if available
  useEffect(() => {
    const existingClipboard = localStorage.getItem('editor-clipboard');
    if (existingClipboard && !clipboardRef.current) {
      try {
        const data = JSON.parse(existingClipboard);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.html;
        const element = tempDiv.firstElementChild as HTMLElement;
        
        if (element) {
          clipboardRef.current = {
            html: data.html,
            element: element,
            timestamp: data.timestamp || Date.now()
          };
        }
      } catch (error) {
        console.error('Error loading clipboard from localStorage:', error);
      }
    }
  }, []);

  // Get element layer index (z-index)
  const getElementLayer = useCallback((element: HTMLElement): number => {
    const zIndex = window.getComputedStyle(element).zIndex;
    return zIndex === 'auto' ? 0 : parseInt(zIndex, 10) || 0;
  }, []);

  // Set element layer
  const setElementLayer = useCallback((element: HTMLElement, layer: number) => {
    element.style.zIndex = layer.toString();
  }, []);

  // Get all movable elements
  const getMovableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    
    const elements = containerRef.current.querySelectorAll(
      'img, table, div[data-movable], div[data-shape], div[data-resizable], button, hr, blockquote, h1, h2, h3, h4, h5, h6, p'
    );
    
    return Array.from(elements) as HTMLElement[];
  }, [containerRef]);

  // Copy element to clipboard
  const copyElement = useCallback((element: HTMLElement) => {
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Clean up any editor-specific attributes
    clonedElement.removeAttribute('data-movable');
    clonedElement.removeAttribute('data-resizable');
    clonedElement.classList.remove('group-selected', 'hitbox-selected', 'selected');
    clonedElement.style.outline = '';
    clonedElement.style.outlineOffset = '';
    
    const clipboardData = {
      html: clonedElement.outerHTML,
      element: clonedElement,
      timestamp: Date.now()
    };
    
    clipboardRef.current = clipboardData;
    
    // Also save to localStorage for backward compatibility
    localStorage.setItem('editor-clipboard', JSON.stringify({
      html: clipboardData.html,
      timestamp: clipboardData.timestamp
    }));
    
    console.log('📋 Elemento copiado al portapapeles');
    onAction?.('copy', element);
  }, [onAction]);

  // Cut element (copy and remove)
  const cutElement = useCallback((element: HTMLElement) => {
    copyElement(element);
    element.remove();
    console.log('✂️ Elemento cortado');
    onAction?.('cut', element);
  }, [copyElement, onAction]);

  // Paste element from clipboard
  const pasteElement = useCallback((x?: number, y?: number) => {
    if (!clipboardRef.current || !containerRef.current) {
      console.log('📋 No hay elementos en el portapapeles');
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = clipboardRef.current.html;
    const elementToPaste = tempDiv.firstElementChild as HTMLElement;
    
    if (!elementToPaste) return;

    // Set position if provided, otherwise use absolute positioning at click location
    if (x !== undefined && y !== undefined) {
      elementToPaste.style.position = 'absolute';
      // Convert screen coordinates to container-relative coordinates
      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeX = x - containerRect.left;
      const relativeY = y - containerRect.top;
      elementToPaste.style.left = `${Math.max(0, relativeX)}px`;
      elementToPaste.style.top = `${Math.max(0, relativeY)}px`;
    } else {
      // Default positioning for keyboard paste
      elementToPaste.style.position = 'relative';
    }

    // Make element movable
    elementToPaste.setAttribute('data-movable', 'true');
    
    // Insert at the beginning or at cursor position instead of at the end
    if (targetElement && targetElement.parentNode === containerRef.current) {
      // Insert after the target element
      targetElement.insertAdjacentElement('afterend', elementToPaste);
    } else {
      // Insert at the beginning of the container
      containerRef.current.insertBefore(elementToPaste, containerRef.current.firstChild);
    }
    
    console.log('📌 Elemento pegado');
    onAction?.('paste', elementToPaste);
  }, [containerRef, onAction, targetElement]);

  // Generate unique ID for duplicated elements
  const generateUniqueId = useCallback(() => {
    return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Duplicate element
  const duplicateElement = useCallback((element: HTMLElement) => {
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Generate unique ID for the cloned element
    const uniqueId = generateUniqueId();
    clonedElement.setAttribute('data-element-id', uniqueId);
    
    // Remove any existing IDs that might conflict
    if (clonedElement.id) {
      clonedElement.id = `${clonedElement.id}-${uniqueId}`;
    }
    
    // Update IDs in child elements to avoid conflicts
    const childrenWithIds = clonedElement.querySelectorAll('[id]');
    childrenWithIds.forEach((child) => {
      const htmlChild = child as HTMLElement;
      if (htmlChild.id) {
        htmlChild.id = `${htmlChild.id}-${uniqueId}`;
      }
    });
    
    // Offset the duplicate slightly with bounds checking
    const currentLeft = parseInt(element.style.left || '0', 10);
    const currentTop = parseInt(element.style.top || '0', 10);
    
    // Get container bounds to ensure duplicate stays within bounds
    const containerRect = containerRef.current?.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    let newLeft = currentLeft + 20;
    let newTop = currentTop + 20;
    
    // Ensure the duplicate doesn't go outside container bounds
    if (containerRect && elementRect) {
      const maxLeft = containerRect.width - elementRect.width - 20;
      const maxTop = containerRect.height - elementRect.height - 20;
      
      if (newLeft > maxLeft) {
        newLeft = Math.max(0, currentLeft - 20);
      }
      if (newTop > maxTop) {
        newTop = Math.max(0, currentTop - 20);
      }
    }
    
    clonedElement.style.left = `${newLeft}px`;
    clonedElement.style.top = `${newTop}px`;
    clonedElement.style.position = 'absolute';
    clonedElement.setAttribute('data-movable', 'true');
    
    // Clean up selection classes
    clonedElement.classList.remove('group-selected', 'hitbox-selected');
    clonedElement.style.outline = '';
    clonedElement.style.outlineOffset = '';
    
    if (containerRef.current) {
      containerRef.current.appendChild(clonedElement);
      
      // Trigger a small delay to ensure the element is properly added to DOM
      setTimeout(() => {
        // Force re-detection of movable elements
        const event = new CustomEvent('elementAdded', { detail: { element: clonedElement } });
        containerRef.current?.dispatchEvent(event);
      }, 10);
    }
    
    console.log('🔄 Elemento duplicado con ID único:', uniqueId);
    onAction?.('duplicate', clonedElement);
  }, [containerRef, onAction, generateUniqueId]);

  // Move element to front
  const moveToFront = useCallback((element: HTMLElement) => {
    const allElements = getMovableElements();
    const maxLayer = Math.max(...allElements.map(getElementLayer));
    setElementLayer(element, maxLayer + 1);
    console.log('⬆️ Elemento movido al frente');
    onAction?.('move-front', element);
  }, [getMovableElements, getElementLayer, setElementLayer, onAction]);

  // Move element to back
  const moveToBack = useCallback((element: HTMLElement) => {
    const allElements = getMovableElements();
    const minLayer = Math.min(...allElements.map(getElementLayer));
    setElementLayer(element, minLayer - 1);
    console.log('⬇️ Elemento movido atrás');
    onAction?.('move-back', element);
  }, [getMovableElements, getElementLayer, setElementLayer, onAction]);

  // Delete element
  const deleteElement = useCallback((element: HTMLElement) => {
    element.remove();
    console.log('🗑️ Elemento eliminado');
    onAction?.('delete', element);
  }, [onAction]);

  // Enable text editing
  const enableTextEditing = useCallback((element: HTMLElement) => {
    // Clear any existing selection
    const previousSelected = containerRef.current?.querySelector('[data-selected="true"]');
    if (previousSelected) {
      previousSelected.removeAttribute('data-selected');
      previousSelected.removeAttribute('style');
    }

    // Set the element as selected and editable
    element.setAttribute('data-selected', 'true');
    element.style.outline = '2px solid #3b82f6';
    element.style.outlineOffset = '2px';
    element.contentEditable = 'true';
    element.focus();
    
    // Select all text content
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    console.log('✏️ Modo de edición de texto activado');
    onAction?.('edit-text', element);
  }, [containerRef, onAction]);

  // Hide menu
  const hideMenu = useCallback(() => {
    setIsVisible(false);
    setTargetElement(null);
    // Clear any pending timeouts or animations
    if (menuRef.current) {
      menuRef.current.style.pointerEvents = 'none';
      setTimeout(() => {
        if (menuRef.current) {
          menuRef.current.style.pointerEvents = 'auto';
        }
      }, 100);
    }
  }, []);

  // Force hide menu (for emergency cleanup)
  const forceHideMenu = useCallback(() => {
    setIsVisible(false);
    setTargetElement(null);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Handle menu item click
  const handleMenuAction = useCallback((action: string) => {
    // Store current target element before any action that might modify it
    const currentTarget = targetElement;
    
    try {
      switch (action) {
        case 'copy':
          if (currentTarget) copyElement(currentTarget);
          break;
        case 'cut':
          if (currentTarget) {
            cutElement(currentTarget);
            // Clear target element immediately after cut since element is removed
            setTargetElement(null);
          }
          break;
        case 'paste':
          // Pass the menu position for paste to position element at click location
          pasteElement(position.x, position.y);
          break;
        case 'duplicate':
          if (currentTarget) duplicateElement(currentTarget);
          break;
        case 'move-front':
          if (currentTarget) moveToFront(currentTarget);
          break;
        case 'move-back':
          if (currentTarget) moveToBack(currentTarget);
          break;
        case 'delete':
          if (currentTarget) {
            deleteElement(currentTarget);
            // Clear target element immediately after delete since element is removed
            setTargetElement(null);
          }
          break;
        case 'edit-text':
          if (currentTarget) enableTextEditing(currentTarget);
          break;
      }
    } catch (error) {
      console.error('Error executing context menu action:', error);
    } finally {
      // Always hide menu after action, regardless of success or failure
      hideMenu();
    }
  }, [targetElement, position, copyElement, cutElement, pasteElement, duplicateElement, moveToFront, moveToBack, deleteElement, hideMenu]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      
      const target = e.target as HTMLElement;
      const selectableElement = target.closest(
        'img, table, div[data-movable], div[data-shape], div[data-resizable], button, hr, blockquote, h1, h2, h3, h4, h5, h6, p'
      ) as HTMLElement;

      if (selectableElement && container.contains(selectableElement)) {
        setTargetElement(selectableElement);
        setPosition({ x: e.clientX, y: e.clientY });
        setIsVisible(true);
      } else {
        // Right-click on empty space - show paste option if available
        if (clipboardRef.current) {
          setTargetElement(null);
          setPosition({ x: e.clientX, y: e.clientY });
          setIsVisible(true);
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Check if click is outside the menu
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        hideMenu();
      }
    };

    const handleDocumentClick = (e: MouseEvent) => {
      // Additional global click handler to ensure menu closes
      if (isVisible && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        hideMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        forceHideMenu();
        return;
      }
      
      // Only handle shortcuts if menu is visible or we have a target element
      if (!isVisible && !targetElement) return;
      
      // Keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' && targetElement) {
          e.preventDefault();
          copyElement(targetElement);
          hideMenu();
        } else if (e.key === 'x' && targetElement) {
          e.preventDefault();
          cutElement(targetElement);
          setTargetElement(null);
          hideMenu();
        } else if (e.key === 'v' && clipboardRef.current) {
          e.preventDefault();
          pasteElement();
          hideMenu();
        } else if (e.key === 'd' && targetElement) {
          e.preventDefault();
          duplicateElement(targetElement);
          hideMenu();
        }
      }
      
      if (e.key === 'Delete' && targetElement) {
        e.preventDefault();
        deleteElement(targetElement);
        setTargetElement(null);
        hideMenu();
      }
    };

    container.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    document.addEventListener('click', handleDocumentClick, true); // Use capture phase
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('click', handleDocumentClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, containerRef, targetElement, isVisible, copyElement, cutElement, pasteElement, duplicateElement, deleteElement, hideMenu, forceHideMenu]);

  // Adjust menu position to stay within viewport
  useEffect(() => {
    if (isVisible && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      if (position.x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      if (position.y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [isVisible, position.x, position.y]);

  if (!isVisible) return null;

  // Check if target element can be edited (contains text)
  const canEditText = targetElement && (
    targetElement.tagName === 'P' ||
    targetElement.tagName === 'H1' ||
    targetElement.tagName === 'H2' ||
    targetElement.tagName === 'H3' ||
    targetElement.tagName === 'H4' ||
    targetElement.tagName === 'H5' ||
    targetElement.tagName === 'H6' ||
    targetElement.tagName === 'SPAN' ||
    targetElement.tagName === 'DIV' ||
    targetElement.tagName === 'BUTTON' ||
    targetElement.classList.contains('titulo') ||
    targetElement.classList.contains('parrafo') ||
    (targetElement.textContent?.trim().length || 0) > 0
  );

  const menuItems = [
    { id: 'edit-text', label: 'Editar texto', icon: Edit3, shortcut: 'F2', disabled: !canEditText, danger: false },
    { id: 'separator0', label: '', icon: null, disabled: false, danger: false },
    { id: 'copy', label: 'Copiar', icon: Copy, shortcut: 'Ctrl+C', disabled: false, danger: false },
    { id: 'cut', label: 'Cortar', icon: Scissors, shortcut: 'Ctrl+X', disabled: false, danger: false },
    { id: 'duplicate', label: 'Duplicar', icon: CopyPlus, shortcut: 'Ctrl+D', disabled: false, danger: false },
    { id: 'separator1', label: '', icon: null, disabled: false, danger: false },
    { id: 'move-front', label: 'Traer al frente', icon: MoveUp, disabled: false, danger: false },
    { id: 'move-back', label: 'Enviar atrás', icon: MoveDown, disabled: false, danger: false },
    { id: 'separator2', label: '', icon: null, disabled: false, danger: false },
    { id: 'paste', label: 'Pegar', icon: Clipboard, shortcut: 'Ctrl+V', disabled: !clipboardRef.current, danger: false },
    { id: 'delete', label: 'Eliminar', icon: Trash2, shortcut: 'Delete', disabled: false, danger: true }
  ];

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 10000,
        ...style
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px]">
        {menuItems.map((item) => {
          if (item.id.startsWith('separator')) {
            return <div key={item.id} className="border-t border-gray-100 my-1" />;
          }

          const Icon = item.icon;
          const isDisabled = item.disabled;
          const isDanger = item.danger;

          return (
            <button
              key={item.id}
              onClick={() => handleMenuAction(item.id)}
              disabled={isDisabled}
              className={`
                w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isDanger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}
              `}
            >
              <div className="flex items-center space-x-3">
                {Icon && <Icon className="h-4 w-4" />}
                <span className="text-sm">{item.label}</span>
              </div>
              {item.shortcut && (
                <span className="text-xs text-gray-400">{item.shortcut}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContextMenu;