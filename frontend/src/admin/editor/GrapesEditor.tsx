import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'grapesjs/dist/css/grapes.min.css';

// Importar tipos y hooks
import { PageData, SelectedInfo } from './types';
import { usePageData, useGrapesEditor, useSaveManager } from './hooks';

// Importar componentes
import { EditorHeader } from './components/EditorHeader';
import { EditorToolbar } from './components/EditorToolbar';
import { EditorPanels } from './components/EditorPanels';

// Importar estilos
import './styles/editorStyles.css';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const GrapesEditor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Estados locales para la UI
  const [showBlocks, setShowBlocks] = useState(true);
  const [showStyles, setShowStyles] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [showTraits, setShowTraits] = useState(true);

  // Hooks personalizados
  const { pageData, loading, error, loadPageData } = usePageData();
  const { 
    editorRef, 
    containerRef, 
    editorState, 
    selectedInfo, 
    initializeEditor, 
    loadContentIntoEditor 
  } = useGrapesEditor();
  const { 
    saveStatus, 
    lastSaved, 
    isPublishing, 
    handleSave, 
    handlePublish, 
    getSaveStatusDisplay 
  } = useSaveManager(editorRef, slug);

  // Efectos
  React.useEffect(() => {
    if (slug) {
      loadPageData();
    }
  }, [slug, loadPageData]);

  React.useEffect(() => {
    if (!loading && !error && pageData) {
      initializeEditor();
    }
  }, [loading, error, pageData, initializeEditor]);

  React.useEffect(() => {
    if (editorState.isReady && pageData) {
      loadContentIntoEditor(pageData);
    }
  }, [editorState.isReady, pageData, loadContentIntoEditor]);

  // Handlers
  const handleBack = () => {
    navigate('/admin/pages');
  };

  const handlePreview = () => {
    if (editorRef.current) {
      const commands = editorRef.current.Commands;
      commands.run('preview');
    }
  };

  const handleSaveClick = () => {
    handleSave();
  };

  const handlePublishClick = () => {
    handlePublish();
  };

  // Renderizado de estados de carga y error
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error.message}</p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate('/admin/dashboard')}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusDisplay = getSaveStatusDisplay();

  return (
    <div className="h-screen flex flex-col">
      {/* Estilos CSS personalizados */}
      <style>{`
        /* Estilos base del editor */
        .gjs-one-bg { background-color: #0f172a !important; }
        .gjs-two-color { color: #f8fafc !important; }
        .gjs-three-bg { background-color: #1e293b !important; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #cbd5e1 !important; }
        
        /* Panel de bloques */
        .gjs-blocks-c { 
          display: flex !important; 
          flex-wrap: wrap !important; 
          gap: 8px !important; 
          padding: 16px !important; 
        }
        .gjs-block { 
          width: calc(50% - 4px) !important; 
          min-height: 60px !important; 
          border: 1px solid #e5e7eb !important; 
          border-radius: 6px !important; 
          display: flex !important; 
          flex-direction: column !important; 
          align-items: center !important; 
          justify-content: center !important; 
          cursor: pointer !important; 
          transition: all 0.2s !important; 
          background: white !important; 
        }
        .gjs-block:hover { 
          border-color: #3b82f6 !important; 
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15) !important; 
        }
        .gjs-block-label { 
          font-size: 11px !important; 
          color: #6b7280 !important; 
          margin-top: 4px !important; 
          text-align: center !important; 
        }
        
        /* Gestor de estilos */
        .gjs-sm-sectors { background: white !important; }
        .gjs-sm-sector { 
          border-bottom: 1px solid #e5e7eb !important; 
          background: white !important; 
        }
        .gjs-sm-sector .gjs-sm-title { 
          background: #f9fafb !important; 
          color: #374151 !important; 
          font-weight: 500 !important; 
          padding: 12px 16px !important; 
          border-bottom: 1px solid #e5e7eb !important; 
        }
        .gjs-sm-properties { 
          padding: 16px !important; 
          background: white !important; 
        }
        .gjs-sm-property { 
          margin-bottom: 12px !important; 
        }
        .gjs-sm-label { 
          color: #374151 !important; 
          font-size: 12px !important; 
          font-weight: 500 !important; 
          margin-bottom: 4px !important; 
        }
        .gjs-field { 
          border: 1px solid #d1d5db !important; 
          border-radius: 4px !important; 
          padding: 6px 8px !important; 
          font-size: 12px !important; 
        }
        .gjs-field:focus { 
          border-color: #3b82f6 !important; 
          outline: none !important; 
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important; 
        }
        
        /* Gestor de capas */
        .gjs-lm-layers { background: white !important; }
        .gjs-lm-layer { 
          border-bottom: 1px solid #f3f4f6 !important; 
          padding: 8px 12px !important; 
        }
        .gjs-lm-layer:hover { background: #f9fafb !important; }
        .gjs-lm-name { 
          color: #374151 !important; 
          font-size: 12px !important; 
        }
        
        /* Gestor de propiedades */
        .gjs-trt-traits { background: white !important; padding: 16px !important; }
        .gjs-trt-trait { margin-bottom: 12px !important; }
        .gjs-trt-label { 
          color: #374151 !important; 
          font-size: 12px !important; 
          font-weight: 500 !important; 
          margin-bottom: 4px !important; 
        }
        
        /* Canvas */
        .gjs-cv-canvas { 
          background: #f5f5f5 !important; 
        }
        .gjs-frame { 
          border: 1px solid #e5e7eb !important; 
          border-radius: 8px !important; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; 
          margin: 20px !important; 
          background: white !important; 
        }
        
        /* Paneles laterales */
        .panel__left, .panel__right {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
      `}</style>

      {/* Header del editor */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <div className="text-lg font-semibold text-gray-900">
            {pageData?.title || 'Editor'}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`text-sm ${statusDisplay.color}`}>
            {statusDisplay.text}
          </div>
          {lastSaved && (
            <div className="text-sm text-gray-500">
              Guardado: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saveStatus === 'saving' ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isPublishing ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowBlocks(!showBlocks)}
            className={`px-3 py-1 text-sm rounded ${showBlocks ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Bloques
          </button>
          <button
            onClick={() => setShowStyles(!showStyles)}
            className={`px-3 py-1 text-sm rounded ${showStyles ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Estilos
          </button>
          <button
            onClick={() => setShowLayers(!showLayers)}
            className={`px-3 py-1 text-sm rounded ${showLayers ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Capas
          </button>
          <button
            onClick={() => setShowTraits(!showTraits)}
            className={`px-3 py-1 text-sm rounded ${showTraits ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Propiedades
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {selectedInfo && (
            <div className="text-sm text-gray-600">
              {selectedInfo.name} - {selectedInfo.width}×{selectedInfo.height}px
            </div>
          )}
          <div className="flex space-x-1">
            <button className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">
              Desktop
            </button>
            <button className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
              Tablet
            </button>
            <button className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
              Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Layout principal del editor */}
      <div className="flex-1 flex relative">
        {/* Panel izquierdo */}
        {(showBlocks || showLayers) && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {showBlocks && (
              <div className="flex-1 border-b border-gray-200">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Bloques</h3>
                </div>
                <div id="blocks-panel" className="p-4"></div>
              </div>
            )}
            {showLayers && (
              <div className="flex-1">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Capas</h3>
                </div>
                <div id="layers-panel" className="p-4"></div>
              </div>
            )}
          </div>
        )}

        {/* Canvas del editor */}
        <div className="flex-1 relative">
          <div 
            ref={containerRef}
            className="h-full w-full"
            style={{ minHeight: '500px' }}
          />
        </div>

        {/* Panel derecho */}
        {(showStyles || showTraits) && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {showStyles && (
              <div className="flex-1 border-b border-gray-200">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Estilos</h3>
                </div>
                <div id="styles-panel" className="overflow-y-auto"></div>
              </div>
            )}
            {showTraits && (
              <div className="flex-1">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Propiedades</h3>
                </div>
                <div id="traits-panel" className="p-4 overflow-y-auto"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrapesEditor;