import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

export default function DynamicPage() {
  const { slug } = useParams();
  const [pageContent, setPageContent] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchPage(slug);
    }
  }, [slug]);

  const fetchPage = async (slug: string) => {
    try {
      const response = await fetch(`/api/pages/${slug}`);
      
      if (response.ok) {
        const data = await response.json();
        setPageContent(data.content);
        setPageTitle(data.title);
        setMetaDescription(data.metaDescription || '');
        
        // Actualizar meta tags
        document.title = data.title;
        if (data.metaDescription) {
          const metaTag = document.querySelector('meta[name="description"]');
          if (metaTag) {
            metaTag.setAttribute('content', data.metaDescription);
          } else {
            const newMetaTag = document.createElement('meta');
            newMetaTag.name = 'description';
            newMetaTag.content = data.metaDescription;
            document.head.appendChild(newMetaTag);
          }
        }
      } else {
        setError('Página no encontrada');
      }
    } catch (error) {
      setError('Error al cargar la página');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-64 py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        </div>
      </div>
    </Layout>
  );
}