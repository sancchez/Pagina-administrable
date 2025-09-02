import { BasePlugin } from './PluginSystem';
import { TextEditingState } from '../types';

/**
 * Plugin para formateo de texto avanzado
 */
export class FormattingPlugin extends BasePlugin {
  id = 'formatting';
  name = 'Text Formatting Plugin';
  version = '1.0.0';
  description = 'Proporciona funcionalidades avanzadas de formateo de texto';
  author = 'Text Editor Team';

  private shortcuts: Map<string, () => void> = new Map();
  private formatButtons: HTMLElement[] = [];

  protected async onInitialize(): Promise<void> {
    this.setupKeyboardShortcuts();
    this.createFormatToolbar();
    console.log('🎨 Plugin de formateo inicializado');
  }

  protected async onDestroy(): Promise<void> {
    this.removeKeyboardShortcuts();
    this.removeFormatToolbar();
    console.log('🎨 Plugin de formateo destruido');
  }

  getDefaultConfig() {
    return {
      enableShortcuts: true,
      enableToolbar: true,
      shortcuts: {
        bold: 'Ctrl+B',
        italic: 'Ctrl+I',
        underline: 'Ctrl+U',
        strikethrough: 'Ctrl+Shift+S'
      },
      toolbar: {
        position: 'top',
        buttons: ['bold', 'italic', 'underline', 'strikethrough', 'color', 'fontSize']
      }
    };
  }

  validateConfig(config?: any): boolean {
    return true;
  }

  /**
   * Configura atajos de teclado
   */
  private setupKeyboardShortcuts(): void {
    if (!this.config?.enableShortcuts) return;

    const shortcuts = this.config.shortcuts || {};
    
    this.shortcuts.set(shortcuts.bold || 'Ctrl+B', () => this.toggleBold());
    this.shortcuts.set(shortcuts.italic || 'Ctrl+I', () => this.toggleItalic());
    this.shortcuts.set(shortcuts.underline || 'Ctrl+U', () => this.toggleUnderline());
    this.shortcuts.set(shortcuts.strikethrough || 'Ctrl+Shift+S', () => this.toggleStrikethrough());

    document.addEventListener('keydown', this.handleKeydown);
  }

  /**
   * Remueve atajos de teclado
   */
  private removeKeyboardShortcuts(): void {
    document.removeEventListener('keydown', this.handleKeydown);
    this.shortcuts.clear();
  }

  /**
   * Maneja eventos de teclado
   */
  private handleKeydown = (event: KeyboardEvent): void => {
    const key = this.getKeyCombo(event);
    const action = this.shortcuts.get(key);
    
    if (action && this.manager?.isActive()) {
      event.preventDefault();
      action();
    }
  };

  /**
   * Obtiene la combinación de teclas
   */
  private getKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.shiftKey) parts.push('Shift');
    if (event.altKey) parts.push('Alt');
    
    parts.push(event.key.toUpperCase());
    
    return parts.join('+');
  }

  /**
   * Crea la barra de herramientas de formateo
   */
  private createFormatToolbar(): void {
    if (!this.config?.enableToolbar) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'formatting-toolbar';
    toolbar.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: none;
      z-index: 10000;
      gap: 4px;
    `;

    const buttons = this.config.toolbar?.buttons || ['bold', 'italic', 'underline'];
    
    buttons.forEach((buttonType: string) => {
      const button = this.createFormatButton(buttonType);
      if (button) {
        toolbar.appendChild(button);
        this.formatButtons.push(button);
      }
    });

    document.body.appendChild(toolbar);
    
    // Mostrar/ocultar toolbar según el estado del editor
    this.manager?.subscribe((state: TextEditingState) => {
      toolbar.style.display = state.isActive ? 'flex' : 'none';
    });
  }

  /**
   * Crea un botón de formato
   */
  private createFormatButton(type: string): HTMLElement | null {
    const buttonConfig = {
      bold: { text: 'B', title: 'Negrita (Ctrl+B)', action: () => this.toggleBold() },
      italic: { text: 'I', title: 'Cursiva (Ctrl+I)', action: () => this.toggleItalic() },
      underline: { text: 'U', title: 'Subrayado (Ctrl+U)', action: () => this.toggleUnderline() },
      strikethrough: { text: 'S', title: 'Tachado (Ctrl+Shift+S)', action: () => this.toggleStrikethrough() },
      color: { text: '🎨', title: 'Color de texto', action: () => this.showColorPicker() },
      fontSize: { text: 'A', title: 'Tamaño de fuente', action: () => this.showFontSizePicker() }
    };

    const config = buttonConfig[type as keyof typeof buttonConfig];
    if (!config) return null;

    const button = document.createElement('button');
    button.textContent = config.text;
    button.title = config.title;
    button.style.cssText = `
      border: 1px solid #ddd;
      background: white;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-weight: ${type === 'bold' ? 'bold' : 'normal'};
      font-style: ${type === 'italic' ? 'italic' : 'normal'};
      text-decoration: ${type === 'underline' ? 'underline' : type === 'strikethrough' ? 'line-through' : 'none'};
    `;

    button.addEventListener('click', config.action);
    
    button.addEventListener('mouseenter', () => {
      button.style.background = '#f0f0f0';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = 'white';
    });

    return button;
  }

  /**
   * Remueve la barra de herramientas
   */
  private removeFormatToolbar(): void {
    const toolbar = document.querySelector('.formatting-toolbar');
    if (toolbar) {
      toolbar.remove();
    }
    this.formatButtons = [];
  }

  /**
   * Aplica formato al texto seleccionado
   */
  private applyFormat(command: string, value?: string): void {
    if (!this.manager?.isActive()) return;

    try {
      document.execCommand(command, false, value);
      this.updateButtonStates();
    } catch (error) {
      console.error('Error aplicando formato:', error);
    }
  }

  /**
   * Actualiza el estado visual de los botones
   */
  private updateButtonStates(): void {
    // Actualizar estados de botones según el formato actual
    this.formatButtons.forEach(button => {
      const title = button.title.toLowerCase();
      let isActive = false;
      
      if (title.includes('negrita')) {
        isActive = document.queryCommandState('bold');
      } else if (title.includes('cursiva')) {
        isActive = document.queryCommandState('italic');
      } else if (title.includes('subrayado')) {
        isActive = document.queryCommandState('underline');
      } else if (title.includes('tachado')) {
        isActive = document.queryCommandState('strikeThrough');
      }
      
      button.style.background = isActive ? '#e0e0e0' : 'white';
    });
  }

  // Métodos de formateo
  private toggleBold(): void {
    this.applyFormat('bold');
  }

  private toggleItalic(): void {
    this.applyFormat('italic');
  }

  private toggleUnderline(): void {
    this.applyFormat('underline');
  }

  private toggleStrikethrough(): void {
    this.applyFormat('strikeThrough');
  }

  private showColorPicker(): void {
    const color = prompt('Ingrese el color (hex, rgb, o nombre):');
    if (color) {
      this.applyFormat('foreColor', color);
    }
  }

  private showFontSizePicker(): void {
    const size = prompt('Ingrese el tamaño de fuente (1-7):');
    if (size && /^[1-7]$/.test(size)) {
      this.applyFormat('fontSize', size);
    }
  }

  // Hooks del plugin
  async onBeforeEdit(element: HTMLElement): Promise<boolean> {
    // Preparar elemento para formateo
    if (!element.hasAttribute('contenteditable')) {
      element.setAttribute('contenteditable', 'true');
    }
    return true;
  }

  async onAfterEdit(): Promise<void> {
    // Limpiar atributos de formateo si es necesario
    this.updateButtonStates();
  }

  async onContentChange(): Promise<void> {
    // Actualizar estado de botones cuando cambia el contenido
    this.updateButtonStates();
  }
}