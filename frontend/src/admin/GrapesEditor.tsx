import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { useErrorHandler } from '../utils/errorHandler';
import ErrorDisplay from '../components/ErrorDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

interface GrapesEditorProps {
  pageSlug?: string;
}

const GrapesEditor: React.FC<GrapesEditorProps> = ({ pageSlug }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageData, setPageData] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<any>(null);
  const { handleError } = useErrorHandler();
  
  const currentSlug = pageSlug || slug || 'home';

  // Cargar datos de la página primero
  useEffect(() => {
    loadPageData();
  }, [currentSlug]);

  // Inicializar editor solo cuando los datos estén listos
  useEffect(() => {
    if (dataLoaded && !editor) {
      initializeEditor();
    }
  }, [dataLoaded, editor]);

  const loadPageData = async () => {
    console.log('🔍 [GrapesEditor] Iniciando loadPageData para slug:', currentSlug);
    
    try {
      const response = await fetch(`/api/pages/slug/${currentSlug}`);
      console.log('🌐 [GrapesEditor] Respuesta de API recibida:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (response.ok) {
        const data = await response.json();
        
        // 🔧 Extraer la página del formato anidado del backend
        const page = data.data?.page;
        
        console.log('📄 [GrapesEditor] Datos de página recibidos:', {
          success: data.success,
          hasPage: !!page,
          pageId: page?.id,
          pageTitle: page?.title,
          hasGrapesData: !!page?.grapesData,
          grapesDataType: typeof page?.grapesData,
          grapesDataLength: page?.grapesData ? JSON.stringify(page.grapesData).length : 0
        });
        
        setPageData(page);
        setError(null);
      } else if (response.status === 404) {
        console.log('❌ [GrapesEditor] Página no encontrada (404), creando estructura por defecto');
        const defaultPage = {
          id: null,
          title: currentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          slug: currentSlug,
          grapesData: null,
          content: null,
          html: null,
          css: null,
          isActive: true,
          isPublished: false
        };
        console.log('🏗️ [GrapesEditor] Página por defecto creada:', defaultPage);
        setPageData(defaultPage);
        setError(null);
      } else {
        console.error('❌ [GrapesEditor] Error en respuesta de API:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        console.error('❌ [GrapesEditor] Detalles del error:', errorData);
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('💥 [GrapesEditor] Error en loadPageData:', error);
      const errorInfo = handleError(error, 'GrapesEditor.loadPageData');
      setError(errorInfo);
    } finally {
      // Marcar datos como cargados independientemente del resultado
      setDataLoaded(true);
    }
  };

  const initializeEditor = async () => {
    if (!editorRef.current) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('🚀 [GrapesEditor] Iniciando initializeEditor...');
      console.log('📋 [GrapesEditor] pageData al inicializar:', {
        pageData: pageData,
        hasPageData: !!pageData,
        pageId: pageData?.id,
        hasGrapesData: !!pageData?.grapesData,
        grapesDataType: typeof pageData?.grapesData
      });

      console.log('🎯 [GrapesEditor] Iniciando GrapesJS con configuración...');

      const grapesEditor = grapesjs.init({
        container: editorRef.current,
        height: '100vh',
        width: 'auto',
        // Agregar configuración para evitar errores
        avoidInlineStyle: true,
        avoidDefaults: ['gjs-inlined-css'],
        storageManager: false,
        blockManager: {
          appendTo: '#blocks',
        },
        layerManager: {
          appendTo: '#layers',
        },
        styleManager: {
          appendTo: '#styles',
          sectors: [
            {
              name: 'Dimensiones',
              open: false,
              buildProps: ['width', 'min-height', 'padding'],
              properties: [
                {
                  type: 'integer',
                  name: 'Ancho',
                  property: 'width',
                  units: ['px', '%'],
                  defaults: 'auto',
                  min: 0,
                },
                {
                  property: 'min-height',
                  name: 'Altura mínima',
                  units: ['px', '%'],
                  defaults: 'auto',
                },
                {
                  property: 'padding',
                  name: 'Espaciado interno',
                  units: ['px', '%'],
                  defaults: '0',
                },
              ],
            },
            {
              name: 'Tipografía',
              open: false,
              buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align'],
              properties: [
                {
                  name: 'Fuente',
                  property: 'font-family',
                },
                {
                  name: 'Tamaño',
                  property: 'font-size',
                  units: ['px', 'em', 'rem'],
                  defaults: '16px',
                },
                {
                  name: 'Peso',
                  property: 'font-weight',
                  type: 'select',
                  defaults: '400',
                  list: [
                    { id: 'thin', value: '100', name: 'Thin' },
                    { id: 'light', value: '300', name: 'Light' },
                    { id: 'normal', value: '400', name: 'Normal' },
                    { id: 'medium', value: '500', name: 'Medium' },
                    { id: 'semibold', value: '600', name: 'Semi Bold' },
                    { id: 'bold', value: '700', name: 'Bold' },
                    { id: 'black', value: '900', name: 'Black' },
                  ],
                },
                {
                  name: 'Color',
                  property: 'color',
                  type: 'color',
                },
                {
                  name: 'Alineación',
                  property: 'text-align',
                  type: 'radio',
                  defaults: 'left',
                  list: [
                    { id: 'left', value: 'left', name: 'Izquierda' },
                    { id: 'center', value: 'center', name: 'Centro' },
                    { id: 'right', value: 'right', name: 'Derecha' },
                    { id: 'justify', value: 'justify', name: 'Justificado' },
                  ],
                },
              ],
            },
            {
              name: 'Decoración',
              open: false,
              buildProps: ['background-color', 'border-radius', 'border', 'box-shadow'],
              properties: [
                {
                  name: 'Color de fondo',
                  property: 'background-color',
                  type: 'color',
                },
                {
                  name: 'Borde redondeado',
                  property: 'border-radius',
                  units: ['px', '%'],
                  defaults: '0',
                },
                {
                  name: 'Borde',
                  property: 'border',
                },
                {
                  name: 'Sombra',
                  property: 'box-shadow',
                },
              ],
            },
          ],
        },
        traitManager: {
          appendTo: '#traits',
        },
        panels: {
          defaults: [
            {
              id: 'layers',
              el: '.panel__right',
              resizable: {
                maxDim: 350,
                minDim: 200,
                tc: 0,
                cl: 1,
                cr: 0,
                bc: 0,
                keyWidth: 'flex-basis',
              },
            },
            {
              id: 'panel-switcher',
              el: '.panel__switcher',
              buttons: [
                {
                  id: 'show-layers',
                  active: true,
                  label: 'Capas',
                  command: 'show-layers',
                  togglable: false,
                },
                {
                  id: 'show-style',
                  active: true,
                  label: 'Estilos',
                  command: 'show-styles',
                  togglable: false,
                },
                {
                  id: 'show-traits',
                  active: true,
                  label: 'Propiedades',
                  command: 'show-traits',
                  togglable: false,
                },
              ],
            },
          ],
        },
        deviceManager: {
          devices: [
            {
              name: 'Desktop',
              width: '',
            },
            {
              name: 'Tablet',
              width: '768px',
              widthMedia: '992px',
            },
            {
              name: 'Mobile',
              width: '320px',
              widthMedia: '768px',
            },
          ],
        },
      });

      // Agregar bloque hero-block
      grapesEditor.BlockManager.add('hero-block', {
        label: 'Hero Section',
        category: 'Secciones',
        content: `
          <div class="hero-block" style="
            padding: 80px 20px;
            background-color: #f8f9fa;
            text-align: center;
            min-height: 400px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          ">
            <h1 style="
              font-size: 3rem;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 1rem;
              max-width: 800px;
            ">Bienvenido al Acueducto Municipal</h1>
            <p style="
              font-size: 1.25rem;
              color: #6b7280;
              margin-bottom: 2rem;
              max-width: 600px;
              line-height: 1.6;
            ">Brindamos servicios de agua potable de calidad para nuestra comunidad con compromiso y excelencia.</p>
            <button style="
              background-color: #2563eb;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.3s ease;
            " onmouseover="this.style.backgroundColor='#1d4ed8'" onmouseout="this.style.backgroundColor='#2563eb'">
              Conoce más
            </button>
          </div>
        `,
        attributes: { class: 'fa fa-home' },
      });

      // Agregar otros bloques básicos
      grapesEditor.BlockManager.add('text-block', {
        label: 'Texto',
        category: 'Básicos',
        content: '<div class="text-block"><p>Escribe tu texto aquí...</p></div>',
        attributes: { class: 'fa fa-font' },
      });

      grapesEditor.BlockManager.add('image-block', {
        label: 'Imagen',
        category: 'Básicos',
        content: '<img src="https://via.placeholder.com/400x300" alt="Imagen" style="max-width: 100%; height: auto;">',
        attributes: { class: 'fa fa-image' },
      });

      grapesEditor.BlockManager.add('button-block', {
        label: 'Botón',
        category: 'Básicos',
        content: '<button style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Botón</button>',
        attributes: { class: 'fa fa-hand-pointer-o' },
      });

      // Cargar contenido con estrategia estandarizada
      if (pageData?.grapesData) {
        try {
          const grapesDataParsed = typeof pageData.grapesData === 'string' 
            ? JSON.parse(pageData.grapesData) 
            : pageData.grapesData;
          
          // Cargar proyecto completo de GrapesJS (método preferido)
          if (grapesDataParsed['gjs-components']) {
            grapesEditor.loadProjectData(grapesDataParsed);
            console.info('✅ Loaded complete GrapesJS project data');
          } else if (grapesDataParsed['gjs-html']) {
            // Fallback: cargar solo HTML/CSS
            grapesEditor.setComponents(grapesDataParsed['gjs-html']);
            if (grapesDataParsed['gjs-css']) {
              grapesEditor.setStyle(grapesDataParsed['gjs-css']);
            }
            console.info('✅ Loaded GrapesJS HTML/CSS data');
          }
        } catch (error) {
          console.error('❌ Error loading grapes data:', error);
          // Fallback: intentar cargar desde content si grapesData falla
          if (pageData?.content) {
            // Migración automática: cargar content legacy
            try {
              const content = typeof pageData.content === 'string' 
                ? JSON.parse(pageData.content) 
                : pageData.content;
              
              if (content['gjs-html']) {
                grapesEditor.setComponents(content['gjs-html']);
                if (content['gjs-css']) {
                  grapesEditor.setStyle(content['gjs-css']);
                }
                console.warn('⚠️ Loaded legacy content - will be migrated on next save');
              } else {
                // Cargar plantilla por defecto
                loadDefaultTemplate(grapesEditor);
              }
            } catch (error) {
              console.error('❌ Error loading page content:', error);
              // Cargar plantilla por defecto
              loadDefaultTemplate(grapesEditor);
            }
          } else if (pageData?.html) {
            // Migración para páginas con solo HTML (sin grapesData)
            try {
              console.warn('⚠️ Migrating page with only HTML field to GrapesJS format');
              
              // Cargar HTML directamente en GrapesJS
              grapesEditor.setComponents(pageData.html);
              
              // Si también hay CSS, cargarlo
              if (pageData.css) {
                grapesEditor.setStyle(pageData.css);
              }
              
              console.info('✅ Loaded HTML content for migration - will generate grapesData on save');
            } catch (error) {
              console.error('❌ Error loading HTML content for migration:', error);
              // Cargar plantilla por defecto
              loadDefaultTemplate(grapesEditor);
            }
          } else {
            // Cargar plantilla por defecto
            loadDefaultTemplate(grapesEditor);
          }
        }
      } else {
        // Cargar plantilla por defecto
        loadDefaultTemplate(grapesEditor);
      }

      // Comandos personalizados
      grapesEditor.Commands.add('show-layers', {
        getRowEl(editor: any) { return editor.getContainer().closest('.editor-row'); },
        getLayersEl(row: any) { return row.querySelector('.layers-container'); },
        run(editor: any, sender: any) {
          const lmEl = this.getLayersEl(this.getRowEl(editor));
          lmEl.style.display = '';
        },
        stop(editor: any, sender: any) {
          const lmEl = this.getLayersEl(this.getRowEl(editor));
          lmEl.style.display = 'none';
        },
      });

      grapesEditor.Commands.add('show-styles', {
        getRowEl(editor: any) { return editor.getContainer().closest('.editor-row'); },
        getStyleEl(row: any) { return row.querySelector('.styles-container'); },
        run(editor: any, sender: any) {
          const smEl = this.getStyleEl(this.getRowEl(editor));
          smEl.style.display = '';
        },
        stop(editor: any, sender: any) {
          const smEl = this.getStyleEl(this.getRowEl(editor));
          smEl.style.display = 'none';
        },
      });

      grapesEditor.Commands.add('show-traits', {
        getRowEl(editor: any) { return editor.getContainer().closest('.editor-row'); },
        getTraitsEl(row: any) { return row.querySelector('.traits-container'); },
        run(editor: any, sender: any) {
          const tmEl = this.getTraitsEl(this.getRowEl(editor));
          tmEl.style.display = '';
        },
        stop(editor: any, sender: any) {
          const tmEl = this.getTraitsEl(this.getRowEl(editor));
          tmEl.style.display = 'none';
        },
      });

      // Agregar event listeners para debugging
      console.log('🎧 [GrapesEditor] Agregando event listeners...');
      
      grapesEditor.on('load', () => {
        console.log('✅ [GrapesJS Event] Editor loaded successfully');
      });
      
      grapesEditor.on('storage:start', () => {
        console.log('🔄 [GrapesJS Event] Storage operation started');
      });
      
      grapesEditor.on('storage:end', () => {
        console.log('✅ [GrapesJS Event] Storage operation completed');
      });
      
      grapesEditor.on('storage:error', (error) => {
        console.error('❌ [GrapesJS Event] Storage error:', error);
      });
      
      grapesEditor.on('component:add', (component) => {
        console.log('➕ [GrapesJS Event] Component added:', component);
      });
      
      grapesEditor.on('component:remove', (component) => {
        console.log('➖ [GrapesJS Event] Component removed:', component);
      });
      
      grapesEditor.on('component:update', (component) => {
        console.log('🔄 [GrapesJS Event] Component updated:', component);
      });

      setEditor(grapesEditor);
      console.log('🎯 [GrapesEditor] Editor inicializado completamente');
      
    } catch (error) {
      console.error('💥 [GrapesEditor] Error en initializeEditor:', error);
      const errorInfo = handleError(error, 'GrapesEditor.initializeEditor');
      setError(errorInfo);
    } finally {
      // SIEMPRE salir del loading, independientemente del resultado
      setIsLoading(false);
    }
  };

  const loadDefaultTemplate = (grapesEditor: any) => {
    const defaultContent = `
      <div style="padding: 40px 20px; text-align: center; min-height: 60vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h1 style="font-size: 2.5rem; font-weight: bold; color: white; margin-bottom: 1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
          ${pageData?.title || 'Nueva Página'}
        </h1>
        <p style="font-size: 1.2rem; color: rgba(255,255,255,0.9); margin-bottom: 2rem; max-width: 600px; line-height: 1.6;">
          Comienza a crear tu página arrastrando elementos desde el panel de bloques.
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #374151; margin: 0;">¡Usa el panel lateral para agregar contenido!</p>
        </div>
      </div>
    `;
    
    grapesEditor.setComponents(defaultContent);
    console.info('✅ Initialized with default template');
  };

  const handleSave = async () => {
    if (!editor) return;

    setIsSaving(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const components = editor.getComponents();
      const styles = editor.getStyles();

      // Estructura estandarizada de datos GrapesJS
      const grapesData = {
        'gjs-html': html,
        'gjs-css': css,
        'gjs-components': components,
        'gjs-styles': styles,
      };

      // Guardar con estructura estandarizada
      const response = await fetch(`/api/pages/${pageData?.id}/grapes-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ 
          grapesData: JSON.stringify(grapesData),
          html: html,
          css: css
        }),
      });

      if (response.ok) {
        console.info('Page saved with standardized data structure');
        alert('Página guardada exitosamente');
      } else {
        const errorInfo = handleError({ status: response.status }, 'GrapesEditor.handleSave');
        setError(errorInfo);
        alert(`Error al guardar: ${errorInfo.message}`);
      }
    } catch (error) {
      const errorInfo = handleError(error, 'GrapesEditor.handleSave');
      setError(errorInfo);
      alert(`Error al guardar: ${errorInfo.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (editor) {
      const html = editor.getHtml();
      const css = editor.getCss();
      const previewContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Vista previa</title>
          <style>${css}</style>
        </head>
        <body>${html}</body>
        </html>
      `;
      
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(previewContent);
        previewWindow.document.close();
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando editor..." fullScreen={true} />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={() => {
          setError(null);
          setIsLoading(true);
          initializeEditor();
        }} 
      />
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard/content')}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            <span>Volver</span>
          </button>
          <h1 className="text-lg font-semibold">
            Editor de Página: {pageData?.title || currentSlug}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreview}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Eye size={16} />
            <span>Vista previa</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex editor-row">
        {/* Blocks Panel */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Bloques</h3>
            <div id="blocks"></div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1">
          <div ref={editorRef} className="h-full"></div>
        </div>

        {/* Right Panel */}
        <div className="panel__right w-80 bg-white border-l border-gray-200">
          <div className="panel__switcher border-b border-gray-200"></div>
          
          <div className="layers-container p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Capas</h3>
            <div id="layers"></div>
          </div>
          
          <div className="styles-container p-4" style={{ display: 'none' }}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Estilos</h3>
            <div id="styles"></div>
          </div>
          
          <div className="traits-container p-4" style={{ display: 'none' }}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Propiedades</h3>
            <div id="traits"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrapesEditor;