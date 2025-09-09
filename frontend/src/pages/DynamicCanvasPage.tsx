import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getPageBySlug } from '../utils/database';
import { CanvasRenderer, useCanvasRenderer } from '../components/CanvasRenderer';
import { Page } from '../types/database';
import Layout from '../components/Layout';

interface DynamicCanvasPageProps {
  slug?: string; // Para páginas con slug fijo
}

export const DynamicCanvasPage: React.FC<DynamicCanvasPageProps> = ({ slug: fixedSlug }) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determinar el slug a usar
  const slug = fixedSlug || paramSlug || (location.pathname === '/' ? 'home' : location.pathname.slice(1));

  // Usar el hook de CanvasRenderer
  const { canvasPage, isLoading: isCanvasLoading, error: canvasError } = useCanvasRenderer(pageData);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const page = await getPageBySlug(slug);
        
        if (!page) {
          throw new Error(`Página no encontrada: ${slug}`);
        }
        
        setPageData(page);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, [slug]);

  // Estados de carga y error
  if (isLoading || isCanvasLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando página...</p>
            <p className="text-sm text-gray-400 mt-2">Slug: {slug}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || canvasError) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar la página</h1>
            <p className="text-gray-600 mb-4">{error || canvasError}</p>
            <p className="text-sm text-gray-400 mb-4">Slug: {slug}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Si hay Canvas page, renderizar con CanvasRenderer
  if (canvasPage) {
    return (
      <Layout>
        <div className="min-h-screen">
          <CanvasRenderer 
            page={canvasPage} 
            className="public-canvas-page"
          />
        </div>
      </Layout>
    );
  }

  // Si no hay Canvas pero sí contenido HTML, renderizar HTML
  if (pageData?.content) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="page-content max-w-4xl mx-auto px-4 py-8">
            <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
          </div>
        </div>
      </Layout>
    );
  }

  // Fallback si no hay contenido
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Página no encontrada</h1>
          <p className="text-gray-600">La página que buscas no existe o no tiene contenido.</p>
          <p className="text-sm text-gray-400 mt-4">Slug: {slug}</p>
        </div>
      </div>
    </Layout>
  );
};

// Componentes específicos para cada página
export const HomePage = () => <DynamicCanvasPage slug="home" />;
export const QuienesSomosPage = () => <DynamicCanvasPage slug="quienes-somos" />;
export const InformacionESALPage = () => <DynamicCanvasPage slug="informacion-esal" />;
export const OperacionGestionPage = () => <DynamicCanvasPage slug="operacion-gestion" />;
export const NormatividadPage = () => <DynamicCanvasPage slug="normatividad" />;
export const PortalUsuarioPage = () => <DynamicCanvasPage slug="portal-usuario" />;
export const ContactoPage = () => <DynamicCanvasPage slug="contacto" />;

export default DynamicCanvasPage;