import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface PageData {
  id: string;
  title: string;
  slug: string;
  content?: string;
  html?: string;
  css?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
}

interface PageRendererProps {
  slug?: string;
}

const PageRenderer: React.FC<PageRendererProps> = ({ slug: propSlug }) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug;
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('No se especificó el slug de la página');
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/pages/slug/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Página no encontrada');
          } else {
            setError('Error al cargar la página');
          }
          return;
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.page) {
          const page = result.data.page;
          
          setPageData(page);
          
          // Actualizar meta tags si están disponibles
          if (page.metaTitle) {
            document.title = page.metaTitle;
          } else if (page.title) {
            document.title = page.title;
          }
          
          if (page.metaDescription) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
              metaDesc = document.createElement('meta');
              metaDesc.setAttribute('name', 'description');
              document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', page.metaDescription);
          }
        } else {
          setError('Error al procesar los datos de la página');
        }
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Error de conexión al cargar la página');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug]);

  // Función para renderizar el contenido HTML
  const renderContent = () => {
    if (!pageData) return null;

    // Priorizar HTML compilado sobre content
    const htmlContent = pageData.html || pageData.content;
    
    if (!htmlContent) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-gray-600">Esta página no tiene contenido disponible.</p>
        </div>
      );
    }

    return (
      <div className="page-content">
        {/* Inyectar CSS si está disponible */}
        {pageData.css && (
          <style dangerouslySetInnerHTML={{ __html: pageData.css }} />
        )}
        
        {/* Renderizar HTML */}
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando página...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return renderContent();
};

export default PageRenderer;