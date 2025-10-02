import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { normalizeError, ErrorInfo } from '../utils/errorHandler';
import HttpClient from '../utils/http';

interface PageData {
  id: string;
  title: string;
  slug: string;
  grapesData?: any;
  content?: string | null;
  html?: string | null;
  css?: string | null;
  gjsHtml?: string | null;
  gjsCss?: string | null;
  gjsComponents?: string | null;
  gjsStyles?: string | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'auto-saving';

const GrapesEditor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Referencias para evitar re-renders infinitos
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<Editor | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializationAttempted = useRef(false);
  
  // Estados
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasLoadedContent, setHasLoadedContent] = useState(false);

  // Función para guardar datos de la página
  const savePageData = async (grapesData: any, html: string, css: string, components: any, styles: any, isAutoSave = false) => {
    if (!pageData) return;

    try {
      const payload = {
        grapesData: JSON.stringify(grapesData),
        html,
        css,
        gjsHtml: html,
        gjsCss: css,
        gjsComponents: JSON.stringify(components),
        gjsStyles: JSON.stringify(styles)
      };

      await HttpClient.post(`/pages/${pageData.id}/grapes-data`, payload);
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      if (isAutoSave) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
      
      console.log('✅ Datos guardados exitosamente');
    } catch (error) {
      console.error('❌ Error guardando datos:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Función para manejar guardado
  const handleSave = useCallback(async (isAutoSave = false) => {
    const inst = editorInstanceRef.current;
    if (!inst || !pageData || !pageData.id) return;

    try {
      setSaveStatus(isAutoSave ? 'auto-saving' : 'saving');
      
      const grapesData = inst.store ? inst.store() : inst.getProjectData?.();
      const html = inst.getHtml();
      const css = inst.getCss();
      const components = inst.getComponents();
      const styles = inst.getStyle();
      
      await savePageData(grapesData, html || '', css || '', components, styles, isAutoSave);
      
      if (!isAutoSave) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('❌ Error en handleSave:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [pageData]);

  // Función para programar auto-guardado
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (hasUnsavedChanges && editorInstanceRef.current) {
        console.log('🔄 Auto-guardado activado');
        handleSave(true);
      }
    }, 5000); // Auto-guardar cada 5 segundos
  }, [hasUnsavedChanges, handleSave]);

  // Cargar datos de la página
  useEffect(() => {
    const fetchPageData = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        console.log('📡 Cargando datos de la página:', slug);
        
        const response: any = await HttpClient.get(`/pages/slug/${slug}`);
        console.log('📄 Respuesta completa de la API:', response);
        
        // Extraer los datos de la página de la respuesta
        const pageData: PageData = response.data;
        console.log('📄 Datos de página extraídos:', pageData);
        setPageData(pageData);
      } catch (error) {
        console.error('❌ Error cargando página:', error);
        setError(normalizeError(error));
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug]);

  // Función para inicializar el editor
  const initializeEditor = useCallback(() => {
    if (!editorContainerRef.current) {
      console.log('⚠️ Container no está listo aún');
      return false;
    }
    
    if (editorInstanceRef.current || initializationAttempted.current) {
      return true; // Ya inicializado o en proceso
    }

    console.log('🚀 Inicializando GrapesJS...');
    initializationAttempted.current = true;
    
    try {
      const gEditor = grapesjs.init({
        container: editorContainerRef.current,
        height: '100vh',
        width: 'auto',
        plugins: [gjsPresetWebpage],
        storageManager: false,
        avoidInlineStyle: true,
        canvas: { 
          styles: [
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css',
            'https://cdn.tailwindcss.com'
          ],
          scripts: [
            'https://cdn.tailwindcss.com'
          ]
        },
      });

      // Guardar instancia
      editorInstanceRef.current = gEditor;

      // Configurar eventos para detectar cambios
      gEditor.on('component:add component:remove component:update', () => {
        setHasUnsavedChanges(true);
        scheduleAutoSave();
      });

      gEditor.on('style:update', () => {
        setHasUnsavedChanges(true);
        scheduleAutoSave();
      });

      // Esperar al evento 'load' antes de cargar contenido
      gEditor.on('load', () => {
        console.log('✅ GrapesJS: evento load disparado');
        setEditorReady(true);
      });

      return true;
    } catch (error) {
      console.error('❌ Error inicializando editor:', error);
      initializationAttempted.current = false;
      return false;
    }
  }, [scheduleAutoSave]);

  // Efecto para intentar inicializar el editor
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeEditor();
    }, 100); // Pequeño delay para asegurar que el DOM esté listo

    return () => clearTimeout(timer);
  }, [initializeEditor]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      try {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        if (editorInstanceRef.current) {
          editorInstanceRef.current.destroy();
        }
      } catch (e) {
        console.warn('Error destruyendo editor:', e);
      }
      editorInstanceRef.current = null;
      initializationAttempted.current = false;
      setEditorReady(false);
      setHasLoadedContent(false);
    };
  }, []);

  // Método mejorado para cargar contenido
  const loadContentIntoEditor = (pageData: any) => {
    if (!editorInstanceRef.current || !editorReady) {
      console.log('⏳ Esperando que el editor esté listo...');
      return;
    }

    if (hasLoadedContent) {
      console.log('✅ Contenido ya cargado');
      return;
    }

    console.log('🔄 Cargando contenido en editor...');
    console.log('🔍 pageData recibido:', pageData);

    try {
      // PRIORIDAD 1: Usar gjsHtml con Tailwind CDN (NO cargar gjsCss porque está vacío)
      if (pageData.gjsHtml) {
        console.log('✅ Cargando desde gjsHtml con Tailwind CDN');
        
        // Limpiar tags de React
        let cleanHtml = pageData.gjsHtml;
        cleanHtml = cleanHtml.replace(/<Layout>/g, '').replace(/<\/Layout>/g, '');
        
        console.log('📝 HTML limpio:', cleanHtml.substring(0, 200));
        
        // Cargar solo el HTML, NO el CSS (porque gjsCss está vacío)
        editorInstanceRef.current.setComponents(cleanHtml);
        
        // NO ejecutar: editorInstanceRef.current.setStyle(pageData.gjsCss);
        
        // Forzar recarga del canvas para aplicar Tailwind
        setTimeout(() => {
          try {
            const canvasFrames = document.querySelectorAll('iframe[id*="gjs-cv-"]');
            const canvasFrame = canvasFrames[0] as HTMLIFrameElement;
            if (canvasFrame && canvasFrame.contentWindow) {
              // Recargar Tailwind en el iframe
              const script = canvasFrame.contentWindow.document.createElement('script');
              script.src = 'https://cdn.tailwindcss.com';
              canvasFrame.contentWindow.document.head.appendChild(script);
              console.log('🔄 Tailwind CDN recargado en iframe');
            }
          } catch (error) {
            console.warn('⚠️ No se pudo recargar Tailwind en iframe:', error);
          }
        }, 500);
        
        setHasLoadedContent(true);
        console.log('✅ HTML cargado, estilos de Tailwind CDN');
        return;
      }

      // PRIORIDAD 2: Usar HTML/CSS simple
      if (pageData.html && pageData.css) {
        console.log('✅ Cargando desde HTML/CSS simple');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(pageData.html, 'text/html');
        const bodyContent = doc.body.innerHTML;
        
        editorInstanceRef.current.setComponents(bodyContent);
        editorInstanceRef.current.setStyle(pageData.css);
        
        setHasLoadedContent(true);
        console.log('✅ Contenido HTML/CSS cargado exitosamente');
        return;
      }

      // PRIORIDAD 3: Fallback a gjsComponents/gjsStyles
      if (pageData.gjsComponents && pageData.gjsStyles) {
        console.log('🎯 Usando gjsComponents/gjsStyles como fallback');
        
        let components = pageData.gjsComponents;
        let styles = pageData.gjsStyles;

        if (typeof components === 'string') {
          components = JSON.parse(components);
        }
        if (typeof styles === 'string') {
          styles = JSON.parse(styles);
        }

        editorInstanceRef.current.setComponents(components);
        editorInstanceRef.current.setStyle(styles);
        
        setHasLoadedContent(true);
        console.log('✅ gjsComponents/gjsStyles cargados exitosamente');
        return;
      }

      console.warn('⚠️ No se encontró contenido válido para cargar');
      
    } catch (error) {
      console.error('❌ Error al cargar contenido:', error);
    }
  };

  // Asegúrate de que este useEffect se ejecute cuando cambien las dependencias
  useEffect(() => {
    if (pageData && editorInstanceRef.current && editorReady && !hasLoadedContent) {
      loadContentIntoEditor(pageData);
    }
  }, [pageData, editorReady, hasLoadedContent]);

  // Previsualizar página
  const handlePreview = () => {
    if (!editorInstanceRef.current) return;
    
    const html = editorInstanceRef.current.getHtml();
    const css = editorInstanceRef.current.getCss();
    
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Vista Previa - ${pageData?.title}</title>
            <style>${css}</style>
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" rel="stylesheet">
          </head>
          <body>${html}</body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  // Obtener texto y color del estado de guardado
  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return { text: 'Guardando...', color: 'text-blue-600' };
      case 'auto-saving':
        return { text: 'Auto-guardando...', color: 'text-blue-500' };
      case 'saved':
        return { text: 'Guardado', color: 'text-green-600' };
      case 'error':
        return { text: 'Error al guardar', color: 'text-red-600' };
      default:
        return { text: hasUnsavedChanges ? 'Cambios sin guardar' : 'Sin cambios', color: hasUnsavedChanges ? 'text-yellow-600' : 'text-gray-500' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Cargando editor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error.message}</div>
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusDisplay = getSaveStatusDisplay();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            ← Volver al Dashboard
          </button>
          <h1 className="text-lg font-semibold">
            Editando: {pageData?.title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Estado de guardado */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${statusDisplay.color}`}>
              {statusDisplay.text}
            </span>
            {lastSaved && (
              <span className="text-xs text-gray-400">
                {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <button
            onClick={() => handleSave(false)}
            disabled={saveStatus === 'saving' || saveStatus === 'auto-saving'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveStatus === 'saving' ? 'Guardando...' : 'Guardar'}
          </button>
          
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Vista Previa
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 flex flex-col">
        <div 
          ref={editorContainerRef} 
          id="gjs" 
          style={{ minHeight: '600px', height: '100vh' }}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default GrapesEditor;