/**
 * Hook optimizado para la gestión de estado del editor
 * Centraliza y optimiza el manejo del estado del editor visual
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import { PageData, BlockData } from '../types/blocks';
import { pageService } from '../services/pageService';
import { dataMigration } from '../utils/dataMigration';
import { componentCache } from '../utils/componentCache';

interface EditorState {
  // Estado de la página
  pageData: PageData | null;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  
  // Estado de la UI
  isPreviewMode: boolean;
  isCollaborationEnabled: boolean;
  selectedElementId: string | null;
  
  // Estado de notificaciones
  notification: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null;
  
  // Estado de herramientas
  activePanel: 'layers' | 'settings' | 'collaboration' | null;
  showToolbox: boolean;
  showElementToolbar: boolean;
}

interface EditorActions {
  // Acciones de página
  loadPageData: (pageId: string) => Promise<void>;
  savePageData: () => Promise<void>;
  resetPage: () => void;
  
  // Acciones de UI
  togglePreview: () => void;
  toggleCollaboration: () => void;
  setSelectedElement: (elementId: string | null) => void;
  
  // Acciones de notificaciones
  showNotification: (message: string, type: EditorState['notification']['type']) => void;
  clearNotification: () => void;
  
  // Acciones de herramientas
  setActivePanel: (panel: EditorState['activePanel']) => void;
  toggleToolbox: () => void;
  toggleElementToolbar: () => void;
}

const initialState: EditorState = {
  pageData: null,
  isLoading: false,
  isSaving: false,
  hasUnsavedChanges: false,
  isPreviewMode: false,
  isCollaborationEnabled: false,
  selectedElementId: null,
  notification: null,
  activePanel: null,
  showToolbox: true,
  showElementToolbar: true,
};

export const useEditorState = (pageId?: string): [EditorState, EditorActions] => {
  const [state, setState] = useState<EditorState>(initialState);
  const { actions, query } = useEditor();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedStateRef = useRef<string>('');

  // Función para crear una página vacía
  const createEmptyPage = useCallback((): BlockData => {
    console.log('📄 [EditorState] Creating empty page');
    return {
      ROOT: {
        type: { resolvedName: 'ContainerComponent' },
        isCanvas: true,
        props: {
          className: 'min-h-screen bg-white',
          style: {
            padding: '20px',
            minHeight: '100vh'
          }
        },
        displayName: 'Container',
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {}
      }
    };
  }, []);

  // Cargar datos de la página
  const loadPageData = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, notification: null }));
    
    try {
      console.log(`📥 [EditorState] Loading page data for ID: ${id}`);
      
      // Verificar cache primero
      const cachedData = componentCache.get(`page-${id}`);
      if (cachedData) {
        console.log('⚡ [EditorState] Using cached page data');
        setState(prev => ({ 
          ...prev, 
          pageData: cachedData, 
          isLoading: false 
        }));
        
        // Cargar en el editor
        if (cachedData.craftData) {
          const craftData = typeof cachedData.craftData === 'string' 
            ? JSON.parse(cachedData.craftData) 
            : cachedData.craftData;
          actions.deserialize(craftData);
        }
        return;
      }

      // Cargar desde el servidor
      const response = await pageService.getPage(id);
      let pageData: PageData;
      let craftData: BlockData;

      if (response.craftData) {
        // Usar datos de Craft.js si están disponibles
        craftData = typeof response.craftData === 'string' 
          ? JSON.parse(response.craftData) 
          : response.craftData;
        
        pageData = {
          id: response.id,
          title: response.title,
          slug: response.slug,
          craftData: response.craftData,
          draftJson: [craftData],
          publishedJson: response.published ? [craftData] : []
        };
      } else if (response.draft_json || response.published_json) {
        // Migrar desde formato legacy
        console.log('🔄 [EditorState] Migrating from legacy format');
        const jsonData = response.draft_json || response.published_json;
        craftData = await dataMigration.migrateToNewFormat(JSON.parse(jsonData));
        
        pageData = {
          id: response.id,
          title: response.title,
          slug: response.slug,
          craftData: JSON.stringify(craftData),
          draftJson: [craftData],
          publishedJson: response.published ? [craftData] : []
        };
      } else {
        // Crear página vacía
        console.log('📝 [EditorState] Creating new empty page');
        craftData = createEmptyPage();
        
        pageData = {
          id: response.id,
          title: response.title,
          slug: response.slug,
          craftData: JSON.stringify(craftData),
          draftJson: [craftData],
          publishedJson: []
        };
      }

      // Guardar en cache
      componentCache.set(`page-${id}`, pageData);
      
      // Actualizar estado
      setState(prev => ({ 
        ...prev, 
        pageData, 
        isLoading: false,
        hasUnsavedChanges: false
      }));

      // Cargar en el editor
      actions.deserialize(craftData);
      lastSavedStateRef.current = JSON.stringify(craftData);

      console.log('✅ [EditorState] Page data loaded successfully');
      
    } catch (error) {
      console.error('❌ [EditorState] Error loading page data:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        notification: {
          message: 'Error al cargar la página',
          type: 'error'
        }
      }));
    }
  }, [actions, createEmptyPage]);

  // Guardar datos de la página
  const savePageData = useCallback(async () => {
    if (!state.pageData || state.isSaving) return;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      console.log('💾 [EditorState] Saving page data');
      
      const currentState = query.serialize();
      const craftDataString = JSON.stringify(currentState);

      // Verificar si hay cambios reales
      if (craftDataString === lastSavedStateRef.current) {
        console.log('ℹ️ [EditorState] No changes to save');
        setState(prev => ({ 
          ...prev, 
          isSaving: false,
          hasUnsavedChanges: false
        }));
        return;
      }

      const updatedPageData = {
        ...state.pageData,
        craftData: craftDataString,
        draftJson: [currentState]
      };

      await pageService.updatePage(state.pageData.id, {
        craftData: craftDataString
      });

      // Actualizar cache
      componentCache.set(`page-${state.pageData.id}`, updatedPageData);
      
      setState(prev => ({ 
        ...prev, 
        pageData: updatedPageData,
        isSaving: false,
        hasUnsavedChanges: false,
        notification: {
          message: 'Página guardada correctamente',
          type: 'success'
        }
      }));

      lastSavedStateRef.current = craftDataString;
      console.log('✅ [EditorState] Page saved successfully');

    } catch (error) {
      console.error('❌ [EditorState] Error saving page:', error);
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        notification: {
          message: 'Error al guardar la página',
          type: 'error'
        }
      }));
    }
  }, [state.pageData, state.isSaving, query]);

  // Auto-guardar cuando hay cambios
  useEffect(() => {
    if (!state.pageData) return;

    const handleStateChange = () => {
      const currentState = JSON.stringify(query.serialize());
      const hasChanges = currentState !== lastSavedStateRef.current;
      
      if (hasChanges !== state.hasUnsavedChanges) {
        setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
      }

      // Auto-guardar después de 2 segundos de inactividad
      if (hasChanges) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
          savePageData();
        }, 2000);
      }
    };

    // Escuchar cambios en el editor
    const unsubscribe = query.subscribe(handleStateChange);
    
    return () => {
      unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.pageData, state.hasUnsavedChanges, query, savePageData]);

  // Acciones del editor
  const actions_editor: EditorActions = {
    loadPageData,
    savePageData,
    
    resetPage: useCallback(() => {
      const emptyPage = createEmptyPage();
      actions.deserialize(emptyPage);
      setState(prev => ({ 
        ...prev, 
        hasUnsavedChanges: true,
        notification: {
          message: 'Página reiniciada',
          type: 'info'
        }
      }));
    }, [actions, createEmptyPage]),

    togglePreview: useCallback(() => {
      setState(prev => ({ 
        ...prev, 
        isPreviewMode: !prev.isPreviewMode 
      }));
    }, []),

    toggleCollaboration: useCallback(() => {
      setState(prev => ({ 
        ...prev, 
        isCollaborationEnabled: !prev.isCollaborationEnabled 
      }));
    }, []),

    setSelectedElement: useCallback((elementId: string | null) => {
      setState(prev => ({ ...prev, selectedElementId: elementId }));
    }, []),

    showNotification: useCallback((message: string, type: EditorState['notification']['type']) => {
      setState(prev => ({ 
        ...prev, 
        notification: { message, type } 
      }));
      
      // Auto-limpiar notificación después de 5 segundos
      setTimeout(() => {
        setState(prev => ({ ...prev, notification: null }));
      }, 5000);
    }, []),

    clearNotification: useCallback(() => {
      setState(prev => ({ ...prev, notification: null }));
    }, []),

    setActivePanel: useCallback((panel: EditorState['activePanel']) => {
      setState(prev => ({ ...prev, activePanel: panel }));
    }, []),

    toggleToolbox: useCallback(() => {
      setState(prev => ({ ...prev, showToolbox: !prev.showToolbox }));
    }, []),

    toggleElementToolbar: useCallback(() => {
      setState(prev => ({ ...prev, showElementToolbar: !prev.showElementToolbar }));
    }, [])
  };

  // Cargar página inicial
  useEffect(() => {
    if (pageId && !state.pageData && !state.isLoading) {
      loadPageData(pageId);
    }
  }, [pageId, state.pageData, state.isLoading, loadPageData]);

  return [state, actions_editor];
};

export default useEditorState;