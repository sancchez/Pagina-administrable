import { BasePlugin } from './PluginSystem';

export interface AutoCompleteOption {
  text: string;
  description?: string;
  category?: string;
  insertText?: string;
  priority?: number;
}

export interface AutoCompleteConfig {
  enabled: boolean;
  minChars: number;
  maxSuggestions: number;
  showDescriptions: boolean;
  categories: string[];
  customSuggestions: AutoCompleteOption[];
  enableSmartSuggestions: boolean;
}

export class AutoCompletePlugin extends BasePlugin {
  id = 'autocomplete';
  name = 'Auto Complete Plugin';
  version = '1.0.0';
  description = 'Proporciona autocompletado inteligente de texto';
  author = 'Text Editor Team';

  private suggestionBox?: HTMLElement;
  private currentSuggestions: AutoCompleteOption[] = [];
  private selectedIndex = -1;
  private isActive = false;
  private lastQuery = '';

  private defaultSuggestions: AutoCompleteOption[] = [
    // Palabras comunes en español
    { text: 'administración', category: 'general', description: 'Gestión y organización' },
    { text: 'desarrollo', category: 'general', description: 'Proceso de creación' },
    { text: 'implementación', category: 'general', description: 'Puesta en práctica' },
    { text: 'configuración', category: 'general', description: 'Ajustes del sistema' },
    { text: 'documentación', category: 'general', description: 'Información detallada' },
    { text: 'funcionalidad', category: 'general', description: 'Capacidad de funcionamiento' },
    { text: 'optimización', category: 'general', description: 'Mejora del rendimiento' },
    { text: 'personalización', category: 'general', description: 'Adaptación a necesidades' },
    
    // Términos técnicos
    { text: 'JavaScript', category: 'tecnología', description: 'Lenguaje de programación' },
    { text: 'TypeScript', category: 'tecnología', description: 'JavaScript con tipos' },
    { text: 'React', category: 'tecnología', description: 'Biblioteca de UI' },
    { text: 'Node.js', category: 'tecnología', description: 'Runtime de JavaScript' },
    { text: 'API', category: 'tecnología', description: 'Interfaz de programación' },
    { text: 'database', category: 'tecnología', description: 'Base de datos' },
    { text: 'frontend', category: 'tecnología', description: 'Interfaz de usuario' },
    { text: 'backend', category: 'tecnología', description: 'Servidor y lógica' },
    
    // Frases comunes
    { text: 'Por favor', category: 'cortesía', description: 'Expresión de cortesía' },
    { text: 'Muchas gracias', category: 'cortesía', description: 'Agradecimiento' },
    { text: 'Atentamente', category: 'cortesía', description: 'Despedida formal' },
    { text: 'Cordialmente', category: 'cortesía', description: 'Despedida cordial' }
  ];

  protected async onInitialize(): Promise<void> {
    this.setupEventListeners();
    this.createSuggestionBox();
  }

  protected async onDestroy(): Promise<void> {
    this.removeSuggestionBox();
    this.removeEventListeners();
  }

  getDefaultConfig(): AutoCompleteConfig {
    return {
      enabled: true,
      minChars: 2,
      maxSuggestions: 8,
      showDescriptions: true,
      categories: ['general', 'tecnología', 'cortesía'],
      customSuggestions: [],
      enableSmartSuggestions: true
    };
  }

  validateConfig(): boolean {
    return true;
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('input', this.handleInput);
    document.addEventListener('click', this.handleClick);
  }

  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('input', this.handleInput);
    document.removeEventListener('click', this.handleClick);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isActive) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectPrevious();
        break;
      case 'Enter':
      case 'Tab':
        event.preventDefault();
        this.insertSelectedSuggestion();
        break;
      case 'Escape':
        this.hideSuggestions();
        break;
    }
  };

  private handleInput = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (!target.isContentEditable) return;

    const config = this.config as AutoCompleteConfig;
    if (!config.enabled) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    
    if (textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent || '';
      const cursorPos = range.startOffset;
      
      // Encontrar la palabra actual
      const beforeCursor = text.substring(0, cursorPos);
      const wordMatch = beforeCursor.match(/\b(\w+)$/);
      
      if (wordMatch && wordMatch[1].length >= config.minChars) {
        const query = wordMatch[1].toLowerCase();
        this.showSuggestions(query, target, range);
      } else {
        this.hideSuggestions();
      }
    }
  };

  private handleClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (!this.suggestionBox?.contains(target)) {
      this.hideSuggestions();
    }
  };

  private showSuggestions(query: string, element: HTMLElement, range: Range): void {
    if (query === this.lastQuery) return;
    this.lastQuery = query;

    const config = this.config as AutoCompleteConfig;
    const allSuggestions = [...this.defaultSuggestions, ...config.customSuggestions];
    
    this.currentSuggestions = allSuggestions
      .filter(suggestion => 
        suggestion.text.toLowerCase().includes(query) &&
        config.categories.includes(suggestion.category || 'general')
      )
      .sort((a, b) => {
        // Priorizar coincidencias exactas al inicio
        const aStartsWith = a.text.toLowerCase().startsWith(query);
        const bStartsWith = b.text.toLowerCase().startsWith(query);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Luego por prioridad
        const aPriority = a.priority || 0;
        const bPriority = b.priority || 0;
        
        return bPriority - aPriority;
      })
      .slice(0, config.maxSuggestions);

    if (this.currentSuggestions.length > 0) {
      this.renderSuggestions(range);
      this.isActive = true;
      this.selectedIndex = 0;
    } else {
      this.hideSuggestions();
    }
  }

  private renderSuggestions(range: Range): void {
    if (!this.suggestionBox) return;

    const config = this.config as AutoCompleteConfig;
    const rect = range.getBoundingClientRect();
    
    this.suggestionBox.style.left = `${rect.left}px`;
    this.suggestionBox.style.top = `${rect.bottom + 5}px`;
    this.suggestionBox.style.display = 'block';
    
    this.suggestionBox.innerHTML = '';
    
    this.currentSuggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = `autocomplete-item ${index === this.selectedIndex ? 'selected' : ''}`;
      
      const textSpan = document.createElement('span');
      textSpan.className = 'autocomplete-text';
      textSpan.textContent = suggestion.text;
      item.appendChild(textSpan);
      
      if (config.showDescriptions && suggestion.description) {
        const descSpan = document.createElement('span');
        descSpan.className = 'autocomplete-description';
        descSpan.textContent = suggestion.description;
        item.appendChild(descSpan);
      }
      
      if (suggestion.category) {
        const categorySpan = document.createElement('span');
        categorySpan.className = 'autocomplete-category';
        categorySpan.textContent = suggestion.category;
        item.appendChild(categorySpan);
      }
      
      item.addEventListener('click', () => {
        this.selectedIndex = index;
        this.insertSelectedSuggestion();
      });
      
      this.suggestionBox?.appendChild(item);
    });
  }

  private selectNext(): void {
    if (this.currentSuggestions.length === 0) return;
    
    this.selectedIndex = (this.selectedIndex + 1) % this.currentSuggestions.length;
    this.updateSelection();
  }

  private selectPrevious(): void {
    if (this.currentSuggestions.length === 0) return;
    
    this.selectedIndex = this.selectedIndex <= 0 
      ? this.currentSuggestions.length - 1 
      : this.selectedIndex - 1;
    this.updateSelection();
  }

  private updateSelection(): void {
    if (!this.suggestionBox) return;
    
    const items = this.suggestionBox.querySelectorAll('.autocomplete-item');
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === this.selectedIndex);
    });
  }

  private insertSelectedSuggestion(): void {
    if (this.selectedIndex < 0 || this.selectedIndex >= this.currentSuggestions.length) return;
    
    const suggestion = this.currentSuggestions[this.selectedIndex];
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;
      
      if (textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent || '';
        const cursorPos = range.startOffset;
        const beforeCursor = text.substring(0, cursorPos);
        const wordMatch = beforeCursor.match(/\b(\w+)$/);
        
        if (wordMatch) {
          const wordStart = cursorPos - wordMatch[1].length;
          const insertText = suggestion.insertText || suggestion.text;
          
          // Reemplazar la palabra parcial con la sugerencia
          const newText = text.substring(0, wordStart) + insertText + text.substring(cursorPos);
          textNode.textContent = newText;
          
          // Posicionar el cursor al final del texto insertado
          const newRange = document.createRange();
          newRange.setStart(textNode, wordStart + insertText.length);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
    
    this.hideSuggestions();
  }

  private hideSuggestions(): void {
    if (this.suggestionBox) {
      this.suggestionBox.style.display = 'none';
    }
    this.isActive = false;
    this.selectedIndex = -1;
    this.lastQuery = '';
  }

  private createSuggestionBox(): void {
    this.suggestionBox = document.createElement('div');
    this.suggestionBox.className = 'autocomplete-suggestions';
    this.suggestionBox.style.cssText = `
      position: fixed;
      z-index: 10000;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-height: 200px;
      overflow-y: auto;
      display: none;
      min-width: 200px;
    `;
    
    // Agregar estilos para los elementos
    const style = document.createElement('style');
    style.textContent = `
      .autocomplete-item {
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        display: flex;
        flex-direction: column;
      }
      .autocomplete-item:hover,
      .autocomplete-item.selected {
        background-color: #f0f8ff;
      }
      .autocomplete-text {
        font-weight: 500;
        color: #333;
      }
      .autocomplete-description {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
      }
      .autocomplete-category {
        font-size: 10px;
        color: #999;
        text-transform: uppercase;
        margin-top: 2px;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(this.suggestionBox);
  }

  private removeSuggestionBox(): void {
    if (this.suggestionBox) {
      this.suggestionBox.remove();
      this.suggestionBox = undefined;
    }
  }

  async onBeforeEdit(element: HTMLElement): Promise<boolean> {
    return true;
  }

  async onAfterEdit(): Promise<void> {
    // Lógica después de editar
  }

  async onContentChange(): Promise<void> {
    // Lógica cuando cambia el contenido
  }
}

export default AutoCompletePlugin;