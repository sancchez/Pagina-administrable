import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface PreviewFrameProps {
  slug?: string;
}

const PreviewFrame = ({ slug: propSlug }: PreviewFrameProps) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const [pageContent, setPageContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = propSlug || paramSlug;

  useEffect(() => {
    if (!slug) {
      setError('No se especificó una página para previsualizar');
      setLoading(false);
      return;
    }

    fetchPageContent();
  }, [slug]);

  const fetchPageContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar obtener la página desde la API
      const response = await fetch(`/api/pages/slug/${slug}`);
      
      if (response.ok) {
        const json = await response.json();
        const page = json.data?.page || json.data;

        if (!page) {
          setError('La página no tiene contenido disponible');
          setLoading(false);
          return;
        }

        // Prioridad 1: gjsHtml/gjsCss
        if (page.gjsHtml) {
          const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>${page.title || 'Vista previa'}</title>
              <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                ${page.gjsCss || ''}
              </style>
            </head>
            <body>
              ${page.gjsHtml}
            </body>
            </html>
          `;
          setPageContent(fullHtml);
        }
        // Prioridad 2: html/css directos
        else if (page.html || page.css) {
          const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>${page.title || 'Vista previa'}</title>
              <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                ${page.css || ''}
              </style>
            </head>
            <body>
              ${page.html || ''}
            </body>
            </html>
          `;
          setPageContent(fullHtml);
        }
        // Fallback: grapesData
        else if (page.grapesData) {
          try {
            const grapesData = JSON.parse(page.grapesData);
            const fullHtml = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>${page.title || 'Vista previa'}</title>
                <style>
                  body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                  ${grapesData['gjs-css'] || grapesData.css || ''}
                </style>
              </head>
              <body>
                ${grapesData['gjs-html'] || grapesData.html || ''}
              </body>
              </html>
            `;
            setPageContent(fullHtml);
          } catch (parseError) {
            console.error('Error parsing GrapesJS data:', parseError);
            setError('Error al procesar los datos de la página');
          }
        }
        // Último fallback: content
        else if (page.content) {
          setPageContent(page.content);
        } else {
          setError('La página no tiene contenido disponible');
        }
      } else if (response.status === 404) {
        setError('Página no encontrada');
      } else {
        setError('Error al cargar la página');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      setError('Error de conexión al cargar la página');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando vista previa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error de Vista Previa</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPageContent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <iframe
        srcDoc={pageContent}
        className="w-full h-full border-0"
        title={`Vista previa de ${slug}`}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default PreviewFrame;