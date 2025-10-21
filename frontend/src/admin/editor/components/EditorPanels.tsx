import React from 'react';

interface EditorPanelsProps {
  className?: string;
}

export const EditorPanels: React.FC<EditorPanelsProps> = ({ className = '' }) => {
  return (
    <div className={`editor-panels ${className}`}>
      {/* Panel de Bloques */}
      <div className="panel-container">
        <div className="panel-header">
          <h3>📦 Bloques</h3>
        </div>
        <div id="blocks" className="panel-content"></div>
      </div>

      {/* Panel de Capas */}
      <div className="panel-container">
        <div className="panel-header">
          <h3>🗂️ Capas</h3>
        </div>
        <div id="layers" className="panel-content"></div>
      </div>

      {/* Panel de Estilos */}
      <div className="panel-container">
        <div className="panel-header">
          <h3>🎨 Estilos</h3>
        </div>
        <div id="styles" className="panel-content"></div>
      </div>

      {/* Panel de Propiedades */}
      <div className="panel-container">
        <div className="panel-header">
          <h3>⚙️ Propiedades</h3>
        </div>
        <div id="traits" className="panel-content"></div>
      </div>

      <style jsx>{`
        .editor-panels {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #f8f9fa;
          border-right: 1px solid #e9ecef;
          overflow-y: auto;
        }

        .panel-container {
          border-bottom: 1px solid #e9ecef;
          background: white;
          margin-bottom: 1px;
        }

        .panel-header {
          padding: 12px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
        }

        .panel-header:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        }

        .panel-header h3 {
          margin: 0;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .panel-content {
          padding: 12px;
          min-height: 150px;
          max-height: 300px;
          overflow-y: auto;
        }

        /* Estilos específicos para cada panel */
        #blocks {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 8px;
        }

        #layers {
          font-size: 13px;
        }

        #styles {
          font-size: 12px;
        }

        #traits {
          font-size: 13px;
        }

        /* Scrollbar personalizado */
        .panel-content::-webkit-scrollbar {
          width: 6px;
        }

        .panel-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .panel-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .panel-content::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .editor-panels {
            width: 100%;
            height: auto;
            flex-direction: row;
            overflow-x: auto;
            border-right: none;
            border-bottom: 1px solid #e9ecef;
          }

          .panel-container {
            min-width: 200px;
            border-right: 1px solid #e9ecef;
            border-bottom: none;
          }

          .panel-content {
            max-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};