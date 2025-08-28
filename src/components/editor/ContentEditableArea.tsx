import React, { useRef, useEffect, useState } from 'react';

interface ContentEditableAreaProps {
  content: string;
  onChange: (content: string) => void;
  onSelectionChange: (selection: Selection | null, element: HTMLElement | null) => void;
  className?: string;
}

const ContentEditableArea: React.FC<ContentEditableAreaProps> = ({
  content,
  onChange,
  onSelectionChange,
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [lastContent, setLastContent] = useState(content);

  useEffect(() => {
    console.log('🎨 ContentEditableArea useEffect - content recibido:', content?.substring(0, 100) + '...');
    console.log('📊 lastContent:', lastContent?.substring(0, 100) + '...');
    console.log('🔄 isEditing:', isEditing);
    console.log('📍 editorRef.current existe:', !!editorRef.current);
    
    if (editorRef.current && content !== lastContent) {
      console.log('✅ Actualizando innerHTML del editor');
      // Solo actualizar si el contenido cambió externamente
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const startOffset = range?.startOffset || 0;
      const endOffset = range?.endOffset || 0;
      const startContainer = range?.startContainer;
      
      editorRef.current.innerHTML = content;
      setLastContent(content);
      console.log('🎯 innerHTML actualizado, nuevo contenido visible:', editorRef.current.innerHTML.substring(0, 100) + '...');
      
      // Restaurar la posición del cursor si estaba editando
      if (isEditing && startContainer && editorRef.current.contains(startContainer)) {
        console.log('🔄 Restaurando posición del cursor');
        try {
          const newRange = document.createRange();
          newRange.setStart(startContainer, Math.min(startOffset, startContainer.textContent?.length || 0));
          newRange.setEnd(startContainer, Math.min(endOffset, startContainer.textContent?.length || 0));
          selection?.removeAllRanges();
          selection?.addRange(newRange);
        } catch (e) {
          console.log('⚠️ Error restaurando cursor, colocando al final');
          // Si hay error restaurando el cursor, colocarlo al final
          const newRange = document.createRange();
          newRange.selectNodeContents(editorRef.current);
          newRange.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(newRange);
        }
      }
    } else {
      console.log('⏭️ No actualizando innerHTML - contenido igual o editor no existe');
    }
  }, [content, lastContent, isEditing]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setLastContent(newContent);
      onChange(newContent);
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    const activeElement = document.activeElement;
    
    if (selection && activeElement && editorRef.current?.contains(activeElement)) {
      onSelectionChange(selection, activeElement as HTMLElement);
    } else {
      onSelectionChange(null, null);
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
    document.addEventListener('selectionchange', handleSelectionChange);
  };

  const handleBlur = () => {
    setIsEditing(false);
    document.removeEventListener('selectionchange', handleSelectionChange);
    onSelectionChange(null, null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Atajos de teclado
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          break;
      }
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`
        min-h-[600px] p-6 bg-white border-2 border-gray-200 rounded-lg
        focus:border-blue-500 focus:outline-none transition-colors
        prose prose-lg max-w-none
        ${isEditing ? 'ring-2 ring-blue-200' : ''}
        ${className}
      `}
      style={{
        fontSize: '16px',
        lineHeight: '1.6',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    />
  );
};

export default ContentEditableArea;