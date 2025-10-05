import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { normalizeError, ErrorInfo } from '../utils/errorHandler';
import HttpClient from '../utils/http';

// Tipado básico para respuestas del API
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

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
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');

  // Función para guardar datos de la página
  const savePageData = async (grapesData: any, html: string, css: string, components: any, styles: any, isAutoSave = false) => {
    if (!pageData) return;

    try {
      console.log('📝 [GrapesEditor.savePageData] start', {
        id: pageData.id,
        slug: pageData.slug,
        htmlLen: (html || '').length,
        cssLen: (css || '').length,
        isAutoSave,
      });
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
      console.log('✅ [GrapesEditor.savePageData] posted', { len: JSON.stringify(payload).length });
      
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
    if (!inst || !pageData) return;

    try {
      setSaveStatus(isAutoSave ? 'auto-saving' : 'saving');

      const grapesData = inst.store ? inst.store() : inst.getProjectData?.();
      const html = inst.getHtml() || '';
      const css = inst.getCss() || '';
      const components = inst.getComponents();
      const styles = inst.getStyle();

      console.log('💾 Guardando:', {
        htmlLen: html.length,
        cssLen: css.length
      });

      const payload: any = {
        // Claves esperadas por backend (Joi)
        grapesData: JSON.stringify(grapesData ?? {}),
        // Claves tipo gjs-* para compatibilidad
        'gjs-html': html,
        'gjs-css': css,
        'gjs-components': components,
        'gjs-styles': styles,
        // Duplicados en camelCase usados por el servicio
        gjsHtml: html,
        gjsCss: css,
        gjsComponents: typeof components === 'string' ? components : JSON.stringify(components ?? []),
        gjsStyles: typeof styles === 'string' ? styles : JSON.stringify(styles ?? [])
      };

      // Intentar guardar por slug primero, luego por id como fallback
      const urlSlug = slug ? `http://localhost:3001/api/pages/${slug}/grapes-data` : null;
      const urlId = pageData.id ? `http://localhost:3001/api/pages/${pageData.id}/grapes-data` : null;

      let ok = false;
      let resultJson: any = null;

      if (urlSlug) {
        try {
          const resp = await fetch(urlSlug, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (resp.ok) {
            ok = true;
            resultJson = await resp.json();
          }
        } catch (e) {
          console.warn('⚠️ Guardado por slug falló, intentando por ID...', e);
        }
      }

      if (!ok && urlId) {
        const resp = await fetch(urlId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        resultJson = await resp.json();
        ok = !!resp.ok;
      }

      if (ok && resultJson?.success) {
        console.log('✅ Guardado exitoso');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        if (!isAutoSave) alert('💾 Cambios guardados');
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        console.error('❌ Error al guardar', resultJson);
        if (!isAutoSave) alert('❌ Error al guardar');
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      if (!isAutoSave) alert('Error de conexión');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [pageData, slug]);

  // Publicar página (guardar si hay cambios y llamar endpoint de publish)
  const handlePublish = useCallback(async () => {
    if (!pageData?.id) return;
    try {
      setIsPublishing(true);
      setPublishStatus('publishing');

      // Guardar cambios antes de publicar
      if (hasUnsavedChanges) {
        await handleSave(false);
      }

      // Llamar endpoint de publicación con tipado
      const result = await HttpClient.post<ApiResponse<any>>(`/pages/${pageData.id}/publish`, {});
      console.log('🚀 [GrapesEditor.handlePublish] response', result);

      // Verificar éxito explícitamente en el cuerpo JSON
      if (!result?.success) {
        throw new Error('Publicación no exitosa');
      }

      setPublishStatus('success');
      if (pageData.slug) {
        // Avisar al usuario
        alert('✅ Publicado correctamente');

        // Limpiar caché del navegador si está disponible
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }

        // Redirigir con timestamp para evitar caché
        setTimeout(() => {
          const target = `/${pageData.slug}?t=${Date.now()}`;
          console.log('🔄 [GrapesEditor.handlePublish] redirecting to', target);
          window.location.href = target;
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Error al publicar página:', error);
      setPublishStatus('error');
    } finally {
      setIsPublishing(false);
      // Resetear estado después de unos segundos
      setTimeout(() => setPublishStatus('idle'), 3000);
    }
  }, [pageData, hasUnsavedChanges, handleSave, navigate]);

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

  // PASO 4: Cargar datos con prioridad (gjsHtml > html > content)
  const loadPageData = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      console.log('📡 Cargando datos de la página:', slug);

      const response = await HttpClient.get<ApiResponse<{ page: PageData }>>(`/pages/slug/${slug}`);
      const dataAny: any = response.data as any;
      const page: PageData = (dataAny && 'page' in dataAny) ? (dataAny.page as PageData) : (dataAny as PageData);

      console.log('📥 Página cargada para editar:', page.slug);

      // PRIORIDAD: gjsHtml > html > content
      const htmlToEdit = page.gjsHtml || page.html || page.content || '';
      const cssToEdit = page.gjsCss || page.css || '';

      console.log('✏️ Contenido para editor:');
      console.log('  HTML:', htmlToEdit ? String(htmlToEdit).length : 0, 'chars');
      console.log('  CSS:', cssToEdit ? String(cssToEdit).length : 0, 'chars');

      // Guardar datos y cargar en editor si está listo
      setPageData(page);

      const editor = editorInstanceRef.current;
      if (editor && editorReady) {
        if (htmlToEdit) {
          editor.setComponents(htmlToEdit);
        }
        if (cssToEdit) {
          editor.setStyle(cssToEdit);
        }
        setHasLoadedContent(true);
      } else {
        console.log('⏳ Editor no listo aún; se cargará tras inicialización');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(normalizeError(error));
    } finally {
      setLoading(false);
    }
  }, [slug, editorReady]);

  // Cargar datos de la página usando la nueva función
  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

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
          ],
          scripts: [
          ]
        },
      });

      // Guardar instancia
      editorInstanceRef.current = gEditor;

      // Definir un dispositivo ancho para activar breakpoints md de Tailwind
      try {
        gEditor.DeviceManager.add({ id: 'Wide', name: 'Wide', width: '1024px' });
        gEditor.setDevice('Wide');
        console.log('📐 Dispositivo del canvas configurado: Wide (1024px)');
      } catch (e) {
        console.warn('⚠️ No se pudo configurar dispositivo Wide:', e);
      }

      // Configurar eventos para detectar cambios
      gEditor.on('component:add component:remove component:update', () => {
        setHasUnsavedChanges(true);
        scheduleAutoSave();
      });

      gEditor.on('style:update', () => {
        setHasUnsavedChanges(true);
        scheduleAutoSave();
      });

      // helper: inyectar Tailwind CDN dentro del iframe del canvas
      const injectTailwindIntoCanvas = () => {
        try {
          const frameEl = gEditor.Canvas.getFrameEl();
          if (!frameEl) {
            console.warn('⚠️ No se encontró el iframe del canvas');
            return;
          }
          const doc = frameEl.contentDocument || frameEl.contentWindow?.document;
          if (!doc) return;
          // Insertar Tailwind CDN (Play CDN) como script para generar utilidades dentro del iframe
          const existing = doc.querySelector('script[src="https://cdn.tailwindcss.com"]');
          if (!existing) {
            const script = doc.createElement('script');
            script.src = 'https://cdn.tailwindcss.com';
            doc.head.appendChild(script);
            console.log('🔌 Tailwind CDN inyectado en canvas iframe');
          }
          // Asegurar Bootstrap también si fuera necesario
          const existingBootstrap = doc.querySelector('link[href*="bootstrap"]');
          if (!existingBootstrap) {
            const link = doc.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css';
            doc.head.appendChild(link);
            console.log('🔌 Bootstrap CSS inyectado en canvas iframe');
          }
        } catch (err) {
          console.warn('⚠️ No se pudo inyectar Tailwind en canvas:', err);
        }
      };

      // Esperar al evento 'load' antes de cargar contenido
      gEditor.on('load', () => {
        console.log('✅ GrapesJS: evento load disparado');
        setEditorReady(true);

        // Bloques personalizados
        const bm = gEditor.BlockManager;
        bm.add('cta-button', {
          label: 'Botón CTA',
          category: 'Elementos',
          content: '<a class="px-4 py-2 rounded bg-blue-600 text-white inline-block" href="#">Llamada a la acción</a>'
        });
        bm.add('hero-simple', {
          label: 'Hero simple',
          category: 'Secciones',
          content: '<section class="bg-sky-100 py-16"><div class="container mx-auto text-center"><h1 class="text-3xl font-bold mb-4">Bienvenido</h1><p class="text-gray-700">Subtítulo descriptivo de la sección</p></div></section>'
        });
        bm.add('features-3col', {
          label: '3 Features',
          category: 'Secciones',
          content: '<section class="py-12"><div class="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"><div class="p-6 border rounded"><h3 class="font-semibold mb-2">Característica 1</h3><p class="text-gray-600">Descripción breve.</p></div><div class="p-6 border rounded"><h3 class="font-semibold mb-2">Característica 2</h3><p class="text-gray-600">Descripción breve.</p></div><div class="p-6 border rounded"><h3 class="font-semibold mb-2">Característica 3</h3><p class="text-gray-600">Descripción breve.</p></div></div></section>'
        });

        // El iframe del canvas puede aún no estar listo; se usa 'canvas:frame:load'
      });

      // El frame del canvas está listo; ahora podemos inyectar Tailwind y cargar contenido
      gEditor.on('canvas:frame:load', () => {
        console.log('🖼️ Canvas frame listo');
        try {
          const frameEl = gEditor.Canvas.getFrameEl();
          const cw = frameEl?.contentWindow?.innerWidth;
          console.log('📏 Ancho del iframe del canvas:', cw);
        } catch {}
        injectTailwindIntoCanvas();
        if (pageData) {
          console.log('🔄 Cargando contenido después de canvas:frame:load');
          loadContentIntoEditor(pageData);
        }
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
  const loadContentIntoEditor = async (pageData: any) => {
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
      // PRIORIDAD 1: Usar gjsHtml con carga correcta en GrapesJS
      if (pageData.gjsHtml) {
        console.log('✅ Cargando desde gjsHtml con método correcto');

        // Limpiar tags de React
        let cleanHtml = pageData.gjsHtml;
        cleanHtml = cleanHtml.replace(/<Layout>/g, '').replace(/<\/Layout>/g, '');

        // Logs de verificación
        console.log('🧪 TEST: ¿Editor existe?', !!editorInstanceRef.current);
        console.log('🧪 TEST: ¿Tiene setComponents?', typeof editorInstanceRef.current?.setComponents);
        console.log('🧪 TEST: ¿HTML tiene contenido?', cleanHtml?.length > 0);
        console.log('📝 HTML limpio:', cleanHtml.substring(0, 100));

        try {
          // Limpiar editor primero
          editorInstanceRef.current.setComponents('');
          editorInstanceRef.current.setStyle('');
          // Pequeña espera
          await new Promise(resolve => setTimeout(resolve, 100));
          // Cargar HTML
          editorInstanceRef.current.setComponents(cleanHtml);
          console.log('✅ Componentes establecidos');
          // Cargar CSS si existe
          if (pageData.gjsCss) {
            editorInstanceRef.current.setStyle(pageData.gjsCss);
            console.log('✅ Estilos establecidos');
          }
          // Forzar render
          editorInstanceRef.current.render();
          console.log('✅ Editor renderizado');

          // Inyectar Tailwind dentro del iframe para aplicar utilidades
          try {
            const frameEl = editorInstanceRef.current.Canvas.getFrameEl();
            const doc = frameEl?.contentDocument || frameEl?.contentWindow?.document;
            if (doc) {
              const exists = doc.querySelector('script[src="https://cdn.tailwindcss.com"]');
              if (!exists) {
                const script = doc.createElement('script');
                script.src = 'https://cdn.tailwindcss.com';
                doc.head.appendChild(script);
                console.log('🔄 Tailwind CDN recargado en iframe tras render');
              }
            }
          } catch (error) {
            console.warn('⚠️ No se pudo recargar Tailwind en iframe:', error);
          }
        } catch (err) {
          console.error('❌ Error al cargar contenido:', err);
        }

        setHasLoadedContent(true);
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
    if (editorInstanceRef.current && editorReady && pageData) {
      console.log('🔄 Editor listo y datos disponibles, cargando...');
      loadContentIntoEditor(pageData);
    }
  }, [editorInstanceRef.current, editorReady, pageData]);

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

  const publishPage = async () => {
    if (!confirm('¿Publicar los cambios a la página pública?')) return;

    try {
      await handleSave();
      
      const response = await fetch(`/api/pages/${slug}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log('Respuesta de publicación:', result);
      
      if (result && result.success === true) {
        alert('✅ Página publicada exitosamente. Redirigiendo en 2s...');
        setTimeout(() => {
          window.location.href = `/${slug}`;
        }, 2000);
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al publicar');
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

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publicando...' : 'Publicar'}
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