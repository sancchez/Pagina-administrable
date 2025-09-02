import React, { useState, useCallback, useRef, useEffect } from 'react';
import FloatingToolbar from './FloatingToolbar';
import PreviewPane from './PreviewPane';
import PositioningGuide from './PositioningGuide';
import HitboxManager from './HitboxManager';
import GroupManager from './GroupManager';
import ContextMenu from './ContextMenu';
import BackgroundEditor from './BackgroundEditor';
import SheetFormatSelector from './SheetFormatSelector';
import ManualSaveButton from './text-editing/components/ManualSaveButton';
import GradientTextEditor from './GradientTextEditor';
import { Save, Code, Undo, Redo, Clock, CheckCircle, AlertCircle, Monitor, Ruler, Palette } from 'lucide-react';
import { EditorHistory } from './EditorHistory';
import { VersionManager } from './VersionManager';

interface ProfessionalEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  saving: boolean;
}

const ProfessionalEditor: React.FC<ProfessionalEditorProps> = ({
  content,
  onChange,
  onSave,
  saving = false
}) => {
  console.log('🎯 ProfessionalEditor: Recibiendo props:', {
    contentLength: content?.length || 0,
    contentPreview: content?.substring(0, 100) + '...',
    hasOnChange: !!onChange,
    hasOnSave: !!onSave,
    saving
  });
  // Estados para UI
  const [viewMode, setViewMode] = useState<'visual' | 'html'>('visual');
  const [selection] = useState<Selection | null>(null);
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition] = useState({ x: 0, y: 0 });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Nuevo estado para mantener el contenido renderizado separado del historial
  const [renderContent, setRenderContent] = useState(content);
  const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);

  // Referencias para el historial, auto-guardado y versiones
  const historyRef = useRef(new EditorHistory());
  const versionManagerRef = useRef(new VersionManager(10));
  const lastContentRef = useRef<string>(content);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  // Estados para el sistema de guardado
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  
  // Estados para el modal de confirmación
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  // Estados para el sistema de versiones (solo para uso interno)
  // Nota: El modal de versiones se removió para evitar duplicación con PageVersionManager
  
  // Estados para el sistema de guías de posicionamiento
  const [showPositioningGuide, setShowPositioningGuide] = useState(false);
  
  // Estados para el editor de fondo
  const [showBackgroundEditor, setShowBackgroundEditor] = useState(false);
  
  // Estados para el editor de gradientes
  const [showGradientEditor, setShowGradientEditor] = useState(false);
  const [gradientEditorPosition, setGradientEditorPosition] = useState({ x: 0, y: 0 });
  const [selectedGradientElement, setSelectedGradientElement] = useState<HTMLElement | null>(null);

  // Inicializar historial con contenido inicial
  useEffect(() => {
    console.log('🚀 useEffect inicialización - content:', content?.substring(0, 100) + '...');
    console.log('📚 Estado actual del historial:', historyRef.current.getCurrentState());
    
    // Siempre inicializar renderContent con el contenido actual
    setRenderContent(content || '');
    console.log('🎯 renderContent inicializado con:', (content || '').substring(0, 100) + '...');
    
    if (content && historyRef.current.getCurrentState() !== content) {
      console.log('✅ Inicializando historial con contenido nuevo');
      historyRef.current.addState(content);
      updateHistoryButtons();
      lastContentRef.current = content;
    } else {
      console.log('⏭️ No inicializando historial - contenido igual o vacío');
      // Aún así, actualizar lastContentRef para evitar problemas
      lastContentRef.current = content || '';
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



  // Detectar cambios no guardados
  useEffect(() => {
    const hasChanges = content !== lastContentRef.current;
    console.log('🔍 Detectando cambios - content:', content?.substring(0, 50) + '...', 'lastContent:', lastContentRef.current?.substring(0, 50) + '...', 'hasChanges:', hasChanges);
    
    setHasUnsavedChanges(hasChanges);
    
    if (hasChanges) {
      setSaveStatus('unsaved');
      console.log('📝 Estado cambiado a unsaved');
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



  const handleManualSave = async () => {
    if (!onSave || saving) return;

    try {
      setSaveStatus('saving');
      
      // Crear versión interna para el historial local (sin UI)
      versionManagerRef.current.createCurrentConfigVersion(content);
      
      await onSave();
      
      setHasUnsavedChanges(false);
      lastContentRef.current = content;
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error al guardar:', error);
      setSaveStatus('error');
    }
  };



  const handleContentChange = useCallback((newContent: string, immediate: boolean = false) => {
    console.log('📝 handleContentChange llamado con:', newContent.substring(0, 100) + '...');
    console.log('🔄 isUndoRedoOperation:', isUndoRedoOperation, 'immediate:', immediate);
    
    // Solo actualizar el contenido renderizado si no es una operación de undo/redo
    if (!isUndoRedoOperation) {
      console.log('✅ Actualizando renderContent porque no es undo/redo');
      setRenderContent(newContent);
    } else {
      console.log('⏭️ No actualizando renderContent porque es operación undo/redo');
    }
    
    console.log('📤 Llamando onChange con nuevo contenido');
    onChange(newContent);
    
    // Agregar al historial usando el sistema mejorado
    if (!isUndoRedoOperation) {
      console.log('📚 Agregando al historial:', immediate ? 'inmediato' : 'con debounce', newContent.substring(0, 50) + '...');
      historyRef.current.addState(newContent, immediate);
      updateHistoryButtons();
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S for manual save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !saving && typeof onSave === 'function') {
          handleManualSave();
        }
      }
      // Ctrl+Z for undo
      else if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y or Ctrl+Shift+Z for redo
      else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl+Shift+G for gradient editor
      else if (e.ctrlKey && e.shiftKey && e.key === 'g') {
        e.preventDefault();
        handleGradientEditor(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleManualSave, hasUnsavedChanges, saving, onSave]);

  // Handle element selection from HitboxManager
  const handleElementSelect = useCallback((element: HTMLElement | null) => {
    setActiveElement(element);
    
    if (element) {
      // Clear any text selection when selecting an element
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
      setShowToolbar(false);
    }
  }, []);

  // Handle group selection changes
  const handleGroupChange = useCallback((groupedElements: HTMLElement[]) => {
    console.log('📦 Elementos agrupados:', groupedElements.length);
    // You can add additional logic here to handle grouped elements
  }, []);

  // Handle text editing activation (F2 key)
  const handleActivateTextEditing = useCallback(() => {
    if (activeElement) {
      // Check if element can contain text
      const canEditText = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV', 'SPAN', 'LI', 'BLOCKQUOTE'].includes(activeElement.tagName) ||
        (activeElement.tagName === 'DIV' && !activeElement.hasAttribute('data-shape') && !activeElement.hasAttribute('data-resizable'));
      
      if (canEditText) {
        // Make element editable
        activeElement.contentEditable = 'true';
        activeElement.focus();
        
        // Select all text
        const selection = window.getSelection();
        if (selection) {
          selection.selectAllChildren(activeElement);
        }
        
        console.log('🔤 Activando edición de texto para:', activeElement.tagName);
      }
    }
  }, [activeElement]);

  // Handle context menu actions
  const handleContextMenuAction = useCallback((action: string, element: HTMLElement | null) => {
    console.log('🖱️ Acción del menú contextual:', action, element);
    
    // Trigger content change to save the state after context menu actions
    if (['cut', 'paste', 'duplicate', 'delete'].includes(action)) {
      // Get current content and trigger change
      if (previewContainerRef.current) {
        const currentContent = previewContainerRef.current.innerHTML;
        handleContentChange(currentContent, true);
      }
    }
  }, [handleContentChange]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Los cambios en el textarea se consideran inmediatos
    handleContentChange(e.target.value, true);
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
        return 'Guardando...';
      case 'saved':
        return 'Guardado';
      case 'error':
        return 'Error al guardar';
      case 'unsaved':
        return 'Cambios sin guardar';
      default:
        return 'Guardar';
    }
  };



  const handleSaveAndExit = async () => {
    try {
      await handleManualSave();
      if (pendingAction) {
        pendingAction();
      }
    } catch (error) {
      console.error('Error al guardar antes de salir:', error);
    } finally {
      setShowExitModal(false);
      setPendingAction(null);
    }
  };

  const handleExitWithoutSaving = () => {
    if (pendingAction) {
      pendingAction();
    }
    setShowExitModal(false);
    setPendingAction(null);
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    setPendingAction(null);
  };

  // Función para manejar el editor de gradientes
  const handleGradientEditor = (e: KeyboardEvent | MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
        ? range.commonAncestorContainer.parentElement 
        : range.commonAncestorContainer as HTMLElement;
      
      if (element && (element.hasAttribute('data-gradient-editable') || element.closest('[data-gradient-editable]'))) {
        const targetElement = element.hasAttribute('data-gradient-editable') 
          ? element 
          : element.closest('[data-gradient-editable]') as HTMLElement;
        
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          setGradientEditorPosition({ 
            x: rect.right + 10, 
            y: rect.top 
          });
          setSelectedGradientElement(targetElement);
          setShowGradientEditor(true);
        }
      }
    }
  };

  // Funciones para el sistema de versiones (solo para historial interno)
  // Nota: Las funciones de UI de versiones se removieron para evitar duplicación con PageVersionManager

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
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          {/* Botón de versiones removido - ahora se usa PageVersionManager en el sidebar */}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('visual')}
            className={`flex items-center px-3 py-1 text-sm rounded ${
              viewMode === 'visual'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Monitor className="h-3 w-3 mr-1" />
            Visual
          </button>
          <button
            onClick={() => setViewMode('html')}
            className={`flex items-center px-3 py-1 text-sm rounded ${
              viewMode === 'html'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Code className="h-3 w-3 mr-1" />
            HTML
          </button>
          <button
            onClick={() => setShowPositioningGuide(!showPositioningGuide)}
            className={`flex items-center px-3 py-1 text-sm rounded ${
              showPositioningGuide
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
            title="Activar/desactivar guías de posicionamiento"
          >
            <Ruler className="h-3 w-3 mr-1" />
            Guías
          </button>
          <button
            onClick={() => setShowBackgroundEditor(true)}
            className="flex items-center px-3 py-1 text-sm rounded bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            title="Personalizar fondo"
          >
            <Palette className="h-3 w-3 mr-1" />
            Fondo
          </button>
          <SheetFormatSelector containerRef={previewContainerRef} />
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

          {/* Botón de guardado */}
          {typeof onSave === 'function' && (
            <ManualSaveButton
              onSave={handleManualSave}
              saving={saving}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          )}
        </div>
      </div>

      {/* Área de edición */}
      <div className="relative">
        {viewMode === 'visual' ? (
          <>
            {/* Vista previa editable con toolbar */}
            <div className="relative" ref={previewContainerRef}>
              <PreviewPane
                content={renderContent}
                className="min-h-[700px]"
                editable={true}
                onChange={handleContentChange}
              />
              <FloatingToolbar
                selection={selection}
                activeElement={activeElement}
                visible={showToolbar}
                position={toolbarPosition}
                onContentChange={handleContentChange}
                containerRef={previewContainerRef}
              />
              <PositioningGuide 
                containerRef={previewContainerRef}
                activeElement={activeElement}
                enabled={showPositioningGuide}
              />
              <HitboxManager 
                containerRef={previewContainerRef}
                enabled={viewMode === 'visual'}
                onElementSelect={handleElementSelect}
              />
              <GroupManager 
                containerRef={previewContainerRef}
                enabled={viewMode === 'visual'}
                onGroupChange={handleGroupChange}
                onTextEditActivate={handleActivateTextEditing}
              />
              <ContextMenu 
                containerRef={previewContainerRef}
                enabled={viewMode === 'visual'}
                onAction={handleContextMenuAction}
              />
            </div>
          </>
        ) : (
          <textarea
            value={content}
            onChange={handleCodeChange}
            className="w-full h-[700px] p-6 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm resize-none"
            placeholder="<div>Escribe tu HTML aquí...</div>"
          />
        )}
      </div>

      {/* Modal de confirmación */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cambios sin guardar
            </h3>
            <p className="text-gray-600 mb-6">
              Tienes cambios sin guardar. ¿Qué quieres hacer?
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleSaveAndExit}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Guardar y continuar
              </button>
              <button
                onClick={handleCancelExit}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Seguir editando
              </button>
              <button
                onClick={handleExitWithoutSaving}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Salir sin guardar
              </button>
            </div>
          </div>
         </div>
       )}

       {/* Modal de versiones removido para evitar duplicación con PageVersionManager */}
       
       {/* Editor de Fondo */}
       <BackgroundEditor
         visible={showBackgroundEditor}
         onClose={() => setShowBackgroundEditor(false)}
         containerRef={previewContainerRef}
       />
       
       {/* Editor de Gradientes */}
       {showGradientEditor && selectedGradientElement && (
         <GradientTextEditor
           element={selectedGradientElement}
           position={gradientEditorPosition}
           onClose={() => setShowGradientEditor(false)}
         />
       )}
    </div>
  );
};

export default ProfessionalEditor;