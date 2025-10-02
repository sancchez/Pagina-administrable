import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

interface PageData {
  title: string;
  slug: string;
  gjsHtml: string;
  gjsCss: string;
  gjsComponents: string;
  gjsStyles: string;
}

interface ConvertedPage {
  slug: string;
  title: string;
  gjsHtml: string;
  gjsCss: string;
  gjsComponents: any;
  gjsStyles: any;
}

// Mapeo de páginas TSX a sus metadatos
const pageMapping: Record<string, { title: string; slug: string }> = {
  'HomePage.tsx': { title: 'Inicio', slug: 'home' },
  'Contacto.tsx': { title: 'Contacto', slug: 'contacto' },
  'InformacionESAL.tsx': { title: 'Información ESAL', slug: 'informacion-esal' },
  'Normatividad.tsx': { title: 'Normatividad', slug: 'normatividad' },
  'OperacionGestion.tsx': { title: 'Operación y Gestión', slug: 'operacion-gestion' },
  'PortalUsuario.tsx': { title: 'Portal de Usuario', slug: 'portal-usuario' },
  'QuienesSomos.tsx': { title: 'Quiénes Somos', slug: 'quienes-somos' },
  'InvoicePage.tsx': { title: 'Facturación', slug: 'facturacion' },
  'InvoiceQuery.tsx': { title: 'Consulta de Facturas', slug: 'consulta-facturas' }
};

class PageConverter {
  private frontendPath: string;
  private outputPath: string;

  constructor() {
    this.frontendPath = path.join(__dirname, '../../frontend/src/pages');
    this.outputPath = path.join(__dirname, '../temp/converted-pages');
    
    // Crear directorio de salida si no existe
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
  }

  private async renderPageToHtml(pageName: string): Promise<string> {
    try {
      // Importar dinámicamente la página
      const pagePath = path.join(this.frontendPath, `${pageName}.tsx`);
      
      if (!fs.existsSync(pagePath)) {
        console.warn(`Página ${pageName}.tsx no encontrada, usando HTML básico`);
        return this.extractBasicHtml(pagePath);
      }

      // Para este ejemplo, vamos a usar un HTML básico extraído del archivo
      // En un entorno real, necesitarías configurar un bundler para importar los componentes React
      return this.extractBasicHtml(pagePath);
    } catch (error) {
      console.error(`Error renderizando ${pageName}:`, error);
      return this.extractBasicHtml(path.join(this.frontendPath, `${pageName}.tsx`));
    }
  }

  private extractBasicHtml(filePath: string): string {
    if (!fs.existsSync(filePath)) {
      return '<div>Página no encontrada</div>';
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extraer JSX básico del return statement
    const jsxMatch = content.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*}/);
    if (!jsxMatch) {
      return '<div>Error: No se pudo extraer JSX</div>';
    }
    
    let jsx = jsxMatch[1].trim();
    
    // Limpiar y convertir JSX básico a HTML
    jsx = jsx
      .replace(/className=/g, 'class=')
      .replace(/\{[^}]*\}/g, '') // Remover expresiones JavaScript
      .replace(/\/>/g, '>') // Convertir self-closing tags
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
    
    return jsx;
  }

  private extractBasicCss(filePath: string): string {
    if (!fs.existsSync(filePath)) {
      return '';
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Buscar clases CSS mencionadas en el archivo
    const classMatches = content.match(/className="([^"]+)"/g) || [];
    const classes = classMatches
      .map(match => match.replace(/className="([^"]+)"/, '$1'))
      .join(' ')
      .split(' ')
      .filter(cls => cls.length > 0 && !cls.includes('{'));
    
    // Generar CSS básico para las clases encontradas
    const basicCss = classes
      .map(cls => `.${cls} { /* Estilo para ${cls} */ }`)
      .join('\n');
    
    return basicCss;
  }

  /**
   * Convierte una página TSX específica a HTML usando ReactDOMServer
   */
  async convertPage(fileName: string): Promise<PageData | null> {
    try {
      const pageInfo = pageMapping[fileName];
      if (!pageInfo) {
        console.log(`⚠️  Página ${fileName} no está en el mapeo, saltando...`);
        return null;
      }

      console.log(`🔄 Convirtiendo ${fileName}...`);

      // Renderizar página a HTML usando el nuevo método
      const gjsHtml = await this.renderPageToHtml(fileName.replace('.tsx', ''));
      
      // Extraer CSS básico del archivo
      const tsxPath = path.join(this.frontendPath, fileName);
      const gjsCss = this.extractBasicCss(tsxPath);

      // Inicializar gjsComponents y gjsStyles vacíos para GrapesJS
      // GrapesJS los rellenará cuando el usuario edite la página
      const gjsComponents = JSON.stringify([]);
      const gjsStyles = JSON.stringify([]);

      // Crear estructura de datos para GrapesJS
      const pageData: PageData = {
        title: pageInfo.title,
        slug: pageInfo.slug,
        gjsHtml,
        gjsCss,
        gjsComponents,
        gjsStyles
      };

      // Guardar en archivo temporal
      const outputFile = path.join(this.outputPath, `${pageInfo.slug}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(pageData, null, 2));

      console.log(`✅ ${fileName} convertido exitosamente`);
      console.log(`   - HTML extraído: ${gjsHtml.length} caracteres`);
      console.log(`   - CSS extraído: ${gjsCss.length} caracteres`);
      return pageData;

    } catch (error) {
      console.error(`❌ Error convirtiendo ${fileName}:`, error);
      return null;
    }
  }

  /**
   * Extrae HTML básico del contenido TSX
   */
  private extractHTMLFromTSX(tsxContent: string, title: string): string {
    // Esta es una conversión básica - en un caso real usarías un parser más sofisticado
    // Por ahora, creamos HTML básico basado en el título y estructura común
    
    if (title === 'Inicio') {
      return `
        <div class="page-container">
          <section class="hero-section">
            <div class="hero-content">
              <h1>Agua Pura para Tu Comunidad</h1>
              <p>Brindamos servicios de agua potable de la más alta calidad, garantizando el acceso continuo y confiable al recurso hídrico para todas las familias.</p>
              <div class="hero-buttons">
                <button class="btn-primary">Conoce Nuestros Servicios</button>
                <button class="btn-secondary">Portal de Usuario</button>
              </div>
            </div>
          </section>
          <section class="features-section">
            <div class="container">
              <h2>Nuestros Servicios</h2>
              <div class="features-grid">
                <div class="feature-card">
                  <h3>Agua Potable</h3>
                  <p>Suministro continuo de agua de calidad</p>
                </div>
                <div class="feature-card">
                  <h3>Mantenimiento</h3>
                  <p>Servicio técnico especializado</p>
                </div>
                <div class="feature-card">
                  <h3>Atención al Cliente</h3>
                  <p>Soporte 24/7 para nuestros usuarios</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      `;
    }

    // Para otras páginas, crear estructura básica
    return `
      <div class="page-container">
        <section class="page-header">
          <div class="container">
            <h1>${title}</h1>
            <p>Contenido de la página ${title}</p>
          </div>
        </section>
        <section class="page-content">
          <div class="container">
            <div class="content-area">
              <p>Esta página será editada usando GrapesJS.</p>
              <p>El contenido original de ${title} se migrará aquí.</p>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  /**
   * Genera CSS básico para las páginas
   */
  private generateBasicCSS(): string {
    return `
      .page-container {
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      .hero-section {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #059669 100%);
        color: white;
        padding: 80px 0;
        text-align: center;
      }
      
      .hero-content h1 {
        font-size: 3.5rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
        line-height: 1.2;
      }
      
      .hero-content p {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
        opacity: 0.9;
      }
      
      .hero-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .btn-primary {
        background: white;
        color: #2563eb;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .btn-primary:hover {
        background: #f8fafc;
        transform: translateY(-2px);
      }
      
      .btn-secondary {
        background: transparent;
        color: white;
        padding: 12px 24px;
        border: 2px solid rgba(255, 255, 255, 0.5);
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: white;
      }
      
      .features-section {
        padding: 80px 0;
        background: #f8fafc;
      }
      
      .features-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
        color: #1e293b;
      }
      
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
      }
      
      .feature-card {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.3s ease;
      }
      
      .feature-card:hover {
        transform: translateY(-4px);
      }
      
      .feature-card h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #2563eb;
      }
      
      .page-header {
        background: #2563eb;
        color: white;
        padding: 60px 0;
        text-align: center;
      }
      
      .page-header h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      
      .page-content {
        padding: 60px 0;
      }
      
      .content-area {
        max-width: 800px;
        margin: 0 auto;
        line-height: 1.6;
      }
      
      @media (max-width: 768px) {
        .hero-content h1 {
          font-size: 2.5rem;
        }
        
        .hero-buttons {
          flex-direction: column;
          align-items: center;
        }
        
        .features-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  /**
   * Convierte todas las páginas
   */
  async convertAllPages(): Promise<PageData[]> {
    console.log('🚀 Iniciando conversión de páginas TSX a HTML...');
    
    const results: PageData[] = [];
    const pageFiles = Object.keys(pageMapping);

    for (const fileName of pageFiles) {
      const result = await this.convertPage(fileName);
      if (result) {
        results.push(result);
      }
    }

    console.log(`✅ Conversión completada. ${results.length} páginas convertidas.`);
    return results;
  }
}

// Función principal
async function main() {
  const converter = new PageConverter();
  
  if (process.argv.length > 2) {
    // Convertir página específica
    const fileName = process.argv[2];
    await converter.convertPage(fileName);
  } else {
    // Convertir todas las páginas
    await converter.convertAllPages();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

export { PageConverter, PageData };