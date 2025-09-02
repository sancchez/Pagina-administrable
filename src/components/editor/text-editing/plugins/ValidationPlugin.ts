import { BasePlugin } from './PluginSystem';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  validator: (content: string, element: HTMLElement) => ValidationResult;
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestions?: string[];
  position?: { start: number; end: number };
}

export interface ValidationConfig {
  enabled: boolean;
  showInlineErrors: boolean;
  showSummary: boolean;
  autoValidate: boolean;
  validateOnType: boolean;
  debounceMs: number;
  rules: ValidationRule[];
}

export class ValidationPlugin extends BasePlugin {
  id = 'validation';
  name = 'Content Validation Plugin';
  version = '1.0.0';
  description = 'Valida el contenido del editor en tiempo real';
  author = 'Text Editor Team';

  private validationResults: Map<string, ValidationResult[]> = new Map();
  private validationTimeout?: number;
  private errorIndicators: HTMLElement[] = [];
  private summaryPanel?: HTMLElement;

  private defaultRules: ValidationRule[] = [
    {
      id: 'min-length',
      name: 'Longitud mínima',
      description: 'El contenido debe tener al menos 10 caracteres',
      severity: 'warning',
      enabled: true,
      validator: (content: string) => {
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        return {
          isValid: textContent.length >= 10,
          message: textContent.length < 10 ? `Contenido muy corto (${textContent.length}/10 caracteres mínimos)` : undefined
        };
      }
    },
    {
      id: 'max-length',
      name: 'Longitud máxima',
      description: 'El contenido no debe exceder 5000 caracteres',
      severity: 'error',
      enabled: true,
      validator: (content: string) => {
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        return {
          isValid: textContent.length <= 5000,
          message: textContent.length > 5000 ? `Contenido muy largo (${textContent.length}/5000 caracteres máximos)` : undefined
        };
      }
    },
    {
      id: 'no-empty-paragraphs',
      name: 'Párrafos vacíos',
      description: 'No debe haber párrafos vacíos',
      severity: 'info',
      enabled: true,
      validator: (content: string) => {
        const emptyParagraphs = content.match(/<p>\s*<\/p>/g);
        return {
          isValid: !emptyParagraphs,
          message: emptyParagraphs ? `Se encontraron ${emptyParagraphs.length} párrafo(s) vacío(s)` : undefined,
          suggestions: emptyParagraphs ? ['Eliminar párrafos vacíos', 'Agregar contenido a los párrafos'] : undefined
        };
      }
    },
    {
      id: 'spelling-basic',
      name: 'Ortografía básica',
      description: 'Verificación básica de ortografía',
      severity: 'warning',
      enabled: true,
      validator: (content: string) => {
        const textContent = content.replace(/<[^>]*>/g, '').toLowerCase();
        const commonErrors = [
          { wrong: 'aver', correct: 'a ver' },
          { wrong: 'haber', correct: 'a ver' },
          { wrong: 'ay', correct: 'ahí' },
          { wrong: 'ahi', correct: 'ahí' },
          { wrong: 'halla', correct: 'haya' },
          { wrong: 'valla', correct: 'vaya' },
          { wrong: 'tubo', correct: 'tuvo' },
          { wrong: 'echo', correct: 'hecho' }
        ];
        
        const errors = commonErrors.filter(error => 
          textContent.includes(error.wrong)
        );
        
        return {
          isValid: errors.length === 0,
          message: errors.length > 0 ? `Posibles errores ortográficos encontrados: ${errors.map(e => e.wrong).join(', ')}` : undefined,
          suggestions: errors.map(e => `Cambiar "${e.wrong}" por "${e.correct}"`)
        };
      }
    },
    {
      id: 'html-structure',
      name: 'Estructura HTML',
      description: 'Verificar que la estructura HTML sea válida',
      severity: 'error',
      enabled: true,
      validator: (content: string) => {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(`<div>${content}</div>`, 'text/html');
          const errors = doc.querySelectorAll('parsererror');
          
          return {
            isValid: errors.length === 0,
            message: errors.length > 0 ? 'Estructura HTML inválida detectada' : undefined,
            suggestions: errors.length > 0 ? ['Verificar etiquetas de apertura y cierre', 'Revisar sintaxis HTML'] : undefined
          };
        } catch (error) {
          return {
            isValid: false,
            message: 'Error al validar estructura HTML',
            suggestions: ['Verificar sintaxis HTML']
          };
        }
      }
    },
    {
      id: 'accessibility',
      name: 'Accesibilidad',
      description: 'Verificar elementos de accesibilidad',
      severity: 'warning',
      enabled: true,
      validator: (content: string) => {
        const issues: string[] = [];
        
        // Verificar imágenes sin alt
        const imgWithoutAlt = content.match(/<img(?![^>]*alt=)[^>]*>/g);
        if (imgWithoutAlt) {
          issues.push(`${imgWithoutAlt.length} imagen(es) sin texto alternativo`);
        }
        
        // Verificar enlaces sin texto descriptivo
        const linksWithGenericText = content.match(/<a[^>]*>\s*(aquí|click|más|ver)\s*<\/a>/gi);
        if (linksWithGenericText) {
          issues.push(`${linksWithGenericText.length} enlace(s) con texto poco descriptivo`);
        }
        
        return {
          isValid: issues.length === 0,
          message: issues.length > 0 ? `Problemas de accesibilidad: ${issues.join(', ')}` : undefined,
          suggestions: [
            'Agregar texto alternativo a las imágenes',
            'Usar texto descriptivo en los enlaces',
            'Verificar contraste de colores'
          ]
        };
      }
    }
  ];

  protected async onInitialize(): Promise<void> {
    this.setupEventListeners();
    this.createSummaryPanel();
  }

  protected async onDestroy(): Promise<void> {
    this.clearValidationIndicators();
    this.removeSummaryPanel();
    this.removeEventListeners();
    
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }
  }

  getDefaultConfig(): ValidationConfig {
    return {
      enabled: true,
      showInlineErrors: true,
      showSummary: true,
      autoValidate: true,
      validateOnType: true,
      debounceMs: 500,
      rules: this.defaultRules
    };
  }

  validateConfig(config?: any): boolean {
    return true;
  }

  private setupEventListeners(): void {
    document.addEventListener('input', this.handleInput);
    document.addEventListener('blur', this.handleBlur, true);
  }

  private removeEventListeners(): void {
    document.removeEventListener('input', this.handleInput);
    document.removeEventListener('blur', this.handleBlur, true);
  }

  private handleInput = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (!target.isContentEditable) return;

    const config = this.config as ValidationConfig;
    if (!config.enabled || !config.validateOnType) return;

    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }

    this.validationTimeout = window.setTimeout(() => {
      this.validateElement(target);
    }, config.debounceMs);
  };

  private handleBlur = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (!target.isContentEditable) return;

    const config = this.config as ValidationConfig;
    if (!config.enabled) return;

    this.validateElement(target);
  };

  public validateElement(element: HTMLElement): ValidationResult[] {
    const config = this.config as ValidationConfig;
    if (!config.enabled) return [];

    const content = element.innerHTML;
    const elementId = this.getElementId(element);
    const results: ValidationResult[] = [];

    // Ejecutar todas las reglas habilitadas
    config.rules
      .filter(rule => rule.enabled)
      .forEach(rule => {
        try {
          const result = rule.validator(content, element);
          if (!result.isValid) {
            results.push({
              ...result,
              message: `[${rule.name}] ${result.message || 'Error de validación'}`
            });
          }
        } catch (error) {
          console.error(`Error en regla de validación ${rule.id}:`, error);
        }
      });

    // Guardar resultados
    this.validationResults.set(elementId, results);

    // Mostrar indicadores visuales
    if (config.showInlineErrors) {
      this.showValidationIndicators(element, results);
    }

    // Actualizar panel de resumen
    if (config.showSummary) {
      this.updateSummaryPanel();
    }

    return results;
  }

  private getElementId(element: HTMLElement): string {
    if (element.id) return element.id;
    
    // Generar ID único basado en la posición del elemento
    const elements = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    const index = elements.indexOf(element);
    return `editable-${index}`;
  }

  private showValidationIndicators(element: HTMLElement, results: ValidationResult[]): void {
    this.clearValidationIndicators(element);

    if (results.length === 0) return;

    const indicator = document.createElement('div');
    indicator.className = 'validation-indicator';
    indicator.style.cssText = `
      position: absolute;
      right: -25px;
      top: 0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
      cursor: pointer;
      z-index: 1000;
    `;

    // Determinar color según la severidad más alta
    const hasError = results.some(r => this.getRuleSeverity(r) === 'error');
    const hasWarning = results.some(r => this.getRuleSeverity(r) === 'warning');
    
    if (hasError) {
      indicator.style.backgroundColor = '#ef4444';
      indicator.textContent = '!';
      indicator.title = 'Errores de validación';
    } else if (hasWarning) {
      indicator.style.backgroundColor = '#f59e0b';
      indicator.textContent = '⚠';
      indicator.title = 'Advertencias de validación';
    } else {
      indicator.style.backgroundColor = '#3b82f6';
      indicator.textContent = 'i';
      indicator.title = 'Información de validación';
    }

    // Agregar tooltip con detalles
    indicator.addEventListener('click', () => {
      this.showValidationTooltip(indicator, results);
    });

    // Posicionar relativo al elemento
    const rect = element.getBoundingClientRect();
    indicator.style.position = 'fixed';
    indicator.style.left = `${rect.right + 5}px`;
    indicator.style.top = `${rect.top}px`;

    document.body.appendChild(indicator);
    this.errorIndicators.push(indicator);
  }

  private getRuleSeverity(result: ValidationResult): 'error' | 'warning' | 'info' {
    // En una implementación real, esto vendría del resultado
    // Por ahora, inferimos basado en el mensaje
    const message = result.message?.toLowerCase() || '';
    if (message.includes('error') || message.includes('inválid')) return 'error';
    if (message.includes('advertencia') || message.includes('largo')) return 'warning';
    return 'info';
  }

  private showValidationTooltip(anchor: HTMLElement, results: ValidationResult[]): void {
    // Remover tooltip existente
    const existingTooltip = document.querySelector('.validation-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'validation-tooltip';
    tooltip.style.cssText = `
      position: fixed;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 12px;
      max-width: 300px;
      z-index: 10001;
      font-size: 14px;
    `;

    const content = document.createElement('div');
    results.forEach((result, index) => {
      const item = document.createElement('div');
      item.style.marginBottom = index < results.length - 1 ? '8px' : '0';
      
      const message = document.createElement('div');
      message.textContent = result.message || 'Error de validación';
      message.style.fontWeight = '500';
      item.appendChild(message);
      
      if (result.suggestions && result.suggestions.length > 0) {
        const suggestions = document.createElement('ul');
        suggestions.style.cssText = 'margin: 4px 0 0 16px; font-size: 12px; color: #666;';
        
        result.suggestions.forEach(suggestion => {
          const li = document.createElement('li');
          li.textContent = suggestion;
          suggestions.appendChild(li);
        });
        
        item.appendChild(suggestions);
      }
      
      content.appendChild(item);
    });

    tooltip.appendChild(content);

    // Posicionar tooltip
    const rect = anchor.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;

    document.body.appendChild(tooltip);

    // Remover al hacer click fuera
    setTimeout(() => {
      const handleClickOutside = (event: Event) => {
        if (!tooltip.contains(event.target as Node)) {
          tooltip.remove();
          document.removeEventListener('click', handleClickOutside);
        }
      };
      document.addEventListener('click', handleClickOutside);
    }, 100);
  }

  private clearValidationIndicators(element?: HTMLElement): void {
    if (element) {
      // Limpiar indicadores específicos del elemento
      this.errorIndicators = this.errorIndicators.filter(indicator => {
        const shouldRemove = true; // Lógica para determinar si pertenece al elemento
        if (shouldRemove) {
          indicator.remove();
          return false;
        }
        return true;
      });
    } else {
      // Limpiar todos los indicadores
      this.errorIndicators.forEach(indicator => indicator.remove());
      this.errorIndicators = [];
    }
  }

  private createSummaryPanel(): void {
    this.summaryPanel = document.createElement('div');
    this.summaryPanel.className = 'validation-summary';
    this.summaryPanel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 16px;
      max-width: 350px;
      z-index: 10000;
      display: none;
    `;

    document.body.appendChild(this.summaryPanel);
  }

  private updateSummaryPanel(): void {
    if (!this.summaryPanel) return;

    const allResults = Array.from(this.validationResults.values()).flat();
    
    if (allResults.length === 0) {
      this.summaryPanel.style.display = 'none';
      return;
    }

    const errors = allResults.filter(r => this.getRuleSeverity(r) === 'error');
    const warnings = allResults.filter(r => this.getRuleSeverity(r) === 'warning');
    const infos = allResults.filter(r => this.getRuleSeverity(r) === 'info');

    this.summaryPanel.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 12px; color: #333;">
        Resumen de Validación
      </div>
      ${errors.length > 0 ? `<div style="color: #ef4444; margin-bottom: 4px;">❌ ${errors.length} error(es)</div>` : ''}
      ${warnings.length > 0 ? `<div style="color: #f59e0b; margin-bottom: 4px;">⚠️ ${warnings.length} advertencia(s)</div>` : ''}
      ${infos.length > 0 ? `<div style="color: #3b82f6; margin-bottom: 4px;">ℹ️ ${infos.length} información</div>` : ''}
      <button onclick="this.parentElement.style.display='none'" style="
        margin-top: 8px;
        padding: 4px 8px;
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">Cerrar</button>
    `;

    this.summaryPanel.style.display = 'block';
  }

  private removeSummaryPanel(): void {
    if (this.summaryPanel) {
      this.summaryPanel.remove();
      this.summaryPanel = undefined;
    }
  }

  async onBeforeEdit(element: HTMLElement): Promise<boolean> {
    return true;
  }

  async onAfterEdit(): Promise<void> {
    // La validación se maneja en los event listeners
  }

  async onContentChange(): Promise<void> {
    // La validación se maneja en los event listeners
  }

  // Métodos públicos para la API
  public getValidationResults(elementId?: string): ValidationResult[] {
    if (elementId) {
      return this.validationResults.get(elementId) || [];
    }
    return Array.from(this.validationResults.values()).flat();
  }

  public hasErrors(elementId?: string): boolean {
    const results = this.getValidationResults(elementId);
    return results.some(r => this.getRuleSeverity(r) === 'error');
  }

  public clearValidation(elementId?: string): void {
    if (elementId) {
      this.validationResults.delete(elementId);
    } else {
      this.validationResults.clear();
    }
    this.clearValidationIndicators();
    this.updateSummaryPanel();
  }
}

export default ValidationPlugin;