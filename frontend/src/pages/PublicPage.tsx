import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface PageData { 
  id: string; 
  slug: string; 
  title: string; 
  html: string; 
  css: string; 
  isPublished: boolean; 
} 

export default function PublicPage() { 
  const { slug } = useParams<{ slug: string }>(); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 
  const [html, setHtml] = useState<string>('');
  const [css, setCss] = useState<string>('');

  useEffect(() => { 
    loadPage(); 
  }, [slug]); 

  const loadPage = async () => { 
    try { 
      setLoading(true); 
      const response = await fetch(`/api/pages/public/${slug}`); 
      const result = await response.json(); 

      if (!result.success) { 
        setError(result.error); 
        return; 
      } 

      const { html, css } = result.data as PageData;

      console.log('HTML recibido:', (html || '').substring(0, 100));
      console.log('CSS recibido:', (css || '').substring(0, 100));

      setHtml(html || '');
      setCss(css || '');
    } catch (err) { 
      setError('Error al cargar la página'); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  if (loading) { 
    return ( 
      <div className="flex items-center justify-center min-h-screen"> 
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div> 
      </div> 
    ); 
  } 

  if (error) { 
    return ( 
      <div className="flex items-center justify-center min-h-screen"> 
        <div className="text-center"> 
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2> 
          <p className="text-gray-600">{error}</p> 
        </div> 
      </div> 
    ); 
  } 

  return ( 
    <> 
      <link rel="stylesheet" href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" />
      {/* CSS básico de GrapesJS para columnas en público (solicitado) */}
      <style>{`
        .gjs-row {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
        }

        .gjs-cell {
          flex: 1 1 50%;
          padding: 10px;
          min-width: 300px;
          box-sizing: border-box;
        }
      `}</style>
      <div id="page-wrapper" className="w-full min-h-screen">
        {/* Parche seguro para clases de preset GrapesJS en público */}
        <style>{`
          .gjs-row, .gjs-blocks-row, .gjs-columns {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 1rem;
          }
          .gjs-cell, .gjs-col, .gjs-column {
            flex: 1 1 0;
            min-width: 200px;
          }
          .gjs-row img, .gjs-cell img {
            max-width: 100%;
            height: auto;
            display: block;
          }
        `}</style>
        {/* Parche fuerte solicitado: asegurar layout exacto con !important */}
        <style>{`
          /* Parche fuerte: asegurar que el público se vea igual al editor */
          .gjs-row {
            display: flex !important;
            flex-wrap: wrap !important;
            width: 100% !important;
          }

          .gjs-cell {
            flex: 1 1 50% !important;
            padding: 10px !important;
            min-width: 300px !important;
            box-sizing: border-box !important;
          }

          /* Opcional: por si aparece gjs-columns/gjs-col */
          .gjs-columns {
            display: flex !important;
            flex-wrap: wrap !important;
            width: 100% !important;
          }

          .gjs-col {
            flex: 1 1 50% !important;
            padding: 10px !important;
            min-width: 300px !important;
            box-sizing: border-box !important;
          }
        `}</style>
        <style>{css}</style>
        <div className="editor-content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </> 
  ); 
}