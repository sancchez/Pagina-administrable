import React, { Suspense, useCallback, useEffect, useState, lazy } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { useParams } from 'react-router-dom';
import { Eye, Users } from 'lucide-react';

// Import error handling components
import ErrorBoundary from '../components/ErrorBoundary';
import { useErrorBoundary } from '../hooks/useErrorBoundary';
import { handleError } from '../utils/errorHandler';

// Import your components
import { TextComponent, ImageComponent, contentResolver, ContainerComponent, ButtonComponent } from '../components/content';

// Import HTTP utility
import HttpClient from '../utils/http';

// Import data converter
import { convertToFormat, detectDataFormat } from '../services/dataConverter';

// Lazy load visual tools para mejorar rendimiento inicial
const ElementToolbar = lazy(() => import('./components/editor/VisualTools').then(module => ({ default: module.ElementToolbar })));
const SelectionIndicator = lazy(() => import('./components/editor/VisualTools').then(module => ({ default: module.SelectionIndicator })));
const AlignmentGuides = lazy(() => import('./components/editor/VisualTools').then(module => ({ default: module.AlignmentGuides })));
const LayersPanel = lazy(() => import('./components/editor/VisualTools').then(module => ({ default: module.LayersPanel })));
const ViewTools = lazy(() => import('./components/editor/VisualTools').then(module => ({ default: module.ViewTools })));
const RealTimePreview = lazy(() => import('./components/editor/RealTimePreview').then(module => ({ default: module.RealTimePreview })));

// Lazy load collaboration components
const CollaborationPanel = lazy(() => import('../components/collaboration/CollaborationPanel'));
const CollaborationCursors = lazy(() => import('../components/collaboration/CollaborationCursors'));

// Lazy load block components para mejorar tiempo de carga inicial
const HeroBlock = lazy(() => import('../components/blocks/HeroBlock'));
const ContactBlock = lazy(() => import('../components/blocks/ContactBlock'));
const TeamBlock = lazy(() => import('../components/blocks/TeamBlock'));
const FormBlock = lazy(() => import('../components/blocks').then(module => ({ default: module.FormBlock })));
const GalleryBlock = lazy(() => import('../components/blocks').then(module => ({ default: module.GalleryBlock })));
const MapBlock = lazy(() => import('../components/blocks').then(module => ({ default: module.MapBlock })));
const TableBlock = lazy(() => import('../components/blocks').then(module => ({ default: module.TableBlock })));
const SliderBlock = lazy(() => import('../components/blocks').then(module => ({ default: module.SliderBlock })));

import { CollaborationProvider, useCollaboration } from '../context/CollaborationContext';

// Block Components for the new architecture
import {
  HeroProps,
  ContactBlockProps,
  TeamBlockProps,
  StatsBlockProps,
  ServicesBlockProps,
  GalleryBlockProps,
  SliderBlockProps,
  MapBlockProps,
  DocumentsBlockProps,
  FormBlockProps,
  TableProps,
  RichTextProps,
  ImageProps,
  VideoProps,
  ButtonProps,
  ContainerProps
} from '../types/blocks';

// Union type for all possible block props
type BlockPropsUnion = 
  | HeroProps
  | ContactBlockProps
  | TeamBlockProps
  | StatsBlockProps
  | ServicesBlockProps
  | GalleryBlockProps
  | SliderBlockProps
  | MapBlockProps
  | DocumentsBlockProps
  | FormBlockProps
  | TableProps
  | RichTextProps
  | ImageProps
  | VideoProps
  | ButtonProps
  | ContainerProps
  | Record<string, unknown>; // Fallback for unknown blocks

interface BlockProps {
  type: string;
  props: BlockPropsUnion;
  children?: BlockProps[];
}

// Hero Block Component ya está importado desde '../components/blocks/HeroBlock'

// TextBlock ya está importado desde '../components/TextBlock'

// ImageBlock ya está importado desde '../components/ImageBlock'

// Block Renderer - renders JSON blocks as React components
const BlockRenderer: React.FC<{ block: BlockProps }> = ({ block }) => {
  console.log('🔧 [BlockRenderer] Rendering block:', block.type, block.props);
  
  try {
    switch (block.type) {
      case 'HeroBlock':
        return <HeroBlock {...block.props} />;
      case 'TextBlock':
        return <TextComponent {...block.props} />;
      case 'ImageBlock':
        return <ImageComponent {...block.props} />;
      case 'ContactBlock':
        return <ContactBlock {...block.props} />;
      case 'TeamBlock':
        return <TeamBlock {...block.props} />;
      default:
        console.warn('⚠️ [BlockRenderer] Unknown block type:', block.type);
        return (
          <div className="unknown-block bg-red-100 border border-red-300 p-4 rounded">
            <p className="text-red-600">Bloque desconocido: {block.type}</p>
            <pre className="text-xs mt-2">{JSON.stringify(block.props, null, 2)}</pre>
          </div>
        );
    }
  } catch (error) {
    console.error('❌ [BlockRenderer] Error rendering block:', error, block);
    return (
      <div className="error-block bg-red-100 border border-red-300 p-4 rounded">
        <p className="text-red-600">Error renderizando bloque: {String(error)}</p>
      </div>
    );
  }
};

// Page Renderer - renders complete page from JSON
// Professional Editor Layout Component
const EditorLayout: React.FC = () => {
  const { actions, query, enabled } = useEditor((state, query) => ({
    enabled: state.options.enabled
  }));
  const { connect, disconnect } = useCollaboration();
  const { errorState, captureError, resetError } = useErrorBoundary(3, 'EditorLayout');

  const { slug } = useParams<{ slug: string }>();
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [selectedTool, setSelectedTool] = useState<string>('select'); // Not used
  const [currentPageSlug, setCurrentPageSlug] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [pageTitle, setPageTitle] = useState<string>('Editor');
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  // const [publishing, setPublishing] = useState(false); // Not used
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  
  const togglePreview = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview]);
  
  const toggleCollaboration = useCallback(() => {
    setShowCollaboration(!showCollaboration);
  }, [showCollaboration]);
  
  // Save page data to backend
  const savePageData = useCallback(async () => {
    if (!currentPageSlug || !pageData) {
      console.warn('⚠️ [Editor] Cannot save: missing slug or page data');
      return;
    }

    try {
      setSaving(true);
      setSaveStatus('saving');
      console.log('💾 [Editor] Saving page data:', pageData);

      // Convertir datos de Craft.js a formato legacy para el backend
      const legacyData = convertToFormat(pageData, 'legacy');
      console.log('🔄 [Editor] Converted to legacy format:', legacyData);

      const response = await HttpClient.post(`/api/admin/pages/${currentPageSlug}/save`, {
        title: pageTitle,
        draft_json: JSON.stringify(legacyData),
        slug: currentPageSlug
      });

      console.log('✅ [Editor] Page saved successfully:', response);
      setSaveStatus('saved');
      setNotification({ type: 'success', message: 'Página guardada exitosamente' });
      setTimeout(() => {
        setSaveStatus('idle');
        setNotification(null);
      }, 3000);
    } catch (error: any) {
      console.error('❌ [Editor] Error saving page:', error);
      
      // Use enhanced error handling system
      captureError(error, {
        context: 'savePageData',
        pageSlug: currentPageSlug,
        operation: 'page_save',
        pageData: pageData
      });
      
      setSaveStatus('error');
      setError(`Error guardando página: ${error.message}`);
      setNotification({ type: 'error', message: 'Error al guardar la página' });
      setTimeout(() => {
        setSaveStatus('idle');
        setNotification(null);
      }, 5000);
    } finally {
      setSaving(false);
    }
  }, [currentPageSlug, pageData, pageTitle, captureError]);

  // Add publishPage function
  const publishPage = useCallback(async () => {
    if (!currentPageSlug || !pageData) {
      console.warn('⚠️ [Editor] Cannot publish: missing slug or page data');
      return;
    }

    try {
      console.log('🚀 [Editor] Publishing page:', currentPageSlug);
      
      // First save the current data
      await savePageData();
      
      // Then publish
      const legacyData = convertToFormat(pageData, 'legacy');
      const response = await HttpClient.post(`/api/admin/pages/${currentPageSlug}/publish`, {
        title: pageTitle,
        published_json: JSON.stringify(legacyData),
        slug: currentPageSlug
      });

      console.log('✅ [Editor] Page published successfully:', response);
      setNotification({ type: 'success', message: 'Página publicada exitosamente' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      console.error('❌ [Editor] Error publishing page:', error);
      
      // Use enhanced error handling system
      captureError(error, {
        context: 'publishPage',
        pageSlug: currentPageSlug,
        operation: 'page_publish'
      });
      
      setNotification({ type: 'error', message: 'Error al publicar la página' });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [currentPageSlug, pageData, pageTitle, savePageData, captureError]);

  const toggleEditor = useCallback(() => {
    actions.setOptions(options => options.enabled = !enabled);
  }, [actions, enabled]);

  // Optimized load page data with better error handling and caching
  const loadPageData = useCallback(async (pageSlug: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`🔄 [Editor] Loading page data for: ${pageSlug}`);

      // Try to load from admin endpoint first
      const response = await HttpClient.getAdminPage(pageSlug);
      console.log('📊 [Editor] Received page data:', response);

      if (response) {
        // Use automatically migrated data if available
        if (response.craftData) {
          console.log('📦 [Editor] Using automatically migrated data');
          const craftData = typeof response.craftData === 'string' ? JSON.parse(response.craftData) : response.craftData;
          setPageData(craftData);
          setPageTitle(`Editando: ${response.title || pageSlug}`);
        } else {
          // Fallback to manual conversion
          console.log('📦 [Editor] Using manual conversion fallback');
          const jsonData = response.draft_json || response.published_json;
          if (jsonData) {
            try {
              const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
              console.log('✅ [Editor] Parsed page JSON:', parsedData);
              
              // Detectar formato y convertir a Craft.js si es necesario
              const dataFormat = detectDataFormat(parsedData);
              console.log('🔍 [Editor] Detected format:', dataFormat);
              
              let craftData;
              if (dataFormat === 'legacy') {
                console.log('🔄 [Editor] Converting legacy data to Craft.js format');
                craftData = convertToFormat(parsedData, 'craft');
              } else if (dataFormat === 'craft') {
                craftData = parsedData;
              } else {
                console.warn('⚠️ [Editor] Unknown data format, creating empty page');
                craftData = createEmptyPage();
              }
              
              setPageData(craftData);
              setPageTitle(`Editando: ${response.title || pageSlug}`);
            } catch (parseError) {
              console.error('❌ [Editor] Error parsing JSON:', parseError);
              setPageData(createEmptyPage());
              setPageTitle(`Nueva página: ${pageSlug}`);
            }
          } else {
            console.log('⚠️ [Editor] No JSON data found, creating empty page');
            setPageData(createEmptyPage());
            setPageTitle(`Nueva página: ${pageSlug}`);
          }
        }
        setCurrentPageSlug(pageSlug);
      }
    } catch (error: any) {
      console.error('❌ [Editor] Error loading page data:', error);
      
      // Use enhanced error handling system
      captureError(error, {
        context: 'loadPageData',
        pageSlug,
        operation: 'page_load'
      });
      
      setError(`Error cargando página: ${error.message}`);
      // Create empty page on error
      setPageData(createEmptyPage());
      setPageTitle(`Nueva página: ${pageSlug}`);
      setCurrentPageSlug(pageSlug);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para crear una página vacía en formato Craft.js
  const createEmptyPage = () => {
    return {
      ROOT: {
        type: { resolvedName: 'ContainerComponent' },
        isCanvas: true,
        props: {
          backgroundColor: '#ffffff',
          padding: '20px',
          margin: '0px',
          minHeight: '100vh',
          width: '100%'
        },
        displayName: 'Container',
        custom: {},
        nodes: []
      }
    };
  };

  // Load page on slug change
  useEffect(() => {
    if (slug) {
      console.log(`🎯 [Editor] Slug changed to: ${slug}`);
      loadPageData(slug);
    }
  }, [slug, loadPageData]);

  // Connect/disconnect collaboration when page changes
  useEffect(() => {
    if (currentPageSlug) {
      connect(currentPageSlug);
      return () => {
        disconnect();
      };
    }
  }, [currentPageSlug]); // Removed connect and disconnect from dependencies

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error en el Editor
            </h2>
            <p className="text-gray-600 mb-4">
              Ha ocurrido un error inesperado en el editor visual.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Recargar Editor
            </button>
          </div>
        </div>
      }
    >
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
            {saveStatus === 'saving' && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">Guardando...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <span className="text-sm text-green-600">✓ Guardado</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-red-600">✗ Error al guardar</span>
            )}
          </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePreview}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              showPreview 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Eye className="h-4 w-4 mr-2" />
            Vista previa
          </button>
          
          <button
            onClick={toggleCollaboration}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              showCollaboration 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Colaboración
          </button>
          
          <button
            onClick={savePageData}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          
          <button
            onClick={publishPage}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Publicar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbox */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <Suspense fallback={<div className="p-4 text-center text-gray-500">Cargando herramientas...</div>}>
            <Toolbox />
          </Suspense>
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando editor...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <p className="text-lg font-medium mb-2">Error</p>
                <p>{error}</p>
                <button 
                  onClick={() => slug && loadPageData(slug)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-gray-100 overflow-auto">
              <Frame data={pageData}>
                <Element is={ContainerComponent} canvas>
                  {/* El contenido se renderiza aquí */}
                </Element>
              </Frame>
              
              {/* Visual Tools con Suspense */}
              <Suspense fallback={null}>
                <ElementToolbar />
                <SelectionIndicator />
                <AlignmentGuides />
              </Suspense>
              
              {/* Collaboration Cursors */}
              {showCollaboration && (
                <Suspense fallback={null}>
                  <CollaborationCursors />
                </Suspense>
              )}
            </div>
          )}
        </div>

        {/* Settings Panel */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <Suspense fallback={<div className="p-4 text-center text-gray-500">Cargando configuración...</div>}>
            <SettingsPanel />
          </Suspense>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium">Vista previa</h3>
              <button
                onClick={togglePreview}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh]">
              <Suspense fallback={<div className="text-center py-8">Cargando vista previa...</div>}>
                <RealTimePreview />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Panel */}
      {showCollaboration && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-40 border-l border-gray-200">
          <Suspense fallback={<div className="p-4 text-center text-gray-500">Cargando colaboración...</div>}>
            <CollaborationPanel onClose={toggleCollaboration} />
          </Suspense>
        </div>
      )}

      {/* Layers Panel */}
      <div className="fixed bottom-4 left-4 z-30">
        <Suspense fallback={null}>
          <LayersPanel />
        </Suspense>
      </div>

      {/* View Tools */}
      <div className="fixed bottom-4 right-4 z-30">
        <Suspense fallback={null}>
          <ViewTools />
        </Suspense>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          <p>{notification.message}</p>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-sm underline"
          >
            Cerrar
          </button>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
};

// Componente Toolbox
const Toolbox = () => {
  const { connectors } = useEditor();
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Bloques Disponibles</h3>
      
      {/* Elementos Básicos */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Elementos Básicos</h4>
        <div className="space-y-2">
          <div
            ref={(ref) => ref && connectors.create(ref, <TextComponent text="Nuevo texto" />)}
            className="w-full text-left px-3 py-2 text-sm bg-green-50 hover:bg-green-100 rounded-md border border-green-200 cursor-pointer transition-colors"
          >
            📝 Texto
          </div>
          <div
            ref={(ref) => ref && connectors.create(ref, <ImageComponent src="https://via.placeholder.com/300x200?text=Nueva+Imagen" alt="Nueva imagen" />)}
            className="w-full text-left px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-200 cursor-pointer transition-colors"
          >
            🖼️ Imagen
          </div>
          <div
            ref={(ref) => ref && connectors.create(ref, <ButtonComponent text="Nuevo botón" />)}
            className="w-full text-left px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 rounded-md border border-orange-200 cursor-pointer transition-colors"
          >
            🔘 Botón
          </div>
          <div
            ref={(ref) => ref && connectors.create(ref, <Element is={ContainerComponent} canvas />)}
            className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 cursor-pointer transition-colors"
          >
            📦 Contenedor
          </div>
        </div>
      </div>
      
      {/* Bloques de Layout */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Layout</h4>
        <div className="space-y-2">
          <div
            ref={(ref) => ref && connectors.create(ref, <HeroBlock />)}
            className="w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 cursor-pointer transition-colors"
          >
            🎨 Hero/Banner
          </div>
        </div>
      </div>
      
      {/* Bloques de Contenido */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Contenido</h4>
        <div className="space-y-2">
          <div
            ref={(ref) => ref && connectors.create(ref, <ContactBlock />)}
            className="w-full text-left px-3 py-2 text-sm bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 cursor-pointer transition-colors"
          >
            📞 Contacto
          </div>
          <div
            ref={(ref) => ref && connectors.create(ref, <TeamBlock />)}
            className="w-full text-left px-3 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 cursor-pointer transition-colors"
          >
            👥 Equipo
          </div>
          <div
            ref={(ref) => ref && connectors.create(ref, <GalleryBlock />)}
            className="w-full text-left px-3 py-2 text-sm bg-pink-50 hover:bg-pink-100 rounded-md border border-pink-200 cursor-pointer transition-colors"
          >
            🖼️ Galería
          </div>
          <div
            ref={(ref) => ref && connectors.create(ref, <TableBlock />)}
            className="w-full text-left px-3 py-2 text-sm bg-yellow-50 hover:bg-yellow-100 rounded-md border border-yellow-200 cursor-pointer transition-colors"
          >
            📊 Tabla
          </div>
          <div
            ref={(ref) => ref && connectors.create(ref, <SliderBlock />)}
            className="w-full text-left px-3 py-2 text-sm bg-red-50 hover:bg-red-100 rounded-md border border-red-200 cursor-pointer transition-colors"
          >
            🎠 Slider
          </div>
        </div>
      </div>
      
      {/* Bloques Interactivos */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Interactivos</h4>
        <div className="space-y-2">
          <div
            ref={(ref) => ref && connectors.create(ref, <FormBlock />)}
            className="w-full text-left px-3 py-2 text-sm bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 cursor-pointer transition-colors"
          >
            📝 Formulario
          </div>
          <div
            ref={(ref) => ref && connectors.create(ref, <MapBlock />)}
            className="w-full text-left px-3 py-2 text-sm bg-cyan-50 hover:bg-cyan-100 rounded-md border border-cyan-200 cursor-pointer transition-colors"
          >
            🗺️ Mapa
          </div>
        </div>
      </div>
      
      {/* Instrucciones */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Arrastra los componentes al canvas para agregarlos a tu página.
        </p>
      </div>
    </div>
  );
};

// Componente SettingsPanel
const SettingsPanel = () => {
  const { selected } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    let selected;
    
    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related?.settings
      };
    }
    
    return { selected };
  });
  
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Propiedades</h3>
      <div className="space-y-4">
        {selected ? (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              {selected.name}
            </label>
            {selected.settings && React.createElement(selected.settings)}
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Título de Página</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
              />
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Selecciona un elemento para ver sus propiedades
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// RenderNode Component
const RenderNode = ({ render }: { render: React.ReactElement }) => {
  return render;
};

// Main Editor Component
const CraftEditor: React.FC = () => {
  console.log('🚀 [CraftEditor] Initializing editor');
  
  // Crear resolver dinámico para lazy loading
  const [resolver, setResolver] = useState({
    ...contentResolver,
    // Componentes básicos siempre disponibles
    ContainerComponent,
    TextComponent,
    ImageComponent,
    ButtonComponent
  });

  // Cargar componentes de bloques de forma lazy cuando se necesiten
  useEffect(() => {
    const loadBlockComponents = async () => {
      try {
        const [
          heroModule,
          contactModule,
          teamModule,
          formModule,
          galleryModule,
          mapModule,
          tableModule,
          sliderModule
        ] = await Promise.all([
          import('../components/blocks/HeroBlock'),
          import('../components/blocks/ContactBlock'),
          import('../components/blocks/TeamBlock'),
          import('../components/blocks').then(m => ({ default: m.FormBlock })),
          import('../components/blocks').then(m => ({ default: m.GalleryBlock })),
          import('../components/blocks').then(m => ({ default: m.MapBlock })),
          import('../components/blocks').then(m => ({ default: m.TableBlock })),
          import('../components/blocks').then(m => ({ default: m.SliderBlock }))
        ]);

        setResolver(prev => ({
          ...prev,
          HeroBlock: heroModule.default,
          ContactBlock: contactModule.default,
          TeamBlock: teamModule.default,
          FormBlock: formModule.default,
          GalleryBlock: galleryModule.default,
          MapBlock: mapModule.default,
          TableBlock: tableModule.default,
          SliderBlock: sliderModule.default
        }));

        console.log('✅ [CraftEditor] Block components loaded successfully');
      } catch (error) {
        console.error('❌ [CraftEditor] Error loading block components:', error);
      }
    };

    loadBlockComponents();
  }, []);
  
  return (
    <CollaborationProvider>
      <div className="h-screen">
        <Editor 
          resolver={resolver}
          enabled={true}
          onRender={RenderNode}
        >
          <EditorLayout />
        </Editor>
      </div>
    </CollaborationProvider>
  );
};

export default CraftEditor;