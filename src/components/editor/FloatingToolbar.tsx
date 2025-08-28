import React, { useState, useRef } from 'react';
import {
  Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered,
  Link, Image, Code,
  Heading1, Heading2, Heading3,
  Strikethrough, Palette, Quote, Square
} from 'lucide-react';
import { EditorCommands } from './EditorCommands';

interface FloatingToolbarProps {
  selection: Selection | null;
  activeElement: HTMLElement | null;
  visible: boolean;
  position: { x: number; y: number };
}

interface ToolbarButton {
  icon?: any;
  label?: string;
  command?: () => void;
  type?: 'separator';
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  visible,
  position
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF',
    '#6600FF', '#FF0066', '#00FFFF', '#FF00FF', '#FFFF00'
  ];

  const toolbarButtons: ToolbarButton[] = [
    {
      icon: Heading1,
      label: 'Título 1',
      command: () => EditorCommands.formatBlock('h1')
    },
    {
      icon: Heading2,
      label: 'Título 2',
      command: () => EditorCommands.formatBlock('h2')
    },
    {
      icon: Heading3,
      label: 'Título 3',
      command: () => EditorCommands.formatBlock('h3')
    },
    { type: 'separator' },
    {
      icon: Bold,
      label: 'Negrita',
      command: () => EditorCommands.toggleBold()
    },
    {
      icon: Italic,
      label: 'Cursiva',
      command: () => EditorCommands.toggleItalic()
    },
    {
      icon: Underline,
      label: 'Subrayado',
      command: () => EditorCommands.toggleUnderline()
    },
    {
      icon: Strikethrough,
      label: 'Tachado',
      command: () => EditorCommands.toggleStrikethrough()
    },
    { type: 'separator' },
    {
      icon: Palette,
      label: 'Color de texto',
      command: () => setShowColorPicker(!showColorPicker)
    },
    {
      icon: Link,
      label: 'Enlace',
      command: () => setShowLinkDialog(true)
    },
    { type: 'separator' },
    {
      icon: AlignLeft,
      label: 'Alinear izquierda',
      command: () => EditorCommands.align('left')
    },
    {
      icon: AlignCenter,
      label: 'Centrar',
      command: () => EditorCommands.align('center')
    },
    {
      icon: AlignRight,
      label: 'Alinear derecha',
      command: () => EditorCommands.align('right')
    },
    { type: 'separator' },
    {
      icon: List,
      label: 'Lista con viñetas',
      command: () => EditorCommands.insertList('ul')
    },
    {
      icon: ListOrdered,
      label: 'Lista numerada',
      command: () => EditorCommands.insertList('ol')
    },
    {
      icon: Quote,
      label: 'Cita',
      command: () => EditorCommands.formatBlock('blockquote')
    },
    { type: 'separator' },
    {
      icon: Square,
      label: 'Insertar recuadro',
      command: () => EditorCommands.insertBox()
    },
    {
      icon: Image,
      label: 'Insertar imagen',
      command: () => EditorCommands.insertImage()
    }
  ];

  const handleColorSelect = (color: string) => {
    EditorCommands.setTextColor(color);
    setShowColorPicker(false);
  };

  const handleLinkInsert = () => {
    if (linkUrl) {
      EditorCommands.insertLink(linkUrl);
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex items-center space-x-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 60}px`,
        transform: 'translateX(-50%)'
      }}
    >
      {toolbarButtons.map((button, index) => {
        if (button.type === 'separator') {
          return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />;
        }

        const Icon = button.icon;
        if (!Icon) return null;
        
        return (
          <button
            key={index}
            onClick={button.command}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title={button.label}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}

      {/* Color Picker */}
      {showColorPicker && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              URL del enlace:
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://ejemplo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleLinkInsert}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Insertar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolbarButton: React.FC<{
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  active?: boolean;
}> = ({ onClick, icon: IconComponent, title, active = false }) => (
  <button
    onClick={onClick}
    title={title}
    className={`
      p-2 rounded hover:bg-gray-100 transition-colors
      ${active ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}
    `}
  >
    <IconComponent size={16} />
  </button>
);

export default FloatingToolbar;