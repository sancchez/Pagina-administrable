import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, RotateCw } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface EditableButtonProps {
  id: string;
  text: string;
  position: Position;
  size: Size;
  color: string;
  backgroundColor: string;
  rotation: number;
  onClick: () => void;
  onUpdate: (updates: Partial<any>) => void;
}

const EditableButton: React.FC<EditableButtonProps> = ({
  id,
  text,
  position,
  size,
  color,
  backgroundColor,
  rotation,
  onClick,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [isSelected, setIsSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(text);
  };

  const handleSave = () => {
    onUpdate({ text: editText });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = () => {
    onUpdate({ deleted: true });
  };

  const handleRotate = () => {
    onUpdate({ rotation: (rotation + 45) % 360 });
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected && !isEditing) {
      onClick();
    }
  };

  return (
    <div
      className={`absolute select-none ${
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
      {isEditing ? (
        <div className="flex items-center gap-2 h-full">
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleCancel}
            className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ color, fontSize: '14px' }}
          />
          <button
            onClick={handleSave}
            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
          >
            ✓
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="relative h-full">
          <button
            onClick={handleButtonClick}
            className="w-full h-full px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors font-medium"
            style={{
              backgroundColor,
              color,
              fontSize: '14px'
            }}
          >
            {text}
          </button>
          
          {isSelected && (
            <div className="absolute -top-8 left-0 flex gap-1 bg-white border rounded shadow-lg p-1">
              <button
                onClick={handleEdit}
                className="p-1 hover:bg-gray-100 rounded"
                title="Editar texto"
              >
                <Edit3 size={14} />
              </button>
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
      )}
    </div>
  );
};

export default EditableButton;