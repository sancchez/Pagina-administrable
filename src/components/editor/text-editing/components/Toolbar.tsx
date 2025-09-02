import React from 'react';
import { TextEditingManager } from '../core/TextEditingManager';

interface ToolbarProps {
  manager: TextEditingManager;
  onFormatChange?: (format: string, value?: any) => void;
}

interface FormatButton {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  isActive?: boolean;
}

/**
 * Barra de herramientas para el editor de texto
 * Proporciona opciones de formato y funcionalidades avanzadas
 */
export const Toolbar: React.FC<ToolbarProps> = ({ manager, onFormatChange }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [activeFormats, setActiveFormats] = React.useState<Set<string>>(new Set());

  // Escuchar cambios en el estado del manager
  React.useEffect(() => {
    const unsubscribe = manager.subscribe(() => {
      const state = manager.getState();
      setIsVisible(state.isActive && state.activeElement !== null);
      
      if (state.activeElement) {
        updateActiveFormats(state.activeElement);
      }
    });

    return unsubscribe;
  }, [manager]);

  const updateActiveFormats = (element: HTMLElement) => {
    const formats = new Set<string>();
    const computedStyle = window.getComputedStyle(element);
    
    // Detectar formatos activos
    if (computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 600) {
      formats.add('bold');
    }
    if (computedStyle.fontStyle === 'italic') {
      formats.add('italic');
    }
    if (computedStyle.textDecoration.includes('underline')) {
      formats.add('underline');
    }
    
    setActiveFormats(formats);
  };

  const applyFormat = (format: string, value?: any) => {
    const state = manager.getState();
    if (!state.activeElement) return;

    const element = state.activeElement;
    
    switch (format) {
      case 'bold':
        element.style.fontWeight = activeFormats.has('bold') ? 'normal' : 'bold';
        break;
      case 'italic':
        element.style.fontStyle = activeFormats.has('italic') ? 'normal' : 'italic';
        break;
      case 'underline':
        element.style.textDecoration = activeFormats.has('underline') ? 'none' : 'underline';
        break;
      case 'fontSize':
        element.style.fontSize = value + 'px';
        break;
      case 'color':
        element.style.color = value;
        break;
      case 'align':
        element.style.textAlign = value;
        break;
    }
    
    updateActiveFormats(element);
    onFormatChange?.(format, value);
  };

  const formatButtons: FormatButton[] = [
    {
      id: 'bold',
      label: 'Negrita',
      icon: '𝐁',
      action: () => applyFormat('bold'),
      isActive: activeFormats.has('bold')
    },
    {
      id: 'italic',
      label: 'Cursiva',
      icon: '𝐼',
      action: () => applyFormat('italic'),
      isActive: activeFormats.has('italic')
    },
    {
      id: 'underline',
      label: 'Subrayado',
      icon: '𝐔',
      action: () => applyFormat('underline'),
      isActive: activeFormats.has('underline')
    }
  ];

  const alignmentButtons: FormatButton[] = [
    {
      id: 'align-left',
      label: 'Alinear izquierda',
      icon: '⬅',
      action: () => applyFormat('align', 'left')
    },
    {
      id: 'align-center',
      label: 'Centrar',
      icon: '↔',
      action: () => applyFormat('align', 'center')
    },
    {
      id: 'align-right',
      label: 'Alinear derecha',
      icon: '➡',
      action: () => applyFormat('align', 'right')
    }
  ];

  if (!isVisible) {
    return null;
  }

  return (
    <div className="text-editing-toolbar">
      <div className="toolbar-section">
        <span className="toolbar-label">Formato:</span>
        {formatButtons.map(button => (
          <button
            key={button.id}
            className={`toolbar-button ${button.isActive ? 'active' : ''}`}
            onClick={button.action}
            title={button.label}
            type="button"
          >
            {button.icon}
          </button>
        ))}
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-section">
        <span className="toolbar-label">Alineación:</span>
        {alignmentButtons.map(button => (
          <button
            key={button.id}
            className="toolbar-button"
            onClick={button.action}
            title={button.label}
            type="button"
          >
            {button.icon}
          </button>
        ))}
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-section">
        <label className="toolbar-label">
          Tamaño:
          <select 
            className="toolbar-select"
            onChange={(e) => applyFormat('fontSize', e.target.value)}
            defaultValue="16"
          >
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
            <option value="24">24px</option>
            <option value="32">32px</option>
          </select>
        </label>
        
        <label className="toolbar-label">
          Color:
          <input
            type="color"
            className="toolbar-color"
            onChange={(e) => applyFormat('color', e.target.value)}
            defaultValue="#000000"
          />
        </label>
      </div>
    </div>
  );
};