import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Check, X, Type } from 'lucide-react';
import TextStyleCopier from './TextStyleCopier';

interface TextStyle {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  fontFamily?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
}

interface EditableTitleProps {
  initialText: string;
  onTextChange: (text: string) => void;
  className?: string;
  placeholder?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const EditableTitle: React.FC<EditableTitleProps> = ({
  initialText,
  onTextChange,
  className = '',
  placeholder = 'Escribe tu título aquí...',
  level = 1
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const [showStyleCopier, setShowStyleCopier] = useState(false);
  const [appliedStyle, setAppliedStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onTextChange(text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(initialText);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleStyleCopied = (style: TextStyle) => {
    const newStyle: React.CSSProperties = {};
    if (style.fontSize) newStyle.fontSize = style.fontSize;
    if (style.fontWeight) newStyle.fontWeight = style.fontWeight;
    if (style.color) newStyle.color = style.color;
    if (style.fontFamily) newStyle.fontFamily = style.fontFamily;
    if (style.lineHeight) newStyle.lineHeight = style.lineHeight;
    if (style.letterSpacing) newStyle.letterSpacing = style.letterSpacing;
    if (style.textAlign) newStyle.textAlign = style.textAlign;
    if (style.textDecoration) newStyle.textDecoration = style.textDecoration;
    if (style.textTransform) newStyle.textTransform = style.textTransform;
    setAppliedStyle(newStyle);
  };

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  const titleStyle = {
    ...appliedStyle,
    transition: 'all 0.2s ease',
    cursor: isEditing ? 'text' : 'pointer'
  };

  return (
    <div className={`relative group ${className}`}>
      {isEditing ? (
        <div className="flex items-center gap-2 mb-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-2 text-2xl font-bold border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder={placeholder}
            style={{
              fontSize: appliedStyle.fontSize,
              fontWeight: appliedStyle.fontWeight,
              color: appliedStyle.color,
              fontFamily: appliedStyle.fontFamily,
              lineHeight: appliedStyle.lineHeight,
              letterSpacing: appliedStyle.letterSpacing,
              textAlign: appliedStyle.textAlign,
              textDecoration: appliedStyle.textDecoration,
              textTransform: appliedStyle.textTransform
            }}
          />
          <button
            onClick={handleSave}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            title="Guardar cambios"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            title="Cancelar cambios"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowStyleCopier(!showStyleCopier)}
            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            title="Copiar estilo de texto"
          >
            <Type className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-2">
          <HeadingTag
            ref={titleRef}
            onClick={handleStartEdit}
            style={{
              ...titleStyle,
              fontSize: appliedStyle.fontSize,
              fontWeight: appliedStyle.fontWeight,
              color: appliedStyle.color,
              fontFamily: appliedStyle.fontFamily,
              lineHeight: appliedStyle.lineHeight,
              letterSpacing: appliedStyle.letterSpacing,
              textAlign: appliedStyle.textAlign,
              textDecoration: appliedStyle.textDecoration,
              textTransform: appliedStyle.textTransform
            }}
            className="flex-1 hover:bg-blue-50 p-2 rounded-lg border-2 border-transparent hover:border-blue-200"
          >
            {text || placeholder}
          </HeadingTag>
          <button
            onClick={handleStartEdit}
            className="opacity-0 group-hover:opacity-100 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            title="Editar título"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowStyleCopier(!showStyleCopier)}
            className="opacity-0 group-hover:opacity-100 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
            title="Copiar estilo de texto"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>
      )}

      {showStyleCopier && (
        <div className="absolute top-full left-0 z-50 mt-2 w-80">
          <TextStyleCopier
            onStyleCopied={handleStyleCopied}
            className="shadow-lg"
          />
        </div>
      )}

      {appliedStyle.color && (
        <div className="text-xs text-gray-500 mb-2">
          ✨ Estilo personalizado aplicado
        </div>
      )}
    </div>
  );
};

export default EditableTitle;