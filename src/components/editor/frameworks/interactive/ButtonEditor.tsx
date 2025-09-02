import { useState, useRef, useEffect } from 'react';
import { Palette, Settings, Copy } from 'lucide-react';

interface ButtonEditorProps {
  position: { x: number; y: number };
  onButtonCreate: (buttonHTML: string) => void;
  onClose: () => void;
  existingButton?: HTMLButtonElement;
}

interface ButtonStyle {
  text: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: { x: number; y: number };
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '500' | '600' | '700';
  hoverBackgroundColor: string;
  hoverTextColor: string;
  shadow: boolean;
  gradient: {
    enabled: boolean;
    start: string;
    end: string;
    direction: string;
  };
  animation: 'none' | 'pulse' | 'bounce' | 'scale';
}

interface ButtonAction {
  type: 'link' | 'javascript' | 'submit' | 'button';
  value: string;
  target?: '_blank' | '_self';
}

export default function ButtonEditor({ position, onButtonCreate, onClose, existingButton }: ButtonEditorProps) {
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>({
    text: 'Mi Botón',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    borderColor: '#3b82f6',
    borderWidth: 1,
    borderRadius: 6,
    padding: { x: 16, y: 8 },
    fontSize: 14,
    fontWeight: '500',
    hoverBackgroundColor: '#2563eb',
    hoverTextColor: '#ffffff',
    shadow: true,
    gradient: {
      enabled: false,
      start: '#3b82f6',
      end: '#1d4ed8',
      direction: 'to right'
    },
    animation: 'none'
  });

  const [buttonAction, setButtonAction] = useState<ButtonAction>({
    type: 'button',
    value: '',
    target: '_self'
  });

  const [activeTab, setActiveTab] = useState<'style' | 'action'>('style');
  const [showPresets, setShowPresets] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Cargar botón existente si se proporciona
  useEffect(() => {
    if (existingButton) {
      const computedStyle = window.getComputedStyle(existingButton);
      setButtonStyle(prev => ({
        ...prev,
        text: existingButton.textContent || 'Mi Botón',
        backgroundColor: computedStyle.backgroundColor,
        textColor: computedStyle.color,
        borderRadius: parseInt(computedStyle.borderRadius) || 6,
        fontSize: parseInt(computedStyle.fontSize) || 14
      }));
    }
  }, [existingButton]);

  // Presets de botones
  const buttonPresets = {
    primary: {
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      borderColor: '#3b82f6',
      hoverBackgroundColor: '#2563eb',
      hoverTextColor: '#ffffff',
      gradient: { enabled: false, start: '#3b82f6', end: '#1d4ed8', direction: 'to right' }
    },
    secondary: {
      backgroundColor: '#6b7280',
      textColor: '#ffffff',
      borderColor: '#6b7280',
      hoverBackgroundColor: '#4b5563',
      hoverTextColor: '#ffffff',
      gradient: { enabled: false, start: '#6b7280', end: '#374151', direction: 'to right' }
    },
    success: {
      backgroundColor: '#10b981',
      textColor: '#ffffff',
      borderColor: '#10b981',
      hoverBackgroundColor: '#059669',
      hoverTextColor: '#ffffff',
      gradient: { enabled: false, start: '#10b981', end: '#047857', direction: 'to right' }
    },
    danger: {
      backgroundColor: '#ef4444',
      textColor: '#ffffff',
      borderColor: '#ef4444',
      hoverBackgroundColor: '#dc2626',
      hoverTextColor: '#ffffff',
      gradient: { enabled: false, start: '#ef4444', end: '#b91c1c', direction: 'to right' }
    },
    outline: {
      backgroundColor: 'transparent',
      textColor: '#3b82f6',
      borderColor: '#3b82f6',
      hoverBackgroundColor: '#3b82f6',
      hoverTextColor: '#ffffff',
      gradient: { enabled: false, start: '#3b82f6', end: '#1d4ed8', direction: 'to right' }
    },
    gradient: {
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      borderColor: '#3b82f6',
      hoverBackgroundColor: '#2563eb',
      hoverTextColor: '#ffffff',
      gradient: { enabled: true, start: '#3b82f6', end: '#8b5cf6', direction: 'to right' }
    }
  };

  // Aplicar preset
  const applyPreset = (presetName: keyof typeof buttonPresets) => {
    const preset = buttonPresets[presetName];
    setButtonStyle(prev => ({
      ...prev,
      ...preset,
      hoverTextColor: preset.hoverTextColor || prev.hoverTextColor
    }));
  };

  // Generar CSS del botón
  const generateButtonCSS = () => {
    const baseStyles = {
      backgroundColor: buttonStyle.gradient.enabled 
        ? 'transparent' 
        : buttonStyle.backgroundColor,
      background: buttonStyle.gradient.enabled 
        ? `linear-gradient(${buttonStyle.gradient.direction}, ${buttonStyle.gradient.start}, ${buttonStyle.gradient.end})`
        : buttonStyle.backgroundColor,
      color: buttonStyle.textColor,
      border: `${buttonStyle.borderWidth}px solid ${buttonStyle.borderColor}`,
      borderRadius: `${buttonStyle.borderRadius}px`,
      padding: `${buttonStyle.padding.y}px ${buttonStyle.padding.x}px`,
      fontSize: `${buttonStyle.fontSize}px`,
      fontWeight: buttonStyle.fontWeight,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: buttonStyle.shadow ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
      animation: buttonStyle.animation !== 'none' ? `${buttonStyle.animation} 2s infinite` : 'none'
    };

    return Object.entries(baseStyles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  };

  // Generar HTML del botón
  const generateButtonHTML = () => {
    const buttonCSS = generateButtonCSS();
    const hoverCSS = `
      background: ${buttonStyle.gradient.enabled 
        ? `linear-gradient(${buttonStyle.gradient.direction}, ${buttonStyle.gradient.start}, ${buttonStyle.gradient.end})`
        : buttonStyle.hoverBackgroundColor} !important;
      color: ${buttonStyle.hoverTextColor} !important;
      transform: translateY(-1px);
    `;

    let buttonHTML = '';
    
    if (buttonAction.type === 'link') {
      buttonHTML = `<a href="${buttonAction.value}" target="${buttonAction.target}" style="${buttonCSS}; text-decoration: none; display: inline-block;" data-movable="true" onmouseover="this.style.cssText += '${hoverCSS}'" onmouseout="this.style.cssText = '${buttonCSS}; text-decoration: none; display: inline-block;'">${buttonStyle.text}</a>`;
    } else {
      const actionAttr = buttonAction.type === 'javascript' ? `onclick="${buttonAction.value}"` : '';
      const typeAttr = buttonAction.type === 'submit' ? 'type="submit"' : 'type="button"';
      buttonHTML = `<button ${typeAttr} ${actionAttr} style="${buttonCSS}" data-movable="true" onmouseover="this.style.cssText += '${hoverCSS}'" onmouseout="this.style.cssText = '${buttonCSS}'">${buttonStyle.text}</button>`;
    }

    return buttonHTML;
  };

  // Copiar CSS
  const copyCSS = () => {
    const css = generateButtonCSS();
    navigator.clipboard.writeText(css);
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={editorRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 max-h-96 overflow-y-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-semibold text-gray-800">Editor de Botones</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg font-bold"
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            activeTab === 'style'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Palette size={14} className="inline mr-1" /> Estilo
        </button>
        <button
          onClick={() => setActiveTab('action')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            activeTab === 'action'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={14} className="inline mr-1" /> Acción
        </button>
      </div>

      {/* Vista previa */}
      <div className="p-3 border-b bg-gray-50 text-center">
        <div className="mb-2 text-xs text-gray-600">Vista previa:</div>
        <button
          style={{
            backgroundColor: buttonStyle.gradient.enabled 
              ? 'transparent' 
              : buttonStyle.backgroundColor,
            background: buttonStyle.gradient.enabled 
              ? `linear-gradient(${buttonStyle.gradient.direction}, ${buttonStyle.gradient.start}, ${buttonStyle.gradient.end})`
              : buttonStyle.backgroundColor,
            color: buttonStyle.textColor,
            border: `${buttonStyle.borderWidth}px solid ${buttonStyle.borderColor}`,
            borderRadius: `${buttonStyle.borderRadius}px`,
            padding: `${buttonStyle.padding.y}px ${buttonStyle.padding.x}px`,
            fontSize: `${buttonStyle.fontSize}px`,
            fontWeight: buttonStyle.fontWeight,
            cursor: 'pointer',
            boxShadow: buttonStyle.shadow ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          {buttonStyle.text}
        </button>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'style' && (
        <div className="p-3 space-y-3">
          {/* Presets */}
          <div>
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="w-full text-left text-xs font-medium text-gray-700 mb-2"
            >
              Estilos predefinidos {showPresets ? '▼' : '▶'}
            </button>
            {showPresets && (
              <div className="grid grid-cols-2 gap-1 mb-3">
                {Object.keys(buttonPresets).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset as keyof typeof buttonPresets)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 capitalize"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Texto */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Texto</label>
            <input
              type="text"
              value={buttonStyle.text}
              onChange={(e) => setButtonStyle(prev => ({ ...prev, text: e.target.value }))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>

          {/* Colores */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color de fondo</label>
              <input
                type="color"
                value={buttonStyle.backgroundColor}
                onChange={(e) => setButtonStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-full h-8 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color de texto</label>
              <input
                type="color"
                value={buttonStyle.textColor}
                onChange={(e) => setButtonStyle(prev => ({ ...prev, textColor: e.target.value }))}
                className="w-full h-8 border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Gradiente */}
          <div>
            <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
              <input
                type="checkbox"
                checked={buttonStyle.gradient.enabled}
                onChange={(e) => setButtonStyle(prev => ({ 
                  ...prev, 
                  gradient: { ...prev.gradient, enabled: e.target.checked }
                }))}
                className="mr-2"
              />
              Gradiente
            </label>
            {buttonStyle.gradient.enabled && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="color"
                  value={buttonStyle.gradient.start}
                  onChange={(e) => setButtonStyle(prev => ({ 
                    ...prev, 
                    gradient: { ...prev.gradient, start: e.target.value }
                  }))}
                  className="w-full h-6 border border-gray-300 rounded"
                />
                <input
                  type="color"
                  value={buttonStyle.gradient.end}
                  onChange={(e) => setButtonStyle(prev => ({ 
                    ...prev, 
                    gradient: { ...prev.gradient, end: e.target.value }
                  }))}
                  className="w-full h-6 border border-gray-300 rounded"
                />
              </div>
            )}
          </div>

          {/* Tamaño y espaciado */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño de fuente</label>
              <input
                type="number"
                value={buttonStyle.fontSize}
                onChange={(e) => setButtonStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                min="8"
                max="24"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Radio del borde</label>
              <input
                type="number"
                value={buttonStyle.borderRadius}
                onChange={(e) => setButtonStyle(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                min="0"
                max="20"
              />
            </div>
          </div>

          {/* Opciones adicionales */}
          <div className="flex items-center gap-4">
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={buttonStyle.shadow}
                onChange={(e) => setButtonStyle(prev => ({ ...prev, shadow: e.target.checked }))}
                className="mr-1"
              />
              Sombra
            </label>
            <select
              value={buttonStyle.animation}
              onChange={(e) => setButtonStyle(prev => ({ ...prev, animation: e.target.value as any }))}
              className="text-xs border border-gray-300 rounded px-1 py-1"
            >
              <option value="none">Sin animación</option>
              <option value="pulse">Pulso</option>
              <option value="bounce">Rebote</option>
              <option value="scale">Escala</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'action' && (
        <div className="p-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de acción</label>
            <select
              value={buttonAction.type}
              onChange={(e) => setButtonAction(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="button">Botón simple</option>
              <option value="link">Enlace</option>
              <option value="javascript">JavaScript</option>
              <option value="submit">Enviar formulario</option>
            </select>
          </div>

          {buttonAction.type === 'link' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={buttonAction.value}
                  onChange={(e) => setButtonAction(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="https://ejemplo.com"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Destino</label>
                <select
                  value={buttonAction.target}
                  onChange={(e) => setButtonAction(prev => ({ ...prev, target: e.target.value as any }))}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                >
                  <option value="_self">Misma ventana</option>
                  <option value="_blank">Nueva ventana</option>
                </select>
              </div>
            </>
          )}

          {buttonAction.type === 'javascript' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Código JavaScript</label>
              <textarea
                value={buttonAction.value}
                onChange={(e) => setButtonAction(prev => ({ ...prev, value: e.target.value }))}
                placeholder="alert('¡Hola mundo!');"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded h-16 resize-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2 p-3 border-t">
        <button
          onClick={() => {
            const buttonHTML = generateButtonHTML();
            onButtonCreate(buttonHTML);
            onClose();
          }}
          className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Insertar Botón
        </button>
        <button
          onClick={copyCSS}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          title="Copiar CSS"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}