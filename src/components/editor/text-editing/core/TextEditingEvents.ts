import { TextEditingManager } from './TextEditingManager';
import { findNearestTextElement } from '../utils';

/**
 * Manejador de eventos para el sistema de edición de texto
 */
export class TextEditingEvents {
  private manager: TextEditingManager;
  private container: HTMLElement | null = null;
  private isListening = false;
  private boundHandlers: { [key: string]: EventListener } = {};

  constructor(manager: TextEditingManager) {
    this.manager = manager;
    this.setupBoundHandlers();
  }

  /**
   * Configura los manejadores de eventos con bind
   */
  private setupBoundHandlers(): void {
    this.boundHandlers = {
      doubleClick: this.handleDoubleClick.bind(this),
      keyDown: this.handleKeyDown.bind(this),
      click: this.handleClick.bind(this),
      contextMenu: this.handleContextMenu.bind(this),
      mouseDown: this.handleMouseDown.bind(this),
      focusIn: this.handleFocusIn.bind(this),
      focusOut: this.handleFocusOut.bind(this)
    };
  }

  /**
   * Establece el contenedor y comienza a escuchar eventos
   */
  startListening(container: HTMLElement): void {
    if (this.isListening) {
      this.stopListening();
    }

    this.container = container;
    this.manager.setContainer(container);
    
    // Agregar event listeners
    container.addEventListener('dblclick', this.boundHandlers.doubleClick);
    container.addEventListener('keydown', this.boundHandlers.keyDown);
    container.addEventListener('click', this.boundHandlers.click);
    container.addEventListener('contextmenu', this.boundHandlers.contextMenu);
    container.addEventListener('mousedown', this.boundHandlers.mouseDown);
    container.addEventListener('focusin', this.boundHandlers.focusIn);
    container.addEventListener('focusout', this.boundHandlers.focusOut);
    
    // Hacer el contenedor focusable
    if (!container.hasAttribute('tabindex')) {
      container.setAttribute('tabindex', '0');
    }
    
    this.isListening = true;
    console.log('🎧 TextEditingEvents: Escuchando eventos en', container);
  }

  /**
   * Detiene la escucha de eventos
   */
  stopListening(): void {
    if (!this.isListening || !this.container) {
      return;
    }

    // Remover event listeners
    this.container.removeEventListener('dblclick', this.boundHandlers.doubleClick);
    this.container.removeEventListener('keydown', this.boundHandlers.keyDown);
    this.container.removeEventListener('click', this.boundHandlers.click);
    this.container.removeEventListener('contextmenu', this.boundHandlers.contextMenu);
    this.container.removeEventListener('mousedown', this.boundHandlers.mouseDown);
    this.container.removeEventListener('focusin', this.boundHandlers.focusIn);
    this.container.removeEventListener('focusout', this.boundHandlers.focusOut);
    
    this.isListening = false;
    this.container = null;
    
    console.log('🔇 TextEditingEvents: Deteniendo escucha de eventos');
  }

  /**
   * Maneja doble click para iniciar edición
   */
  private handleDoubleClick(event: Event): void {
    const mouseEvent = event as MouseEvent;
    const target = mouseEvent.target as HTMLElement;
    
    // Prevenir comportamiento por defecto
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    
    // Verificar que no sea un elemento del sistema de edición
    if (this.isSystemElement(target)) {
      return;
    }
    
    // Buscar el elemento de texto más cercano
    const defaultConfig = { allowedElements: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV', 'SPAN', 'BUTTON', 'A'], excludedClasses: [], autoSave: true, autoSaveDelay: 1000, multiline: true };
    const textElement = findNearestTextElement(target, defaultConfig);
    
    if (textElement) {
      this.manager.startEditing(textElement);
      console.log('🖱️ Doble click: Iniciando edición de', textElement.tagName);
    }
  }

  /**
   * Maneja teclas especiales
   */
  private handleKeyDown(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    
    // F2 para editar elemento enfocado
    if (keyEvent.key === 'F2') {
      keyEvent.preventDefault();
      
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && this.container?.contains(activeElement)) {
        const defaultConfig = { allowedElements: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV', 'SPAN', 'BUTTON', 'A'], excludedClasses: [], autoSave: true, autoSaveDelay: 1000, multiline: true };
        const textElement = findNearestTextElement(activeElement, defaultConfig);
        
        if (textElement) {
          this.manager.startEditing(textElement);
          console.log('⌨️ F2: Iniciando edición de', textElement.tagName);
        }
      }
    }
    
    // Escape para cancelar edición
    else if (keyEvent.key === 'Escape' && this.manager.isActive()) {
      keyEvent.preventDefault();
      this.manager.stopEditing();
      console.log('⌨️ Escape: Cancelando edición');
    }
    
    // Enter para guardar edición (solo si no es multilínea)
    else if (keyEvent.key === 'Enter' && !keyEvent.shiftKey && this.manager.isActive()) {
      const activeElement = this.manager.getActiveElement();
      if (activeElement && !['DIV', 'P', 'BLOCKQUOTE'].includes(activeElement.tagName)) {
        keyEvent.preventDefault();
        this.manager.saveEdit();
        console.log('⌨️ Enter: Guardando edición');
      }
    }
  }

  /**
   * Maneja clicks simples - HABILITADO PARA EDICIÓN DIRECTA
   */
  private handleClick(event: Event): void {
    const mouseEvent = event as MouseEvent;
    const target = mouseEvent.target as HTMLElement;
    
    // Si hay una edición activa y se hace click fuera del editor, guardar
    if (this.manager.isActive() && !this.isSystemElement(target)) {
      const activeElement = this.manager.getActiveElement();
      if (activeElement && !activeElement.contains(target)) {
        this.manager.saveEdit();
        console.log('🖱️ Click fuera: Guardando edición');
        return;
      }
    }
    
    // NUEVA FUNCIONALIDAD: Iniciar edición con un solo click
    if (!this.manager.isActive() && !this.isSystemElement(target)) {
      // Prevenir comportamiento por defecto
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      
      // Buscar el elemento de texto más cercano
      const defaultConfig = { 
        allowedElements: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV', 'SPAN', 'BUTTON', 'A', 'LI', 'BLOCKQUOTE'], 
        excludedClasses: ['resize-handle', 'hitbox-selected'], 
        autoSave: false, // Deshabilitado el autoguardado
        autoSaveDelay: 1000, 
        multiline: true 
      };
      const textElement = findNearestTextElement(target, defaultConfig);
      
      if (textElement) {
        // Verificar que no sea un elemento del sistema de hitboxes
        if (!textElement.classList.contains('resize-handle') && 
            !textElement.hasAttribute('data-shape') && 
            !textElement.hasAttribute('data-resizable')) {
          this.manager.startEditing(textElement);
          console.log('🖱️ Click simple: Iniciando edición de', textElement.tagName);
        }
      }
    }
  }

  /**
   * Maneja menú contextual
   */
  private handleContextMenu(event: Event): void {
    const mouseEvent = event as MouseEvent;
    const target = mouseEvent.target as HTMLElement;
    
    // Si es un elemento editable, podríamos mostrar opciones específicas
    if (!this.isSystemElement(target)) {
      const defaultConfig = { allowedElements: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV', 'SPAN', 'BUTTON', 'A'], excludedClasses: [], autoSave: true, autoSaveDelay: 1000, multiline: true };
      const textElement = findNearestTextElement(target, defaultConfig);
      
      if (textElement) {
        // Aquí se podría agregar lógica para menú contextual personalizado
        console.log('🖱️ Menú contextual en elemento editable:', textElement.tagName);
      }
    }
  }

  /**
   * Maneja mouse down para preparar selección
   */
  private handleMouseDown(event: Event): void {
    const mouseEvent = event as MouseEvent;
    const target = mouseEvent.target as HTMLElement;
    
    // Si hay una edición activa y se hace mousedown en otro elemento, guardar
    if (this.manager.isActive() && !this.isSystemElement(target)) {
      const activeElement = this.manager.getActiveElement();
      if (activeElement && !activeElement.contains(target)) {
        this.manager.saveEdit();
      }
    }
  }

  /**
   * Maneja cuando un elemento recibe foco
   */
  private handleFocusIn(event: Event): void {
    const focusEvent = event as FocusEvent;
    const target = focusEvent.target as HTMLElement;
    
    // Marcar elemento como enfocado para navegación con teclado
    if (!this.isSystemElement(target)) {
      target.setAttribute('data-focused', 'true');
    }
  }

  /**
   * Maneja cuando un elemento pierde foco
   */
  private handleFocusOut(event: Event): void {
    const focusEvent = event as FocusEvent;
    const target = focusEvent.target as HTMLElement;
    
    // Remover marca de enfoque
    target.removeAttribute('data-focused');
  }

  /**
   * Verifica si un elemento es parte del sistema de edición
   */
  private isSystemElement(element: HTMLElement): boolean {
    const systemClasses = [
      'text-editing-active',
      'floating-toolbar',
      'context-menu',
      'positioning-guide',
      'edit-button',
      'system-element'
    ];
    
    // Verificar clases del elemento
    for (const className of systemClasses) {
      if (element.classList.contains(className)) {
        return true;
      }
    }
    
    // Verificar si está dentro de un contenedor del sistema
    for (const className of systemClasses) {
      if (element.closest(`.${className}`)) {
        return true;
      }
    }
    
    // Verificar si es un input/textarea del editor
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      const parent = element.parentElement;
      if (parent && parent.id && parent.id.startsWith('text-editor-')) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Limpia recursos y detiene la escucha
   */
  destroy(): void {
    this.stopListening();
    this.manager.destroy();
  }
}