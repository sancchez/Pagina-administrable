import React, { useEffect, useRef, useCallback } from 'react';

interface GroupManagerProps {
  containerRef: React.RefObject<HTMLElement>;
  enabled: boolean;
  onGroupChange?: (groupedElements: HTMLElement[]) => void;
  onTextEditActivate?: () => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({ containerRef, enabled, onGroupChange, onTextEditActivate }) => {
  const selectedElements = useRef<Set<HTMLElement>>(new Set());
  const isSelecting = useRef(false);
  const selectionBox = useRef<HTMLDivElement | null>(null);
  const startPoint = useRef({ x: 0, y: 0 });
  const isDraggingGroup = useRef(false);
  const groupStartPositions = useRef<Map<HTMLElement, { x: number; y: number }>>(new Map());

  // Create selection box element
  const createSelectionBox = useCallback(() => {
    if (selectionBox.current) {
      selectionBox.current.remove();
    }
    
    const box = document.createElement('div');
    box.className = 'group-selection-box';
    box.style.cssText = `
      position: absolute;
      border: 2px dashed #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      pointer-events: none;
      z-index: 9999;
      display: none;
    `;
    
    if (containerRef.current) {
      containerRef.current.appendChild(box);
    }
    
    selectionBox.current = box;
  }, [containerRef]);

  // Update selection box position and size
  const updateSelectionBox = useCallback((startX: number, startY: number, currentX: number, currentY: number) => {
    if (!selectionBox.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const left = Math.min(startX, currentX) - containerRect.left;
    const top = Math.min(startY, currentY) - containerRect.top;
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionBox.current.style.left = `${left}px`;
    selectionBox.current.style.top = `${top}px`;
    selectionBox.current.style.width = `${width}px`;
    selectionBox.current.style.height = `${height}px`;
    selectionBox.current.style.display = 'block';
  }, [containerRef]);

  // Get elements within selection box
  const getElementsInSelection = useCallback((startX: number, startY: number, endX: number, endY: number): HTMLElement[] => {
    if (!containerRef.current) return [];

    const containerRect = containerRef.current.getBoundingClientRect();
    const selectionRect = {
      left: Math.min(startX, endX) - containerRect.left,
      top: Math.min(startY, endY) - containerRect.top,
      right: Math.max(startX, endX) - containerRect.left,
      bottom: Math.max(startY, endY) - containerRect.top
    };

    const selectableElements = containerRef.current.querySelectorAll(
      'img, table, div[data-movable], div[data-shape], div[data-resizable], button, hr, blockquote, h1, h2, h3, h4, h5, h6, p'
    );

    const elementsInSelection: HTMLElement[] = [];

    selectableElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const elementRect = htmlElement.getBoundingClientRect();
      const relativeRect = {
        left: elementRect.left - containerRect.left,
        top: elementRect.top - containerRect.top,
        right: elementRect.right - containerRect.left,
        bottom: elementRect.bottom - containerRect.top
      };

      // Check if element intersects with selection
      if (
        relativeRect.left < selectionRect.right &&
        relativeRect.right > selectionRect.left &&
        relativeRect.top < selectionRect.bottom &&
        relativeRect.bottom > selectionRect.top
      ) {
        elementsInSelection.push(htmlElement);
      }
    });

    return elementsInSelection;
  }, [containerRef]);

  // Add element to selection
  const addToSelection = useCallback((element: HTMLElement) => {
    selectedElements.current.add(element);
    element.classList.add('group-selected');
    element.style.outline = '2px solid #10b981';
    element.style.outlineOffset = '2px';
  }, []);

  // Remove element from selection
  const removeFromSelection = useCallback((element: HTMLElement) => {
    selectedElements.current.delete(element);
    element.classList.remove('group-selected');
    element.style.outline = '';
    element.style.outlineOffset = '';
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    selectedElements.current.forEach((element) => {
      removeFromSelection(element);
    });
    selectedElements.current.clear();
    onGroupChange?.(Array.from(selectedElements.current));
  }, [removeFromSelection, onGroupChange]);

  // Toggle element selection
  const toggleSelection = useCallback((element: HTMLElement) => {
    if (selectedElements.current.has(element)) {
      removeFromSelection(element);
    } else {
      addToSelection(element);
    }
    onGroupChange?.(Array.from(selectedElements.current));
  }, [addToSelection, removeFromSelection, onGroupChange]);

  // Get group bounds


  // Move group of elements
  const moveGroup = useCallback((deltaX: number, deltaY: number) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    selectedElements.current.forEach((element) => {
      const startPos = groupStartPositions.current.get(element);
      if (!startPos) return;

      const newX = startPos.x + deltaX;
      const newY = startPos.y + deltaY;

      // Apply boundary constraints
      const elementRect = element.getBoundingClientRect();
      const maxX = containerRect.width - elementRect.width;
      const maxY = containerRect.height - elementRect.height;

      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));

      element.style.left = `${constrainedX}px`;
      element.style.top = `${constrainedY}px`;
    });
  }, [containerRef]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    createSelectionBox();

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicking on a selected element to start group drag
      if (selectedElements.current.has(target) && selectedElements.current.size > 1) {
        e.preventDefault();
        isDraggingGroup.current = true;
        
        // Store initial positions
        groupStartPositions.current.clear();
        selectedElements.current.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          groupStartPositions.current.set(element, {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top
          });
        });
        
        startPoint.current = { x: e.clientX, y: e.clientY };
        return;
      }

      // Check if Ctrl/Cmd key is pressed for multi-selection
      if (e.ctrlKey || e.metaKey) {
        const selectableElement = target.closest(
          'img, table, div[data-movable], div[data-shape], div[data-resizable], button, hr, blockquote, h1, h2, h3, h4, h5, h6, p'
        ) as HTMLElement;
        
        if (selectableElement && container.contains(selectableElement)) {
          e.preventDefault();
          toggleSelection(selectableElement);
          return;
        }
      }

      // Start box selection if clicking on empty space
      if (target === container || !target.closest('img, table, div[data-movable], div[data-shape], div[data-resizable], button, hr, blockquote, h1, h2, h3, h4, h5, h6, p')) {
        isSelecting.current = true;
        startPoint.current = { x: e.clientX, y: e.clientY };
        
        // Clear previous selection if not holding Ctrl/Cmd
        if (!e.ctrlKey && !e.metaKey) {
          clearSelection();
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingGroup.current) {
        const deltaX = e.clientX - startPoint.current.x;
        const deltaY = e.clientY - startPoint.current.y;
        moveGroup(deltaX, deltaY);
        return;
      }

      if (isSelecting.current) {
        updateSelectionBox(
          startPoint.current.x,
          startPoint.current.y,
          e.clientX,
          e.clientY
        );
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDraggingGroup.current) {
        isDraggingGroup.current = false;
        groupStartPositions.current.clear();
        return;
      }

      if (isSelecting.current) {
        isSelecting.current = false;
        
        if (selectionBox.current) {
          selectionBox.current.style.display = 'none';
        }

        // Get elements in selection and add them to the group
        const elementsInSelection = getElementsInSelection(
          startPoint.current.x,
          startPoint.current.y,
          e.clientX,
          e.clientY
        );

        elementsInSelection.forEach((element) => {
          if (!selectedElements.current.has(element)) {
            addToSelection(element);
          }
        });

        onGroupChange?.(Array.from(selectedElements.current));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }
      
      // Delete key to remove selected elements
      if (e.key === 'Delete' && selectedElements.current.size > 0) {
        selectedElements.current.forEach((element) => {
          element.remove();
        });
        clearSelection();
      }
      
      // F2 key to activate text editing
      if (e.key === 'F2' && onTextEditActivate) {
        e.preventDefault();
        onTextEditActivate();
      }
    };

    // Add event listeners
    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      
      if (selectionBox.current) {
        selectionBox.current.remove();
      }
      
      clearSelection();
    };
  }, [enabled, containerRef, createSelectionBox, updateSelectionBox, getElementsInSelection, addToSelection, toggleSelection, clearSelection, moveGroup, onGroupChange]);

  // Add CSS styles for group selection
  React.useEffect(() => {
    const styleId = 'group-manager-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      .group-selected {
        position: relative !important;
      }
      
      .group-selection-box {
        border: 2px dashed #3b82f6 !important;
        background: rgba(59, 130, 246, 0.1) !important;
        pointer-events: none !important;
        z-index: 9999 !important;
      }
      
      .group-selected:hover {
        outline-color: #059669 !important;
      }
      
      [data-movable="true"].group-selected {
        cursor: move !important;
      }
    `;
    
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  return null; // This component renders no visible content
};

export default GroupManager;