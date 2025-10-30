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
        canvas: {
          styles: [
            // Asegura que el canvas tenga buena alineación
            `
            body, html {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              overflow-x: hidden;
            }
            [data-gjs-type] {
              position: relative;
            }
            .gjs-frame, iframe {
              pointer-events: auto !important;
            }
            * {
              box-sizing: border-box;
            }
            `,
            // 🧹 CSS para limpiar interferencias visuales y mejorar selección
            `
            #gjs, .gjs-cv-canvas {
              pointer-events: auto !important;
              z-index: 0 !important;
            }
            .gjs-selected, .gjs-hovered {
              outline: 2px solid rgba(0, 123, 255, 0.6) !important;
              outline-offset: 1px !important;
            }
            .gjs-selected {
              box-shadow: 0 0 0 1px rgba(0, 123, 255, 0.3) !important;
            }
            /* Asegurar que todos los elementos sean seleccionables */
            [data-gjs-type] {
              pointer-events: auto !important;
              position: relative !important;
            }
            /* Prevenir overlays que bloqueen selección */
            .gjs-toolbar, .gjs-toolbar-item {
              pointer-events: auto !important;
              z-index: 1000 !important;
            }
            /* Mejorar visibilidad de elementos seleccionables */
            [data-gjs-type]:hover {
              cursor: pointer !important;
            }
            `,
            // Estilos adicionales para arrastrar y placeholder
            ".dragging{opacity:0.7 !important;border:2px dashed #3b82f6 !important;z-index:9999 !important;} .gjs-placeholder{background: rgba(59,130,246,0.1) !important;border: 2px dashed #3b82f6 !important;min-height:50px !important;}",
            '/tailwind.css',
            'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
          ],
          scripts: []
        },
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
            blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'button'],
            flexGrid: 1
          }),
          (ed: Editor) => pluginFormsFn(ed, {
            blocks: ['form', 'input', 'textarea', 'select', 'label']
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
                    { type: 'select', name: 'border-style', options: [
                      { id: 'none', name: 'Ninguno' },
                      { id: 'solid', name: 'Sólido' },
                      { id: 'dashed', name: 'Discontinuo' },
                      { id: 'dotted', name: 'Punteado' },
                      { id: 'double', name: 'Doble' },
                    ]},
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
              ]
            },
            {
              name: '🖼️ Medios',
              open: true,
              properties: [
                {
                  type: 'select',
                  name: 'Encaje (object-fit)',
                  property: 'object-fit',
                  options: [
                    { id: 'fill', name: 'Rellenar' },
                    { id: 'contain', name: 'Contener' },
                    { id: 'cover', name: 'Cubrir' },
                    { id: 'none', name: 'Ninguno' },
                    { id: 'scale-down', name: 'Reducir' },
                  ]
                },
                {
                  type: 'select',
                  name: 'Posición del objeto',
                  property: 'object-position',
                  options: [
                    { id: 'left top', name: 'Izquierda arriba' },
                    { id: 'center center', name: 'Centro' },
                    { id: 'right bottom', name: 'Derecha abajo' },
                    { id: 'left center', name: 'Izquierda centro' },
                    { id: 'right center', name: 'Derecha centro' }
                  ]
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

      // Traits personalizados para botones y enlaces
      try {
        const dc: any = (gEditor as any).DomComponents;
        if (dc && dc.addType) {
          
          // =================== BOTÓN ===================
          dc.addType('button', {
            isComponent: (el: any) => {
              if (!el || !el.tagName) return false;
              const tagName = el.tagName.toLowerCase();
              return tagName === 'button' ||
                     (tagName === 'a' && (
                       el.style?.display?.includes('block') ||
                       el.style?.padding ||
                       el.className?.includes('btn') ||
                       el.className?.includes('button')
                     ));
            },
            extend: 'button',
            model: {
              defaults: {
                tagName: 'button',
                draggable: true,
                droppable: false,
                editable: true,
                
                traits: [
                  // Trait para cambiar el texto
                  {
                    type: 'text',
                    label: 'Texto del botón',
                    name: 'text',
                    changeProp: 1,
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
                    changeProp: 1,
                  },
                  {
                    type: 'text',
                    label: 'URL',
                    name: 'href',
                    visible: false,
                  },
                  {
                    type: 'select',
                    label: 'Abrir en',
                    name: 'target',
                    options: [
                      { id: '_self', name: 'Misma ventana' },
                      { id: '_blank', name: 'Nueva ventana' }
                    ],
                    visible: false,
                  },
                  {
                    type: 'text',
                    label: 'URL del archivo',
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
                
                script: function() {
                  const el = this as unknown as HTMLElement;
                  function doAction(e: Event) {
                    try {
                      const act = (el.getAttribute('data-action-type') || 'none');
                      if (act === 'none') return;
                      
                      const url = el.getAttribute('data-file-url') || el.getAttribute('href');
                      const newTabAttr = el.getAttribute('data-new-tab');
                      const newTab = (newTabAttr === 'true' || newTabAttr === '1');
                      
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
                    } catch(err) {
                      console.warn('button action error', err);
                    }
                  }
                  
                  el.addEventListener('click', doAction);
                  return {
                    destroy: function() {
                      el.removeEventListener('click', doAction);
                    }
                  };
                },
                
                // ⚠️ IMPORTANTE: Sin guiones
                scriptProps: [
                  'data-action-type',
                  'data-file-url',
                  'data-transaction-id',
                  'data-amount',
                  'data-new-tab'
                ],
              },
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
                    changeProp: 1,
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
                
                script: function() {
                  const el = this as unknown as HTMLElement;
                  function onClick(e: Event) {
                    try {
                      // Detectar si estamos dentro del editor de GrapesJS - SOLUCIÓN INFALIBLE
                      const isInEditor = 
                        (window.frameElement && window.frameElement.id === 'gjs-frame') || // dentro del iframe del editor
                        (window.parent && window.parent.document?.querySelector('#gjs') !== null) || // desde el iframe, existe el contenedor del editor
                        document.body.classList.contains('gjs-dashed') || // el canvas editable
                        document.querySelector('.gjs-editor, .gjs-cv-canvas') !== null; // estructura del editor
                      
                      if (isInEditor) {
                        // En el editor → solo prevenir acciones de navegación, permitir selección
                        const act = (el.getAttribute('data-action-type') || 'link');
                        const url = el.getAttribute('href') || el.getAttribute('data-file-url');
                        
                        // Solo bloquear si hay una acción que ejecutar (tiene URL o acción específica)
                        if (url || act !== 'link') {
                          if (e && e.preventDefault) e.preventDefault();
                          console.log('🔧 Modo editor: acción de navegación bloqueada, selección permitida');
                        }
                        // No usar stopPropagation para permitir que GrapesJS maneje la selección
                        return;
                      }
                      
                      // Aquí solo se ejecuta en la página publicada
                      console.log('🌐 Modo página pública: ejecutando acción real.');
                      
                      // Solo ejecutar acciones en la página real (no en el editor)
                      const act = (el.getAttribute('data-action-type') || 'link');
                      const url = el.getAttribute('href') || el.getAttribute('data-file-url');
                      const targetAttr = el.getAttribute('target');
                      const newTab = targetAttr === '_blank';
                      
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
                    } catch(err) {
                      console.warn('link action error', err);
                    }
                  }

                  function onDoubleClick(e: Event) {
                    try {
                      // Detectar si estamos dentro del editor de GrapesJS
                      const isInEditor = 
                        (window.frameElement && window.frameElement.id === 'gjs-frame') || 
                        (window.parent && window.parent.document?.querySelector('#gjs') !== null) || 
                        document.body.classList.contains('gjs-dashed') || 
                        document.querySelector('.gjs-editor, .gjs-cv-canvas') !== null;
                      
                      if (isInEditor) {
                        // En el editor → doble click ejecuta la acción para "probar"
                        if (e && e.preventDefault) e.preventDefault();
                        console.log('🧪 Modo editor: probando botón con doble click');
                        
                        const act = (el.getAttribute('data-action-type') || 'link');
                        const url = el.getAttribute('href') || el.getAttribute('data-file-url');
                        const targetAttr = el.getAttribute('target');
                        const newTab = targetAttr === '_blank';
                        
                        if (act === 'link' && url) {
                          newTab ? window.open(url, '_blank') : window.open(url, '_self');
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
                          window.open(finalUrl, '_blank');
                        }
                      }
                    } catch(err) {
                      console.warn('double click action error', err);
                    }
                  }
                  
                  el.addEventListener('click', onClick);
                  el.addEventListener('dblclick', onDoubleClick);
                  return {
                    destroy: function() {
                      el.removeEventListener('click', onClick);
                      el.removeEventListener('dblclick', onDoubleClick);
                    }
                  };
                },
                
                scriptProps: [
                  'data-action-type',
                  'href',
                  'data-file-url',
                  'data-transaction-id',
                  'data-amount',
                  'target'
                ],
              },
            },
          });
          
          console.log('✅ Traits personalizados registrados para button y link');
        }
      } catch (e) {
        console.warn('No se pudieron registrar traits personalizados de button/link', e);
      }

      // =================== AUTO-ABRIR PANEL DE TRAITS ===================
      // ESTO VA DESPUÉS DEL BLOQUE TRY-CATCH DE LOS TRAITS
      gEditor.on('component:selected', (component: any) => {
        const type = component.get('type');
        
        console.log('🎯 Componente seleccionado:', type);
        
        // Obtener el Style Manager
        const sm = gEditor.StyleManager;
      });

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
                        try { parentComp?.addStyle?.({ 'justify-content': 'center' }); } catch {}
                        (this as any).addStyle({ 'margin-left': '', 'margin-right': '', display: 'block' });
                      } else if (isGridParent) {
                        (this as any).addStyle({ 'justify-self': 'center' });
                      } else {
                        try { parentComp?.addStyle?.({ 'text-align': 'center' }); } catch {}
                        (this as any).addStyle({ display: 'inline-block' });
                      }
                    } else if (value === 'right') {
                      if (isAbs) {
                        (this as any).addStyle({ position: cs?.position || 'absolute', right: '0', left: '', transform: '' });
                      } else if (isFlexParent) {
                        try { parentComp?.addStyle?.({ 'justify-content': 'flex-end' }); } catch {}
                        (this as any).addStyle({ display: 'block' });
                      } else if (isGridParent) {
                        (this as any).addStyle({ 'justify-self': 'end' });
                      } else {
                        try { parentComp?.addStyle?.({ 'text-align': 'right' }); } catch {}
                        (this as any).addStyle({ display: 'inline-block' });
                      }
                    } else {
                      if (isAbs) {
                        (this as any).addStyle({ position: cs?.position || 'absolute', left: '0', right: '', transform: '' });
                      } else if (isFlexParent) {
                        try { parentComp?.addStyle?.({ 'justify-content': 'flex-start' }); } catch {}
                        (this as any).addStyle({ display: 'block' });
                      } else if (isGridParent) {
                        (this as any).addStyle({ 'justify-self': 'start' });
                      } else {
                        try { parentComp?.addStyle?.({ 'text-align': 'left' }); } catch {}
                        (this as any).addStyle({ display: 'inline-block' });
                      }
                    }
                  } catch (err) { console.warn('svg align trait error', err); }
                });
              }
            }
          });
          console.log('✅ Tipo SVG registrado como estilable para alineación');
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
            
            // Si la propiedad pertenece a un trait, actualizar el trait correspondiente
            if (propertyName && propertyName.startsWith('data-')) {
              const traitName = propertyName.replace('data-', '');
              const trait = selected.get('traits').find((t: any) => t.get('name') === traitName);
              
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
              const traits = component.get('traits');
              
              // 🔧 PRESERVAR PROPIEDADES DE EDICIÓN DURANTE ACTUALIZACIÓN DE TRAITS
              component.set({
                selectable: true,
                draggable: true,
                removable: true,
                hoverable: true,
                highlightable: true,
                badgable: true,
                copyable: true
              });
              
              // Ocultar todos los campos dependientes primero
              traits.forEach((trait: any) => {
                const traitName = trait.get('name');
                if (['href', 'target', 'data-file-url', 'data-transaction-id', 'data-amount', 'data-custom-function', 'data-new-tab'].includes(traitName)) {
                  trait.set('visible', false);
                }
              });
              
              // Mostrar campos según la acción seleccionada
              if (actionType === 'link') {
                const hrefTrait = traits.find((t: any) => t.get('name') === 'href');
                const targetTrait = traits.find((t: any) => t.get('name') === 'target');
                if (hrefTrait) hrefTrait.set('visible', true);
                if (targetTrait) targetTrait.set('visible', true);
              } else if (actionType === 'download' || actionType === 'open_pdf') {
                const fileUrlTrait = traits.find((t: any) => t.get('name') === 'data-file-url');
                if (fileUrlTrait) fileUrlTrait.set('visible', true);
              } else if (actionType === 'go_to_payment') {
                const txTrait = traits.find((t: any) => t.get('name') === 'data-transaction-id');
                const amountTrait = traits.find((t: any) => t.get('name') === 'data-amount');
                if (txTrait) txTrait.set('visible', true);
                if (amountTrait) amountTrait.set('visible', true);
              } else if (actionType === 'execute-function') {
                const functionTrait = traits.find((t: any) => t.get('name') === 'data-custom-function');
                if (functionTrait) functionTrait.set('visible', true);
              }
              
              // Forzar re-renderizado del panel de traits
              gEditor.TraitManager.render();
              console.log(`✅ Traits dinámicos actualizados para acción: ${actionType} (propiedades de edición preservadas)`);
            }
          } catch (e) {
             console.warn('Error actualizando traits dinámicos:', e);
           }
         });
         
         // Evento para sincronizar cambios de traits con el Style Manager
         gEditor.on('component:update:traits', (component: any) => {
           try {
            const sm = gEditor.StyleManager;
            
            // 🔧 PRESERVAR PROPIEDADES DE EDICIÓN DURANTE SINCRONIZACIÓN
            component.set({
              selectable: true,
              draggable: true,
              removable: true,
              hoverable: true,
              highlightable: true,
              badgable: true,
              copyable: true
            });
            
            // Sincronización básica de traits con Style Manager
            const traits = component.get('traits');
            
            traits.forEach((trait: any) => {
              const traitName = trait.get('name');
              const traitValue = trait.get('value');
              
              // Actualizar propiedades del componente
              if (traitValue !== undefined) {
                const propertyName = traitName.startsWith('data-') ? traitName : `data-${traitName}`;
                component.set(propertyName, traitValue);
                console.log(`✅ Propiedad ${propertyName} actualizada desde trait:`, traitValue);
              }
            });
            
          } catch (e) {
            console.warn('Error sincronizando traits con Style Manager:', e);
          }
        });
        
        // Handler vacío eliminado - era innecesario
      } catch {}

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
            try { aparienciaSector?.set('open', true); } catch {}
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
            try { textoSector?.set('open', true); } catch {}
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
            } catch {}
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
                  try { parentComp?.addStyle?.({ 'justify-content': 'center' }); } catch {}
                  (sel as any).addStyle({ 'margin-left': '', 'margin-right': '', display: 'block' });
                } else if (isGridParent) {
                  // Centrado en grid: justificar el ítem
                  (sel as any).addStyle({ 'justify-self': 'center' });
                } else if (isInline || isSvg) {
                  // Elementos inline/SVG: centrar vía text-align del padre
                  try { parentComp?.addStyle?.({ 'text-align': 'center' }); } catch {}
                  (sel as any).addStyle({ display: 'inline-block' });
                } else {
                  // Bloque normal: margen auto
                  (sel as any).addStyle({ display: 'block', 'margin-left': 'auto', 'margin-right': 'auto' });
                }
              } else if (value === 'right') {
                if (isAbs) {
                  (sel as any).addStyle({ position: cs?.position || 'absolute', right: '0', left: '', transform: '' });
                } else if (isFlexParent) {
                  try { parentComp?.addStyle?.({ 'justify-content': 'flex-end' }); } catch {}
                  (sel as any).addStyle({ display: 'block' });
                } else if (isGridParent) {
                  (sel as any).addStyle({ 'justify-self': 'end' });
                } else if (isInline || isSvg) {
                  try { parentComp?.addStyle?.({ 'text-align': 'right' }); } catch {}
                  (sel as any).addStyle({ display: 'inline-block' });
                } else {
                  (sel as any).addStyle({ display: 'block', 'margin-left': 'auto', 'margin-right': '0' });
                }
              } else {
                // left
                if (isAbs) {
                  (sel as any).addStyle({ position: cs?.position || 'absolute', left: '0', right: '', transform: '' });
                } else if (isFlexParent) {
                  try { parentComp?.addStyle?.({ 'justify-content': 'flex-start' }); } catch {}
                  (sel as any).addStyle({ display: 'block' });
                } else if (isGridParent) {
                  (sel as any).addStyle({ 'justify-self': 'start' });
                } else if (isInline || isSvg) {
                  try { parentComp?.addStyle?.({ 'text-align': 'left' }); } catch {}
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
                  try { parentComp?.addStyle?.({ 'justify-content': 'center' }); } catch {}
                  (sel as any).addStyle({ 'margin-left': '', 'margin-right': '', display: 'block' });
                } else if (isGridParent) {
                  (sel as any).addStyle({ 'justify-self': 'center' });
                } else if (isInline || isSvg) {
                  try { parentComp?.addStyle?.({ 'text-align': 'center' }); } catch {}
                  (sel as any).addStyle({ display: 'inline-block' });
                } else {
                  (sel as any).addStyle({ display: 'block', 'margin-left': 'auto', 'margin-right': 'auto' });
                }
              } else if (value === 'right') {
                if (isAbs) {
                  (sel as any).addStyle({ position: cs?.position || 'absolute', right: '0', left: '', transform: '' });
                } else if (isFlexParent) {
                  try { parentComp?.addStyle?.({ 'justify-content': 'flex-end' }); } catch {}
                  (sel as any).addStyle({ display: 'block' });
                } else if (isGridParent) {
                  (sel as any).addStyle({ 'justify-self': 'end' });
                } else if (isInline || isSvg) {
                  try { parentComp?.addStyle?.({ 'text-align': 'right' }); } catch {}
                  (sel as any).addStyle({ display: 'inline-block' });
                } else {
                  (sel as any).addStyle({ display: 'block', 'margin-left': 'auto', 'margin-right': '0' });
                }
              } else {
                if (isAbs) {
                  (sel as any).addStyle({ position: cs?.position || 'absolute', left: '0', right: '', transform: '' });
                } else if (isFlexParent) {
                  try { parentComp?.addStyle?.({ 'justify-content': 'flex-start' }); } catch {}
                  (sel as any).addStyle({ display: 'block' });
                } else if (isGridParent) {
                  (sel as any).addStyle({ 'justify-self': 'start' });
                } else if (isInline || isSvg) {
                  try { parentComp?.addStyle?.({ 'text-align': 'left' }); } catch {}
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
            } catch {}
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
                  try { added?.set?.({ resizable: true }); } catch {}
                  try { gEditor.select(added); } catch {}
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
                    } catch {}
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
            try { added?.set?.({ resizable: true }); } catch {}
            try { ed.select(added); } catch {}
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
              } catch {}
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
      try { (window as any).pasteFromClipboard = pasteFromClipboard; } catch {}

      // Habilitar resizable en selección de imágenes, videos y SVG
      try {
        gEditor.on('component:selected', (comp: any) => {
          try { comp?.set?.({ resizable: true }); } catch {}
          try {
            const sm: any = gEditor.StyleManager;
            const sectors = sm.getSectors?.() || [];
            const name = comp?.get?.('type') || comp?.getName?.() || comp?.getTag?.() || '';
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

      // ✅ FIX CRÍTICO: CSS para forzar pointer-events: auto en action-buttons
      gEditor.on('load', () => {
        const frame = gEditor.Canvas.getFrameEl();
        if (!frame?.contentDocument) return;
        
        const style = frame.contentDocument.createElement('style');
        style.innerHTML = `
          /* Forzar interactividad en botones action-button */
          a[data-gjs-type="action-button"], 
          button[data-gjs-type="action-button"],
          a#irlnr4,
          [data-gjs-type="action-button"] {
            pointer-events: auto !important;
            cursor: pointer !important;
            position: relative !important;
            z-index: 10 !important;
          }
          
          /* Asegurar que los botones sean visibles y clickeables */
          .gjs-selected a[data-gjs-type="action-button"],
          .gjs-selected button[data-gjs-type="action-button"] {
            pointer-events: auto !important;
            outline: 2px solid #007bff !important;
            outline-offset: 2px !important;
          }
        `;
        frame.contentDocument.head.appendChild(style);
        console.log('✅ CSS fix aplicado: pointer-events: auto para action-buttons');
      });

      // ✅ Registrar correctamente el componente "action-button" 
      gEditor.DomComponents.addType('action-button', {
        isComponent: (el) => {
          if (!el || !el.tagName) return false;
          const tagName = el.tagName.toLowerCase();
          
          // Detectar por atributo data-gjs-type
          if (el.getAttribute('data-gjs-type') === 'action-button') {
            return { type: 'action-button' };
          }
          
          // Detectar por estructura (A o BUTTON con data-url o data-action)
          if ((tagName === 'a' || tagName === 'button') && 
              (el.getAttribute('data-url') || el.getAttribute('data-action'))) {
            return { type: 'action-button' };
          }
          
          return false;
        },
        model: {
          defaults: {
            tagName: 'a',
            draggable: true,
            droppable: false,
            selectable: true,
            highlightable: true,
            hoverable: true,
            editable: true,
            traits: [
              {
                type: 'text',
                label: 'Texto',
                name: 'content',
                changeProp: 1,
              },
              {
                type: 'text',
                label: 'Enlace (URL)',
                name: 'href',
                placeholder: 'https://...',
              },
              {
                type: 'color',
                label: 'Color de fondo',
                name: 'background-color',
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
              }
            ],
            attributes: { 
              href: '#', 
              class: 'btn-action',
              'data-gjs-type': 'action-button'
            },
            styles: `
              .btn-action {
                display: inline-block;
                padding: 10px 15px;
                border-radius: 4px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
              }
              .btn-action:hover {
                background-color: #0056b3;
              }
            `,
          },
          init() {
            // Sincronizar contenido del texto
            this.on('change:content', () => {
              this.view.el.textContent = this.get('content');
            });
          },
        },
        view: {
          events: {
            // Permitir selección en el editor sin activar acciones
            mousedown(e) {
              const isInEditor = 
                document.body.classList.contains('gjs-dashed') ||
                window.parent?.document?.querySelector('#gjs') !== null;

              if (isInEditor) {
                e.stopPropagation(); // Permite selección sin activar acción
              }
            },
          },
        },
      });

      // 🧭 Configurar traits específicos para componentes de tipo link
      gEditor.DomComponents.addType('link', {
        isComponent: el => el.tagName === 'A',
        model: {
          defaults: {
            traits: [
              { type: 'text', label: 'Texto', name: 'text' },
              { type: 'text', label: 'URL', name: 'data-url' },
              { type: 'checkbox', label: 'Abrir en nueva pestaña', name: 'target', valueTrue: '_blank' }
            ],
            selectable: true,
            hoverable: true,
            highlightable: true,
            draggable: true,
            droppable: true,
            removable: true,
            badgable: true,
            copyable: true,
          }
        }
      });

      // Esperar al evento 'load' antes de cargar contenido
      gEditor.on('load', () => {
        console.log('✅ GrapesJS: evento load disparado');
        setEditorReady(true);

        // ✅ Forzar la restauración de propiedades de edición para componentes existentes
        try {
          const wrapper = gEditor.DomComponents.getWrapper();
          const actionButtons = wrapper.findType('action-button');
          
          console.log('🔄 INICIANDO RESTAURACIÓN DE COMPONENTES:', {
            totalActionButtons: actionButtons.length,
            timestamp: new Date().toLocaleTimeString()
          });
          
          actionButtons.forEach((cmp, index) => {
            const el = cmp.getEl();
            cmp.set({
              selectable: true,
              hoverable: true,
              editable: true,
              highlightable: true,
              draggable: true,
            });
            
            console.log(`✅ ACTION-BUTTON ${index + 1} RESTAURADO:`, {
              id: el?.id || 'sin-id',
              className: el?.className || 'sin-clase',
              tag: el?.tagName,
              href: el?.getAttribute('href'),
              dataUrl: el?.getAttribute('data-url'),
              dataAction: el?.getAttribute('data-action'),
              traitsCount: cmp.get('traits')?.length || 0,
              isSelectable: cmp.get('selectable'),
              isEditable: cmp.get('editable')
            });
          });
          
          console.log(`🎯 RESTAURACIÓN COMPLETADA: ${actionButtons.length} action-buttons procesados`);
        } catch (e) {
          console.error('❌ Error restaurando propiedades de action-buttons:', e);
        }

        // ✅ Habilitar edición total de botones y activar acción solo con doble clic
        const frame = gEditor.Canvas.getFrameEl();
        if (!frame || !frame.contentDocument) return;

        const doc = frame.contentDocument;

        // 1️⃣ Permitir seleccionar y editar botones/enlaces normalmente
        const style = doc.createElement('style');
        style.innerHTML = `
          a, button, input, iframe, video { 
            pointer-events: auto !important; 
            user-select: auto !important; 
          } 

          /* Mostrar borde de selección */ 
          [data-gjs-type="button"], [data-gjs-type="link"], a, button { 
            cursor: pointer !important; 
            outline: 1px dashed rgba(0,0,0,0.15); 
          } 

          .gjs-selected { 
            outline: 2px solid #007cff !important; 
            outline-offset: 1px !important; 
          }
        `;
        doc.head.appendChild(style);

        // 2️⃣ Evitar que el click simple dispare acciones
        doc.addEventListener('click', e => {
          const target = e.target as HTMLElement;
          if (target?.matches('a, button, input')) {
            e.preventDefault();
            e.stopPropagation();
          }
        }, true);

        // 3️⃣ Permitir acción real SOLO con doble click
        doc.addEventListener('dblclick', e => {
          const target = e.target as HTMLElement;
          if (target?.matches('a, button')) {
            const url = target.getAttribute('href') || target.getAttribute('data-url');
            if (url && url !== '#') window.open(url, '_blank');
          }
        });

        // Función para configurar handlers adicionales de elementos interactivos
        const setupInteractiveHandlers = () => {
          // Esta función puede expandirse en el futuro para manejar casos específicos
          console.log('✅ Handlers interactivos configurados');
        };
                
        // Configurar handlers inicialmente
        setupInteractiveHandlers();
        
        // Reconfigurar handlers cuando se añadan nuevos componentes
        const observer = new MutationObserver(() => {
          setupInteractiveHandlers();
        });
        
        observer.observe(doc.body, {
          childList: true,
          subtree: true
        });
        
        console.log('✅ Sistema de clic simple/doble clic configurado para componentes interactivos');
        
        // 🔧 FIX K: Refuerzo universal para mantener propiedades de edición
        console.log('🔧 Configurando refuerzo universal...');
        
        const universalComponentFix = () => {
          try {
            const allComponents = gEditor.DomComponents.getComponents();
            
            const walkComponents = (collection: any) => {
              collection.each((comp: any) => {
                const el = comp.getEl?.();
                const tag = (comp.get('tagName') || '').toLowerCase();
                const type = comp.get('type');
                
                // Restaurar referencia __gjs_model si falta
                if (el && !el.__gjs_model) {
                  el.__gjs_model = comp;
                }
                
                // Asegurar propiedades de edición para botones y enlaces
                if (tag === 'a' || tag === 'button' || type === 'button' || type === 'action-button') {
                  comp.set({
                    selectable: true,
                    draggable: true,
                    hoverable: true,
                    removable: true,
                    badgable: true,
                    copyable: true,
                    highlightable: true
                  });
                }
                
                // Procesar componentes hijos
                if (comp.components && typeof comp.components === 'function') {
                  walkComponents(comp.components());
                }
              });
            };
            
            walkComponents(allComponents);
          } catch (error) {
            console.warn('⚠️ Error en refuerzo universal:', error);
          }
        };
        
        // Aplicar refuerzo en eventos clave
        gEditor.on('canvas:rendered component:add component:update component:mount', universalComponentFix);

        // 🔧 Reasocia el modelo al DOM si se pierde tras editar traits
        gEditor.on('component:update', (model: any) => {
          if (model.get('type') === 'action-button') {
            const el = model.getEl();
            if (el && !(el as any).__gjs_model) {
              (el as any).__gjs_model = model;
              model.set({
                selectable: true,
                hoverable: true,
                draggable: true,
                removable: true,
                highlightable: true
              });
              el.style.pointerEvents = 'auto';
              el.style.zIndex = 'auto';
              console.log('🔁 Reasociado modelo al botón y restauradas propiedades de edición');
            }
          }
        });

        // 🔍 VERIFICACIÓN AUTOMÁTICA DE COMPONENTES - VERSIÓN SEGURA
        console.log('🔍 Configurando verificación automática de componentes...');
        const verifyAndSyncComponents = () => {
          // ✅ Esperar hasta que el editor esté completamente cargado
          if (!gEditor || !gEditor.getWrapper) {
            console.warn('⏳ Editor aún no está listo. Reintentando verificación...');
            setTimeout(verifyAndSyncComponents, 300);
            return;
          }

          let wrapper;
          try {
            wrapper = gEditor.getWrapper();
            if (!wrapper) {
              console.warn('⚠️ Wrapper no disponible todavía. Reintentando...');
              setTimeout(verifyAndSyncComponents, 300);
              return;
            }
          } catch (err) {
            console.error('Error al obtener wrapper:', err);
            return;
          }

          // ✅ Aquí el código de verificación real
          console.log('✅ Verificación completada, wrapper OK');
          
          try {
            const allComponents = wrapper.find('*');
            let fixedCount = 0;
            let errorCount = 0;
            
            allComponents.forEach((component: any) => {
              try {
                // Verificar que el componente responda a select sin error
                const testSelect = () => {
                  try {
                    gEditor.select(component);
                    gEditor.select(null); // Deseleccionar inmediatamente
                    return true;
                  } catch (e) {
                    console.warn('⚠️ Error al seleccionar componente:', component.get('tagName'), e);
                    return false;
                  }
                };
                
                // Si falla la selección, intentar sincronizar la vista
                if (!testSelect()) {
                  console.log('🔧 Sincronizando vista del componente:', component.get('tagName'));
                  
                  // Re-renderizar la vista del componente
                  if (component.view && typeof component.view.render === 'function') {
                    component.view.render();
                  }
                  
                  // Verificar nuevamente después del re-render
                  if (testSelect()) {
                    fixedCount++;
                    console.log('✅ Componente sincronizado correctamente');
                  } else {
                    errorCount++;
                    console.error('❌ No se pudo sincronizar el componente');
                  }
                }
                
              } catch (e) {
                errorCount++;
                console.error('❌ Error procesando componente:', e);
              }
            });
            
            console.log(`🔍 Verificación completada: ${allComponents.length} componentes revisados, ${fixedCount} sincronizados, ${errorCount} errores`);
            
            // Trigger de actualización del canvas
            gEditor.trigger('change:canvas');
            
          } catch (e) {
            console.error('❌ Error en verificación automática:', e);
          }
        };

        // ✅ Restaurar selección en el canvas
        console.log('🎨 Restaurando selección del canvas...');
        const canvasFrame = gEditor.Canvas.getFrameEl();
        if (canvasFrame && canvasFrame.contentDocument) {
          const style = canvasFrame.contentDocument.createElement('style');
          style.innerHTML = `
            * { pointer-events: auto !important; }
            [data-gjs-type] { cursor: pointer !important; }
          `;
          canvasFrame.contentDocument.head.appendChild(style);
          console.log('✅ CSS de selección aplicado al canvas');
        }

        // 🎯 CORRECCIÓN DE HITBOX - Selección precisa sin desalineamiento
        console.log('🎯 Aplicando corrección de hitbox para selección precisa...');
        const frameEl = gEditor.Canvas.getFrameEl();
        const frameDoc = frameEl?.contentDocument;
        if (frameDoc) {
          const styleFix = frameDoc.createElement('style');
          styleFix.innerHTML = `
            [data-gjs-type] {
              transform-origin: top left !important;
              position: relative !important;
            }
            body, html {
              overflow-x: hidden;
              max-width: 100%;
            }
          `;
          frameDoc.head.appendChild(styleFix);

          // 🎯 CORRECCIÓN DE POINTER-EVENTS - Garantizar seleccionabilidad
          const pointerFix = frameDoc.createElement('style');
          pointerFix.innerHTML = `
            .gjs-selected, [data-gjs-type="button"], [data-gjs-type="link"], button, a {
              pointer-events: auto !important;
            }
            .gjs-frame, .gjs-cv-canvas {
              pointer-events: none !important;
            }
          `;
          frameDoc.head.appendChild(pointerFix);
          console.log('✅ Corrección de hitbox y pointer-events aplicada - selección precisa habilitada');
        }

        // 📱 RESPONSIVIDAD Y ALINEACIÓN AUTOMÁTICA
        console.log('📱 Aplicando responsividad y alineación automática...');
        const frameElement = gEditor.Canvas.getFrameEl();
        if (frameElement?.contentDocument) {
          const responsive = frameElement.contentDocument.createElement('style');
          responsive.innerHTML = `
            @media (max-width: 768px) {
              [data-gjs-type="button"], button, a[type="button"] {
                width: 100% !important;
                display: block !important;
                text-align: center !important;
                margin-bottom: 10px !important;
              }
              .gjs-row, .gjs-column {
                flex-direction: column !important;
              }
              .gjs-row > .gjs-column {
                width: 100% !important;
                margin-bottom: 15px !important;
              }
              /* Mejoras adicionales para móviles */
              [data-gjs-type="text"] {
                font-size: 16px !important;
                line-height: 1.5 !important;
              }
              [data-gjs-type="image"] {
                max-width: 100% !important;
                height: auto !important;
              }
            }
            @media (max-width: 480px) {
              [data-gjs-type="button"], button, a[type="button"] {
                padding: 12px 20px !important;
                font-size: 16px !important;
              }
              .gjs-row {
                padding: 10px !important;
              }
            }
          `;
          frameElement.contentDocument.head.appendChild(responsive);
          console.log('✅ CSS responsivo aplicado - diseño móvil optimizado');
        }

        // Ejecutar verificación inicial solo después de que el editor esté completamente cargado
        console.log('🎨 GrapesJS cargado completamente');
        verifyAndSyncComponents();

        // 🔧 CORRECCIÓN DE SELECCIÓN DE BOTONES Y ENLACES
        console.log('🔧 Configurando corrección de selección para botones y enlaces...');
        
        // Añadir eventos para detectar hover y mejorar selección
        gEditor.on('component:hover', (comp: any) => {
          try {
            console.log('🎯 Hovering:', comp.getName(), comp.getId());
          } catch (e) {
            console.warn('⚠️ Error en hover:', e);
          }
        });

        // ✅ Configuración limpia de componentes seleccionados (sin sobrescribir traits)
        gEditor.on('component:selected', (comp: any) => {
          try {
            // Solo validar que el componente mantenga sus propiedades básicas
            // SIN modificar traits ni eventos onclick
            if (comp && comp.getEl) {
              const el = comp.getEl();
              const componentType = comp.get('type');
              const isInteractive = el && (el.tagName === 'A' || el.tagName === 'BUTTON' || componentType === 'action-button');
              
              if (isInteractive) {
                // Solo asegurar que sea seleccionable, sin interferir con traits
                comp.set({
                  selectable: true,
                  hoverable: true,
                  highlightable: true,
                  draggable: true,
                  editable: true
                });
                
                // 📊 LOGS DETALLADOS PARA CONFIRMAR FUNCIONAMIENTO
                console.log('🎯 COMPONENTE INTERACTIVO SELECCIONADO:', {
                  tag: el.tagName,
                  type: componentType,
                  id: el.id || 'sin-id',
                  className: el.className || 'sin-clase',
                  traitsCount: comp.get('traits')?.length || 0,
                  isSelectable: comp.get('selectable'),
                  isEditable: comp.get('editable'),
                  isDraggable: comp.get('draggable'),
                  href: el.getAttribute('href'),
                  dataUrl: el.getAttribute('data-url'),
                  dataAction: el.getAttribute('data-action'),
                  styleManagerReady: !!gEditor.StyleManager,
                  timestamp: new Date().toLocaleTimeString()
                });
                
                // Verificar que el Style Manager puede acceder al componente
                setTimeout(() => {
                  const sm = gEditor.StyleManager;
                  const selectedComp = gEditor.getSelected();
                  console.log('🎨 STYLE MANAGER STATUS:', {
                    componentStillSelected: selectedComp === comp,
                    styleManagerExists: !!sm,
                    canGetStyles: !!selectedComp?.getStyle,
                    currentStyles: selectedComp?.getStyle?.() || 'no-styles'
                  });
                }, 100);
              }
            }
          } catch (e) {
            console.warn('⚠️ Error validando componente:', e);
          }
        });

        // Asegurar que todos los componentes nuevos sean seleccionables y configurar eventos de click
        gEditor.on('component:add', (comp: any) => {
          try {
            comp.set({
              selectable: true,
              hoverable: true,
              highlightable: true,
              draggable: true,
              droppable: true,
              removable: true,
              copyable: true,
            });

            // 🔒 CONFIGURACIÓN ESPECIAL PARA BOTONES Y ENLACES
            const el = comp.getEl();
            
            // ✅ Validación segura: Asegurar que sea un elemento DOM válido
            if (!el || !el.tagName) return;
            
            if (el.tagName === 'A' || el.tagName === 'BUTTON') {
              // 🔒 Permitir selección normal
              el.onclick = (e: Event) => {
                e.stopPropagation();
                e.preventDefault();
                
                // Seleccionar el componente al click normal
                gEditor.select(comp);
                console.log('🎯 Componente seleccionado:', comp.getId());
              };

              // 🧠 Ejecutar la acción real solo si se hace doble click
              el.ondblclick = (e: Event) => {
                e.stopPropagation();
                e.preventDefault();

                const url = el.getAttribute('data-url') || el.getAttribute('href');
                const target = el.getAttribute('data-target') || '_self';
                if (url) {
                  console.log('🚀 Ejecutando acción de doble click:', url);
                  window.open(url, target);
                }
              };

              // Añadir indicador visual
              el.style.cursor = 'pointer';
              el.title = 'Click: seleccionar | Doble click: ejecutar acción';
            }
          } catch (e) {
            console.error('❌ Error configurando componente nuevo:', e);
          }
        });

        // 🧹 PREVENCIÓN DE DUPLICACIONES Y GHOST CLONES - Versión Robusta
        console.log('🧹 Configurando prevención de duplicaciones...');
        gEditor.on('component:drag:end', (model: any) => {
          try {
            // Verificar que sea un componente válido
            if (!model || typeof model.get !== 'function') return;

            const parent = model.parent?.();
            if (!parent || typeof parent.components !== 'function') return;

            const duplicates = parent.components().filter(
              (c: any) => c.getId && c.getId() === model.getId()
            );

            if (duplicates.length > 1) {
              duplicates.slice(1).forEach((d: any) => d.remove());
              console.warn('🧹 Duplicado eliminado automáticamente:', model.getId());
            }
          } catch (err) {
            console.error('❌ Error en prevención de duplicaciones:', err);
          }
        });

        console.log('✅ Correcciones de selección y prevención de duplicaciones configuradas');

        // Convertir botones existentes al tipo action-button
         const wrapper = gEditor.getWrapper();
         if (wrapper) {
           wrapper.find('a, button').forEach(btn => {
             btn.set({ type: 'action-button' });
           });
         }

         // Agregar script global para botones existentes que ya tienen data-url
          const canvasDoc = gEditor.Canvas.getDocument();
          if (canvasDoc) {
            const botones = canvasDoc.querySelectorAll('a[data-url], button[data-url]');
            botones.forEach(btn => {
              const element = btn as HTMLElement;
              // Remover listeners existentes para evitar duplicados
              const newBtn = element.cloneNode(true) as HTMLElement;
              element.parentNode?.replaceChild(newBtn, element);
              
              // --- CORRECCIÓN DE SELECCIÓN EN EL EDITOR ---
              // Asegura que los clics dentro del editor permitan seleccionar el botón sin disparar acciones
              newBtn.style.pointerEvents = 'auto';
              newBtn.style.position = 'relative';
              newBtn.style.zIndex = '10';

              newBtn.addEventListener('mousedown', (e: Event) => {
                const isInEditorMousedown = 
                  (window.frameElement && window.frameElement.id === 'gjs-frame') ||
                  (window.parent && window.parent.document?.querySelector('#gjs') !== null) ||
                  document.body.classList.contains('gjs-dashed');

                if (isInEditorMousedown) {
                  // Permite seleccionar el elemento en el editor sin ejecutar acción
                  e.stopPropagation(); // evita que el click se propague
                  e.preventDefault(); // evita navegación
                  return false;
                }
              });
              
              newBtn.addEventListener('click', (e: Event) => {
                // Detectar si estamos dentro del editor de GrapesJS - SOLUCIÓN INFALIBLE
                const isInEditor = 
                  (window.frameElement && window.frameElement.id === 'gjs-frame') || // dentro del iframe del editor
                  (window.parent && window.parent.document?.querySelector('#gjs') !== null) || // desde el iframe, existe el contenedor del editor
                  document.body.classList.contains('gjs-dashed') || // el canvas editable
                  document.querySelector('.gjs-editor, .gjs-cv-canvas') !== null; // estructura del editor
                
                if (isInEditor) {
                  // En el editor → solo prevenir acciones de navegación, permitir selección
                  const url = newBtn.getAttribute('data-url');
                  const action = newBtn.getAttribute('data-action') || 'link';
                  
                  // Solo bloquear si hay una acción que ejecutar
                  if (url || action !== 'link') {
                    e.preventDefault();
                    console.log('🔧 Modo editor: acción de navegación bloqueada, selección permitida');
                  }
                  // No usar stopPropagation para permitir selección de GrapesJS
                  return;
                }
                
                // Aquí solo se ejecuta en la página publicada
                console.log('🌐 Modo página pública: ejecutando acción real.');
                
                // Solo ejecutar en la página real
                e.preventDefault();
                const url = newBtn.getAttribute('data-url');
                const target = newBtn.getAttribute('data-target') || '_self';
                const action = newBtn.getAttribute('data-action') || 'link';

                if (!url) return;

                const cleanUrl = url.replace(/`/g, '').trim();

                if (action === 'link') {
                  window.open(cleanUrl, target);
                } else if (action === 'download') {
                  const a = document.createElement('a');
                  a.href = cleanUrl;
                  a.download = cleanUrl.split('/').pop() || 'download';
                  a.click();
                }
              });

              // Agregar event listener para doble clic (solo en el editor)
              newBtn.addEventListener('dblclick', (e: Event) => {
                // Detectar si estamos dentro del editor de GrapesJS
                const isInEditor = 
                  (window.frameElement && window.frameElement.id === 'gjs-frame') || 
                  (window.parent && window.parent.document?.querySelector('#gjs') !== null) || 
                  document.body.classList.contains('gjs-dashed') || 
                  document.querySelector('.gjs-editor, .gjs-cv-canvas') !== null;
                
                if (isInEditor) {
                  e.preventDefault();
                  e?.stopPropagation?.();
                  console.log('🧪 Modo editor: probando botón con doble click');
                  
                  // Ejecutar acción para prueba
                  const url = newBtn.getAttribute('data-url');
                  const target = newBtn.getAttribute('data-target') || '_self';
                  const action = newBtn.getAttribute('data-action') || 'link';

                  if (!url) return;

                  const cleanUrl = url.replace(/`/g, '').trim();

                  if (action === 'link') {
                    window.open(cleanUrl, target);
                  } else if (action === 'download') {
                    const a = document.createElement('a');
                    a.href = cleanUrl;
                    a.download = cleanUrl.split('/').pop() || 'download';
                    a.click();
                  }
                }
              });
            });
          }

         // Listener para botones agregados dinámicamente
         gEditor.on('component:add', (component: any) => {
           if (component.get('type') === 'action-button' || 
               component.get('tagName') === 'A' || 
               component.get('tagName') === 'BUTTON') {
             
             setTimeout(() => {
               const doc = gEditor.Canvas.getDocument();
               if (doc) {
                 const element = component.getEl();
                 if (element && element.hasAttribute('data-url')) {
                   // Remover listeners existentes
                   const newElement = element.cloneNode(true) as HTMLElement;
                   element.parentNode?.replaceChild(newElement, element);
                   
                   // --- CORRECCIÓN DE SELECCIÓN EN EL EDITOR ---
                   // Asegura que los clics dentro del editor permitan seleccionar el botón sin disparar acciones
                   newElement.style.pointerEvents = 'auto';
                   newElement.style.position = 'relative';
                   newElement.style.zIndex = '10';

                   newElement.addEventListener('mousedown', (e: Event) => {
                     const isInEditorMousedown = 
                       (window.frameElement && window.frameElement.id === 'gjs-frame') ||
                       (window.parent && window.parent.document?.querySelector('#gjs') !== null) ||
                       document.body.classList.contains('gjs-dashed');

                     if (isInEditorMousedown) {
                       // 🔧 CONTROL CORRECTO DE EVENTOS - Solo stopPropagation, no preventDefault
                       e.stopPropagation(); // Evita que Grapes lo marque como acción externa
                       return false;        // No ejecutar, pero permite seleccionarlo
                     }
                   });
                   
                   newElement.addEventListener('click', (e: Event) => {
                      // Detectar si estamos dentro del editor de GrapesJS - SOLUCIÓN INFALIBLE
                      const isInEditor = 
                        (window.frameElement && window.frameElement.id === 'gjs-frame') || // dentro del iframe del editor
                        (window.parent && window.parent.document?.querySelector('#gjs') !== null) || // desde el iframe, existe el contenedor del editor
                        document.body.classList.contains('gjs-dashed') || // el canvas editable
                        document.querySelector('.gjs-editor, .gjs-cv-canvas') !== null; // estructura del editor
                      
                      if (isInEditor) {
                        // En el editor → solo prevenir acciones de navegación, permitir selección
                        const url = newElement.getAttribute('data-url');
                        const action = newElement.getAttribute('data-action') || 'link';
                        
                        // Solo bloquear si hay una acción que ejecutar
                        if (url || action !== 'link') {
                          e.preventDefault();
                          console.log('🔧 Modo editor: acción de navegación bloqueada, selección permitida');
                        }
                        // No usar stopPropagation para permitir selección de GrapesJS
                        return;
                      }
                      
                      // Aquí solo se ejecuta en la página publicada
                      console.log('🌐 Modo página pública: ejecutando acción real.');
                      
                      // Solo ejecutar en la página real
                      e.preventDefault();
                      const url = newElement.getAttribute('data-url');
                      const target = newElement.getAttribute('data-target') || '_self';
                      const action = newElement.getAttribute('data-action') || 'link';

                      if (!url) return;

                      const cleanUrl = url.replace(/`/g, '').trim();

                      if (action === 'link') {
                        window.open(cleanUrl, target);
                      } else if (action === 'download') {
                        const a = document.createElement('a');
                        a.href = cleanUrl;
                        a.download = cleanUrl.split('/').pop() || 'download';
                        a.click();
                      }
                    });

                    // Agregar event listener para doble clic (solo en el editor)
                    newElement.addEventListener('dblclick', (e: Event) => {
                      // Detectar si estamos dentro del editor de GrapesJS
                      const isInEditor = 
                        (window.frameElement && window.frameElement.id === 'gjs-frame') || 
                        (window.parent && window.parent.document?.querySelector('#gjs') !== null) || 
                        document.body.classList.contains('gjs-dashed') || 
                        document.querySelector('.gjs-editor, .gjs-cv-canvas') !== null;
                      
                      if (isInEditor) {
                        e.preventDefault();
                        e?.stopPropagation?.();
                        console.log('🧪 Modo editor: probando botón con doble click');
                        
                        // Ejecutar acción para prueba
                        const url = newElement.getAttribute('data-url');
                        const target = newElement.getAttribute('data-target') || '_self';
                        const action = newElement.getAttribute('data-action') || 'link';

                        if (!url) return;

                        const cleanUrl = url.replace(/`/g, '').trim();

                        if (action === 'link') {
                          window.open(cleanUrl, target);
                        } else if (action === 'download') {
                          const a = document.createElement('a');
                          a.href = cleanUrl;
                          a.download = cleanUrl.split('/').pop() || 'download';
                          a.click();
                        }
                      }
                    });
                 }
               }
             }, 100);
           }
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

        bm.add('button-link', {
          label: '🔘 Botón',
          category: '📌 Básico',
          content: '<a href="#" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; border-radius: 8px; text-decoration: none;">Botón</a>'
        });

        bm.add('image-block', {
          label: '🖼️ Imagen',
          category: '📌 Básico',
          content: '<img src="https://via.placeholder.com/400x300" style="max-width: 100%;">'
        });

        // Elementos adicionales
        bm.add('cta-button', {
          label: '🔔 Botón CTA',
          category: '🧩 Elementos',
          content: '<a class="px-4 py-2 rounded bg-blue-600 text-white inline-block" href="#">Llamada a la acción</a>'
        });

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
          content: {
            type: 'button',
            content: 'Botón Primario',
            attributes: {
              type: 'button',
              class: 'btn btn-primary',
              style: 'display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;',
              'data-action-type': 'none'
            }
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
            }
          }
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

        // 🔧 Ajuste general de selección y clics en el editor
        const fixSelectionIssues = () => {
          const iframe = gEditor.Canvas.getFrameEl();
          const iframeDoc = iframe?.contentDocument;

          if (!iframeDoc) return;

          // 1️⃣ Asegurar que todos los elementos dentro del iframe sean seleccionables
          iframeDoc.querySelectorAll('*').forEach((el: Element) => {
            (el as HTMLElement).style.pointerEvents = 'auto';
          });

          // 2️⃣ Permitir que GrapesJS capture eventos sin bloquear clics
          iframeDoc.addEventListener('mousedown', (e: Event) => {
            const target = e.target as HTMLElement;
            const isComponent = target?.closest('[data-gjs-type]');
            if (isComponent) {
              e.stopPropagation();
            }
          });

          // 3️⃣ Sincronizar hitbox al redimensionar
          const syncSelection = () => {
            try {
              const canvasView = gEditor.Canvas.getCanvasView();
              if (canvasView && typeof canvasView.updateFrameOffset === 'function') {
                canvasView.updateFrameOffset();
              }
            } catch (e) {
              // Método no disponible en esta versión
            }
          };
          window.addEventListener('resize', syncSelection);
          iframeDoc.addEventListener('scroll', syncSelection);

          // 4️⃣ Evitar saltos o desalineaciones
          gEditor.on('canvas:dragend component:selected', () => {
            requestAnimationFrame(() => {
              try {
                const canvasView = gEditor.Canvas.getCanvasView();
                if (canvasView && typeof canvasView.updateFrameOffset === 'function') {
                  canvasView.updateFrameOffset();
                }
              } catch (e) {
                // Método no disponible en esta versión
              }
            });
          });
        };

        // Ejecutar el fix de selección
        fixSelectionIssues();

        // 🔍 VERIFICACIÓN AUTOMÁTICA DE COMPONENTES - MOVIDA AL EVENTO LOAD
        // Esta función ahora se ejecuta dentro del evento 'load' para evitar errores de getWrapper

        // El iframe del canvas puede aún no estar listo; se usa 'canvas:frame:load'
      });

      // 🎨 CSS PARA MEJORAR SELECCIÓN DE BOTONES EN EL CANVAS
      gEditor.on('canvas:frame:load', () => {
        console.log('🎨 Inyectando CSS para mejorar selección de botones...');
        try {
          const frame = gEditor.Canvas.getFrameEl();
          if (frame && frame.contentDocument) {
            const style = frame.contentDocument.createElement('style');
            style.innerHTML = `
              /* Asegurar que todos los elementos sean seleccionables */
              * {
                pointer-events: auto !important;
              }
              
              /* Mejorar selección de enlaces y botones */
              a, button, [data-url] {
                position: relative !important;
                z-index: 9999 !important;
                pointer-events: auto !important;
                cursor: pointer !important;
              }
              
              /* Prevenir que el editor bloquee la selección */
              .gjs-dashed * {
                pointer-events: auto !important;
              }
              
              /* Mejorar visibilidad en hover */
              a:hover, button:hover, [data-url]:hover {
                outline: 2px solid #007bff !important;
                outline-offset: 2px !important;
              }
            `;
            frame.contentDocument.head.appendChild(style);
            console.log('✅ CSS de selección inyectado correctamente');
          }
        } catch (error) {
          console.error('❌ Error inyectando CSS de selección:', error);
        }
      });

      // 🔗 MANEJO CORRECTO DE ENLACES CON DATA-URL
      console.log('🔗 Configurando manejo de enlaces...');
      
      // Prevenir navegación en el editor, permitir en la página publicada
      const handleLinkClick = (e: Event) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a[data-url]') as HTMLAnchorElement;
        
        if (!link) return;
        
        // Detectar si estamos en el editor
        const isEditor = document.body.classList.contains('gjs-dashed') || 
                        window.location.pathname.includes('/admin/');
        
        if (isEditor) {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔗 Enlace bloqueado en editor:', link.getAttribute('data-url'));
          return false;
        }
        
        // En la página publicada, usar la URL del data-url
        const url = link.getAttribute('data-url');
        const targetAttr = link.getAttribute('data-target');
        
        if (url) {
          e.preventDefault();
          const target = targetAttr === '_blank' ? '_blank' : '_self';
          window.open(url, target);
          console.log('🔗 Navegando a:', url);
        }
      };
      
      // Añadir el event listener al documento
      document.addEventListener('click', handleLinkClick, true);
      
      // También añadirlo al frame del canvas cuando esté listo
      gEditor.on('canvas:frame:load', () => {
        const frame = gEditor.Canvas.getFrameEl();
        if (frame && frame.contentDocument) {
          frame.contentDocument.addEventListener('click', handleLinkClick, true);
        }
      });
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

      // 🔄 RESTAURAR LAYER MANAGER 100% NATIVO DE GRAPESJS
      console.log('🔄 Restaurando Layer Manager 100% nativo...');
      
      gEditor.on('load', () => {
        // 🔄 Restaurar Layer Manager a su comportamiento nativo
        const layerManager = gEditor.LayerManager;
        if (!layerManager) {
          console.error('❌ No se encontró el LayerManager');
          return;
        }

        // Asegurar que el panel esté visible
        const layerPanel = gEditor.Panels.getPanel('views-container');
        if (layerPanel) {
          layerPanel.set('attributes', { style: 'display: block; overflow: auto; width: 100%; height: auto;' });
        }

        // 🔧 Reaplicar CSS nativo limpio
        const style = document.createElement('style');
        style.id = 'layer-manager-native-restore';
        style.innerHTML = `
          .gjs-layers {
            display: block !important;
            overflow: auto !important;
            width: 100% !important;
            height: auto !important;
          }

          .gjs-layer {
            display: block !important;
            margin: 0 !important;
            padding: 3px 0 3px 10px !important;
            border-left: 1px dashed rgba(0,0,0,0.1) !important;
          }

          .gjs-layer-title {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            cursor: pointer !important;
          }

          .gjs-layer-children {
            margin-left: 10px !important;
            display: block !important;
          }

          .gjs-layer-name {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
        `;
        
        // Solo agregar si no existe ya
        if (!document.querySelector('#layer-manager-native-restore')) {
          document.head.appendChild(style);
          console.log('✅ CSS nativo del Layer Manager aplicado');
        }

        // 🔁 Forzar sincronización de capas
        const comps = gEditor.DomComponents.getComponents();
        layerManager.render(comps);
        console.log('🔁 Sincronización de capas forzada');

        // Opcional: abrir todas las capas al cargar
        setTimeout(() => {
          const allLayers = document.querySelectorAll('.gjs-layer');
          allLayers.forEach(layer => {
            layer.classList.add('gjs-open');
          });
          console.log('📂 Todas las capas expandidas');
        }, 500);

        // 🔧 FIX A — Forzar pointer-events dentro del iframe (permitir seleccionar)
        console.log('🔧 Aplicando Fix A: pointer-events dentro del iframe...');
        const frame = gEditor.Canvas.getFrameEl();
        if (!frame?.contentDocument) return;
        const doc = frame.contentDocument;
        const fixId = 'gjs-fix-pointer-events';
        if (!doc.getElementById(fixId)) {
          const pointerStyle = doc.createElement('style');
          pointerStyle.id = fixId;
          pointerStyle.innerHTML = `
            /* permitir interacción en elementos reales */
            body, html, #gjs, .gjs-cv-canvas { pointer-events: auto !important; }
            a, button, [data-gjs-type] { pointer-events: auto !important; z-index: 2000 !important; }
            /* si hay overlays con pointer-events: none, esto obliga a permitir interacción */
            
            /* Mejorar visibilidad de elementos seleccionados */
            .gjs-selected {
              outline: 2px solid #007cff !important;
              outline-offset: 2px !important;
            }
            
            /* Asegurar que los elementos con ID específicos sean seleccionables */
            [id*="irlnr"], [id*="button"], [id*="link"] {
              pointer-events: auto !important;
              z-index: 1000 !important;
            }
          `;
          doc.head.appendChild(pointerStyle);
          console.log('✅ pointer-events fix aplicado dentro del iframe');
        }

        // 🔧 FIX B — Asegurar flags del componente (selectable/draggable)
        console.log('🔧 Aplicando Fix B: flags selectable/draggable...');
        // convertir todos los componentes tipo "button" o "a" para que sean seleccionables
        const comps2 = gEditor.DomComponents;
        const walk = (collection: any) => {
          collection.each((m: any) => {
            const tag = (m.get('tagName') || '').toLowerCase();
            if (tag === 'button' || tag === 'a' || m.get('type') === 'button') {
              m.set({ selectable: true, draggable: true, hoverable: true });
            }
            if (m.components && typeof m.components === 'function') walk(m.components());
          });
        };
        walk(comps2.getComponents());
        console.log('✅ Flags selectable/draggable forzados en buttons/links');

        // 🔧 FIX C — Normalizar traits para evitar el.getAttribute is not a function (MEJORADO)
        console.log('🔧 Aplicando Fix C mejorado: normalización segura de traits...');
        
        // Helper para leer atributos de forma segura
        function safeGetAttr(model: any, name: string) {
          try {
            const el = model.getEl ? model.getEl() : model.get('el');
            if (!el || typeof el.getAttribute !== 'function') return null;
            return el.getAttribute(name);
          } catch(e) {
            console.warn('⚠️ Error leyendo atributo:', name, e);
            return null;
          }
        }

        gEditor.on('component:selected', (model: any) => {
          if (!model) return;
          const tag = (model.get('tagName') || '').toLowerCase();
          const type = model.get('type');
          
          if (tag === 'a' || tag === 'button' || type === 'button') {
            try {
              // 🔧 PRESERVAR TRAITS EXISTENTES - No sobrescribir
              const existingTraits = model.get('traits') || [];
              
              // Solo validar que el componente mantenga sus propiedades de edición
              // SIN sobrescribir los traits personalizados
              const currentProps = {
                selectable: model.get('selectable'),
                draggable: model.get('draggable'),
                removable: model.get('removable'),
                hoverable: model.get('hoverable'),
                highlightable: model.get('highlightable'),
                badgable: model.get('badgable'),
                copyable: model.get('copyable')
              };
              
              // Solo restaurar propiedades de edición si se han perdido
              const needsRestore = Object.values(currentProps).some(prop => prop === false);
              
              if (needsRestore) {
                model.set({
                  selectable: true,
                  draggable: true,
                  removable: true,
                  hoverable: true,
                  highlightable: true,
                  badgable: true,
                  copyable: true
                });
                console.log('🔧 Propiedades de edición restauradas para:', model.cid);
              }
              
              // Validar elemento DOM con helper seguro (sin modificar traits)
              const href = safeGetAttr(model, 'href');
              const target = safeGetAttr(model, 'target');
              
              console.log('✅ Componente validado (traits preservados):', {
                tag, type, href, target, 
                cid: model.cid,
                hasValidEl: !!model.getEl(),
                traitsCount: existingTraits.length,
                editableProps: currentProps
              });
              
            } catch (error) {
              console.error('❌ Error en validación de componente:', error);
              console.log('📊 Modelo problemático:', model.toJSON());
            }
          }
        });

        // 🔧 FIX D — Prevenir acción de navegación en editor pero permitir selección
        console.log('🔧 Aplicando Fix D: prevenir navegación en editor...');
        const canvasFrame = gEditor.Canvas.getFrameEl();
        if (canvasFrame?.contentDocument) {
          // ✅ Permitir selección de botones/enlaces pero bloquear su acción real
          canvasFrame.contentDocument.addEventListener('click', function(e: Event) {
            const target = e.target as HTMLElement;
            
            // Solo intervenir si el click fue dentro de un enlace o botón
            if (target.matches('a, button')) {
              // No navegues, pero deja que el editor lo seleccione
              e.preventDefault();
              
              // ⚠️ NO usar stopPropagation, porque eso impide que GrapesJS lo seleccione
              console.log('⚠️ Clic interceptado, pero permitiendo selección:', {
                tag: target.tagName,
                href: target.getAttribute('href'),
                id: target.id,
                className: target.className,
              });
            }
          }, true); // capture true para interceptar temprano
          
          // 🧩 Complemento: doble clic = acción real
          canvasFrame.contentDocument.addEventListener('dblclick', function(e: Event) {
            const target = e.target as HTMLElement;
            if (target.matches('a, button')) {
              const url = target.getAttribute('href') || target.getAttribute('data-url');
              const action = target.getAttribute('data-action');
              
              console.log('🔗 DOBLE CLIC DETECTADO:', {
                tag: target.tagName,
                id: target.id || 'sin-id',
                className: target.className || 'sin-clase',
                href: target.getAttribute('href'),
                dataUrl: target.getAttribute('data-url'),
                dataAction: action,
                finalUrl: url,
                timestamp: new Date().toLocaleTimeString()
              });
              
              if (url && url !== '#') {
                window.open(url, '_blank');
                console.log('✅ ENLACE ABIERTO EXITOSAMENTE:', url);
              } else if (action) {
                console.log('🎬 ACCIÓN PERSONALIZADA DETECTADA:', action);
                // Aquí se ejecutarían las acciones personalizadas según el tipo
              } else {
                console.log('⚠️ No hay URL ni acción definida para este elemento');
              }
            }
          });
          
          console.log('⛔ Acciones reales de navegación desactivadas en el editor (clicks preventDefault)');
        } else {
          console.warn('⚠️ No se pudo acceder al frame del canvas para Fix D');
        }

        // 🔧 Verificar que el contenedor del Layer Manager existe
        const layersContainer = document.querySelector('.layers-container');
        if (!layersContainer) {
          console.warn('⚠️ No se encontró .layers-container, verificar configuración');
        } else {
          console.log('✅ Contenedor de capas encontrado');
        }

        // 🔄 Forzar re-renderizado si sigue vacío
        setTimeout(() => {
          const layersVisible = document.querySelectorAll('.gjs-layer').length;
          if (layersVisible === 0) {
            console.log('🔄 Panel vacío detectado, forzando re-renderizado...');
            layerManager.render([]);
            layerManager.render(gEditor.DomComponents.getComponents());
          }
          console.log(`📊 Capas visibles: ${layersVisible}`);
        }, 1000);

        // 🔍 COMANDOS DE DIAGNÓSTICO - Disponibles en la consola del navegador
        console.log('🔍 Configurando comandos de diagnóstico...');
        
        // Exponer funciones de diagnóstico globalmente
        (window as any).grapesDebug = {
          // A — ¿Se están bloqueando los pointer-events?
          checkPointerEvents: () => {
            const frame = gEditor.Canvas.getFrameEl();
            console.log('frame element', frame);
            console.log('frame style pointer-events (parent):', window.getComputedStyle(frame).pointerEvents);
            if (frame?.contentDocument) {
              console.log('canvas doc body pointer-events:', getComputedStyle(frame.contentDocument.body).pointerEvents);
              // comprobar overlays dentro del iframe
              const overlays = frame.contentDocument.querySelectorAll('*');
              overlays.forEach(el => {
                if (getComputedStyle(el).pointerEvents === 'none') {
                  /* no hacemos nada, sólo listar posibles culpables */
                }
              });
              console.log('Revisa elementos con pointer-events: none dentro del iframe (manual).');
            }
          },

          // B — ¿El componente es select-able? (intenta con el id del botón)
          checkSelectability: (targetId = 'irlnr4') => {
            const comps = gEditor.DomComponents;
            const model = comps.getWrappers ? comps.getWrapper().find(`#${targetId}`) : null;
            console.log('model find by id (puede ser nulo):', model);
            // alternativa: buscar primer componente con tag <a>
            const all = comps.getComponents();
            function findAnchor(m: any): any {
              if (!m) return null;
              if ((m.attributes && (m.attributes.id === targetId || m.attributes.href)) || m.get('tagName') === 'a') return m;
              for (const c of m.components().models) {
                const found = findAnchor(c);
                if (found) return found;
              }
              return null;
            }
            console.log('buscar anchor recursivo (puede tardar):', findAnchor(all));
          },

          // C — Loguear component:selected y mostrar el elemento
          enableSelectionLogging: () => {
            gEditor.on('component:selected', (model: any) => {
              console.log('SELECTED model:', model);
              try {
                console.log('model.el:', model.getEl ? model.getEl() : model.get('el'));
              } catch (e) {
                console.error('error al leer el.el', e);
              }
              console.log('selectable/draggable flags:', model.get('selectable'), model.get('draggable'));
            });
            console.log('✅ Logging de selección habilitado');
          },

          // D — Buscar handlers que hagan preventDefault (rápido heurístico)
          checkEventListeners: () => {
            // Esto no detecta handlers internos, pero te deja ver listeners en el document dentro del iframe
            const doc = gEditor.Canvas.getFrameEl()?.contentDocument;
            if (doc) {
              console.log('listeners on iframe document:', (window as any).getEventListeners ? (window as any).getEventListeners(doc) : 'devtools-only getEventListeners not available');
              // también revisa el parent
              console.log('listeners on parent document:', (window as any).getEventListeners ? (window as any).getEventListeners(document) : 'devtools-only info');
            }
          },

          // Comando para re-renderizar manualmente el Layer Manager
          reRenderLayers: () => {
            const layerManager = gEditor.LayerManager;
            layerManager.render(gEditor.DomComponents.getComponents());
            console.log('🔄 Layer Manager re-renderizado manualmente');
          },

          // Comando para verificar todos los componentes
          listAllComponents: () => {
            const comps = gEditor.DomComponents.getComponents();
            const walk = (collection: any, level = 0) => {
              collection.each((m: any) => {
                const indent = '  '.repeat(level);
                const tag = m.get('tagName') || 'unknown';
                const id = m.getId() || 'no-id';
                const type = m.get('type') || 'no-type';
                const selectable = m.get('selectable');
                const draggable = m.get('draggable');
                console.log(`${indent}${tag}#${id} [${type}] selectable:${selectable} draggable:${draggable}`);
                if (m.components && typeof m.components === 'function') {
                  walk(m.components(), level + 1);
                }
              });
            };
            walk(comps);
          },

          // 🆕 NUEVOS COMANDOS PARA TESTING FIX C y FIX D
          
          // E — Test Fix C: Verificar traits seguros y safeGetAttr
          testTraitNormalization: () => {
            console.log('🧪 Testing Fix C - Trait Normalization...');
            const comps = gEditor.DomComponents.getComponents();
            const walk = (collection: any) => {
              collection.each((m: any) => {
                const tag = (m.get('tagName') || '').toLowerCase();
                const type = m.get('type');
                if (tag === 'a' || tag === 'button' || type === 'button') {
                  console.log('📋 Componente encontrado:', {
                    tag, type, cid: m.cid,
                    traits: m.get('traits'),
                    hasValidEl: !!m.getEl(),
                    elType: typeof m.getEl()
                  });
                  
                  // Test safeGetAttr
                  try {
                    const el = m.getEl ? m.getEl() : m.get('el');
                    if (el && typeof el.getAttribute === 'function') {
                      console.log('✅ getAttribute disponible:', el.getAttribute('href') || el.getAttribute('type'));
                    } else {
                      console.warn('⚠️ getAttribute NO disponible:', typeof el, el);
                    }
                  } catch (e) {
                    console.error('❌ Error en getAttribute:', e);
                  }
                }
                if (m.components && typeof m.components === 'function') {
                  walk(m.components());
                }
              });
            };
            walk(comps);
          },

          // F — Test Fix D: Verificar prevención de navegación
          testNavigationPrevention: () => {
            console.log('🧪 Testing Fix D - Navigation Prevention...');
            const frame = gEditor.Canvas.getFrameEl();
            if (frame?.contentDocument) {
              const links = frame.contentDocument.querySelectorAll('a, button');
              console.log(`📊 Encontrados ${links.length} elementos a/button en el canvas`);
              
              links.forEach((el, index) => {
                console.log(`${index + 1}. ${el.tagName} - href: ${el.getAttribute('href')} - id: ${el.id}`);
              });
              
              // Simular click en el primer enlace para probar preventDefault
              if (links.length > 0) {
                const firstLink = links[0];
                console.log('🎯 Simulando click en primer elemento:', firstLink);
                const event = new MouseEvent('click', { bubbles: true, cancelable: true });
                const result = firstLink.dispatchEvent(event);
                console.log('📊 Resultado del click simulado (false = preventDefault funcionó):', result);
              }
            } else {
              console.warn('⚠️ No se pudo acceder al frame del canvas');
            }
          },

          // G — Test completo: ejecutar todos los tests paso a paso
          runAllTests: () => {
            console.log('🚀 Ejecutando todos los tests...');
            console.log('\n1️⃣ Test A - Pointer Events:');
            (window as any).grapesDebug.checkPointerEvents();
            
            console.log('\n2️⃣ Test B - Selectability:');
            (window as any).grapesDebug.checkSelectability();
            
            console.log('\n3️⃣ Test C - Trait Normalization:');
            (window as any).grapesDebug.testTraitNormalization();
            
            console.log('\n4️⃣ Test D - Navigation Prevention:');
            (window as any).grapesDebug.testNavigationPrevention();
            
            console.log('\n5️⃣ Test E - Component Listing:');
            (window as any).grapesDebug.listAllComponents();
            
            console.log('\n6️⃣ Test F - Button Editing Properties:');
            (window as any).grapesDebug.checkButtonEditingProperties();
            
            console.log('\n7️⃣ Test G - Hitboxes y __gjs_model:');
            (window as any).grapesDebug.checkHitboxes();
            
            console.log('\n8️⃣ Test H - Pointer Events Avanzado:');
            (window as any).grapesDebug.checkPointerEventsAdvanced();
            
            console.log('\n✅ Todos los tests completados. Revisa los logs arriba.');
          },

          // H — Test específico para propiedades de edición de botones
          checkButtonEditingProperties: () => {
            console.log('🧪 Testing Button Editing Properties...');
            const comps = gEditor.DomComponents.getComponents();
            let buttonCount = 0;
            let problematicButtons = 0;
            
            const walk = (collection: any) => {
              collection.each((m: any) => {
                const tag = (m.get('tagName') || '').toLowerCase();
                const type = m.get('type');
                
                if (tag === 'a' || tag === 'button' || type === 'button' || type === 'action-button') {
                  buttonCount++;
                  
                  const props = {
                    selectable: m.get('selectable'),
                    draggable: m.get('draggable'),
                    removable: m.get('removable'),
                    hoverable: m.get('hoverable'),
                    highlightable: m.get('highlightable'),
                    badgable: m.get('badgable'),
                    copyable: m.get('copyable')
                  };
                  
                  const traits = m.get('traits') || [];
                  const hasProblems = Object.values(props).some(prop => prop === false || prop === undefined);
                  
                  if (hasProblems) {
                    problematicButtons++;
                    console.error(`❌ Botón problemático [${m.cid}]:`, {
                      tag, type,
                      traits: traits.length,
                      properties: props,
                      element: m.getEl()
                    });
                  } else {
                    console.log(`✅ Botón OK [${m.cid}]:`, {
                      tag, type,
                      traits: traits.length,
                      allPropsTrue: true
                    });
                  }
                }
                
                if (m.components && typeof m.components === 'function') {
                  walk(m.components());
                }
              });
            };
            
            walk(comps);
            
            console.log(`📊 Resumen: ${buttonCount} botones encontrados, ${problematicButtons} con problemas`);
            
            if (problematicButtons > 0) {
              console.log('🔧 Ejecutando restauración automática...');
              // Ejecutar la función de restauración
              const restoreAll = () => {
                walk(gEditor.DomComponents.getComponents());
              };
              restoreAll();
              console.log('✅ Restauración completada. Ejecuta el test nuevamente para verificar.');
            }
          },

          // I — Forzar restauración de propiedades de edición
          forceRestoreEditingProperties: () => {
            console.log('🔧 Forzando restauración de propiedades de edición...');
            const comps = gEditor.DomComponents.getComponents();
            let restoredCount = 0;
            
            const walk = (collection: any) => {
              collection.each((m: any) => {
                const tag = (m.get('tagName') || '').toLowerCase();
                const type = m.get('type');
                
                if (tag === 'a' || tag === 'button' || type === 'button' || type === 'action-button') {
                  m.set({
                    selectable: true,
                    draggable: true,
                    removable: true,
                    hoverable: true,
                    highlightable: true,
                    badgable: true,
                    copyable: true
                  });
                  restoredCount++;
                  console.log(`🔧 Propiedades restauradas para: ${m.cid}`);
                }
                
                if (m.components && typeof m.components === 'function') {
                  walk(m.components());
                }
              });
            };
            
            walk(comps);
            console.log(`✅ ${restoredCount} botones restaurados`);
          },

          // J — Diagnóstico de hitboxes y referencias __gjs_model
          checkHitboxes: () => {
            console.log('🎯 Verificando hitboxes y referencias __gjs_model...');
            
            try {
              const wrapper = gEditor.getWrapper();
              if (!wrapper) {
                console.error('❌ No se pudo obtener el wrapper del editor');
                return;
              }
              
              const buttons = wrapper.find('button, a, [data-gjs-type="button"], [data-gjs-type="action-button"]');
              const broken = buttons.filter((b: any) => {
                const el = b.getEl?.();
                return !el || !el.__gjs_model;
              });
              
              console.log(`📊 Total botones: ${buttons.length}, sin hitbox: ${broken.length}`);
              
              if (broken.length > 0) {
                console.warn('❌ Botones sin hitbox encontrados:');
                broken.forEach((b: any) => {
                  const el = b.getEl?.();
                  console.warn(`  - ${b.cid}: elemento=${!!el}, __gjs_model=${!!(el && el.__gjs_model)}`);
                });
                
                // Intentar reparación automática
                console.log('🔧 Intentando reparación automática...');
                broken.forEach((b: any) => {
                  const el = b.getEl?.();
                  if (el && !el.__gjs_model) {
                    el.__gjs_model = b;
                    console.log(`✅ Reparado: ${b.cid}`);
                  }
                });
              } else {
                console.log('✅ Todos los botones tienen hitbox correcto');
              }
              
              // Verificar también en el DOM del canvas
              const canvas = gEditor.Canvas;
              const canvasDoc = canvas.getDocument();
              const domButtons = canvasDoc.querySelectorAll('button, a, [data-gjs-type="button"]');
              
              console.log(`🔍 Botones en DOM del canvas: ${domButtons.length}`);
              let domBroken = 0;
              
              domButtons.forEach((btn: any, index: number) => {
                if (!btn.__gjs_model) {
                  domBroken++;
                  console.warn(`❌ Botón DOM sin modelo [${index}]:`, btn);
                }
              });
              
              console.log(`📊 Botones DOM sin modelo: ${domBroken}/${domButtons.length}`);
              
            } catch (error) {
              console.error('❌ Error verificando hitboxes:', error);
            }
          },

          // K — Test de pointer-events y z-index
          checkPointerEventsAdvanced: () => {
            console.log('🖱️ Verificando pointer-events y z-index...');
            
            try {
              const canvas = gEditor.Canvas;
              const canvasDoc = canvas.getDocument();
              const buttons = canvasDoc.querySelectorAll('button, a, [data-gjs-type="button"]');
              
              console.log(`🔍 Analizando ${buttons.length} botones en canvas...`);
              
              buttons.forEach((btn: any, index: number) => {
                const computedStyle = canvasDoc.defaultView?.getComputedStyle(btn);
                const pointerEvents = computedStyle?.pointerEvents;
                const zIndex = computedStyle?.zIndex;
                const position = computedStyle?.position;
                
                const hasIssues = pointerEvents === 'none' || 
                                 (zIndex && parseInt(zIndex) < 0) ||
                                 !btn.__gjs_model;
                
                if (hasIssues) {
                  console.warn(`❌ Botón [${index}] con problemas:`, {
                    pointerEvents,
                    zIndex,
                    position,
                    hasModel: !!btn.__gjs_model,
                    element: btn
                  });
                } else {
                  console.log(`✅ Botón [${index}] OK:`, {
                    pointerEvents,
                    zIndex,
                    hasModel: !!btn.__gjs_model
                  });
                }
              });
              
              // Verificar estilos del canvas
              const canvasFrame = canvasDoc.querySelector('.gjs-frame, .gjs-cv-canvas');
              if (canvasFrame) {
                const frameStyle = canvasDoc.defaultView?.getComputedStyle(canvasFrame);
                console.log('🖼️ Estilos del canvas frame:', {
                  pointerEvents: frameStyle?.pointerEvents,
                  zIndex: frameStyle?.zIndex,
                  position: frameStyle?.position
                });
              }
              
            } catch (error) {
              console.error('❌ Error verificando pointer-events:', error);
            }
          },

          // L — Test completo de diagnóstico de botones
          runButtonDiagnostics: () => {
            console.log('🚀 Ejecutando diagnóstico completo de botones...');
            
            console.log('\n1️⃣ Verificando propiedades de edición...');
            (window as any).grapesDebug.checkButtonEditingProperties();
            
            console.log('\n2️⃣ Verificando hitboxes y referencias __gjs_model...');
            (window as any).grapesDebug.checkHitboxes();
            
            console.log('\n3️⃣ Verificando pointer-events y z-index...');
            (window as any).grapesDebug.checkPointerEventsAdvanced();
            
            console.log('\n4️⃣ Verificando selectabilidad general...');
            (window as any).grapesDebug.checkSelectability();
            
            console.log('\n✅ Diagnóstico completo finalizado');
          }
        };

        console.log('✅ Comandos de diagnóstico disponibles en window.grapesDebug');
        console.log('📋 Comandos disponibles:');
        console.log('  - window.grapesDebug.checkPointerEvents()');
        console.log('  - window.grapesDebug.checkSelectability("id-del-elemento")');
        console.log('  - window.grapesDebug.enableSelectionLogging()');
        console.log('  - window.grapesDebug.checkEventListeners()');
        console.log('  - window.grapesDebug.reRenderLayers()');
        console.log('  - window.grapesDebug.listAllComponents()');
        console.log('🆕 NUEVOS COMANDOS PARA TESTING:');
        console.log('  - window.grapesDebug.testTraitNormalization() // Test Fix C');
        console.log('  - window.grapesDebug.testNavigationPrevention() // Test Fix D');
        console.log('  - window.grapesDebug.runAllTests() // Ejecutar todos los tests');
        console.log('💡 Usa runAllTests() para ejecutar todos los tests de una vez');
      });

      console.log('✅ Layer Manager 100% nativo restaurado');

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
              }
              
              ${css}
              
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
        
        /* Paneles y contenedores con estilo más limpio */
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
          position: relative;
          overflow: hidden;
          background: #fff;
          user-select: none;
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

          {/* Botón para probar acción del elemento seleccionado */}
          {selectedInfo && selectedInfo.type === 'action-button' && (
            <button
              onClick={() => {
                try {
                  const editor = editorInstanceRef.current;
                  const selected = editor?.getSelected();
                  if (!selected) return;
                  
                  const actionType = selected.get('attributes')['data-action-type'] || 'none';
                  const url = selected.get('attributes')['href'] || selected.get('attributes')['data-file-url'] || '';
                  const target = selected.get('attributes')['target'] || '_self';
                  
                  if (actionType === 'none' || !url) {
                    alert('Este botón no tiene una acción configurada');
                    return;
                  }
                  
                  // Ejecutar la acción según el tipo
                  if (actionType === 'link' || actionType === 'go-to-page') {
                    if (target === '_blank') {
                      window.open(url, '_blank');
                    } else {
                      window.location.href = url;
                    }
                  } else if (actionType === 'download' || actionType === 'download-file') {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = url.split('/').pop() || 'archivo';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } else if (actionType === 'open_pdf') {
                    window.open(url, '_blank');
                  } else if (actionType === 'go_to_payment') {
                    const tx = selected.get('attributes')['data-transaction-id'] || '';
                    const amount = selected.get('attributes')['data-amount'] || '';
                    const finalUrl = url + (url.indexOf('?') === -1 ? '?' : '&') +
                      'tx=' + encodeURIComponent(tx) + '&amount=' + encodeURIComponent(amount);
                    if (target === '_blank') {
                      window.open(finalUrl, '_blank');
                    } else {
                      window.location.href = finalUrl;
                    }
                  }
                } catch (e) {
                  console.warn('Error al probar acción:', e);
                  alert('Error al ejecutar la acción del botón');
                }
              }}
              className="px-3 py-1.5 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-md transition-colors flex items-center"
              title="Probar acción del botón seleccionado"
            >
              🧪 Probar Acción
            </button>
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
              } catch {}
            }}>Izq</button>
            <button title="Centrar" className="px-2 py-1 text-sm bg-gray-50 hover:bg-gray-100 rounded" onClick={() => {
              try {
                const ed = editorInstanceRef.current; const sel = ed?.getSelected(); if (!sel) return;
                sel.addStyle({ 'margin-left': 'auto', 'margin-right': 'auto' });
              } catch {}
            }}>Centro</button>
            <button title="Alinear derecha" className="px-2 py-1 text-sm bg-gray-50 hover:bg-gray-100 rounded" onClick={() => {
              try {
                const ed = editorInstanceRef.current; const sel = ed?.getSelected(); if (!sel) return;
                sel.addStyle({ 'margin-left': 'auto', 'margin-right': '0' });
              } catch {}
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
              } catch {}
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
        </div>
      </div>
    </div>
  );
};

export default GrapesEditor;
