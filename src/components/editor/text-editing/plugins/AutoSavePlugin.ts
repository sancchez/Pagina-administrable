import { BasePlugin } from './PluginSystem';
import { TextEditingState } from '../types';

/**
 * Plugin para autoguardado automático
 */
export class AutoSavePlugin extends BasePlugin {
  id = 'autosave';
  name = 'Auto Save Plugin';
  version = '1.0.0';
  description = 'Guarda automáticamente los cambios del editor';
  author = 'Text Editor Team';

  private saveTimer: number | null = null;
  private lastSavedContent = '';
  private saveIndicator: HTMLElement | null = null;
  private saveHistory: Array<{ content: string; timestamp: number; element: HTMLElement }> = [];

  protected async onInitialize(): Promise<void> {
    this.createSaveIndicator();
    this.setupAutoSave();
    console.log('💾 Plugin de autoguardado inicializado');
  }

  protected async onDestroy(): Promise<void> {
    this.clearSaveTimer();
    this.removeSaveIndicator();
    this.saveHistory = [];
    console.log('💾 Plugin de autoguardado destruido');
  }

  getDefaultConfig() {
    return {
      enabled: true,
      interval: 3000, // 3 segundos
      showIndicator: true,
      maxHistorySize: 50,
      saveOnBlur: true,
      saveOnKeyPause: true,
      keyPauseDelay: 1000, // 1 segundo después de dejar de escribir
      storage: {
        type: 'localStorage', // 'localStorage', 'sessionStorage', 'memory'
        prefix: 'texteditor_autosave_'
      },
      notifications: {
        showSaveSuccess: true,
        showSaveError: true,
        duration: 2000
      }
    };
  }

  validateConfig(config: any): boolean {
    return (
      typeof config === 'object' &&
      typeof config.enabled === 'boolean' &&
      typeof config.interval === 'number' &&
      config.interval > 0
    );
  }

  /**
   * Configura el sistema de autoguardado
   */
  private setupAutoSave(): void {
    if (!this.config?.enabled) return;

    // Escuchar cambios de contenido
    this.manager?.subscribe((state: TextEditingState) => {
      if (state.isActive && state.content !== this.lastSavedContent) {
        this.scheduleAutoSave(state.content, state.activeElement || undefined);
      }
    });
  }

  /**
   * Programa un autoguardado
   */
  private scheduleAutoSave(content: string, element?: HTMLElement): void {
    if (!element) return;

    this.clearSaveTimer();
    
    const delay = this.config?.keyPauseDelay || 1000;
    
    this.saveTimer = window.setTimeout(() => {
      this.performAutoSave(content, element);
    }, delay);

    this.updateSaveIndicator('pending');
  }

  /**
   * Realiza el autoguardado
   */
  private async performAutoSave(content: string, element: HTMLElement): Promise<void> {
    try {
      this.updateSaveIndicator('saving');
      
      // Simular guardado (aquí se podría integrar con una API)
      await this.saveToStorage(content, element);
      
      // Actualizar historial
      this.addToHistory(content, element);
      
      this.lastSavedContent = content;
      this.updateSaveIndicator('saved');
      
      if (this.config?.notifications?.showSaveSuccess) {
        this.showNotification('✅ Guardado automáticamente', 'success');
      }
      
      console.log('💾 Contenido guardado automáticamente');
    } catch (error) {
      this.updateSaveIndicator('error');
      
      if (this.config?.notifications?.showSaveError) {
        this.showNotification('❌ Error al guardar', 'error');
      }
      
      console.error('Error en autoguardado:', error);
    }
  }

  /**
   * Guarda en el almacenamiento configurado
   */
  private async saveToStorage(content: string, element: HTMLElement): Promise<void> {
    const storageType = this.config?.storage?.type || 'localStorage';
    const prefix = this.config?.storage?.prefix || 'texteditor_autosave_';
    
    // Generar clave única para el elemento
    const elementId = element.id || element.tagName + '_' + Date.now();
    const key = prefix + elementId;
    
    const saveData = {
      content,
      timestamp: Date.now(),
      elementInfo: {
        tagName: element.tagName,
        className: element.className,
        id: element.id
      }
    };

    switch (storageType) {
      case 'localStorage':
        localStorage.setItem(key, JSON.stringify(saveData));
        break;
      case 'sessionStorage':
        sessionStorage.setItem(key, JSON.stringify(saveData));
        break;
      case 'memory':
        // Guardado en memoria (se pierde al recargar)
        (window as any).__textEditorAutoSave = (window as any).__textEditorAutoSave || {};
        (window as any).__textEditorAutoSave[key] = saveData;
        break;
      default:
        throw new Error(`Tipo de almacenamiento no soportado: ${storageType}`);
    }
  }

  /**
   * Añade entrada al historial
   */
  private addToHistory(content: string, element: HTMLElement): void {
    this.saveHistory.push({
      content,
      timestamp: Date.now(),
      element
    });

    // Limitar tamaño del historial
    const maxSize = this.config?.maxHistorySize || 50;
    if (this.saveHistory.length > maxSize) {
      this.saveHistory = this.saveHistory.slice(-maxSize);
    }
  }

  /**
   * Crea el indicador de guardado
   */
  private createSaveIndicator(): void {
    if (!this.config?.showIndicator) return;

    this.saveIndicator = document.createElement('div');
    this.saveIndicator.className = 'autosave-indicator';
    this.saveIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      z-index: 10001;
      transition: all 0.3s ease;
      opacity: 0;
      pointer-events: none;
    `;

    document.body.appendChild(this.saveIndicator);
  }

  /**
   * Actualiza el indicador de guardado
   */
  private updateSaveIndicator(status: 'pending' | 'saving' | 'saved' | 'error'): void {
    if (!this.saveIndicator) return;

    const statusConfig = {
      pending: {
        text: '⏳ Guardando...',
        background: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeaa7'
      },
      saving: {
        text: '💾 Guardando...',
        background: '#d1ecf1',
        color: '#0c5460',
        border: '1px solid #bee5eb'
      },
      saved: {
        text: '✅ Guardado',
        background: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb'
      },
      error: {
        text: '❌ Error',
        background: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb'
      }
    };

    const config = statusConfig[status];
    this.saveIndicator.textContent = config.text;
    this.saveIndicator.style.background = config.background;
    this.saveIndicator.style.color = config.color;
    this.saveIndicator.style.border = config.border;
    this.saveIndicator.style.opacity = '1';

    // Ocultar después de un tiempo (excepto para pending y saving)
    if (status === 'saved' || status === 'error') {
      setTimeout(() => {
        if (this.saveIndicator) {
          this.saveIndicator.style.opacity = '0';
        }
      }, 2000);
    }
  }

  /**
   * Remueve el indicador de guardado
   */
  private removeSaveIndicator(): void {
    if (this.saveIndicator) {
      this.saveIndicator.remove();
      this.saveIndicator = null;
    }
  }

  /**
   * Muestra una notificación
   */
  private showNotification(message: string, type: 'success' | 'error'): void {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 50px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 10002;
      animation: slideIn 0.3s ease;
      background: ${type === 'success' ? '#28a745' : '#dc3545'};
    `;

    // Añadir animación CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remover después del tiempo configurado
    const duration = this.config?.notifications?.duration || 2000;
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, duration);
  }

  /**
   * Limpia el timer de guardado
   */
  private clearSaveTimer(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }

  // Métodos públicos para interactuar con el plugin
  
  /**
   * Fuerza un guardado inmediato
   */
  public async forceSave(): Promise<void> {
    const state = this.manager?.getState();
    if (state?.isActive && state.activeElement && state.content) {
      await this.performAutoSave(state.content, state.activeElement);
    }
  }

  /**
   * Obtiene el historial de guardado
   */
  public getHistory(): Array<{ content: string; timestamp: number; element: HTMLElement }> {
    return [...this.saveHistory];
  }

  /**
   * Limpia el historial de guardado
   */
  public clearHistory(): void {
    this.saveHistory = [];
  }

  /**
   * Restaura contenido desde el almacenamiento
   */
  public async restoreFromStorage(elementId: string): Promise<string | null> {
    const storageType = this.config?.storage?.type || 'localStorage';
    const prefix = this.config?.storage?.prefix || 'texteditor_autosave_';
    const key = prefix + elementId;

    try {
      let data: string | null = null;
      
      switch (storageType) {
        case 'localStorage':
          data = localStorage.getItem(key);
          break;
        case 'sessionStorage':
          data = sessionStorage.getItem(key);
          break;
        case 'memory':
          data = (window as any).__textEditorAutoSave?.[key] ? 
                 JSON.stringify((window as any).__textEditorAutoSave[key]) : null;
          break;
      }

      if (data) {
        const saveData = JSON.parse(data);
        return saveData.content;
      }
    } catch (error) {
      console.error('Error restaurando desde almacenamiento:', error);
    }

    return null;
  }

  // Hooks del plugin
  async onContentChange(content: string, element: HTMLElement): Promise<void> {
    if (this.config?.saveOnKeyPause) {
      this.scheduleAutoSave(content, element);
    }
  }

  async onSave(element: HTMLElement, content: string): Promise<void> {
    // Guardar inmediatamente cuando el usuario guarda manualmente
    await this.performAutoSave(content, element);
  }
}