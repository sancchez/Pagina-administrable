import React, { useRef, useEffect, useState } from 'react';
import { TextEditingManager } from '../core/TextEditingManager';
import { shouldUseMultiline, copyComputedStyles } from '../utils';

interface TextEditingRendererProps {
  manager: TextEditingManager;
  onContentChange?: (content: string) => void;
}

/**
 * Componente que renderiza el editor visual de texto
 */
export const TextEditingRenderer: React.FC<TextEditingRendererProps> = ({
  manager,
  onContentChange
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [styles, setStyles] = useState<React.CSSProperties>({});
  const [isMultiline, setIsMultiline] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const editorId = useRef(`text-editor-${Date.now()}`);

  // Efecto para escuchar cambios en el manager
  useEffect(() => {
    const checkManagerState = () => {
      const state = manager.getState();
      const activeElement = manager.getActiveElement();
      const elementPosition = manager.getActiveElementPosition();

      if (state.isEditing && activeElement && elementPosition) {
        // Configurar contenido
        setContent(state.currentContent);
        
        // Configurar posición
        setPosition(elementPosition);
        
        // Configurar estilos
        const computedStyles = copyComputedStyles(activeElement);
        setStyles({
          fontSize: computedStyles.fontSize,
          fontFamily: computedStyles.fontFamily,
          fontWeight: computedStyles.fontWeight,
          color: computedStyles.color,
          lineHeight: computedStyles.lineHeight,
          textAlign: computedStyles.textAlign as any
        });
        
        // Determinar si usar multilínea
        setIsMultiline(shouldUseMultiline(activeElement, state.currentContent));
        
        // Mostrar editor
        setIsVisible(true);
      } else {
        // Ocultar editor
        setIsVisible(false);
      }
    };

    // Verificar estado inicial
    checkManagerState();

    // Configurar intervalo para verificar cambios
    const interval = setInterval(checkManagerState, 100);

    return () => {
      clearInterval(interval);
    };
  }, [manager]);

  // Efecto para enfocar el input cuando se muestra
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isVisible]);

  // Manejar cambios en el contenido
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    manager.updateContent(newContent);
    onContentChange?.(newContent);
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    
    if (e.key === 'Enter' && !e.shiftKey && !isMultiline) {
      e.preventDefault();
      manager.saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      manager.stopEditing();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Insertar tab o completar edición
      if (e.shiftKey) {
        manager.stopEditing();
      } else {
        manager.saveEdit();
      }
    }
  };

  // Manejar pérdida de foco
  const handleBlur = (e: React.FocusEvent) => {
    // Pequeño delay para permitir clicks en botones
    setTimeout(() => {
      // Verificar si el foco se movió a un botón del editor
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (relatedTarget && relatedTarget.closest(`#${editorId.current}`)) {
        return;
      }
      
      // Guardar cambios si el editor sigue activo
      if (manager.isActive()) {
        manager.saveEdit();
      }
    }, 150);
  };

  // Manejar click en botón guardar
  const handleSave = () => {
    manager.saveEdit();
  };

  // Manejar click en botón cancelar
  const handleCancel = () => {
    manager.stopEditing();
  };

  if (!isVisible) {
    return null;
  }

  const editorStyle: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: Math.max(position.width, 100),
    height: isMultiline ? Math.max(position.height, 60) : position.height,
    zIndex: 1000,
    backgroundColor: 'white',
    border: '2px solid #3b82f6',
    borderRadius: '4px',
    padding: '4px 8px',
    outline: 'none',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    ...styles
  };

  const buttonStyle: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s'
  };

  const saveButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#10b981',
    color: 'white'
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: 'white'
  };

  return (
    <div id={editorId.current} style={{ position: 'relative' }}>
      {/* Input/Textarea */}
      {isMultiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{
            ...editorStyle,
            resize: 'none',
            fontFamily: 'inherit'
          }}
          placeholder="Escribe aquí..."
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={editorStyle}
          placeholder="Escribe aquí..."
        />
      )}
      
      {/* Botones de acción */}
      <div style={{
        position: 'absolute',
        top: -40,
        right: 0,
        display: 'flex',
        gap: '4px',
        zIndex: 1001
      }}>
        <button
          onClick={handleSave}
          style={saveButtonStyle}
          title="Guardar (Enter)"
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          style={cancelButtonStyle}
          title="Cancelar (Esc)"
        >
          ✕
        </button>
      </div>
      
      {/* Indicador de ayuda */}
      <div style={{
        position: 'absolute',
        bottom: -25,
        left: 0,
        fontSize: '11px',
        color: '#6b7280',
        whiteSpace: 'nowrap'
      }}>
        Enter: Guardar • Esc: Cancelar • Tab: Siguiente
      </div>
    </div>
  );
};

export default TextEditingRenderer;