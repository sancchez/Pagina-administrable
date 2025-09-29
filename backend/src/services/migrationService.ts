import { errorUtils } from '../utils/helpers';
import * as cheerio from 'cheerio';

interface GrapesComponent {
  type: string;
  content?: string;
  tagName?: string;
  attributes?: Record<string, any>;
  components?: GrapesComponent[];
  style?: Record<string, any>;
}

interface GrapesData {
  components: GrapesComponent[];
  styles: any[];
}

export class MigrationService {
  /**
   * Convierte HTML estático a formato GrapesJS
   */
  static async migrateHtmlToGrapes(htmlContent: string): Promise<GrapesData> {
    try {
      if (!htmlContent || !htmlContent.trim()) {
        throw errorUtils.createError('Contenido HTML requerido', 'INVALID_INPUT', 400);
      }

      const $ = cheerio.load(htmlContent);
      const components: GrapesComponent[] = [];
      const styles: any[] = [];

      // Extraer estilos CSS del HTML
      $('style').each((_, element) => {
        const cssContent = $(element).html();
        if (cssContent) {
          this.parseCssToGrapesStyles(cssContent, styles);
        }
      });

      // Procesar el body o todo el HTML si no hay body
      let elementsToProcess: cheerio.Cheerio<any>;
      if ($('body').length > 0) {
        elementsToProcess = $('body').children();
      } else {
        elementsToProcess = $.root().children();
      }
      
      elementsToProcess.each((_, element) => {
        const component = this.convertElementToGrapesComponent($, $(element));
        if (component) {
          components.push(component);
        }
      });

      return {
        components,
        styles
      };
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error migrating HTML to GrapesJS:', error);
      throw errorUtils.createError('Error interno del servidor al migrar HTML', 'MIGRATION_ERROR', 500);
    }
  }

  /**
   * Convierte un elemento HTML a componente GrapesJS
   */
  private static convertElementToGrapesComponent($: cheerio.CheerioAPI, element: cheerio.Cheerio<any>): GrapesComponent | null {
    const tagName = element.prop('tagName')?.toLowerCase();
    if (!tagName) return null;

    const component: GrapesComponent = {
      type: this.getGrapesComponentType(tagName),
      tagName: tagName
    };

    // Extraer atributos
    const attributes: Record<string, any> = {};
    const elementAttribs = element.get(0)?.attribs || {};
    
    Object.keys(elementAttribs).forEach(attr => {
      if (attr !== 'style') {
        attributes[attr] = elementAttribs[attr];
      }
    });

    if (Object.keys(attributes).length > 0) {
      component.attributes = attributes;
    }

    // Extraer estilos inline
    const styleAttr = element.attr('style');
    if (styleAttr) {
      component.style = this.parseInlineStyles(styleAttr);
    }

    // Procesar contenido
    if (this.isTextElement(tagName)) {
      component.content = element.text();
    } else {
      const children: GrapesComponent[] = [];
      element.children().each((_, child) => {
        const childComponent = this.convertElementToGrapesComponent($, $(child));
        if (childComponent) {
          children.push(childComponent);
        }
      });

      if (children.length > 0) {
        component.components = children;
      } else if (element.text().trim()) {
        component.content = element.text();
      }
    }

    return component;
  }

  /**
   * Determina el tipo de componente GrapesJS basado en el tag HTML
   */
  private static getGrapesComponentType(tagName: string): string {
    const typeMap: Record<string, string> = {
      'div': 'default',
      'section': 'default',
      'article': 'default',
      'header': 'default',
      'footer': 'default',
      'main': 'default',
      'aside': 'default',
      'nav': 'default',
      'p': 'text',
      'h1': 'text',
      'h2': 'text',
      'h3': 'text',
      'h4': 'text',
      'h5': 'text',
      'h6': 'text',
      'span': 'text',
      'strong': 'text',
      'em': 'text',
      'b': 'text',
      'i': 'text',
      'a': 'link',
      'img': 'image',
      'button': 'button',
      'form': 'form',
      'input': 'input',
      'textarea': 'textarea',
      'select': 'select',
      'ul': 'list',
      'ol': 'list',
      'li': 'list-item',
      'table': 'table',
      'tr': 'row',
      'td': 'cell',
      'th': 'cell'
    };

    return typeMap[tagName] || 'default';
  }

  /**
   * Verifica si un elemento es principalmente de texto
   */
  private static isTextElement(tagName: string): boolean {
    const textElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'strong', 'em', 'b', 'i'];
    return textElements.includes(tagName);
  }

  /**
   * Parsea estilos inline a objeto
   */
  private static parseInlineStyles(styleString: string): Record<string, any> {
    const styles: Record<string, any> = {};
    
    styleString.split(';').forEach(rule => {
      const [property, value] = rule.split(':').map(s => s.trim());
      if (property && value) {
        // Convertir propiedades CSS a camelCase para GrapesJS
        const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        styles[camelProperty] = value;
      }
    });

    return styles;
  }

  /**
   * Parsea CSS a estilos de GrapesJS
   */
  private static parseCssToGrapesStyles(cssContent: string, styles: any[]): void {
    // Implementación básica - se puede mejorar con un parser CSS más robusto
    const rules = cssContent.match(/[^{}]+\{[^{}]*\}/g) || [];
    
    rules.forEach(rule => {
      const [selector, declarations] = rule.split('{');
      if (selector && declarations) {
        const cleanSelector = selector.trim();
        const cleanDeclarations = declarations.replace('}', '').trim();
        
        const styleObj: any = {
          selectors: [cleanSelector],
          style: {}
        };

        cleanDeclarations.split(';').forEach(declaration => {
          const [property, value] = declaration.split(':').map(s => s.trim());
          if (property && value) {
            const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            styleObj.style[camelProperty] = value;
          }
        });

        if (Object.keys(styleObj.style).length > 0) {
          styles.push(styleObj);
        }
      }
    });
  }

  /**
   * Genera HTML y CSS desde datos de GrapesJS
   */
  static async generateHtmlCssFromGrapes(grapesData: any): Promise<{ html: string; css: string }> {
    try {
      if (!grapesData || !grapesData.components) {
        throw errorUtils.createError('Datos de GrapesJS inválidos', 'INVALID_INPUT', 400);
      }

      const html = this.generateHtmlFromComponents(grapesData.components);
      const css = this.generateCssFromStyles(grapesData.styles || []);

      return { html, css };
    } catch (error: any) {
      if (error.status) throw error;
      console.error('Error generating HTML/CSS from GrapesJS:', error);
      throw errorUtils.createError('Error interno del servidor al generar HTML/CSS', 'GENERATION_ERROR', 500);
    }
  }

  /**
   * Genera HTML desde componentes GrapesJS
   */
  private static generateHtmlFromComponents(components: GrapesComponent[]): string {
    return components.map(component => {
      const tagName = component.tagName || 'div';
      const attributes = component.attributes || {};
      const style = component.style || {};

      let attributeString = '';
      Object.keys(attributes).forEach(attr => {
        attributeString += ` ${attr}="${attributes[attr]}"`;
      });

      let styleString = '';
      if (Object.keys(style).length > 0) {
        styleString = ' style="';
        Object.keys(style).forEach(prop => {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          styleString += `${cssProp}: ${style[prop]}; `;
        });
        styleString += '"';
      }

      const openTag = `<${tagName}${attributeString}${styleString}>`;
      const closeTag = `</${tagName}>`;

      let content = '';
      if (component.content) {
        content = component.content;
      } else if (component.components) {
        content = this.generateHtmlFromComponents(component.components);
      }

      return `${openTag}${content}${closeTag}`;
    }).join('');
  }

  /**
   * Genera CSS desde estilos GrapesJS
   */
  private static generateCssFromStyles(styles: any[]): string {
    return styles.map(style => {
      const selectors = Array.isArray(style.selectors) ? style.selectors.join(', ') : style.selectors;
      const declarations = style.style || {};

      let cssDeclarations = '';
      Object.keys(declarations).forEach(prop => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        cssDeclarations += `  ${cssProp}: ${declarations[prop]};\n`;
      });

      return `${selectors} {\n${cssDeclarations}}`;
    }).join('\n\n');
  }
}