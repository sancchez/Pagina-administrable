import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import grapesjs from 'grapesjs';
import { processIconsInHtml } from './iconMapper.js';

// Importar componentes de páginas
import QuienesSomos from '../pages/QuienesSomos';
import HomePage from '../pages/HomePage';
import Contacto from '../pages/Contacto';
import InformacionESAL from '../pages/InformacionESAL';
import Normatividad from '../pages/Normatividad';
import OperacionGestion from '../pages/OperacionGestion';
import PortalUsuario from '../pages/PortalUsuario';
import InvoicePage from '../pages/InvoicePage';
import InvoiceQuery from '../pages/InvoiceQuery';

// Mapeo de slugs a componentes
const pageComponents: Record<string, React.ComponentType> = {
  'quienes-somos': QuienesSomos,
  'home': HomePage,
  'inicio': HomePage,
  'contacto': Contacto,
  'informacion-esal': InformacionESAL,
  'normatividad': Normatividad,
  'operacion-gestion': OperacionGestion,
  'portal-usuario': PortalUsuario,
  'invoice': InvoicePage,
  'invoice-query': InvoiceQuery,
};

/**
 * Renderiza un componente TSX a HTML estático
 */
export function renderTsxToHtml(slug: string): string {
  console.log(`🔄 Renderizando TSX para slug: ${slug}`);
  const Component = pageComponents[slug];
  
  if (!Component) {
    console.error(`❌ Componente no encontrado para el slug: ${slug}`);
    console.log('📋 Componentes disponibles:', Object.keys(pageComponents));
    
    // Fallback para slugs no encontrados
    return `
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">Página en Construcción</h1>
          <p class="text-lg text-gray-600">Esta página está siendo migrada al nuevo sistema.</p>
        </div>
      </div>
    `;
  }

  try {
    console.log(`✅ Componente encontrado para ${slug}, renderizando con ReactDOMServer...`);
    
    // Renderizar el componente TSX a HTML puro usando ReactDOMServer con MemoryRouter
    let html = renderToStaticMarkup(
      React.createElement(MemoryRouter, { initialEntries: [`/${slug}`] },
        React.createElement(Component)
      )
    );
    
    console.log(`✅ HTML renderizado exitosamente para ${slug}, longitud: ${html.length}`);
    console.log(`📄 Primeros 200 caracteres:`, html.substring(0, 200));
    
    // 🔧 SOLUCIÓN: Convertir iconos de lucide-react a SVG real
    console.log(`🔄 Procesando iconos de lucide-react...`);
    html = processIconsInHtml(html);
    console.log(`✅ Iconos procesados, nueva longitud: ${html.length}`);
    
    return html;
  } catch (error) {
    console.error(`❌ Error renderizando componente ${slug}:`, error);
    
    // Fallback en caso de error
    return `
      <div class="min-h-screen bg-red-50 flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-red-800 mb-4">Error de Renderizado</h1>
          <p class="text-lg text-red-600">Hubo un problema al renderizar esta página.</p>
          <p class="text-sm text-red-500 mt-2">Error: ${error}</p>
        </div>
      </div>
    `;
  }
}

export function generateGrapesJSBlocks(slug: string): { components: any[], styles: any[] } {
  console.log(`🎨 Generando bloques GrapesJS para slug: ${slug}`);
  
  const html = renderTsxToHtml(slug);
  
  // Crear un contenedor temporal para GrapesJS
  const tempContainer = document.createElement('div');
  tempContainer.id = 'temp-grapesjs-container';
  tempContainer.style.display = 'none';
  document.body.appendChild(tempContainer);

  try {
    // Inicializar GrapesJS temporalmente
    const editor = grapesjs.init({
      container: tempContainer,
      fromElement: false,
      storageManager: false,
      plugins: ['gjs-blocks-basic'],
      pluginsOpts: {
        'gjs-blocks-basic': {}
      }
    });

    // Establecer el HTML renderizado
    editor.setComponents(html);

    // Extraer componentes y estilos
    const components = editor.getComponents().toJSON();
    const styles = editor.getStyle().toJSON();

    // Limpiar
    editor.destroy();
    document.body.removeChild(tempContainer);

    console.log(`✅ Bloques GrapesJS generados para ${slug}:`, components.length, 'componentes,', styles.length, 'estilos');
    
    return { components, styles };
  } catch (error) {
    console.error('❌ Error generando bloques GrapesJS:', error);
    
    // Limpiar en caso de error
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
    
    return { components: [], styles: [] };
  }
}

// Nueva función para extraer gjsComponents y gjsStyles directamente del HTML renderizado
export function extractGrapesJSData(html: string): { gjsComponents: any[], gjsStyles: any[] } {
  console.log(`🔧 Extrayendo datos GrapesJS del HTML renderizado...`);
  
  // Crear un contenedor temporal para GrapesJS
  const tempContainer = document.createElement('div');
  tempContainer.id = 'temp-grapesjs-extractor';
  tempContainer.style.display = 'none';
  document.body.appendChild(tempContainer);

  try {
    // Inicializar GrapesJS temporalmente
    const editor = grapesjs.init({
      container: tempContainer,
      fromElement: false,
      storageManager: false,
      plugins: ['gjs-blocks-basic'],
      pluginsOpts: {
        'gjs-blocks-basic': {}
      }
    });

    // Establecer el HTML renderizado
    editor.setComponents(html);

    // Extraer componentes y estilos en formato JSON
    const gjsComponents = editor.getComponents().toJSON();
    const gjsStyles = editor.getStyle().toJSON();

    // Limpiar
    editor.destroy();
    document.body.removeChild(tempContainer);

    console.log(`✅ Datos GrapesJS extraídos:`, gjsComponents.length, 'componentes,', gjsStyles.length, 'estilos');
    console.log(`📋 Ejemplo de componente:`, gjsComponents[0]);
    
    return { gjsComponents, gjsStyles };
  } catch (error) {
    console.error('❌ Error extrayendo datos GrapesJS:', error);
    
    // Limpiar en caso de error
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
    
    return { gjsComponents: [], gjsStyles: [] };
  }
}

/**
 * Obtiene metadatos de la página basados en el slug
 */
export function getPageMetadata(slug: string) {
  const metadata: Record<string, any> = {
    'quienes-somos': {
      title: 'Quiénes Somos',
      metaTitle: 'Quiénes Somos - Nuestra Historia y Misión',
      metaDescription: 'Conoce nuestra historia, misión, visión y valores. Más de 25 años brindando servicios públicos de excelencia.',
      metaKeywords: 'quienes somos, historia, misión, visión, valores, servicios públicos'
    },
    'home': {
      title: 'Inicio',
      metaTitle: 'Inicio - Servicios Públicos de Calidad',
      metaDescription: 'Bienvenido a nuestro portal de servicios públicos. Agua potable y saneamiento básico de calidad.',
      metaKeywords: 'inicio, servicios públicos, agua potable, saneamiento'
    },
    'contacto': {
      title: 'Contacto',
      metaTitle: 'Contacto - Comunícate con Nosotros',
      metaDescription: 'Ponte en contacto con nosotros. Estamos aquí para ayudarte con tus consultas y solicitudes.',
      metaKeywords: 'contacto, comunicación, atención al cliente'
    }
  };

  return metadata[slug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    metaTitle: slug.charAt(0).toUpperCase() + slug.slice(1),
    metaDescription: `Página de ${slug}`,
    metaKeywords: slug
  };
}