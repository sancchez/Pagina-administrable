import React, { useState } from 'react';
import { useGrapesGradients } from '../hooks';

interface GradientPanelProps {
  editorInstanceRef: React.RefObject<any>;
  isVisible: boolean;
  onClose: () => void;
}

export const GradientPanel: React.FC<GradientPanelProps> = ({
  editorInstanceRef,
  isVisible,
  onClose
}) => {
  const { predefinedGradients, applyGradient, removeGradient } = useGrapesGradients(editorInstanceRef);
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);

  const handleGradientClick = (gradientCss: string) => {
    setSelectedGradient(gradientCss);
    applyGradient(gradientCss);
  };

  const handleRemoveGradient = () => {
    setSelectedGradient(null);
    removeGradient();
  };

  if (!isVisible) return null;

  return (
    <div className="gradient-panel">
      <div className="panel-overlay" onClick={onClose}></div>
      
      <div className="panel-content">
        <div className="panel-header">
          <h3>🎨 Gradientes</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="panel-body">
          <div className="gradient-grid">
            {predefinedGradients.map((gradient, index) => (
              <div
                key={index}
                className={`gradient-item ${selectedGradient === gradient.css ? 'selected' : ''}`}
                style={{ background: gradient.css }}
                onClick={() => handleGradientClick(gradient.css)}
                title={gradient.name}
              >
                <div className="gradient-overlay">
                  <span className="gradient-name">{gradient.name}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="panel-actions">
            <button
              onClick={handleRemoveGradient}
              className="remove-button"
            >
              🗑️ Quitar Gradiente
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .gradient-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .panel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .panel-content {
          position: relative;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .panel-body {
          padding: 20px;
          overflow-y: auto;
          max-height: calc(80vh - 80px);
        }

        .gradient-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .gradient-item {
          height: 80px;
          border-radius: 8px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .gradient-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .gradient-item.selected {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
        }

        .gradient-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          padding: 8px;
          transform: translateY(100%);
          transition: transform 0.2s ease;
        }

        .gradient-item:hover .gradient-overlay {
          transform: translateY(0);
        }

        .gradient-name {
          color: white;
          font-size: 12px;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .panel-actions {
          display: flex;
          justify-content: center;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
        }

        .remove-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .remove-button:hover {
          background: #c82333;
          transform: translateY(-1px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .panel-content {
            width: 95%;
            max-height: 90vh;
          }

          .gradient-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 8px;
          }

          .gradient-item {
            height: 60px;
          }

          .panel-header {
            padding: 12px 16px;
          }

          .panel-body {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};