import { TextEditingState, TextEditingOptions } from '../types';
import { DEFAULT_TEXT_EDITING_CONFIG } from '../config/defaults';
import { canEditElement, getElementPosition, sanitizeContent, generateEditorId } from '../utils';
import { PluginSystem } from '../plugins/PluginSystem';

/**
 * Gestor principal del sistema de edición de texto
 * Controla el estado y las operaciones de edición
 */
export class TextEditingManager {
  private state: TextEditingState;
  private options: TextEditingOptions;
  private editorId: string;
  private autoSaveTimeout: number | null = null;
  private container: HTMLElement | null = null;
  private subscribers: Array<(state: TextEditingState) => void> = [];
  private pluginSystem: PluginSystem;
  private history: string[] = [];
  private historyIndex: number = -1;
  private maxHistorySize: number = 50;
  private preservedStates: Map<HTMLElement, any> = new Map();

  constructor(options: Partial<TextEditingOptions> = {}) {
    this.editorId = generateEditorId();
    
    // Configuración por defecto
    this.options = {
      autoSave: true,
      autoSaveDelay: 1000,
      multilineThreshold: 100,
      config: DEFAULT_TEXT_EDITING_CONFIG,
      events: {},
      ...options
    };

    // Estado inicial
    this.state = {
      activeElement: null,
      isEditing: false,
      isActive: false,
      originalContent: '',
      currentContent: '',
      content: ''
    };

    this.pluginSystem = new PluginSystem(this);
  }

  /**
   * Establece el contenedor donde se realizará la edición
   */
  setContainer(container: HTMLElement): void {
    this.container = container;
  }

  /**
   * Inicia la edición de un elemento
   */
  async startEditing(element: HTMLElement): Promise<boolean> {
    // Verificar si el elemento puede ser editado
    if (!canEditElement(element, this.options.config)) {
      console.warn('Elemento no puede ser editado:', element.tagName, element.className);
      return false;
    }

    // Ejecutar hook onBeforeEdit de plugins
    const beforeEditResults = await this.pluginSystem.executeHook('onBeforeEdit', element);
    const canEdit = beforeEditResults.every(result => result !== false);
    
    if (!canEdit) {
      console.warn('Edición cancelada por plugin');
      return false;
    }

    // Si ya hay un elemento siendo editado, guardar cambios
    if (this.state.isEditing) {
      this.saveEdit();
    }

    // PRESERVACIÓN COMPLETA DEL ELEMENTO
    this.preserveElementState(element);

    // Obtener contenido original
    const originalContent = element.textContent || '';

    // Actualizar estado
    this.state = {
      activeElement: element,
      isEditing: true,
      isActive: true,
      originalContent,
      currentContent: originalContent,
      content: originalContent
    };

    // Inicializar historial con el contenido inicial
    this.clearHistory();
    this.addToHistory(originalContent);

    // Marcar elemento como en edición con preservación mejorada
    element.classList.add('text-editing-active');
    element.setAttribute('data-editing-id', this.editorId);
    element.setAttribute('data-editing-timestamp', Date.now().toString());

    // Disparar evento de inicio
    this.options.events.onStart?.(element);

    // Ejecutar hook onAfterEdit de plugins
    await this.pluginSystem.executeHook('onAfterEdit', element, this.state.content);

    console.log('🔤 Iniciando edición con preservación:', element.tagName, originalContent);
    return true;
  }

  /**
   * Detiene la edición sin guardar cambios
   */
  async stopEditing(): Promise<void> {
    if (!this.state.isEditing || !this.state.activeElement) {
      return;
    }

    const element = this.state.activeElement;

    // Ejecutar hook onCancel de plugins
    await this.pluginSystem.executeHook('onCancel', element);

    // Restaurar contenido original
    element.textContent = this.state.originalContent;

    // Limpiar marcadores
    this.cleanupElement(element);

    // Disparar evento de cancelación
    this.options.events.onCancel?.(element);

    // Resetear estado
    this.resetState();

    console.log('❌ Edición cancelada');
  }

  /**
   * Guarda los cambios de edición con preservación mejorada
   */
  saveEdit(): void {
    if (!this.state.isEditing || !this.state.activeElement) {
      return;
    }

    const element = this.state.activeElement;
    const content = this.state.content;

    console.log('💾 Guardando cambios con preservación:', {
      elemento: element.tagName,
      contenidoOriginal: this.state.originalContent,
      contenidoNuevo: content,
      tieneEstadoPreservado: this.preservedStates.has(element)
    });

    try {
      // Actualizar contenido si hay cambios
      if (content !== this.state.originalContent) {
        element.textContent = content;
      }

      // Limpiar elemento (esto restaurará automáticamente el estado preservado)
      this.cleanupElement(element);
      
      // Resetear estado
      this.resetState();

      // Disparar eventos
      this.options.events.onSave?.(element, content);
      this.notifySubscribers();

      console.log('✅ Edición guardada exitosamente con preservación');
    } catch (error) {
      console.error('❌ Error guardando edición:', error);
      // En caso de error, intentar restaurar estado manualmente
      if (this.preservedStates.has(element)) {
        this.restoreElementState(element);
      }
    }
  }

  /**
   * Actualiza el contenido durante la edición
   */
  async updateContent(content: string): Promise<void> {
    if (!this.state.isEditing) {
      return;
    }

    const sanitized = sanitizeContent(content, this.options.config.maxLength);
    
    // Agregar al historial si el contenido ha cambiado
    if (sanitized !== this.state.currentContent) {
      this.addToHistory(sanitized);
    }
    
    this.state.currentContent = sanitized;
    this.state.content = sanitized;

    // Ejecutar hook onContentChange de plugins
    if (this.state.activeElement) {
      await this.pluginSystem.executeHook('onContentChange', sanitized, this.state.activeElement);
    }

    // Notificar a los suscriptores
    this.notifySubscribers();

    // Configurar auto-guardado si está habilitado
    if (this.options.config.autoSave) {
      this.scheduleAutoSave();
    }
  }

  /**
   * Obtiene el estado actual de edición
   */
  getState(): TextEditingState {
    return { ...this.state };
  }

  /**
   * Verifica si hay una edición activa
   */
  isActive(): boolean {
    return this.state.isEditing;
  }

  /**
   * Obtiene el elemento actualmente siendo editado
   */
  getActiveElement(): HTMLElement | null {
    return this.state.activeElement;
  }

  /**
   * Obtiene la posición del elemento activo
   */
  getActiveElementPosition() {
    if (!this.state.activeElement) {
      return null;
    }

    return getElementPosition(this.state.activeElement, this.container || undefined);
  }

  /**
   * Actualiza las opciones de configuración
   */
  updateOptions(options: Partial<TextEditingOptions>): void {
    this.options = {
      ...this.options,
      ...options,
      config: {
        ...this.options.config,
        ...options.config
      },
      events: {
        ...this.options.events,
        ...options.events
      }
    };
  }

  /**
   * Suscribirse a cambios de estado
   */
  subscribe(callback: (state: TextEditingState) => void): () => void {
    this.subscribers.push(callback);
    
    // Retornar función para cancelar suscripción
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Limpia todos los recursos y detiene la edición
   */
  async destroy(): Promise<void> {
    if (this.state.isEditing) {
      await this.stopEditing();
    }

    await this.pluginSystem.destroy();

    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.subscribers = [];
    this.resetState();
  }

  // Métodos privados

  private scheduleAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = setTimeout(() => {
      if (this.state.isEditing) {
        this.saveEdit();
      }
    }, this.options.config.autoSaveDelay);
  }

  private preserveElementState(element: HTMLElement): void {
    const computedStyle = window.getComputedStyle(element);
    const preservedState = {
      // Estilos CSS críticos
      styles: {
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        fontSize: computedStyle.fontSize,
        fontFamily: computedStyle.fontFamily,
        fontWeight: computedStyle.fontWeight,
        fontStyle: computedStyle.fontStyle,
        textAlign: computedStyle.textAlign,
        lineHeight: computedStyle.lineHeight,
        letterSpacing: computedStyle.letterSpacing,
        textDecoration: computedStyle.textDecoration,
        textTransform: computedStyle.textTransform,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        border: computedStyle.border,
        borderRadius: computedStyle.borderRadius,
        boxShadow: computedStyle.boxShadow,
        opacity: computedStyle.opacity,
        transform: computedStyle.transform,
        transition: computedStyle.transition,
        display: computedStyle.display,
        position: computedStyle.position,
        zIndex: computedStyle.zIndex,
        overflow: computedStyle.overflow,
        whiteSpace: computedStyle.whiteSpace,
        wordWrap: computedStyle.wordWrap,
        textOverflow: computedStyle.textOverflow
      },
      // Atributos originales
      attributes: {
        className: element.className,
        style: element.getAttribute('style') || '',
        id: element.id
      },
      // Contenido original
      originalContent: element.textContent || '',
      innerHTML: element.innerHTML,
      // Timestamp para debugging
      timestamp: Date.now()
    };

    this.preservedStates.set(element, preservedState);
    console.log('🛡️ Estado preservado para elemento:', element.tagName, preservedState);
  }

  private restoreElementState(element: HTMLElement): void {
    const preservedState = this.preservedStates.get(element);
    if (!preservedState) {
      console.warn('⚠️ No se encontró estado preservado para elemento:', element.tagName);
      return;
    }

    try {
      // Restaurar atributos básicos
      if (preservedState.attributes.className !== element.className) {
        element.className = preservedState.attributes.className;
      }
      
      if (preservedState.attributes.id && preservedState.attributes.id !== element.id) {
        element.id = preservedState.attributes.id;
      }

      // Restaurar estilos críticos si han cambiado
      const currentStyle = window.getComputedStyle(element);
      const stylesToRestore: string[] = [];
      
      Object.entries(preservedState.styles).forEach(([property, value]) => {
        if (currentStyle.getPropertyValue(property) !== value && value !== 'initial' && value !== 'auto') {
          stylesToRestore.push(`${property}: ${value}`);
        }
      });

      if (stylesToRestore.length > 0) {
        const currentStyleAttr = element.getAttribute('style') || '';
        const newStyle = currentStyleAttr + '; ' + stylesToRestore.join('; ');
        element.setAttribute('style', newStyle);
      }

      console.log('✅ Estado restaurado para elemento:', element.tagName);
    } catch (error) {
      console.error('❌ Error restaurando estado del elemento:', error);
    }
  }

  private cleanupElement(element: HTMLElement): void {
    // Restaurar estado antes de limpiar
    this.restoreElementState(element);
    
    // Limpiar marcadores de edición
    element.classList.remove('text-editing-active');
    element.removeAttribute('data-editing-id');
    element.removeAttribute('data-editing-timestamp');
    
    // Limpiar estado preservado
    this.preservedStates.delete(element);
  }

  private resetState(): void {
    this.state = {
      activeElement: null,
      isEditing: false,
      isActive: false,
      originalContent: '',
      currentContent: '',
      content: ''
    };

    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Error en suscriptor:', error);
      }
    });
  }

  private getContainerContent(): string {
    return this.container?.innerHTML || '';
  }

  /**
   * Obtiene el sistema de plugins
   */
  getPluginSystem(): PluginSystem {
    return this.pluginSystem;
  }

  /**
   * Agrega contenido al historial
   */
  private addToHistory(content: string): void {
    // Remover entradas futuras si estamos en el medio del historial
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Agregar nueva entrada
    this.history.push(content);
    this.historyIndex = this.history.length - 1;

    // Mantener el tamaño máximo del historial
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Verifica si se puede deshacer
   */
  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  /**
   * Verifica si se puede rehacer
   */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Deshace la última acción
   */
  async undo(): Promise<boolean> {
    if (!this.canUndo() || !this.state.activeElement) {
      return false;
    }

    this.historyIndex--;
    const previousContent = this.history[this.historyIndex];
    
    // Actualizar el contenido sin agregar al historial
    this.state.activeElement.innerHTML = previousContent;
    this.state.currentContent = previousContent;
    this.state.content = previousContent;
    
    this.notifySubscribers();
    return true;
  }

  /**
   * Rehace la última acción deshecha
   */
  async redo(): Promise<boolean> {
    if (!this.canRedo() || !this.state.activeElement) {
      return false;
    }

    this.historyIndex++;
    const nextContent = this.history[this.historyIndex];
    
    // Actualizar el contenido sin agregar al historial
    this.state.activeElement.innerHTML = nextContent;
    this.state.currentContent = nextContent;
    this.state.content = nextContent;
    
    this.notifySubscribers();
    return true;
  }

  /**
   * Obtiene el historial de cambios
   */
  getHistory(): { entries: string[], currentIndex: number } {
    return {
      entries: [...this.history],
      currentIndex: this.historyIndex
    };
  }

  /**
   * Limpia el historial
   */
  clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
  }
}