import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Importar todas las páginas estáticas
import HomePage from '../pages/HomePage';
import Contacto from '../pages/Contacto';
import QuienesSomos from '../pages/QuienesSomos';
import InformacionESAL from '../pages/InformacionESAL';
import Normatividad from '../pages/Normatividad';
import OperacionGestion from '../pages/OperacionGestion';
import PortalUsuario from '../pages/PortalUsuario';
import InvoicePage from '../pages/InvoicePage';
import InvoiceQuery from '../pages/InvoiceQuery';

// Mapeo de slugs a componentes estáticos (fallback)
const pageComponents: Record<string, React.ComponentType> = {
  'home': HomePage,
  'contacto': Contacto,
  'quienes-somos': QuienesSomos,
  'informacion-esal': InformacionESAL,
  'normatividad': Normatividad,
  'operacion-gestion': OperacionGestion,
  'portal-usuario': PortalUsuario,
  'invoice': InvoicePage,
  'invoice-query': InvoiceQuery,
  // Alias adicionales
  'inicio': HomePage,
  'nosotros': QuienesSomos,
  'contactanos': Contacto,
  'portal': PortalUsuario,
};

interface DynamicPageData {
  id: number;
  title: string;
  slug: string;
  html?: string;
  css?: string;
  gjsHtml?: string;
  gjsCss?: string;
  content?: string;
  grapesData?: string;
}

const PageRenderer: React.FC = () => {
  const { slug = 'home' } = useParams<{ slug: string }>();
  const [dynamicPage, setDynamicPage] = useState<DynamicPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si existe página estática primero, luego cargar dinámica si no existe
  useEffect(() => {
    const loadPage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Verificar si existe componente estático
        const StaticComponent = pageComponents[slug];
        if (StaticComponent) {
          console.log('📄 [PageRenderer] Usando página estática de React:', slug);
          setDynamicPage(null);
          setIsLoading(false);
          return;
        }

        // 2. Si no existe página estática, buscar en la base de datos
        console.log('📄 [PageRenderer] No hay página estática, buscando en BD:', slug);
        const response = await fetch(`/api/pages/slug/${slug}`);
        
        if (response.ok) {
          const data = await response.json();
          const page = data.data?.page || data.data;
          
          if (page) {
            console.log('📄 [PageRenderer] Página dinámica encontrada:', {
              id: page.id,
              title: page.title,
              slug: page.slug,
              hasHtml: !!page.html,
              hasCss: !!page.css,
              hasGrapesData: !!page.grapesData,
              hasGjsHtml: !!page.gjsHtml,
              hasGjsCss: !!page.gjsCss,
              hasContent: !!page.content
            });
            
            setDynamicPage(page);
          } else {
            console.log('📄 [PageRenderer] No se encontró página dinámica');
            setDynamicPage(null);
          }
        } else if (response.status === 404) {
          console.log('📄 [PageRenderer] Página no encontrada en BD');
          setDynamicPage(null);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        console.error('❌ [PageRenderer] Error al cargar página:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setDynamicPage(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando página...</p>
        </div>
      </div>
    );
  }

  // Si hay error y no hay página estática, mostrar error
  if (error && !pageComponents[slug.toLowerCase()]) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Error al cargar la página</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/" 
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    );
  }

  // 🎯 RENDERIZADO DE PÁGINA DINÁMICA (prioriza gjsHtml/gjsCss)
  if (dynamicPage) {
    let htmlContent = '';
    let cssContent = '';

    // Prioridad 1: gjsHtml/gjsCss
    if (dynamicPage.gjsHtml) {
      htmlContent = dynamicPage.gjsHtml;
      cssContent = dynamicPage.gjsCss || '';
      console.log('✅ [PageRenderer] Usando gjsHtml + gjsCss');
    }
    // Prioridad 2: HTML y CSS directos
    else if (dynamicPage.html || dynamicPage.css) {
      htmlContent = dynamicPage.html || '';
      cssContent = dynamicPage.css || '';
      console.log('✅ [PageRenderer] Usando HTML + CSS directos');
    }
    // Fallback: extraer HTML y CSS de grapesData si no hay directos
    else if (dynamicPage.grapesData) {
      try {
        const grapesData = JSON.parse(dynamicPage.grapesData);
        htmlContent = grapesData['gjs-html'] || grapesData.html || '';
        cssContent = grapesData['gjs-css'] || grapesData.css || '';
        console.log('✅ [PageRenderer] Usando HTML + CSS extraídos de grapesData');
      } catch (parseError) {
        console.error('❌ [PageRenderer] Error parseando grapesData:', parseError);
      }
    }
    // Último fallback: contenido simple (legacy)
    else if (dynamicPage.content) {
      htmlContent = dynamicPage.content;
      cssContent = '';
      console.log('✅ [PageRenderer] Usando content (legacy)');
    }

    // Renderizar página dinámica con HTML + CSS
    if (htmlContent) {
      return (
        <>
          {/* CSS de la página */}
          {cssContent && <style>{cssContent}</style>}
          
          {/* HTML de la página */}
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </>
      );
    }
  }

  // 🔄 FALLBACK: Buscar componente estático de React
  const PageComponent = pageComponents[slug.toLowerCase()];

  if (PageComponent) {
    console.log('✅ [PageRenderer] Usando componente estático de React');
    return <PageComponent />;
  }

  // 404: No se encontró ni página dinámica ni componente estático
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-6">
          La página "{slug}" no existe o no está disponible.
        </p>
        <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded">
          <strong>Páginas estáticas disponibles:</strong><br/>
          {Object.keys(pageComponents).join(', ')}
        </div>
        <a 
          href="/" 
          className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  );
};

export default PageRenderer;