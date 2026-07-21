/**
 * Validador robusto para datos de GrapesJS
 * Valida la estructura y contenido de los datos antes de guardar
 */

export interface GrapesJSComponent {
  type?: string;
  tagName?: string;
  attributes?: Record<string, any>;
  components?: GrapesJSComponent[];
  content?: string;
  style?: Record<string, any>;
  classes?: string[];
  traits?: any[];
}

export interface GrapesJSPage {
  html?: string;
  css?: string;
  components?: GrapesJSComponent[];
  styles?: any[];
  assets?: any[];
}

export interface GrapesJSData {
  pages?: GrapesJSPage[];
  assets?: any[];
  styles?: any[];
  components?: GrapesJSComponent[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: any;
}

export class GrapesValidator {
  private static readonly MAX_COMPONENT_DEPTH = 20;
  private static readonly MAX_COMPONENTS_COUNT = 1000;
  private static readonly MAX_DATA_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TAGS = [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'img', 'a', 'button', 'input', 'textarea', 'select', 'option',
    'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
    'section', 'article', 'header', 'footer', 'nav', 'main', 'aside',
    'form', 'label', 'br', 'hr', 'strong', 'em', 'small', 'code', 'pre',
    // Íconos/logos SVG: sin estos tags, cualquier <svg> se reescribía a
    // <div> al guardar (gjsComponents), borrando el ícono en silencio.
    'svg', 'path', 'circle', 'ellipse', 'g', 'rect', 'line',
    'polygon', 'polyline', 'defs', 'use', 'linearGradient',
    'radialGradient', 'stop', 'clipPath', 'mask', 'title'
  ];

  /**
   * Valida datos de GrapesJS completos
   */
  static validateGrapesData(data: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Verificar tamaño de datos
      if (data.length > this.MAX_DATA_SIZE) {
        result.errors.push(`Los datos exceden el tamaño máximo permitido (${this.MAX_DATA_SIZE / 1024 / 1024}MB)`);
        result.isValid = false;
        return result;
      }

      // Parsear JSON
      let parsedData: any;
      try {
        parsedData = JSON.parse(data);
      } catch (parseError) {
        result.errors.push('Los datos no contienen JSON válido');
        result.isValid = false;
        return result;
      }

      // Validar estructura básica
      if (!parsedData || typeof parsedData !== 'object') {
        result.errors.push('Los datos deben ser un objeto JSON válido');
        result.isValid = false;
        return result;
      }

      // Validar y sanitizar componentes
      if (parsedData.components) {
        const componentValidation = this.validateComponents(parsedData.components);
        result.errors.push(...componentValidation.errors);
        result.warnings.push(...componentValidation.warnings);
        if (!componentValidation.isValid) {
          result.isValid = false;
        }
        parsedData.components = componentValidation.sanitizedData;
      }

      // Validar páginas si existen
      if (parsedData.pages && Array.isArray(parsedData.pages)) {
        for (let i = 0; i < parsedData.pages.length; i++) {
          const pageValidation = this.validatePage(parsedData.pages[i], i);
          result.errors.push(...pageValidation.errors);
          result.warnings.push(...pageValidation.warnings);
          if (!pageValidation.isValid) {
            result.isValid = false;
          }
          parsedData.pages[i] = pageValidation.sanitizedData;
        }
      }

      // Validar estilos
      if (parsedData.styles) {
        const stylesValidation = this.validateStyles(parsedData.styles);
        result.warnings.push(...stylesValidation.warnings);
        parsedData.styles = stylesValidation.sanitizedData;
      }

      // Validar assets
      if (parsedData.assets) {
        const assetsValidation = this.validateAssets(parsedData.assets);
        result.warnings.push(...assetsValidation.warnings);
        parsedData.assets = assetsValidation.sanitizedData;
      }

      result.sanitizedData = parsedData;

    } catch (error) {
      result.errors.push(`Error durante la validación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Valida una página individual
   */
  private static validatePage(page: any, index: number): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedData: { ...page }
    };

    if (!page || typeof page !== 'object') {
      result.errors.push(`Página ${index}: debe ser un objeto válido`);
      result.isValid = false;
      return result;
    }

    // Validar HTML
    if (page.html && typeof page.html !== 'string') {
      result.warnings.push(`Página ${index}: HTML debe ser una cadena de texto`);
      result.sanitizedData.html = '';
    }

    // Validar CSS
    if (page.css && typeof page.css !== 'string') {
      result.warnings.push(`Página ${index}: CSS debe ser una cadena de texto`);
      result.sanitizedData.css = '';
    }

    // Validar componentes de la página
    if (page.components) {
      const componentValidation = this.validateComponents(page.components);
      result.errors.push(...componentValidation.errors.map(err => `Página ${index}: ${err}`));
      result.warnings.push(...componentValidation.warnings.map(warn => `Página ${index}: ${warn}`));
      if (!componentValidation.isValid) {
        result.isValid = false;
      }
      result.sanitizedData.components = componentValidation.sanitizedData;
    }

    return result;
  }

  /**
   * Valida array de componentes
   */
  private static validateComponents(components: any, depth: number = 0): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedData: []
    };

    if (!Array.isArray(components)) {
      result.errors.push('Los componentes deben ser un array');
      result.isValid = false;
      return result;
    }

    // Verificar profundidad máxima
    if (depth > this.MAX_COMPONENT_DEPTH) {
      result.errors.push(`Profundidad de componentes excede el máximo permitido (${this.MAX_COMPONENT_DEPTH})`);
      result.isValid = false;
      return result;
    }

    // Verificar cantidad máxima de componentes
    if (components.length > this.MAX_COMPONENTS_COUNT) {
      result.warnings.push(`Número de componentes (${components.length}) excede el recomendado (${this.MAX_COMPONENTS_COUNT})`);
    }

    for (let i = 0; i < components.length; i++) {
      const componentValidation = this.validateComponent(components[i], i, depth);
      result.errors.push(...componentValidation.errors);
      result.warnings.push(...componentValidation.warnings);
      
      if (!componentValidation.isValid) {
        result.isValid = false;
      } else {
        result.sanitizedData.push(componentValidation.sanitizedData);
      }
    }

    return result;
  }

  /**
   * Valida un componente individual
   */
  private static validateComponent(component: any, index: number, depth: number): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedData: { ...component }
    };

    if (!component || typeof component !== 'object') {
      result.errors.push(`Componente ${index}: debe ser un objeto válido`);
      result.isValid = false;
      return result;
    }

    // Validar tagName
    if (component.tagName) {
      if (typeof component.tagName !== 'string') {
        result.warnings.push(`Componente ${index}: tagName debe ser una cadena`);
        result.sanitizedData.tagName = 'div';
      } else if (!this.ALLOWED_TAGS.includes(component.tagName.toLowerCase())) {
        result.warnings.push(`Componente ${index}: tagName '${component.tagName}' no está en la lista de etiquetas permitidas`);
        result.sanitizedData.tagName = 'div';
      }
    }

    // Validar type
    if (component.type && typeof component.type !== 'string') {
      result.warnings.push(`Componente ${index}: type debe ser una cadena`);
      delete result.sanitizedData.type;
    }

    // Validar attributes
    if (component.attributes) {
      if (typeof component.attributes !== 'object' || Array.isArray(component.attributes)) {
        result.warnings.push(`Componente ${index}: attributes debe ser un objeto`);
        result.sanitizedData.attributes = {};
      } else {
        result.sanitizedData.attributes = this.sanitizeAttributes(component.attributes);
      }
    }

    // Validar content
    if (component.content && typeof component.content !== 'string') {
      result.warnings.push(`Componente ${index}: content debe ser una cadena`);
      result.sanitizedData.content = '';
    }

    // Validar componentes hijos recursivamente
    if (component.components) {
      const childValidation = this.validateComponents(component.components, depth + 1);
      result.errors.push(...childValidation.errors.map(err => `Componente ${index}: ${err}`));
      result.warnings.push(...childValidation.warnings.map(warn => `Componente ${index}: ${warn}`));
      if (!childValidation.isValid) {
        result.isValid = false;
      }
      result.sanitizedData.components = childValidation.sanitizedData;
    }

    return result;
  }

  /**
   * Sanitiza atributos de componentes
   */
  private static sanitizeAttributes(attributes: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];

    for (const [key, value] of Object.entries(attributes)) {
      // Remover atributos peligrosos
      if (dangerousAttributes.includes(key.toLowerCase())) {
        continue;
      }

      // Sanitizar valores
      if (typeof value === 'string') {
        // Remover scripts inline
        sanitized[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Valida estilos
   */
  private static validateStyles(styles: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedData: Array.isArray(styles) ? [] : styles
    };

    if (Array.isArray(styles)) {
      for (let i = 0; i < styles.length; i++) {
        if (styles[i] && typeof styles[i] === 'object') {
          result.sanitizedData.push(styles[i]);
        } else {
          result.warnings.push(`Estilo ${i}: debe ser un objeto válido`);
        }
      }
    }

    return result;
  }

  /**
   * Valida assets
   */
  private static validateAssets(assets: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedData: Array.isArray(assets) ? [] : assets
    };

    if (Array.isArray(assets)) {
      for (let i = 0; i < assets.length; i++) {
        if (assets[i] && typeof assets[i] === 'object') {
          // Validar URL del asset
          if (assets[i].src && typeof assets[i].src === 'string') {
            try {
              new URL(assets[i].src);
              result.sanitizedData.push(assets[i]);
            } catch {
              result.warnings.push(`Asset ${i}: URL inválida`);
            }
          } else {
            result.sanitizedData.push(assets[i]);
          }
        } else {
          result.warnings.push(`Asset ${i}: debe ser un objeto válido`);
        }
      }
    }

    return result;
  }

  /**
   * Valida HTML generado
   */
  static validateGeneratedHTML(html: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!html || typeof html !== 'string') {
      result.errors.push('HTML debe ser una cadena de texto válida');
      result.isValid = false;
      return result;
    }

    // Verificar scripts maliciosos
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(html)) {
      result.warnings.push('HTML contiene etiquetas script que pueden ser removidas por seguridad');
    }

    // Verificar eventos inline
    if (/on\w+\s*=/gi.test(html)) {
      result.warnings.push('HTML contiene eventos inline que pueden ser removidos por seguridad');
    }

    return result;
  }

  /**
   * Valida CSS generado
   */
  static validateGeneratedCSS(css: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (css && typeof css !== 'string') {
      result.errors.push('CSS debe ser una cadena de texto válida');
      result.isValid = false;
      return result;
    }

    // Verificar expresiones peligrosas en CSS
    if (css && /expression\s*\(/gi.test(css)) {
      result.warnings.push('CSS contiene expresiones que pueden ser removidas por seguridad');
    }

    return result;
  }
}