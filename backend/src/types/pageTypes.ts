/**
 * Tipos y interfaces para el manejo estandarizado de datos de páginas
 */

export interface GrapesJSData {
  'gjs-html': string;
  'gjs-css': string;
  'gjs-components': any[];
  'gjs-styles': any[];
}

export interface PageDataStructure {
  // Campo principal: contiene los datos del editor GrapesJS
  grapesData: GrapesJSData | null;
  
  // Campos generados automáticamente desde grapesData
  html: string | null;  // HTML generado para renderizado público
  css: string | null;   // CSS generado para renderizado público
  
  // Campo legacy: mantener por compatibilidad pero deprecar
  content: string | null;  // @deprecated - usar grapesData
}

export interface PageContent {
  id: string;
  name: string;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Estructura de datos estandarizada
  grapesData: GrapesJSData | null;
  html: string | null;
  css: string | null;
  content: string | null; // @deprecated
}

/**
 * Estrategia de uso de campos:
 * 
 * 1. grapesData (Json): Campo principal del editor
 *    - Contiene toda la estructura del editor GrapesJS
 *    - Se guarda cuando el usuario edita en el admin
 *    - Formato: { 'gjs-html': string, 'gjs-css': string, 'gjs-components': [], 'gjs-styles': [] }
 * 
 * 2. html (String): HTML generado para renderizado público
 *    - Se genera automáticamente desde grapesData
 *    - Se usa en PageRenderer para mostrar páginas públicas
 *    - Se actualiza cada vez que se guarda grapesData
 * 
 * 3. css (String): CSS generado para renderizado público
 *    - Se genera automáticamente desde grapesData
 *    - Se usa junto con html para renderizado público
 *    - Se actualiza cada vez que se guarda grapesData
 * 
 * 4. content (String): Campo legacy - DEPRECADO
 *    - Mantener solo por compatibilidad con datos existentes
 *    - No usar para nuevas funcionalidades
 *    - Migrar gradualmente a grapesData
 */

export class PageDataManager {
  /**
   * Convierte datos de GrapesJS a HTML/CSS para renderizado público
   */
  static generatePublicContent(grapesData: GrapesJSData): { html: string; css: string } {
    return {
      html: grapesData['gjs-html'] || '',
      css: grapesData['gjs-css'] || ''
    };
  }

  /**
   * Valida la estructura de datos de GrapesJS
   */
  static validateGrapesData(data: any): data is GrapesJSData {
    return (
      data &&
      typeof data === 'object' &&
      typeof data['gjs-html'] === 'string' &&
      typeof data['gjs-css'] === 'string' &&
      Array.isArray(data['gjs-components']) &&
      Array.isArray(data['gjs-styles'])
    );
  }

  /**
   * Migra datos legacy del campo content a grapesData
   */
  static migrateLegacyContent(content: string): GrapesJSData | null {
    try {
      const parsed = JSON.parse(content);
      if (this.validateGrapesData(parsed)) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }
}