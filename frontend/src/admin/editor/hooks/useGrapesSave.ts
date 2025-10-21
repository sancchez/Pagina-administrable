import { useCallback, useRef } from 'react';
import { Editor } from 'grapesjs';
import HttpClient from '../../../utils/http';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseGrapesSaveProps {
  editorInstanceRef: React.RefObject<Editor | null>;
  slug: string;
  onSaveStatusChange: (status: SaveStatus) => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
}

export const useGrapesSave = ({
  editorInstanceRef,
  slug,
  onSaveStatusChange,
  onSaveSuccess,
  onSaveError
}: UseGrapesSaveProps) => {
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para obtener datos del editor
  const getEditorData = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return null;

    try {
      const components = editor.getComponents();
      const styles = editor.getStyles();
      const html = editor.getHtml();
      const css = editor.getCss();

      return {
        gjsComponents: JSON.stringify(components),
        gjsStyles: JSON.stringify(styles),
        gjsHtml: html,
        gjsCss: css,
        html: html,
        css: css
      };
    } catch (error) {
      console.error('❌ Error obteniendo datos del editor:', error);
      return null;
    }
  }, [editorInstanceRef]);

  // Función para guardar página
  const savePage = useCallback(async (isPublish = false) => {
    const editor = editorInstanceRef.current;
    if (!editor) {
      console.warn('⚠️ Editor no disponible para guardar');
      return false;
    }

    try {
      onSaveStatusChange('saving');
      console.log(`💾 ${isPublish ? 'Publicando' : 'Guardando'} página: ${slug}`);

      const editorData = getEditorData();
      if (!editorData) {
        throw new Error('No se pudieron obtener los datos del editor');
      }

      const payload = {
        slug,
        title: slug,
        ...editorData,
        published: isPublish
      };

      const response = await HttpClient.put(`/api/pages/${slug}`, payload);

      if (response.ok) {
        onSaveStatusChange('saved');
        console.log(`✅ Página ${isPublish ? 'publicada' : 'guardada'} exitosamente`);
        onSaveSuccess?.();
        
        // Resetear estado después de 2 segundos
        setTimeout(() => {
          onSaveStatusChange('idle');
        }, 2000);
        
        return true;
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error ${isPublish ? 'publicando' : 'guardando'} página:`, error);
      onSaveStatusChange('error');
      onSaveError?.(error instanceof Error ? error.message : 'Error desconocido');
      
      // Resetear estado después de 3 segundos
      setTimeout(() => {
        onSaveStatusChange('idle');
      }, 3000);
      
      return false;
    }
  }, [editorInstanceRef, slug, getEditorData, onSaveStatusChange, onSaveSuccess, onSaveError]);

  // Función para publicar página
  const publishPage = useCallback(async () => {
    return await savePage(true);
  }, [savePage]);

  // Función para programar auto-guardado
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Ejecutando auto-guardado...');
      savePage(false);
    }, 5000); // Auto-guardar después de 5 segundos de inactividad
  }, [savePage]);

  // Función para cancelar auto-guardado
  const cancelAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
  }, []);

  return {
    savePage,
    publishPage,
    scheduleAutoSave,
    cancelAutoSave,
    getEditorData
  };
};