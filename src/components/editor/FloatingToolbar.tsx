import React, { useState, useRef } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Type, Palette, Paintbrush, MousePointer,
  Image, Link, Square, Circle, Triangle, Star, Layers, Settings, Quote, Table, CreditCard,
  FileText, Droplets, Video, Plus, Heading
} from 'lucide-react';
import { EditorCommands } from './EditorCommands';
import BackgroundEditor from './BackgroundEditor';
import LayerManager from './LayerManager';
import ColorPicker from './ColorPicker';

interface FloatingToolbarProps {
  selection: Selection | null;
  activeElement: HTMLElement | null;
  visible: boolean;
  position: { x: number; y: number };
  onContentChange?: (content: string, immediate?: boolean) => void;
  containerRef?: React.RefObject<HTMLElement>;
}

interface ToolbarButton {
  icon?: any;
  label?: string;
  command?: () => void;
  type?: 'separator';
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  visible,
  position,
  onContentChange,
  containerRef
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showFontFamilyPicker, setShowFontFamilyPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showBackgroundEditor, setShowBackgroundEditor] = useState(false);
  const [showLayerManager, setShowLayerManager] = useState(false);
  const [showAdvancedColorPicker, setShowAdvancedColorPicker] = useState(false);

  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF',
    '#6600FF', '#FF0066', '#00FFFF', '#FF00FF', '#FFFF00'
  ];

  const backgroundColors = [
    '#FFFFFF', '#F3F4F6', '#FEF3C7', '#DBEAFE', '#D1FAE5',
    '#FCE7F3', '#E0E7FF', '#FED7D7', '#FFF2CC', '#E6FFFA',
    '#F0F9FF', '#FAF5FF', '#FEF7F0', '#F7FAFC', '#FFFBEB'
  ];

  const fontSizes = [
    { label: '10', value: '10px' },
    { label: '12', value: '12px' },
    { label: '14', value: '14px' },
    { label: '16', value: '16px' },
    { label: '18', value: '18px' },
    { label: '20', value: '20px' },
    { label: '24', value: '24px' },
    { label: '28', value: '28px' },
    { label: '32', value: '32px' },
    { label: '36', value: '36px' },
    { label: '48', value: '48px' }
  ];

  const fontFamilies = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Courier New', value: 'Courier New, monospace' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Open Sans', value: 'Open Sans, sans-serif' },
    { label: 'Lato', value: 'Lato, sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Poppins', value: 'Poppins, sans-serif' },
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Playfair Display', value: 'Playfair Display, serif' },
    { label: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' }
  ];

  const notifyChange = () => {
    if (onContentChange) {
      // Obtener el contenido actual del editor
      const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
      if (editorElement) {
        onContentChange(editorElement.innerHTML, true);
      }
    }
  };

  const toolbarButtons: ToolbarButton[] = [
    // Grupo 1: Tipografía principal
    {
      icon: MousePointer,
      label: 'Tipo de fuente',
      command: () => setShowFontFamilyPicker(!showFontFamilyPicker)
    },
    {
      icon: Type,
      label: 'Tamaño de fuente',
      command: () => setShowFontSizePicker(!showFontSizePicker)
    },
    {
      icon: Palette,
      label: 'Color de texto',
      command: () => setShowColorPicker(!showColorPicker)
    },
    {
      icon: Paintbrush,
      label: 'Color de fondo',
      command: () => setShowBackgroundPicker(!showBackgroundPicker)
    },
    { type: 'separator' },
    
    // Grupo 2: Formato de texto básico
    {
      icon: Bold,
      label: 'Negrita',
      command: () => {
        EditorCommands.toggleBold();
        notifyChange();
      }
    },
    {
      icon: Italic,
      label: 'Cursiva',
      command: () => {
        EditorCommands.toggleItalic();
        notifyChange();
      }
    },
    {
      icon: Underline,
      label: 'Subrayado',
      command: () => {
        EditorCommands.toggleUnderline();
        notifyChange();
      }
    },
    {
      icon: Strikethrough,
      label: 'Tachado',
      command: () => {
        EditorCommands.toggleStrikethrough();
        notifyChange();
      }
    },
    { type: 'separator' },
    
    // Grupo 2: Elementos de contenido
    {
      icon: Plus,
      label: 'Insertar texto',
      command: () => {
        EditorCommands.insertText();
        notifyChange();
      }
    },
    {
      icon: Heading,
      label: 'Insertar título',
      command: () => {
        EditorCommands.insertTitle();
        notifyChange();
      }
    },
    {
      icon: Image,
      label: 'Insertar imagen',
      command: () => {
        EditorCommands.insertImage();
        notifyChange();
      }
    },
    {
      icon: Video,
      label: 'Insertar video',
      command: () => {
        EditorCommands.insertVideo();
        notifyChange();
      }
    },
    {
      icon: Link,
      label: 'Insertar enlace',
      command: () => {
        const url = prompt('URL del enlace:');
        if (url) {
          EditorCommands.insertLink(url);
          notifyChange();
        }
      }
    },
    {
      icon: Square,
      label: 'Insertar cuadro',
      command: () => {
        EditorCommands.insertBox();
        notifyChange();
      }
    },
    {
      icon: Circle,
      label: 'Insertar círculo',
      command: () => {
        EditorCommands.insertCircle();
        notifyChange();
      }
    },
    {
      icon: Table,
      label: 'Insertar tabla',
      command: () => {
        EditorCommands.insertTable();
        notifyChange();
      }
    },
    {
      icon: CreditCard,
      label: 'Insertar botón',
      command: () => {
        const text = prompt('Texto del botón:', 'Hacer clic');
        if (text) {
          EditorCommands.insertButton(text);
          notifyChange();
        }
      }
    },
    {
      icon: Quote,
      label: 'Cita',
      command: () => {
        EditorCommands.formatBlock('blockquote');
        notifyChange();
      }
    },
    { type: 'separator' },
    
    // Grupo 3: Alineación
    {
      icon: AlignLeft,
      label: 'Alinear izquierda',
      command: () => {
        EditorCommands.align('left');
        notifyChange();
      }
    },
    {
      icon: AlignCenter,
      label: 'Centrar',
      command: () => {
        EditorCommands.align('center');
        notifyChange();
      }
    },
    {
      icon: AlignRight,
      label: 'Alinear derecha',
      command: () => {
        EditorCommands.align('right');
        notifyChange();
      }
    },
    { type: 'separator' },
    
    // Grupo 5: Listas y formato de párrafo
    {
      icon: List,
      label: 'Lista con viñetas',
      command: () => {
        EditorCommands.insertList('ul');
        notifyChange();
      }
    },
    {
      icon: ListOrdered,
      label: 'Lista numerada',
      command: () => {
        EditorCommands.insertList('ol');
        notifyChange();
      }
    },
    {
      icon: Quote,
      label: 'Cita',
      command: () => {
        EditorCommands.formatBlock('blockquote');
        notifyChange();
      }
    },
    { type: 'separator' },
    
    // Grupo 6: Enlaces e imágenes
    {
      icon: Link,
      label: 'Insertar enlace',
      command: () => setShowLinkDialog(true)
    },
    {
      icon: Image,
      label: 'Insertar imagen',
      command: () => {
        EditorCommands.insertImage();
        notifyChange();
      }
    },
    { type: 'separator' },
    
    // Grupo 7: Elementos de contenido
    {
      icon: Square,
      label: 'Insertar recuadro',
      command: () => {
        EditorCommands.insertBox();
        notifyChange();
      }
    },
    {
      icon: CreditCard,
      label: 'Insertar tarjeta',
      command: () => {
        EditorCommands.insertCard();
        notifyChange();
      }
    },
    {
      icon: Table,
      label: 'Insertar tabla',
      command: () => {
        EditorCommands.insertTable();
        notifyChange();
      }
    },
    { type: 'separator' },
    
    // Grupo 7.5: Recuadros de texto con colores
    {
      icon: FileText,
      label: 'Recuadro azul',
      command: () => {
        EditorCommands.insertColoredTextBox('blue');
        notifyChange();
      }
    },
    {
      icon: FileText,
      label: 'Recuadro verde',
      command: () => {
        EditorCommands.insertColoredTextBox('green');
        notifyChange();
      }
    },
    {
      icon: FileText,
      label: 'Recuadro morado',
      command: () => {
        EditorCommands.insertColoredTextBox('purple');
        notifyChange();
      }
    },
    {
      icon: FileText,
      label: 'Recuadro naranja',
      command: () => {
        EditorCommands.insertColoredTextBox('orange');
        notifyChange();
      }
    },
    {
      icon: FileText,
      label: 'Recuadro rojo',
      command: () => {
        EditorCommands.insertColoredTextBox('red');
        notifyChange();
      }
    },
    {
      icon: Droplets,
      label: 'Cambiar color de recuadro',
      command: () => {
        const activeElement = document.querySelector('.selected') as HTMLElement;
        if (activeElement && activeElement.dataset.textBox) {
          const colors = ['blue', 'green', 'purple', 'orange', 'red'];
          const colorNames = ['Azul', 'Verde', 'Morado', 'Naranja', 'Rojo'];
          const choice = prompt(`Selecciona un color:\n${colorNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}`);
          const colorIndex = parseInt(choice || '0') - 1;
          if (colorIndex >= 0 && colorIndex < colors.length) {
            EditorCommands.changeTextBoxColor(activeElement, colors[colorIndex] as any);
            notifyChange();
          }
        } else {
          alert('Selecciona un recuadro de texto para cambiar su color');
        }
      }
    },
    { type: 'separator' },
    
    // Grupo 8: Formas geométricas
    {
      icon: Circle,
      label: 'Insertar círculo',
      command: () => {
        EditorCommands.insertCircle();
        notifyChange();
      }
    },
    {
      icon: Square,
      label: 'Insertar rectángulo',
      command: () => {
        EditorCommands.insertRectangle();
        notifyChange();
      }
    },
    {
      icon: Triangle,
      label: 'Insertar triángulo',
      command: () => {
        EditorCommands.insertTriangle();
        notifyChange();
      }
    },
    {
      icon: Star,
      label: 'Insertar estrella',
      command: () => {
        EditorCommands.insertStar();
        notifyChange();
      }
    },
    { type: 'separator' },
    
    // Grupo 9: Herramientas avanzadas
    {
      icon: Settings,
      label: 'Editor de fondo',
      command: () => setShowBackgroundEditor(true)
    },
    {
      icon: Palette,
      label: 'Selector de colores avanzado',
      command: () => setShowAdvancedColorPicker(true)
    },
    {
      icon: Layers,
      label: 'Gestor de capas',
      command: () => setShowLayerManager(true)
    }
  ];

  const handleColorSelect = (color: string) => {
    EditorCommands.setTextColor(color);
    setShowColorPicker(false);
    notifyChange();
  };

  const handleBackgroundColorSelect = (color: string) => {
    EditorCommands.setBackgroundColor(color);
    setShowBackgroundPicker(false);
    notifyChange();
  };

  const handleFontSizeSelect = (size: string) => {
    EditorCommands.setFontSize(size);
    setShowFontSizePicker(false);
    notifyChange();
  };

  const handleFontFamilySelect = (fontFamily: string) => {
    EditorCommands.setFontFamily(fontFamily);
    setShowFontFamilyPicker(false);
    notifyChange();
  };

  const handleLinkInsert = () => {
    if (linkUrl) {
      EditorCommands.insertLink(linkUrl);
      setLinkUrl('');
      setShowLinkDialog(false);
      notifyChange();
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex items-center space-x-1 max-w-4xl overflow-x-auto"
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
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-64 z-60">
          <div className="text-xs text-gray-500 mb-2">Color de texto</div>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Background Color Picker */}
      {showBackgroundPicker && (
        <div className="absolute top-full left-16 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-64 z-60">
          <div className="text-xs text-gray-500 mb-2">Color de fondo</div>
          <div className="grid grid-cols-5 gap-2">
            {backgroundColors.map((color) => (
              <button
                key={color}
                onClick={() => handleBackgroundColorSelect(color)}
                className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Font Size Picker */}
      {showFontSizePicker && (
        <div className="absolute top-full left-1/4 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-48 z-60 max-h-60 overflow-y-auto">
          <div className="text-xs text-gray-500 mb-2 px-2">Tamaño de fuente</div>
          <div className="grid grid-cols-3 gap-1">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => handleFontSizeSelect(size.value)}
                className="px-2 py-1 text-center hover:bg-blue-100 rounded transition-colors border border-gray-200"
                style={{ fontSize: '12px' }}
              >
                {size.label}px
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Font Family Picker */}
      {showFontFamilyPicker && (
        <div className="absolute top-full left-1/3 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-56 z-60">
          <div className="text-xs text-gray-500 mb-2 px-2">Tipo de fuente</div>
          {fontFamilies.map((font) => (
            <button
              key={font.value}
              onClick={() => handleFontFamilySelect(font.value)}
              className="w-full text-left px-3 py-2 hover:bg-blue-100 rounded transition-colors mb-1"
              style={{ fontFamily: font.value, fontSize: '14px' }}
            >
              {font.label}
            </button>
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

      {/* Background Editor */}
      <BackgroundEditor
        visible={showBackgroundEditor}
        onClose={() => setShowBackgroundEditor(false)}
        containerRef={containerRef}
      />

      {/* Layer Manager */}
      <LayerManager
        visible={showLayerManager}
        onClose={() => setShowLayerManager(false)}
        containerRef={containerRef}
        onLayerChange={() => {
          // Notificar cambios cuando se modifiquen las capas
          notifyChange();
        }}
      />

      {/* Advanced Color Picker */}
      {showAdvancedColorPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Selector de Colores Avanzado</h3>
              <button
                onClick={() => setShowAdvancedColorPicker(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ColorPicker
              onColorChange={(color: string) => {
                EditorCommands.setBackgroundColor(color);
                notifyChange();
                setShowAdvancedColorPicker(false);
              }}
              currentColor="#ffffff"
              showGradients={true}
            />
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