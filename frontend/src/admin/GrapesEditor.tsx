import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
// Plugins esenciales (registro por nombre)
import presetWebpage from 'grapesjs-preset-webpage';
import basicBlocks from 'grapesjs-blocks-basic';
import pluginForms from 'grapesjs-plugin-forms';
import { normalizeError, ErrorInfo } from '../utils/errorHandler';
import HttpClient from '../utils/http';

// Tipado básico para respuestas del API
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'auto-saving';

// =================== FIX A: Editabilidad de HTML importado ===================
// GrapesJS solo permite edición inline (doble clic) en componentes tipo 'text'.
// Cuando se importa HTML crudo (seed/Tailwind), los textos quedan como tipo
// 'default' y no se pueden editar. Esta función recorre el árbol y marca como
// editable cualquier componente HOJA (sin hijos-elemento) que contenga texto,
// sin tocar botones, imágenes ni componentes custom con comportamiento propio.
// Se aplica en CADA carga (no depende de que el flag 'editable' se persista).
const NON_EDITABLE_TYPES = new Set([
  'button', 'action-button', 'dropdown-menu', 'svg', 'pdf-viewer',
  'image', 'video', 'map', 'iframe', 'wrapper',
]);

const makeImportedContentEditable = (editor: Editor | null) => {
  if (!editor) return;
  let marked = 0;
  const visit = (comp: any) => {
    try {
      const type = comp.get('type');
      const children = comp.components?.();
      const childArr: any[] = children?.models || [];
      const hasElementChild = childArr.some((c: any) => c.get('type') !== 'textnode');

      if (!NON_EDITABLE_TYPES.has(type) && !hasElementChild) {
        const hasTextChild = childArr.some((c: any) => {
          const content = c.get('content');
          return c.get('type') === 'textnode' && typeof content === 'string' && content.trim().length > 0;
        });
        const ownContent = comp.get('content');
        const hasOwnText = typeof ownContent === 'string' && ownContent.trim().length > 0;
        if (hasTextChild || hasOwnText) {
          if (comp.get('editable') !== true) {
            comp.set('editable', true);
            marked++;
          }
        }
      }
      childArr.forEach(visit);
    } catch { /* nodo no procesable, continuar */ }
  };
  try {
    const wrapper = editor.getWrapper?.();
    if (wrapper) {
      (wrapper.components?.().models || []).forEach(visit);
      if (marked > 0) console.log(`✏️ FIX A: ${marked} contenedor(es) de texto importado marcados como editables`);
    }
  } catch (e) {
    console.warn('FIX A: no se pudo procesar editabilidad de contenido importado', e);
  }
};

const GrapesEditor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Referencias para evitar re-renders infinitos
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<Editor | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savingRef = useRef<boolean>(false);
  const latestCssRef = useRef<string | null>(null);
  const perfStartRef = useRef<number | null>(null);
  const initializationAttempted = useRef(false);
  const lastInitSlugRef = useRef<string | null>(null);

  // Estados
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');
  // Eliminado estado duplicado del editor; usar solo ref para evitar re-renders
  const [contentLoaded, setContentLoaded] = useState(false);
  const [showBlocks, setShowBlocks] = useState(false);
  const [showStyles, setShowStyles] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showClasses, setShowClasses] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(true);
  const [rightWidth, setRightWidth] = useState<number>(280);
  const dragStateRef = useRef<{ side: 'left' | 'right' | null; startX: number; startW: number }>({ side: null, startX: 0, startW: 0 });
  // Constructor de gradiente (UI personalizada)
  const [gradientStopCount, setGradientStopCount] = useState<number>(2);
  const [gradientStops, setGradientStops] = useState<string[]>(['#3b82f6', '#8b5cf6']);
  const [gradientAngle, setGradientAngle] = useState<number>(90);
  const [selectedInfo, setSelectedInfo] = useState<{ width: number; height: number; name?: string } | null>(null);

  // Panel izquierdo eliminado

  const onRightHandleMouseDown = (e: React.MouseEvent) => {
    if (rightCollapsed) return;
    dragStateRef.current = { side: 'right', startX: e.clientX, startW: rightWidth };
    const onMove = (ev: MouseEvent) => {
      const dx = dragStateRef.current.startX - ev.clientX;
      const newW = Math.max(180, Math.min(560, dragStateRef.current.startW + dx));
      setRightWidth(newW);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Tailwind presets desactivados temporalmente para diagnóstico
  const tailwindPresets: Record<string, string[]> = {};

  // applyTailwindPreset desactivado temporalmente
  const applyTailwindPreset = (name: keyof typeof tailwindPresets) => {
    return;
  };

  // Función para obtener la ruta CSS correcta según el entorno
  const getMainCssHref = () => {
    // En desarrollo, Vite sirve /src/index.css
    if (import.meta.env.DEV) {
      return '/src/index.css';
    }
    // En producción, buscar el CSS compilado en el <head> principal
    const mainCssLink = document.querySelector('link[rel="stylesheet"][href*="index-"]') as HTMLLinkElement;
    if (mainCssLink) {
      return mainCssLink.href;
    }
    // Fallback a un archivo estático si existe
    return '/tailwind.css';
  };

  // Helpers de inyección accesibles en todo el componente
  const injectTailwindIntoCanvas = (maxRetries: number = 20) => {
    try {
      const ed = editorInstanceRef.current;
      const frame = ed?.Canvas.getFrameEl();
      const doc = frame?.contentDocument || ed?.Canvas.getDocument();
      if (!doc) {
        if (maxRetries > 0) setTimeout(() => injectTailwindIntoCanvas(maxRetries - 1), 120);
        else console.warn('⚠️ Documento del canvas no disponible para estilos');
        return;
      }

      // Obtener la ruta CSS correcta según el entorno
      const cssHref = getMainCssHref();
      const existingCss = doc.querySelector(`link[rel="stylesheet"][href="${cssHref}"]`);

      if (!existingCss) {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssHref;
        doc.head.appendChild(link);
        console.log('🎨 CSS principal inyectado en canvas:', cssHref);
      }

      const fontHref = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap';
      if (!doc.querySelector(`link[rel="stylesheet"][href="${fontHref}"]`)) {
        const fontLink = doc.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = fontHref;
        doc.head.appendChild(fontLink);
        console.log('🔤 Fuente Inter inyectada en canvas');
      }
    } catch (e) {
      console.warn('No se pudo inyectar Tailwind en canvas:', e);
    }
  };

  const injectPageStyles = (maxRetries: number = 20) => {
    try {
      const ed = editorInstanceRef.current;
      const frame = ed?.Canvas.getFrameEl();
      const doc = frame?.contentDocument || ed?.Canvas.getDocument();
      if (!doc) {
        if (maxRetries > 0) setTimeout(() => injectPageStyles(maxRetries - 1), 120);
        else console.warn('⚠️ Documento del canvas no disponible para estilos externos');
        return;
      }
      const html = latestHtmlRef.current || '';
      if (!html) return;
      const parser = new DOMParser();
      const parsed = parser.parseFromString(html, 'text/html');
      parsed.querySelectorAll('link[rel="stylesheet"][href]').forEach((el) => {
        const href = el.getAttribute('href');
        if (!href) return;
        if (!doc.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
          const link = doc.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          doc.head.appendChild(link);
          console.log('🧩 Estilo externo cargado en canvas:', href);
        }
      });
    } catch (e) {
      console.warn('No se pudieron inyectar estilos externos:', e);
    }
  };

  // Utilidades para construir/aplicar gradientes
  const buildLinearGradient = (angle: number, stops: string[]) => {
    const count = stops.length;
    if (count <= 0) return '';
    if (count === 1) return `linear-gradient(${angle}deg, ${stops[0]} 0%)`;
    const step = 100 / (count - 1);
    const parts = stops.map((c, idx) => `${c} ${Math.round(step * idx)}%`);
    return `linear-gradient(${angle}deg, ${parts.join(', ')})`;
  };

  const applyGradientToSelection = () => {
    const ed = editorInstanceRef.current;
    if (!ed) return;
    const sel = ed.getSelected();
    if (!sel) return;
    const stops = gradientStops.slice(0, gradientStopCount);
    const value = buildLinearGradient(gradientAngle, stops);
    sel.addStyle({ 'background-image': value });
  };

  const handleGradientStopCountChange = (n: number) => {
    const safe = Math.max(2, Math.min(8, n));
    setGradientStopCount(safe);
    setGradientStops(prev => {
      const next = prev.slice(0, safe);
      while (next.length < safe) next.push('#ffffff');
      return next;
    });
  };

  const updateGradientStopColor = (idx: number, color: string) => {
    setGradientStops(prev => {
      const next = prev.slice();
      next[idx] = color;
      return next;
    });
  };
  const latestHtmlRef = useRef<string | null>(null);

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

    if (savingRef.current) {
      console.log('⏳ Save skipped: already saving');
      return;
    }
    savingRef.current = true;

    try {
      setSaveStatus(isAutoSave ? 'auto-saving' : 'saving');

      // Sincronizar texto visible de botones con data-label antes de exportar HTML
      try {
        const wrapper = inst.getWrapper?.();
        if (wrapper) {
          const buttons = wrapper.find('a, button');
          buttons.forEach((btn: any) => {
            const attrs = typeof btn.getAttributes === 'function' ? btn.getAttributes() : (btn.get('attributes') || {});
            const label = attrs?.['data-label'];
            if (typeof label === 'string' && label.trim().length > 0) {
              btn.set('content', label);
            }
          });
        }
      } catch (e) {
        console.warn('No se pudo sincronizar el texto de botones antes de exportar:', e);
      }

            // Normalizar imágenes: mover width/height de atributos a styles
      try {
        const wrapper = inst.getWrapper?.();
        if (wrapper) {
          const imgs = wrapper.find('img');
          imgs.forEach((img: any) => {
            const attrs = img.getAttributes();
            const w = attrs.width;
            const h = attrs.height;
            if (w || h) {
              const style: any = {};
              if (w && !isNaN(Number(w))) style.width = w + 'px';
              else if (w) style.width = w;
              if (h && !isNaN(Number(h))) style.height = h + 'px';
              else if (h) style.height = h;
              img.addStyle(style);
              img.removeAttributes(['width', 'height']);
            }
          });
        }
      } catch (e) {
        console.warn('Error normalizando imágenes:', e);
      }

      const grapesData = inst.store ? inst.store() : inst.getProjectData?.();
      const html = inst.getHtml() || '';
      const css = inst.getCss() || '';
      const components = inst.getComponents();
      const styles = inst.getStyle();

      console.log('💾 Guardando:', {
        htmlLen: html.length,
        cssLen: css.length,
        pageId: pageData.id,
        isNewPage: !pageData.id
      });

      // Preparar payload con datos de GrapesJS
      const grapesJsData = {
        html: html || '',
        css: css || '',
        components: typeof components === 'string' ? JSON.parse(components) : components || [],
        styles: typeof styles === 'string' ? JSON.parse(styles) : styles || []
      };

      // Generar grapesData completo desde el editor (store/getProjectData) de forma tolerante
      let grapesDataObj: any = null;
      try {
        grapesDataObj = inst.store ? inst.store() : (typeof inst.getProjectData === 'function' ? inst.getProjectData() : null);
      } catch (e) {
        console.warn('No se pudo generar grapesData con store/getProjectData', e);
        grapesDataObj = null;
      }
      // Usar el objeto completo si existe; si no, caer al básico armado arriba
      const grapesDataStr: string = grapesDataObj ? JSON.stringify(grapesDataObj) : JSON.stringify(grapesJsData);

      // Si es una página nueva (sin ID), crearla primero
      let currentPageData = pageData;
      if (!pageData.id) {
        console.log('📝 Creando página nueva...');
        const createPayload = {
          slug: pageData.slug,
          title: pageData.title,
          content: html || pageData.content,
          css: css || pageData.css
        };

        const createResult = await HttpClient.post<ApiResponse<{ page: PageData }>>('/pages', createPayload);
        if (createResult?.success && createResult.data) {
          const createdPage = (('page' in createResult.data)
            ? (createResult.data as { page: PageData }).page
            : (createResult.data as unknown as PageData));
          currentPageData = createdPage;
          setPageData(currentPageData);
          console.log('✅ Página creada con ID:', currentPageData.id);
        } else {
          throw new Error('Error al crear la página');
        }
      }

      // Solo enviar los campos permitidos por el backend
      const payload: any = {
        // Clave principal esperada por el backend
        grapesData: grapesDataStr,
        // Campos en camelCase que sí están permitidos según el error
        gjsHtml: html,
        gjsCss: css,
        gjsComponents: typeof components === 'string' ? components : JSON.stringify(components || []),
        gjsStyles: typeof styles === 'string' ? styles : JSON.stringify(styles || []),
        isAutoSave: isAutoSave
      };

      // Guardar por ID usando HttpClient con Authorization
      const resultJson = await HttpClient.post<ApiResponse<{ page: PageData }>>(
        `/pages/${currentPageData.id}/grapes-data`,
        payload
      );

      if (resultJson?.success) {
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
    } finally {
      savingRef.current = false;
    }
  }, [pageData, slug]);

  // Publicar página (guardar si hay cambios y llamar endpoint de publish)
  const handlePublish = useCallback(async () => {
    if (!pageData) return;

    try {
      setIsPublishing(true);
      setPublishStatus('publishing');

      // Si es una página nueva, guardarla primero
      if (!pageData.id || hasUnsavedChanges) {
        await handleSave(false);
      }

      // Verificar que ahora tenemos ID después de guardar
      if (!pageData.id) {
        throw new Error('No se pudo crear la página');
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

        // Abrir página publicada en nueva pestaña (evita reiniciar el editor)
        setTimeout(() => {
          const target = `/${pageData.slug}?t=${Date.now()}`;
          console.log('🔄 [GrapesEditor.handlePublish] opening new tab', target);
          window.open(target, '_blank', 'noopener,noreferrer');
        }, 500);
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
    }, 15000); // Auto-guardar cada 15 segundos
  }, [hasUnsavedChanges, handleSave]);

  // PASO 4: Cargar datos por slug (solo una vez por slug)
  const loadPageData = useCallback(async () => {
    if (!slug) return;
    console.log('🔄 useEffect [slug] -> loadPageData');
    try {
      setLoading(true);
      console.log('📡 Cargando datos de la página:', slug);
      const response = await HttpClient.get<ApiResponse<{ page: PageData }>>(`/pages/slug/${slug}`);
      const dataAny: any = response.data as any;
      const page: PageData = (dataAny && 'page' in dataAny) ? (dataAny.page as PageData) : (dataAny as PageData);
      console.log('📥 Página cargada para editar:', page.slug);
      // Dejar la página completamente vacía si no tiene contenido
      setPageData(page);
    } catch (error) {
      console.error('❌ Error al cargar página:', error);
      // Si la página no existe (404), crear una página nueva
      if (error instanceof Error && error.message.includes('404')) {
        console.log('📝 Creando página nueva para:', slug);
        const newPage: PageData = {
          id: '',
          slug: slug,
          title: slug.charAt(0).toUpperCase() + slug.slice(1),
          content: '',
          css: '',
          grapesData: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setPageData(newPage);
        setError(null); // Limpiar el error
      } else {
        setError(normalizeError(error));
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Cargar datos de la página: depende SOLO de slug
  useEffect(() => {
    console.log('🔄 useEffect [slug]');
    loadPageData();
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
    lastInitSlugRef.current = slug || null;

    try {
      // Normalizar plugins por compatibilidad CJS/ESM
      const pluginBasic = (basicBlocks as any)?.default ?? basicBlocks;
      const pluginPreset = (presetWebpage as any)?.default ?? presetWebpage;
      const pluginFormsFn = (pluginForms as any)?.default ?? pluginForms;
      try {
        console.log('🔌 Plugins typeof:', {
          basic: typeof pluginBasic,
          preset: typeof pluginPreset,
          forms: typeof pluginFormsFn,
        });
      } catch { }

      // 🎯 Función global única para detectar contexto del editor (evita declaraciones duplicadas)
      const checkEditorContext = () => {
        try {
          return window.parent !== window ||
            document.querySelector('.gjs-cv-canvas') !== null ||
            window.location.pathname.includes('/admin/');
        } catch (e) {
          return false;
        }
      };

      // 🌐 Hacer la función accesible globalmente para los scripts de GrapesJS
      (window as any).checkEditorContext = checkEditorContext;

      const gEditor = grapesjs.init({
        container: editorContainerRef.current,
        height: '100vh',
        width: 'auto',
        allowScripts: true,
        fromElement: true,
        // Configuración para coherencia con Tailwind y evitar estilos inline
        avoidInlineStyle: true,
        protectedCss: '',
        storageManager: { type: 'local' },
        assetManager: {
          upload: '/api/upload/image',
          uploadName: 'files',
          multiUpload: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          // @ts-ignore
          uploadResponse: (res: any) => {
            // Transformar la respuesta al formato que espera GrapesJS
            // Nuestra API devuelve { data: [{ src: '...', type: 'image' }] }
            return { data: res.data };
          }
        },
        canvas: {
          styles: [
            getMainCssHref(), // CSS principal (dev o producción)
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap'
          ]
        },
        rte: {
          actions: [
            'bold', 'italic', 'underline', 'strikethrough', 'link',
            {
              name: 'ordered-list',
              icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7,13H21V11H7M7,19H21V17H7M7,7H21V5H7M2,11H5V12H4V13H5V14H2V13H3V12H2M3,8H2V4H3V5H4V4H5V8H4V7H3M2,17H4V17.5H3V18.5H4V19H2V20H5V16H2V17Z"></path></svg>',
              attributes: { title: 'Lista Ordenada (1, 2, 3)' },
              result: (rte: any) => rte.exec('insertOrderedList')
            },
            {
              name: 'unordered-list',
              icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7,13H21V11H7M7,19H21V17H7M7,7H21V5H7M3,10C2.45,10 2,10.45 2,11C2,11.55 2.45,12 3,12C3.55,12 4,11.55 4,11C4,10.45 3.55,10 3,10M3,4C2.45,4 2,4.45 2,5C2,5.55 2.45,6 3,6C3.55,6 4,5.55 4,5C4,4.45 3.55,4 3,4M3,16C2.45,16 2,16.45 2,17C2,17.55 2.45,18 3,18C3.55,18 4,17.55 4,17C4,16.45 3.55,16 3,16Z"></path></svg>',
              attributes: { title: 'Lista Desordenada (Viñetas)' },
              result: (rte: any) => rte.exec('insertUnorderedList')
            }
          ]
        },
        panels: {
          defaults: [
            {
              id: 'panel-switcher',
              el: '.gjs-pn-views-container',
              buttons: [
                {
                  id: 'open-blocks',
                  label: 'Bloques',
                  command: 'open-blocks',
                  togglable: false,
                  active: true
                },
                {
                  id: 'open-style-manager',
                  label: 'Estilos',
                  command: 'open-sm',
                  togglable: false
                },
              ]
            }
          ]
        },
        i18n: {
          locale: 'es',
          messages: {
            es: {
              styleManager: {
                empty: 'Selecciona un elemento para editarlo',
                sectors: {
                  general: 'General',
                  layout: 'Diseño'
                },
                properties: {
                  float: 'Flotante',
                  display: 'Visualización',
                  position: 'Posición',
                  top: 'Superior',
                  right: 'Derecha',
                  left: 'Izquierda',
                  bottom: 'Inferior',
                  width: 'Ancho',
                  height: 'Alto',
                  'max-width': 'Ancho máximo',
                  'min-height': 'Alto mínimo',
                  margin: 'Margen',
                  padding: 'Relleno',
                  'font-family': 'Familia de fuente',
                  'font-size': 'Tamaño de fuente',
                  'font-weight': 'Peso de fuente',
                  'letter-spacing': 'Espaciado de letras',
                  color: 'Color',
                  'line-height': 'Altura de línea',
                  'text-align': 'Alineación de texto',
                  'text-shadow': 'Sombra de texto',
                  'background-color': 'Color de fondo',
                  'background': 'Fondo',
                  'border-radius': 'Radio del borde',
                  'border': 'Borde',
                  'box-shadow': 'Sombra',
                  'z-index': 'Índice Z',
                  'list-style-type': 'Viñetas/Números',
                  'list-style-position': 'Posición de viñeta'
                }
              },
              traitManager: {
                empty: 'Selecciona un elemento para ver sus propiedades',
                label: 'Configuración del componente',
                traits: {
                  labels: {
                    id: 'ID',
                    title: 'Título',
                    href: 'Enlace',
                    target: 'Objetivo',
                    alt: 'Texto alternativo'
                  }
                }
              },
              blockManager: {
                labels: {
                  basic: 'Básico',
                  text: 'Texto',
                  layout: 'Diseño'
                }
              }
            }
          }
        },
        // Plugins como funciones; se envían opciones vía wrappers para ajustar tipos
        plugins: [
          (ed: Editor) => pluginBasic(ed, {
            blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'button'],
            flexGrid: 1
          }),
          // plugin-forms removido por solicitud (es una réplica)
          (ed: Editor) => pluginPreset(ed, {
            blocks: ['link-block', 'quote', 'text-basic'],
            modalImportTitle: 'Importar código',
            modalImportContent: (editor: Editor) => editor.getHtml() + '<style>' + editor.getCss() + '</style>'
          })
        ],
        // Gestores de estilo con grupos organizados
        styleManager: {
          sectors: [
            {
              name: '📐 Dimensiones',
              open: true,
              buildProps: ['width', 'height', 'max-width', 'min-height', 'padding', 'margin']
            },
            {
              name: '↔️ Alineación',
              open: true,
              properties: [
                {
                  id: 'horizontal-align',
                  type: 'align',
                  property: 'horizontal-align',
                  name: 'Alineación horizontal'
                },
                {
                  type: 'select',
                  name: 'Alineación de texto',
                  property: 'text-align',
                  options: [
                    { id: 'left', name: 'Izquierda' },
                    { id: 'center', name: 'Centro' },
                    { id: 'right', name: 'Derecha' },
                    { id: 'justify', name: 'Justificar' }
                  ]
                }
              ]
            },
            {
              name: '🧱 General',
              open: true,
              properties: [
                {
                  type: 'select',
                  name: 'display',
                  property: 'display',
                  options: [
                    { id: 'block', name: 'Block' },
                    { id: 'inline', name: 'Inline' },
                    { id: 'inline-block', name: 'Inline-block' },
                    { id: 'flex', name: 'Flex' },
                    { id: 'grid', name: 'Grid' }
                  ]
                },
                {
                  type: 'select',
                  name: 'float',
                  property: 'float',
                  options: [
                    { id: 'none', name: 'Ninguno' },
                    { id: 'left', name: 'Izquierda' },
                    { id: 'right', name: 'Derecha' }
                  ]
                }
                // 'margin' ya existe en 📐 Dimensiones
              ]
            },
            {
              name: '🧲 Flex/Grid',
              open: true,
              properties: [
                {
                  type: 'select',
                  name: 'align-self',
                  property: 'align-self',
                  options: [
                    { id: 'auto', name: 'Auto' },
                    { id: 'flex-start', name: 'Inicio' },
                    { id: 'center', name: 'Centro' },
                    { id: 'flex-end', name: 'Fin' },
                    { id: 'stretch', name: 'Extender' }
                  ]
                },
                {
                  type: 'select',
                  name: 'justify-self',
                  property: 'justify-self',
                  options: [
                    { id: 'auto', name: 'Auto' },
                    { id: 'start', name: 'Inicio' },
                    { id: 'center', name: 'Centro' },
                    { id: 'end', name: 'Fin' },
                    { id: 'stretch', name: 'Extender' }
                  ]
                }
              ]
            },
            {
              name: '🎨 Apariencia',
              open: true,
              buildProps: ['color', 'background-color', 'background', 'border', 'border-radius', 'box-shadow'],
              properties: [
                {
                  type: 'color',
                  name: 'color',
                  property: 'color',
                  defaults: '#000000',
                },
                {
                  type: 'composite',
                  name: 'border',
                  property: 'border',
                  properties: [
                    { type: 'number', units: ['px'], name: 'border-width' },
                    {
                      type: 'select', name: 'border-style', options: [
                        { id: 'none', name: 'Ninguno' },
                        { id: 'solid', name: 'Sólido' },
                        { id: 'dashed', name: 'Discontinuo' },
                        { id: 'dotted', name: 'Punteado' },
                        { id: 'double', name: 'Doble' },
                      ]
                    },
                    { type: 'color', name: 'border-color' },
                  ],
                },
                {
                  type: 'composite',
                  name: 'border-radius',
                  property: 'border-radius',
                  properties: [
                    { type: 'number', units: ['px', '%'], name: 'border-top-left-radius' },
                    { type: 'number', units: ['px', '%'], name: 'border-top-right-radius' },
                    { type: 'number', units: ['px', '%'], name: 'border-bottom-right-radius' },
                    { type: 'number', units: ['px', '%'], name: 'border-bottom-left-radius' },
                  ],
                },
                {
                  type: 'stack',
                  name: 'box-shadow',
                  property: 'box-shadow',
                },
              ]
            },
            {
              name: '📝 Texto',
              open: true,
              buildProps: [
                'font-size', 'font-family', 'font-weight', 'letter-spacing',
                'color', 'line-height', 'text-align', 'text-decoration'
              ],
              properties: [
                {
                  type: 'select',
                  name: 'Efecto Gradiente',
                  property: 'text-gradient-effect',
                  options: [
                    { id: 'none', name: 'Ninguno' },
                    { id: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)', name: 'Azul-Violeta' },
                    { id: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)', name: 'Fuego' },
                    { id: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)', name: 'Océano' },
                    { id: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%, #ec4899 100%)', name: 'Arcoíris' }
                  ]
                }
              ]
            },
            {
              name: '📜 Listas',
              open: true,
              properties: [
                {
                  type: 'select',
                  property: 'list-style-type',
                  name: 'Viñetas/Números',
                  options: [
                    { id: 'disc', name: 'Puntos •' },
                    { id: 'circle', name: 'Círculos ○' },
                    { id: 'square', name: 'Cuadrados ■' },
                    { id: 'decimal', name: 'Números (1, 2, 3)' },
                    { id: 'lower-latin', name: 'Letras (a, b, c)' },
                    { id: 'upper-latin', name: 'Letras (A, B, C)' },
                    { id: 'none', name: 'Ocultar todo' }
                  ]
                },
                {
                  type: 'select',
                  property: 'list-style-position',
                  name: 'Posición de viñeta',
                  options: [
                    { id: 'outside', name: 'Fuera (Estándar)' },
                    { id: 'inside', name: 'Dentro (Alineado)' }
                  ]
                },
                {
                  type: 'slider',
                  property: 'marker-size',
                  name: 'Tamaño de Viñeta',
                  defaults: '1',
                  min: 0.5,
                  max: 3,
                  step: 0.1,
                  unit: 'em'
                },
                {
                  type: 'color',
                  property: 'marker-color',
                  name: 'Color de Viñeta',
                  defaults: 'inherit'
                },
                {
                  type: 'select',
                  name: 'Gradiente de Viñeta',
                  property: 'marker-gradient',
                  options: [
                    { id: 'none', name: 'Ninguno' },
                    { id: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)', name: 'Azul-Violeta' },
                    { id: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)', name: 'Fuego' },
                    { id: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)', name: 'Océano' },
                    { id: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)', name: 'Arcoíris' },
                    { id: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #fef3c7 100%)', name: 'Dorado' },
                    { id: 'linear-gradient(90deg, #dc2626 0%, #f87171 50%, #fca5a5 100%)', name: 'Rojo Suave' },
                    { id: 'linear-gradient(90deg, #059669 0%, #34d399 50%, #6ee7b7 100%)', name: 'Verde Menta' }
                  ],
                  defaults: 'none'
                }
              ]
            },
            {
              name: '🖼️ Fondos',
              open: false,
              buildProps: ['background-image', 'background-repeat', 'background-position', 'background-size', 'background-attachment'],
              properties: [
                {
                  type: 'text',
                  name: 'URL de imagen de fondo',
                  property: 'background-image',
                  defaults: '',
                },
                {
                  type: 'select',
                  name: 'background-repeat',
                  property: 'background-repeat',
                  options: [
                    { id: 'repeat', name: 'Repetir' },
                    { id: 'repeat-x', name: 'Repetir X' },
                    { id: 'repeat-y', name: 'Repetir Y' },
                    { id: 'no-repeat', name: 'No repetir' },
                    { id: 'space', name: 'Espaciado' },
                    { id: 'round', name: 'Redondear' },
                  ],
                },
                {
                  type: 'select',
                  name: 'background-position',
                  property: 'background-position',
                  options: [
                    { id: 'left top', name: 'Izquierda arriba' },
                    { id: 'center top', name: 'Centro arriba' },
                    { id: 'right top', name: 'Derecha arriba' },
                    { id: 'left center', name: 'Izquierda centro' },
                    { id: 'center center', name: 'Centro centro' },
                    { id: 'right center', name: 'Derecha centro' },
                    { id: 'left bottom', name: 'Izquierda abajo' },
                    { id: 'center bottom', name: 'Centro abajo' },
                    { id: 'right bottom', name: 'Derecha abajo' },
                  ],
                },
                {
                  type: 'select',
                  name: 'background-size',
                  property: 'background-size',
                  options: [
                    { id: 'auto', name: 'Auto' },
                    { id: 'cover', name: 'Cubrir' },
                    { id: 'contain', name: 'Contener' },
                  ],
                },
                {
                  type: 'select',
                  name: 'background-attachment',
                  property: 'background-attachment',
                  options: [
                    { id: 'scroll', name: 'Desplazable' },
                    { id: 'fixed', name: 'Fijo' },
                    { id: 'local', name: 'Local' },
                  ],
                },
              ],
            },

            {
              name: '🔄 Efectos',
              open: false,
              buildProps: ['transition', 'opacity', 'transform']
            },
          ]
        },
        traitManager: {},
        layerManager: {
          showWrapper: true,
          sortable: true,
          hidable: true,
          showHover: true,
        } as any,
        deviceManager: {
          devices: [
            { id: "Desktop", name: "Escritorio", width: "" },
            { id: "Tablet", name: "Tablet", width: "768px" },
            { id: "Mobile", name: "Móvil", width: "375px" },
            { id: "Wide", name: "Ancho", width: "1024px" }
          ]
        },
        // (claves duplicadas removidas: storageManager, avoidInlineStyle y canvas ya definidos arriba)
      });

      // ====== SINCRONIZACIÓN DE TEXTO EN BOTONES (SETTINGS - TUERCA) ======

      console.log('🔧 Configurando edición de texto en botones para la pestaña Settings...');

      // EVENTO PRINCIPAL: Cuando se selecciona un botón o enlace
      gEditor.on('component:selected', (component: any) => {
        try {
          const type = component.get('type');
          if (type !== 'button' && type !== 'link') {
            return;
          }

          console.log('👆 Componente seleccionado, tipo:', type);

          // Pequeño timeout para asegurar que el componente esté completamente renderizado
          setTimeout(() => {
            const el = component.view?.el as HTMLElement;
            if (!el) {
              console.warn('⚠️ No se encontró elemento HTML del componente');
              return;
            }
            // Convertir a action-button si no lo es aún (solo el seleccionado)
            try {
              if (component.get('type') !== 'action-button') {
                component.set({ type: 'action-button' });
              }
            } catch { }

            // Obtener el texto actual del componente
            const currentText = el.innerText.trim() || component.get('content') || (type === 'button' ? 'Botón' : 'Enlace');
            console.log('📖 Texto actual:', currentText);

            // Actualizar el trait 'content' con el texto actual
            const contentTrait = component.getTrait('content');
            if (contentTrait) {
              contentTrait.set('value', currentText);
              contentTrait.set('label', type === 'button' ? 'Texto del botón' : 'Texto del enlace');
              contentTrait.set('placeholder', type === 'button' ? 'Ingrese el texto del botón...' : 'Ingrese el texto del enlace...');
              console.log('✅ Trait "content" actualizado con:', currentText);
            } else {
              console.warn('⚠️ No se encontró el trait "content"');
            }

            // Renderizar el TraitManager para mostrar los traits en la pestaña Settings
            setTimeout(() => {
              gEditor.TraitManager.render();
              console.log('🔄 TraitManager renderizado - traits visibles en Settings');
            }, 100);
          }, 50);
        } catch (error) {
          console.error('❌ Error al seleccionar componente:', error);
        }

        // ================= FIX IMÁGENES =================
        // Normalizar: remover atributos width/height y poner solo en style
        try {
          if (component.getTag?.() === 'img' || component.get('type') === 'image') {
            const attrs = component.getAttributes();
            if (attrs.width || attrs.height) {
              console.log('📸 Normalizando dimensiones de imagen...', attrs.width, attrs.height);
              const w = attrs.width ? attrs.width + (String(attrs.width).includes('%') ? '' : 'px') : '';
              const h = attrs.height ? attrs.height + (String(attrs.height).includes('%') ? '' : 'px') : '';

              const newAttrs = { ...attrs };
              delete newAttrs.width;
              delete newAttrs.height;
              component.setAttributes(newAttrs);

              if (w) component.addStyle({ width: w });
              if (h) component.addStyle({ height: h });

              setHasUnsavedChanges(true);
              scheduleAutoSave();
            }
          }
        } catch (err) {
          console.warn('⚠️ No se pudieron normalizar dimensiones de imagen:', err);
        }
      });

      // ====== AUTO-EXPANDIR SECCIÓN DE LISTAS ======
      gEditor.on('component:selected', (component: any) => {
        try {
          const tagName = component.get('tagName');

          // Detectar si es un elemento de lista
          if (tagName === 'UL' || tagName === 'OL' || tagName === 'LI') {
            console.log('📜 Lista seleccionada, expandiendo sector de Listas...');

            // Esperar un momento para que el Style Manager se renderice
            setTimeout(() => {
              try {
                const styleManager = gEditor.StyleManager;
                const sectors = styleManager.getSectors();

                // Buscar el sector de Listas
                const listasSector = sectors.models.find((sector: any) =>
                  sector.get('name') === '📜 Listas'
                );

                if (listasSector) {
                  // Expandir el sector de Listas
                  listasSector.set('open', true);

                  // Cerrar otros sectores para dar más espacio (opcional)
                  sectors.models.forEach((sector: any) => {
                    const sectorName = sector.get('name');
                    if (sectorName !== '📜 Listas' && sectorName !== '📝 Texto' && sectorName !== '🎨 Apariencia') {
                      sector.set('open', false);
                    }
                  });

                  // Forzar re-render del Style Manager
                  styleManager.render();

                  // Scroll al sector de Listas si está fuera de vista
                  setTimeout(() => {
                    const stylesPanel = document.querySelector('#styles-panel');
                    const listasHeader = Array.from(document.querySelectorAll('.gjs-sm-sector-title'))
                      .find(el => el.textContent?.includes('📜 Listas'));

                    if (stylesPanel && listasHeader) {
                      listasHeader.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }, 100);

                  console.log('✅ Sector de Listas expandido automáticamente');
                }
              } catch (e) {
                console.warn('No se pudo expandir el sector de Listas:', e);
              }
            }, 150);
          }
        } catch (error) {
          console.error('❌ Error en auto-expansión de Listas:', error);
        }
      });

      // 🔧 SINCRONIZACIÓN DESDE SETTINGS (pestaña tuerca): Cuando se edita el trait 'content'
      gEditor.on('trait:change', (component: any, trait: any) => {
        try {
          if (!component || !trait || trait.get('name') !== 'content') return;

          const type = component.get('type');
          if (type !== 'button' && type !== 'link') return;

          const newValue = trait.get('value');
          if (newValue !== null && newValue !== undefined) {
            console.log('✏️ Texto actualizado desde Settings:', newValue);
            // Actualizar el contenido visible del botón/enlace sin alterar estructura
            component.set('content', String(newValue));
            // Sincronizar atributo data-label para usos públicos
            component.addAttributes({ 'data-label': String(newValue) });
            setHasUnsavedChanges(true);
            scheduleAutoSave();
          }
        } catch (error) {
          console.error('❌ Error al actualizar desde Settings:', error);
        }
      });

      // 🔧 FIX sugerido: actualizar desde data-label también, garantizando edición independiente
      gEditor.on('trait:change:data-label', (component: any, trait: any) => {
        try {
          const v = trait?.get?.('value') || '';
          if (!component) return;
          component.set('content', String(v));
          component.addAttributes({ 'data-label': String(v) });
          setHasUnsavedChanges(true);
          scheduleAutoSave();
        } catch (e) {
          console.warn('No se pudo actualizar desde data-label', e);
        }
      });

      // Guardar instancia y configurar logs
      editorInstanceRef.current = gEditor;
      try { (window as any).editor = gEditor; (window as any).__gjs = gEditor; } catch (e) { }

      // Inicializar TraitManager después de cargar
      gEditor.on('load', () => {
        setTimeout(() => {
          gEditor.TraitManager.render();
        }, 300);
      });

      // Inyectar fuentes globales y asegurar estilos en iframe
      gEditor.on('load', () => {
        const frame = gEditor.Canvas.getFrameEl();
        const doc = frame?.contentDocument || gEditor.Canvas.getDocument();
        try {
          if (doc?.head) {
            // Fuente Inter (opcional)
            const fontHref = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap';
            if (!doc.head.querySelector(`link[rel="stylesheet"][href="${fontHref}"]`)) {
              const linkFont = doc.createElement('link');
              linkFont.rel = 'stylesheet';
              linkFont.href = fontHref;
              doc.head.appendChild(linkFont);
              console.log('🔡 Fuente Inter inyectada en canvas');
            }
            // Asegurar Tailwind
            injectTailwindIntoCanvas();

            // Estilos persistentes para listas (se exportan al CSS final)
            gEditor.addStyle(`
              ul { list-style-type: disc; padding-left: 1.5rem; margin: 1rem 0; }
              ol { list-style-type: decimal; padding-left: 1.5rem; margin: 1rem 0; }
              li { display: list-item; }
              li::marker { color: inherit; }
              .text-gradient {
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                display: inline-block;
              }
            `);

            // --- REGISTRO EXPLÍCITO DE BOTONES RTE ---
            console.log('📝 Registrando botones de lista en el RTE...');
            const rte = gEditor.RichTextEditor;

            // Botón Lista Ordenada
            rte.add('ordered-list', {
              icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7,13H21V11H7M7,19H21V17H7M7,7H21V5H7M2,11H5V12H4V13H5V14H2V13H3V12H2M3,8H2V4H3V5H4V4H5V8H4V7H3M2,17H4V17.5H3V18.5H4V19H2V20H5V16H2V17Z"></path></svg>',
              attributes: { title: 'Lista Ordenada (1, 2, 3)' },
              result: (rte: any) => rte.exec('insertOrderedList')
            });

            // Botón Lista Desordenada
            rte.add('unordered-list', {
              icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7,13H21V11H7M7,19H21V17H7M7,7H21V5H7M3,10C2.45,10 2,10.45 2,11C2,11.55 2.45,12 3,12C3.55,12 4,11.55 4,11C4,10.45 3.55,10 3,10M3,4C2.45,4 2,4.45 2,5C2,5.55 2.45,6 3,6C3.55,6 4,5.55 4,5C4,4.45 3.55,4 3,4M3,16C2.45,16 2,16.45 2,17C2,17.55 2.45,18 3,18C3.55,18 4,17.55 4,17C4,16.45 3.55,16 3,16Z"></path></svg>',
              attributes: { title: 'Lista Desordenada (Viñetas)' },
              result: (rte: any) => rte.exec('insertUnorderedList')
            });
          }
        } catch (e) {
          console.warn('No se pudieron inyectar estilos/fuentes en iframe:', e);
        }
      });

      // ======================================================
      // BLOQUEO DE ACCIONES INTERACTIVAS DENTRO DEL IFRAME
      // ======================================================
      gEditor.on('load', () => {
        // 🎯 PASO 2: Corregir escalado/zoom del canvas para alineación perfecta
        const frame = gEditor.Canvas.getFrameEl();
        if (frame) {
          frame.style.transform = 'none';
          frame.style.zoom = '1';
          frame.style.width = '100%';
          frame.style.height = '100%';
          frame.style.display = 'block';
          console.log('🎯 Canvas frame: escalado corregido para alineación perfecta');
        }

        const canvasWrapper = document.querySelector('.gjs-cv-canvas') as HTMLElement;
        if (canvasWrapper) {
          canvasWrapper.style.transform = 'none';
          canvasWrapper.style.zoom = '1';
          canvasWrapper.style.width = '100%';
          canvasWrapper.style.height = '100%';
          console.log('🎯 Canvas wrapper: escalado corregido');
        }

        // Configuración del iframe para responsividad
        if (!frame || !frame.contentWindow) return;

        const frameWin = frame.contentWindow;
        const frameDoc = frameWin.document;
        try { (frameWin as any).__GJS_IS_EDITOR = true; } catch { }

        // Asegurar viewport correcto en el iframe
        let viewportMeta = frameDoc.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
          viewportMeta = frameDoc.createElement('meta');
          viewportMeta.setAttribute('name', 'viewport');
          frameDoc.head.appendChild(viewportMeta);
        }
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, shrink-to-fit=no');
        console.log('🎯 Viewport meta configurado en iframe del canvas');

        // 🔒 Interceptar eventos en el iframe del canvas para evitar navegación/acciones en modo edición,
        //     sin impedir la selección/edición de componentes por GrapesJS
        try {
          const intercept = (e: Event) => {
            const target = e.target as HTMLElement | null;
            const anchor = target?.closest('a');
            const submitEl = target?.closest('form, input[type="submit"]');
            if (anchor) {
              // Evitar navegación de enlaces dentro del editor pero permitir selección/edición
              e.preventDefault();
              console.log('⛔ Navegación de <a> bloqueada en editor');
            } else if (submitEl) {
              // Bloquear envío de formularios en el editor
              e.preventDefault();
              console.log('⛔ Submit bloqueado en editor');
            }
          };
          frameDoc.addEventListener('click', intercept, true);
          frameDoc.addEventListener('submit', intercept, true);
          // No bloquear dblclick ni keydown para permitir edición de texto
          // Bloquear navegación específica en dropdown del editor
          frameDoc.addEventListener('click', (e: any) => {
            try {
              const t = e.target as HTMLElement | null;
              if (t && t.closest('.dropdown-content a')) {
                e.preventDefault();
                console.warn('⛔ Navegación de dropdown bloqueada en el editor');
              }
            } catch { }
          }, true);
          (gEditor as any)._cleanupIntercept = () => {
            frameDoc.removeEventListener('click', intercept, true);
            frameDoc.removeEventListener('submit', intercept, true);
            // dblclick y keydown no fueron registrados
          };
        } catch (e) {
          console.warn('No se pudo interceptar eventos en iframe:', e);
        }

        // 🎯 Aplicar estilos CSS al canvas del iframe
        const canvasStyles = `
          body, html { margin: 0; padding: 0; height: 100%; box-sizing: border-box; }
          * { box-sizing: border-box; }
          .dragging { opacity: 0.7 !important; border: 2px dashed #3b82f6 !important; z-index: 9999 !important; }
          .gjs-placeholder { background: rgba(59,130,246,0.1) !important; border: 2px dashed #3b82f6 !important; min-height: 50px !important; }
          .gjs-selected { outline: 2px solid #3b82f6 !important; outline-offset: -2px !important; }
          .gjs-hovered { outline: 1px dashed #8b5cf6 !important; outline-offset: -1px !important; }
        `;

        let styleElement = frameDoc.querySelector('#grapes-canvas-styles');
        if (!styleElement) {
          styleElement = frameDoc.createElement('style');
          styleElement.id = 'grapes-canvas-styles';
          frameDoc.head.appendChild(styleElement);
        }
        styleElement.textContent = canvasStyles;
        console.log('🎯 Estilos CSS aplicados al canvas del iframe');

        console.log('🧠 Inyectando bloqueo dentro del iframe de GrapesJS...');

        // Bloqueo refinado: prevenir acciones pero permitir selección
        frameDoc.addEventListener("click", (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (!target) return;

          const tag = target.tagName.toLowerCase();
          const interactiveTags = ["a", "button", "input", "video", "form", "iframe"];

          if (interactiveTags.includes(tag)) {
            // Verificar si tiene traits interactivos
            const hasInteractiveTraits = target.hasAttribute('data-action-type') ||
              target.hasAttribute('data-url') ||
              target.hasAttribute('href') ||
              target.hasAttribute('onclick') ||
              target.hasAttribute('data-file-url');

            if (hasInteractiveTraits) {
              // Solo prevenir la acción por defecto (navegación, submit, etc.)
              e.preventDefault();
              console.log("🚫 Bloqueado clic interactivo en editor:", tag);

              // NO usar stopPropagation para permitir que GrapesJS maneje la selección
              // GrapesJS necesita que el evento burbujee para detectar la selección
            }
          }
        }, false); // Cambiar a false para permitir que GrapesJS capture primero

        console.log('✅ Bloqueo activo dentro del iframe del editor.');
      });

      // Sin estado: editorInstanceRef mantiene la instancia

      // Traits personalizados para botones y enlaces
      try {
        const dc: any = (gEditor as any).DomComponents;
        if (dc && dc.addType) {

          // =================== TRAIT PERSONALIZADO: FILE UPLOAD ===================
          gEditor.TraitManager.addType('file-upload', {
            createInput({ trait }: any) {
              const el = document.createElement('div');
              el.className = 'gjs-field gjs-field-file';
              el.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 5px;">
                  <button type="button" class="gjs-btn-prim" style="width: 100%;">Seleccionar archivo</button>
                  <input type="file" style="display: none;" />
                  <input type="text" placeholder="URL del archivo" readonly style="width: 100%; font-size: 12px; padding: 5px; background: rgba(0,0,0,0.1); border: none; border-radius: 3px;" />
                </div>
              `;

              const btn = el.querySelector('button') as HTMLButtonElement;
              const fileInput = el.querySelector('input[type="file"]') as HTMLInputElement;
              const urlInput = el.querySelector('input[type="text"]') as HTMLInputElement;

              // Set initial value
              const initialValue = trait.get('value') || '';
              urlInput.value = initialValue;

              btn.onclick = () => fileInput.click();

              fileInput.onchange = async (e: any) => {
                const file = e.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('file', file);

                try {
                  btn.textContent = 'Subiendo...';
                  btn.disabled = true;
                  urlInput.value = 'Subiendo...';

                  const token = localStorage.getItem('accessToken');
                  const response = await fetch('/api/upload/button-file', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    },
                    body: formData
                  });

                  const result = await response.json();
                  if (result.success) {
                    const fileUrl = result.data.url;
                    urlInput.value = fileUrl;
                    trait.set('value', fileUrl); // Update trait value
                    btn.textContent = '✅ Archivo subido';
                    setTimeout(() => btn.textContent = 'Cambiar archivo', 2000);
                  } else {
                    alert('Error al subir archivo: ' + result.message);
                    urlInput.value = trait.get('value') || '';
                    btn.textContent = 'Seleccionar archivo';
                  }
                } catch (err) {
                  console.error(err);
                  alert('Error de conexión al subir archivo');
                  urlInput.value = trait.get('value') || '';
                  btn.textContent = 'Seleccionar archivo';
                } finally {
                  btn.disabled = false;
                }
              };

              return el;
            }
          });

          // =================== COMPONENTES DE LISTA ===================
          dc.addType('ul', {
            isComponent: (el: any) => el.tagName === 'UL',
            model: {
              defaults: {
                tagName: 'ul',
                droppable: 'li',
                draggable: true,
                editable: true,
              }
            }
          });

          dc.addType('ol', {
            isComponent: (el: any) => el.tagName === 'OL',
            model: {
              defaults: {
                tagName: 'ol',
                droppable: 'li',
                draggable: true,
                editable: true,
              }
            }
          });

          dc.addType('li', {
            isComponent: (el: any) => el.tagName === 'LI',
            model: {
              defaults: {
                tagName: 'li',
                draggable: 'ul, ol',
                droppable: true,
                editable: true,
              }
            }
          });

          // =================== BOTÓN ===================
          dc.addType('button', {
            isComponent: (el: any) => {
              if (!el || !el.tagName) return false;
              const tagName = el.tagName.toLowerCase();
              // <button> siempre es botón.
              if (tagName === 'button') return true;
              // FIX B: un <a> solo es "botón" cuando lo es de verdad:
              // - tiene clase explícita btn/button, o
              // - es un botón de acción del sistema (data-action-type / data-label).
              // Antes se capturaba cualquier <a> con padding o display:block inline,
              // lo que convertía enlaces de texto normales (Tailwind) en botones NO
              // editables. Ahora esos enlaces quedan editables como texto (Fix A).
              if (tagName === 'a') {
                const cls = (el.className || '').toString();
                if (/\b(btn|button)\b/.test(cls)) return true;
                const getAttr = typeof el.getAttribute === 'function' ? (n: string) => el.getAttribute(n) : () => null;
                if (getAttr('data-action-type') || getAttr('data-label')) return true;
                return false;
              }
              return false;
            },
            extend: 'button',
            model: {
              defaults: {
                tagName: 'button',
                draggable: true,
                droppable: true, // Permitir arrastrar elementos dentro (como iconos)
                editable: false,  // Modificado: false para que texto inline y elementos hijos coistan bien
                stylable: true,  // Asegurar que sea estilizable
                traits: [
                  // Trait para cambiar el texto
                  {
                    type: 'text',
                    label: 'Texto del botón',
                    name: 'content',
                    changeProp: true,
                  },
                  {
                    type: 'text',
                    label: 'ID',
                    name: 'id',
                  },
                  {
                    type: 'text',
                    label: 'Clase CSS',
                    name: 'class',
                  },
                  {
                    type: 'select',
                    label: 'Tipo de acción',
                    name: 'data-action-type',
                    options: [
                      { id: 'none', name: 'Sin acción' },
                      { id: 'link', name: 'Enlace' },
                      { id: 'open_pdf', name: 'Abrir PDF' },
                      { id: 'download', name: 'Descargar' },
                      { id: 'go_to_payment', name: 'Ir a pago' },
                      { id: 'execute-function', name: 'Ejecutar función' }
                    ],
                    changeProp: true,
                  },
                  {
                    type: 'text',
                    label: 'URL',
                    name: 'data-url',
                    visible: false,
                  },
                  {
                    type: 'select',
                    label: 'Abrir en',
                    name: 'data-target',
                    changeProp: true,
                    options: [
                      { id: '_self', name: 'Misma ventana' },
                      { id: '_blank', name: 'Nueva ventana' }
                    ],
                    visible: false,
                  },
                  {
                    type: 'file-upload', // Usar nuestro trait personalizado
                    label: 'Subir archivo',
                    name: 'data-file-url',
                    visible: false,
                  },
                  {
                    type: 'text',
                    label: 'ID de transacción',
                    name: 'data-transaction-id',
                    visible: false,
                  },
                  {
                    type: 'number',
                    label: 'Monto',
                    name: 'data-amount',
                    visible: false,
                  },
                  {
                    type: 'textarea',
                    label: 'Código JavaScript',
                    name: 'data-custom-function',
                    visible: false,
                  },
                  {
                    type: 'checkbox',
                    label: 'Abrir en nueva pestaña',
                    name: 'data-new-tab',
                    visible: false,
                    valueTrue: 'true',
                    valueFalse: 'false',
                  },
                ],

                script: function () {
                  const el = this as unknown as HTMLElement;

                  function doAction(e: Event) {
                    try {
                      // 🚫 En el editor, NO ejecutar la acción - dejar que GrapesJS maneje el evento
                      if (checkEditorContext()) {
                        console.log('🎯 Acción de button interceptada por el editor');
                        return; // No hacer nada, GrapesJS manejará el evento
                      }

                      // 🚫 Si el elemento está marcado como "en modo editor", no ejecutar
                      if (el.hasAttribute('data-grapes-editing')) {
                        console.log('🎯 Button en modo edición - acción bloqueada');
                        return;
                      }

                      const act = (el.getAttribute('data-action-type') || 'none');
                      if (act === 'none') return;

                      const url = el.getAttribute('data-url') || el.getAttribute('data-file-url') || el.getAttribute('href');
                      const newTabAttr = el.getAttribute('data-new-tab');
                      const targetAttr = el.getAttribute('data-target') || el.getAttribute('target');

                      // Lógica corregida: Priorizar explícitamente _blank o _self
                      let newTab = false;
                      if (targetAttr === '_blank') newTab = true;
                      else if (targetAttr === '_self') newTab = false;
                      else if (newTabAttr === 'true' || newTabAttr === '1') newTab = true;

                      if (act === 'link' && url) {
                        console.log('🔗 [Script 2] Abriendo enlace - target:', targetAttr, 'newTab:', newTab, 'URL:', url);
                        newTab ? window.open(url, '_blank') : (window.location.href = url);
                      } else if (act === 'open_pdf' && url) {
                        window.open(url, '_blank');
                      } else if (act === 'download' && url) {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = url.split('/').pop() || 'archivo';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      } else if (act === 'go_to_payment') {
                        const tx = el.getAttribute('data-transaction-id') || '';
                        const amount = el.getAttribute('data-amount') || '';
                        const payUrl = url || '/pago';
                        const finalUrl = payUrl + (payUrl.indexOf('?') === -1 ? '?' : '&') +
                          'tx=' + encodeURIComponent(tx) + '&amount=' + encodeURIComponent(amount);
                        newTab ? window.open(finalUrl, '_blank') : (window.location.href = finalUrl);
                      }

                      if (e && e.preventDefault) e.preventDefault();
                    } catch (err) {
                      console.warn('button action error', err);
                    }
                  }

                  el.addEventListener('click', doAction);
                  return {
                    destroy: function () {
                      el.removeEventListener('click', doAction);
                    }
                  };
                },

                // ⚠️ IMPORTANTE: Todos los traits deben estar aquí para persistir en HTML
                scriptProps: [
                  'data-action-type',
                  'data-file-url',
                  'data-transaction-id',
                  'data-amount',
                  'data-new-tab',
                  'href',
                  'target',
                  'data-url',
                  'data-custom-function'
                ],
              }, // Close defaults

              // LÓGICA DE VISIBILIDAD DE TRAITS
              init() {
                this.listenTo(this, 'change:attributes:data-action-type', this.handleActionChange);
                this.handleActionChange();
              },

              updated(property: any, value: any, prevValue: any) {
                if (property === 'attributes' && value && value['data-action-type'] !== prevValue?.['data-action-type']) {
                  this.handleActionChange();
                }
              },

              handleActionChange() {
                const actionType = this.getAttributes()['data-action-type'] || 'none';
                const traits = this.get('traits');

                if (!traits) return;

                // Ocultar todos primero
                const toHide = ['data-url', 'data-target', 'data-file-url', 'data-transaction-id', 'data-amount', 'data-custom-function'];

                toHide.forEach(name => {
                  const trait = traits.where({ name })[0];
                  if (trait) trait.set('visible', false);
                });

                // Mostrar según selección
                if (actionType === 'link') {
                  const t1 = traits.where({ name: 'data-url' })[0];
                  const t2 = traits.where({ name: 'data-target' })[0];
                  if (t1) t1.set('visible', true);
                  if (t2) t2.set('visible', true);
                }
                else if (actionType === 'open_pdf' || actionType === 'download') {
                  const t = traits.where({ name: 'data-file-url' })[0];
                  if (t) t.set('visible', true);
                }
                else if (actionType === 'go_to_payment') {
                  const t1 = traits.where({ name: 'data-transaction-id' })[0];
                  const t2 = traits.where({ name: 'data-amount' })[0];
                  if (t1) t1.set('visible', true);
                  if (t2) t2.set('visible', true);
                }
                else if (actionType === 'execute-function') {
                  const t = traits.where({ name: 'data-custom-function' })[0];
                  if (t) t.set('visible', true);
                }
              }
            },
          });

          // =================== ENLACE ===================
          dc.addType('link', {
            isComponent: (el: any) => {
              if (!el || !el.tagName) return false;
              return el.tagName.toLowerCase() === 'a';
            },
            extend: 'link',
            model: {
              defaults: {
                tagName: 'a',
                draggable: true,
                droppable: true,
                editable: true,

                traits: [
                  {
                    type: 'text',
                    label: 'Texto del enlace',
                    name: 'text',
                    changeProp: true,
                  },
                  {
                    type: 'text',
                    label: 'URL',
                    name: 'href',
                    placeholder: 'https://ejemplo.com',
                  },
                  {
                    type: 'select',
                    label: 'Target',
                    name: 'target',
                    options: [
                      { id: '', name: 'Misma ventana' },
                      { id: '_blank', name: 'Nueva ventana' }
                    ],
                  },
                  {
                    type: 'text',
                    label: 'ID',
                    name: 'id',
                  },
                  {
                    type: 'text',
                    label: 'Clase CSS',
                    name: 'class',
                  },
                  {
                    type: 'select',
                    label: 'Tipo de acción',
                    name: 'data-action-type',
                    options: [
                      { id: 'link', name: 'Enlace' },
                      { id: 'open_pdf', name: 'Abrir PDF' },
                      { id: 'download', name: 'Descargar' },
                      { id: 'go_to_payment', name: 'Ir a pago' },
                    ],
                  },
                  {
                    type: 'text',
                    label: 'ID de transacción',
                    name: 'data-transaction-id',
                  },
                  {
                    type: 'number',
                    label: 'Monto',
                    name: 'data-amount',
                  },
                ],

                script: function () {
                  const el = this as unknown as HTMLElement;

                  // 🚫 NO ejecutar en el contexto del editor GrapesJS
                  // Solo ejecutar si NO estamos en el editor
                  if (checkEditorContext()) {
                    console.log('🎯 Script de link deshabilitado en el editor');
                    return { destroy: function () { } };
                  }

                  function onClick(e: Event) {
                    try {
                      // 🚫 En el editor, NO ejecutar la acción - dejar que GrapesJS maneje el evento
                      if (checkEditorContext()) {
                        console.log('🎯 Acción de link interceptada por el editor');
                        return; // No hacer nada, GrapesJS manejará el evento
                      }

                      // 🚫 Si el elemento está marcado como "en modo editor", no ejecutar
                      if (el.hasAttribute('data-grapes-editing')) {
                        console.log('🎯 Link en modo edición - acción bloqueada');
                        return;
                      }

                      const act = (el.getAttribute('data-action-type') || 'link');
                      const url = el.getAttribute('href') || el.getAttribute('data-file-url');
                      const targetAttr = el.getAttribute('target') || el.getAttribute('data-target');

                      // Lógica corregida para links
                      let newTab = false;
                      if (targetAttr === '_blank') newTab = true;
                      else if (targetAttr === '_self') newTab = false;

                      if (act === 'link' && url) {
                        newTab ? window.open(url, '_blank') : (window.location.href = url);
                      } else if (act === 'open_pdf' && url) {
                        window.open(url, '_blank');
                      } else if (act === 'download' && url) {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = url.split('/').pop() || 'archivo';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      } else if (act === 'go_to_payment') {
                        const tx = el.getAttribute('data-transaction-id') || '';
                        const amount = el.getAttribute('data-amount') || '';
                        const payUrl = url || '/pago';
                        const finalUrl = payUrl + (payUrl.indexOf('?') === -1 ? '?' : '&') +
                          'tx=' + encodeURIComponent(tx) + '&amount=' + encodeURIComponent(amount);
                        newTab ? window.open(finalUrl, '_blank') : (window.location.href = finalUrl);
                      }

                      if (e && e.preventDefault) e.preventDefault();
                    } catch (err) {
                      console.warn('link action error', err);
                    }
                  }

                  el.addEventListener('click', onClick);
                  return {
                    destroy: function () {
                      el.removeEventListener('click', onClick);
                    }
                  };
                },

                // ⚠️ IMPORTANTE: Todos los traits deben estar aquí para persistir en HTML
                scriptProps: [
                  'data-action-type',
                  'href',
                  'data-file-url',
                  'data-transaction-id',
                  'data-amount',
                  'target',
                  'data-url',
                  'data-target'
                ],
              },
            },
          });

          console.log('✅ Traits personalizados registrados para button y link');
        }
      } catch (e) {
        console.warn('No se pudieron registrar traits personalizados de button/link', e);
      }

      // ====== SINCRONIZACIÓN DE TEXTO EN BOTONES (SETTINGS - TUERCA) FIN ======

      // Definir un dispositivo ancho para activar breakpoints md de Tailwind
      try {
        gEditor.setDevice("Wide");
        console.log('📐 Dispositivo del canvas configurado: Wide (1024px)');
      } catch (e) {
        console.warn('⚠️ No se pudo configurar dispositivo Wide:', e);
      }

      // Registrar tipo SVG como estilable para alineación
      try {
        const dc: any = (gEditor as any).DomComponents;
        if (dc && dc.addType) {
          dc.addType('svg', {
            isComponent: (el: any) => !!el && (String(el.tagName).toLowerCase() === 'svg' || el instanceof (window as any).SVGElement),
            model: {
              defaults: {
                tagName: 'svg',
                stylable: ['display', 'margin', 'margin-left', 'margin-right', 'float', 'align-self', 'justify-self', 'text-align', 'position', 'left', 'right', 'transform'],
                resizable: true,
                traits: [
                  {
                    type: 'select',
                    label: 'Alineación',
                    name: 'svgAlign',
                    options: [
                      { id: 'left', name: 'Izquierda' },
                      { id: 'center', name: 'Centro' },
                      { id: 'right', name: 'Derecha' },
                    ],
                  },
                ],
              },
              init(this: any) {
                this.on('change:svgAlign', () => {
                  try {
                    const value = this.get('svgAlign') || 'left';
                    const el: HTMLElement | null = (this as any)?.view?.el || null;
                    const parentComp: any = (this as any)?.parent?.() || null;
                    const parentEl: HTMLElement | null = parentComp?.view?.el || el?.parentElement || null;
                    const cs = el ? window.getComputedStyle(el) : null;
                    const pcs = parentEl ? window.getComputedStyle(parentEl) : null;

                    const isAbs = cs ? (cs.position === 'absolute' || cs.position === 'fixed') : false;
                    const isFlexParent = pcs ? String(pcs.display).includes('flex') : false;
                    const isGridParent = pcs ? String(pcs.display).includes('grid') : false;

                    if (value === 'center') {
                      if (isAbs) {
                        (this as any).addStyle({ position: cs?.position || 'absolute', left: '50%', right: '', transform: 'translateX(-50%)', 'margin-left': '', 'margin-right': '' });
                      } else if (isFlexParent) {
                        try { parentComp?.addStyle?.({ 'justify-content': 'center' }); } catch { }
                        (this as any).addStyle({ 'margin-left': '', 'margin-right': '', display: 'block' });
                      } else if (isGridParent) {
                        (this as any).addStyle({ 'justify-self': 'center' });
                      } else {
                        try { parentComp?.addStyle?.({ 'text-align': 'center' }); } catch { }
                        (this as any).addStyle({ display: 'inline-block' });
                      }
                    } else if (value === 'right') {
                      if (isAbs) {
                        (this as any).addStyle({ position: cs?.position || 'absolute', right: '0', left: '', transform: '' });
                      } else if (isFlexParent) {
                        try { parentComp?.addStyle?.({ 'justify-content': 'flex-end' }); } catch { }
                        (this as any).addStyle({ display: 'block' });
                      } else if (isGridParent) {
                        (this as any).addStyle({ 'justify-self': 'end' });
                      } else {
                        try { parentComp?.addStyle?.({ 'text-align': 'right' }); } catch { }
                        (this as any).addStyle({ display: 'inline-block' });
                      }
                    } else {
                      if (isAbs) {
                        (this as any).addStyle({ position: cs?.position || 'absolute', left: '0', right: '', transform: '' });
                      } else if (isFlexParent) {
                        try { parentComp?.addStyle?.({ 'justify-content': 'flex-start' }); } catch { }
                        (this as any).addStyle({ display: 'block' });
                      } else if (isGridParent) {
                        (this as any).addStyle({ 'justify-self': 'start' });
                      } else {
                        try { parentComp?.addStyle?.({ 'text-align': 'left' }); } catch { }
                        (this as any).addStyle({ display: 'inline-block' });
                      }
                    }
                  } catch (err) { console.warn('svg align trait error', err); }
                });
              }
            }
          });
          console.log('✅ Tipo SVG registrado como estilable para alineación');

          // =================== PDF VIEWER ===================
          dc.addType('pdf-viewer', {
            isComponent: (el: any) => {
              if (el && el.getAttribute && el.getAttribute('data-gjs-type') === 'pdf-viewer') return { type: 'pdf-viewer' };
              if (el && el.classList && el.classList.contains('pdf-viewer-component')) return { type: 'pdf-viewer' };
              return false;
            },
            model: {
              defaults: {
                tagName: 'div',
                resizable: {
                  tl: true, tc: true, tr: true,
                  ml: true, mr: true,
                  bl: true, bc: true, br: true,
                  minWidth: 10,
                  minHeight: 10,
                  currentUnit: 1,
                  unitWidth: 'px',
                  unitHeight: 'px',
                },
                draggable: true,
                selectable: true,
                hoverable: true,
                removable: true,
                attributes: {
                  'data-gjs-type': 'pdf-viewer',
                  'class': 'pdf-viewer-component',
                  'data-src': '',
                  'data-zoom': 'FitH',
                },
                style: {
                  'min-height': '10px',
                  'width': '100%',
                  'height': '600px',
                  'position': 'relative',
                  'overflow': 'hidden',
                  'margin': '0',
                  'padding': '0',
                },
                stylable: true,
                traits: [
                  {
                    type: 'file-upload',
                    label: 'Subir PDF',
                    name: 'data-src',
                    changeProp: true,
                  },
                  {
                    type: 'text',
                    label: 'URL externa del PDF',
                    name: 'data-src',
                    placeholder: 'https://ejemplo.com/archivo.pdf',
                  },
                  {
                    type: 'select',
                    label: 'Vista/Zoom',
                    name: 'data-zoom',
                    options: [
                      { value: 'FitH', name: 'Ajustar al ancho' },
                      { value: 'FitV', name: 'Ajustar al alto' },
                      { value: '100', name: '100%' },
                      { value: '150', name: '150%' },
                      { value: '200', name: '200%' },
                    ]
                  },
                  {
                    type: 'text',
                    label: 'Ancho',
                    name: 'width',
                    placeholder: '100% o 600px',
                    changeProp: true,
                  },
                  {
                    type: 'text',
                    label: 'Alto',
                    name: 'height',
                    placeholder: '600px',
                    changeProp: true,
                  }
                ],
              },
              init() {
                this.on('change:data-src', () => {
                  this.addAttributes({ 'data-src': this.get('data-src') });
                });
                this.on('change:data-zoom', () => {
                  this.addAttributes({ 'data-zoom': this.get('data-zoom') });
                });
                this.on('change:width', () => {
                  this.addStyle({ width: this.get('width') });
                });
                this.on('change:height', () => {
                  this.addStyle({ height: this.get('height') });
                });
                // Sincronizar cambios del redimensionador (canvas) con los Traits
                this.on('change:style', () => {
                  const style = this.getStyle();
                  if (style.width) this.set('width', style.width, { silent: true });
                  if (style.height) this.set('height', style.height, { silent: true });
                });
              },

              // OVERRIDE: Garantizar que el HTML exportado incluya el iframe
              // Esto soluciona la visibilidad en el público sin depender de scripts
              toHTML() {
                const attrs = { ...this.getAttributes() };
                const src = attrs['data-src'] || this.get('data-src');
                const zoom = attrs['data-zoom'] || 'FitH';
                const style = this.getStyle();

                // Construir string de estilos para el div
                const styleStr = Object.keys(style).map(k => `${k}:${style[k]}`).join(';');

                let content = '';
                if (src) {
                  // Codificar URL para manejar espacios y caracteres especiales como 'N°'
                  const encodedSrc = src.split('/').map(part => encodeURIComponent(part)).join('/').replace(/%3A/g, ':');
                  const pdfUrl = encodedSrc.indexOf('#') !== -1 ? encodedSrc : encodedSrc + '#view=' + zoom + '&toolbar=1';
                  content = `<iframe src="${pdfUrl}" frameborder="0" style="width:100% !important; height:100% !important; border:none !important; display:block !important; pointer-events:auto !important;"></iframe>`;
                }

                return `<div data-gjs-type="pdf-viewer" class="pdf-viewer-component" data-src="${src}" data-zoom="${zoom}" style="${styleStr}">${content}</div>`;
              }
            },
            view: {
              events: {
                'dblclick': 'onDoubleClick',
                'click': 'onClick',
              } as any,

              init() {
                // 🎯 ESCUCHAR CAMBIOS PARA REDIBUJAR
                this.listenTo(this.model, 'change:attributes:data-src', this.render);
                this.listenTo(this.model, 'change:attributes:data-zoom', this.render);
                this.listenTo(this.model, 'change:data-src', this.render);
              },

              onClick(e: MouseEvent) {
                // Forzar selección al hacer clic
                gEditor.select(this.model);
              },

              onDoubleClick(e: MouseEvent) {
                e.preventDefault();
                console.log('🎯 Doble clic detectado en PDF Wrapper');

                // Forzar selección para activar el panel de configuración
                gEditor.select(this.model);

                const traits = this.model.get('traits');
                const trait = (traits as any).where({ type: 'file-upload' })[0];
                if (trait) {
                  const tm = (gEditor as any).TraitManager;
                  const traitView = tm.getTraitsViewer().items.find((item: any) => item.model === trait);
                  if (traitView && traitView.el) {
                    const fileInput = traitView.el.querySelector('input[type="file"]') as HTMLInputElement;
                    if (fileInput) { fileInput.click(); return; }
                  }
                  // Si no lo encuentra, al menos abre el panel
                  gEditor.Panels.getButton('views', 'open-traits')?.set('active', true);
                }
              },

              onRender() {
                const el = this.el;
                const attrs = this.model.getAttributes();
                const src = attrs['data-src'] || this.model.get('data-src');
                const zoom = attrs['data-zoom'] || 'FitH';

                el.innerHTML = '';
                el.style.backgroundColor = src ? 'transparent' : '#f3f4f6';
                el.style.cursor = 'pointer';
                el.style.padding = '0';
                el.style.margin = '0';
                el.style.pointerEvents = 'auto'; // Asegurar que el contenedor reciba clics

                if (src) {
                  const iframe = document.createElement('iframe');
                  // Agregar parámetros de zoom/vista si no están presentes
                  const pdfUrl = src.includes('#') ? src : `${src}#view=${zoom}&toolbar=1`;

                  iframe.src = pdfUrl;
                  iframe.style.width = '100%';
                  iframe.style.height = '100%';
                  iframe.style.border = 'none';
                  iframe.style.display = 'block';
                  iframe.style.pointerEvents = 'none'; // Evita capturar clics para permitir selección en el editor
                  el.appendChild(iframe);

                  const shield = document.createElement('div');
                  shield.style.position = 'absolute';
                  shield.style.top = '0';
                  shield.style.left = '0';
                  shield.style.width = '100%';
                  shield.style.height = '100%';
                  shield.style.zIndex = '1';
                  shield.style.backgroundColor = 'transparent';
                  el.appendChild(shield);
                } else {
                  el.style.border = '2px dashed #9ca3af';
                  const msg = document.createElement('div');
                  msg.style.position = 'absolute';
                  msg.style.top = '50%';
                  msg.style.left = '50%';
                  msg.style.transform = 'translate(-50%, -50%)';
                  msg.style.color = '#4b5563';
                  msg.style.fontFamily = 'sans-serif';
                  msg.style.textAlign = 'center';
                  msg.style.pointerEvents = 'none';
                  msg.innerHTML = '📄 <b>Visualizador de PDF</b><br><small>Haz doble clic para subir archivo</small>';
                  el.appendChild(msg);
                }
              }
            }
          });
          console.log('✅ Tipo PDF Viewer registrado');
        }
      } catch (e) {
        console.warn('Registro de tipo SVG falló', e);
      }

      // Eventos para sincronización de traits con Style Manager
      try {
        gEditor.on('load', () => console.log('🎯 Editor load'));

        // Evento para sincronizar cambios del Style Manager con los traits
        gEditor.on('style:property:update', (property: any) => {
          try {
            const selected = gEditor.getSelected();
            if (!selected) return;

            const propertyName = property.get('property');
            const propertyValue = property.get('value');

            // --- Soporte para Gradiente de Texto ---
            if (propertyName === 'text-gradient-effect') {
              if (propertyValue && propertyValue !== 'none') {
                selected.addStyle({
                  'background-image': propertyValue,
                  '-webkit-background-clip': 'text',
                  'background-clip': 'text',
                  '-webkit-text-fill-color': 'transparent',
                  'display': 'inline-block'
                });
              } else {
                selected.addStyle({
                  'background-image': 'none',
                  '-webkit-background-clip': 'unset',
                  'background-clip': 'unset',
                  '-webkit-text-fill-color': 'unset'
                });
              }
            }


            // --- Soporte para Marcadores de Lista (::marker) ---
            if (propertyName === 'marker-size' || propertyName === 'marker-color' || propertyName === 'marker-gradient') {
              const tagName = selected.get('tagName');

              // Solo aplicar a listas (ul, ol) o items de lista (li)
              if (tagName === 'UL' || tagName === 'OL' || tagName === 'LI') {
                const currentStyles = selected.getStyle();
                const markerSize = propertyName === 'marker-size' ? propertyValue : (currentStyles['marker-size'] || '1em');
                const markerColor = propertyName === 'marker-color' ? propertyValue : (currentStyles['marker-color'] || 'inherit');
                const markerGradient = propertyName === 'marker-gradient' ? propertyValue : (currentStyles['marker-gradient'] || 'none');

                // Guardar los valores en el estilo del componente
                selected.addStyle({
                  'marker-size': markerSize,
                  'marker-color': markerColor,
                  'marker-gradient': markerGradient
                });

                // Generar un ID único si no existe
                let componentId = selected.getId();
                if (!componentId) {
                  componentId = `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                  selected.setId(componentId);
                }

                // Aplicar estilos al ::marker usando CSS
                const markerStyles = [];

                console.log(`🎨 Aplicando estilos de marcador:`, {
                  size: markerSize,
                  color: markerColor,
                  gradient: markerGradient,
                  tagName,
                  componentId
                });

                // Tamaño del marcador
                if (markerSize && markerSize !== '1em') {
                  markerStyles.push(`font-size: ${markerSize} !important;`);
                }

                // Color o gradiente del marcador
                if (markerGradient && markerGradient !== 'none') {
                  // Para gradientes, usamos el primer color del gradiente
                  const firstColor = markerGradient.match(/#[a-fA-F0-9]{3,6}/)?.[0] || markerColor;
                  markerStyles.push(`color: ${firstColor} !important;`);
                  console.log(`🌈 Aplicando gradiente (primer color): ${firstColor}`);
                } else if (markerColor && markerColor !== 'inherit') {
                  markerStyles.push(`color: ${markerColor} !important;`);
                  console.log(`🎨 Aplicando color: ${markerColor}`);
                }

                // Inyectar regla CSS específica para este componente
                if (markerStyles.length > 0) {
                  const markerRule = `
                    #${componentId} li::marker,
                    #${componentId}::marker {
                      ${markerStyles.join(' ')}
                    }
                  `;

                  console.log(`📝 Regla CSS generada:`, markerRule);

                  // Agregar al editor (CSS exportado)
                  gEditor.addStyle(markerRule);

                  // También agregar al documento del canvas (vista en vivo)
                  try {
                    const frame = gEditor.Canvas.getFrameEl();
                    const doc = frame?.contentDocument || gEditor.Canvas.getDocument();
                    if (doc) {
                      let styleEl = doc.getElementById(`marker-style-${componentId}`);
                      if (!styleEl) {
                        styleEl = doc.createElement('style');
                        styleEl.id = `marker-style-${componentId}`;
                        doc.head.appendChild(styleEl);
                        console.log(`✅ Elemento <style> creado para marcador: marker-style-${componentId}`);
                      }
                      styleEl.textContent = markerRule;
                      console.log(`✅ Estilos de marcador aplicados en canvas`);
                    }
                  } catch (e) {
                    console.warn('No se pudo inyectar estilo de marcador en canvas:', e);
                  }
                }
              }
            }

            // Si la propiedad pertenece a la sección de configuración, actualizar el trait correspondiente
            if (propertyName && propertyName.startsWith('data-')) {
              const traitName = propertyName.replace('data-', '');
              const traitsCollection = selected.get('traits');
              const trait = traitsCollection && typeof traitsCollection.find === 'function'
                ? traitsCollection.find((t: any) => t.get('name') === traitName)
                : null;

              if (trait) {
                trait.set('value', propertyValue);
                selected.set(propertyName, propertyValue);
                console.log(`✅ Trait ${traitName} actualizado desde Style Manager:`, propertyValue);
              }
            }
          } catch (e) {
            console.warn('Error sincronizando Style Manager con traits:', e);
          }
        });

        // Evento para manejar cambios en traits y actualizar campos dependientes
        gEditor.on('component:update:traits', (component: any) => {
          try {
            if (component.get('type') === 'button') {
              const actionType = component.get('data-action-type');
              const traits: any[] = component.get('traits') || [];

              // Ocultar todos los campos dependientes primero
              traits.forEach((trait: any) => {
                const traitName = trait.get('name');
                if (['data-url', 'data-target', 'data-file-url', 'data-transaction-id', 'data-amount', 'data-custom-function', 'data-new-tab'].includes(traitName)) {
                  trait?.set?.('visible', false);
                }
              });

              // Mostrar campos según la acción seleccionada
              if (actionType === 'link') {
                const urlTrait = traits.find((t: any) => t.get('name') === 'data-url');
                const targetTrait = traits.find((t: any) => t.get('name') === 'data-target');
                urlTrait?.set?.('visible', true);
                targetTrait?.set?.('visible', true);
              } else if (actionType === 'download' || actionType === 'open_pdf') {
                const fileUrlTrait = traits.find((t: any) => t.get('name') === 'data-file-url');
                fileUrlTrait?.set?.('visible', true);
              } else if (actionType === 'go_to_payment') {
                const txTrait = traits.find((t: any) => t.get('name') === 'data-transaction-id');
                const amountTrait = traits.find((t: any) => t.get('name') === 'data-amount');
                txTrait?.set?.('visible', true);
                amountTrait?.set?.('visible', true);
              } else if (actionType === 'execute-function') {
                const functionTrait = traits.find((t: any) => t.get('name') === 'data-custom-function');
                functionTrait?.set?.('visible', true);
              }

              // Forzar re-renderizado del panel de traits
              gEditor.TraitManager?.render?.();
              console.log(`✅ Traits dinámicos actualizados para acción: ${actionType}`);
            }
            // Sincronizar contenido visible con el trait "Texto" (data-label)
            try {
              const compType = component.get('type');
              if (compType === 'action-button' || compType === 'button') {
                const labelTrait = component.get('traits').find((t: any) => t.get('name') === 'data-label');
                const labelVal = labelTrait ? labelTrait.get('value') : undefined;
                if (typeof labelVal === 'string') {
                  // Actualiza el modelo para que getHtml() refleje el texto en la página pública
                  component.set('content', labelVal);
                }
              }
            } catch { }
          } catch (e) {
            console.warn('Error actualizando traits dinámicos:', e);
          }
        });

        // COMPONENTE 1: Sincronizar contenido visual y data-label cuando cambia 'content'
        gEditor.on('component:update:content', (component: any) => {
          try {
            const type = component.get('type');
            if (type !== 'button' && type !== 'action-button') return;

            const newContent = component.get('content');
            if (!newContent || (typeof newContent === 'string' && !newContent.trim())) return;

            // Actualizar contenido visual (inner text como hijo)
            component.components(newContent);

            // Actualizar atributo data-label para compatibilidad
            if (typeof component.addAttributes === 'function') {
              component.addAttributes({ 'data-label': newContent });
            } else {
              const attrs = component.get('attributes') || {};
              attrs['data-label'] = newContent;
              component.set('attributes', attrs);
            }

            setHasUnsavedChanges(true);
            scheduleAutoSave();
          } catch (e) {
            console.warn('Error en component:update:content:', e);
          }
        });

        // COMPONENTE 2: Sincronización de traits clave para edición estable
        gEditor.on('trait:update', (trait: any) => {
          try {
            const name = trait?.get?.('name');
            const component = gEditor.getSelected?.();
            if (!component) return;
            const type = component.get('type');
            if (type !== 'button' && type !== 'action-button') return;
            const newValue = trait?.get?.('value');
            if (!newValue || (typeof newValue === 'string' && !newValue.trim())) return;

            if (name === 'content') {
              // Actualizar contenido visual
              component.components(newValue);

              // Actualizar data-label
              if (typeof component.addAttributes === 'function') {
                component.addAttributes({ 'data-label': newValue });
              } else {
                const attrs = component.get('attributes') || {};
                (attrs as any)['data-label'] = newValue;
                component.set('attributes', attrs);
              }
            } else if (name === 'data-url' || name === 'href') {
              // Sincronizar URL entre data-url y href
              if (typeof component.addAttributes === 'function') {
                component.addAttributes({ 'data-url': newValue, href: newValue });
              } else {
                const attrs = component.get('attributes') || {};
                (attrs as any)['data-url'] = newValue;
                (attrs as any)['href'] = newValue;
                component.set('attributes', attrs);
              }
            } else if (name === 'data-target') {
              // Sincronizar target entre data-target y target
              if (typeof component.addAttributes === 'function') {
                component.addAttributes({ 'data-target': newValue, target: newValue });
              } else {
                const attrs = component.get('attributes') || {};
                (attrs as any)['data-target'] = newValue;
                (attrs as any)['target'] = newValue;
                component.set('attributes', attrs);
              }
            }

            setHasUnsavedChanges(true);
            scheduleAutoSave();
          } catch (e) {
            console.warn('Error en trait:update:', e);
          }
        });

        // Evento para sincronizar cambios de traits con el Style Manager
        gEditor.on('component:update:traits', (component: any) => {
          try {
            const sm = gEditor.StyleManager;
            const sectors = sm.getSectors();
            const configSector = sectors.find((s: any) => {
              const id = (typeof s.getId === 'function' ? s.getId() : (s.get('id') || s.get('name')));
              return id === 'button-config' || s.get('name') === '⚙️ Configuración';
            });

            if (configSector && configSector.get('visible')) {
              const traits: any[] = component.get('traits') || [];
              const properties = (configSector.get('properties') as any[]) || [];

              traits.forEach((trait: any) => {
                const traitName = trait.get('name');
                const traitValue = trait.get('value');

                // Actualizar la propiedad correspondiente en el Style Manager
                const propertyName = traitName.startsWith('data-') ? traitName : `data-${traitName}`;
                const property = properties.find((p: any) => p.get('property') === propertyName);

                if (property && traitValue !== undefined) {
                  property?.set?.('value', traitValue);
                  console.log(`✅ Style Manager actualizado desde trait ${traitName}:`, traitValue);
                }
              });

              // Forzar re-renderizado del Style Manager
              sm.render?.();
            }
          } catch (e) {
            console.warn('Error sincronizando traits con Style Manager:', e);
          }
        });

        // COMPONENTE 3: Al seleccionar, cargar desde data-label > innerText > content
        gEditor.on('component:selected', (component: any) => {
          try {
            const type = component?.get?.('type');
            if (type !== 'button' && type !== 'action-button') return;

            const el = component.view?.el as HTMLElement | undefined;
            const attrs = typeof component.getAttributes === 'function'
              ? component.getAttributes()
              : (component.get('attributes') || {});

            const dataLabel = attrs?.['data-label'];
            const innerText = el?.innerText?.trim?.() || '';
            const currentText = dataLabel || innerText || component.get('content') || 'Botón';

            // Sincronizar contenido sin forzar re-render innecesario
            const prevText = el?.textContent?.trim?.() || '';
            component.set({ content: currentText }, { silent: true });
            // Solo reescribir hijos si no hay elementos anidados y el texto cambió
            const hasNested = el ? (el.childElementCount > 0) : false;
            if (!hasNested && currentText !== prevText) {
              component.components(currentText);
            }
            if (typeof component.addAttributes === 'function') {
              component.addAttributes({ 'data-label': currentText });
            } else {
              attrs['data-label'] = currentText;
              component.set('attributes', attrs);
            }

            const contentTrait = component.getTrait?.('content');
            if (contentTrait) contentTrait.set?.('value', currentText);

            // Sincronizar URL/Acción/Target desde atributos existentes (href/target)
            try {
              const href = el?.getAttribute?.('href') || (attrs as any)?.href || '';
              const targetAttr = el?.getAttribute?.('target') || (attrs as any)?.target || '';
              const dataUrl = (attrs as any)?.['data-url'] || '';
              const dataAction = (attrs as any)?.['data-action'] || '';
              const updates: Record<string, string> = {};
              if (href && !dataUrl) {
                updates['data-url'] = href;
                if (!dataAction) updates['data-action'] = 'link';
              }
              if (targetAttr && !(attrs as any)['data-target']) {
                updates['data-target'] = targetAttr;
              }
              if (Object.keys(updates).length) {
                if (typeof component.addAttributes === 'function') {
                  component.addAttributes(updates);
                } else {
                  Object.assign(attrs as any, updates);
                  component.set('attributes', attrs);
                }
                // Actualizar UI de traits
                const urlTrait = component.getTrait?.('data-url');
                const actionTrait = component.getTrait?.('data-action');
                const targetTrait = component.getTrait?.('data-target');
                if (urlTrait) urlTrait.set?.('value', updates['data-url'] || dataUrl);
                if (actionTrait) actionTrait.set?.('value', updates['data-action'] || dataAction);
                if (targetTrait) targetTrait.set?.('value', updates['data-target'] || (attrs as any)['data-target'] || '');
                gEditor.TraitManager?.render?.();
              }
            } catch { }
          } catch (e) {
            console.warn('Error en component:selected:', e);
          }
        });

        // COMPONENTE 4: (Eliminado) No se realizará normalización masiva en 'load' para evitar tocar múltiples botones a la vez
      } catch { }



      // Contadores simples desactivados: los helpers globales manejan reintentos

      // Registrar tipo personalizado 'gradient' en StyleManager
      try {
        const sm = gEditor.StyleManager as any;

        // Funciones auxiliares para el gradiente
        const setColorsToUI = (root: HTMLElement, colors: string[], positions?: number[]) => {
          const list = root.querySelector('.gjs-grad-list') as HTMLElement;
          if (!list) return;
          list.innerHTML = '';
          colors.forEach((color, i) => {
            const row = document.createElement('div');
            row.className = 'gjs-grad-row';
            const pos = positions && positions[i] !== undefined ? positions[i] : null;
            row.innerHTML = `
              <div class="gjs-grad-color">
                <input type="color" value="${color}" class="gjs-grad-clr" />
              </div>
              <div class="gjs-grad-position">
                <input type="number" min="0" max="100" value="${pos !== null ? pos : ''}" class="gjs-grad-pos" placeholder="%" />
              </div>
              <div class="gjs-grad-actions">
                <button class="gjs-grad-up">↑</button>
                <button class="gjs-grad-down">↓</button>
                <button class="gjs-grad-del">×</button>
              </div>
            `;
            list.appendChild(row);
          });
        };

        // Función para obtener colores del UI
        // Esta función ya está definida en otra parte del código

        // Función para obtener paradas de color con posiciones
        // Esta función ya está definida en otra parte del código

        // Esta función ya está definida arriba
        const isValidColor = (c: string) => {
          const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
          const rgba = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*(0|1|0?\.\d+))?\s*\)$/;
          return hex.test(c) || rgba.test(c);
        };

        const getColorsFromUI = (root: HTMLElement) => {
          const rows = Array.from(root.querySelectorAll('.gjs-grad-row')) as HTMLElement[];
          return rows.map(r => {
            const v = (r.querySelector('input[type="color"]') as HTMLInputElement)?.value || '#ffffff';
            return isValidColor(v) ? v : '#ffffff';
          });
        };

        const getStopsFromUI = (root: HTMLElement) => {
          const rows = Array.from(root.querySelectorAll('.gjs-grad-row')) as HTMLElement[];
          return rows.map(r => {
            const color = (r.querySelector('input[type="color"]') as HTMLInputElement)?.value || '#ffffff';
            const posInput = r.querySelector('.gjs-grad-pos') as HTMLInputElement;
            const pos = posInput && posInput.value ? Number(posInput.value) : null;
            return { color: isValidColor(color) ? color : '#ffffff', pos: !isNaN(pos as any) ? pos : null };
          });
        };

        // Esta función ya está definida arriba

        // Esta función ya está definida arriba

        const updatePreview = (root: HTMLElement) => {
          const angleInput = root.querySelector('.gjs-grad-angle') as HTMLInputElement;
          const angle = Number(angleInput?.value || 0);
          const rows = getStopsFromUI(root);
          const repeat = (root.querySelector('.gjs-grad-repeat') as HTMLInputElement)?.checked || false;
          const preview = root.querySelector('.gjs-grad-preview') as HTMLElement;
          if (!preview) return;
          if (rows.length <= 1) {
            const only = rows[0]?.color || '#ffffff';
            preview.style.background = only;
            return;
          }
          const anyPos = rows.some(r => typeof r.pos === 'number');
          const stops = rows.map((r, i, arr) => {
            let p = r.pos;
            if (typeof p !== 'number') {
              const step = 100 / (arr.length - 1);
              p = Math.round(step * i);
            }
            const clamp = Math.max(0, Math.min(100, Math.round(p as number)));
            const input = (root.querySelectorAll('.gjs-grad-pos')[i] as HTMLInputElement | undefined);
            if (input && input.value) input.value = String(clamp);
            return `${r.color} ${clamp}%`;
          });
          const fn = repeat ? 'repeating-linear-gradient' : 'linear-gradient';
          preview.style.background = `${fn}(${angle}deg, ${stops.join(', ')})`;
        };

        sm.addType('gradient', {
          create({ props, change }: any) {
            const root = document.createElement('div');
            root.className = 'gjs-grad-root';
            root.innerHTML = `
              <div class="gjs-grad-controls">
                <div class="gjs-field">
                  <label>Modo</label>
                  <select class="gjs-grad-mode">
                    <option value="background">Fondo</option>
                    <option value="text">Texto</option>
                  </select>
                </div>
                <div class="gjs-field">
                  <label>Patrón</label>
                  <select class="gjs-grad-pattern">
                    <option value="free">Libre (ángulo)</option>
                    <option value="tb">Arriba → abajo</option>
                    <option value="bt">Abajo → arriba</option>
                    <option value="lr">Izquierda → derecha</option>
                    <option value="rl">Derecha → izquierda</option>
                    <option value="diag-br">Diagonal ↘︎</option>
                    <option value="diag-bl">Diagonal ↙︎</option>
                  </select>
                </div>
                <label>Ángulo</label>
                <div class="gjs-field">
                  <input type="range" min="0" max="360" value="0" class="gjs-grad-angle" />
                </div>
                <div class="gjs-field">
                  <input type="number" min="0" max="360" value="0" class="gjs-grad-angle-num" />
                </div>
                <div class="gjs-field">
                  <label><input type="checkbox" class="gjs-grad-repeat" /> Repetir patrón</label>
                </div>
                <button class="gjs-grad-add gjs-btn gjs-btn-prim">Agregar color</button>
              </div>
              <div class="gjs-grad-list"></div>
              <div class="gjs-grad-preview"></div>
            `;
            // Inicialización desde el componente seleccionado
            try {
              const sel = gEditor.getSelected();
              const style = sel?.getStyle ? sel.getStyle() : {};
              const bgImg = (style as any)['background-image'] || '';
              const bg = (style as any)['background'] || '';
              const bgColor = (style as any)['background-color'] || '';
              const src = typeof bgImg === 'string' && /linear-gradient\(/.test(bgImg) ? bgImg : (typeof bg === 'string' && /linear-gradient\(/.test(bg) ? bg : '');
              if (src) {
                const m = src.match(/linear-gradient\((\d+)deg,\s*(.*)\)/);
                if (m) {
                  const ang = Number(m[1] || 0);
                  const stopsStr = m[2] || '';
                  const colors = stopsStr.split(',').map(s => s.trim().split(' ')[0]).filter(Boolean);
                  setColorsToUI(root, colors.length ? colors : ['#ffffff', '#000000']);
                  const angleRange = root.querySelector('.gjs-grad-angle') as HTMLInputElement;
                  const angleNum = root.querySelector('.gjs-grad-angle-num') as HTMLInputElement;
                  angleRange.value = String(ang);
                  angleNum.value = String(ang);
                } else {
                  setColorsToUI(root, ['#ffffff', '#000000']);
                }
              } else if (bgColor) {
                setColorsToUI(root, [bgColor]);
              } else {
                setColorsToUI(root, ['#ffffff']);
              }
            } catch {
              setColorsToUI(root, ['#ffffff']);
            }
            updatePreview(root);

            const angleRange = root.querySelector('.gjs-grad-angle') as HTMLInputElement;
            const angleNum = root.querySelector('.gjs-grad-angle-num') as HTMLInputElement;
            const addBtn = root.querySelector('.gjs-grad-add') as HTMLButtonElement;
            const list = root.querySelector('.gjs-grad-list') as HTMLElement;
            const modeSel = root.querySelector('.gjs-grad-mode') as HTMLSelectElement;
            const patternSel = root.querySelector('.gjs-grad-pattern') as HTMLSelectElement;
            const repeatChk = root.querySelector('.gjs-grad-repeat') as HTMLInputElement;

            // Preseleccionar modo Texto si la propiedad corresponde al gradiente de texto
            try {
              const propName = (props && (props.property || (props as any).prop)) || '';
              const propId = (props && (props as any).id) || '';
              if (propId === 'text-gradient' || propName === 'color') {
                modeSel.value = 'text';
              }
            } catch { }

            const syncAngle = (v: number) => {
              angleRange.value = String(v);
              angleNum.value = String(v);
            };

            patternSel.addEventListener('change', (event) => {
              const val = (event.target as HTMLSelectElement).value;
              const map: Record<string, number | undefined> = {
                free: undefined,
                tb: 180,
                bt: 0,
                lr: 90,
                rl: 270,
                'diag-br': 135,
                'diag-bl': 225,
              };
              const ang = map[val];
              if (typeof ang === 'number') { syncAngle(ang); }
              updatePreview(root);
              change({ event });
            });
            repeatChk.addEventListener('change', (event) => { updatePreview(root); change({ event }); });
            modeSel.addEventListener('change', (event) => { updatePreview(root); change({ event }); });

            angleRange.addEventListener('input', (event) => { const v = Math.max(0, Math.min(360, Number((event.target as HTMLInputElement).value))); syncAngle(v); updatePreview(root); change({ event, partial: true }); });
            angleRange.addEventListener('change', (event) => { const v = Math.max(0, Math.min(360, Number((event.target as HTMLInputElement).value))); syncAngle(v); updatePreview(root); change({ event }); });
            angleNum.addEventListener('input', (event) => { const v = Math.max(0, Math.min(360, Number((event.target as HTMLInputElement).value))); syncAngle(v); updatePreview(root); change({ event, partial: true }); });
            angleNum.addEventListener('change', (event) => { const v = Math.max(0, Math.min(360, Number((event.target as HTMLInputElement).value))); syncAngle(v); updatePreview(root); change({ event }); });

            addBtn.addEventListener('click', (event) => {
              const colors = getColorsFromUI(root);
              const last = colors[colors.length - 1] || '#ffffff';
              setColorsToUI(root, [...colors, last]);
              updatePreview(root);
              change({ event });
            });

            list.addEventListener('click', (event) => {
              const target = event.target as HTMLElement;
              const row = target.closest('.gjs-grad-row') as HTMLElement;
              if (!row) return;
              const colors = getColorsFromUI(root);
              const idx = Array.from(list.children).indexOf(row);

              if (target.classList.contains('gjs-grad-del')) {
                colors.splice(idx, 1);
                if (colors.length === 0) colors.push('#ffffff');
                setColorsToUI(root, colors);
                updatePreview(root);
                change({ event });
              } else if (target.classList.contains('gjs-grad-up')) {
                if (idx > 0) {
                  const tmp = colors[idx - 1];
                  colors[idx - 1] = colors[idx];
                  colors[idx] = tmp;
                  setColorsToUI(root, colors);
                  updatePreview(root);
                  change({ event });
                }
              } else if (target.classList.contains('gjs-grad-down')) {
                if (idx < colors.length - 1) {
                  const tmp = colors[idx + 1];
                  colors[idx + 1] = colors[idx];
                  colors[idx] = tmp;
                  setColorsToUI(root, colors);
                  updatePreview(root);
                  change({ event });
                }
              }
            });

            list.addEventListener('input', (event) => {
              updatePreview(root);
              change({ event, partial: true });
            });

            // Validación y normalización de posiciones 0–100%
            list.addEventListener('change', (event) => {
              const t = event.target as HTMLInputElement;
              if (t && t.classList.contains('gjs-grad-pos')) {
                const v = Math.round(Math.max(0, Math.min(100, Number(t.value) || 0)));
                t.value = String(v);
              }
              updatePreview(root);
              change({ event, partial: true });
            });

            return root;
          },
          emit({ props, updateStyle }: any, { event, partial }: any) {
            try {
              const root = (event?.target as HTMLElement)?.closest('.gjs-grad-root') as HTMLElement;
              if (!root) return;
              const stopsUI = getStopsFromUI(root);
              const colors = stopsUI.map(s => s.color);
              const angle = Number((root.querySelector('.gjs-grad-angle') as HTMLInputElement)?.value || 0);
              const selected = gEditor.getSelected();
              const repeat = (root.querySelector('.gjs-grad-repeat') as HTMLInputElement)?.checked || false;
              const mode = (root.querySelector('.gjs-grad-mode') as HTMLSelectElement)?.value || 'background';

              if (colors.length <= 1) {
                const color = colors[0] || '#ffffff';
                updateStyle(color);
                if (selected) {
                  const add: Record<string, any> = { 'background': color, 'background-color': '' };
                  if (mode === 'text') {
                    add['color'] = 'transparent';
                    add['background-clip'] = 'text';
                    add['-webkit-background-clip'] = 'text';
                    add['-webkit-text-fill-color'] = 'transparent';
                  }
                  selected.addStyle(add);
                }
              } else {
                const anyPos = stopsUI.some(s => typeof s.pos === 'number');
                const stops = stopsUI.map((s, i, arr) => {
                  let p = s.pos;
                  if (typeof p !== 'number') {
                    const step = 100 / (arr.length - 1);
                    p = Math.round(step * i);
                  }
                  const clamp = Math.max(0, Math.min(100, Math.round(p as number)));
                  return `${s.color} ${clamp}%`;
                });
                const fn = repeat ? 'repeating-linear-gradient' : 'linear-gradient';
                const value = `${fn}(${angle}deg, ${stops.join(', ')})`;
                updateStyle(value);
                if (selected) {
                  const add: Record<string, any> = { 'background': value, 'background-color': '' };
                  if (mode === 'text') {
                    add['color'] = 'transparent';
                    add['background-clip'] = 'text';
                    add['-webkit-background-clip'] = 'text';
                    add['-webkit-text-fill-color'] = 'transparent';
                  }
                  selected.addStyle(add);
                }
              }
            } catch (e) {
              console.warn('emit gradient error', e);
            }
          },
          update({ props }: any) {
            try {
              const { value, el } = props;
              const root = el as HTMLElement;
              if (!root) return;
              const angleRange = root.querySelector('.gjs-grad-angle') as HTMLInputElement;
              const angleNum = root.querySelector('.gjs-grad-angle-num') as HTMLInputElement;
              const gradMatch = typeof value === 'string' ? value.match(/(repeating-)?linear-gradient\((\d+)deg,\s*(.*)\)/) : null;
              if (gradMatch) {
                const ang = Number(gradMatch[2] || 0);
                const stopsStr = gradMatch[3] || '';
                const parts = stopsStr.split(',').map(s => s.trim());
                const colors = parts.map(p => p.split(' ')[0]).filter(Boolean);
                const positions = parts.map(p => {
                  const m = p.match(/\s(\d+)\%/);
                  return m ? Math.max(0, Math.min(100, Number(m[1]))) : undefined as any;
                });
                setColorsToUI(root, colors.length ? colors : ['#ffffff', '#000000'], positions as any);
                angleRange.value = String(ang);
                angleNum.value = String(ang);
                const repeat = !!gradMatch[1];
                (root.querySelector('.gjs-grad-repeat') as HTMLInputElement).checked = repeat;
              } else {
                // Si no hay gradient en 'background', intentar leer 'background-color'
                try {
                  const sel = gEditor.getSelected();
                  const style = sel?.getStyle ? sel.getStyle() : {};
                  const bgColor = (style as any)['background-color'] || '';
                  if (bgColor) {
                    setColorsToUI(root, [bgColor]);
                  } else {
                    setColorsToUI(root, ['#ffffff']);
                  }
                  // Detectar modo texto
                  try {
                    const modeSel = root.querySelector('.gjs-grad-mode') as HTMLSelectElement;
                    const clip = (style as any)['background-clip'] || '';
                    const color = (style as any)['color'] || '';
                    if ((clip && String(clip).includes('text')) || (color && String(color).includes('transparent'))) {
                      modeSel.value = 'text';
                    } else {
                      modeSel.value = 'background';
                    }
                  } catch { }
                } catch {
                  setColorsToUI(root, ['#ffffff']);
                }
                angleRange.value = '0';
                angleNum.value = '0';
              }
              updatePreview(root);
            } catch (e) {
              console.warn('update gradient error', e);
            }
          }
        });

        // Añadir propiedades de gradiente en sectores reales del StyleManager
        try {
          const sectors = sm.getSectors();
          let aparienciaId: string | undefined;
          let aparienciaSector: any;
          let textoId: string | undefined;
          let textoSector: any;
          sectors.forEach((s: any) => {
            const name = (typeof s.getName === 'function' ? s.getName() : s.get('name'));
            const id = (typeof s.getId === 'function' ? s.getId() : (s.get('id') || name));
            if (name === '🎨 Apariencia') { aparienciaId = id; aparienciaSector = s; }
            if (name === '📝 Texto') { textoId = id; textoSector = s; }
          });
          // Asegurar propiedad de gradiente para fondo en Apariencia
          if (aparienciaId) {
            const props = sm.getProperties(aparienciaId) || [];
            const exists = props.some((p: any) => p.id === 'background-gradient');
            if (!exists) {
              sm.addProperty(aparienciaId, { id: 'background-gradient', type: 'gradient', property: 'background', label: 'Gradiente de fondo', defaults: '' });
            }
            try { aparienciaSector?.set('open', true); } catch { }
          } else {
            console.warn('No se encontró sector "🎨 Apariencia"');
          }
          // Asegurar propiedad de gradiente para texto
          if (textoId) {
            const propsT = sm.getProperties(textoId) || [];
            const existsT = propsT.some((p: any) => p.id === 'text-gradient');
            if (!existsT) {
              sm.addProperty(textoId, { id: 'text-gradient', type: 'gradient', property: 'color', label: 'Gradiente de texto', defaults: '' });
            }
            try { textoSector?.set('open', true); } catch { }
          } else {
            console.warn('No se encontró sector "📝 Texto"');
          }
        } catch (e) {
          console.warn('addProperty gradient error', e);
        }
      } catch (e) {
        console.warn('Registro de tipo gradient falló:', e);
      }

      // Registrar tipo personalizado 'align' para alineación horizontal simple
      try {
        const sm = gEditor.StyleManager as any;
        sm.addType('align', {
          create() {
            const root = document.createElement('div');
            root.className = 'gjs-align-control flex items-center gap-2';
            const mkBtn = (label: string, value: 'left' | 'center' | 'right') => {
              const btn = document.createElement('button');
              btn.className = 'px-2 py-1 text-xs rounded bg-gray-50 hover:bg-gray-100';
              btn.textContent = label;
              btn.dataset.value = value;
              return btn;
            };
            const bLeft = mkBtn('Izquierda', 'left');
            const bCenter = mkBtn('Centro', 'center');
            const bRight = mkBtn('Derecha', 'right');
            [bLeft, bCenter, bRight].forEach(b => root.appendChild(b));
            return root;
          },
          events: {
            'click button': 'onClick',
          },
          onClick(args: any) {
            const target = args?.event?.target as HTMLElement | null;
            const value = (target?.dataset?.value as 'left' | 'center' | 'right') || 'left';
            try {
              args?.property?.setValue?.(value);
            } catch { }
            const ed = (window as any).editor || editorInstanceRef.current;
            const sel = ed?.getSelected?.();
            if (!sel) return;
            try {
              const el: HTMLElement | null = (sel as any)?.getEl?.() || (sel as any)?.view?.el || null;
              const parentComp: any = (sel as any)?.parent?.() || null;
              const parentEl: HTMLElement | null = parentComp?.getEl?.() || parentComp?.view?.el || el?.parentElement || null;
              const cs = el ? window.getComputedStyle(el) : null;
              const pcs = parentEl ? window.getComputedStyle(parentEl) : null;

              const isAbs = cs ? (cs.position === 'absolute' || cs.position === 'fixed') : false;
              const isFlexParent = pcs ? String(pcs.display).includes('flex') : false;
              const isGridParent = pcs ? String(pcs.display).includes('grid') : false;
              const isInline = cs ? (cs.display === 'inline' || cs.display === 'inline-block') : false;
              const isSvg = !!(el && (el instanceof SVGElement));

              if (value === 'center') {
                if (isAbs) {
                  // Centrado para posicionamiento absoluto/fijo
                  (sel as any).addStyle({ position: cs?.position || 'absolute', left: '50%', right: '', transform: 'translateX(-50%)', 'margin-left': '', 'margin-right': '' });
                } else if (isFlexParent) {
                  // Centrado en contenedor flex: usar justify-content en el padre
                  try { parentComp?.addStyle?.({ 'justify-content': 'center' }); } catch { }
                  (sel as any).addStyle({ 'margin-left': '', 'margin-right': '', display: 'block' });
                } else if (isGridParent) {
                  // Centrado en grid: justificar el ítem
                  (sel as any).addStyle({ 'justify-self': 'center' });
                } else if (isInline || isSvg) {
                  // Elementos inline/SVG: centrar vía text-align del padre
                  try { parentComp?.addStyle?.({ 'text-align': 'center' }); } catch { }
                  (sel as any).addStyle({ display: 'inline-block' });
                } else {
                  // Bloque normal: margen auto
                  (sel as any).addStyle({ display: 'block', 'margin-left': 'auto', 'margin-right': 'auto' });
                }
              } else if (value === 'right') {
                if (isAbs) {
                  (sel as any).addStyle({ position: cs?.position || 'absolute', right: '0', left: '', transform: '' });
                } else if (isFlexParent) {
                  try { parentComp?.addStyle?.({ 'justify-content': 'flex-end' }); } catch { }
                  (sel as any).addStyle({ display: 'block' });
                } else if (isGridParent) {
                  (sel as any).addStyle({ 'justify-self': 'end' });
                } else if (isInline || isSvg) {
                  try { parentComp?.addStyle?.({ 'text-align': 'right' }); } catch { }
                  (sel as any).addStyle({ display: 'inline-block' });
                } else {
                  (sel as any).addStyle({ display: 'block', 'margin-left': 'auto', 'margin-right': '0' });
                }
              } else {
                // left
                if (isAbs) {
                  (sel as any).addStyle({ position: cs?.position || 'absolute', left: '0', right: '', transform: '' });
                } else if (isFlexParent) {
                  try { parentComp?.addStyle?.({ 'justify-content': 'flex-start' }); } catch { }
                  (sel as any).addStyle({ display: 'block' });
                } else if (isGridParent) {
                  (sel as any).addStyle({ 'justify-self': 'start' });
                } else if (isInline || isSvg) {
                  try { parentComp?.addStyle?.({ 'text-align': 'left' }); } catch { }
                  (sel as any).addStyle({ display: 'inline-block' });
                } else {
                  (sel as any).addStyle({ display: 'block', 'margin-left': '0', 'margin-right': 'auto' });
                }
              }
            } catch (e) { console.warn('align apply error', e); }
          },
          onValueChange(args: any) {
            const value = (args?.value as 'left' | 'center' | 'right') || 'left';
            const ed = (window as any).editor || editorInstanceRef.current;
            const sel = ed?.getSelected?.();
            if (!sel) return;
            try {
              const el: HTMLElement | null = (sel as any)?.getEl?.() || (sel as any)?.view?.el || null;
              const parentComp: any = (sel as any)?.parent?.() || null;
              const parentEl: HTMLElement | null = parentComp?.getEl?.() || parentComp?.view?.el || el?.parentElement || null;
              const cs = el ? window.getComputedStyle(el) : null;
              const pcs = parentEl ? window.getComputedStyle(parentEl) : null;

              const isAbs = cs ? (cs.position === 'absolute' || cs.position === 'fixed') : false;
              const isFlexParent = pcs ? String(pcs.display).includes('flex') : false;
              const isGridParent = pcs ? String(pcs.display).includes('grid') : false;
              const isInline = cs ? (cs.display === 'inline' || cs.display === 'inline-block') : false;
              const isSvg = !!(el && (el instanceof SVGElement));

              if (value === 'center') {
                if (isAbs) {
                  (sel as any).addStyle({ position: cs?.position || 'absolute', left: '50%', right: '', transform: 'translateX(-50%)', 'margin-left': '', 'margin-right': '' });
                } else if (isFlexParent) {
                  try { parentComp?.addStyle?.({ 'justify-content': 'center' }); } catch { }
                  (sel as any).addStyle({ 'margin-left': '', 'margin-right': '', display: 'block' });
                } else if (isGridParent) {
                  (sel as any).addStyle({ 'justify-self': 'center' });
                } else if (isInline || isSvg) {
                  try { parentComp?.addStyle?.({ 'text-align': 'center' }); } catch { }
                  (sel as any).addStyle({ display: 'inline-block' });
                } else {
                  (sel as any).addStyle({ display: 'block', 'margin-left': 'auto', 'margin-right': 'auto' });
                }
              } else if (value === 'right') {
                if (isAbs) {
                  (sel as any).addStyle({ position: cs?.position || 'absolute', right: '0', left: '', transform: '' });
                } else if (isFlexParent) {
                  try { parentComp?.addStyle?.({ 'justify-content': 'flex-end' }); } catch { }
                  (sel as any).addStyle({ display: 'block' });
                } else if (isGridParent) {
                  (sel as any).addStyle({ 'justify-self': 'end' });
                } else if (isInline || isSvg) {
                  try { parentComp?.addStyle?.({ 'text-align': 'right' }); } catch { }
                  (sel as any).addStyle({ display: 'inline-block' });
                } else {
                  (sel as any).addStyle({ display: 'block', 'margin-left': 'auto', 'margin-right': '0' });
                }
              } else {
                if (isAbs) {
                  (sel as any).addStyle({ position: cs?.position || 'absolute', left: '0', right: '', transform: '' });
                } else if (isFlexParent) {
                  try { parentComp?.addStyle?.({ 'justify-content': 'flex-start' }); } catch { }
                  (sel as any).addStyle({ display: 'block' });
                } else if (isGridParent) {
                  (sel as any).addStyle({ 'justify-self': 'start' });
                } else if (isInline || isSvg) {
                  try { parentComp?.addStyle?.({ 'text-align': 'left' }); } catch { }
                  (sel as any).addStyle({ display: 'inline-block' });
                } else {
                  (sel as any).addStyle({ display: 'block', 'margin-left': '0', 'margin-right': 'auto' });
                }
              }
            } catch (e) { console.warn('align apply error', e); }
          },
          update(args: any) {
            const el = args?.el as HTMLElement;
            try {
              const ed = (window as any).editor || editorInstanceRef.current;
              const sel = ed?.getSelected?.();
              const style = sel?.getStyle?.() || {};
              const ml = String((style as any)['margin-left'] || '');
              const mr = String((style as any)['margin-right'] || '');
              const buttons = el.querySelectorAll('button');
              buttons.forEach((b: any) => b.classList.remove('bg-gray-200'));
              let current: 'left' | 'center' | 'right' = 'left';
              if (ml.includes('auto') && mr.includes('auto')) current = 'center';
              else if (ml.includes('auto')) current = 'right';
              else if (mr.includes('auto')) current = 'left';
              const btn = el.querySelector(`button[data-value="${current}"]`);
              if (btn) btn.classList.add('bg-gray-200');
            } catch { }
          },
        });
      } catch (e) { console.warn('Registro de tipo align falló', e); }

      // Soporte de pegado de imagen/video desde portapapeles con subida a backend
      const attachPasteHandler = () => {
        try {
          const doc = gEditor.Canvas.getDocument();
          const win = (gEditor.Canvas as any)?.getWindow?.() || (doc as any)?.defaultView || null;
          const handlePaste = (e: any) => {
            try {
              const cd = e.clipboardData;
              if (!cd) return;
              const items = cd.items || [];
              const appendAndSelect = (html: string) => {
                try {
                  const targetSel = gEditor.getSelected() || gEditor.getWrapper();
                  if (!targetSel || !(targetSel as any).append) {
                    console.warn('No hay selección ni wrapper para insertar contenido pegado');
                    return;
                  }
                  const comp = (targetSel as any).append(html) as any;
                  const added = Array.isArray(comp) ? comp[comp.length - 1] : comp;
                  try { added?.set?.({ resizable: true }); } catch { }
                  try { gEditor.select(added); } catch { }
                } catch (err) { console.warn('append error', err); }
              };
              // Archivos (imagen/video)
              for (let i = 0; i < items.length; i++) {
                const it = items[i];
                if (it.kind === 'file') {
                  const file = it.getAsFile();
                  if (!file) continue;
                  const type = String(file.type || '');
                  if (type.startsWith('image/')) {
                    // Intentar subir la imagen al backend
                    (async () => {
                      try {
                        const resp: any = await HttpClient.uploadFile('/upload', file);
                        const url = (resp?.data?.url) || (resp?.url) || '';
                        if (url) {
                          appendAndSelect(`<img src="${url}" style="max-width:100%;display:block;object-fit:cover;border-radius:8px;"/>`);
                        } else {
                          // Fallback: incrustar como DataURL si no hay URL
                          const fr = new FileReader();
                          fr.onload = () => appendAndSelect(`<img src="${fr.result}" style="max-width:100%;display:block;object-fit:cover;border-radius:8px;"/>`);
                          fr.readAsDataURL(file);
                        }
                      } catch (err) {
                        console.warn('Upload falló, usando DataURL', err);
                        const fr = new FileReader();
                        fr.onload = () => appendAndSelect(`<img src="${fr.result}" style="max-width:100%;display:block;object-fit:cover;border-radius:8px;"/>`);
                        fr.readAsDataURL(file);
                      }
                    })();
                    e.preventDefault();
                    return;
                  } else if (type.startsWith('video/')) {
                    const url = URL.createObjectURL(file);
                    appendAndSelect(`<video src="${url}" controls style="max-width:100%;display:block;border-radius:8px;"></video>`);
                    e.preventDefault();
                    return;
                  }
                }
              }
              // Texto (URL o data URI)
              for (let i = 0; i < items.length; i++) {
                const it = items[i];
                if (it.kind === 'string') {
                  it.getAsString((text: string) => {
                    try {
                      const t = text.trim();
                      if (!t) return;
                      const isDataImg = t.startsWith('data:image/');
                      const isImgUrl = /\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(t);
                      const isVideoUrl = /\.(mp4|webm|ogg)(\?.*)?$/i.test(t);
                      const isHttp = /^https?:\/\//i.test(t);
                      if (isDataImg || (isHttp && isImgUrl)) {
                        appendAndSelect(`<img src="${t}" style="max-width:100%;display:block;object-fit:cover;border-radius:8px;"/>`);
                        e.preventDefault();
                        return;
                      }
                      if (isHttp && isVideoUrl) {
                        appendAndSelect(`<video src="${t}" controls style="max-width:100%;display:block;border-radius:8px;"></video>`);
                        e.preventDefault();
                        return;
                      }
                    } catch { }
                  });
                }
              }
            } catch (err) { console.warn('paste handler error', err); }
          };
          doc.addEventListener('paste', handlePaste as any);
          // Capturar atajos de teclado para pegar (Cmd/Ctrl+V) y usar Clipboard API
          const keyHandler = async (e: KeyboardEvent) => {
            try {
              const isMac = navigator.platform.toLowerCase().includes('mac');
              const combo = (isMac && (e.metaKey && e.key.toLowerCase() === 'v')) || (!isMac && (e.ctrlKey && e.key.toLowerCase() === 'v'));
              if (!combo) return;
              e.preventDefault();
              const fn = (window as any).pasteFromClipboard;
              if (typeof fn === 'function') await fn();
            } catch (err) { console.warn('key paste error', err); }
          };
          doc.addEventListener('keydown', keyHandler as any);
          if (win) { (win as Window).addEventListener('keydown', keyHandler); }
        } catch (e) { console.warn('No se pudo adjuntar handler de pegado', e); }
      };
      attachPasteHandler();

      // Acción explícita de lectura del portapapeles con user gesture
      const pasteFromClipboard = async () => {
        const ed = editorInstanceRef.current || (window as any).editor;
        if (!ed) return;
        const appendAndSelect = (html: string) => {
          try {
            const targetSel = ed.getSelected() || ed.getWrapper();
            if (!targetSel || !(targetSel as any).append) {
              console.warn('No hay selección ni wrapper para insertar contenido pegado');
              return;
            }
            const comp = (targetSel as any).append(html) as any;
            const added = Array.isArray(comp) ? comp[comp.length - 1] : comp;
            try { added?.set?.({ resizable: true }); } catch { }
            try { ed.select(added); } catch { }
          } catch (err) { console.warn('append error', err); }
        };

        // Intentar leer contenido rico (imágenes) del portapapeles
        const hasRichClipboard = !!(navigator as any).clipboard?.read;
        if (hasRichClipboard) {
          try {
            const items: any[] = await (navigator as any).clipboard.read();
            for (const item of items) {
              try {
                // Buscar imagen
                const types: string[] = item.types || [];
                const imgType = types.find(t => t.startsWith('image/')) || null;
                if (imgType) {
                  const blob = await item.getType(imgType);
                  if (blob) {
                    // Subir si es posible
                    try {
                      const file = new File([blob], `clipboard.${(imgType.split('/')[1] || 'png')}`, { type: imgType });
                      const resp: any = await HttpClient.uploadFile('/upload', file);
                      const url = (resp?.data?.url) || (resp?.url) || '';
                      if (url) {
                        appendAndSelect(`<img src="${url}" style="max-width:100%;display:block;object-fit:cover;border-radius:8px;"/>`);
                      } else {
                        const fr = new FileReader();
                        fr.onload = () => appendAndSelect(`<img src="${fr.result}" style="max-width:100%;display:block;object-fit:cover;border-radius:8px;"/>`);
                        fr.readAsDataURL(blob);
                      }
                    } catch (err) {
                      console.warn('Upload falló, usando DataURL', err);
                      const fr = new FileReader();
                      fr.onload = () => appendAndSelect(`<img src="${fr.result}" style="max-width:100%;display:block;object-fit:cover;border-radius:8px;"/>`);
                      fr.readAsDataURL(blob);
                    }
                  }
                  return;
                }
              } catch { }
            }
          } catch (err) {
            console.warn('clipboard.read falló, intento texto', err);
          }
        }

        // Fallback: leer texto y detectar URL/data URI de imagen
        try {
          const text = await navigator.clipboard.readText();
          const t = (text || '').trim();
          if (!t) return;
          const isDataImg = t.startsWith('data:image/');
          const isImgUrl = /(https?:\/\/.*\.(png|jpg|jpeg|gif|webp))(\?.*)?$/i.test(t);
          if (isDataImg || isImgUrl) {
            appendAndSelect(`<img src="${t}" style="max-width:100%;display:block;object-fit:cover;border-radius:8px;"/>`);
          } else {
            console.warn('Contenido del portapapeles no es imagen');
          }
        } catch (err) {
          console.warn('readText falló', err);
        }
      };
      try { (window as any).pasteFromClipboard = pasteFromClipboard; } catch { }

      // Habilitar resizable en selección de imágenes, videos y SVG
      // y normalizar atributos de imagen para consistencia editor↔público
      try {
        gEditor.on('component:selected', (comp: any) => {
          try { comp?.set?.({ resizable: true }); } catch { }

          // 🖼️ Normalizar imágenes: mover atributos width/height a style
          // para que el Style Manager pueda controlar el tamaño correctamente
          try {
            const tag = (comp?.getTag?.() || comp?.get?.('tagName') || '').toLowerCase();
            const compType = comp?.get?.('type') || '';
            if (tag === 'img' || compType === 'image') {
              const attrs = comp.getAttributes?.() || {};
              const hasWidthAttr = attrs.width !== undefined && attrs.width !== null && attrs.width !== '';
              const hasHeightAttr = attrs.height !== undefined && attrs.height !== null && attrs.height !== '';
              if (hasWidthAttr || hasHeightAttr) {
                const currentStyle = comp.getStyle?.() || {};
                // Solo mover al estilo si no hay ya un valor de style para ese prop
                const styleOverrides: Record<string, string> = {};
                if (hasWidthAttr && !currentStyle.width) {
                  const w = String(attrs.width);
                  styleOverrides.width = /^\d+$/.test(w) ? w + 'px' : w;
                }
                if (hasHeightAttr && !currentStyle.height) {
                  const h = String(attrs.height);
                  styleOverrides.height = /^\d+$/.test(h) ? h + 'px' : h;
                }
                if (Object.keys(styleOverrides).length > 0) {
                  comp.addStyle?.(styleOverrides);
                  comp.removeAttributes?.(['width', 'height']);
                  console.log('🖼️ Atributos width/height de imagen movidos a style:', styleOverrides);
                }
              }
            }
          } catch (imgErr) { console.warn('No se pudieron normalizar atributos de imagen', imgErr); }

          try {
            const sm: any = gEditor.StyleManager;
            const sectors = sm.getSectors?.() || [];
            const isText = comp?.is?.('text') || /^(p|h1|h2|h3|h4|h5|h6|span|label)$/i.test(comp?.getTag?.() || '');
            const isSection = comp?.is?.('section') || /^(section|div)$/i.test(comp?.getTag?.() || '');
            sectors.forEach((s: any) => {
              const sname = s.getName?.() || s.get('name');
              if (isText && (sname === '📝 Texto' || sname === '🎨 Apariencia')) s.set('open', true);
              else if (isSection && (sname === '🖼️ Fondos' || sname === '🎨 Apariencia')) s.set('open', true);
              else s.set('open', false);
            });
          } catch (e) { /* noop */ }
        });
      } catch (e) { console.warn('No se pudo habilitar resizable', e); }

      // helper: inyectar scripts externos e inline desde el último HTML
      const injectPageScripts = (maxRetries: number = 20) => {
        try {
          const frame = gEditor.Canvas.getFrameEl();
          const doc = frame?.contentDocument || gEditor.Canvas.getDocument();
          if (!doc) {
            if (maxRetries > 0) {
              setTimeout(() => injectPageScripts(maxRetries - 1), 120);
            } else {
              console.warn('⚠️ Documento del canvas no disponible para scripts');
            }
            return;
          }

          const html = latestHtmlRef.current || '';
          const parser = new DOMParser();
          const parsed = parser.parseFromString(html, 'text/html');

          // Scripts externos: de pageData.scripts y del HTML
          const externalSrcs = new Set<string>();
          try {
            const arr = (pageData as any)?.scripts as string[] | undefined;
            (arr || []).forEach((s) => externalSrcs.add(s));
          } catch { }
          parsed.querySelectorAll('script[src]').forEach((el) => {
            const src = el.getAttribute('src');
            if (src) externalSrcs.add(src);
          });
          externalSrcs.forEach((src) => {
            if (!doc.querySelector(`script[src="${src}"]`)) {
              const s = doc.createElement('script');
              s.src = src;
              s.defer = true;
              doc.body.appendChild(s);
              console.log('⚙️ Script externo cargado:', src);
            }
          });

          // Scripts inline del HTML
          parsed.querySelectorAll('script:not([src])').forEach((oldScript) => {
            const content = oldScript.textContent || '';
            if (content.trim().length === 0) return;
            const newScript = doc.createElement('script');
            if (oldScript.getAttribute('type')) {
              newScript.setAttribute('type', oldScript.getAttribute('type')!);
            }
            newScript.textContent = content;
            doc.body.appendChild(newScript);
            console.log('🧠 Script inline reinyectado');
          });
        } catch (e) {
          console.warn('No se pudieron inyectar scripts de la página:', e);
        }
      };

      // Registrar tipo personalizado para botones con traits
      gEditor.DomComponents.addType('action-button', {
        isComponent: (el: HTMLElement) => {
          const tag = (el.tagName || '').toUpperCase();
          if (tag === 'BUTTON' || tag === 'A') return { type: 'action-button' };
          return false;
        },
        model: {
          defaults: {
            tagName: 'button',
            attributes: { type: 'button' },
            traits: [
              {
                type: 'text',
                label: 'Texto',
                name: 'data-label',
                placeholder: 'Texto del botón',
              },
              {
                type: 'select',
                label: 'Acción',
                name: 'data-action',
                options: [
                  { id: '', name: 'Ninguna' },
                  { id: 'link', name: 'Ir a página' },
                  { id: 'download', name: 'Descargar archivo' },
                  { id: 'open_pdf', name: 'Abrir PDF' },
                  { id: 'go_to_payment', name: 'Ir a pago' },
                  { id: 'execute-function', name: 'Ejecutar función' }
                ],
              },
              {
                type: 'text',
                label: 'URL o archivo',
                name: 'data-url',
                placeholder: 'https://...',
              },
              {
                type: 'select',
                label: 'Abrir en',
                name: 'data-target',
                options: [
                  { id: '_self', name: 'Misma ventana' },
                  { id: '_blank', name: 'Nueva ventana' },
                ],
              },
              {
                type: 'text',
                label: 'ID de transacción',
                name: 'data-transaction-id',
                placeholder: 'ID de transacción',
              },
              {
                type: 'number',
                label: 'Monto',
                name: 'data-amount',
                placeholder: '0.00',
              },
              {
                type: 'textarea',
                label: 'Código JavaScript',
                name: 'data-custom-function',
                placeholder: 'console.log("Hola mundo");',
              },
              {
                type: 'file-upload',
                label: 'Subir archivo',
                name: 'data-file-url',
                visible: false,
              }
            ],
            script(this: HTMLElement) {
              // No ejecutar acciones en el editor: detectar contexto y salir
              try {
                const isEditorCtx = (window as any).__GJS_IS_EDITOR ||
                  (!!(window.top && (window.top as any).grapesjs));
                if (isEditorCtx) return;
              } catch { }
              // Sincronizar etiqueta visible con el trait "Texto" (data-label)
              const updateLabel = () => {
                const lbl = this.getAttribute('data-label');
                if (typeof lbl === 'string') {
                  this.textContent = lbl;
                }
              };
              // Inicializar etiqueta si existe atributo
              updateLabel();
              // Observar cambios de atributos para data-label
              const mo = new MutationObserver(muts => {
                for (const m of muts) {
                  if (m.type === 'attributes' && m.attributeName === 'data-label') {
                    updateLabel();
                  }
                }
              });
              mo.observe(this, { attributes: true, attributeFilter: ['data-label'] });

              const action = this.getAttribute('data-action');
              // Si no hay acción pero hay URL, asumir que es un enlace
              const finalAction = action || ((this.getAttribute('data-url') || this.getAttribute('href')) ? 'link' : null);

              if (!finalAction) return;

              function handleClick(this: HTMLElement, e: Event) {
                // 🚫 En el editor, NO ejecutar la acción
                try {
                  const isEditorCtx = (window as any).__GJS_IS_EDITOR;
                  if (isEditorCtx) return;
                } catch { }

                if (this.hasAttribute('data-grapes-editing')) return;

                e.preventDefault();

                // Leer los atributos en el momento del click
                const url = this.getAttribute('data-url') || this.getAttribute('href');
                const fileUrl = this.getAttribute('data-file-url');
                const target = this.getAttribute('data-target') || this.getAttribute('target') || '_self';
                const transactionId = this.getAttribute('data-transaction-id');
                const amount = this.getAttribute('data-amount');
                const customFunction = this.getAttribute('data-custom-function');

                switch (finalAction) {
                  case 'link':
                    if (url) {
                      const cleanUrl = url.replace(/`/g, '').trim();
                      if (target === '_blank') {
                        window.open(cleanUrl, '_blank');
                      } else {
                        window.location.href = cleanUrl;
                      }
                    }
                    break;
                  case 'download':
                    if (fileUrl || url) {
                      const cleanUrl = (fileUrl || url).replace(/`/g, '').trim();
                      const a = document.createElement('a');
                      a.href = cleanUrl;
                      a.download = cleanUrl.split('/').pop() || 'download';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                    break;
                  case 'open_pdf':
                    if (fileUrl || url) {
                      const cleanUrl = (fileUrl || url).replace(/`/g, '').trim();
                      if (target === '_blank') {
                        window.open(cleanUrl, '_blank');
                      } else {
                        window.location.href = cleanUrl;
                      }
                    }
                    break;
                  case 'go_to_payment':
                    if (transactionId && amount) {
                      console.log('Procesando pago:', { transactionId, amount });
                    }
                    break;
                  case 'execute-function':
                    if (customFunction) {
                      try {
                        new Function(customFunction)();
                      } catch (error) {
                        console.error('Error ejecutando función personalizada:', error);
                      }
                    }
                    break;
                }
              }

              this.addEventListener('click', handleClick);
              return {
                destroy: function () {
                  this.removeEventListener('click', handleClick);
                }
              };
            },
            scriptProps: [
              'data-label',
              'data-action',
              'data-url',
              'data-file-url',
              'data-target',
              'data-transaction-id',
              'data-amount',
              'data-custom-function',
              'href'
            ],
          },

          init() {
            this.listenTo(this, 'change:attributes:data-action', this.handleActionChange);
            this.handleActionChange();
          },

          updated(property: any, value: any, prevValue: any) {
            if (property === 'attributes' && value && value['data-action'] !== prevValue?.['data-action']) {
              this.handleActionChange();
            }
          },

          handleActionChange() {
            const action = this.getAttributes()['data-action'] || '';
            const traits = this.get('traits');
            if (!traits) return;

            const tFile = traits.where({ name: 'data-file-url' })[0];
            const tUrl = traits.where({ name: 'data-url' })[0];
            const tTarget = traits.where({ name: 'data-target' })[0];
            const tTx = traits.where({ name: 'data-transaction-id' })[0];
            const tAmt = traits.where({ name: 'data-amount' })[0];
            const tFunc = traits.where({ name: 'data-custom-function' })[0];

            if (tFile) tFile.set('visible', false);
            if (tUrl) tUrl.set('visible', false);
            if (tTarget) tTarget.set('visible', false);
            if (tTx) tTx.set('visible', false);
            if (tAmt) tAmt.set('visible', false);
            if (tFunc) tFunc.set('visible', false);

            if (action === 'link') {
              if (tUrl) { tUrl.set('visible', true); tUrl.set('label', 'URL'); }
              if (tTarget) tTarget.set('visible', true);
            } else if (action === 'download' || action === 'open_pdf') {
              if (tFile) tFile.set('visible', true);
              if (tUrl) { tUrl.set('visible', true); tUrl.set('label', 'O URL externa'); }
              if (tTarget) tTarget.set('visible', true);
            } else if (action === 'go_to_payment') {
              if (tTx) tTx.set('visible', true);
              if (tAmt) tAmt.set('visible', true);
            } else if (action === 'execute-function') {
              if (tFunc) tFunc.set('visible', true);
            }
          }
        },
      });

      // Registrar tipo personalizado para dropdown-menu
      gEditor.DomComponents.addType('dropdown-menu', {
        isComponent: (el: HTMLElement) => {
          try {
            return (el?.hasAttribute && el.hasAttribute('data-dropdown-menu')) || el.classList?.contains('dropdown');
          } catch { return false; }
        },
        model: {
          defaults: {
            tagName: 'div',
            attributes: { 'data-dropdown-menu': 'true' },
            droppable: false,
            copyable: true,
            stylable: true,
            components: [
              { type: 'button', attributes: { 'data-dropdown-toggle': 'true' }, content: 'Menú ▼' },
              {
                type: 'list', attributes: { 'data-dropdown-list': 'true' }, components: [
                  { type: 'link', attributes: { href: '#', 'data-label': 'Opción 1' }, content: 'Opción 1' },
                  { type: 'link', attributes: { href: '#', 'data-label': 'Opción 2' }, content: 'Opción 2' },
                  { type: 'link', attributes: { href: '#', 'data-label': 'Opción 3' }, content: 'Opción 3' },
                ]
              },
            ],
            traits: [
              { type: 'text', name: 'toggle-label', label: 'Texto del botón', changeProp: 1 },
              { type: 'button', label: 'Agregar opción', command: 'add-dropdown-option' },
            ],
            script(this: HTMLElement) {
              try {
                const isEditorCtx = (window as any).__GJS_IS_EDITOR || (!!(window.top && (window.top as any).grapesjs));
                if (isEditorCtx) return;
              } catch { }
              const toggle = this.querySelector('[data-dropdown-toggle]') as HTMLElement | null;
              const list = this.querySelector('[data-dropdown-list]') as HTMLElement | null;
              if (!toggle || !list) return;
              list.style.display = 'none';
              const onClick = (e: Event) => { e.preventDefault(); list.style.display = (list.style.display === 'none' ? 'block' : 'none'); };
              toggle.addEventListener('click', onClick);
              return { destroy() { toggle?.removeEventListener('click', onClick); } };
            },
            scriptProps: [],
          },
          init() {
            try {
              (this as any).on('change:toggle-label', (this as any).updateToggleLabel);
              (this as any).updateToggleLabel();
            } catch { }
          },
          updateToggleLabel() {
            try {
              const label = (this as any).get('toggle-label') || 'Menú ▼';
              const toggle = (this as any).find?.('[data-dropdown-toggle]')?.[0];
              if (toggle) toggle.set('content', label);
            } catch { }
          },
        } as any,
      });

      // Comando para agregar opciones dinámicas al dropdown-menu
      try {
        gEditor.Commands.add('add-dropdown-option', {
          run(editor: any) {
            const comp = editor.getSelected();
            if (!comp) return;
            const list = comp.find?.('[data-dropdown-list]')?.[0];
            if (!list) return;
            list.append({ type: 'link', attributes: { href: '#', 'data-label': 'Nueva opción' }, content: 'Nueva opción' });
            editor.trigger('component:update', { component: list });
          }
        });
      } catch { }


      // Esperar al evento 'load' antes de cargar contenido
      gEditor.on('load', () => {
        console.log('✅ GrapesJS: evento load disparado');
        setEditorReady(true);

        // 🎯 SOLUCIÓN: Ajusta automáticamente el ancho del iframe según el panel derecho
        const canvasElement = gEditor.Canvas.getElement(); // contenedor del canvas
        const frameEl = gEditor.Canvas.getFrameEl();  // iframe donde se ve la página
        const panelsEl = document.querySelector('.gjs-pn-views-container') as HTMLElement; // panel derecho (propiedades)

        let _rafId: number | null = null;
        let _lastPanelW = -1;
        function adjustCanvasWidth() {
          if (!canvasElement || !frameEl || !panelsEl) return;
          const apply = () => {
            const panelWidth = panelsEl.offsetWidth;
            // Evitar recalcular si el ancho del panel no cambió significativamente
            if (_lastPanelW !== -1 && Math.abs(panelWidth - _lastPanelW) < 2) return;
            _lastPanelW = panelWidth;
            const editorEl = gEditor.getEl();
            if (!editorEl) return;
            const editorWidth = editorEl.offsetWidth;
            const canvasWidth = Math.max(0, editorWidth - panelWidth);
            canvasElement.style.width = `${canvasWidth}px`;
            frameEl.style.width = '100%';
            frameEl.style.margin = '0 auto';
            console.log('🎯 Canvas ajustado - Panel:', panelWidth, 'Editor:', editorWidth, 'Canvas:', canvasWidth);
          };
          if (_rafId) cancelAnimationFrame(_rafId);
          _rafId = requestAnimationFrame(apply);
        }

        // Ajustar al cargar
        adjustCanvasWidth();

        // Ajustar al cambiar tamaño de ventana o al abrir/cerrar paneles
        window.addEventListener('resize', adjustCanvasWidth);
        if (panelsEl) {
          const observer = new ResizeObserver(adjustCanvasWidth);
          observer.observe(panelsEl);

          // Cleanup function para el observer (se manejará en useEffect cleanup)
          (gEditor as any)._canvasResizeCleanup = () => {
            window.removeEventListener('resize', adjustCanvasWidth);
            observer.disconnect();
          };
        }

        // 🎯 PASO 3: Event listeners para recalcular posiciones en cambios responsivos
        gEditor.on('device:change canvas:resize', () => {
          console.log('🎯 Recalculando posiciones por cambio de dispositivo/canvas');
          // Evitar refrescos redundantes que causan parpadeos
          try { adjustCanvasWidth(); } catch { }
          try { gEditor.trigger('canvas:refresh'); } catch { }

          // Recorregir escalado después del cambio
          setTimeout(() => {
            const frame = gEditor.Canvas.getFrameEl();
            if (frame) {
              frame.style.transform = 'none';
              frame.style.zoom = '1';
            }

            const canvasWrapper = document.querySelector('.gjs-cv-canvas') as HTMLElement;
            if (canvasWrapper) {
              canvasWrapper.style.transform = 'none';
              canvasWrapper.style.zoom = '1';
            }
          }, 100);
        });

        // Event listener para cambios de ventana del navegador
        const handleWindowResize = () => {
          try {
            if (!gEditor || !(gEditor as any).Canvas) return;
            console.log('🎯 Recalculando por resize de ventana');
            try { gEditor.refresh?.(); } catch { }
            try { gEditor.trigger?.('canvas:refresh'); } catch { }
          } catch (e) {
            console.warn('⚠️ Resize handler omitido por editor no listo:', e);
          }
        };

        window.addEventListener('resize', handleWindowResize);

        // Cleanup function para remover el listener (se manejará en useEffect cleanup)
        (gEditor as any)._windowResizeCleanup = () => {
          window.removeEventListener('resize', handleWindowResize);
        };

        // 🎯 PASO 4: Sincronización del overlay de selección para alineación perfecta
        const syncSelectionOverlay = () => {
          try {
            const frame = gEditor.Canvas.getFrameEl();
            if (!frame) return;

            const frameRect = frame.getBoundingClientRect();
            const offsetY = frameRect.top;
            const offsetX = frameRect.left;

            // Sincronizar highlighter (caja de selección azul)
            const highlighter = document.querySelector('.gjs-highlighter') as HTMLElement;
            if (highlighter) {
              highlighter.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            }

            // Sincronizar herramientas de selección
            const tools = document.querySelector('.gjs-tools') as HTMLElement;
            if (tools) {
              tools.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            }

            console.log('🎯 Overlay sincronizado - offsetX:', offsetX, 'offsetY:', offsetY);
          } catch (e) {
            console.warn('Error sincronizando overlay:', e);
          }
        };

        // Aplicar sincronización en eventos del canvas (evitar ejecutarlo en selección para reducir jitter)
        gEditor.on('canvas:refresh device:change', syncSelectionOverlay);

        // Sincronizar también en scroll del canvas
        const canvasEl = gEditor.Canvas.getElement();
        if (canvasEl) {
          canvasEl.addEventListener('scroll', syncSelectionOverlay);
        }

        // Eliminada conversión masiva de 'a, button' a 'action-button' para evitar efectos colaterales sobre otros botones.

        // Asegurar data-label al agregar nuevos botones
        gEditor.on('component:add', (comp: any) => {
          try {
            if (comp?.get?.('type') === 'action-button') {
              const elTag = (comp.view?.el?.tagName || '').toUpperCase();
              if (elTag === 'A') {
                const attrs = typeof comp.getAttributes === 'function'
                  ? comp.getAttributes()
                  : (comp.get('attributes') || {});
                const filtered = { ...(attrs as any) };
                delete (filtered as any).href;
                delete (filtered as any).target;
                filtered.type = 'button';
                comp.set('tagName', 'button');
                comp.set('attributes', filtered);
              }
              const currentText: string = (comp.view?.el?.textContent || '').trim();
              if (currentText) {
                comp.addAttributes({ 'data-label': currentText });
                comp.set('content', currentText);
              }
            }
          } catch { }
        });

        // Renombrar etiquetas de bloques de plugins a español
        try {
          const bm = gEditor.BlockManager;
          const renames: Record<string, string> = {
            text: 'Texto',
            link: 'Enlace',
            image: 'Imagen',
            column1: '1 columna',
            column2: '2 columnas',
            column3: '3 columnas',
            form: 'Formulario',
            input: 'Entrada',
            textarea: 'Área de texto',
            select: 'Selección',
            button: 'Botón',
            label: 'Etiqueta',
            'link-block': 'Bloque de enlace',
            'quote': 'Cita',
            'text-basic': 'Texto básico',
          };
          Object.entries(renames).forEach(([id, label]) => {
            const block = bm.get(id as any);
            if (block) block.set('label', label);
          });
        } catch (e) {
          console.warn('No se pudo renombrar bloques a español:', e);
        }

        // Forzar población del Style Manager al seleccionar componentes
        const updateSelectedInfo = () => {
          try {
            const sel = gEditor.getSelected();
            if (!sel) { setSelectedInfo(null); return; }
            const doc = gEditor.Canvas.getDocument();
            const el = sel.getEl ? sel.getEl() : null;
            let w = 0, h = 0;
            if (el && doc) {
              const rect = (el as HTMLElement).getBoundingClientRect();
              w = rect.width; h = rect.height;
            } else {
              const style = sel.getStyle ? sel.getStyle() : {};
              const sw = Number(parseFloat(String((style as any).width || 0)) || 0);
              const sh = Number(parseFloat(String((style as any).height || 0)) || 0);
              w = sw; h = sh;
            }
            const name = sel.getName ? sel.getName() : sel.getId?.() || undefined;
            setSelectedInfo({ width: w, height: h, name });
          } catch (e) { console.warn('No se pudo calcular tamaño seleccionado', e); }
        };
        gEditor.on('component:selected', updateSelectedInfo);
        gEditor.on('style:change', updateSelectedInfo);

        // Renderizado de managers bajo demanda via toggles

        // Bloques personalizados
        const bm = gEditor.BlockManager;

        // PASO 1: Bloques básicos
        bm.add('text-simple', {
          label: '📝 Texto',
          category: '📌 Básico',
          content: '<p>Texto editable</p>'
        });

        bm.add('button', {
          label: '🔘 Botón',
          category: '📌 Básico',
          content: '<button type="button" style="display:inline-block; padding:12px 24px; border-radius:8px; cursor:pointer;">Botón</button>'
        });

        bm.add('image-block', {
          label: '🖼️ Imagen',
          category: '📌 Básico',
          content: '<img src="https://via.placeholder.com/400x300" style="max-width: 100%;">'
        });

        bm.add('pdf-viewer', {
          label: '📄 Visualizar PDF',
          category: '📌 Básico',
          attributes: { class: 'gjs-fonts gjs-f-image' },
          content: { type: 'pdf-viewer' },
        });

        // Dropdown reusable component block
        bm.add('dropdown-menu', {
          label: 'Dropdown Menu',
          category: 'Navegación',
          content: `
            <div class="dropdown" data-gjs-type="dropdown-menu">
              <button class="dropdown-btn" data-gjs-editable="true">Menú ▼</button>
              <div class="dropdown-content">
                <a href="#" data-gjs-editable="true">Opción 1</a>
                <a href="#" data-gjs-editable="true">Opción 2</a>
                <a href="#" data-gjs-editable="true">Opción 3</a>
              </div>
            </div>
          `,
        });

        // Elementos adicionales
        // Eliminado: Botón CTA para evitar múltiples variantes; se mantiene solo el botón básico

        bm.add('card-simple', {
          label: '🃏 Tarjeta Simple',
          category: '🧩 Elementos',
          content: `
            <div class="p-6 bg-white rounded-lg shadow-md">
              <h3 class="text-lg font-bold mb-2">Título de Tarjeta</h3>
              <p class="text-gray-600">Contenido descriptivo de la tarjeta que puede editarse.</p>
            </div>
          `
        });

        bm.add('divider', {
          label: '➖ Divisor',
          category: '🧩 Elementos',
          content: `<hr class="my-6 border-t border-gray-200">`
        });

        bm.add('icon-text', {
          label: '🔣 Icono + Texto',
          category: '🧩 Elementos',
          content: `
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p>Texto con icono personalizable</p>
            </div>
          `
        });

        // PASO 2: Layouts y Secciones
        bm.add('hero-simple', {
          label: '🏆 Hero Simple',
          category: '📊 Secciones',
          content: '<section class="bg-sky-100 py-16"><div class="container mx-auto text-center"><h1 class="text-3xl font-bold mb-4">Bienvenido</h1><p class="text-gray-700">Subtítulo descriptivo de la sección</p></div></section>'
        });

        bm.add('hero-image', {
          label: '🏆 Hero con Imagen',
          category: '📊 Secciones',
          content: `
            <section class="py-16 bg-gradient-to-r from-blue-50 to-sky-50">
              <div class="container mx-auto px-4">
                <div class="flex flex-col md:flex-row items-center">
                  <div class="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                    <h1 class="text-4xl font-bold mb-4 text-gray-800">Título Principal</h1>
                    <p class="text-lg text-gray-600 mb-6">Descripción atractiva que explica el propósito de esta sección y motiva al usuario.</p>
                    <div class="flex space-x-4">
                      <a href="#" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Botón Principal</a>
                      <a href="#" class="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">Botón Secundario</a>
                    </div>
                  </div>
                  <div class="md:w-1/2">
                    <img src="https://via.placeholder.com/600x400" alt="Hero Image" class="rounded-lg shadow-lg">
                  </div>
                </div>
              </div>
            </section>
          `
        });

        bm.add('features-3col', {
          label: '📊 3 Características',
          category: '📊 Secciones',
          content: '<section class="py-12"><div class="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"><div class="p-6 border rounded"><h3 class="font-semibold mb-2">Característica 1</h3><p class="text-gray-600">Descripción breve.</p></div><div class="p-6 border rounded"><h3 class="font-semibold mb-2">Característica 2</h3><p class="text-gray-600">Descripción breve.</p></div><div class="p-6 border rounded"><h3 class="font-semibold mb-2">Característica 3</h3><p class="text-gray-600">Descripción breve.</p></div></div></section>'
        });

        bm.add('features-2col', {
          label: '📊 2 Características',
          category: '📊 Secciones',
          content: `
            <section class="py-12 bg-white">
              <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Nuestras Características</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="p-6 border border-gray-200 rounded-lg hover:shadow-md transition">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Característica 1</h3>
                    <p class="text-gray-600">Descripción detallada de esta característica y sus beneficios para el usuario.</p>
                  </div>
                  <div class="p-6 border border-gray-200 rounded-lg hover:shadow-md transition">
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Característica 2</h3>
                    <p class="text-gray-600">Descripción detallada de esta característica y sus beneficios para el usuario.</p>
                  </div>
                </div>
              </div>
            </section>
          `
        });

        bm.add('features-4col', {
          label: '📊 4 Características',
          category: '📊 Secciones',
          content: `
            <section class="py-16 bg-gray-50">
              <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Nuestros Servicios</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <h3 class="font-bold mb-2">Servicio 1</h3>
                    <p class="text-gray-600 text-sm">Descripción breve del servicio.</p>
                  </div>
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 class="font-bold mb-2">Servicio 2</h3>
                    <p class="text-gray-600 text-sm">Descripción breve del servicio.</p>
                  </div>
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                      </svg>
                    </div>
                    <h3 class="font-bold mb-2">Servicio 3</h3>
                    <p class="text-gray-600 text-sm">Descripción breve del servicio.</p>
                  </div>
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                      <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 class="font-bold mb-2">Servicio 4</h3>
                    <p class="text-gray-600 text-sm">Descripción breve del servicio.</p>
                  </div>
                </div>
              </div>
            </section>
          `
        });

        bm.add('testimonial-section', {
          label: '💬 Testimonios',
          category: '📊 Secciones',
          content: `
            <section class="py-16 bg-blue-50">
              <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Lo que dicen nuestros clientes</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center mb-4">
                      <div class="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                      <div>
                        <h4 class="font-bold">Nombre Cliente</h4>
                        <p class="text-sm text-gray-600">Cargo / Empresa</p>
                      </div>
                    </div>
                    <p class="text-gray-600 italic">"Testimonio del cliente sobre su experiencia con nuestros servicios. Muy satisfecho con los resultados obtenidos."</p>
                  </div>
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center mb-4">
                      <div class="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                      <div>
                        <h4 class="font-bold">Nombre Cliente</h4>
                        <p class="text-sm text-gray-600">Cargo / Empresa</p>
                      </div>
                    </div>
                    <p class="text-gray-600 italic">"Testimonio del cliente sobre su experiencia con nuestros servicios. Muy satisfecho con los resultados obtenidos."</p>
                  </div>
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center mb-4">
                      <div class="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                      <div>
                        <h4 class="font-bold">Nombre Cliente</h4>
                        <p class="text-sm text-gray-600">Cargo / Empresa</p>
                      </div>
                    </div>
                    <p class="text-gray-600 italic">"Testimonio del cliente sobre su experiencia con nuestros servicios. Muy satisfecho con los resultados obtenidos."</p>
                  </div>
                </div>
              </div>
            </section>
          `
        });

        bm.add('contact-section', {
          label: '📞 Contacto',
          category: '📊 Secciones',
          content: `
            <section class="py-16 bg-white">
              <div class="container mx-auto px-4">
                <div class="max-w-4xl mx-auto">
                  <h2 class="text-3xl font-bold text-center mb-8">Contáctenos</h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 class="text-xl font-bold mb-4">Información de Contacto</h3>
                      <div class="space-y-4">
                        <div class="flex items-start">
                          <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <p>Calle Principal #123, Ciudad</p>
                        </div>
                        <div class="flex items-start">
                          <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          <p>(123) 456-7890</p>
                        </div>
                        <div class="flex items-start">
                          <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          <p>info@ejemplo.com</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold mb-4">Envíenos un Mensaje</h3>
                      <form>
                        <div class="mb-4">
                          <input type="text" placeholder="Nombre" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div class="mb-4">
                          <input type="email" placeholder="Email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div class="mb-4">
                          <textarea rows="4" placeholder="Mensaje" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Enviar Mensaje</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          `
        });

        // Bloques personalizados para Acueducto
        bm.add('tarifa-card', {
          label: 'Tarjeta Tarifa',
          category: 'Acueducto',
          content: `
            <div class="bg-white p-6 rounded-lg shadow-lg">
              <h3 class="text-xl font-bold mb-2">Tarifa Básica</h3>
              <div class="text-3xl text-blue-600 font-bold mb-2">$2,500</div>
              <p class="text-gray-600">0-20 m³</p>
            </div>
          `
        });

        bm.add('btn-pqr', {
          label: 'Botón PQR',
          category: 'Acueducto',
          content: `
            <a href="/pqrs" class="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              Enviar PQR
            </a>
          `
        });

        bm.add('info-contacto', {
          label: 'Info Contacto',
          category: 'Acueducto',
          content: `
            <div class="bg-gray-100 p-6 rounded-lg">
              <h4 class="font-bold mb-4">Contacto</h4>
              <p class="mb-2">📞 Teléfono: (604) 123-4567</p>
              <p class="mb-2">📧 Email: info@acueducto.gov.co</p>
              <p>📍 Dirección: Calle 123 #45-67</p>
            </div>
          `
        });

        bm.add('horario', {
          label: 'Horario',
          category: 'Acueducto',
          content: `
            <div class="border-l-4 border-blue-600 pl-4">
              <h4 class="font-bold">Horario de Atención</h4>
              <p>Lunes a Viernes: 8:00 AM - 5:00 PM</p>
              <p>Sábados: 8:00 AM - 12:00 PM</p>
            </div>
          `
        });

        // ========================================
        // 🎨 BIBLIOTECA COMPLETA DE BLOQUES PERSONALIZADOS
        // ========================================

        // 🔷 CATEGORÍA: FORMAS GEOMÉTRICAS
        bm.add('shape-rectangle', {
          label: '⬜ Rectángulo',
          category: '🔷 Formas',
          content: '<div style="width:200px; height:120px; background:#4a90e2; border-radius:8px; margin:10px;"></div>'
        });

        bm.add('shape-square', {
          label: '🟦 Cuadrado',
          category: '🔷 Formas',
          content: '<div style="width:120px; height:120px; background:#e94e77; border-radius:8px; margin:10px;"></div>'
        });

        bm.add('shape-circle', {
          label: '🔵 Círculo',
          category: '🔷 Formas',
          content: '<div style="width:120px; height:120px; background:#50c878; border-radius:50%; margin:10px;"></div>'
        });

        bm.add('shape-oval', {
          label: '🥚 Óvalo',
          category: '🔷 Formas',
          content: '<div style="width:180px; height:120px; background:#ff6b35; border-radius:50%; margin:10px;"></div>'
        });

        bm.add('shape-triangle', {
          label: '🔺 Triángulo',
          category: '🔷 Formas',
          content: '<div style="width:0; height:0; border-left:60px solid transparent; border-right:60px solid transparent; border-bottom:100px solid #9b59b6; margin:20px;"></div>'
        });

        bm.add('shape-diamond', {
          label: '💎 Diamante',
          category: '🔷 Formas',
          content: '<div style="width:80px; height:80px; background:#f39c12; transform:rotate(45deg); margin:40px;"></div>'
        });

        bm.add('shape-line-horizontal', {
          label: '➖ Línea Horizontal',
          category: '🔷 Formas',
          content: '<div style="width:300px; height:4px; background:#2c3e50; margin:20px 0;"></div>'
        });

        bm.add('shape-line-vertical', {
          label: '|️ Línea Vertical',
          category: '🔷 Formas',
          content: '<div style="width:4px; height:200px; background:#2c3e50; margin:0 20px;"></div>'
        });

        bm.add('shape-arrow-right', {
          label: '➡️ Flecha Derecha',
          category: '🔷 Formas',
          content: '<div style="width:0; height:0; border-top:30px solid transparent; border-bottom:30px solid transparent; border-left:60px solid #3498db; margin:20px;"></div>'
        });

        bm.add('shape-star', {
          label: '⭐ Estrella',
          category: '🔷 Formas',
          content: `<div style="position:relative; display:inline-block; width:100px; height:100px; margin:20px;">
            <div style="position:absolute; top:0; left:50%; width:0; height:0; border-left:15px solid transparent; border-right:15px solid transparent; border-bottom:25px solid #f1c40f; transform:translateX(-50%);"></div>
            <div style="position:absolute; top:20px; left:50%; width:0; height:0; border-left:15px solid transparent; border-right:15px solid transparent; border-top:25px solid #f1c40f; transform:translateX(-50%);"></div>
          </div>`
        });

        // 📐 CATEGORÍA: LAYOUTS Y CONTENEDORES
        bm.add('layout-container', {
          label: '📦 Contenedor',
          category: '📐 Layouts',
          content: '<div style="max-width:1200px; margin:0 auto; padding:20px; border:2px dashed #ddd; min-height:100px;">Contenedor Principal</div>'
        });

        bm.add('layout-section', {
          label: '📄 Sección',
          category: '📐 Layouts',
          content: '<section style="padding:60px 20px; background:#f8f9fa; border:1px solid #e9ecef; margin:10px 0;">Sección de Contenido</section>'
        });

        bm.add('layout-flex-row', {
          label: '↔️ Fila Flex',
          category: '📐 Layouts',
          content: `<div style="display:flex; gap:20px; padding:20px; border:2px dashed #007bff;">
            <div style="flex:1; padding:20px; background:#e3f2fd; border-radius:8px;">Elemento 1</div>
            <div style="flex:1; padding:20px; background:#e8f5e8; border-radius:8px;">Elemento 2</div>
          </div>`
        });

        bm.add('layout-flex-column', {
          label: '↕️ Columna Flex',
          category: '📐 Layouts',
          content: `<div style="display:flex; flex-direction:column; gap:20px; padding:20px; border:2px dashed #28a745;">
            <div style="padding:20px; background:#fff3cd; border-radius:8px;">Elemento Superior</div>
            <div style="padding:20px; background:#d1ecf1; border-radius:8px;">Elemento Inferior</div>
          </div>`
        });

        bm.add('layout-grid-2', {
          label: '⚏ Grid 2 Columnas',
          category: '📐 Layouts',
          content: `<div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; padding:20px; border:2px dashed #6f42c1;">
            <div style="padding:20px; background:#f8f9fa; border-radius:8px; border:1px solid #dee2e6;">Columna 1</div>
            <div style="padding:20px; background:#f8f9fa; border-radius:8px; border:1px solid #dee2e6;">Columna 2</div>
          </div>`
        });

        bm.add('layout-grid-3', {
          label: '⚏ Grid 3 Columnas',
          category: '📐 Layouts',
          content: `<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; padding:20px; border:2px dashed #dc3545;">
            <div style="padding:15px; background:#f8f9fa; border-radius:8px; border:1px solid #dee2e6;">Col 1</div>
            <div style="padding:15px; background:#f8f9fa; border-radius:8px; border:1px solid #dee2e6;">Col 2</div>
            <div style="padding:15px; background:#f8f9fa; border-radius:8px; border:1px solid #dee2e6;">Col 3</div>
          </div>`
        });

        bm.add('layout-grid-4', {
          label: '⚏ Grid 4 Columnas',
          category: '📐 Layouts',
          content: `<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; padding:20px; border:2px dashed #fd7e14;">
            <div style="padding:10px; background:#f8f9fa; border-radius:6px; border:1px solid #dee2e6; text-align:center;">1</div>
            <div style="padding:10px; background:#f8f9fa; border-radius:6px; border:1px solid #dee2e6; text-align:center;">2</div>
            <div style="padding:10px; background:#f8f9fa; border-radius:6px; border:1px solid #dee2e6; text-align:center;">3</div>
            <div style="padding:10px; background:#f8f9fa; border-radius:6px; border:1px solid #dee2e6; text-align:center;">4</div>
          </div>`
        });

        bm.add('layout-sidebar', {
          label: '📋 Sidebar Layout',
          category: '📐 Layouts',
          content: `<div style="display:flex; gap:20px; min-height:300px; border:2px dashed #20c997;">
            <aside style="width:250px; padding:20px; background:#e9ecef; border-radius:8px;">
              <h3 style="margin:0 0 15px 0; font-size:18px;">Sidebar</h3>
              <p style="margin:0; color:#6c757d;">Contenido lateral</p>
            </aside>
            <main style="flex:1; padding:20px; background:#f8f9fa; border-radius:8px;">
              <h2 style="margin:0 0 15px 0;">Contenido Principal</h2>
              <p style="margin:0; color:#6c757d;">Área principal de contenido</p>
            </main>
          </div>`
        });

        // 🎨 CATEGORÍA: ELEMENTOS UI
        /* Eliminados: variantes UI de botones para evitar confusión y mantener solo el básico
        bm.add('ui-button-primary', {
          label: '🔘 Botón Primario',
          category: '🎨 UI Elements',
          content: {
            type: 'button',
            content: 'Botón Primario',
            attributes: {
              style: 'padding:12px 24px; background:#007bff; color:white; border:none; border-radius:6px; font-weight:500; cursor:pointer; transition:all 0.3s;'
            },
            traits: [
              {
                type: 'text',
                label: 'Texto del Botón',
                name: 'content',
                changeProp: true
              },
              {
                type: 'text',
                label: 'URL',
                name: 'href',
                placeholder: '#'
              },
              {
                type: 'select',
                label: 'Abrir en',
                name: 'data-target',
                changeProp: true,
                options: [
                  { id: '_self', name: 'Misma ventana' },
                  { id: '_blank', name: 'Nueva pestaña' }
                ]
              }
            ]
          }
        });
       
        bm.add('ui-button-secondary', {
          label: '🔘 Botón Secundario',
          category: '🎨 UI Elements',
          content: {
            type: 'button',
            content: 'Botón Secundario',
            attributes: {
              style: 'padding:12px 24px; background:transparent; color:#6c757d; border:2px solid #6c757d; border-radius:6px; font-weight:500; cursor:pointer; transition:all 0.3s;'
            },
            traits: [
              {
                type: 'text',
                label: 'Texto del Botón',
                name: 'content',
                changeProp: true
              },
              {
                type: 'text',
                label: 'URL',
                name: 'href',
                placeholder: '#'
              },
              {
                type: 'select',
                label: 'Abrir en',
                name: 'data-target',
                changeProp: true,
                options: [
                  { id: '_self', name: 'Misma ventana' },
                  { id: '_blank', name: 'Nueva pestaña' }
                ]
              }
            ]
          }
        });
       
        bm.add('ui-button-success', {
          label: '🔘 Botón Éxito',
          category: '🎨 UI Elements',
          content: {
            type: 'button',
            content: 'Botón Éxito',
            attributes: {
              style: 'padding:12px 24px; background:#28a745; color:white; border:none; border-radius:6px; font-weight:500; cursor:pointer; transition:all 0.3s;'
            },
            traits: [
              {
                type: 'text',
                label: 'Texto del Botón',
                name: 'content',
                changeProp: true
              },
              {
                type: 'text',
                label: 'URL',
                name: 'href',
                placeholder: '#'
              },
              {
                type: 'select',
                label: 'Abrir en',
                name: 'data-target',
                changeProp: true,
                options: [
                  { id: '_self', name: 'Misma ventana' },
                  { id: '_blank', name: 'Nueva pestaña' }
                ]
              }
            ]
          }
        });
       
        bm.add('ui-button-danger', {
          label: '🔘 Botón Peligro',
          category: '🎨 UI Elements',
          content: {
            type: 'button',
            content: 'Botón Peligro',
            attributes: {
              style: 'padding:12px 24px; background:#dc3545; color:white; border:none; border-radius:6px; font-weight:500; cursor:pointer; transition:all 0.3s;'
            },
            traits: [
              {
                type: 'text',
                label: 'Texto del Botón',
                name: 'content',
                changeProp: true
              },
              {
                type: 'text',
                label: 'URL',
                name: 'href',
                placeholder: '#'
              },
              {
                type: 'select',
                label: 'Abrir en',
                name: 'data-target',
                changeProp: true,
                options: [
                  { id: '_self', name: 'Misma ventana' },
                  { id: '_blank', name: 'Nueva pestaña' }
                ]
              }
            ]
          }
        });
        */

        bm.add('ui-card-basic', {
          label: '🃏 Tarjeta Básica',
          category: '🎨 UI Elements',
          content: `<div style="background:white; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.1); padding:24px; margin:16px; max-width:300px;">
            <h3 style="margin:0 0 12px 0; font-size:20px; font-weight:600;">Título de Tarjeta</h3>
            <p style="margin:0 0 16px 0; color:#6c757d; line-height:1.5;">Descripción de la tarjeta con información relevante para el usuario.</p>
            <button style="padding:8px 16px; background:#007bff; color:white; border:none; border-radius:6px; cursor:pointer;">Acción</button>
          </div>`
        });

        bm.add('ui-card-image', {
          label: '🖼️ Tarjeta con Imagen',
          category: '🎨 UI Elements',
          content: `<div style="background:white; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.1); overflow:hidden; max-width:300px; margin:16px;">
            <img src="https://via.placeholder.com/300x200" style="width:100%; height:200px; object-fit:cover;">
            <div style="padding:20px;">
              <h3 style="margin:0 0 8px 0; font-size:18px; font-weight:600;">Título</h3>
              <p style="margin:0 0 12px 0; color:#6c757d; font-size:14px;">Descripción breve del contenido de la tarjeta.</p>
              <button style="padding:8px 16px; background:#007bff; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px;">Ver más</button>
            </div>
          </div>`
        });

        bm.add('ui-badge-primary', {
          label: '🏷️ Badge Primario',
          category: '🎨 UI Elements',
          content: '<span style="display:inline-block; padding:4px 12px; background:#007bff; color:white; border-radius:12px; font-size:12px; font-weight:500;">Badge</span>'
        });

        bm.add('ui-badge-success', {
          label: '🏷️ Badge Éxito',
          category: '🎨 UI Elements',
          content: '<span style="display:inline-block; padding:4px 12px; background:#28a745; color:white; border-radius:12px; font-size:12px; font-weight:500;">Éxito</span>'
        });

        bm.add('ui-alert-info', {
          label: '💡 Alerta Info',
          category: '🎨 UI Elements',
          content: `<div style="padding:16px; background:#d1ecf1; border:1px solid #bee5eb; border-radius:8px; margin:16px 0;">
            <strong style="color:#0c5460;">Información:</strong>
            <span style="color:#0c5460; margin-left:8px;">Este es un mensaje informativo importante.</span>
          </div>`
        });

        bm.add('ui-alert-warning', {
          label: '⚠️ Alerta Advertencia',
          category: '🎨 UI Elements',
          content: `<div style="padding:16px; background:#fff3cd; border:1px solid #ffeaa7; border-radius:8px; margin:16px 0;">
            <strong style="color:#856404;">Advertencia:</strong>
            <span style="color:#856404; margin-left:8px;">Presta atención a este mensaje de advertencia.</span>
          </div>`
        });

        bm.add('ui-alert-error', {
          label: '🚨 Alerta Error',
          category: '🎨 UI Elements',
          content: `<div style="padding:16px; background:#f8d7da; border:1px solid #f5c6cb; border-radius:8px; margin:16px 0;">
            <strong style="color:#721c24;">Error:</strong>
            <span style="color:#721c24; margin-left:8px;">Ha ocurrido un error que requiere atención.</span>
          </div>`
        });

        // 📝 CATEGORÍA: ELEMENTOS DE TEXTO (CONSOLIDADA)
        bm.add('text-heading-1', {
          label: 'H1 Título Principal',
          category: '📝 Texto',
          content: '<h1 style="font-size:48px; font-weight:700; margin:0 0 24px 0; color:#212529; line-height:1.2;">Título Principal</h1>'
        });

        bm.add('text-heading-2', {
          label: 'H2 Subtítulo',
          category: '📝 Texto',
          content: '<h2 style="font-size:36px; font-weight:600; margin:0 0 20px 0; color:#495057; line-height:1.3;">Subtítulo</h2>'
        });

        bm.add('text-heading-3', {
          label: 'H3 Encabezado',
          category: '📝 Texto',
          content: '<h3 style="font-size:28px; font-weight:600; margin:0 0 16px 0; color:#495057; line-height:1.4;">Encabezado</h3>'
        });

        bm.add('text-paragraph', {
          label: '📄 Párrafo',
          category: '📝 Texto',
          content: '<p style="font-size:16px; line-height:1.6; margin:0 0 16px 0; color:#6c757d;">Este es un párrafo de texto editable que puede contener información importante para tus visitantes.</p>'
        });

        bm.add('text-lead', {
          label: '📄 Texto Destacado',
          category: '📝 Texto',
          content: '<p style="font-size:20px; font-weight:300; line-height:1.6; margin:0 0 20px 0; color:#495057;">Texto destacado que llama la atención del lector con un tamaño mayor.</p>'
        });

        bm.add('text-quote', {
          label: '💬 Cita Estilizada',
          category: '📝 Texto',
          content: `<blockquote style="border-left:4px solid #007bff; padding:16px 20px; margin:20px 0; background:#f8f9fa; border-radius:0 8px 8px 0;">
            <p style="font-style:italic; font-size:18px; margin:0 0 8px 0; color:#495057;">"Esta es una cita inspiradora que destaca información importante."</p>
            <footer style="font-size:14px; color:#6c757d;">— Autor de la cita</footer>
          </blockquote>`
        });

        bm.add('text-quote-simple', {
          label: '💬 Cita Simple',
          category: '📝 Texto',
          content: '<blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; font-style: italic;">"Texto de cita"</blockquote>'
        });

        bm.add('text-list-bullets', {
          label: '• Lista con Viñetas',
          category: '📝 Texto',
          content: `<ul style="padding-left:20px; margin:16px 0; color:#495057;">
            <li style="margin-bottom:8px;">Primer elemento de la lista</li>
            <li style="margin-bottom:8px;">Segundo elemento importante</li>
            <li style="margin-bottom:8px;">Tercer elemento a destacar</li>
          </ul>`
        });

        bm.add('text-list-numbers', {
          label: '1. Lista Numerada',
          category: '📝 Texto',
          content: `<ol style="padding-left:20px; margin:16px 0; color:#495057;">
            <li style="margin-bottom:8px;">Primer paso del proceso</li>
            <li style="margin-bottom:8px;">Segundo paso importante</li>
            <li style="margin-bottom:8px;">Tercer paso final</li>
          </ol>`
        });

        // 🖼️ CATEGORÍA: MEDIOS Y MULTIMEDIA
        bm.add('media-image-basic', {
          label: '🖼️ Imagen',
          category: '🖼️ Medios',
          content: '<img src="https://via.placeholder.com/400x300" style="width:100%; max-width:400px; height:auto; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);" alt="Imagen descriptiva">'
        });

        bm.add('media-image-rounded', {
          label: '🖼️ Imagen Circular',
          category: '🖼️ Medios',
          content: '<img src="https://via.placeholder.com/200x200" style="width:200px; height:200px; border-radius:50%; object-fit:cover; box-shadow:0 4px 12px rgba(0,0,0,0.15);" alt="Imagen circular">'
        });

        bm.add('media-gallery-grid', {
          label: '🖼️ Galería Grid',
          category: '🖼️ Medios',
          content: `<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; padding:20px;">
            <img src="https://via.placeholder.com/200x200" style="width:100%; height:200px; object-fit:cover; border-radius:8px;" alt="Imagen 1">
            <img src="https://via.placeholder.com/200x200" style="width:100%; height:200px; object-fit:cover; border-radius:8px;" alt="Imagen 2">
            <img src="https://via.placeholder.com/200x200" style="width:100%; height:200px; object-fit:cover; border-radius:8px;" alt="Imagen 3">
            <img src="https://via.placeholder.com/200x200" style="width:100%; height:200px; object-fit:cover; border-radius:8px;" alt="Imagen 4">
          </div>`
        });

        bm.add('media-video-responsive', {
          label: '🎥 Video Responsivo',
          category: '🖼️ Medios',
          content: `<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen></iframe>
          </div>`
        });

        bm.add('media-audio-player', {
          label: '🎵 Reproductor Audio',
          category: '🖼️ Medios',
          content: `<div style="background:white; border-radius:12px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.1); max-width:400px;">
            <h4 style="margin:0 0 12px 0; font-size:16px; font-weight:600;">Título del Audio</h4>
            <audio controls style="width:100%; margin-bottom:8px;">
              <source src="#" type="audio/mpeg">
              Tu navegador no soporta el elemento de audio.
            </audio>
            <p style="margin:0; font-size:14px; color:#6c757d;">Descripción del contenido de audio</p>
          </div>`
        });

        // 📋 CATEGORÍA: FORMULARIOS
        bm.add('form-input-text', {
          label: '📝 Input Texto',
          category: '📋 Formularios',
          content: `<div style="margin-bottom:16px;">
            <label style="display:block; margin-bottom:6px; font-weight:500; color:#495057;">Etiqueta del Campo</label>
            <input type="text" placeholder="Escribe aquí..." style="width:100%; padding:12px; border:2px solid #e9ecef; border-radius:6px; font-size:16px; transition:border-color 0.3s;">
          </div>`
        });

        bm.add('form-textarea', {
          label: '📝 Área de Texto',
          category: '📋 Formularios',
          content: `<div style="margin-bottom:16px;">
            <label style="display:block; margin-bottom:6px; font-weight:500; color:#495057;">Mensaje</label>
            <textarea placeholder="Escribe tu mensaje aquí..." rows="4" style="width:100%; padding:12px; border:2px solid #e9ecef; border-radius:6px; font-size:16px; resize:vertical; transition:border-color 0.3s;"></textarea>
          </div>`
        });

        bm.add('form-select', {
          label: '📋 Select/Dropdown',
          category: '📋 Formularios',
          content: `<div style="margin-bottom:16px;">
            <label style="display:block; margin-bottom:6px; font-weight:500; color:#495057;">Selecciona una opción</label>
            <select style="width:100%; padding:12px; border:2px solid #e9ecef; border-radius:6px; font-size:16px; background:white;">
              <option>Opción 1</option>
              <option>Opción 2</option>
              <option>Opción 3</option>
            </select>
          </div>`
        });

        bm.add('form-checkbox', {
          label: '☑️ Checkbox',
          category: '📋 Formularios',
          content: `<div style="margin-bottom:16px;">
            <label style="display:flex; align-items:center; cursor:pointer;">
              <input type="checkbox" style="margin-right:8px; transform:scale(1.2);">
              <span style="font-weight:500; color:#495057;">Acepto los términos y condiciones</span>
            </label>
          </div>`
        });

        bm.add('form-radio-group', {
          label: '🔘 Radio Buttons',
          category: '📋 Formularios',
          content: `<div style="margin-bottom:16px;">
            <label style="display:block; margin-bottom:8px; font-weight:500; color:#495057;">Selecciona una opción:</label>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="display:flex; align-items:center; cursor:pointer;">
                <input type="radio" name="radio-group" style="margin-right:8px;">
                <span>Primera opción</span>
              </label>
              <label style="display:flex; align-items:center; cursor:pointer;">
                <input type="radio" name="radio-group" style="margin-right:8px;">
                <span>Segunda opción</span>
              </label>
            </div>
          </div>`
        });

        bm.add('form-complete', {
          label: '📋 Formulario Completo',
          category: '📋 Formularios',
          content: `<form style="background:white; padding:32px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); max-width:500px; margin:20px auto;">
            <h3 style="margin:0 0 24px 0; text-align:center; color:#495057;">Formulario de Contacto</h3>
            
            <div style="margin-bottom:20px;">
              <label style="display:block; margin-bottom:6px; font-weight:500; color:#495057;">Nombre completo</label>
              <input type="text" placeholder="Tu nombre" style="width:100%; padding:12px; border:2px solid #e9ecef; border-radius:6px; font-size:16px;">
            </div>
            
            <div style="margin-bottom:20px;">
              <label style="display:block; margin-bottom:6px; font-weight:500; color:#495057;">Email</label>
              <input type="email" placeholder="tu@email.com" style="width:100%; padding:12px; border:2px solid #e9ecef; border-radius:6px; font-size:16px;">
            </div>
            
            <div style="margin-bottom:20px;">
              <label style="display:block; margin-bottom:6px; font-weight:500; color:#495057;">Mensaje</label>
              <textarea placeholder="Escribe tu mensaje..." rows="4" style="width:100%; padding:12px; border:2px solid #e9ecef; border-radius:6px; font-size:16px; resize:vertical;"></textarea>
            </div>
            
            <button type="submit" style="width:100%; padding:14px; background:#007bff; color:white; border:none; border-radius:6px; font-size:16px; font-weight:500; cursor:pointer;">Enviar Mensaje</button>
          </form>`
        });

        // 🧭 CATEGORÍA: NAVEGACIÓN
        bm.add('nav-horizontal-menu', {
          label: '🧭 Menú Horizontal',
          category: '🧭 Navegación',
          content: `<nav style="background:white; padding:16px 0; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            <div style="max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; padding:0 20px;">
              <div style="font-size:24px; font-weight:bold; color:#007bff;">Logo</div>
              <ul style="display:flex; list-style:none; margin:0; padding:0; gap:32px;">
                <li><a href="#" style="text-decoration:none; color:#495057; font-weight:500; transition:color 0.3s;">Inicio</a></li>
                <li><a href="#" style="text-decoration:none; color:#495057; font-weight:500; transition:color 0.3s;">Servicios</a></li>
                <li><a href="#" style="text-decoration:none; color:#495057; font-weight:500; transition:color 0.3s;">Acerca</a></li>
                <li><a href="#" style="text-decoration:none; color:#495057; font-weight:500; transition:color 0.3s;">Contacto</a></li>
              </ul>
            </div>
          </nav>`
        });

        bm.add('nav-breadcrumbs', {
          label: '🍞 Breadcrumbs',
          category: '🧭 Navegación',
          content: `<nav style="padding:16px 0;">
            <ol style="display:flex; list-style:none; margin:0; padding:0; align-items:center; gap:8px; color:#6c757d;">
              <li><a href="#" style="text-decoration:none; color:#007bff;">Inicio</a></li>
              <li style="margin:0 4px;">/</li>
              <li><a href="#" style="text-decoration:none; color:#007bff;">Categoría</a></li>
              <li style="margin:0 4px;">/</li>
              <li style="color:#495057;">Página Actual</li>
            </ol>
          </nav>`
        });

        bm.add('nav-pagination', {
          label: '📄 Paginación',
          category: '🧭 Navegación',
          content: `<nav style="display:flex; justify-content:center; padding:32px 0;">
            <ul style="display:flex; list-style:none; margin:0; padding:0; gap:8px; align-items:center;">
              <li><a href="#" style="padding:8px 12px; border:1px solid #dee2e6; border-radius:4px; text-decoration:none; color:#6c757d;">‹ Anterior</a></li>
              <li><a href="#" style="padding:8px 12px; border:1px solid #dee2e6; border-radius:4px; text-decoration:none; color:#495057; background:#f8f9fa;">1</a></li>
              <li><a href="#" style="padding:8px 12px; border:1px solid #007bff; border-radius:4px; text-decoration:none; color:white; background:#007bff;">2</a></li>
              <li><a href="#" style="padding:8px 12px; border:1px solid #dee2e6; border-radius:4px; text-decoration:none; color:#495057;">3</a></li>
              <li><a href="#" style="padding:8px 12px; border:1px solid #dee2e6; border-radius:4px; text-decoration:none; color:#6c757d;">Siguiente ›</a></li>
            </ul>
          </nav>`
        });

        bm.add('nav-tabs', {
          label: '📑 Pestañas',
          category: '🧭 Navegación',
          content: `<div style="border-bottom:1px solid #dee2e6; margin-bottom:20px;">
            <ul style="display:flex; list-style:none; margin:0; padding:0; gap:0;">
              <li><a href="#" style="padding:12px 24px; text-decoration:none; color:#007bff; border-bottom:2px solid #007bff; font-weight:500;">Pestaña Activa</a></li>
              <li><a href="#" style="padding:12px 24px; text-decoration:none; color:#6c757d; border-bottom:2px solid transparent; font-weight:500;">Pestaña 2</a></li>
              <li><a href="#" style="padding:12px 24px; text-decoration:none; color:#6c757d; border-bottom:2px solid transparent; font-weight:500;">Pestaña 3</a></li>
            </ul>
          </div>`
        });

        // 🏗️ SECCIONES ADICIONALES (CONSOLIDADAS EN 📊 SECCIONES)
        bm.add('section-hero-modern', {
          label: '🏗️ Hero Moderno',
          category: '📊 Secciones',
          content: `<section style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; padding:100px 20px; text-align:center;">
            <div style="max-width:800px; margin:0 auto;">
              <h1 style="font-size:56px; font-weight:700; margin:0 0 24px 0; line-height:1.2;">Título Impactante</h1>
              <p style="font-size:24px; margin:0 0 40px 0; opacity:0.9; line-height:1.4;">Subtítulo que explica de manera clara y concisa el valor que ofreces</p>
              <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap;">
                <button style="padding:16px 32px; background:white; color:#667eea; border:none; border-radius:8px; font-size:18px; font-weight:600; cursor:pointer;">Comenzar Ahora</button>
                <button style="padding:16px 32px; background:transparent; color:white; border:2px solid white; border-radius:8px; font-size:18px; font-weight:600; cursor:pointer;">Saber Más</button>
              </div>
            </div>
          </section>`
        });

        bm.add('section-features-cards', {
          label: '🏗️ Características Cards',
          category: '📊 Secciones',
          content: `<section style="padding:80px 20px; background:#f8f9fa;">
            <div style="max-width:1200px; margin:0 auto; text-align:center;">
              <h2 style="font-size:42px; font-weight:700; margin:0 0 16px 0; color:#212529;">Nuestras Características</h2>
              <p style="font-size:20px; color:#6c757d; margin:0 0 60px 0; max-width:600px; margin-left:auto; margin-right:auto;">Descubre todo lo que podemos hacer por ti</p>
              
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:32px;">
                <div style="background:white; padding:40px 32px; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.1); text-align:center;">
                  <div style="width:80px; height:80px; background:#007bff; border-radius:50%; margin:0 auto 24px; display:flex; align-items:center; justify-content:center; font-size:32px; color:white;">🚀</div>
                  <h3 style="font-size:24px; font-weight:600; margin:0 0 16px 0; color:#212529;">Rápido</h3>
                  <p style="color:#6c757d; line-height:1.6; margin:0;">Optimizado para la máxima velocidad y rendimiento en todos los dispositivos.</p>
                </div>
                
                <div style="background:white; padding:40px 32px; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.1); text-align:center;">
                  <div style="width:80px; height:80px; background:#28a745; border-radius:50%; margin:0 auto 24px; display:flex; align-items:center; justify-content:center; font-size:32px; color:white;">🔒</div>
                  <h3 style="font-size:24px; font-weight:600; margin:0 0 16px 0; color:#212529;">Seguro</h3>
                  <p style="color:#6c757d; line-height:1.6; margin:0;">Protección avanzada y encriptación de datos para mantener tu información segura.</p>
                </div>
                
                <div style="background:white; padding:40px 32px; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.1); text-align:center;">
                  <div style="width:80px; height:80px; background:#ffc107; border-radius:50%; margin:0 auto 24px; display:flex; align-items:center; justify-content:center; font-size:32px; color:white;">⚡</div>
                  <h3 style="font-size:24px; font-weight:600; margin:0 0 16px 0; color:#212529;">Potente</h3>
                  <p style="color:#6c757d; line-height:1.6; margin:0;">Herramientas avanzadas que te permiten lograr más en menos tiempo.</p>
                </div>
              </div>
            </div>
          </section>`
        });

        bm.add('section-cta-modern', {
          label: '🏗️ CTA Moderno',
          category: '📊 Secciones',
          content: `<section style="background:linear-gradient(45deg, #ff6b6b, #ee5a24); padding:80px 20px; text-align:center; color:white;">
            <div style="max-width:800px; margin:0 auto;">
              <h2 style="font-size:48px; font-weight:700; margin:0 0 20px 0; line-height:1.2;">¿Listo para comenzar?</h2>
              <p style="font-size:22px; margin:0 0 40px 0; opacity:0.9; line-height:1.5;">Únete a miles de usuarios que ya están transformando su negocio</p>
              <button style="padding:20px 40px; background:white; color:#ff6b6b; border:none; border-radius:50px; font-size:20px; font-weight:600; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.2); transition:transform 0.3s;">Empezar Gratis</button>
            </div>
          </section>`
        });

        // Categoría: Componentes
        bm.add('card', {
          label: 'Tarjeta',
          category: 'Componentes',
          content: '<div style="background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 24px; max-width: 400px;"><h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">Título</h3><p style="color: #6b7280;">Descripción de la tarjeta</p></div>'
        });

        /* Eliminados: botones primario/secundario en categoría Componentes para dejar solo el botón básico
        bm.add('button-primary', {
          label: 'Botón Primario',
          category: 'Componentes',
          content: {
            type: 'button',
            content: 'Botón Primario',
            attributes: {
              type: 'button',
              class: 'btn btn-primary',
              style: 'display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;',
              'data-action-type': 'none'
            },
            traits: [
              {
                type: 'text',
                label: 'Texto del Botón',
                name: 'content',
                changeProp: true
              },
              {
                type: 'text',
                label: 'URL',
                name: 'href',
                placeholder: '#'
              },
              {
                type: 'select',
                label: 'Abrir en',
                name: 'data-target',
                changeProp: true,
                options: [
                  { id: '_self', name: 'Misma ventana' },
                  { id: '_blank', name: 'Nueva pestaña' }
                ]
              }
            ]
          }
        });
       
        bm.add('button-secondary', {
          label: 'Botón Secundario',
          category: 'Componentes',
          content: {
            type: 'button',
            content: 'Botón Secundario',
            attributes: {
              type: 'button',
              class: 'btn btn-secondary',
              style: 'display: inline-block; padding: 12px 24px; background: transparent; color: #3b82f6; border: 2px solid #3b82f6; border-radius: 8px; font-weight: 600; cursor: pointer;',
              'data-action-type': 'none'
            },
            traits: [
              {
                type: 'text',
                label: 'Texto del Botón',
                name: 'content',
                changeProp: true
              },
              {
                type: 'text',
                label: 'URL',
                name: 'href',
                placeholder: '#'
              },
              {
                type: 'select',
                label: 'Abrir en',
                name: 'data-target',
                changeProp: true,
                options: [
                  { id: '_self', name: 'Misma ventana' },
                  { id: '_blank', name: 'Nueva pestaña' }
                ]
              }
            ]
          }
        });
        */

        // Texto con Gradiente
        bm.add('text-gradient', {
          label: 'Texto con Gradiente',
          category: 'Texto',
          content: '<h1 style="font-size: 48px; font-weight: bold; background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Texto con Gradiente</h1>'
        });

        // Categoría: Media
        bm.add('video', {
          label: 'Video',
          category: 'Media',
          content: '<video controls style="width: 100%; max-width: 640px;"><source src="" type="video/mp4">Tu navegador no soporta video.</video>'
        });

        bm.add('iframe', {
          label: 'Iframe',
          category: 'Media',
          content: '<iframe src="" style="width: 100%; height: 400px; border: none;"></iframe>'
        });

        // El iframe del canvas puede aún no estar listo; se usa 'canvas:frame:load'
      });

      // El frame del canvas está listo; validar ancho antes de marcar canvasReady
      gEditor.on('canvas:frame:load', () => {
        console.log('🖼️ Canvas frame listo');

        // 🔧 PARCHE: Evitar que scripts de botones ejecuten acciones dentro del canvas del editor
        try {
          const frame = gEditor.Canvas.getFrameEl();
          if (frame && frame.contentWindow) {
            // En el canvas del editor, checkEditorContext debe retornar TRUE
            // para que los botones NO executen sus acciones al hacer clic en el canvas
            (frame.contentWindow as any).checkEditorContext = () => true;
            console.log('✅ Parche checkEditorContext aplicado al iframe (retorna true = modo editor)');

            // También prevenir errores relacionados con checkEditorContext
            frame.contentWindow.addEventListener('error', (e) => {
              if (e.message && e.message.includes('checkEditorContext')) {
                e.preventDefault();
                console.log('🛡️ Error checkEditorContext prevenido en iframe');
              }
            });
          }
        } catch (e) {
          console.warn('⚠️ No se pudo aplicar parche checkEditorContext:', e);
        }

        const checkWidthAndReady = () => {
          try {
            const frame = gEditor.Canvas.getFrameEl();
            const width = frame?.offsetWidth || 0;
            const bodyWidth = (frame as any)?.contentDocument?.body?.offsetWidth || 0;
            const finalWidth = Math.max(width, bodyWidth);
            if (finalWidth > 0) {
              console.log('📏 Ancho del iframe del canvas:', finalWidth);
              try { perfStartRef.current = performance.now(); console.log('⏱️ t0 Canvas listo'); } catch { }
              setCanvasReady(true);
              // Inyectar estilos globales cuando el canvas está listo
              try { injectTailwindIntoCanvas(); } catch { }
              try { injectPageStyles(); } catch { }
              return true;
            }
          } catch { }
          return false;
        };
        if (!checkWidthAndReady()) {
          console.warn('⏳ Canvas sin ancho medible aún; iniciando reintentos cada 100ms');
          if (readyIntervalRef.current) {
            try { clearInterval(readyIntervalRef.current); } catch { }
            readyIntervalRef.current = null;
          }
          const startTs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
          readyIntervalRef.current = setInterval(() => {
            if (checkWidthAndReady()) {
              if (readyIntervalRef.current) {
                try { clearInterval(readyIntervalRef.current); } catch { }
                readyIntervalRef.current = null;
              }
              // Asegurar inyección tras medir correctamente
              try { injectTailwindIntoCanvas(); } catch { }
              try { injectPageStyles(); } catch { }
              return;
            }
            const nowTs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            if (nowTs - startTs > 60000) {
              console.warn('⏰ Timeout esperando canvas medible (>60s). Deteniendo reintentos.');
              if (readyIntervalRef.current) {
                try { clearInterval(readyIntervalRef.current); } catch { }
                readyIntervalRef.current = null;
              }
            }
          }, 100);
        }
      });

      return true;
    } catch (error) {
      console.error('❌ Error inicializando editor:', error);
      initializationAttempted.current = false;
      return false;
    }
  }, [scheduleAutoSave]);

  // Inicializar editor: espera activa por contenedor antes de iniciar GrapesJS
  useEffect(() => {
    console.log('🔄 useEffect [init editor][slug/loading]', { slug, loading });
    if (!slug) return;
    if (loading) {
      // Esperar a que pageData esté lista para renderizar el contenedor
      console.log('⏳ Esperando datos de la página antes de inicializar el editor');
      return;
    }
    if (editorInstanceRef.current) {
      if (lastInitSlugRef.current === slug) {
        console.log('⏭️ Editor ya inicializado para este slug; no se reinicia');
      } else {
        console.log('ℹ️ Slug cambió pero el editor persiste; se actualizará contenido sin reiniciar');
      }
      return;
    }

    const container = editorContainerRef.current || document.getElementById('gjs');
    if (!container) {
      console.warn('⚠️ Contenedor no presente todavía; reintentando en 100ms');
      const t = setTimeout(() => {
        if (editorContainerRef.current || document.getElementById('gjs')) {
          console.log('✅ Contenedor listo, inicializando GrapesJS...');
          initializeEditor();
        } else {
          console.error('❌ No se encontró el contenedor del editor en reintento');
        }
      }, 100);
      return () => clearTimeout(t);
    }
    console.log('✅ Contenedor listo, inicializando GrapesJS...');
    initializeEditor();

    return () => {
      try {
        const ed = editorInstanceRef.current;
        if (ed) {
          ed.destroy();
          editorInstanceRef.current = null;
          console.log('🧹 Editor destruido en cleanup de init useEffect');
        }
      } catch (e) {
        console.warn('No se pudo destruir editor en cleanup:', e);
      }
    };
  }, [slug, loading]);

  // Cleanup al desmontar
  useEffect(() => {
    console.log('🔄 useEffect [cleanup][]');
    return () => {
      try {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        if (readyIntervalRef.current) {
          clearInterval(readyIntervalRef.current);
          readyIntervalRef.current = null;
        }
        // Destruir editor solo en desmontaje real del componente
        if (editorInstanceRef.current) {
          try {
            // Llamar cleanup functions si existen
            if ((editorInstanceRef.current as any)._windowResizeCleanup) {
              (editorInstanceRef.current as any)._windowResizeCleanup();
            }
            if ((editorInstanceRef.current as any)._canvasResizeCleanup) {
              (editorInstanceRef.current as any)._canvasResizeCleanup();
            }
            editorInstanceRef.current.destroy();
          } catch { }
          editorInstanceRef.current = null;
        }
      } catch (e) {
        console.warn('Error destruyendo editor:', e);
      }
    };
  }, []);

  // Reset de flags al cambiar de slug
  useEffect(() => {
    console.log('🔄 useEffect [slug reset]');
    // No destruir ni reinicializar el editor aquí.
    // Solo marcamos el contenido como no cargado para permitir recarga controlada.
    setContentLoaded(false);
  }, [slug]);

  // Método mejorado para cargar contenido
  const loadContentIntoEditor = async (pageData: any) => {
    if (!editorInstanceRef.current) {
      console.log('⏳ Esperando que el editor esté listo...');
      return;
    }

    // Bloquear carga si el iframe del canvas aún no es medible
    try {
      const frame = editorInstanceRef.current.Canvas.getFrameEl();
      const width = frame?.offsetWidth || 0;
      if (!frame?.contentWindow || width === 0) {
        console.warn('⏳ Esperando al canvas (iframe no medible o sin contentWindow)');
        return;
      }
    } catch (e) {
      console.warn('⚠️ No se pudo verificar el iframe del canvas antes de cargar contenido:', e);
      return;
    }

    console.log('🔄 Cargando contenido en editor...');
    console.log('🔍 pageData recibido:', pageData);

    try {
      // PRIORIDAD 0: Usar gjsComponents/gjsStyles como fuente prioritaria
      // Esta vía preserva la semántica interna de GrapesJS y evita interpretaciones desde HTML
      if (pageData.gjsComponents) {
        console.log('✅ Intentando cargar proyecto desde gjsComponents/gjsStyles (prioritario)');

        let components = pageData.gjsComponents;
        let styles = pageData.gjsStyles || [];

        try {
          if (typeof components === 'string') components = JSON.parse(components);
        } catch (e) {
          console.warn('gjsComponents no parseable', e);
          components = [];
        }
        try {
          if (typeof styles === 'string') styles = JSON.parse(styles);
        } catch (e) {
          console.warn('gjsStyles no parseable', e);
          styles = [];
        }

        const compsLen = Array.isArray(components) ? components.length : 0;
        if (compsLen > 0) {
          try {
            editorInstanceRef.current.loadProjectData({ components, styles });
            try { makeImportedContentEditable(editorInstanceRef.current); } catch { }
            const htmlNow = editorInstanceRef.current.getHtml();
            latestHtmlRef.current = htmlNow || latestHtmlRef.current;
            try { latestCssRef.current = editorInstanceRef.current.getCss(); } catch { }
            setContentLoaded(true);
            try { injectTailwindIntoCanvas(); } catch { }
            console.log('✅ Proyecto cargado desde JSON (components/styles), componentes:', compsLen);
            return;
          } catch (e) {
            console.warn('⚠️ loadProjectData falló con componentes válidos, se intentará fallback a gjsHtml/html', e);
          }
        } else {
          console.warn('ℹ️ gjsComponents vacío; se usará fallback a gjsHtml/html');
        }
      }

      // PRIORIDAD 1: Usar gjsHtml con carga correcta en GrapesJS
      if (pageData.gjsHtml) {
        console.log('✅ Cargando desde gjsHtml con método correcto');

        // Limpiar tags de React
        let cleanHtml = pageData.gjsHtml;
        cleanHtml = cleanHtml.replace(/<Layout>/g, '').replace(/<\/Layout>/g, '');
        // Si el HTML viene envuelto en <body>, extraer sólo su contenido interno
        try {
          if (/\<body[\s\S]*\>/i.test(cleanHtml)) {
            const parser = new DOMParser();
            const parsed = parser.parseFromString(cleanHtml, 'text/html');
            const inner = parsed?.body?.innerHTML || '';
            if (inner.trim().length > 0) {
              cleanHtml = inner;
              console.log('🧹 Removida etiqueta <body>, contenido interno preservado');
            }
          }
        } catch (e) {
          console.warn('No se pudo procesar <body> del HTML:', e);
        }

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
          // Espera de Tailwind desactivada temporalmente
          // Cargar HTML
          editorInstanceRef.current.setComponents(cleanHtml);
          // FIX A: el HTML importado se parsea como componentes 'default' (no editables).
          // Marcar como editables los contenedores de texto puro para permitir doble clic.
          try { makeImportedContentEditable(editorInstanceRef.current); } catch { }
          console.log('✅ Componentes establecidos');
          // Cargar CSS si existe
          if (pageData.gjsCss) {
            editorInstanceRef.current.setStyle(pageData.gjsCss);
            latestCssRef.current = pageData.gjsCss;
            console.log('✅ Estilos establecidos');
          }
          latestHtmlRef.current = cleanHtml;
          // Cierre del ciclo de carga
          setContentLoaded(true);
          try {
            const t0 = perfStartRef.current;
            const t1 = performance.now();
            if (t0) {
              console.log(`✅ Editor completamente cargado (Δ ${(t1 - t0).toFixed(0)} ms)`);
            } else {
              console.log('✅ Editor completamente cargado');
            }
          } catch {
            console.log('✅ Editor completamente cargado');
          }
          try {
            const root = editorInstanceRef.current.getComponents();
            const first = root?.at ? root.at(0) : (Array.isArray(root) ? root[0] : null);
            if (first) editorInstanceRef.current.select(first);
          } catch (e) { console.warn("No se pudo seleccionar componente inicial", e); }
          setTimeout(() => {
            try {
              // Inyección de estilos en post-load
              try { injectTailwindIntoCanvas(); } catch { }
              try { injectPageStyles(); } catch { }
              const doc = editorInstanceRef.current?.Canvas.getDocument();
              if (doc?.body) console.log('Body del iframe:', doc.body.innerHTML.substring(0, 200));
              // Intentar inyectar scripts tras establecer HTML
              try {
                const frame = editorInstanceRef.current?.Canvas.getFrameEl();
                const d = frame?.contentDocument || editorInstanceRef.current?.Canvas.getDocument();
                if (d) {
                  const html = latestHtmlRef.current || '';
                  const parser = new DOMParser();
                  const parsed = parser.parseFromString(html, 'text/html');
                  parsed.querySelectorAll('script[src]').forEach((el) => {
                    const src = el.getAttribute('src');
                    if (src && !d.querySelector(`script[src="${src}"]`)) {
                      const s = d.createElement('script');
                      s.src = src;
                      s.defer = true;
                      d.body.appendChild(s);
                      console.log('⚙️ Script externo cargado (post-load):', src);
                    }
                  });
                  parsed.querySelectorAll('script:not([src])').forEach((oldScript) => {
                    const content = oldScript.textContent || '';
                    if (content.trim().length === 0) return;
                    const newScript = d.createElement('script');
                    if (oldScript.getAttribute('type')) newScript.setAttribute('type', oldScript.getAttribute('type')!);
                    newScript.textContent = content;
                    d.body.appendChild(newScript);
                    console.log('🧠 Script inline reinyectado (post-load)');
                  });
                }
              } catch (se) {
                console.warn('No se pudieron inyectar scripts después de cargar HTML:', se);
              }
            } catch (e) {
              console.warn('No se pudo leer body del iframe del canvas:', e);
            }
          }, 500);
          console.log('✅ Editor renderizado');
        } catch (err) {
          console.error('❌ Error al cargar contenido:', err);
        }
        return;
      }

      // PRIORIDAD 2: Usar HTML/CSS simple
      if (pageData.html && pageData.css) {
        console.log('✅ Cargando desde HTML/CSS simple');

        const parser = new DOMParser();
        const doc = parser.parseFromString(pageData.html, 'text/html');
        const bodyContent = doc.body.innerHTML;

        editorInstanceRef.current.setComponents(bodyContent);
        try { makeImportedContentEditable(editorInstanceRef.current); } catch { }
        editorInstanceRef.current.setStyle(pageData.css);
        latestCssRef.current = pageData.css;
        latestHtmlRef.current = bodyContent;

        // Cierre del ciclo de carga
        setContentLoaded(true);
        console.log('✅ Contenido HTML/CSS cargado exitosamente');
        return;
      }

      // PRIORIDAD 3: Fallback a gjsComponents/gjsStyles
      if (pageData.gjsComponents) {
        console.log('🎯 Fallback: intentando cargar proyecto desde gjsComponents/gjsStyles');
        let components = pageData.gjsComponents;
        let styles = pageData.gjsStyles || [];
        try { if (typeof components === 'string') components = JSON.parse(components); } catch { }
        try { if (typeof styles === 'string') styles = JSON.parse(styles); } catch { }
        const compsLenFb = Array.isArray(components) ? components.length : 0;
        if (compsLenFb > 0) {
          try {
            editorInstanceRef.current.loadProjectData({ components, styles });
            const htmlNow = editorInstanceRef.current.getHtml();
            latestHtmlRef.current = htmlNow || latestHtmlRef.current;
            try { latestCssRef.current = editorInstanceRef.current.getCss(); } catch { }
            setContentLoaded(true);
            console.log('✅ Proyecto cargado desde JSON en fallback, componentes:', compsLenFb);
            return;
          } catch { }
        } else {
          console.warn('ℹ️ Fallback: gjsComponents vacío, se continuará con gjsHtml/html si existen');
        }
      }

      // PRIORIDAD 4: Si es una página nueva (sin ID), crear contenido por defecto
      if (!pageData.id && pageData.content) {
        console.log('📝 Creando contenido por defecto para página nueva');

        editorInstanceRef.current.setComponents(pageData.content);
        try { makeImportedContentEditable(editorInstanceRef.current); } catch { }
        if (pageData.css) {
          editorInstanceRef.current.setStyle(pageData.css);
          latestCssRef.current = pageData.css;
        }
        latestHtmlRef.current = pageData.content;

        // Cierre del ciclo de carga
        setContentLoaded(true);
        console.log('✅ Contenido por defecto cargado para página nueva');
        return;
      }

      console.warn('⚠️ No se encontró contenido válido para cargar');

    } catch (error) {
      console.error('❌ Error al cargar contenido:', error);
    }
  };

  // Cargar contenido una sola vez por slug cuando editor esté listo
  useEffect(() => {
    console.log('🔄 useEffect [load content]', { ready: editorReady, canvasReady, hasPage: !!pageData, loaded: contentLoaded });
    const ed = editorInstanceRef.current;
    if (!ed || !pageData || contentLoaded) return;

    // Si el iframe ya es medible, cargar inmediatamente
    try {
      const frame = ed.Canvas.getFrameEl();
      const width = frame?.offsetWidth || 0;
      if (frame?.contentWindow && width > 0) {
        console.log('📏 Iframe ya medible, cargando contenido...');
        loadContentIntoEditor(pageData);
        return;
      }
    } catch { }

    // Listener de iframe desactivado temporalmente
    // Reintentos de medición si aún no es medible
    console.log('⏳ Iframe no medible aún; iniciando reintentos de carga cada 100ms');
    let attempts = 0;
    const startTs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const interval = setInterval(() => {
      attempts++;
      const ed2 = editorInstanceRef.current;
      if (!ed2) { clearInterval(interval); return; }
      try {
        const frame2 = ed2.Canvas.getFrameEl();
        const w = frame2?.offsetWidth || 0;
        const bw = (frame2 as any)?.contentDocument?.body?.offsetWidth || 0;
        const fw = Math.max(w, bw);
        if (frame2?.contentWindow && fw > 0) {
          console.log('📏 Iframe medible en reintento, cargando contenido...');
          clearInterval(interval);
          loadContentIntoEditor(pageData);
          return;
        }
      } catch { }
      const nowTs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      if (canvasReady || (nowTs - startTs) > 20000) {
        console.warn('⏰ Timeout o canvasReady alcanzado; deteniendo reintentos de contenido');
        clearInterval(interval);
      }
    }, 100);
  }, [pageData, contentLoaded]);

  // Render managers bajo demanda según toggles
  useEffect(() => {
    const ed = editorInstanceRef.current;
    if (!ed) return;
    try {
      if (showBlocks) {
        const el = document.getElementById('blocks-panel');
        if (el) {
          const view: any = ed.BlockManager.render();
          if (view && view.el) {
            el.innerHTML = '';
            el.appendChild(view.el);
          }
        }
      }
    } catch (e) { console.warn('No se pudo renderizar BlockManager:', e); }
    try {
      if (showStyles) {
        const el = document.getElementById('styles-panel');
        if (el) {
          const view: any = ed.StyleManager.render();
          if (view && view.el) {
            el.innerHTML = '';
            el.appendChild(view.el);
          }
        }
      }
    } catch (e) { console.warn('No se pudo renderizar StyleManager:', e); }
    try {
      if (showLayers) {
        const el = document.getElementById('layers-container');
        if (el) {
          const view: any = ed.LayerManager.render();
          if (view && view.el) {
            el.innerHTML = '';
            el.appendChild(view.el);
          }
        }
      }
    } catch (e) { console.warn('No se pudo renderizar LayerManager:', e); }
    try {
      if (showClasses) {
        const el = document.getElementById('classes-panel');
        if (el) {
          el.innerHTML = '';
          ed.SelectorManager.render(el as any);
        }
      }
    } catch (e) { console.warn('No se pudo renderizar SelectorManager (Clases):', e); }
  }, [showBlocks, showStyles, showLayers, showClasses]);

  // Forzar refresco del canvas cuando cambie el layout de paneles
  useEffect(() => {
    const ed = editorInstanceRef.current;
    if (!ed) return;
    try {
      ed.trigger('canvas:update');
    } catch (e) {
      console.warn('No se pudo refrescar el canvas tras cambiar layout:', e);
    }
  }, [rightCollapsed, rightWidth]);

  // Limpiar contenedores al cerrar toggles para evitar DOM pesado
  useEffect(() => {
    const clear = (id: string) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    };
    if (!showBlocks) clear('blocks-panel');
    if (!showStyles) clear('styles-panel');
    if (!showLayers) clear('layers-container');
    if (!showClasses) clear('classes-panel');
  }, [showBlocks, showStyles, showLayers, showClasses]);

  // Previsualizar página
  const handlePreview = () => {
    if (!editorInstanceRef.current) return;

    const html = editorInstanceRef.current.getHtml();
    const css = editorInstanceRef.current.getCss();
    const styles = editorInstanceRef.current.getStyle();

    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Vista Previa - ${pageData?.title}</title>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: 'Roboto', Arial, sans-serif;
              }
              
              /* Estilos base para iconos y elementos comunes */
              .icon, .bi {
                display: inline-block;
                width: 1em;
                height: 1em;
                vertical-align: -0.125em;
              }
              
              /* Soporte para gradientes en texto */
              .text-gradient {
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                display: inline-block;
              }

              /* Mejora para marcadores de listas (bullets/numbers) */
              ul { list-style-type: disc !important; padding-left: 1.5rem; margin: 1rem 0; }
              ol { list-style-type: decimal !important; padding-left: 1.5rem; margin: 1rem 0; }
              li { display: list-item !important; }
              li::marker {
                color: inherit;
              }
              
              /* Estilos para componentes GrapesJS */
              ${(() => {
          try {
            if (styles) {
              const stylesObj = typeof styles === 'string' ? JSON.parse(styles) : styles;
              if (Array.isArray(stylesObj) && stylesObj.length > 0) {
                return stylesObj.map(style => {
                  if (style.selectors && style.style) {
                    const selectors = Array.isArray(style.selectors)
                      ? style.selectors.join(', ')
                      : style.selectors;

                    const styleProps = Object.entries(style.style)
                      .map(([prop, value]) => `${prop}: ${value};`)
                      .join(' ');

                    return `${selectors} { ${styleProps} }`;
                  }
                  return '';
                }).join('\n');
              }
            }
            return '';
          } catch (e) {
            console.error('Error parsing styles', e);
            return '';
          }
        })()}
            </style>
          </head>
          <body>
            ${html}
            
            <!-- Script para corregir rutas de imágenes relativas -->
            <script>
              document.addEventListener('DOMContentLoaded', function() {
                // Corregir rutas de imágenes relativas
                document.querySelectorAll('img').forEach(img => {
                  if (img.src && img.src.startsWith('/')) {
                    const originalSrc = img.src;
                    img.onerror = function() {
                      if (!this.dataset.tried) {
                        this.dataset.tried = 'true';
                        this.src = window.location.origin + originalSrc;
                      }
                    };
                  }
                });
              });
            </script>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  const publishPage = async () => {
    if (!confirm('¿Publicar los cambios a la página pública?')) return;

    try {
      await handleSave();

      const result = await HttpClient.post<ApiResponse<any>>(`/pages/${slug}/publish`, {});
      console.log('Respuesta de publicación:', result);

      if (result && result.success === true) {
        alert('✅ Página publicada. Abriendo en una nueva pestaña...');
        const target = `/${slug}?t=${Date.now()}`;
        window.open(target, '_blank', 'noopener,noreferrer');
      } else {
        alert('❌ Error: ' + (result?.message || result?.error || 'Error desconocido'));
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
      {/* Overrides visuales para unificar paleta y estilo GrapesJS */}
      <style>{`
        /* Colores base modernos y minimalistas */
        .gjs-one-bg { background-color: #0f172a !important; }
        .gjs-two-bg { background-color: #1e293b !important; }
        .gjs-three-bg { background-color: #0f172a !important; }
        .gjs-four-bg { background-color: #0b1220 !important; }
        .gjs-two-color { color: #f1f5f9 !important; }
        
        /* Colores de acento y primarios más modernos */
        .gjs-link, .gjs-color-warn { color: #6366f1 !important; }
        .gjs-primary-color { color: #6366f1 !important; }
        .gjs-primary-bg { background-color: #6366f1 !important; }

        /* Mejora para listas en el editor */
        .gjs-cv-canvas ul {
          list-style-type: disc !important;
          padding-left: 25px !important;
          margin: 10px 0 !important;
        }
        .gjs-cv-canvas ol {
          list-style-type: decimal !important;
          padding-left: 25px !important;
          margin: 10px 0 !important;
        }
        .gjs-cv-canvas li {
          display: list-item !important;
        }
        .gjs-cv-canvas li::marker {
          color: inherit !important;
        }
        .gjs-cv-canvas li:hover, .gjs-cv-canvas ul:hover, .gjs-cv-canvas ol:hover {
          outline: 1px dashed #8b5cf6 !important;
          outline-offset: -1px !important;
        }
        .gjs-cv-canvas li.gjs-selected, .gjs-cv-canvas ul.gjs-selected, .gjs-cv-canvas ol.gjs-selected {
          outline: 2px solid #8b5cf6 !important;
          outline-offset: -2px !important;
        }
        .gjs-blocks, .gjs-layers, .gjs-sm-sectors { 
          background: #0f172a !important; 
          border-radius: 12px !important; 
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        
        /* Bloques con diseño más moderno */
        .gjs-block { 
          border-radius: 8px !important; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          background-color: #1e293b !important;
          margin: 5px !important;
        }
        .gjs-block:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
          background-color: #2d3748 !important;
        }
        
        /* Sectores y propiedades con mejor organización */
        .gjs-sm-sector, .gjs-sm-property { background: transparent !important; }
        .gjs-sm-sector { 
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          margin-bottom: 12px !important;
          padding-bottom: 12px !important;
        }
        .gjs-sm-label, .gjs-layer-title { 
          color: #f1f5f9 !important; 
          font-weight: 500 !important;
          letter-spacing: 0.025em !important;
        }
        
        /* Botones y controles más elegantes */
        .gjs-btn-prim { 
          background: #6366f1 !important; 
          color: #fff !important; 
          border-radius: 8px !important; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none !important;
          padding: 10px 18px !important;
          font-weight: 500 !important;
          letter-spacing: 0.025em !important;
        }
        .gjs-btn-prim:hover {
          background: #818cf8 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4) !important;
        }
        
        /* Campos de entrada más modernos */
        .gjs-field { 
          background: #1e293b !important; 
          border-color: #334155 !important; 
          color: #f1f5f9 !important;
          border-radius: 8px !important;
          transition: all 0.3s ease;
          padding: 8px !important;
        }
        .gjs-field:focus-within {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3) !important;
        }
        
        /* Capas y estructura más organizadas */
        .gjs-layer {
          border-radius: 6px !important;
          margin-bottom: 3px !important;
          transition: all 0.2s ease;
          padding: 5px !important;
        }
        .gjs-layer.gjs-selected {
          background-color: rgba(99, 102, 241, 0.2) !important;
          border-left: 3px solid #6366f1 !important;
        }
        .gjs-layer-vis {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        
        /* Mejoras para paneles colapsables */
        .gjs-pn-btn {
          border-radius: 8px !important;
          margin: 2px !important;
          transition: all 0.2s ease !important;
        }
        .gjs-pn-btn:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .gjs-pn-btn.gjs-pn-active {
          background-color: rgba(99, 102, 241, 0.2) !important;
          color: #6366f1 !important;
        }
        
        /* Asegurar visibilidad del canvas e iframe */
        .gjs-cv-canvas { 
          height: 100% !important; 
          background: #f8fafc !important;
        }
        .gjs-frame, iframe.gjs-frame { 
          height: 100% !important; 
          display: block !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
          border-radius: 8px !important;
          border: 1px solid #e2e8f0 !important;
        }
        #gjs { 
          height: calc(100vh - 56px) !important; 
        }
        
        /* Mejoras para el panel de estilos */
        .gjs-sm-properties {
          padding: 12px 8px !important;
        }
        .gjs-sm-property {
          padding: 8px 0 !important;
          margin-bottom: 4px !important;
        }
        .gjs-sm-label {
          font-size: 13px !important;
          margin-bottom: 4px !important;
        }
        
        /* Mejoras para el panel de bloques */
        .gjs-blocks-c {
          padding: 15px !important;
          justify-content: space-between !important;
          gap: 8px !important;
        }
        .gjs-block-category {
          margin-bottom: 18px !important;
          padding-bottom: 10px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .gjs-title {
          font-weight: 600 !important;
          padding: 8px !important;
          letter-spacing: 0.025em !important;
          font-size: 14px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        /* Dropdown component styles */
        .dropdown { position: relative; display: inline-block; }
        .dropdown-btn { background: #fff; border: 1px solid #ddd; padding: 10px 15px; cursor: pointer; border-radius: 4px; }
        .dropdown-content { display: none; position: absolute; background: white; min-width: 150px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 10; }
        .dropdown-content a { display: block; padding: 10px; text-decoration: none; color: #333; }
        .dropdown:hover .dropdown-content { display: block; }
        
      `}</style>
      {/* Header - Estilo minimalista y moderno - Fijo en la parte superior */}
      <div className="bg-white shadow-md px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-[100]">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Dashboard
          </button>
          <h1 className="text-base font-medium text-gray-700">
            {pageData?.title || "Editor de Página"}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* Estado de guardado */}
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusDisplay.color === 'text-green-500' ? 'bg-green-50 text-green-600' : statusDisplay.color === 'text-yellow-500' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
              {statusDisplay.text}
            </span>
            {lastSaved && (
              <span className="text-xs text-gray-400">
                {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Info rápida del elemento seleccionado */}
          {selectedInfo && (
            <div className="hidden sm:flex items-center space-x-2 px-2 py-1 rounded-md bg-gray-50 text-gray-700">
              <span className="text-xs">{selectedInfo.name || 'Elemento'}</span>
              <span className="text-xs">{Math.round(selectedInfo.width)}×{Math.round(selectedInfo.height)} px</span>
            </div>
          )}

          {/* Botón de pegar imagen desde portapapeles */}
          <button
            onClick={() => {
              try {
                const fn = (window as any).pasteFromClipboard;
                if (typeof fn === 'function') fn();
              } catch (e) { console.warn('No se pudo pegar desde el portapapeles', e); }
            }}
            className="px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors"
          >
            Pegar imagen
          </button>

          {/* Acciones rápidas de alineación */}
          <div className="hidden md:flex items-center space-x-1">
            <button title="Alinear izquierda" className="px-2 py-1 text-sm bg-gray-50 hover:bg-gray-100 rounded" onClick={() => {
              try {
                const ed = editorInstanceRef.current; const sel = ed?.getSelected(); if (!sel) return;
                sel.addStyle({ 'margin-left': '0', 'margin-right': 'auto' });
              } catch { }
            }}>Izq</button>
            <button title="Centrar" className="px-2 py-1 text-sm bg-gray-50 hover:bg-gray-100 rounded" onClick={() => {
              try {
                const ed = editorInstanceRef.current; const sel = ed?.getSelected(); if (!sel) return;
                sel.addStyle({ 'margin-left': 'auto', 'margin-right': 'auto' });
              } catch { }
            }}>Centro</button>
            <button title="Alinear derecha" className="px-2 py-1 text-sm bg-gray-50 hover:bg-gray-100 rounded" onClick={() => {
              try {
                const ed = editorInstanceRef.current; const sel = ed?.getSelected(); if (!sel) return;
                sel.addStyle({ 'margin-left': 'auto', 'margin-right': '0' });
              } catch { }
            }}>Der</button>
            <button title="Convertir en círculo" className="ml-2 px-2 py-1 text-sm bg-gray-50 hover:bg-gray-100 rounded" onClick={() => {
              try {
                const ed = editorInstanceRef.current; const sel = ed?.getSelected(); if (!sel) return;
                const el = sel.getEl?.();
                let size = 100;
                if (el) {
                  const rect = (el as HTMLElement).getBoundingClientRect();
                  size = Math.round(Math.min(rect.width || 100, rect.height || 100));
                } else {
                  const st = sel.getStyle?.() || {};
                  const w = parseFloat(String((st as any).width || 100));
                  const h = parseFloat(String((st as any).height || 100));
                  size = Math.round(Math.min(w || 100, h || 100));
                }
                if (!size || !isFinite(size)) size = 100;
                sel.addStyle({ width: `${size}px`, height: `${size}px`, 'border-radius': '50%', overflow: 'hidden' });
              } catch { }
            }}>Círculo</button>
          </div>

          <button
            onClick={() => handleSave(false)}
            disabled={saveStatus === 'saving' || saveStatus === 'auto-saving'}
            className="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center"
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

      {/* Editor Container nativo de GrapesJS */}
      <div className="flex-1 fixed top-[85px] left-0 right-0 bottom-0 z-10">
        {/* Lienzo del editor con gating visual hasta que canvas esté listo */}
        <div className="flex-1 flex flex-col relative h-full">
          {!canvasReady && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <div className="text-gray-600 text-sm">Preparando estilos del canvas…</div>
              </div>
            </div>
          )}
          <div
            ref={editorContainerRef}
            id="gjs"
            style={{ height: 'calc(100vh - 85px)', overflow: 'auto', transition: 'all 0.2s ease-in-out', visibility: canvasReady ? 'visible' : 'hidden' }}
            className="w-full"
          />

          {/* Panel de traits nativo de GrapesJS se gestiona desde el panel derecho ('open-tm').
              Se eliminó el contenedor personalizado de configuración para evitar barras laterales duplicadas. */}

        </div>
      </div>
    </div>
  );
};

export default GrapesEditor;
