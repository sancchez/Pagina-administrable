import React from 'react';

interface EditorToolbarProps {
  pageTitle?: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' | 'auto-saving';
  isPublishing: boolean;
  hasUnsavedChanges: boolean;
  selectedElementInfo: string;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onNavigateBack: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  pageTitle,
  saveStatus,
  isPublishing,
  hasUnsavedChanges,
  selectedElementInfo,
  onSave,
  onPreview,
  onPublish,
  onNavigateBack
}) => {
  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving': return '💾 Guardando...';
      case 'auto-saving': return '🔄 Auto-guardando...';
      case 'saved': return '✅ Guardado';
      case 'error': return '❌ Error al guardar';
      default: return hasUnsavedChanges ? '⚠️ Cambios sin guardar' : '✅ Guardado';
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
      case 'auto-saving':
        return 'text-yellow-400';
      case 'saved':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return hasUnsavedChanges ? 'text-yellow-400' : 'text-green-400';
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      {/* Sección izquierda - Navegación y título */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onNavigateBack}
          className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-1"
          title="Volver al Dashboard"
        >
          <span>←</span>
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        
        <div className="h-6 w-px bg-gray-600"></div>
        
        <h1 className="text-white font-semibold text-lg truncate max-w-xs sm:max-w-md">
          {pageTitle || 'Editor de Página'}
        </h1>
        
        <span className={`text-sm ${getSaveStatusColor()} flex items-center space-x-1`}>
          <span>{getSaveStatusDisplay()}</span>
          {(saveStatus === 'saving' || saveStatus === 'auto-saving') && (
            <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
          )}
        </span>
      </div>

      {/* Sección central - Información del elemento seleccionado */}
      <div className="hidden md:flex items-center">
        <div className="bg-gray-700 px-3 py-1 rounded-md">
          <span className="text-sm text-gray-300">
            {selectedElementInfo}
          </span>
        </div>
      </div>

      {/* Sección derecha - Acciones principales */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-1"
          title="Guardar cambios"
        >
          <span>💾</span>
          <span className="hidden sm:inline">Guardar</span>
          {saveStatus === 'saving' && (
            <div className="animate-spin rounded-full h-3 w-3 border-b border-white ml-1"></div>
          )}
        </button>
        
        <button
          onClick={onPreview}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1"
          title="Vista previa en nueva ventana"
        >
          <span>👁️</span>
          <span className="hidden sm:inline">Vista Previa</span>
        </button>
        
        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-1"
          title="Publicar página"
        >
          {isPublishing ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
              <span className="hidden sm:inline">Publicando...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span className="hidden sm:inline">Publicar</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default EditorToolbar;