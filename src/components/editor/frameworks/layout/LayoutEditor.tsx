import { useState, useRef, useEffect } from 'react';
import { Layout, Grid, Columns, Box, Palette, Settings, Copy } from 'lucide-react';

interface LayoutEditorProps {
  position: { x: number; y: number };
  onLayoutCreate: (layoutHTML: string) => void;
  onClose: () => void;
  existingLayout?: HTMLElement | null;
}

interface LayoutStyle {
  type: 'container' | 'grid' | 'flexbox' | 'columns';
  width: string;
  height: string;
  backgroundColor: string;
  padding: number;
  margin: number;
  borderRadius: number;
  boxShadow: boolean;
  // Grid específico
  gridColumns: number;
  gridRows: number;
  gridGap: number;
  // Flexbox específico
  flexDirection: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  flexWrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  flexGap: number;
  // Columns específico
  columnCount: number;
  columnGap: number;
  columnRule: string;
}

export default function LayoutEditor({ position, onLayoutCreate, onClose, existingLayout }: LayoutEditorProps) {
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>({
    type: 'container',
    width: '100%',
    height: 'auto',
    backgroundColor: '#ffffff',
    padding: 16,
    margin: 0,
    borderRadius: 0,
    boxShadow: false,
    gridColumns: 3,
    gridRows: 2,
    gridGap: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    flexGap: 16,
    columnCount: 2,
    columnGap: 20,
    columnRule: '1px solid #e5e7eb'
  });

  const [activeTab, setActiveTab] = useState<'layout' | 'style'>('layout');
  const [showPreview, setShowPreview] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  // Cargar layout existente si se proporciona
  useEffect(() => {
    if (existingLayout) {
      const computedStyle = window.getComputedStyle(existingLayout);
      setLayoutStyle(prev => ({
        ...prev,
        backgroundColor: computedStyle.backgroundColor,
        padding: parseInt(computedStyle.padding) || 16,
        borderRadius: parseInt(computedStyle.borderRadius) || 0
      }));
    }
  }, [existingLayout]);

  // Generar CSS del layout
  const generateLayoutCSS = () => {
    const baseStyles = {
      width: layoutStyle.width,
      height: layoutStyle.height,
      backgroundColor: layoutStyle.backgroundColor,
      padding: `${layoutStyle.padding}px`,
      margin: `${layoutStyle.margin}px`,
      borderRadius: `${layoutStyle.borderRadius}px`,
      boxShadow: layoutStyle.boxShadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
    };

    let specificStyles = {};

    switch (layoutStyle.type) {
      case 'grid':
        specificStyles = {
          display: 'grid',
          gridTemplateColumns: `repeat(${layoutStyle.gridColumns}, 1fr)`,
          gridTemplateRows: `repeat(${layoutStyle.gridRows}, 1fr)`,
          gap: `${layoutStyle.gridGap}px`
        };
        break;
      case 'flexbox':
        specificStyles = {
          display: 'flex',
          flexDirection: layoutStyle.flexDirection,
          justifyContent: layoutStyle.justifyContent,
          alignItems: layoutStyle.alignItems,
          flexWrap: layoutStyle.flexWrap,
          gap: `${layoutStyle.flexGap}px`
        };
        break;
      case 'columns':
        specificStyles = {
          columnCount: layoutStyle.columnCount,
          columnGap: `${layoutStyle.columnGap}px`,
          columnRule: layoutStyle.columnRule
        };
        break;
      default:
        specificStyles = {
          display: 'block'
        };
    }

    return { ...baseStyles, ...specificStyles };
  };

  // Generar HTML del layout
  const generateLayoutHTML = () => {
    const styles = generateLayoutCSS();
    const styleString = Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');

    let content = '';
    
    if (layoutStyle.type === 'grid') {
      for (let i = 0; i < layoutStyle.gridColumns * layoutStyle.gridRows; i++) {
        content += `<div style="background-color: #f3f4f6; padding: 16px; border-radius: 4px; min-height: 60px;" contenteditable="true">Elemento ${i + 1}</div>`;
      }
    } else if (layoutStyle.type === 'flexbox') {
      for (let i = 0; i < 3; i++) {
        content += `<div style="background-color: #f3f4f6; padding: 16px; border-radius: 4px; min-height: 60px; flex: 1;" contenteditable="true">Elemento ${i + 1}</div>`;
      }
    } else if (layoutStyle.type === 'columns') {
      content = `<p contenteditable="true">Este es un ejemplo de texto en columnas. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>`;
    } else {
      content = `<div style="background-color: #f3f4f6; padding: 16px; border-radius: 4px; min-height: 100px;" contenteditable="true">Contenido del contenedor</div>`;
    }

    return `<div style="${styleString}" data-movable="true" data-resizable="true">${content}</div>`;
  };

  // Copiar CSS al portapapeles
  const copyCSS = () => {
    const styles = generateLayoutCSS();
    const cssText = Object.entries(styles)
      .map(([key, value]) => `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
      .join('\n');
    
    navigator.clipboard.writeText(`.layout {\n${cssText}\n}`);
  };

  // Aplicar layout
  const applyLayout = () => {
    const layoutHTML = generateLayoutHTML();
    onLayoutCreate(layoutHTML);
    onClose();
  };

  return (
    <div
      ref={editorRef}
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 w-80 max-h-96 overflow-y-auto"
      style={{
        left: position.x,
        top: position.y,
        transform: position.x > window.innerWidth - 320 ? 'translateX(-100%)' : 'none'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Layout className="w-5 h-5" />
          Editor de Layout
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b">
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-3 py-2 text-sm font-medium ${
            activeTab === 'layout'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Layout
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`px-3 py-2 text-sm font-medium ${
            activeTab === 'style'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Estilo
        </button>
      </div>

      {/* Layout Tab */}
      {activeTab === 'layout' && (
        <div className="space-y-4">
          {/* Tipo de Layout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Layout
            </label>
            <select
              value={layoutStyle.type}
              onChange={(e) => setLayoutStyle(prev => ({ ...prev, type: e.target.value as LayoutStyle['type'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="container">Contenedor</option>
              <option value="grid">Grid</option>
              <option value="flexbox">Flexbox</option>
              <option value="columns">Columnas</option>
            </select>
          </div>

          {/* Grid específico */}
          {layoutStyle.type === 'grid' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Columnas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={layoutStyle.gridColumns}
                    onChange={(e) => setLayoutStyle(prev => ({ ...prev, gridColumns: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={layoutStyle.gridRows}
                    onChange={(e) => setLayoutStyle(prev => ({ ...prev, gridRows: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Espacio: {layoutStyle.gridGap}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={layoutStyle.gridGap}
                  onChange={(e) => setLayoutStyle(prev => ({ ...prev, gridGap: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Flexbox específico */}
          {layoutStyle.type === 'flexbox' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <select
                  value={layoutStyle.flexDirection}
                  onChange={(e) => setLayoutStyle(prev => ({ ...prev, flexDirection: e.target.value as LayoutStyle['flexDirection'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="row">Fila</option>
                  <option value="column">Columna</option>
                  <option value="row-reverse">Fila Inversa</option>
                  <option value="column-reverse">Columna Inversa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificación
                </label>
                <select
                  value={layoutStyle.justifyContent}
                  onChange={(e) => setLayoutStyle(prev => ({ ...prev, justifyContent: e.target.value as LayoutStyle['justifyContent'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="flex-start">Inicio</option>
                  <option value="center">Centro</option>
                  <option value="flex-end">Final</option>
                  <option value="space-between">Espacio Entre</option>
                  <option value="space-around">Espacio Alrededor</option>
                  <option value="space-evenly">Espacio Uniforme</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Espacio: {layoutStyle.flexGap}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={layoutStyle.flexGap}
                  onChange={(e) => setLayoutStyle(prev => ({ ...prev, flexGap: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Columns específico */}
          {layoutStyle.type === 'columns' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Columnas
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={layoutStyle.columnCount}
                  onChange={(e) => setLayoutStyle(prev => ({ ...prev, columnCount: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Espacio: {layoutStyle.columnGap}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={layoutStyle.columnGap}
                  onChange={(e) => setLayoutStyle(prev => ({ ...prev, columnGap: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Style Tab */}
      {activeTab === 'style' && (
        <div className="space-y-4">
          {/* Dimensiones */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancho
              </label>
              <input
                type="text"
                value={layoutStyle.width}
                onChange={(e) => setLayoutStyle(prev => ({ ...prev, width: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="100%, 300px, auto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alto
              </label>
              <input
                type="text"
                value={layoutStyle.height}
                onChange={(e) => setLayoutStyle(prev => ({ ...prev, height: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="auto, 200px, 100vh"
              />
            </div>
          </div>

          {/* Color de fondo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color de Fondo
            </label>
            <input
              type="color"
              value={layoutStyle.backgroundColor}
              onChange={(e) => setLayoutStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          {/* Espaciado */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Padding: {layoutStyle.padding}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={layoutStyle.padding}
                onChange={(e) => setLayoutStyle(prev => ({ ...prev, padding: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margin: {layoutStyle.margin}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={layoutStyle.margin}
                onChange={(e) => setLayoutStyle(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Radius: {layoutStyle.borderRadius}px
            </label>
            <input
              type="range"
              min="0"
              max="25"
              value={layoutStyle.borderRadius}
              onChange={(e) => setLayoutStyle(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Box Shadow */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="boxShadow"
              checked={layoutStyle.boxShadow}
              onChange={(e) => setLayoutStyle(prev => ({ ...prev, boxShadow: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="boxShadow" className="text-sm font-medium text-gray-700">
              Sombra
            </label>
          </div>
        </div>
      )}

      {/* Preview */}
      {showPreview && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Vista Previa</span>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div 
            className="border border-gray-200 rounded p-2 text-xs"
            style={{
              ...generateLayoutCSS(),
              transform: 'scale(0.8)',
              transformOrigin: 'top left',
              width: '125%',
              height: 'auto',
              minHeight: '60px'
            }}
          >
            {layoutStyle.type === 'grid' && (
              Array.from({ length: Math.min(layoutStyle.gridColumns * layoutStyle.gridRows, 6) }, (_, i) => (
                <div key={i} className="bg-blue-100 p-1 rounded text-center">
                  {i + 1}
                </div>
              ))
            )}
            {layoutStyle.type === 'flexbox' && (
              Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="bg-green-100 p-1 rounded text-center flex-1">
                  {i + 1}
                </div>
              ))
            )}
            {layoutStyle.type === 'columns' && (
              <div className="text-xs">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
              </div>
            )}
            {layoutStyle.type === 'container' && (
              <div className="bg-purple-100 p-2 rounded text-center">
                Contenedor
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={applyLayout}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Aplicar
        </button>
        <button
          onClick={copyCSS}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center gap-1"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}