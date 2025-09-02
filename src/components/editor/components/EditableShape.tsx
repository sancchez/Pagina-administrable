import React, { useState } from 'react';
import { Trash2, RotateCw } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface EditableShapeProps {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle';
  position: Position;
  size: Size;
  color: string;
  rotation: number;
  onUpdate: (updates: Partial<any>) => void;
}

const EditableShape: React.FC<EditableShapeProps> = ({
  id,
  type,
  position,
  size,
  color,
  rotation,
  onUpdate
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleDelete = () => {
    onUpdate({ deleted: true });
  };

  const handleRotate = () => {
    onUpdate({ rotation: (rotation + 45) % 360 });
  };

  const renderShape = () => {
    const shapeStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: color,
      border: '2px solid #e5e7eb'
    };

    switch (type) {
      case 'circle':
        return (
          <div
            style={{
              ...shapeStyle,
              borderRadius: '50%'
            }}
          />
        );
      case 'triangle':
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${size.width / 2}px solid transparent`,
              borderRight: `${size.width / 2}px solid transparent`,
              borderBottom: `${size.height}px solid ${color}`,
              backgroundColor: 'transparent',
              border: 'none'
            }}
          />
        );
      case 'rectangle':
      default:
        return <div style={shapeStyle} />;
    }
  };

  return (
    <div
      className={`absolute select-none cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center'
      }}
      onClick={() => setIsSelected(!isSelected)}
    >
      {renderShape()}
      
      {isSelected && (
        <div className="absolute -top-8 left-0 flex gap-1 bg-white border rounded shadow-lg p-1">
          <button
            onClick={handleRotate}
            className="p-1 hover:bg-gray-100 rounded"
            title="Rotar 45°"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded text-red-600"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableShape;