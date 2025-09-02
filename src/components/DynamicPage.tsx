import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Loader2, AlertCircle, Wifi, WifiOff, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Layout from './Layout';
import Hero from './Hero';
import StatsCards from './StatsCards';
import ServicesSection from './ServicesSection';
import EditableLayout from './editor/EditableLayout';
import EditableHero from './editor/EditableHero';
import EditableStatsCards from './editor/EditableStatsCards';
import EditableServicesSection from './editor/EditableServicesSection';
import PublicViewNormalizer from './editor/PublicViewNormalizer';

// Interfaces
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

interface DynamicPageState {
  page: Page | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
  isOnline: boolean;
  lastFetch: Date | null;
}

// Detectar si estamos en modo desarrollo
const isDevelopment = import.meta.env.DEV;

const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const retryTimeoutRef = useRef<number | null>(null);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);
  
  const [state, setState] = useState<DynamicPageState>({
    page: null,
    loading: true,
    error: null,
    retryCount: 0,
    isOnline: navigator.onLine,
    lastFetch: null
  });

  const [debugMode, setDebugMode] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  
  // Detectar si estamos en modo editor
  const isEditorMode = location.pathname.includes('/admin/editor');

  // Detectar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      if (state.error && !state.loading) {
        fetchPage();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.error, state.loading]);

  // Limpiar timeouts y abort controllers al desmontar
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch de página con manejo robusto de errores
  const fetchPage = useCallback(async (forceRefresh = false) => {
    // Cancelar fetch anterior si existe
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    fetchAbortControllerRef.current = abortController;

    try {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null,
        retryCount: forceRefresh ? 0 : prev.retryCount
      }));
      
      // Si no hay slug, usar 'home' para la página de inicio
      // Determinar el slug basado en la ruta
      let pageSlug = slug;
      if (!pageSlug) {
        // Si no hay slug en params, extraerlo de la ruta
        const path = location.pathname;
        if (path === '/') {
          pageSlug = 'home';
        } else {
          // Remover el '/' inicial para obtener el slug
          pageSlug = path.substring(1);
        }
      }
      
      if (debugMode) {
        console.log('🔍 DynamicPage: Fetching page:', pageSlug);
        console.log('🔍 DynamicPage: Current location:', location.pathname);
      }
      
      const response = await fetch(`http://localhost:3001/api/pages/${pageSlug}`, {
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': forceRefresh ? 'no-cache' : 'default'
        }
      });
      
      if (debugMode) {
        console.log('🔍 DynamicPage: Response status:', response.status);
        console.log('🔍 DynamicPage: Response headers:', Object.fromEntries(response.headers.entries()));
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Página '${pageSlug}' no encontrada`);
        } else if (response.status >= 500) {
          throw new Error(`Error del servidor (${response.status}). Intenta de nuevo.`);
        } else {
          throw new Error(`Error al cargar la página (${response.status})`);
        }
      }
      
      const pageData = await response.json();
      
      if (debugMode) {
        console.log('🔍 DynamicPage: Page data received:', {
          id: pageData.id,
          title: pageData.title,
          slug: pageData.slug,
          published: pageData.published,
          contentLength: pageData.content?.length || 0
        });
      }
      
      // Validar estructura de datos
      if (!pageData || typeof pageData !== 'object') {
        throw new Error('Datos de página inválidos recibidos del servidor');
      }
      
      setState(prev => ({
        ...prev,
        page: pageData,
        loading: false,
        error: null,
        retryCount: 0,
        lastFetch: new Date()
      }));
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Fetch cancelado, no actualizar estado
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar la página';
      
      if (debugMode) {
        console.error('🔍 DynamicPage: Error fetching page:', err);
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));
      
      // Auto-retry con backoff exponencial para errores de red
      if (state.retryCount < 3 && state.isOnline) {
        const retryDelay = Math.min(1000 * Math.pow(2, state.retryCount), 10000);
        retryTimeoutRef.current = window.setTimeout(() => {
          fetchPage();
        }, retryDelay);
      }
    }
  }, [slug, location.pathname, debugMode, state.retryCount, state.isOnline]);

  // Efecto principal para cargar página
  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  // Sistema de sincronización en tiempo real
  useEffect(() => {
    if (!state.page || !isDevelopment) return;

    // Polling cada 5 segundos para verificar actualizaciones
    const pollInterval = setInterval(async () => {
      try {
        const pageSlug = state.page!.slug;
        const response = await fetch(`http://localhost:3001/api/pages/${pageSlug}`, {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const updatedPage = await response.json();
          
          // Verificar si hay cambios en el contenido o updatedAt
          if (state.page && (updatedPage.updatedAt !== state.page.updatedAt || 
              updatedPage.content !== state.page.content)) {
            
            if (debugMode) {
              console.log('🔄 DynamicPage: Contenido actualizado detectado, refrescando...');
            }
            
            setState(prev => ({
              ...prev,
              page: updatedPage,
              lastFetch: new Date()
            }));
          }
        }
      } catch (error) {
        if (debugMode) {
          console.log('🔄 DynamicPage: Error en polling:', error);
        }
      }
    }, 5000); // Polling cada 5 segundos

    return () => clearInterval(pollInterval);
  }, [state.page, debugMode, isDevelopment]);

  // Función para retry manual
  const handleRetry = () => {
    fetchPage(true);
  };

  // Función para toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  // Función para toggle metadata
  const toggleMetadata = () => {
    setShowMetadata(prev => !prev);
  };

  // Renderizar estado de carga
  if (state.loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-gray-600 font-medium">Cargando página...</p>
            <p className="text-sm text-gray-400">
              {slug ? `Página: ${slug}` : 'Página de inicio'}
            </p>
            {state.retryCount > 0 && (
              <p className="text-xs text-orange-500">
                Reintento {state.retryCount}/3
              </p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Renderizar estado de error
  if (state.error) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-[400px] space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {state.isOnline ? (
                <AlertCircle className="h-12 w-12 text-red-500" />
              ) : (
                <WifiOff className="h-12 w-12 text-gray-500" />
              )}
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {state.isOnline ? 'Error al cargar la página' : 'Sin conexión'}
              </h1>
              <p className="text-gray-600 max-w-md">{state.error}</p>
              
              {!state.isOnline && (
                <p className="text-sm text-gray-500">
                  Verifica tu conexión a internet e intenta de nuevo.
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={handleRetry}
                disabled={state.loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
                {state.loading ? 'Cargando...' : 'Reintentar'}
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Ir al inicio
              </button>
            </div>
            
            {debugMode && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left max-w-md">
                <strong>Debug Info:</strong><br/>
                Slug: {slug || 'home'}<br/>
                Retry Count: {state.retryCount}<br/>
                Online: {state.isOnline ? 'Yes' : 'No'}<br/>
                Last Fetch: {state.lastFetch?.toLocaleTimeString() || 'Never'}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Verificar si la página existe
  if (!state.page) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-gray-400" />
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Página no encontrada</h1>
            <p className="text-gray-600">La página que buscas no existe.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Verificar si la página está publicada
  if (!state.page.published) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
          <EyeOff className="h-12 w-12 text-gray-400" />
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Página no disponible</h1>
            <p className="text-gray-600">Esta página no está publicada actualmente.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Renderizar página de inicio con componentes especiales
  if (state.page.slug === 'home') {
    // Seleccionar componentes según el modo
    const LayoutComponent = isEditorMode ? EditableLayout : Layout;
    const HeroComponent = isEditorMode ? EditableHero : Hero;
    const StatsCardsComponent = isEditorMode ? EditableStatsCards : StatsCards;
    const ServicesSectionComponent = isEditorMode ? EditableServicesSection : ServicesSection;
    
    return (
      <LayoutComponent>
        {/* Controles de debug (solo en desarrollo) */}
        {isDevelopment && (
          <div className="fixed top-4 right-4 z-50 flex gap-2">
            <button
              onClick={toggleDebugMode}
              className={`p-2 rounded-full ${debugMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} hover:bg-blue-700 transition-colors`}
              title="Toggle Debug Mode"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={toggleMetadata}
              className={`p-2 rounded-full ${showMetadata ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'} hover:bg-green-700 transition-colors`}
              title="Toggle Metadata"
            >
              <Wifi className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Metadata de debug */}
        {showMetadata && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="text-sm">
              <strong>Página:</strong> {state.page.title} (ID: {state.page.id})<br/>
              <strong>Slug:</strong> {state.page.slug}<br/>
              <strong>Publicada:</strong> {state.page.published ? 'Sí' : 'No'}<br/>
              <strong>Última actualización:</strong> {new Date(state.page.updatedAt).toLocaleString()}<br/>
              <strong>Contenido:</strong> {state.page.content?.length || 0} caracteres
            </div>
          </div>
        )}
        
        {/* Componentes especiales para home */}
        <HeroComponent />
        <StatsCardsComponent />
        <ServicesSectionComponent />
        
        {/* Contenido adicional de la base de datos */}
        {state.page.content && state.page.content.trim() && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <PublicViewNormalizer content={state.page.content} />
          </div>
        )}
        
        {debugMode && (
          <div className="max-w-4xl mx-auto px-4 py-4">
            <details className="bg-gray-100 p-4 rounded">
              <summary className="cursor-pointer font-medium">Debug: Raw Content</summary>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(state.page, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </LayoutComponent>
    );
  }

  // Renderizar página regular
  return (
    <Layout>
      {/* Controles de debug (solo en desarrollo) */}
      {isDevelopment && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={toggleDebugMode}
            className={`p-2 rounded-full ${debugMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} hover:bg-blue-700 transition-colors`}
            title="Toggle Debug Mode"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={toggleMetadata}
            className={`p-2 rounded-full ${showMetadata ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'} hover:bg-green-700 transition-colors`}
            title="Toggle Metadata"
          >
            <Wifi className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Metadata de debug */}
        {showMetadata && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="text-sm">
              <strong>Página:</strong> {state.page.title} (ID: {state.page.id})<br/>
              <strong>Slug:</strong> {state.page.slug}<br/>
              <strong>Publicada:</strong> {state.page.published ? 'Sí' : 'No'}<br/>
              <strong>Última actualización:</strong> {new Date(state.page.updatedAt).toLocaleString()}<br/>
              <strong>Contenido:</strong> {state.page.content?.length || 0} caracteres
            </div>
          </div>
        )}
        
        {/* Título de la página */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{state.page.title}</h1>
        
        {/* Contenido de la página */}
        {state.page.content && state.page.content.trim() ? (
          <PublicViewNormalizer content={state.page.content} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Esta página no tiene contenido aún.</p>
          </div>
        )}
        
        {debugMode && (
          <div className="mt-8">
            <details className="bg-gray-100 p-4 rounded">
              <summary className="cursor-pointer font-medium">Debug: Raw Content</summary>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(state.page, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DynamicPage;