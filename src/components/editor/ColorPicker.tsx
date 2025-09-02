import React, { useState } from 'react';
import { Palette, Layers, Pipette } from 'lucide-react';

interface ColorPickerProps {
  onColorChange: (color: string) => void;
  currentColor?: string;
  showGradients?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  onColorChange, 
  currentColor = '#ffffff',
  showGradients = true 
}) => {
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>('solid');
  const [customColor, setCustomColor] = useState(currentColor);

  // Colores sólidos predefinidos
  const solidColors = [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd',
    '#6c757d', '#495057', '#343a40', '#212529', '#000000',
    '#fff3cd', '#ffeaa7', '#fdcb6e', '#e17055', '#d63031',
    '#fd79a8', '#e84393', '#a29bfe', '#6c5ce7', '#74b9ff',
    '#0984e3', '#00b894', '#00cec9', '#55a3ff', '#81ecec'
  ];

  // Gradientes predefinidos
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)',
    'linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)',
    'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
  ];

  const handleSolidColorClick = (color: string) => {
    setCustomColor(color);
    onColorChange(color);
  };

  const handleGradientClick = (gradient: string) => {
    onColorChange(gradient);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('solid')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'solid'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Palette size={16} />
          Colores Sólidos
        </button>
        {showGradients && (
          <button
            onClick={() => setActiveTab('gradient')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'gradient'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers size={16} />
            Gradientes
          </button>
        )}
      </div>

      {/* Contenido de las tabs */}
      {activeTab === 'solid' && (
        <div>
          {/* Selector de color personalizado */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Pipette size={16} className="inline mr-1" />
              Color Personalizado
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    onColorChange(e.target.value);
                  }
                }}
                className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Paleta de colores predefinidos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colores Predefinidos
            </label>
            <div className="grid grid-cols-11 gap-1">
              {solidColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleSolidColorClick(color)}
                  className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                    customColor === color ? 'border-blue-500 shadow-md' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gradient' && showGradients && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gradientes Predefinidos
          </label>
          <div className="grid grid-cols-3 gap-2">
            {gradients.map((gradient, index) => (
              <button
                key={index}
                onClick={() => handleGradientClick(gradient)}
                className="w-full h-12 rounded border-2 border-gray-300 transition-all hover:scale-105 hover:border-blue-500"
                style={{ background: gradient }}
                title={`Gradiente ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;