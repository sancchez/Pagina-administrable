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
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'auto-saving';

const GrapesEditor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Referencias para evitar re-renders infinitos
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<Editor | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [rightWidth, setRightWidth] = useState<number>(320);
  const dragStateRef = useRef<{ side: 'left' | 'right' | null; startX: number; startW: number }>({ side: null, startX: 0, startW: 0 });
  // Constructor de gradiente (UI personalizada)
  const [gradientStopCount, setGradientStopCount] = useState<number>(2);
  const [gradientStops, setGradientStops] = useState<string[]>(['#3b82f6', '#8b5cf6']);
  const [gradientAngle, setGradientAngle] = useState<number>(90);

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
      const href = '/tailwind.css';
      if (!doc.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        doc.head.appendChild(link);
        console.log('🎨 Tailwind CSS inyectado en canvas');
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

      // Preparar payload con datos de GrapesJS
      const grapesJsData = {
        html: html || '',
        css: css || '',
        components: typeof components === 'string' ? JSON.parse(components) : components || [],
        styles: typeof styles === 'string' ? JSON.parse(styles) : styles || []
      };

      // Solo enviar los campos permitidos por el backend
      const payload: any = {
        // Clave principal esperada por el backend
        grapesData: JSON.stringify(grapesJsData),
        // Campos en camelCase que sí están permitidos según el error
        gjsHtml: html,
        gjsCss: css,
        gjsComponents: typeof components === 'string' ? components : JSON.stringify(components || []),
        gjsStyles: typeof styles === 'string' ? styles : JSON.stringify(styles || [])
      };

      // Guardar por ID usando HttpClient con Authorization
      const resultJson = await HttpClient.post<ApiResponse<{ page: PageData }>>(
        `/pages/${pageData.id}/grapes-data`,
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
      setPageData(page);
    } catch (error) {
      console.error('Error:', error);
      setError(normalizeError(error));
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
      } catch {}
      const gEditor = grapesjs.init({
        container: editorContainerRef.current,
        height: '100vh',
        width: 'auto',
        panels: { defaults: [] },
        i18n: {
          locale: 'es',
          messages: {
            es: {
              styleManager: {
                empty: 'Selecciona un elemento para editarlo',
                sectors: {
                  general: 'General',
                  layout: 'Diseño',
                  typography: 'Tipografía',
                  decorations: 'Decoraciones',
                  extra: 'Extra'
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
                  'z-index': 'Índice Z'
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
                  layout: 'Diseño',
                  forms: 'Formularios'
                }
              }
            }
          }
        },
        // Plugins como funciones; se envían opciones vía wrappers para ajustar tipos
        plugins: [
          (ed: Editor) => pluginBasic(ed, {
            blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image'],
            flexGrid: 1
          }),
          (ed: Editor) => pluginFormsFn(ed, {
            blocks: ['form', 'input', 'textarea', 'select', 'button', 'label']
          }),
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
              name: 'Fondos y Gradientes',
              open: false,
              properties: [
                {
                  type: 'color',
                  property: 'background-color',
                  label: 'Color de fondo sólido'
                }
              ]
            },
            {
              name: "Posición",
              open: true,
              properties: [
                {
                  type: "select",
                  property: "position",
                  list: [
                    { id: "static", value: "static", name: "Estático" },
                    { id: "relative", value: "relative", name: "Relativo" },
                    { id: "absolute", value: "absolute", name: "Absoluto" },
                    { id: "fixed", value: "fixed", name: "Fijo" }
                  ]
                },
                "top",
                "right",
                "bottom",
                "left",
                {
                  type: "integer",
                  property: "z-index",
                  label: "Capa (Z)",
                  min: -10,
                  max: 100
                }
              ]
            },
            {
              name: 'Dimensiones',
              open: true,
              buildProps: ['width', 'height', 'max-width', 'min-height', 'padding', 'margin']
            },
            {
              name: 'Texto',
              open: true,
              buildProps: [
                'font-size', 'font-family', 'font-weight', 'letter-spacing',
                'color', 'line-height', 'text-align', 'text-decoration'
              ]
            },
            {
              name: 'Color y Fondo',
              open: false,
              buildProps: ['color', 'background-color', 'border-color', 'background']
            },
            {
              name: 'Bordes y Sombras',
              open: false,
              buildProps: ['border', 'border-radius', 'box-shadow']
            }
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
            { id: "Wide", name: "Ancho", width: "1024px" }
          ]
        },
        // Posicionamiento libre removido: 'canvasOffset' no es parte de EditorConfig tipado
        // Configuración adicional removida para cumplir tipos de DomComponents
        storageManager: false,
        avoidInlineStyle: true,
        canvas: {
          styles: [
            ".dragging{opacity:0.7 !important;border:2px dashed #3b82f6 !important;z-index:9999 !important;} .gjs-placeholder{background: rgba(59,130,246,0.1) !important;border: 2px dashed #3b82f6 !important;min-height:50px !important;}",
            '/tailwind.css',
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
          ],
          scripts: []
        },
      });

      // Logs de verificación para StyleManager
      try {
        console.log('StyleManager configurado:', gEditor.StyleManager);
        console.log('Sectores:', gEditor.StyleManager.getSectors().length);
      } catch (e) {
        console.warn('No se pudo obtener información de StyleManager:', e);
      }

      // Guardar instancia
      editorInstanceRef.current = gEditor;
      try { (window as any).editor = gEditor; (window as any).__gjs = gEditor; console.log("🪄 Editor expuesto en window"); } catch(e) { console.warn("No se pudo exponer editor en window", e); }
      // Sin estado: editorInstanceRef mantiene la instancia

      // Definir un dispositivo ancho para activar breakpoints md de Tailwind
      try {
        gEditor.setDevice("Wide");
        console.log('📐 Dispositivo del canvas configurado: Wide (1024px)');
      } catch (e) {
        console.warn('⚠️ No se pudo configurar dispositivo Wide:', e);
      }

      // Eventos desactivados temporalmente para diagnóstico de performance
      try {
        gEditor.on('load', () => console.log('🎯 Editor load'));
        gEditor.on('component:selected', () => {});
      } catch {}

      // Contadores simples desactivados: los helpers globales manejan reintentos

      // Registrar tipo personalizado 'gradient' en StyleManager
      try {
        const sm = gEditor.StyleManager as any;
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
        const setColorsToUI = (root: HTMLElement, colors: string[], positions?: number[]) => {
          const list = root.querySelector('.gjs-grad-list') as HTMLElement;
          if (!list) return;
          list.innerHTML = '';
          colors.forEach((color, idx) => {
            const row = document.createElement('div');
            row.className = 'gjs-grad-row';
            row.innerHTML = `
              <div class="gjs-field gjs-field-color">
                <input type="color" value="${color}" />
              </div>
              <div class="gjs-field" style="width:88px;">
                <input type="number" min="0" max="100" class="gjs-grad-pos" value="${positions && typeof positions[idx] === 'number' ? positions[idx] : ''}" placeholder="%" />
              </div>
              <button class="gjs-grad-up gjs-btn">↑</button>
              <button class="gjs-grad-down gjs-btn">↓</button>
              <button class="gjs-grad-del gjs-btn">✕</button>
            `;
            list.appendChild(row);
          });
        };

        // Obtiene pares color/posición desde la UI
        const getStopsFromUI = (root: HTMLElement) => {
          const rows = Array.from(root.querySelectorAll('.gjs-grad-row')) as HTMLElement[];
          return rows.map(r => {
            const color = (r.querySelector('input[type="color"]') as HTMLInputElement)?.value || '#ffffff';
            const posRaw = (r.querySelector('.gjs-grad-pos') as HTMLInputElement)?.value;
            let pos = posRaw ? Number(posRaw) : NaN;
            if (!isFinite(pos)) pos = NaN;
            if (!isNaN(pos)) pos = Math.max(0, Math.min(100, Math.round(pos)));
            return { color: isValidColor(color) ? color : '#ffffff', pos: isNaN(pos) ? undefined : pos };
          });
        };

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
            } catch {}

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
                  } catch {}
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

        // Añadir propiedad 'background-gradient' tipo 'gradient' en sector 'Fondos y Gradientes' y 'text-gradient' en Texto
        try {
          const sectors = sm.getSectors();
          let fondosId: string | undefined;
          let fondosSector: any;
          let textoId: string | undefined;
          let textoSector: any;
          let colorFondoId: string | undefined;
          sectors.forEach((s: any) => {
            const name = s.get('name');
            const id = s.get('id') || name;
            if (name === 'Fondos y Gradientes') { fondosId = id; fondosSector = s; }
            if (name === 'Texto') { textoId = id; textoSector = s; }
            if (name === 'Color y Fondo') { colorFondoId = id; }
          });
          if (fondosId) {
            sm.addProperty(fondosId, { id: 'background-gradient', type: 'gradient', property: 'background', label: 'Gradiente de fondo', defaults: '' });
            try { fondosSector?.set('open', true); } catch {}
            console.log('🎛️ Propiedad gradient añadida en sector Fondos y Gradientes');
          } else {
            console.warn('No se encontró sector "Fondos y Gradientes"');
          }
          if (textoId) {
            sm.addProperty(textoId, { id: 'text-gradient', type: 'gradient', property: 'color', label: 'Gradiente de texto', defaults: '' });
            try { textoSector?.set('open', true); } catch {}
            console.log('🎛️ Propiedad gradient añadida en sector Texto');
          } else {
            console.warn('No se encontró sector "Texto"');
          }
          // Remover el 'background' básico del sector 'Color y Fondo' para evitar colisiones visuales
          try {
            if (colorFondoId) {
              sm.removeProperty(colorFondoId, 'background');
              console.log('🧹 Propiedad básica background removida del sector Color y Fondo');
            }
          } catch (e) {
            console.warn('No se pudo remover background básico:', e);
          }
        } catch (e) {
          console.warn('addProperty gradient error', e);
        }
      } catch (e) {
        console.warn('Registro de tipo gradient falló:', e);
      }

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
          } catch {}
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

      // Esperar al evento 'load' antes de cargar contenido
      gEditor.on('load', () => {
        console.log('✅ GrapesJS: evento load disparado');
        setEditorReady(true);

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
        gEditor.on('component:selected', (component: any) => {
          try {
            console.log('Componente seleccionado:', component.getName && component.getName());
            console.log('Estilos:', component.getStyle && component.getStyle());
          } catch (e) {
            console.warn('No se pudo loguear selección de componente:', e);
          }
        });

        // Renderizado de managers bajo demanda via toggles

        // Bloques personalizados
        const bm = gEditor.BlockManager;
        // PASO 1: Bloques básicos
        bm.add('text-simple', {
          label: 'Texto',
          category: 'Básico',
          content: '<p>Texto editable</p>'
        });

        bm.add('button-link', {
          label: 'Botón',
          category: 'Básico',
          content: '<a href="#" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; border-radius: 8px; text-decoration: none;">Botón</a>'
        });

        bm.add('image-block', {
          label: 'Imagen',
          category: 'Básico',
          content: '<img src="https://via.placeholder.com/400x300" style="max-width: 100%;">'
        });
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
          label: '3 Características',
          category: 'Secciones',
          content: '<section class="py-12"><div class="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"><div class="p-6 border rounded"><h3 class="font-semibold mb-2">Característica 1</h3><p class="text-gray-600">Descripción breve.</p></div><div class="p-6 border rounded"><h3 class="font-semibold mb-2">Característica 2</h3><p class="text-gray-600">Descripción breve.</p></div><div class="p-6 border rounded"><h3 class="font-semibold mb-2">Característica 3</h3><p class="text-gray-600">Descripción breve.</p></div></div></section>'
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

        // Bloques adicionales solicitados
        // Categoría: Texto
        bm.add('heading-1', {
          label: 'Título H1',
          category: 'Texto',
          content: '<h1 style="font-size: 48px; font-weight: bold;">Título Principal</h1>'
        });

        bm.add('heading-2', {
          label: 'Título H2',
          category: 'Texto',
          content: '<h2 style="font-size: 36px; font-weight: bold;">Subtítulo</h2>'
        });

        bm.add('quote', {
          label: 'Cita',
          category: 'Texto',
          content: '<blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; font-style: italic;">"Texto de cita"</blockquote>'
        });

        // Categoría: Layout
        bm.add('container', {
          label: 'Contenedor',
          category: 'Layout',
          content: '<div style="max-width: 1200px; margin: 0 auto; padding: 20px;"></div>'
        });

        bm.add('section', {
          label: 'Sección',
          category: 'Layout',
          content: '<section style="padding: 60px 20px;"></section>'
        });

        bm.add('grid-2', {
          label: 'Grid 2 Columnas',
          category: 'Layout',
          content: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"><div style="background: #f3f4f6; padding: 20px;">Columna 1</div><div style="background: #f3f4f6; padding: 20px;">Columna 2</div></div>'
        });

        bm.add('grid-3', {
          label: 'Grid 3 Columnas',
          category: 'Layout',
          content: '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;"><div style="background: #f3f4f6; padding: 20px;">Columna 1</div><div style="background: #f3f4f6; padding: 20px;">Columna 2</div><div style="background: #f3f4f6; padding: 20px;">Columna 3</div></div>'
        });

        // Categoría: Componentes
        bm.add('card', {
          label: 'Tarjeta',
          category: 'Componentes',
          content: '<div style="background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 24px; max-width: 400px;"><h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">Título</h3><p style="color: #6b7280;">Descripción de la tarjeta</p></div>'
        });

        bm.add('button-primary', {
          label: 'Botón Primario',
          category: 'Componentes',
          content: '<a href="#" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">Botón</a>'
        });

        bm.add('button-secondary', {
          label: 'Botón Secundario',
          category: 'Componentes',
          content: '<a href="#" style="display: inline-block; padding: 12px 24px; background: transparent; color: #3b82f6; border: 2px solid #3b82f6; border-radius: 8px; text-decoration: none; font-weight: 600;">Botón</a>'
        });

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
        const checkWidthAndReady = () => {
          try {
            const frame = gEditor.Canvas.getFrameEl();
            const width = frame?.offsetWidth || 0;
            const bodyWidth = (frame as any)?.contentDocument?.body?.offsetWidth || 0;
            const finalWidth = Math.max(width, bodyWidth);
            if (finalWidth > 0) {
              console.log('📏 Ancho del iframe del canvas:', finalWidth);
              try { perfStartRef.current = performance.now(); console.log('⏱️ t0 Canvas listo'); } catch {}
              setCanvasReady(true);
              // Inyectar estilos globales cuando el canvas está listo
              try { injectTailwindIntoCanvas(); } catch {}
              try { injectPageStyles(); } catch {}
              return true;
            }
          } catch {}
          return false;
        };
        if (!checkWidthAndReady()) {
          console.warn('⏳ Canvas sin ancho medible aún; iniciando reintentos cada 100ms');
          if (readyIntervalRef.current) {
            try { clearInterval(readyIntervalRef.current); } catch {}
            readyIntervalRef.current = null;
          }
          const startTs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
          readyIntervalRef.current = setInterval(() => {
            if (checkWidthAndReady()) {
              if (readyIntervalRef.current) {
                try { clearInterval(readyIntervalRef.current); } catch {}
                readyIntervalRef.current = null;
              }
              // Asegurar inyección tras medir correctamente
              try { injectTailwindIntoCanvas(); } catch {}
              try { injectPageStyles(); } catch {}
              return;
            }
            const nowTs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            if (nowTs - startTs > 60000) {
              console.warn('⏰ Timeout esperando canvas medible (>60s). Deteniendo reintentos.');
              if (readyIntervalRef.current) {
                try { clearInterval(readyIntervalRef.current); } catch {}
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

  // Inicializar editor: depende SOLO de slug y no reinicia si ya existe
  useEffect(() => {
    console.log('🔄 useEffect [init editor][slug]');
    if (!slug) return;
    if (editorInstanceRef.current) {
      if (lastInitSlugRef.current === slug) {
        console.log('⏭️ Editor ya inicializado para este slug; no se reinicia');
      } else {
        console.log('ℹ️ Slug cambió pero el editor persiste; se actualizará contenido sin reiniciar');
      }
      return;
    }
    const timer = setTimeout(() => {
      initializeEditor();
    }, 100); // Pequeño delay para asegurar que el DOM esté listo
    return () => {
      clearTimeout(timer);
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
  }, [slug]);

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
          try { editorInstanceRef.current.destroy(); } catch {}
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
          } catch(e) { console.warn("No se pudo seleccionar componente inicial", e); }
          setTimeout(() => {
            try {
              // Inyección de estilos en post-load
              try { injectTailwindIntoCanvas(); } catch {}
              try { injectPageStyles(); } catch {}
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
        editorInstanceRef.current.setStyle(pageData.css);
        latestCssRef.current = pageData.css;
        latestHtmlRef.current = bodyContent;
        
        // Cierre del ciclo de carga
        setContentLoaded(true);
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
        if (typeof styles === 'string') latestCssRef.current = styles;
        try {
          // Obtener HTML renderizado actual para análisis de scripts, si procede
          const htmlNow = editorInstanceRef.current.getHtml();
          latestHtmlRef.current = htmlNow || latestHtmlRef.current;
        } catch {}
        // Cierre del ciclo de carga
        setContentLoaded(true);
        console.log('✅ gjsComponents/gjsStyles cargados exitosamente');
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
    } catch {}

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
      } catch {}
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
    
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Vista Previa - ${pageData?.title}</title>
            <style>${css}</style>
            <!-- Tailwind desactivado temporalmente -->
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
      
      const result = await HttpClient.post<ApiResponse<any>>(`/pages/${slug}/publish`, {});
      console.log('Respuesta de publicación:', result);
      
      if (result && result.success === true) {
        alert('✅ Página publicada exitosamente. Redirigiendo en 2s...');
        setTimeout(() => {
          window.location.href = `/${slug}`;
        }, 2000);
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
        .gjs-one-bg { background-color: #0f172a !important; }
        .gjs-two-bg { background-color: #1f2937 !important; }
        .gjs-three-bg { background-color: #111827 !important; }
        .gjs-four-bg { background-color: #0b1220 !important; }
        .gjs-two-color { color: #e5e7eb !important; }
        .gjs-link, .gjs-color-warn { color: #8b5cf6 !important; }
        .gjs-primary-color { color: #8b5cf6 !important; }
        .gjs-primary-bg { background-color: #8b5cf6 !important; }
        .gjs-blocks, .gjs-layers, .gjs-sm-sectors { background: #111827 !important; border-radius: 8px; }
        .gjs-block { border-radius: 6px; }
        .gjs-sm-sector, .gjs-sm-property { background: transparent !important; }
        .gjs-sm-label, .gjs-layer-title { color: #e5e7eb !important; }
        .gjs-btn-prim { background: #8b5cf6 !important; color: #fff !important; border-radius: 6px; }
        .gjs-field { background: #0f172a !important; border-color: #1f2937 !important; color: #e5e7eb !important; }
        /* Asegurar visibilidad del canvas e iframe */
        .gjs-cv-canvas { min-height: 600px !important; height: 100% !important; }
        .gjs-frame, iframe.gjs-frame { min-height: 600px !important; height: 100% !important; display: block !important; }
        #gjs { min-height: 600px !important; height: calc(100vh - 56px) !important; }
      `}</style>
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

      {/* Editor Container sin panel izquierdo */}
      <div className="flex-1 flex">
        {/* Lienzo del editor con gating visual hasta que canvas esté listo */}
        <div className="flex-1 flex flex-col relative">
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
            style={{ minHeight: '600px', height: '100vh', overflow: 'visible', transition: 'all 0.2s ease-in-out', visibility: canvasReady ? 'visible' : 'hidden' }}
            className="w-full"
          />
        </div>

        {/* Panel derecho personalizado con toggle */}
        <div onMouseDown={onRightHandleMouseDown} className={`w-1 ${rightCollapsed ? 'hidden' : 'block'} bg-gray-800 cursor-col-resize`} />
        <div className={`relative bg-gray-900 border-l border-gray-800 flex flex-col transition-all duration-300 ease-in-out shadow-lg rounded-tl-lg rounded-bl-lg`}
             style={{ width: rightCollapsed ? '3rem' : `${rightWidth}px`, minWidth: rightCollapsed ? '3rem' : '14rem' }}>
          <button
            className={`absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-violet-600 text-white shadow-md hover:bg-violet-500 transition-colors`}
            onClick={() => setRightCollapsed(v => !v)}
            title={rightCollapsed ? 'Expandir panel derecho' : 'Colapsar panel derecho'}
          >
            {rightCollapsed ? '<' : '>'}
          </button>
          <div className={`flex border-b border-gray-800 ${rightCollapsed ? 'hidden' : 'flex'}`}>
            <button className="flex-1 py-3 text-gray-200 bg-gray-800 hover:bg-gray-700 transition-colors" onClick={() => setShowBlocks(!showBlocks)}>Bloques</button>
            <button className="flex-1 py-3 text-gray-200 bg-gray-800 hover:bg-gray-700 transition-colors" onClick={() => setShowStyles(!showStyles)}>Estilos</button>
            <button className="flex-1 py-3 text-gray-200 bg-gray-800 hover:bg-gray-700 transition-colors" onClick={() => setShowLayers(!showLayers)}>Capas</button>
            <button className="flex-1 py-3 text-gray-200 bg-gray-800 hover:bg-gray-700 transition-colors" onClick={() => setShowClasses(!showClasses)}>Clases</button>
          </div>

          <div className={`flex-1 overflow-y-auto p-2 space-y-2 ${rightCollapsed ? 'hidden' : 'block'}`}>
            {showBlocks && <div id="blocks-panel" style={{ minHeight: '120px', background: '#111827', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>}
            {showStyles && (
              <div>
                <div id="styles-panel" style={{ minHeight: '160px', background: '#1f2937', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                <div className="mt-2 p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-300 mb-2">Preajustes de Tailwind</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => applyTailwindPreset('bg-primary')} className="px-2 py-1 text-xs rounded bg-violet-600 text-white hover:bg-violet-500">Fondo primario</button>
                    <button onClick={() => applyTailwindPreset('text-secondary')} className="px-2 py-1 text-xs rounded bg-gray-700 text-white hover:bg-gray-600">Texto secundario</button>
                    <button onClick={() => applyTailwindPreset('btn-primary')} className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-500">Botón primario</button>
                    <button onClick={() => applyTailwindPreset('card')} className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Tarjeta</button>
                  </div>
                </div>
                {/* Constructor de Gradientes */}
                <div className="mt-2 p-3 bg-gray-800 rounded">
                  <div className="text-xs text-gray-300 mb-2">Constructor de gradiente</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                    <label className="text-xs text-gray-300">Ángulo (°)</label>
                    <input
                      type="number"
                      min={0}
                      max={360}
                      value={gradientAngle}
                      onChange={(e) => setGradientAngle(Number(e.target.value) || 0)}
                      className="md:col-span-2 px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600"
                    />

                    <label className="text-xs text-gray-300">Número de colores</label>
                    <input
                      type="number"
                      min={2}
                      max={8}
                      value={gradientStopCount}
                      onChange={(e) => handleGradientStopCountChange(Number(e.target.value) || 2)}
                      className="md:col-span-2 px-2 py-1 text-xs rounded bg-gray-700 text-white border border-gray-600"
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Array.from({ length: gradientStopCount }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-gray-300">Color {idx + 1}</span>
                        <input
                          type="color"
                          value={gradientStops[idx] || '#ffffff'}
                          onChange={(e) => updateGradientStopColor(idx, e.target.value)}
                          className="w-10 h-6 p-0 border-0 bg-transparent"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <div
                      className="w-full h-12 rounded border border-gray-700"
                      style={{ backgroundImage: buildLinearGradient(gradientAngle, gradientStops.slice(0, gradientStopCount)) }}
                    />
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={applyGradientToSelection}
                      className="px-3 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-500"
                    >
                      Aplicar al seleccionado
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showLayers && <div id="layers-container" style={{ minHeight: '240px', background: '#1f2937', color: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>}
            {showClasses && <div id="classes-panel" style={{ minHeight: '160px', background: '#1f2937', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrapesEditor;
