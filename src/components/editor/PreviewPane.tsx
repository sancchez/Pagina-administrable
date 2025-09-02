import React, { useRef, useEffect, useState } from 'react';
import { TextEditingManager, TextEditingRenderer, TextEditingEvents } from './text-editing';
import { initializeDefaultPlugins } from './text-editing/plugins';

interface PreviewPaneProps {
  content: string;
  className?: string;
  editable?: boolean;
  onChange?: (content: string, immediate?: boolean) => void;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({
  content,
  className = '',
  editable = false,
  onChange
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [textEditingManager] = useState(() => new TextEditingManager());
  const [textEditingEvents] = useState(() => new TextEditingEvents(textEditingManager));

  // Actualizar contenido cuando cambie
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  // Configurar el sistema de edición cuando el componente se monta
  useEffect(() => {
    const initializeTextEditing = async () => {
      if (editable && contentRef.current) {
        // Inicializar plugins predeterminados
        const pluginSystem = textEditingManager.getPluginSystem();
        await initializeDefaultPlugins(pluginSystem);
        await pluginSystem.initialize();
        
        console.log('✅ Sistema de edición de texto inicializado con plugins');
        
        // Configurar el manager con callback de cambios
        textEditingManager.updateOptions({
          onContentChange: () => {
            if (onChange) {
              // Actualizar el contenido completo del contenedor
              const fullContent = contentRef.current?.innerHTML || '';
              onChange(fullContent, true);
            }
          },
          onEditStart: (element: HTMLElement) => {
            console.log('🎯 Iniciando edición de:', element.tagName);
          },
          onEditEnd: (element: HTMLElement, content: string) => {
            console.log('✅ Finalizando edición de:', element.tagName, 'contenido:', content);
          }
        });

        // Iniciar escucha de eventos
        textEditingEvents.startListening(contentRef.current);
      }
    };
    
    initializeTextEditing();

    // Cleanup al desmontar
    return () => {
      if (editable) {
        textEditingEvents.stopListening();
      }
    };
  }, [editable, textEditingManager, textEditingEvents, onChange]);

  return (
    <div className={`preview-pane ${className}`} style={{ position: 'relative', height: '100%' }}>
      <div 
        ref={contentRef}
        className="content-area"
        style={{
          width: '100%',
          height: '100%',
          outline: 'none',
          position: 'relative'
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      {/* Renderizador del editor de texto */}
      {editable && (
        <TextEditingRenderer manager={textEditingManager} />
      )}
    </div>
  );
};

export default PreviewPane;