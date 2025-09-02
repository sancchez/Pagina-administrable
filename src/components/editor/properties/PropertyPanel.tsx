import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  RotateCw, 
  Move, 
  Type, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import ColorPicker from '../ColorPicker';

interface PropertySection {
  id: string;
  name: string;
  expanded: boolean;
}

interface ComponentProperties {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
  // Propiedades específicas por tipo
  [key: string]: any;
}

interface PropertyPanelProps {
  selectedComponent: ComponentProperties | null;
  onPropertyChange: (property: string, value: any) => void;
  onDeleteComponent: () => void;
  onDuplicateComponent: () => void;
  isVisible: boolean;
  onToggle: () => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedComponent,
  onPropertyChange,
  onDeleteComponent,
  onDuplicateComponent,
  isVisible,
  onToggle
}) => {
  const [sections, setSections] = useState<PropertySection[]>([
    { id: 'transform', name: 'Transformación', expanded: true },
    { id: 'appearance', name: 'Apariencia', expanded: true },
    { id: 'content', name: 'Contenido', expanded: true },
    { id: 'advanced', name: 'Avanzado', expanded: false }
  ]);

  const toggleSection = (sectionId: string) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  const handleInputChange = (property: string, value: any) => {
    onPropertyChange(property, value);
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (selectedComponent) {
      onPropertyChange('position', {
        ...selectedComponent.position,
        [axis]: value
      });
    }
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    if (selectedComponent) {
      onPropertyChange('size', {
        ...selectedComponent.size,
        [dimension]: value
      });
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={onToggle}
          className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-r-lg shadow-lg transition-colors"
          title="Abrir panel de propiedades"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (!selectedComponent) {
    return (
      <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-xl z-40 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Propiedades</h3>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 p-1 rounded"
              title="Cerrar panel"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Selecciona un componente para editar sus propiedades</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Propiedades</h3>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
            title="Cerrar panel"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        </div>
        
        {/* Component Info */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-800 capitalize">
            {selectedComponent.type}
          </div>
          <div className="text-xs text-blue-600">ID: {selectedComponent.id}</div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onDuplicateComponent}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <Copy className="w-4 h-4" />
            Duplicar
          </button>
          <button
            onClick={onDeleteComponent}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Transformación */}
        {sections.find(s => s.id === 'transform')?.expanded && (
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('transform')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">Transformación</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Posición */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Posición</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">X</label>
                    <input
                      type="number"
                      value={selectedComponent.position.x}
                      onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Y</label>
                    <input
                      type="number"
                      value={selectedComponent.position.y}
                      onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tamaño */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Ancho</label>
                    <input
                      type="number"
                      value={selectedComponent.size.width}
                      onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Alto</label>
                    <input
                      type="number"
                      value={selectedComponent.size.height}
                      onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rotación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rotación</label>
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedComponent.rotation || 0}
                    onChange={(e) => handleInputChange('rotation', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={selectedComponent.rotation || 0}
                    onChange={(e) => handleInputChange('rotation', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500">°</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Apariencia */}
        {sections.find(s => s.id === 'appearance')?.expanded && (
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('appearance')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">Apariencia</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Opacidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opacidad</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedComponent.opacity || 1}
                    onChange={(e) => handleInputChange('opacity', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {Math.round((selectedComponent.opacity || 1) * 100)}%
                  </span>
                </div>
              </div>

              {/* Visibilidad */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedComponent.visible !== false}
                    onChange={(e) => handleInputChange('visible', e.target.checked)}
                    className="rounded"
                  />
                  {selectedComponent.visible !== false ? (
                    <Eye className="w-4 h-4 text-gray-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">Visible</span>
                </label>
              </div>

              {/* Color de fondo (si aplica) */}
              {(selectedComponent.backgroundColor || selectedComponent.type === 'rectangle' || selectedComponent.type === 'circle') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color de fondo</label>
                  <ColorPicker
                    color={selectedComponent.backgroundColor || '#3b82f6'}
                    onChange={(color) => handleInputChange('backgroundColor', color)}
                  />
                </div>
              )}

              {/* Color de texto (si aplica) */}
              {(selectedComponent.color || selectedComponent.type.includes('heading') || selectedComponent.type === 'text' || selectedComponent.type === 'paragraph') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color de texto</label>
                  <ColorPicker
                    color={selectedComponent.color || '#000000'}
                    onChange={(color) => handleInputChange('color', color)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenido */}
        {sections.find(s => s.id === 'content')?.expanded && (
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('content')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">Contenido</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Texto (si aplica) */}
              {selectedComponent.text !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Texto</label>
                  <textarea
                    value={selectedComponent.text || ''}
                    onChange={(e) => handleInputChange('text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Tamaño de fuente (si aplica) */}
              {selectedComponent.fontSize !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño de fuente</label>
                  <input
                    type="text"
                    value={selectedComponent.fontSize || '1rem'}
                    onChange={(e) => handleInputChange('fontSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ej: 1.5rem, 24px"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Avanzado */}
        {sections.find(s => s.id === 'advanced')?.expanded && (
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('advanced')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">Avanzado</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Z-Index */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orden de capas (Z-Index)</label>
                <input
                  type="number"
                  value={selectedComponent.zIndex || 0}
                  onChange={(e) => handleInputChange('zIndex', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;