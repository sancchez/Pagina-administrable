import React, { useState, useEffect } from 'react';
import { Palette, Image, X, Droplets, Square, Circle, Triangle, Minus, Eye, Grid, Sparkles } from 'lucide-react';

interface BackgroundEditorProps {
  visible: boolean;
  onClose: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image' | 'pattern' | 'shapes';
  value: string;
  opacity?: number;
}

const BackgroundEditor: React.FC<BackgroundEditorProps> = ({
  visible,
  onClose,
  containerRef
}) => {
  const [activeTab, setActiveTab] = useState<'color' | 'gradient' | 'image' | 'pattern' | 'shapes'>('color');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [gradientStart, setGradientStart] = useState('#3b82f6');
  const [gradientEnd, setGradientEnd] = useState('#1d4ed8');
  const [gradientDirection, setGradientDirection] = useState('to-br');
  const [imageUrl, setImageUrl] = useState('');
  const [opacity, setOpacity] = useState(100);

  const [selectedPattern, setSelectedPattern] = useState('dots');
  const [patternColor, setPatternColor] = useState('#e5e7eb');
  const [patternSize, setPatternSize] = useState(20);
  const [selectedShape, setSelectedShape] = useState('circle');
  const [shapeColor, setShapeColor] = useState('#3b82f6');
  const [shapeSize, setShapeSize] = useState(50);
  const [shapeSpacing, setShapeSpacing] = useState(100);

  const predefinedColors = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
    '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a',
    '#10b981', '#059669', '#047857', '#065f46',
    '#f59e0b', '#d97706', '#b45309', '#92400e',
    '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
    '#ec4899', '#db2777', '#be185d', '#9d174d'
  ];

  const colorCombinations = [
    { name: 'Océano', colors: ['#0ea5e9', '#0284c7', '#0369a1'] },
    { name: 'Atardecer', colors: ['#f97316', '#ea580c', '#dc2626'] },
    { name: 'Bosque', colors: ['#22c55e', '#16a34a', '#15803d'] },
    { name: 'Lavanda', colors: ['#a855f7', '#9333ea', '#7c3aed'] },
    { name: 'Rosa', colors: ['#ec4899', '#db2777', '#be185d'] },
    { name: 'Dorado', colors: ['#fbbf24', '#f59e0b', '#d97706'] },
    { name: 'Gris', colors: ['#6b7280', '#4b5563', '#374151'] },
    { name: 'Azul Noche', colors: ['#1e40af', '#1e3a8a', '#1d4ed8'] }
  ];

  const gradientDirections = [
    { value: 'to-r', label: 'Horizontal →' },
    { value: 'to-l', label: '← Horizontal' },
    { value: 'to-b', label: 'Vertical ↓' },
    { value: 'to-t', label: '↑ Vertical' },
    { value: 'to-br', label: 'Diagonal ↘' },
    { value: 'to-bl', label: '↙ Diagonal' },
    { value: 'to-tr', label: 'Diagonal ↗' },
    { value: 'to-tl', label: '↖ Diagonal' }
  ];

  const patterns = [
    { id: 'dots', name: 'Puntos', icon: '•' },
    { id: 'grid', name: 'Cuadrícula', icon: '⊞' },
    { id: 'diagonal', name: 'Diagonal', icon: '⟋' },
    { id: 'waves', name: 'Ondas', icon: '〜' },
    { id: 'zigzag', name: 'Zigzag', icon: '⩙' },
    { id: 'hexagon', name: 'Hexágonos', icon: '⬡' }
  ];

  const shapes = [
    { id: 'circle', name: 'Círculos', icon: Circle },
    { id: 'square', name: 'Cuadrados', icon: Square },
    { id: 'triangle', name: 'Triángulos', icon: Triangle },
    { id: 'line', name: 'Líneas', icon: Minus }
  ];

  const generatePatternCSS = () => {
    const size = patternSize;
    const color = patternColor;
    
    switch (selectedPattern) {
      case 'dots':
        return `radial-gradient(circle at ${size/4}px ${size/4}px, ${color} 2px, transparent 2px)`;
      case 'grid':
        return `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
      case 'diagonal':
        return `repeating-linear-gradient(45deg, transparent, transparent ${size/2}px, ${color} ${size/2}px, ${color} ${size}px)`;
      case 'waves':
        return `radial-gradient(ellipse at top, ${color}, transparent), radial-gradient(ellipse at bottom, ${color}, transparent)`;
      case 'zigzag':
        return `linear-gradient(135deg, ${color} 25%, transparent 25%), linear-gradient(225deg, ${color} 25%, transparent 25%)`;
      case 'hexagon':
        return `radial-gradient(circle at 50% 50%, ${color} 30%, transparent 30%)`;
      default:
        return '';
    }
  };

  const generateShapeCSS = () => {
    const size = shapeSize;
    const spacing = shapeSpacing;
    const color = shapeColor;
    
    switch (selectedShape) {
      case 'circle':
        return `radial-gradient(circle at center, ${color} ${size/2}px, transparent ${size/2}px)`;
      case 'square':
        return `linear-gradient(${color}, ${color})`;
      case 'triangle':
        return `conic-gradient(from 0deg at 50% 50%, ${color} 120deg, transparent 120deg)`;
      case 'line':
        return `repeating-linear-gradient(0deg, ${color}, ${color} 2px, transparent 2px, transparent ${spacing}px)`;
      default:
        return '';
    }
  };

  const getPreviewStyle = () => {
    const baseStyle: React.CSSProperties = {
      opacity: opacity / 100
    };

    switch (activeTab) {
      case 'color':
        return {
          ...baseStyle,
          backgroundColor: selectedColor,
          backgroundImage: 'none'
        };
      case 'gradient':
        const direction = gradientDirection.replace('to-', '');
        return {
          ...baseStyle,
          backgroundImage: `linear-gradient(${direction}, ${gradientStart}, ${gradientEnd})`,
          backgroundColor: 'transparent'
        };
      case 'image':
        return {
          ...baseStyle,
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'pattern':
        return {
          ...baseStyle,
          backgroundColor: selectedColor,
          backgroundImage: generatePatternCSS(),
          backgroundSize: `${patternSize}px ${patternSize}px`
        };
      case 'shapes':
        return {
          ...baseStyle,
          backgroundColor: selectedColor,
          backgroundImage: generateShapeCSS(),
          backgroundSize: `${shapeSpacing}px ${shapeSpacing}px`
        };
      default:
        return baseStyle;
    }
  };

  const handleApply = () => {
    if (containerRef?.current) {
      const container = containerRef.current;
      const style = getPreviewStyle();
      
      Object.assign(container.style, style);
    }
    
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      {/* Editor Principal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-lg shadow-xl w-[1200px] h-[85vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Editor de Fondo Avanzado</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Layout de dos columnas */}
          <div className="flex flex-1 overflow-hidden">
            {/* Columna izquierda - Menú de selección */}
            <div className="w-1/2 border-r flex flex-col">
              {/* Tabs */}
               <div className="flex flex-wrap border-b">
                 <button
                   onClick={() => setActiveTab('color')}
                   className={`flex-1 py-2 px-2 text-xs font-medium flex items-center justify-center space-x-1 ${
                     activeTab === 'color'
                       ? 'border-b-2 border-blue-500 text-blue-600'
                       : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <Palette className="h-3 w-3" />
                   <span>Color</span>
                 </button>
                 <button
                   onClick={() => setActiveTab('gradient')}
                   className={`flex-1 py-2 px-2 text-xs font-medium flex items-center justify-center space-x-1 ${
                     activeTab === 'gradient'
                       ? 'border-b-2 border-blue-500 text-blue-600'
                       : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <Droplets className="h-3 w-3" />
                   <span>Degradado</span>
                 </button>
                 <button
                   onClick={() => setActiveTab('pattern')}
                   className={`flex-1 py-2 px-2 text-xs font-medium flex items-center justify-center space-x-1 ${
                     activeTab === 'pattern'
                       ? 'border-b-2 border-blue-500 text-blue-600'
                       : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <Grid className="h-3 w-3" />
                   <span>Patrones</span>
                 </button>
                 <button
                   onClick={() => setActiveTab('shapes')}
                   className={`flex-1 py-2 px-2 text-xs font-medium flex items-center justify-center space-x-1 ${
                     activeTab === 'shapes'
                       ? 'border-b-2 border-blue-500 text-blue-600'
                       : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <Sparkles className="h-3 w-3" />
                   <span>Formas</span>
                 </button>
                 <button
                   onClick={() => setActiveTab('image')}
                   className={`flex-1 py-2 px-2 text-xs font-medium flex items-center justify-center space-x-1 ${
                     activeTab === 'image'
                       ? 'border-b-2 border-blue-500 text-blue-600'
                       : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <Image className="h-3 w-3" />
                   <span>Imagen</span>
                 </button>
               </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Color Tab */}
            {activeTab === 'color' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color personalizado
                  </label>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full h-12 rounded border border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Combinaciones predefinidas
                  </label>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {colorCombinations.map((combo) => (
                      <div key={combo.name} className="text-center">
                        <div className="flex space-x-1 mb-1">
                          {combo.colors.map((color, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedColor(color)}
                              className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">{combo.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Colores básicos
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded border-2 hover:scale-110 transition-transform ${
                          selectedColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Gradient Tab */}
            {activeTab === 'gradient' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color inicial
                    </label>
                    <input
                      type="color"
                      value={gradientStart}
                      onChange={(e) => setGradientStart(e.target.value)}
                      className="w-full h-12 rounded border border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color final
                    </label>
                    <input
                      type="color"
                      value={gradientEnd}
                      onChange={(e) => setGradientEnd(e.target.value)}
                      className="w-full h-12 rounded border border-gray-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dirección del degradado
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {gradientDirections.map((direction) => (
                      <button
                        key={direction.value}
                        onClick={() => setGradientDirection(direction.value)}
                        className={`p-3 text-sm rounded border-2 transition-all ${
                          gradientDirection === direction.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {direction.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Degradados predefinidos
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {colorCombinations.map((combo) => (
                      <button
                        key={combo.name}
                        onClick={() => {
                          setGradientStart(combo.colors[0]);
                          setGradientEnd(combo.colors[combo.colors.length - 1]);
                        }}
                        className="h-16 rounded border-2 border-gray-300 hover:border-blue-500 transition-all"
                        style={{
                          background: `linear-gradient(to right, ${combo.colors[0]}, ${combo.colors[combo.colors.length - 1]})`
                        }}
                        title={combo.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pattern Tab */}
            {activeTab === 'pattern' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color de fondo
                  </label>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full h-12 rounded border border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de patrón
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {patterns.map((pattern) => (
                      <button
                        key={pattern.id}
                        onClick={() => setSelectedPattern(pattern.id)}
                        className={`p-4 rounded border-2 text-center transition-all ${
                          selectedPattern === pattern.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-2xl mb-1">{pattern.icon}</div>
                        <div className="text-sm">{pattern.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color del patrón
                  </label>
                  <input
                    type="color"
                    value={patternColor}
                    onChange={(e) => setPatternColor(e.target.value)}
                    className="w-full h-12 rounded border border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño del patrón: {patternSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={patternSize}
                    onChange={(e) => setPatternSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Shapes Tab */}
            {activeTab === 'shapes' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color de fondo
                  </label>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full h-12 rounded border border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de forma
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {shapes.map((shape) => {
                      const IconComponent = shape.icon;
                      return (
                        <button
                          key={shape.id}
                          onClick={() => setSelectedShape(shape.id)}
                          className={`p-4 rounded border-2 flex items-center space-x-3 transition-all ${
                            selectedShape === shape.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <IconComponent className="h-6 w-6" />
                          <span>{shape.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color de las formas
                  </label>
                  <input
                    type="color"
                    value={shapeColor}
                    onChange={(e) => setShapeColor(e.target.value)}
                    className="w-full h-12 rounded border border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño de las formas: {shapeSize}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={shapeSize}
                    onChange={(e) => setShapeSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Espaciado: {shapeSpacing}px
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={shapeSpacing}
                    onChange={(e) => setShapeSpacing(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Image Tab */}
            {activeTab === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la imagen
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {imageUrl && (
                  <div className="border rounded p-2">
                    <img
                      src={imageUrl}
                      alt="Vista previa"
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

                {/* Opacity Control - Común para todas las pestañas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacidad: {opacity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApply}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Aplicar Fondo
                </button>
              </div>
            </div>
            
            {/* Columna derecha - Vista previa */}
            <div className="w-1/2 flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-700">Vista Previa</h4>
                <p className="text-sm text-gray-500">Así se verá tu fondo aplicado</p>
              </div>
              <div className="flex-1 p-4">
                <div 
                  className="w-full h-full rounded-lg border-2 border-gray-200 overflow-hidden"
                  style={getPreviewStyle()}
                >
                  <div className="p-8 h-full flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg max-w-md text-center">
                      <h5 className="text-xl font-bold text-gray-800 mb-2">Contenido de ejemplo</h5>
                      <p className="text-gray-600 mb-4">Este es un ejemplo de cómo se verá el contenido sobre tu fondo personalizado.</p>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-300 rounded"></div>
                        <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
         </div>
       </div>
    </>
  );
};

export default BackgroundEditor;