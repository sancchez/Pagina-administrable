import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Move, Trash2, Type } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface EditableTextProps {
  id: string;
  text: string;
  position: Position;
  size: Size;
  color: string;
  rotation: number;
  onUpdate: (updates: Partial<any>) => void;
}

const EditableText: React.FC<EditableTextProps> = ({
  id,
  text,
  position,
  size,
  color,
  rotation,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [isSelected, setIsSelected] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
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



  const handleDelete = () => {
    onUpdate({ deleted: true });
  };

  return (
    <div
      ref={textRef}
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
        <div className="bg-white border border-blue-500 rounded shadow-lg p-2 min-w-96">
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSave();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Escribe tu texto aquí..."
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              ✓ Guardar
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="relative h-full">
          <div
            className="cursor-pointer select-none whitespace-pre-wrap"
            style={{ color, fontSize: '16px', lineHeight: '1.4' }}
          >
            {text || 'Texto de ejemplo'}
          </div>
          
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

export default EditableText;