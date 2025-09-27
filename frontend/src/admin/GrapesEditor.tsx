import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, ArrowLeft } from 'lucide-react';

// Definimos el tipo para GrapesJS
declare global {
  interface Window {
    grapesjs: any;
  }
}

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
  
  const currentSlug = pageSlug || slug || 'home';

  // Cargar GrapesJS desde CDN
  useEffect(() => {
    const loadGrapesJS = async () => {
      // Cargar CSS
      if (!document.querySelector('link[href*="grapesjs"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css';
        document.head.appendChild(cssLink);
      }

      // Cargar JS
      if (!window.grapesjs) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/grapesjs';
        script.onload = () => initializeEditor();
        document.head.appendChild(script);
      } else {
        initializeEditor();
      }
    };

    loadGrapesJS();
  }, []);

  const initializeEditor = async () => {
    if (!editorRef.current || !window.grapesjs) return;

    try {
      // Cargar datos de la página
      await loadPageData();

      const grapesEditor = window.grapesjs.init({
        container: editorRef.current,
        height: '100vh',
        width: 'auto',
        storageManager: false, // Manejamos el storage manualmente
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
                    { value: '100', name: 'Thin' },
                    { value: '300', name: 'Light' },
                    { value: '400', name: 'Normal' },
                    { value: '500', name: 'Medium' },
                    { value: '600', name: 'Semi Bold' },
                    { value: '700', name: 'Bold' },
                    { value: '900', name: 'Black' },
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
                    { value: 'left', name: 'Izquierda' },
                    { value: 'center', name: 'Centro' },
                    { value: 'right', name: 'Derecha' },
                    { value: 'justify', name: 'Justificado' },
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

      // Cargar contenido si existe
      if (pageData?.content) {
        try {
          const content = typeof pageData.content === 'string' 
            ? JSON.parse(pageData.content) 
            : pageData.content;
          
          if (content['gjs-html']) {
            grapesEditor.setComponents(content['gjs-html']);
          }
          if (content['gjs-css']) {
            grapesEditor.setStyle(content['gjs-css']);
          }
        } catch (error) {
          console.error('Error loading page content:', error);
        }
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

      setEditor(grapesEditor);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing GrapesJS:', error);
      setIsLoading(false);
    }
  };

  const loadPageData = async () => {
    try {
      const response = await fetch(`/api/pages/slug/${currentSlug}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setPageData(result.data.page);
      }
    } catch (error) {
      console.error('Error loading page data:', error);
    }
  };

  const handleSave = async () => {
    if (!editor) return;

    setIsSaving(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const components = editor.getComponents();
      const styles = editor.getStyles();

      const grapesData = {
        'gjs-html': html,
        'gjs-css': css,
        'gjs-components': components,
        'gjs-styles': styles,
      };

      // Guardar datos de GrapesJS
      const response = await fetch(`/api/pages/${pageData?.id}/grapes-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ grapesData: JSON.stringify(grapesData) }),
      });

      if (response.ok) {
        // También guardar el HTML compilado
        await fetch(`/api/pages/${pageData?.id}/content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ content: html }),
        });

        alert('Página guardada exitosamente');
      } else {
        throw new Error('Error al guardar la página');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Error al guardar la página');
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando editor...</div>
      </div>
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