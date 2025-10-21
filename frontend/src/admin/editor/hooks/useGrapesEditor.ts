import { useRef, useState, useCallback } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import { getEditorConfig } from '../config/editorConfig';
import { PageData, SelectedInfo } from '../types';
import { normalizeError } from '../../../utils/errorHandler';

export const useGrapesEditor = () => {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorInstanceRef = useRef<Editor | null>(null);
  
  const [editorReady, setEditorReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null);

  const initializeEditor = useCallback((pageData?: PageData) => {
    if (!editorContainerRef.current || editorInstanceRef.current) {
      return;
    }

    console.log('🚀 Inicializando GrapesJS Editor...');

    try {
      const editor = grapesjs.init({
        container: editorContainerRef.current,
        ...getEditorConfig()
      });

      editorInstanceRef.current = editor;

      // Configurar eventos del editor
      editor.on('load', () => {
        console.log('📋 Editor cargado');
        setEditorReady(true);
        
        // Configurar paneles después de la carga
        const panelManager = editor.Panels;
        
        // Limpiar paneles existentes
        panelManager.removePanel('commands');
        panelManager.removePanel('options');
        panelManager.removePanel('views');
        
        // Configurar eventos de selección
        editor.on('component:selected', (component) => {
          const view = component.getView();
          if (view && view.el) {
            const rect = view.el.getBoundingClientRect();
            setSelectedInfo({
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              name: component.getName() || component.get('tagName') || 'Elemento'
            });
          }
        });

        editor.on('component:deselected', () => {
          setSelectedInfo(null);
        });

        // Cargar contenido si existe
        if (pageData) {
          loadContentIntoEditor(editor, pageData);
        }
      });

      editor.on('canvas:ready', () => {
        console.log('🎨 Canvas listo');
        setCanvasReady(true);
      });

    } catch (error) {
      console.error('❌ Error inicializando editor:', error);
      throw normalizeError(error);
    }
  }, []);

  const loadContentIntoEditor = useCallback((editor: Editor, data: PageData) => {
    try {
      console.log('📥 Cargando contenido en editor...');

      // Cargar componentes si existen
      if (data.gjsComponents) {
        try {
          const components = typeof data.gjsComponents === 'string' 
            ? JSON.parse(data.gjsComponents) 
            : data.gjsComponents;
          
          if (Array.isArray(components) && components.length > 0) {
            editor.setComponents(components);
            console.log('✅ Componentes cargados:', components.length);
          }
        } catch (parseError) {
          console.warn('⚠️ Error parseando componentes:', parseError);
        }
      }

      // Cargar estilos si existen
      if (data.gjsStyles) {
        try {
          const styles = typeof data.gjsStyles === 'string' 
            ? JSON.parse(data.gjsStyles) 
            : data.gjsStyles;
          
          if (Array.isArray(styles) && styles.length > 0) {
            editor.setStyle(styles);
            console.log('✅ Estilos cargados:', styles.length);
          }
        } catch (parseError) {
          console.warn('⚠️ Error parseando estilos:', parseError);
        }
      }

      // Fallback: cargar HTML/CSS si no hay componentes GrapesJS
      if (!data.gjsComponents && data.gjsHtml) {
        editor.setComponents(data.gjsHtml);
        console.log('✅ HTML cargado como fallback');
      }

      if (!data.gjsStyles && data.gjsCss) {
        editor.setStyle(data.gjsCss);
        console.log('✅ CSS cargado como fallback');
      }

      setContentLoaded(true);
      console.log('✅ Contenido cargado exitosamente en el editor');

    } catch (error) {
      console.error('❌ Error cargando contenido en editor:', error);
    }
  }, []);

  const getEditorData = useCallback(() => {
    if (!editorInstanceRef.current) return null;

    const editor = editorInstanceRef.current;
    return {
      components: editor.getComponents(),
      styles: editor.getStyle(),
      html: editor.getHtml(),
      css: editor.getCss()
    };
  }, []);

  return {
    editorContainerRef,
    editorInstanceRef,
    editorReady,
    canvasReady,
    contentLoaded,
    selectedInfo,
    initializeEditor,
    loadContentIntoEditor,
    getEditorData
  };
};