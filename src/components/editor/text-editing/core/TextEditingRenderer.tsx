import React, { useEffect, useState, useRef } from 'react';
import { TextEditingManager } from './TextEditingManager';
import { TextEditingUtils } from '../utils/TextEditingUtils';
import { copyComputedStyles } from '../utils';

interface TextEditingRendererProps {
  manager: TextEditingManager;
}

/**
 * Componente que renderiza el editor visual de texto
 */
export const TextEditingRenderer: React.FC<TextEditingRendererProps> = ({ manager }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMultiline, setIsMultiline] = useState(false);
  const [editorId, setEditorId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Escuchar cambios en el estado del manager
  useEffect(() => {
    const handleStateChange = () => {
      const state = manager.getState();
      
      if (state.isActive && state.activeElement) {
        const element = state.activeElement;
        
        // Configurar contenido
        setContent(state.content);
        
        // Determinar si es multilínea
        const multiline = ['DIV', 'P', 'BLOCKQUOTE'].includes(element.tagName);
        setIsMultiline(multiline);
        
        // Calcular posición
        const optimalPosition = TextEditingUtils.calculateOptimalPosition(
          element,
          300,
          multiline ? 120 : 60
        );
        
        setPosition({
          top: optimalPosition.top,
          left: optimalPosition.left
        });
        
        // Generar ID único
        setEditorId(`text-editor-${Date.now()}`);
        
        // Mostrar editor
        setIsVisible(true);
        
        // Marcar elemento como en edición
        element.setAttribute('data-editing', 'true');
        
        console.log('📝 Mostrando editor para:', element.tagName);
      } else {
        // Ocultar editor
        setIsVisible(false);
        
        // Remover marca de edición de todos los elementos
        document.querySelectorAll('[data-editing="true"]').forEach(el => {
          el.removeAttribute('data-editing');
        });
        
        console.log('🔒 Ocultando editor');
      }
    };

    // Suscribirse a cambios de estado
    const unsubscribe = manager.subscribe(handleStateChange);
    
    // Verificar estado inicial
    handleStateChange();
    
    return unsubscribe;
  }, [manager]);

  // Enfocar el input cuando se muestra
  useEffect(() => {
    if (isVisible) {
      const inputElement = isMultiline ? textareaRef.current : inputRef.current;
      if (inputElement) {
        setTimeout(() => {
          inputElement.focus();
          inputElement.select();
        }, 50);
      }
    }
  }, [isVisible, isMultiline]);

  // Manejar cambios en el contenido
  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
    manager.updateContent(newContent);
  };

  // Manejar teclas especiales
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        if (!isMultiline || (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          handleSave();
        }
        break;
      
      case 'Escape':
        event.preventDefault();
        handleCancel();
        break;
      
      case 'Tab':
        event.preventDefault();
        // Insertar tab o cambiar a siguiente elemento editable
        if (isMultiline) {
          const target = event.target as HTMLTextAreaElement;
          const start = target.selectionStart;
          const end = target.selectionEnd;
          const newContent = content.substring(0, start) + '\t' + content.substring(end);
          setContent(newContent);
          manager.updateContent(newContent);
          
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = start + 1;
          }, 0);
        }
        break;
    }
  };

  // Manejar pérdida de foco
  const handleBlur = (event: React.FocusEvent) => {
    // Solo guardar si el foco no se mueve a un botón del editor
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!relatedTarget || !editorRef.current?.contains(relatedTarget)) {
      setTimeout(() => {
        if (isVisible) {
          handleSave();
        }
      }, 100);
    }
  };

  // Guardar cambios
  const handleSave = () => {
    manager.saveEdit();
  };

  // Cancelar edición
  const handleCancel = () => {
    manager.stopEditing();
  };

  // Aplicar estilos del elemento original
  const getEditorStyles = (): React.CSSProperties => {
    const state = manager.getState();
    if (!state.activeElement) return {};
    
    const element = state.activeElement;
    const computedStyles = copyComputedStyles(element);
    
    return {
      fontSize: computedStyles.fontSize,
      fontFamily: computedStyles.fontFamily,
      fontWeight: computedStyles.fontWeight,
      color: computedStyles.color,
      lineHeight: computedStyles.lineHeight,
      textAlign: computedStyles.textAlign as any,
      ...position && { top: position.top, left: position.left }
    };
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="text-editing-overlay">
      <div 
        ref={editorRef}
        id={editorId}
        className="text-editing-editor"
        style={{
          top: position.top,
          left: position.left,
          ...getEditorStyles()
        }}
      >
        {isMultiline ? (
          <textarea
            ref={textareaRef}
            className="text-editing-textarea"
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Escribe aquí..."
            rows={3}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            className="text-editing-input"
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Escribe aquí..."
          />
        )}
        
        <div className="text-editing-buttons">
          <button
            className="text-editing-button cancel"
            onClick={handleCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="text-editing-button save"
            onClick={handleSave}
            type="button"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};