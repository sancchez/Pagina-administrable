import React, { useState, useRef, useEffect } from 'react';
import { useNode, UserComponent } from '@craftjs/core';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Type,
  Palette
} from 'lucide-react';

// Rich Text Editor Props
export interface RichTextProps {
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  backgroundColor: string;
  padding: number;
  margin: number;
}

// Rich Text Editor Component
export const RichTextEditor: UserComponent<RichTextProps> = ({
  text = 'Escribe tu texto aquí...',
  fontSize = 16,
  fontWeight = 'normal',
  textAlign = 'left',
  color = '#000000',
  backgroundColor = 'transparent',
  padding = 10,
  margin = 5
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  const handleTextChange = () => {
    if (editorRef.current) {
      const newText = editorRef.current.textContent || '';
      setCurrentText(newText);
      setProp((props: RichTextProps) => {
        props.text = newText;
      });
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    handleTextChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertText', false, '\n');
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      handleTextChange();
    }
  };

  // Formatting functions
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleTextChange();
  };

  const styles = {
    fontSize: `${fontSize}px`,
    fontWeight,
    textAlign,
    color,
    backgroundColor,
    padding: `${padding}px`,
    margin: `${margin}px`,
    minHeight: '40px',
    border: selected ? '2px solid #3b82f6' : '2px solid transparent',
    borderRadius: '4px',
    cursor: isEditing ? 'text' : 'pointer',
    outline: 'none',
    position: 'relative' as const
  };

  return (
    <div
      ref={(ref) => connect(drag(ref!))}
      style={styles}
      onDoubleClick={handleDoubleClick}
      className="rich-text-editor transition-all duration-200 hover:shadow-sm"
    >
      {/* Formatting Toolbar */}
      {selected && isEditing && (
        <div className="absolute -top-12 left-0 bg-white border border-gray-200 rounded shadow-lg p-2 flex items-center space-x-1 z-10">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText('bold');
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Negrita"
          >
            <Bold size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText('italic');
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Cursiva"
          >
            <Italic size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText('underline');
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Subrayado"
          >
            <Underline size={14} />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText('justifyLeft');
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Alinear izquierda"
          >
            <AlignLeft size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText('justifyCenter');
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Centrar"
          >
            <AlignCenter size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText('justifyRight');
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Alinear derecha"
          >
            <AlignRight size={14} />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText('insertUnorderedList');
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Lista con viñetas"
          >
            <List size={14} />
          </button>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              formatText('insertOrderedList');
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Lista numerada"
          >
            <ListOrdered size={14} />
          </button>
        </div>
      )}

      {/* Editable Content */}
      <div
        ref={editorRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
      >
        {currentText}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleTextChange}
        className="w-full h-full"
        style={{ outline: 'none' }}
      />

      {/* Edit Indicator */}
      {selected && !isEditing && (
        <div className="absolute -top-6 left-0 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Doble clic para editar
        </div>
      )}
    </div>
  );
};

// Settings Panel for Rich Text Editor
export const RichTextSettings = () => {
  const {
    actions: { setProp },
    fontSize,
    fontWeight,
    textAlign,
    color,
    backgroundColor,
    padding,
    margin
  } = useNode((node) => ({
    fontSize: node.data.props.fontSize,
    fontWeight: node.data.props.fontWeight,
    textAlign: node.data.props.textAlign,
    color: node.data.props.color,
    backgroundColor: node.data.props.backgroundColor,
    padding: node.data.props.padding,
    margin: node.data.props.margin
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center">
        <Type className="mr-2" size={16} />
        Configuración de Texto
      </h3>

      {/* Font Size */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Tamaño de fuente
        </label>
        <input
          type="range"
          min="10"
          max="48"
          value={fontSize}
          onChange={(e) =>
            setProp((props: RichTextProps) => {
              props.fontSize = parseInt(e.target.value);
            })
          }
          className="w-full"
        />
        <span className="text-xs text-gray-500">{fontSize}px</span>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Peso de fuente
        </label>
        <select
          value={fontWeight}
          onChange={(e) =>
            setProp((props: RichTextProps) => {
              props.fontWeight = e.target.value as 'normal' | 'bold';
            })
          }
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
        >
          <option value="normal">Normal</option>
          <option value="bold">Negrita</option>
        </select>
      </div>

      {/* Text Align */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Alineación
        </label>
        <div className="flex space-x-1">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() =>
                setProp((props: RichTextProps) => {
                  props.textAlign = align as 'left' | 'center' | 'right';
                })
              }
              className={`p-2 border rounded ${
                textAlign === align
                  ? 'bg-blue-100 border-blue-300'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              {align === 'left' && <AlignLeft size={14} />}
              {align === 'center' && <AlignCenter size={14} />}
              {align === 'right' && <AlignRight size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Color de texto
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) =>
              setProp((props: RichTextProps) => {
                props.color = e.target.value;
              })
            }
            className="w-full h-8 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Fondo
          </label>
          <input
            type="color"
            value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
            onChange={(e) =>
              setProp((props: RichTextProps) => {
                props.backgroundColor = e.target.value;
              })
            }
            className="w-full h-8 border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Spacing */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Padding
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={padding}
            onChange={(e) =>
              setProp((props: RichTextProps) => {
                props.padding = parseInt(e.target.value);
              })
            }
            className="w-full"
          />
          <span className="text-xs text-gray-500">{padding}px</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Margen
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={margin}
            onChange={(e) =>
              setProp((props: RichTextProps) => {
                props.margin = parseInt(e.target.value);
              })
            }
            className="w-full"
          />
          <span className="text-xs text-gray-500">{margin}px</span>
        </div>
      </div>
    </div>
  );
};

// Craft.js Configuration
RichTextEditor.craft = {
  props: {
    text: 'Escribe tu texto aquí...',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#000000',
    backgroundColor: 'transparent',
    padding: 10,
    margin: 5
  },
  related: {
    settings: RichTextSettings
  }
};

export default RichTextEditor;