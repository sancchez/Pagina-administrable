import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Palette, Eye, EyeOff } from 'lucide-react';

interface UniversalTextEditorProps {
  element: HTMLElement;
  position: { x: number; y: number };
  onClose: () => void;
}

interface TextStyles {
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  color: string;
  backgroundColor: string;
  textAlign: string;
  lineHeight: string;
  letterSpacing: string;
  textShadow: string;
  background: string;
  backgroundImage: string;
  backgroundClip: string;
  webkitBackgroundClip: string;
  webkitTextFillColor: string;
}

export default function UniversalTextEditor({ element, position, onClose }: UniversalTextEditorProps) {
  const [styles, setStyles] = useState<TextStyles>({
    fontSize: '16px',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    color: '#000000',
    backgroundColor: 'transparent',
    textAlign: 'left',
    lineHeight: '1.5',
    letterSpacing: '0px',
    textShadow: 'none',
    background: '',
    backgroundImage: '',
    backgroundClip: '',
    webkitBackgroundClip: '',
    webkitTextFillColor: ''
  });
  
  const [isGradientMode, setIsGradientMode] = useState(false);
  const [gradientStart, setGradientStart] = useState('#3b82f6');
  const [gradientEnd, setGradientEnd] = useState('#10b981');
  const [gradientDirection, setGradientDirection] = useState('to right');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Detectar y cargar estilos existentes del elemento
  useEffect(() => {
    if (!element) return;

    const computedStyle = window.getComputedStyle(element);
    const currentStyles: TextStyles = {
      fontSize: computedStyle.fontSize || '16px',
      fontWeight: computedStyle.fontWeight || 'normal',
      fontStyle: computedStyle.fontStyle || 'normal',
      textDecoration: computedStyle.textDecoration || 'none',
      color: computedStyle.color || '#000000',
      backgroundColor: computedStyle.backgroundColor || 'transparent',
      textAlign: computedStyle.textAlign || 'left',
      lineHeight: computedStyle.lineHeight || '1.5',
      letterSpacing: computedStyle.letterSpacing || '0px',
      textShadow: computedStyle.textShadow || 'none',
      background: computedStyle.background || '',
      backgroundImage: computedStyle.backgroundImage || '',
      backgroundClip: computedStyle.backgroundClip || '',
      webkitBackgroundClip: (computedStyle as any).webkitBackgroundClip || '',
      webkitTextFillColor: (computedStyle as any).webkitTextFillColor || ''
    };

    setStyles(currentStyles);

    // Detectar si ya tiene gradiente
    if (currentStyles.backgroundImage && currentStyles.backgroundImage.includes('gradient')) {
      setIsGradientMode(true);
      // Extraer colores del gradiente si es posible
      const gradientMatch = currentStyles.backgroundImage.match(/rgb\([^)]+\)|#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/g);
      if (gradientMatch && gradientMatch.length >= 2) {
        setGradientStart(gradientMatch[0]);
        setGradientEnd(gradientMatch[1]);
      }
    }
  }, [element]);

  // Aplicar estilos al elemento en tiempo real
  const applyStyles = (newStyles: Partial<TextStyles>) => {
    if (!element) return;

    const updatedStyles = { ...styles, ...newStyles };
    setStyles(updatedStyles);

    // Aplicar estilos básicos
    element.style.fontSize = updatedStyles.fontSize;
    element.style.fontWeight = updatedStyles.fontWeight;
    element.style.fontStyle = updatedStyles.fontStyle;
    element.style.textDecoration = updatedStyles.textDecoration;
    element.style.textAlign = updatedStyles.textAlign;
    element.style.lineHeight = updatedStyles.lineHeight;
    element.style.letterSpacing = updatedStyles.letterSpacing;
    element.style.textShadow = updatedStyles.textShadow;

    // Aplicar color o gradiente
    if (isGradientMode) {
      const gradient = `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`;
      element.style.background = gradient;
      element.style.backgroundClip = 'text';
      element.style.webkitBackgroundClip = 'text';
      element.style.webkitTextFillColor = 'transparent';
      element.style.color = 'transparent';
    } else {
      element.style.color = updatedStyles.color;
      element.style.backgroundColor = updatedStyles.backgroundColor;
      element.style.background = '';
      element.style.backgroundClip = '';
      element.style.webkitBackgroundClip = '';
      element.style.webkitTextFillColor = '';
    }
  };

  // Funciones de formato rápido
  const toggleBold = () => {
    const newWeight = styles.fontWeight === 'bold' ? 'normal' : 'bold';
    applyStyles({ fontWeight: newWeight });
  };

  const toggleItalic = () => {
    const newStyle = styles.fontStyle === 'italic' ? 'normal' : 'italic';
    applyStyles({ fontStyle: newStyle });
  };

  const toggleUnderline = () => {
    const newDecoration = styles.textDecoration.includes('underline') ? 'none' : 'underline';
    applyStyles({ textDecoration: newDecoration });
  };

  const setAlignment = (align: string) => {
    applyStyles({ textAlign: align });
  };

  const toggleGradientMode = () => {
    setIsGradientMode(!isGradientMode);
    if (!isGradientMode) {
      // Activar modo gradiente
      const gradient = `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`;
      element.style.background = gradient;
      element.style.backgroundClip = 'text';
      element.style.webkitBackgroundClip = 'text';
      element.style.webkitTextFillColor = 'transparent';
    } else {
      // Desactivar modo gradiente
      element.style.background = '';
      element.style.backgroundClip = '';
      element.style.webkitBackgroundClip = '';
      element.style.webkitTextFillColor = '';
      element.style.color = styles.color;
    }
  };

  const updateGradient = () => {
    if (isGradientMode && element) {
      const gradient = `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`;
      element.style.background = gradient;
      element.style.backgroundClip = 'text';
      element.style.webkitBackgroundClip = 'text';
      element.style.webkitTextFillColor = 'transparent';
    }
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
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-80"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Editor de Texto Universal</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg font-bold"
        >
          ×
        </button>
      </div>

      {/* Barra de herramientas rápida */}
      <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded">
        <button
          onClick={toggleBold}
          className={`p-2 rounded ${styles.fontWeight === 'bold' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          title="Negrita"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={toggleItalic}
          className={`p-2 rounded ${styles.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          title="Cursiva"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={toggleUnderline}
          className={`p-2 rounded ${styles.textDecoration.includes('underline') ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          title="Subrayado"
        >
          <Underline size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          onClick={() => setAlignment('left')}
          className={`p-2 rounded ${styles.textAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          title="Alinear izquierda"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => setAlignment('center')}
          className={`p-2 rounded ${styles.textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          title="Centrar"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => setAlignment('right')}
          className={`p-2 rounded ${styles.textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          title="Alinear derecha"
        >
          <AlignRight size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          onClick={toggleGradientMode}
          className={`p-2 rounded ${isGradientMode ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          title="Modo gradiente"
        >
          <Palette size={16} />
        </button>
      </div>

      {/* Controles de tamaño y tipografía */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <Type size={16} className="text-gray-600" />
          <label className="text-sm text-gray-600 min-w-20">Tamaño:</label>
          <input
            type="range"
            min="8"
            max="72"
            value={parseInt(styles.fontSize)}
            onChange={(e) => applyStyles({ fontSize: `${e.target.value}px` })}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 min-w-12">{styles.fontSize}</span>
        </div>
      </div>

      {/* Controles de color/gradiente */}
      {!isGradientMode ? (
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 min-w-20">Color:</label>
            <input
              type="color"
              value={styles.color}
              onChange={(e) => applyStyles({ color: e.target.value })}
              className="w-12 h-8 rounded border"
            />
            <span className="text-sm text-gray-600">{styles.color}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 min-w-20">Inicio:</label>
            <input
              type="color"
              value={gradientStart}
              onChange={(e) => {
                setGradientStart(e.target.value);
                updateGradient();
              }}
              className="w-12 h-8 rounded border"
            />
            <span className="text-sm text-gray-600">{gradientStart}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 min-w-20">Final:</label>
            <input
              type="color"
              value={gradientEnd}
              onChange={(e) => {
                setGradientEnd(e.target.value);
                updateGradient();
              }}
              className="w-12 h-8 rounded border"
            />
            <span className="text-sm text-gray-600">{gradientEnd}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 min-w-20">Dirección:</label>
            <select
              value={gradientDirection}
              onChange={(e) => {
                setGradientDirection(e.target.value);
                updateGradient();
              }}
              className="flex-1 px-2 py-1 border rounded text-sm"
            >
              <option value="to right">Horizontal →</option>
              <option value="to bottom">Vertical ↓</option>
              <option value="to bottom right">Diagonal ↘</option>
              <option value="to bottom left">Diagonal ↙</option>
            </select>
          </div>
        </div>
      )}

      {/* Controles avanzados */}
      <div className="border-t pt-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-3"
        >
          {showAdvanced ? <EyeOff size={16} /> : <Eye size={16} />}
          {showAdvanced ? 'Ocultar' : 'Mostrar'} opciones avanzadas
        </button>

        {showAdvanced && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 min-w-20">Espaciado:</label>
              <input
                type="range"
                min="-2"
                max="10"
                step="0.1"
                value={parseFloat(styles.letterSpacing)}
                onChange={(e) => applyStyles({ letterSpacing: `${e.target.value}px` })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 min-w-12">{styles.letterSpacing}</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 min-w-20">Altura línea:</label>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.1"
                value={parseFloat(styles.lineHeight)}
                onChange={(e) => applyStyles({ lineHeight: e.target.value })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 min-w-12">{styles.lineHeight}</span>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 mt-4 pt-3 border-t">
        <button
          onClick={() => {
            // Resetear estilos
            const resetStyles: TextStyles = {
              fontSize: '16px',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textDecoration: 'none',
              color: '#000000',
              backgroundColor: 'transparent',
              textAlign: 'left',
              lineHeight: '1.5',
              letterSpacing: '0px',
              textShadow: 'none',
              background: '',
              backgroundImage: '',
              backgroundClip: '',
              webkitBackgroundClip: '',
              webkitTextFillColor: ''
            };
            setStyles(resetStyles);
            setIsGradientMode(false);
            applyStyles(resetStyles);
          }}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          Resetear
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex-1"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}