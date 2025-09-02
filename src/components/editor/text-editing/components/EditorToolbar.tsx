import React from 'react';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Undo, Redo, Type, Palette, Link, Image, Code, Quote } from 'lucide-react';
import { TextEditingManager } from '../core/TextEditingManager';

export interface EditorToolbarProps {
  manager: TextEditingManager;
  activeElement?: HTMLElement;
  onFormatChange?: (format: string, value?: string) => void;
  className?: string;
}

export interface ToolbarButton {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
  group?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  manager,
  activeElement,
  onFormatChange,
  className = ''
}) => {
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const [activeFormats, setActiveFormats] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const updateToolbarState = () => {
      if (activeElement) {
        // Actualizar estado de undo/redo
        setCanUndo(manager.canUndo());
        setCanRedo(manager.canRedo());
        
        // Actualizar formatos activos
        const formats = new Set<string>();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
            ? range.commonAncestorContainer.parentElement 
            : range.commonAncestorContainer as Element;
          
          if (parentElement) {
            // Verificar formatos activos
            if (document.queryCommandState('bold')) formats.add('bold');
            if (document.queryCommandState('italic')) formats.add('italic');
            if (document.queryCommandState('underline')) formats.add('underline');
            if (document.queryCommandState('strikeThrough')) formats.add('strikethrough');
            if (document.queryCommandState('justifyLeft')) formats.add('alignLeft');
            if (document.queryCommandState('justifyCenter')) formats.add('alignCenter');
            if (document.queryCommandState('justifyRight')) formats.add('alignRight');
            if (document.queryCommandState('justifyFull')) formats.add('alignJustify');
            if (document.queryCommandState('insertOrderedList')) formats.add('orderedList');
            if (document.queryCommandState('insertUnorderedList')) formats.add('unorderedList');
          }
        }
        setActiveFormats(formats);
      }
    };

    updateToolbarState();
    
    // Escuchar cambios en la selección
    document.addEventListener('selectionchange', updateToolbarState);
    
    return () => {
      document.removeEventListener('selectionchange', updateToolbarState);
    };
  }, [activeElement, manager]);

  const executeCommand = (command: string, value?: string) => {
    if (activeElement) {
      document.execCommand(command, false, value);
      onFormatChange?.(command, value);
    }
  };

  const toolbarButtons: ToolbarButton[] = [
    // Grupo de formato básico
    {
      id: 'bold',
      icon: Bold,
      label: 'Negrita',
      action: () => executeCommand('bold'),
      isActive: activeFormats.has('bold'),
      group: 'format'
    },
    {
      id: 'italic',
      icon: Italic,
      label: 'Cursiva',
      action: () => executeCommand('italic'),
      isActive: activeFormats.has('italic'),
      group: 'format'
    },
    {
      id: 'underline',
      icon: Underline,
      label: 'Subrayado',
      action: () => executeCommand('underline'),
      isActive: activeFormats.has('underline'),
      group: 'format'
    },
    {
      id: 'strikethrough',
      icon: Strikethrough,
      label: 'Tachado',
      action: () => executeCommand('strikeThrough'),
      isActive: activeFormats.has('strikethrough'),
      group: 'format'
    },
    
    // Grupo de alineación
    {
      id: 'alignLeft',
      icon: AlignLeft,
      label: 'Alinear izquierda',
      action: () => executeCommand('justifyLeft'),
      isActive: activeFormats.has('alignLeft'),
      group: 'align'
    },
    {
      id: 'alignCenter',
      icon: AlignCenter,
      label: 'Centrar',
      action: () => executeCommand('justifyCenter'),
      isActive: activeFormats.has('alignCenter'),
      group: 'align'
    },
    {
      id: 'alignRight',
      icon: AlignRight,
      label: 'Alinear derecha',
      action: () => executeCommand('justifyRight'),
      isActive: activeFormats.has('alignRight'),
      group: 'align'
    },
    {
      id: 'alignJustify',
      icon: AlignJustify,
      label: 'Justificar',
      action: () => executeCommand('justifyFull'),
      isActive: activeFormats.has('alignJustify'),
      group: 'align'
    },
    
    // Grupo de listas
    {
      id: 'unorderedList',
      icon: List,
      label: 'Lista con viñetas',
      action: () => executeCommand('insertUnorderedList'),
      isActive: activeFormats.has('unorderedList'),
      group: 'list'
    },
    {
      id: 'orderedList',
      icon: ListOrdered,
      label: 'Lista numerada',
      action: () => executeCommand('insertOrderedList'),
      isActive: activeFormats.has('orderedList'),
      group: 'list'
    },
    
    // Grupo de undo/redo
    {
      id: 'undo',
      icon: Undo,
      label: 'Deshacer',
      action: () => manager.undo(),
      disabled: !canUndo,
      group: 'history'
    },
    {
      id: 'redo',
      icon: Redo,
      label: 'Rehacer',
      action: () => manager.redo(),
      disabled: !canRedo,
      group: 'history'
    },
    
    // Grupo de elementos especiales
    {
      id: 'link',
      icon: Link,
      label: 'Insertar enlace',
      action: () => {
        const url = prompt('Ingrese la URL:');
        if (url) {
          executeCommand('createLink', url);
        }
      },
      group: 'insert'
    },
    {
      id: 'quote',
      icon: Quote,
      label: 'Cita',
      action: () => executeCommand('formatBlock', 'blockquote'),
      group: 'insert'
    },
    {
      id: 'code',
      icon: Code,
      label: 'Código',
      action: () => executeCommand('formatBlock', 'pre'),
      group: 'insert'
    }
  ];

  const renderButton = (button: ToolbarButton) => {
    const Icon = button.icon;
    return (
      <button
        key={button.id}
        onClick={button.action}
        disabled={button.disabled}
        title={button.label}
        className={`
          p-2 rounded-md transition-all duration-200 flex items-center justify-center
          ${button.isActive 
            ? 'bg-blue-500 text-white shadow-md' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
          ${button.disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-sm active:scale-95'
          }
        `}
      >
        <Icon size={16} />
      </button>
    );
  };

  const groupButtons = (buttons: ToolbarButton[]) => {
    const groups: { [key: string]: ToolbarButton[] } = {};
    
    buttons.forEach(button => {
      const group = button.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(button);
    });
    
    return Object.entries(groups).map(([groupName, groupButtons], index) => (
      <div key={groupName} className="flex items-center space-x-1">
        {groupButtons.map(renderButton)}
        {index < Object.keys(groups).length - 1 && (
          <div className="w-px h-6 bg-gray-300 mx-2" />
        )}
      </div>
    ));
  };

  if (!activeElement) {
    return null;
  }

  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg shadow-lg p-3
      flex items-center space-x-2 flex-wrap
      ${className}
    `}>
      {groupButtons(toolbarButtons)}
    </div>
  );
};

export default EditorToolbar;