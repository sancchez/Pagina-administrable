import { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from 'grapesjs';
import HttpClient from '../../../utils/http';

interface PageData {
  id?: number;
  title: string;
  slug: string;
  content?: string;
  gjsHtml?: string;
  gjsCss?: string;
  gjsComponents?: string | any[];
  gjsStyles?: string | any[];
  scripts?: string;
  published?: boolean;
}

interface UseGrapesDataProps {
  editorInstanceRef: React.RefObject<Editor | null>;
  slug: string;
}

export const useGrapesData = ({ editorInstanceRef, slug }: UseGrapesDataProps) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDataLoadedRef = useRef(false);

  // Función para cargar datos de la página
  const loadPageData = useCallback(async () => {
    if (isDataLoadedRef.current) {
      console.log('📋 Datos ya cargados, omitiendo carga duplicada');
      return pageData;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`📥 Cargando datos para página: ${slug}`);
      
      const response = await HttpClient.get(`/api/pages/${slug}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Datos de página cargados:', data);
        
        setPageData(data);
        isDataLoadedRef.current = true;
        return data;
      } else if (response.status === 404) {
        // Página nueva - crear datos por defecto
        console.log('📄 Página nueva, creando datos por defecto');
        const defaultData: PageData = {
          title: slug,
          slug: slug,
          gjsHtml: '',
          gjsCss: '',
          gjsComponents: '[]',
          gjsStyles: '[]',
          published: false
        };
        
        setPageData(defaultData);
        isDataLoadedRef.current = true;
        return defaultData;
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error cargando datos de página:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [slug, pageData]);

  // Función para cargar contenido en el editor
  const loadContentIntoEditor = useCallback(async (data?: PageData) => {
    const editor = editorInstanceRef.current;
    if (!editor) {
      console.warn('⚠️ Editor no disponible para cargar contenido');
      return false;
    }

    try {
      const dataToLoad = data || pageData;
      if (!dataToLoad) {
        console.warn('⚠️ No hay datos para cargar en el editor');
        return false;
      }

      console.log('🔄 Cargando contenido en editor...');

      // Limpiar editor primero
      editor.setComponents('');
      editor.setStyle('');

      // Cargar componentes si existen
      if (dataToLoad.gjsComponents) {
        try {
          const components = typeof dataToLoad.gjsComponents === 'string' 
            ? JSON.parse(dataToLoad.gjsComponents) 
            : dataToLoad.gjsComponents;
          
          if (Array.isArray(components) && components.length > 0) {
            editor.setComponents(components);
            console.log('✅ Componentes cargados:', components.length);
          }
        } catch (parseError) {
          console.warn('⚠️ Error parseando componentes:', parseError);
        }
      }

      // Cargar estilos si existen
      if (dataToLoad.gjsStyles) {
        try {
          const styles = typeof dataToLoad.gjsStyles === 'string' 
            ? JSON.parse(dataToLoad.gjsStyles) 
            : dataToLoad.gjsStyles;
          
          if (Array.isArray(styles) && styles.length > 0) {
            editor.setStyle(styles);
            console.log('✅ Estilos cargados:', styles.length);
          }
        } catch (parseError) {
          console.warn('⚠️ Error parseando estilos:', parseError);
        }
      }

      // Fallback: cargar HTML/CSS si no hay componentes GrapesJS
      if (!dataToLoad.gjsComponents && dataToLoad.gjsHtml) {
        editor.setComponents(dataToLoad.gjsHtml);
        console.log('✅ HTML cargado como fallback');
      }

      if (!dataToLoad.gjsStyles && dataToLoad.gjsCss) {
        editor.setStyle(dataToLoad.gjsCss);
        console.log('✅ CSS cargado como fallback');
      }

      console.log('✅ Contenido cargado exitosamente en el editor');
      return true;

    } catch (error) {
      console.error('❌ Error cargando contenido en editor:', error);
      return false;
    }
  }, [editorInstanceRef, pageData]);

  // Función para refrescar datos
  const refreshData = useCallback(() => {
    isDataLoadedRef.current = false;
    setPageData(null);
    setError(null);
    return loadPageData();
  }, [loadPageData]);

  // Función para actualizar datos localmente
  const updatePageData = useCallback((updates: Partial<PageData>) => {
    setPageData(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return {
    pageData,
    isLoading,
    error,
    loadPageData,
    loadContentIntoEditor,
    refreshData,
    updatePageData
  };
};