import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from './Layout';
import Hero from './Hero';
import StatsCards from './StatsCards';
import ServicesSection from './ServicesSection';
import { Loader2 } from 'lucide-react';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Si no hay slug, usar 'home' para la página de inicio
        const pageSlug = slug || 'home';
        
        const response = await fetch(`http://localhost:3001/api/pages/${pageSlug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Página no encontrada');
          } else {
            setError('Error al cargar la página');
          }
          return;
        }
        
        const pageData = await response.json();
        setPage(pageData);
      } catch (err) {
        setError('Error de conexión');
        console.error('Error fetching page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando página...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!page || !page.published) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
            <p className="text-gray-600">La página que buscas no existe o no está publicada.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ✅ 2. Mejora del DynamicPage para mostrar páginas con el mismo estilo
  // Ahora `DynamicPage` detecta si es la página de inicio y renderiza los mismos componentes que la página estática:
  if (page.slug === 'home' || page.slug === '/') {
    return (
      <Layout>
        <Hero />
        <StatsCards />
        <ServicesSection />
        {/* Contenido adicional de la base de datos si existe */}
        {page.content && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        )}
      </Layout>
    );
  }

  // Para otras páginas, mostrar solo el contenido
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{page.title}</h1>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </Layout>
  );
}