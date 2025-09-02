import React, { useState, useRef } from 'react';
import { Copy, Palette } from 'lucide-react';

export interface TextStyle {
  fontSize: string;
  fontWeight: string;
  color: string;
  fontFamily: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textDecoration: string;
  textTransform: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
}

interface TextStyleCopierProps {
  onStyleCopied: (style: TextStyle) => void;
  className?: string;
}

export const TextStyleCopier: React.FC<TextStyleCopierProps> = ({ 
  onStyleCopied, 
  className = '' 
}) => {
  const [copiedStyle, setCopiedStyle] = useState<TextStyle | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);

  const extractTextStyle = (element: HTMLElement): TextStyle => {
    const computedStyle = window.getComputedStyle(element);
    
    return {
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      color: computedStyle.color,
      fontFamily: computedStyle.fontFamily,
      lineHeight: computedStyle.lineHeight,
      letterSpacing: computedStyle.letterSpacing,
      textAlign: computedStyle.textAlign as TextStyle['textAlign'],
      textDecoration: computedStyle.textDecoration,
      textTransform: computedStyle.textTransform as TextStyle['textTransform']
    };
  };

  const handleCopyStyle = () => {
    setIsSelecting(true);
    document.body.style.cursor = 'crosshair';
    
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'H1' || target.tagName === 'H2' || 
                     target.tagName === 'H3' || target.tagName === 'P' || 
                     target.tagName === 'SPAN' || target.tagName === 'DIV')) {
        const style = extractTextStyle(target);
        setCopiedStyle(style);
        targetRef.current = target;
        
        // Highlight the selected element
        target.style.outline = '2px solid #3b82f6';
        setTimeout(() => {
          target.style.outline = '';
        }, 1000);
      }
      
      cleanup();
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
      }
    };
    
    const cleanup = () => {
      setIsSelecting(false);
      document.body.style.cursor = '';
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleEscape);
    };
    
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleEscape);
  };

  const handleApplyStyle = () => {
    if (copiedStyle) {
      onStyleCopied(copiedStyle);
    }
  };

  return (
    <div className={`flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm ${className}`}>
      <button
        onClick={handleCopyStyle}
        disabled={isSelecting}
        className={`flex items-center gap-1 px-3 py-1 text-sm border rounded transition-colors ${
          isSelecting 
            ? 'bg-blue-100 border-blue-300 text-blue-700 cursor-crosshair' 
            : 'hover:bg-gray-50 border-gray-300'
        }`}
        title="Copiar estilo de texto"
      >
        <Copy size={14} />
        {isSelecting ? 'Selecciona texto...' : 'Copiar estilo'}
      </button>
      
      {copiedStyle && (
        <>
          <div className="w-px h-6 bg-gray-300" />
          <button
            onClick={handleApplyStyle}
            className="flex items-center gap-1 px-3 py-1 text-sm border border-green-300 rounded hover:bg-green-50 text-green-700 transition-colors"
            title="Aplicar estilo copiado"
          >
            <Palette size={14} />
            Aplicar estilo
          </button>
          <div 
            className="px-2 py-1 text-xs bg-gray-100 rounded border"
            style={{
              fontSize: copiedStyle.fontSize,
              fontWeight: copiedStyle.fontWeight,
              color: copiedStyle.color,
              fontFamily: copiedStyle.fontFamily
            }}
          >
            Vista previa
          </div>
        </>
      )}
    </div>
  );
};

export default TextStyleCopier;