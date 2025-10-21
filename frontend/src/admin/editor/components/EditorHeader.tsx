import React from 'react';
import { SaveStatus } from '../hooks';

interface EditorHeaderProps {
  slug: string;
  saveStatus: SaveStatus;
  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
  onBack: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  slug,
  saveStatus,
  onSave,
  onPublish,
  onPreview,
  onBack
}) => {
  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return { text: 'Guardando...', color: 'text-blue-600' };
      case 'saved':
        return { text: 'Guardado', color: 'text-green-600' };
      case 'error':
        return { text: 'Error al guardar', color: 'text-red-600' };
      default:
        return { text: 'Sin cambios', color: 'text-gray-500' };
    }
  };

  const statusDisplay = getSaveStatusDisplay();

  return (
    <div className="editor-header">
      <div className="header-left">
        <button
          onClick={onBack}
          className="back-button"
          title="Volver al dashboard"
        >
          ← Volver
        </button>
        <h1 className="page-title">
          Editando: <span className="slug">{slug}</span>
        </h1>
      </div>

      <div className="header-center">
        <div className={`save-status ${statusDisplay.color}`}>
          {statusDisplay.text}
        </div>
      </div>

      <div className="header-right">
        <button
          onClick={onPreview}
          className="preview-button"
          title="Vista previa"
        >
          👁️ Vista Previa
        </button>
        
        <button
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          className="save-button"
          title="Guardar cambios"
        >
          💾 Guardar
        </button>
        
        <button
          onClick={onPublish}
          disabled={saveStatus === 'saving'}
          className="publish-button"
          title="Publicar página"
        >
          🚀 Publicar
        </button>
      </div>

      <style jsx>{`
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1000;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .back-button {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .back-button:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }

        .page-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .slug {
          color: #ffd700;
          font-weight: 700;
        }

        .header-center {
          display: flex;
          align-items: center;
        }

        .save-status {
          font-size: 14px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.1);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .preview-button,
        .save-button,
        .publish-button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .preview-button {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .preview-button:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }

        .save-button {
          background: #28a745;
          color: white;
        }

        .save-button:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-1px);
        }

        .save-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .publish-button {
          background: #ff6b35;
          color: white;
        }

        .publish-button:hover:not(:disabled) {
          background: #e55a2b;
          transform: translateY(-1px);
        }

        .publish-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .editor-header {
            flex-direction: column;
            gap: 10px;
            padding: 10px;
          }

          .header-left,
          .header-center,
          .header-right {
            width: 100%;
            justify-content: center;
          }

          .page-title {
            font-size: 16px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};