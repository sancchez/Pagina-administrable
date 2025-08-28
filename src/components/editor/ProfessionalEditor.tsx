import React, { useState, useCallback, useRef, useEffect } from 'react';
import ContentEditableArea from './ContentEditableArea';
import FloatingToolbar from './FloatingToolbar';
import PreviewPane from './PreviewPane';
import { Save, Eye, Code, Undo, Redo, Clock, CheckCircle, AlertCircle, Monitor } from 'lucide-react';
import { EditorHistory } from './EditorHistory';

interface ProfessionalEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  saving: boolean;
  autoSaveInterval?: number;
}

const ProfessionalEditor: React.FC<ProfessionalEditorProps> = ({
  content,
  onChange,
  onSave,
  saving = false,
  autoSaveInterval = 30000
}) => {
  console.log('🎯 ProfessionalEditor: Recibiendo props:', {
    contentLength: content?.length || 0,
    contentPreview: content?.substring(0, 100) + '...',
    hasOnChange: !!onChange,
    hasOnSave: !!onSave,
    saving
  });
  // Estados para UI
  const [viewMode, setViewMode] = useState<'html' | 'preview'>('preview');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Nuevo estado para mantener el contenido renderizado separado del historial
  const [renderContent, setRenderContent] = useState(content);
  const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);

  // Referencias para el historial y auto-guardado
  const historyRef = useRef(new EditorHistory());
  const lastSavedTimeRef = useRef<number>(0);
  const autoSaveTimeoutRef = useRef<number | null>(null);
  const lastContentRef = useRef<string>(content);
  
  // Estados para el sistema de guardado
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');

  // Inicializar historial con contenido inicial
  useEffect(() => {
    console.log('🚀 useEffect inicialización - content:', content?.substring(0, 100) + '...');
    console.log('📚 Estado actual del historial:', historyRef.current.getCurrentState());
    
    if (content && historyRef.current.getCurrentState() !== content) {
      console.log('✅ Inicializando historial con contenido nuevo');
      historyRef.current.addState(content);
      updateHistoryButtons();
      lastContentRef.current = content;
      // Asegurar que renderContent se inicialice con el contenido
      setRenderContent(content);
      console.log('🎯 renderContent inicializado con:', content.substring(0, 100) + '...');
    } else {
      console.log('⏭️ No inicializando historial - contenido igual o vacío');
    }
  }, [content]);

  // Actualizar contenido renderizado cuando cambia el contenido externamente
  useEffect(() => {
    console.log('🔄 useEffect renderContent - isUndoRedoOperation:', isUndoRedoOperation);
    console.log('📝 Contenido a renderizar:', content?.substring(0, 100) + '...');
    
    if (!isUndoRedoOperation) {
      console.log('✅ Actualizando renderContent desde useEffect');
      setRenderContent(content);
    } else {
      console.log('⏭️ No actualizando renderContent desde useEffect - es undo/redo');
    }
  }, [content, isUndoRedoOperation]);

  // Sistema de auto-guardado
  useEffect(() => {
    if (!onSave || !hasUnsavedChanges) return;

    // Limpiar timeout anterior
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Configurar nuevo auto-guardado
    autoSaveTimeoutRef.current = window.setTimeout(async () => {
      if (hasUnsavedChanges && !saving && !autoSaving) {
        await handleAutoSave();
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, autoSaveInterval, saving, autoSaving, onSave]);

  // Detectar cambios no guardados
  useEffect(() => {
    const hasChanges = content !== lastContentRef.current;
    setHasUnsavedChanges(hasChanges);
    
    if (hasChanges) {
      setSaveStatus('unsaved');
    }
  }, [content]);

  // Prevenir salida sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const updateHistoryButtons = () => {
    setCanUndo(historyRef.current.canUndo());
    setCanRedo(historyRef.current.canRedo());
  };

  const handleAutoSave = async () => {
    if (!onSave || autoSaving || saving) return;

    try {
      setAutoSaving(true);
      setSaveStatus('saving');
      
      await onSave();
      
      setLastAutoSave(new Date());
      setHasUnsavedChanges(false);
      lastContentRef.current = content;
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error en auto-guardado:', error);
      setSaveStatus('error');
    } finally {
      setAutoSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (!onSave || saving || autoSaving) return;

    try {
      setSaveStatus('saving');
      await onSave();
      
      setHasUnsavedChanges(false);
      lastContentRef.current = content;
      setSaveStatus('saved');
      
      // Limpiar auto-guardado pendiente
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setSaveStatus('error');
    }
  };

  const handleContentChange = useCallback((newContent: string) => {
    console.log('📝 handleContentChange llamado con:', newContent.substring(0, 100) + '...');
    console.log('🔄 isUndoRedoOperation:', isUndoRedoOperation);
    
    // Solo actualizar el contenido renderizado si no es una operación de undo/redo
    if (!isUndoRedoOperation) {
      console.log('✅ Actualizando renderContent porque no es undo/redo');
      setRenderContent(newContent);
    } else {
      console.log('⏭️ No actualizando renderContent porque es operación undo/redo');
    }
    
    console.log('📤 Llamando onChange con nuevo contenido');
    onChange(newContent);
    
    // Agregar al historial con debounce para evitar demasiadas entradas
    const now = Date.now();
    if (now - lastSavedTimeRef.current > 1000 && !isUndoRedoOperation) {
      console.log('📚 Agregando al historial:', newContent.substring(0, 50) + '...');
      historyRef.current.addState(newContent);
      updateHistoryButtons();
      lastSavedTimeRef.current = now;
    }
  }, [onChange, isUndoRedoOperation]);

  const handleUndo = () => {
    console.log('🔄 Intentando hacer undo, canUndo:', canUndo);
    console.log('📝 Estado actual del historial:', historyRef.current.getCurrentState());
    
    const previousState = historyRef.current.undo();
    console.log('⬅️ Estado anterior obtenido:', previousState);
    
    if (previousState !== null) {
      console.log('✅ Ejecutando undo con estado:', previousState.substring(0, 100) + '...');
      setIsUndoRedoOperation(true);
      setRenderContent(previousState);
      onChange(previousState);
      updateHistoryButtons();
      setTimeout(() => {
        setIsUndoRedoOperation(false);
        console.log('🔄 Undo completado, isUndoRedoOperation resetado');
      }, 100);
    } else {
      console.log('❌ No hay estado anterior para undo');
    }
  };

  const handleRedo = () => {
    console.log('🔄 Intentando hacer redo, canRedo:', canRedo);
    console.log('📝 Estado actual del historial:', historyRef.current.getCurrentState());
    
    const nextState = historyRef.current.redo();
    console.log('➡️ Estado siguiente obtenido:', nextState);
    
    if (nextState !== null) {
      console.log('✅ Ejecutando redo con estado:', nextState.substring(0, 100) + '...');
      setIsUndoRedoOperation(true);
      setRenderContent(nextState);
      onChange(nextState);
      updateHistoryButtons();
      setTimeout(() => {
        setIsUndoRedoOperation(false);
        console.log('🔄 Redo completado, isUndoRedoOperation resetado');
      }, 100);
    } else {
      console.log('❌ No hay estado siguiente para redo');
    }
  };

  const handleSelectionChange = useCallback((sel: Selection | null, element: HTMLElement | null) => {
    setSelection(sel);
    setActiveElement(element);

    if (sel && sel.toString().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleContentChange(e.target.value);
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return autoSaving ? 'Guardando automáticamente...' : 'Guardando...';
      case 'saved':
        return lastAutoSave 
          ? `Guardado automáticamente ${lastAutoSave.toLocaleTimeString()}`
          : 'Guardado';
      case 'error':
        return 'Error al guardar';
      case 'unsaved':
        return 'Cambios sin guardar';
      default:
        return 'Guardar';
    }
  };

  return (
    <div className="relative">
      {/* Header con controles */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`p-2 rounded ${
              canUndo 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-200' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Deshacer (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`p-2 rounded ${
              canRedo 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-200' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="Rehacer (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center px-3 py-1 text-sm rounded ${
              viewMode === 'preview'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Monitor className="h-3 w-3 mr-1" />
            Visual
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center px-3 py-1 text-sm rounded ${
              viewMode === 'code'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Code className="h-3 w-3 mr-1" />
            HTML
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Indicador de estado */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {getSaveStatusIcon()}
            <span className={`${
              saveStatus === 'unsaved' ? 'text-orange-600' :
              saveStatus === 'error' ? 'text-red-600' :
              saveStatus === 'saved' ? 'text-green-600' :
              'text-gray-600'
            }`}>
              {getSaveStatusText()}
            </span>
          </div>

          {/* Botón de guardado manual */}
          {typeof onSave === 'function' && (
            <button
              onClick={handleManualSave}
              disabled={saving || autoSaving || !hasUnsavedChanges}
              className={`flex items-center px-4 py-2 rounded transition-colors ${
                hasUnsavedChanges && !saving && !autoSaving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Guardar manualmente (Ctrl+S)"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving || autoSaving ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>

      {/* Área de edición */}
      <div className="relative">
        {viewMode === 'visual' ? (
          <>
            <ContentEditableArea
              content={renderContent}
              onChange={handleContentChange}
              onSelectionChange={handleSelectionChange}
              className="min-h-[700px]"
            />
            <FloatingToolbar
              selection={selection}
              activeElement={activeElement}
              visible={showToolbar}
              position={toolbarPosition}
            />
          </>
        ) : viewMode === 'preview' ? (
          <PreviewPane
            content={renderContent}
            className="min-h-[700px]"
          />
        ) : (
          <textarea
            value={content}
            onChange={handleCodeChange}
            className="w-full h-[700px] p-6 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm resize-none"
            placeholder="<div>Escribe tu HTML aquí...</div>"
          />
        )}
      </div>
    </div>
  );
};

export default ProfessionalEditor;