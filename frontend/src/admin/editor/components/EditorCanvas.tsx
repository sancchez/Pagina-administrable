import React from 'react';

interface EditorCanvasProps {
  className?: string;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ className = '' }) => {
  return (
    <div className={`editor-canvas ${className}`}>
      {/* Barra de herramientas del canvas */}
      <div className="canvas-toolbar">
        <div className="toolbar-left">
          <div id="device-buttons" className="device-buttons"></div>
        </div>
        
        <div className="toolbar-center">
          <div className="canvas-info">
            <span id="canvas-info-text">Listo para editar</span>
          </div>
        </div>
        
        <div className="toolbar-right">
          <button id="fullscreen-btn" className="toolbar-button" title="Pantalla completa">
            🔍
          </button>
          <button id="code-view-btn" className="toolbar-button" title="Ver código">
            &lt;/&gt;
          </button>
        </div>
      </div>

      {/* Área del canvas */}
      <div className="canvas-container">
        <div id="gjs" className="gjs-editor"></div>
      </div>

      <style jsx>{`
        .editor-canvas {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #f5f5f5;
          position: relative;
        }

        .canvas-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: white;
          border-bottom: 1px solid #e9ecef;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          z-index: 100;
        }

        .toolbar-left,
        .toolbar-center,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .device-buttons {
          display: flex;
          gap: 4px;
        }

        .canvas-info {
          font-size: 13px;
          color: #6c757d;
          font-weight: 500;
        }

        .toolbar-button {
          padding: 6px 10px;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
          color: #495057;
        }

        .toolbar-button:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
          transform: translateY(-1px);
        }

        .toolbar-button:active {
          transform: translateY(0);
        }

        .canvas-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #f5f5f5;
        }

        .gjs-editor {
          height: 100%;
          width: 100%;
        }

        /* Estilos específicos para GrapesJS */
        :global(.gjs-cv-canvas) {
          background: #f5f5f5;
        }

        :global(.gjs-frame) {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin: 20px;
          background: white;
        }

        :global(.gjs-cv-canvas__frames) {
          padding: 20px;
        }

        /* Botones de dispositivos */
        :global(.gjs-pn-device) {
          padding: 4px 8px;
          margin: 0 2px;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s ease;
          color: #495057;
        }

        :global(.gjs-pn-device:hover) {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        :global(.gjs-pn-device.gjs-pn-active) {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .canvas-toolbar {
            padding: 6px 12px;
            flex-wrap: wrap;
            gap: 8px;
          }

          .toolbar-left,
          .toolbar-center,
          .toolbar-right {
            flex: 1;
            min-width: 0;
          }

          .toolbar-center {
            order: 3;
            flex-basis: 100%;
            justify-content: center;
            margin-top: 4px;
          }

          .canvas-info {
            font-size: 12px;
          }

          :global(.gjs-cv-canvas__frames) {
            padding: 10px;
          }

          :global(.gjs-frame) {
            margin: 10px;
          }
        }
      `}</style>
    </div>
  );
};