import { useState, useCallback } from 'react';
import { SaveStatus, PageData, ApiResponse } from '../types';
import HttpClient from '../../../utils/http';

export const useSaveManager = () => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSave = useCallback(async (pageData: PageData, editorData: any) => {
    try {
      setSaveStatus('saving');
      
      const saveData = {
        gjsComponents: JSON.stringify(editorData.components),
        gjsStyles: JSON.stringify(editorData.styles),
        gjsHtml: editorData.html,
        gjsCss: editorData.css,
        html: editorData.html,
        css: editorData.css
      };

      const response = await HttpClient.put<ApiResponse<PageData>>(
        `/api/pages/${pageData.id}`,
        saveData
      );

      if (response.data.success) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        console.log('✅ Página guardada exitosamente');
        return true;
      } else {
        throw new Error(response.data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('❌ Error guardando:', error);
      setSaveStatus('error');
      return false;
    }
  }, []);

  const handlePublish = useCallback(async (pageData: PageData, editorData: any) => {
    setIsPublishing(true);
    const success = await handleSave(pageData, editorData);
    setIsPublishing(false);
    return success;
  }, [handleSave]);

  const getSaveStatusDisplay = useCallback(() => {
    switch (saveStatus) {
      case 'saving':
        return { text: 'Guardando...', color: 'text-blue-600' };
      case 'saved':
        return { text: 'Guardado', color: 'text-green-600' };
      case 'error':
        return { text: 'Error al guardar', color: 'text-red-600' };
      default:
        return { text: 'Listo para editar', color: 'text-gray-500' };
    }
  }, [saveStatus]);

  return {
    saveStatus,
    lastSaved,
    isPublishing,
    handleSave,
    handlePublish,
    getSaveStatusDisplay
  };
};