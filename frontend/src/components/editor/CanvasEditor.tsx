import React, { useState, useRef } from 'react';
import { CanvasPage, CanvasTool } from '../../types/canvas';
import { Type, Square, Image, MousePointer, Hand, ZoomIn } from 'lucide-react';

interface CanvasEditorProps {
  page: CanvasPage;
  onSave: (page: CanvasPage) => void;
  onBack: () => void;
  readOnly?: boolean;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ 
  page, 
  readOnly = false 
}) => {
  const [selectedTool, setSelectedTool] = useState<CanvasTool>('select');
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom] = useState(1);
  const [pan] = useState({ x: 0, y: 0 });

  // Herramientas disponibles
  const tools = [
    { id: 'select' as CanvasTool, icon: MousePointer, label: 'Seleccionar' },
    { id: 'text' as CanvasTool, icon: Type, label: 'Texto' },
    { id: 'heading' as CanvasTool, icon: Type, label: 'Título' },
    { id: 'button' as CanvasTool, icon: Square, label: 'Botón' },
    { id: 'image' as CanvasTool, icon: Image, label: 'Imagen' },
    { id: 'hand' as CanvasTool, icon: Hand, label: 'Mover' },
    { id: 'zoom' as CanvasTool, icon: ZoomIn, label: 'Zoom' },
  ];



  return (
    <div className="flex h-full bg-gray-100">
      {/* Barra de herramientas */}
      {!readOnly && (
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`p-3 rounded-lg transition-colors ${
                  selectedTool === tool.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={tool.label}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Canvas principal */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full relative cursor-crosshair"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '0 0',
            backgroundColor: page.settings?.backgroundColor || '#ffffff',
            minWidth: `${page.settings?.width || 1200}px`,
            minHeight: `${page.settings?.height || 800}px`
          }}
        >
          {/* Renderizar bloques */}
          {page.blocks.map(block => (
            <div
              key={block.id}
              style={{
                position: 'absolute',
                left: `${block.position.x}px`,
                top: `${block.position.y}px`,
                width: `${block.size.width}px`,
                height: `${block.size.height}px`,
                fontSize: block.style?.fontSize ? `${block.style.fontSize}px` : undefined,
                color: block.style?.color,
                backgroundColor: block.style?.backgroundColor,
                border: selectedBlocks.includes(block.id) ? '2px solid #3b82f6' : '1px solid transparent',
                cursor: readOnly ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                boxSizing: 'border-box'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!readOnly) {
                  setSelectedBlocks([block.id]);
                }
              }}
            >
              {block.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;