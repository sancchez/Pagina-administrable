import React from 'react';
import { ChevronDown, Palette, Type, Hash, Highlighter } from 'lucide-react';

export interface FormatPanelProps {
  activeElement?: HTMLElement;
  onFormatChange?: (format: string, value?: string) => void;
  className?: string;
}

export interface FontOption {
  value: string;
  label: string;
  style?: React.CSSProperties;
}

export interface ColorOption {
  value: string;
  label: string;
  preview: string;
}

export const FormatPanel: React.FC<FormatPanelProps> = ({
  activeElement,
  onFormatChange,
  className = ''
}) => {
  const [showFontDropdown, setShowFontDropdown] = React.useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = React.useState(false);
  const [currentFont, setCurrentFont] = React.useState('Arial');
  const [currentSize, setCurrentSize] = React.useState('14');
  const [currentColor, setCurrentColor] = React.useState('#000000');
  const [currentHighlight, setCurrentHighlight] = React.useState('transparent');

  const fontOptions: FontOption[] = [
    { value: 'Arial', label: 'Arial', style: { fontFamily: 'Arial, sans-serif' } },
    { value: 'Helvetica', label: 'Helvetica', style: { fontFamily: 'Helvetica, sans-serif' } },
    { value: 'Times New Roman', label: 'Times New Roman', style: { fontFamily: 'Times New Roman, serif' } },
    { value: 'Georgia', label: 'Georgia', style: { fontFamily: 'Georgia, serif' } },
    { value: 'Verdana', label: 'Verdana', style: { fontFamily: 'Verdana, sans-serif' } },
    { value: 'Courier New', label: 'Courier New', style: { fontFamily: 'Courier New, monospace' } },
    { value: 'Trebuchet MS', label: 'Trebuchet MS', style: { fontFamily: 'Trebuchet MS, sans-serif' } },
    { value: 'Impact', label: 'Impact', style: { fontFamily: 'Impact, sans-serif' } }
  ];

  const sizeOptions = [
    '8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '32', '36', '48', '72'
  ];

  const colorOptions: ColorOption[] = [
    { value: '#000000', label: 'Negro', preview: '#000000' },
    { value: '#333333', label: 'Gris oscuro', preview: '#333333' },
    { value: '#666666', label: 'Gris', preview: '#666666' },
    { value: '#999999', label: 'Gris claro', preview: '#999999' },
    { value: '#FFFFFF', label: 'Blanco', preview: '#FFFFFF' },
    { value: '#FF0000', label: 'Rojo', preview: '#FF0000' },
    { value: '#00FF00', label: 'Verde', preview: '#00FF00' },
    { value: '#0000FF', label: 'Azul', preview: '#0000FF' },
    { value: '#FFFF00', label: 'Amarillo', preview: '#FFFF00' },
    { value: '#FF00FF', label: 'Magenta', preview: '#FF00FF' },
    { value: '#00FFFF', label: 'Cian', preview: '#00FFFF' },
    { value: '#FFA500', label: 'Naranja', preview: '#FFA500' },
    { value: '#800080', label: 'Púrpura', preview: '#800080' },
    { value: '#008000', label: 'Verde oscuro', preview: '#008000' },
    { value: '#000080', label: 'Azul marino', preview: '#000080' },
    { value: '#800000', label: 'Granate', preview: '#800000' }
  ];

  const highlightOptions: ColorOption[] = [
    { value: 'transparent', label: 'Sin resaltado', preview: 'transparent' },
    { value: '#FFFF00', label: 'Amarillo', preview: '#FFFF00' },
    { value: '#00FF00', label: 'Verde', preview: '#00FF00' },
    { value: '#00FFFF', label: 'Cian', preview: '#00FFFF' },
    { value: '#FF00FF', label: 'Magenta', preview: '#FF00FF' },
    { value: '#FFA500', label: 'Naranja', preview: '#FFA500' },
    { value: '#FFB6C1', label: 'Rosa claro', preview: '#FFB6C1' },
    { value: '#98FB98', label: 'Verde claro', preview: '#98FB98' },
    { value: '#87CEEB', label: 'Azul cielo', preview: '#87CEEB' }
  ];

  React.useEffect(() => {
    const updateCurrentStyles = () => {
      if (activeElement) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
            ? range.commonAncestorContainer.parentElement 
            : range.commonAncestorContainer as Element;
          
          if (parentElement) {
            const computedStyle = window.getComputedStyle(parentElement);
            setCurrentFont(computedStyle.fontFamily.split(',')[0].replace(/["']/g, ''));
            setCurrentSize(parseInt(computedStyle.fontSize).toString());
            setCurrentColor(computedStyle.color);
            setCurrentHighlight(computedStyle.backgroundColor);
          }
        }
      }
    };

    updateCurrentStyles();
    document.addEventListener('selectionchange', updateCurrentStyles);
    
    return () => {
      document.removeEventListener('selectionchange', updateCurrentStyles);
    };
  }, [activeElement]);

  const executeCommand = (command: string, value?: string) => {
    if (activeElement) {
      document.execCommand(command, false, value);
      onFormatChange?.(command, value);
    }
  };

  const handleFontChange = (font: string) => {
    setCurrentFont(font);
    executeCommand('fontName', font);
    setShowFontDropdown(false);
  };

  const handleSizeChange = (size: string) => {
    setCurrentSize(size);
    executeCommand('fontSize', '3'); // HTML fontSize usa valores 1-7
    // Aplicar tamaño real con CSS
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = size + 'px';
        try {
          range.surroundContents(span);
        } catch (e) {
          span.appendChild(range.extractContents());
          range.insertNode(span);
        }
      }
    }
    setShowSizeDropdown(false);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    executeCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const handleHighlightChange = (color: string) => {
    setCurrentHighlight(color);
    if (color === 'transparent') {
      executeCommand('removeFormat');
    } else {
      executeCommand('backColor', color);
    }
    setShowHighlightPicker(false);
  };

  const Dropdown: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
  }> = ({ isOpen, onClose, children, className = '' }) => {
    React.useEffect(() => {
      if (isOpen) {
        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as Element;
          if (!target.closest('.dropdown-container')) {
            onClose();
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div className={`
        absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50
        max-h-60 overflow-y-auto dropdown-container
        ${className}
      `}>
        {children}
      </div>
    );
  };

  if (!activeElement) {
    return null;
  }

  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg shadow-lg p-3
      flex items-center space-x-4 flex-wrap
      ${className}
    `}>
      {/* Selector de fuente */}
      <div className="relative">
        <button
          onClick={() => setShowFontDropdown(!showFontDropdown)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Type size={16} />
          <span className="text-sm font-medium min-w-[80px] text-left">{currentFont}</span>
          <ChevronDown size={14} />
        </button>
        
        <Dropdown isOpen={showFontDropdown} onClose={() => setShowFontDropdown(false)} className="w-48">
          {fontOptions.map((font) => (
            <button
              key={font.value}
              onClick={() => handleFontChange(font.value)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors"
              style={font.style}
            >
              {font.label}
            </button>
          ))}
        </Dropdown>
      </div>

      {/* Selector de tamaño */}
      <div className="relative">
        <button
          onClick={() => setShowSizeDropdown(!showSizeDropdown)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Hash size={16} />
          <span className="text-sm font-medium min-w-[30px] text-left">{currentSize}</span>
          <ChevronDown size={14} />
        </button>
        
        <Dropdown isOpen={showSizeDropdown} onClose={() => setShowSizeDropdown(false)} className="w-20">
          {sizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors text-sm"
            >
              {size}
            </button>
          ))}
        </Dropdown>
      </div>

      {/* Selector de color de texto */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Palette size={16} />
          <div 
            className="w-4 h-4 border border-gray-300 rounded"
            style={{ backgroundColor: currentColor }}
          />
          <ChevronDown size={14} />
        </button>
        
        <Dropdown isOpen={showColorPicker} onClose={() => setShowColorPicker(false)} className="w-48">
          <div className="grid grid-cols-4 gap-2 p-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className="w-8 h-8 border border-gray-300 rounded hover:scale-110 transition-transform"
                style={{ backgroundColor: color.preview }}
                title={color.label}
              />
            ))}
          </div>
        </Dropdown>
      </div>

      {/* Selector de resaltado */}
      <div className="relative">
        <button
          onClick={() => setShowHighlightPicker(!showHighlightPicker)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Highlighter size={16} />
          <div 
            className="w-4 h-4 border border-gray-300 rounded"
            style={{ backgroundColor: currentHighlight }}
          />
          <ChevronDown size={14} />
        </button>
        
        <Dropdown isOpen={showHighlightPicker} onClose={() => setShowHighlightPicker(false)} className="w-48">
          <div className="grid grid-cols-3 gap-2 p-2">
            {highlightOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => handleHighlightChange(color.value)}
                className="w-8 h-8 border border-gray-300 rounded hover:scale-110 transition-transform"
                style={{ backgroundColor: color.preview }}
                title={color.label}
              />
            ))}
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default FormatPanel;