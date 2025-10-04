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
  publishedHtml?: string;
  publishedCss?: string;
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

  // Priorizar contenido dinámico desde BD; usar estático solo como fallback
  useEffect(() => {
    const loadPage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Intentar cargar desde la BD (API pública)
        console.log('🔍 [PageRenderer] Intentando cargar desde BD:', slug);
        const response = await fetch(`/api/pages/public/${slug}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📊 [PageRenderer] Respuesta API:', result);
          const page = result?.data?.page || result?.data;

          console.log('📄 [PageRenderer] Tiene HTML dinámico:', !!page?.html);
          console.log('🎨 [PageRenderer] Tiene CSS dinámico:', !!page?.css);

          if (page && (page.html || page.publishedHtml)) {
            setDynamicPage(page);
            console.log('✅ [PageRenderer] Contenido cargado desde base de datos');
          } else {
            console.log('📄 [PageRenderer] No hay contenido dinámico publicado');
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

  // 🎯 RENDERIZADO DE PÁGINA DINÁMICA (prioridad)
  if (dynamicPage) {
    const htmlContent = dynamicPage.html || dynamicPage.publishedHtml || '';
    const cssContent = dynamicPage.css || dynamicPage.publishedCss || '';

    console.log('🎬 [PageRenderer] Renderizando:', htmlContent ? 'DINÁMICO' : 'ESTÁTICO');

    if (htmlContent) {
      return (
        <div>
          {/* CSS de la página */}
          {cssContent && (
            <style dangerouslySetInnerHTML={{ __html: cssContent }} />
          )}
          {/* HTML de la página */}
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      );
    }
  }

  // 🔄 FALLBACK: Buscar componente estático de React
  const PageComponent = pageComponents[slug.toLowerCase()];

  if (PageComponent) {
    console.log('✅ [PageRenderer] Usando componente estático de React');
    console.log('🎬 [PageRenderer] Renderizando:', 'ESTÁTICO');
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