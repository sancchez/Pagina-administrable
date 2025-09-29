import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { normalizeError } from '../utils/errorHandler';

interface PageData {
  id: string;
  title: string;
  slug: string;
  grapesData?: any;
  content?: string;
  html?: string;
  css?: string;
}

interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
}

const GrapesEditor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // ⚡ CORREGIDO: slug en lugar de pageId
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos de la página
  useEffect(() => {
    const loadPageData = async () => {
      if (!slug) {
        console.log('❌ Slug no proporcionado:', { slug });
        setError({ message: 'Slug de página no proporcionado' });
        setLoading(false);
        return;
      }

      console.log('🔍 Cargando datos para slug:', slug);

      try {
        // ⚡ CORREGIDO: Usar endpoint por slug
        const response = await fetch(`/api/pages/slug/${slug}`);
        console.log('🌐 Respuesta de API:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.log('📄 Página no encontrada, creando estructura por defecto');
            // Crear estructura por defecto para páginas nuevas
            const defaultPage: PageData = {
              id: '', // Se asignará al guardar
              title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              slug: slug,
              grapesData: null,
              content: null,
              html: null,
              css: null
            };
            setPageData(defaultPage);
            setLoading(false);
            return;
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('📦 Datos recibidos:', {
          success: result.success,
          hasData: !!result.data,
          hasPage: !!result.data?.page
        });

        // ⚡ CORREGIDO: Extraer página del formato anidado del backend
        const page = result.data?.page;
        if (!page) {
          throw new Error('Datos de página no encontrados en la respuesta');
        }

        console.log('✅ Página cargada:', {
          id: page.id,
          title: page.title,
          slug: page.slug,
          hasGrapesData: !!page.grapesData,
          hasContent: !!page.content
        });

        setPageData(page);
      } catch (error) {
        console.error('❌ Error cargando página:', error);
        const errorInfo = normalizeError(error);
        setError(errorInfo);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [slug]); // ⚡ CORREGIDO: slug en lugar de pageId

  // Inicializar editor
  useEffect(() => {
    console.log('🔄 useEffect inicialización - Estado:', {
      hasRef: !!editorRef.current,
      hasPageData: !!pageData,
      hasEditor: !!editor,
      pageDataId: pageData?.id
    });

    if (!editorRef.current || !pageData || editor) {
      console.log('⏸️ Saltando inicialización:', {
        noRef: !editorRef.current,
        noPageData: !pageData,
        editorExists: !!editor
      });
      return;
    }

    console.log('🛠️ Inicializando GrapesJS con pageData:', {
      id: pageData.id,
      title: pageData.title,
      hasGrapesData: !!pageData.grapesData,
      hasContent: !!pageData.content
    });

    const initializeEditor = () => {
      try {
        console.log('🚀 Creando instancia de GrapesJS...');
        
        const grapesEditor = grapesjs.init({
          container: editorRef.current!,
          height: '100vh',
          width: 'auto',
          plugins: [gjsPresetWebpage],
          pluginsOpts: {
            [gjsPresetWebpage]: {
              blocksBasicOpts: {
                blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'video'],
                flexGrid: 1,
              },
              blocks: ['link-block', 'quote', 'text-basic'],
            },
          },
          storageManager: false,
          avoidInlineStyle: true,
          canvas: {
            styles: [
              'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
            ],
          },
          styleManager: {
            appendTo: '.styles-container',
            sectors: [{
              name: 'Dimensiones',
              open: false,
              buildProps: ['width', 'min-height', 'padding'],
              properties: [{
                type: 'integer',
                name: 'El ancho',
                property: 'width',
                units: ['px', '%'],
                defaults: 'auto',
                min: 0,
              }]
            }, {
              name: 'Tipografía',
              open: false,
              buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height'],
              properties: [{
                name: 'Font',
                property: 'font-family'
              }, {
                name: 'Peso',
                property: 'font-weight'
              }, {
                name: 'Tamaño de fuente',
                property: 'font-size',
                units: ['px', 'em', 'rem'],
              }]
            }]
          },
        });

        console.log('✅ Instancia GrapesJS creada, configurando comandos...');

        // Configurar comandos personalizados
        grapesEditor.Commands.add('show-layers', {
          getRowEl(editor) { return editor.getContainer().closest('.editor-row'); },
          getLayersEl(row) { return row.querySelector('.layers-container'); },
          run(editor, sender) {
            const lmEl = this.getLayersEl(this.getRowEl(editor));
            lmEl.style.display = '';
          },
          stop(editor, sender) {
            const lmEl = this.getLayersEl(this.getRowEl(editor));
            lmEl.style.display = 'none';
          },
        });

        grapesEditor.Commands.add('show-styles', {
          getRowEl(editor) { return editor.getContainer().closest('.editor-row'); },
          getStyleEl(row) { return row.querySelector('.styles-container'); },
          run(editor, sender) {
            const smEl = this.getStyleEl(this.getRowEl(editor));
            smEl.style.display = '';
          },
          stop(editor, sender) {
            const smEl = this.getStyleEl(this.getRowEl(editor));
            smEl.style.display = 'none';
          },
        });

        console.log('🎨 Comandos configurados, cargando contenido...');

        // Cargar contenido según disponibilidad
        loadContent(grapesEditor);

        console.log('💾 Estableciendo editor en estado...');
        setEditor(grapesEditor);
        console.log('✅ Editor GrapesJS inicializado correctamente');

      } catch (error) {
        console.error('❌ Error inicializando editor:', error);
        const errorInfo = normalizeError(error);
        setError(errorInfo);
      }
    };

    const loadContent = (grapesEditor: Editor) => {
      try {
        console.log('📋 Iniciando carga de contenido...');
        
        // Estrategia 1: Si hay grapesData, cargar proyecto completo
        if (pageData.grapesData) {
          console.log('📦 Cargando desde grapesData:', typeof pageData.grapesData);
          
          let parsedData;
          if (typeof pageData.grapesData === 'string') {
            console.log('🔄 Parseando grapesData desde string...');
            parsedData = JSON.parse(pageData.grapesData);
          } else {
            console.log('📋 Usando grapesData como objeto...');
            parsedData = pageData.grapesData;
          }
          
          console.log('📦 Datos parseados:', parsedData);
          grapesEditor.loadProjectData(parsedData);
          console.log('✅ grapesData cargado exitosamente');
          return;
        }

        // Estrategia 2: Si hay content, cargar como componentes
        if (pageData.content) {
          console.log('📜 Cargando desde content:', pageData.content.substring(0, 100) + '...');
          grapesEditor.setComponents(pageData.content);
          console.log('✅ content cargado exitosamente');
          return;
        }

        // Estrategia 3: Fallback - página vacía con título
        console.log('🆕 Creando página nueva con título:', pageData.title);
        const defaultContent = `
          <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
            <h1 style="color: #333; margin-bottom: 20px;">${pageData.title}</h1>
            <p style="color: #666; font-size: 16px;">Comienza a editar tu página aquí</p>
          </div>
        `;
        grapesEditor.setComponents(defaultContent);
        console.log('✅ Página nueva creada exitosamente');

      } catch (error) {
        console.error('❌ Error cargando contenido:', error);
        console.log('🚨 Aplicando fallback final...');
        // Fallback final
        grapesEditor.setComponents(`
          <div style="padding: 20px; text-align: center; color: #999;">
            <p>Error cargando contenido. Página en blanco.</p>
          </div>
        `);
        console.log('⚠️ Fallback aplicado');
      }
    };

    initializeEditor();

    // Cleanup
    return () => {
      console.log('🧹 Limpiando editor...');
      if (editor) {
        editor.destroy();
      }
    };
  }, [pageData]); // ⚡ CORREGIDO: Solo pageData como dependencia, no editor

  // Guardar página
  const handleSave = async () => {
    if (!editor || !pageData) return;

    setIsSaving(true);
    try {
      const grapesData = editor.store();
      const html = editor.getHtml();
      const css = editor.getCss();

      const payload = {
        grapesData,
        html,
        css,
        content: html // Para compatibilidad
      };

      console.log('💾 Guardando página...', { pageId, payload });

      const response = await fetch(`/api/pages/${pageData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Página guardada exitosamente:', result);
        
        // Actualizar datos locales
        setPageData(prev => ({
          ...prev!,
          grapesData: payload.grapesData,
          html: payload.html,
          css: payload.css
        }));
        
        alert('Página guardada exitosamente');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error guardando página:', error);
      const errorInfo = normalizeError(error);
      setError(errorInfo);
      alert(`Error al guardar: ${errorInfo.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Previsualizar página
  const handlePreview = () => {
    if (!editor) return;
    
    const html = editor.getHtml();
    const css = editor.getCss();
    
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Preview - ${pageData?.title}</title>
            <style>${css}</style>
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" rel="stylesheet">
          </head>
          <body>${html}</body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando editor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error.message}</div>
          <button 
            onClick={() => navigate('/admin/pages')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver a Páginas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/pages')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            ← Volver
          </button>
          <h1 className="text-lg font-semibold">
            Editando: {pageData?.title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!editor}
          >
            Vista Previa
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !editor}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 editor-row">
        <div ref={editorRef} className="h-full" />
        <div className="layers-container" style={{ display: 'none' }} />
        <div className="styles-container" style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default GrapesEditor;