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
      <script src="https://cdn.tailwindcss.com"></script> 
      <div id="page-wrapper" className="w-full min-h-screen">
        <style>{css}</style>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </> 
  ); 
}