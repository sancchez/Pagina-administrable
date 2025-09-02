import React, { useState, useEffect } from 'react';
import { Palette, RotateCcw, Copy, Check } from 'lucide-react';

interface GradientTextEditorProps {
  element: HTMLElement | null;
  onClose: () => void;
  position: { x: number; y: number };
}

const GradientTextEditor: React.FC<GradientTextEditorProps> = ({ element, onClose, position }) => {
  const [gradientStart, setGradientStart] = useState('#3b82f6');
  const [gradientEnd, setGradientEnd] = useState('#10b981');
  const [gradientDirection, setGradientDirection] = useState('to-r');
  const [textColor, setTextColor] = useState('#ffffff');
  const [useGradient, setUseGradient] = useState(false);
  const [copied, setCopied] = useState(false);

  const gradientDirections = [
    { value: 'to-r', label: '→', name: 'Horizontal' },
    { value: 'to-l', label: '←', name: 'Horizontal Inv.' },
    { value: 'to-b', label: '↓', name: 'Vertical' },
    { value: 'to-t', label: '↑', name: 'Vertical Inv.' },
    { value: 'to-br', label: '↘', name: 'Diagonal' },
    { value: 'to-bl', label: '↙', name: 'Diagonal Inv.' },
    { value: 'to-tr', label: '↗', name: 'Diagonal Alt.' },
    { value: 'to-tl', label: '↖', name: 'Diagonal Alt. Inv.' }
  ];

  const presetGradients = [
    { name: 'Azul-Verde', start: '#3b82f6', end: '#10b981' },
    { name: 'Púrpura-Rosa', start: '#8b5cf6', end: '#ec4899' },
    { name: 'Naranja-Rojo', start: '#f97316', end: '#ef4444' },
    { name: 'Cian-Azul', start: '#06b6d4', end: '#3b82f6' },
    { name: 'Verde-Amarillo', start: '#10b981', end: '#f59e0b' },
    { name: 'Rosa-Púrpura', start: '#ec4899', end: '#8b5cf6' }
  ];

  // Detectar el estilo actual del elemento
  useEffect(() => {
    if (!element) return;

    const computedStyle = window.getComputedStyle(element);
    const backgroundImage = computedStyle.backgroundImage;
    
    if (backgroundImage && backgroundImage.includes('gradient')) {
      setUseGradient(true);
      // Intentar extraer colores del gradiente existente
      const colorMatches = backgroundImage.match(/#[0-9a-fA-F]{6}|rgb\([^)]+\)/g);
      if (colorMatches && colorMatches.length >= 2) {
        setGradientStart(colorMatches[0]);
        setGradientEnd(colorMatches[1]);
      }
    } else {
      setUseGradient(false);
      setTextColor(computedStyle.color || '#ffffff');
    }
  }, [element]);

  // Aplicar estilos al elemento
  const applyStyles = () => {
    if (!element) return;

    if (useGradient) {
      element.style.background = `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`;
      element.style.webkitBackgroundClip = 'text';
      element.style.backgroundClip = 'text';
      element.style.webkitTextFillColor = 'transparent';
      element.style.color = 'transparent';
      
      // Añadir clases de Tailwind para gradientes
      element.classList.remove('text-white', 'text-blue-100', 'text-gray-800', 'text-gray-600');
      element.classList.add('bg-clip-text', 'text-transparent');
    } else {
      element.style.background = '';
      element.style.webkitBackgroundClip = '';
      element.style.backgroundClip = '';
      element.style.webkitTextFillColor = '';
      element.style.color = textColor;
      
      element.classList.remove('bg-clip-text', 'text-transparent');
    }
  };

  // Aplicar estilos en tiempo real
  useEffect(() => {
    applyStyles();
  }, [gradientStart, gradientEnd, gradientDirection, textColor, useGradient]);

  const copyGradientCSS = () => {
    const css = `background: linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd});
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;`;
    
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const resetStyles = () => {
    if (!element) return;
    
    element.style.background = '';
    element.style.webkitBackgroundClip = '';
    element.style.backgroundClip = '';
    element.style.webkitTextFillColor = '';
    element.style.color = '';
    element.classList.remove('bg-clip-text', 'text-transparent');
    
    setUseGradient(false);
    setTextColor('#ffffff');
    setGradientStart('#3b82f6');
    setGradientEnd('#10b981');
    setGradientDirection('to-r');
  };

  if (!element) return null;

  return (
    <div 
      className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-[9999] max-w-sm w-80"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.min(position.y, window.innerHeight - 400)
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center space-x-2">
          <Palette className="h-5 w-5 text-blue-600" />
          <span>Editor de Texto</span>
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Selector de tipo */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de estilo
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => setUseGradient(false)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              !useGradient 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Color Sólido
          </button>
          <button
            onClick={() => setUseGradient(true)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              useGradient 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Gradiente
          </button>
        </div>
      </div>

      {/* Editor de color sólido */}
      {!useGradient && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color del texto
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#ffffff"
            />
          </div>
        </div>
      )}

      {/* Editor de gradiente */}
      {useGradient && (
        <div className="space-y-4">
          {/* Colores del gradiente */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color inicial
              </label>
              <div className="flex space-x-1">
                <input
                  type="color"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color final
              </label>
              <div className="flex space-x-1">
                <input
                  type="color"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* Dirección del gradiente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <div className="grid grid-cols-4 gap-1">
              {gradientDirections.map((direction) => (
                <button
                  key={direction.value}
                  onClick={() => setGradientDirection(direction.value)}
                  className={`p-2 text-lg rounded border-2 transition-all ${
                    gradientDirection === direction.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  title={direction.name}
                >
                  {direction.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gradientes predefinidos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gradientes predefinidos
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presetGradients.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setGradientStart(preset.start);
                    setGradientEnd(preset.end);
                  }}
                  className="h-8 rounded border border-gray-300 hover:scale-105 transition-transform"
                  style={{
                    background: `linear-gradient(to right, ${preset.start}, ${preset.end})`
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vista previa */}
      <div className="mt-4 p-3 bg-gray-900 rounded-lg">
        <div className="text-center">
          <span className="text-sm text-gray-400 block mb-1">Vista previa:</span>
          <div 
            className="text-lg font-bold"
            style={useGradient ? {
              background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            } : {
              color: textColor
            }}
          >
            Texto de ejemplo
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-2 mt-4">
        <button
          onClick={resetStyles}
          className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Resetear</span>
        </button>
        
        {useGradient && (
          <button
            onClick={copyGradientCSS}
            className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copiado' : 'Copiar CSS'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default GradientTextEditor;