import React, { useEffect, useState, useRef } from 'react';

// Toolbar configuration mapping
const toolbarConfig = {
  'titulo': ['negrita', 'cursiva', 'cambiarColor', 'alinearTexto', 'cambiarTamano'],
  'parrafo': ['negrita', 'cursiva', 'enlazar', 'crearLista', 'alinearTexto', 'cambiarColor'],
  'icono': ['cambiarIcono', 'cambiarColorIcono', 'cambiarTamano'],
  'contenedor-tarjeta': ['cambiarFondo', 'agregarBorde', 'eliminar', 'duplicar'],
  'imagen': ['reemplazarImagen', 'agregarAltText', 'enlazarImagen', 'cambiarTamano'],
  'tabla': ['agregarFila', 'agregarColumna', 'eliminarFila', 'eliminarColumna', 'cambiarEstilo'],
  'boton': ['cambiarTexto', 'cambiarColor', 'cambiarEnlace', 'cambiarEstilo'],
  'lista': ['agregarElemento', 'cambiarTipo', 'anidar', 'desanidar'],
  'cita': ['cambiarEstilo', 'agregarAutor', 'cambiarColor'],
  'linea': ['cambiarGrosor', 'cambiarColor', 'cambiarEstilo']
};

// Tool definitions
const toolDefinitions = {
  'negrita': { 
    icon: '<b>B</b>', 
    title: 'Negrita',
    action: (element: HTMLElement) => {
      // Asegurar que el elemento esté enfocado y sea editable
      if (element.contentEditable !== 'true') {
        element.contentEditable = 'true';
      }
      element.focus();
      
      // Aplicar negrita
      document.execCommand('bold', false, undefined);
      
      // Mantener el foco en el elemento
      setTimeout(() => {
        element.focus();
      }, 10);
    }
  },
  'cursiva': { 
    icon: '<i>I</i>', 
    title: 'Cursiva',
    action: (element: HTMLElement) => {
      // Asegurar que el elemento esté enfocado y sea editable
      if (element.contentEditable !== 'true') {
        element.contentEditable = 'true';
      }
      element.focus();
      
      // Aplicar cursiva
      document.execCommand('italic', false, undefined);
      
      // Mantener el foco en el elemento
      setTimeout(() => {
        element.focus();
      }, 10);
    }
  },
  'cambiarColor': {
    icon: '🎨',
    title: 'Cambiar Color',
    action: (element: HTMLElement) => {
      const color = prompt('Ingresa el color (hex, rgb, o nombre):');
      if (color) {
        element.style.color = color;
      }
    }
  },
  'alinearTexto': {
    icon: '≡',
    title: 'Alinear Texto',
    action: (element: HTMLElement) => {
      const currentAlign = element.style.textAlign || 'left';
      const alignments = ['left', 'center', 'right', 'justify'];
      const currentIndex = alignments.indexOf(currentAlign);
      const nextAlign = alignments[(currentIndex + 1) % alignments.length];
      element.style.textAlign = nextAlign;
    }
  },
  'cambiarTamano': {
    icon: '📏',
    title: 'Cambiar Tamaño',
    action: (element: HTMLElement) => {
      const size = prompt('Ingresa el tamaño de fuente (ej: 16px, 1.2em):');
      if (size) {
        element.style.fontSize = size;
      }
    }
  },
  'enlazar': {
    icon: '🔗',
    title: 'Agregar Enlace',
    action: (_element: HTMLElement) => {
      const url = prompt('Ingresa la URL:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    }
  },
  'crearLista': {
    icon: '•',
    title: 'Crear Lista',
    action: (_element: HTMLElement) => {
      document.execCommand('insertUnorderedList');
    }
  },
  'cambiarIcono': {
    icon: '🔄',
    title: 'Cambiar Icono',
    action: (element: HTMLElement) => {
      const newIcon = prompt('Ingresa el nuevo icono (emoji o texto):');
      if (newIcon) {
        element.textContent = newIcon;
      }
    }
  },
  'cambiarColorIcono': {
    icon: '🎨',
    title: 'Color del Icono',
    action: (element: HTMLElement) => {
      const color = prompt('Ingresa el color del icono:');
      if (color) {
        element.style.color = color;
      }
    }
  },
  'cambiarFondo': {
    icon: '🎨',
    title: 'Cambiar Fondo',
    action: (element: HTMLElement) => {
      const color = prompt('Ingresa el color de fondo:');
      if (color) {
        element.style.backgroundColor = color;
      }
    }
  },
  'agregarBorde': {
    icon: '⬜',
    title: 'Agregar Borde',
    action: (element: HTMLElement) => {
      const border = prompt('Ingresa el estilo del borde (ej: 2px solid #000):');
      if (border) {
        element.style.border = border;
      }
    }
  },
  'eliminar': {
    icon: '🗑️',
    title: 'Eliminar',
    action: (element: HTMLElement) => {
      if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
        element.remove();
      }
    }
  },
  'duplicar': {
    icon: '📋',
    title: 'Duplicar',
    action: (element: HTMLElement) => {
      const clone = element.cloneNode(true) as HTMLElement;
      element.parentNode?.insertBefore(clone, element.nextSibling);
    }
  },
  'reemplazarImagen': {
    icon: '🖼️',
    title: 'Reemplazar Imagen',
    action: (element: HTMLElement) => {
      const url = prompt('Ingresa la nueva URL de la imagen:');
      if (url && element.tagName === 'IMG') {
        (element as HTMLImageElement).src = url;
      }
    }
  },
  'agregarAltText': {
    icon: '📝',
    title: 'Texto Alternativo',
    action: (element: HTMLElement) => {
      const alt = prompt('Ingresa el texto alternativo:');
      if (alt && element.tagName === 'IMG') {
        (element as HTMLImageElement).alt = alt;
      }
    }
  },
  'enlazarImagen': {
    icon: '🔗',
    title: 'Enlazar Imagen',
    action: (element: HTMLElement) => {
      const url = prompt('Ingrese la URL del enlace:');
      if (url && element.tagName === 'IMG') {
        const link = document.createElement('a');
        link.href = url;
        element.parentNode?.insertBefore(link, element);
        link.appendChild(element);
      }
    }
  },
  'agregarFila': {
    icon: '➕',
    title: 'Agregar Fila',
    action: (element: HTMLElement) => {
      if (element.tagName === 'TABLE' || element.closest('table')) {
        const table = element.tagName === 'TABLE' ? element as HTMLTableElement : element.closest('table') as HTMLTableElement;
        const newRow = table?.insertRow();
        const cellCount = table?.rows[0]?.cells.length || 1;
        for (let i = 0; i < cellCount; i++) {
          const cell = newRow?.insertCell();
          if (cell) cell.textContent = 'Nueva celda';
        }
      }
    }
  },
  'agregarColumna': {
    icon: '⬇️',
    title: 'Agregar Columna',
    action: (element: HTMLElement) => {
      if (element.tagName === 'TABLE' || element.closest('table')) {
        const table = element.tagName === 'TABLE' ? element as HTMLTableElement : element.closest('table') as HTMLTableElement;
        const rows = table?.rows;
        if (rows) {
          for (let i = 0; i < rows.length; i++) {
            const cell = rows[i].insertCell();
            cell.textContent = 'Nueva celda';
          }
        }
      }
    }
  },
  'eliminarFila': {
    icon: '➖',
    title: 'Eliminar Fila',
    action: (element: HTMLElement) => {
      const row = element.closest('tr');
      if (row) row.remove();
    }
  },
  'eliminarColumna': {
    icon: '⬅️',
    title: 'Eliminar Columna',
    action: (element: HTMLElement) => {
      const cell = element.closest('td, th');
      if (cell) {
        const cellIndex = Array.from(cell.parentNode?.children || []).indexOf(cell);
        const table = cell.closest('table');
        const rows = table?.rows;
        if (rows) {
          for (let i = 0; i < rows.length; i++) {
            rows[i].deleteCell(cellIndex);
          }
        }
      }
    }
  },
  'cambiarEstilo': {
    icon: '🎨',
    title: 'Cambiar Estilo',
    action: (element: HTMLElement) => {
      const styles = ['border: 1px solid #ccc', 'border: 2px solid #000', 'background: #f0f0f0'];
      const currentStyle = element.getAttribute('style') || '';
      const nextIndex = styles.findIndex(s => currentStyle.includes(s.split(':')[0])) + 1;
      element.setAttribute('style', styles[nextIndex % styles.length]);
    }
  },
  'cambiarTexto': {
    icon: '✏️',
    title: 'Cambiar Texto',
    action: (element: HTMLElement) => {
      const newText = prompt('Ingrese el nuevo texto:', element.textContent || '');
      if (newText !== null) {
        element.textContent = newText;
      }
    }
  },
  'cambiarEnlace': {
    icon: '🔗',
    title: 'Cambiar Enlace',
    action: (element: HTMLElement) => {
      const newUrl = prompt('Ingrese la nueva URL:', element.getAttribute('href') || '');
      if (newUrl !== null) {
        element.setAttribute('href', newUrl);
      }
    }
  },
  'agregarElemento': {
    icon: '➕',
    title: 'Agregar Elemento',
    action: (element: HTMLElement) => {
      const list = element.tagName === 'UL' || element.tagName === 'OL' ? element : element.closest('ul, ol');
      if (list) {
        const newItem = document.createElement('li');
        newItem.textContent = 'Nuevo elemento';
        list.appendChild(newItem);
      }
    }
  },
  'cambiarTipo': {
    icon: '🔄',
    title: 'Cambiar Tipo de Lista',
    action: (element: HTMLElement) => {
      const list = element.tagName === 'UL' || element.tagName === 'OL' ? element : element.closest('ul, ol');
      if (list) {
        const newType = list.tagName === 'UL' ? 'ol' : 'ul';
        const newList = document.createElement(newType);
        newList.innerHTML = list.innerHTML;
        list.parentNode?.replaceChild(newList, list);
      }
    }
  },
  'anidar': {
    icon: '→',
    title: 'Anidar',
    action: (element: HTMLElement) => {
      const listItem = element.closest('li');
      if (listItem) {
        listItem.style.marginLeft = (parseInt(listItem.style.marginLeft || '0') + 20) + 'px';
      }
    }
  },
  'desanidar': {
    icon: '←',
    title: 'Desanidar',
    action: (element: HTMLElement) => {
      const listItem = element.closest('li');
      if (listItem) {
        const currentMargin = parseInt(listItem.style.marginLeft || '0');
        listItem.style.marginLeft = Math.max(0, currentMargin - 20) + 'px';
      }
    }
  },
  'agregarAutor': {
    icon: '👤',
    title: 'Agregar Autor',
    action: (element: HTMLElement) => {
      const author = prompt('Ingrese el nombre del autor:');
      if (author) {
        const authorElement = document.createElement('cite');
        authorElement.textContent = `— ${author}`;
        authorElement.style.display = 'block';
        authorElement.style.textAlign = 'right';
        authorElement.style.fontStyle = 'italic';
        element.appendChild(authorElement);
      }
    }
  },
  'cambiarGrosor': {
    icon: '━',
    title: 'Cambiar Grosor',
    action: (element: HTMLElement) => {
      const grosores = ['1px', '2px', '3px', '5px'];
      const currentBorder = element.style.borderTopWidth || '1px';
      const nextIndex = (grosores.indexOf(currentBorder) + 1) % grosores.length;
      element.style.borderTopWidth = grosores[nextIndex];
    }
  }
};

interface ContextualToolbarProps {
  selectedElement: HTMLElement | null;
  onToolAction?: (action: string, element: HTMLElement) => void;
}

const ContextualToolbar: React.FC<ContextualToolbarProps> = ({ 
  selectedElement, 
  onToolAction 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tools, setTools] = useState<string[]>([]);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Determine element type from data-editable-type or tag name
  const getElementType = (element: HTMLElement): string => {
    // First check for explicit data-editable-type
    const explicitType = element.getAttribute('data-editable-type');
    if (explicitType && toolbarConfig[explicitType as keyof typeof toolbarConfig]) {
      return explicitType;
    }

    // Fallback to tag-based detection
    const tagName = element.tagName.toLowerCase();
    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return 'titulo';
      case 'p':
        return 'parrafo';
      case 'img':
        return 'imagen';
      case 'table':
        return 'tabla';
      case 'button':
        return 'boton';
      case 'ul':
      case 'ol':
      case 'li':
        return 'lista';
      case 'blockquote':
        return 'cita';
      case 'hr':
        return 'linea';
      case 'div':
        if (element.hasAttribute('data-shape')) {
          return 'icono';
        }
        return 'contenedor-tarjeta';
      default:
        return 'parrafo'; // Default fallback
    }
  };

  // Calculate optimal toolbar position with improved stability
  const calculatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Get container bounds to ensure toolbar stays within editor area
    const container = element.closest('.prose, .editor-container, [data-editor]') as HTMLElement;
    const containerRect = container ? container.getBoundingClientRect() : {
      left: 0,
      right: window.innerWidth,
      top: 0,
      bottom: window.innerHeight
    };
    
    const toolbarWidth = 300; // Estimated toolbar width
    const toolbarHeight = 50; // Estimated toolbar height
    const margin = 10;
    
    // Calculate initial position (centered above element)
    let x = rect.left + scrollLeft + (rect.width / 2) - (toolbarWidth / 2);
    let y = rect.top + scrollTop - toolbarHeight - margin;
    
    // Ensure toolbar stays within container bounds horizontally
    const minX = containerRect.left + scrollLeft + margin;
    const maxX = containerRect.right + scrollLeft - toolbarWidth - margin;
    x = Math.max(minX, Math.min(maxX, x));
    
    // Ensure toolbar stays within container bounds vertically
    const minY = containerRect.top + scrollTop + margin;
    const maxY = containerRect.bottom + scrollTop - toolbarHeight - margin;
    
    // If no space above, position below
    if (y < minY) {
      y = rect.bottom + scrollTop + margin;
      // If still doesn't fit below, position at the top of container
      if (y > maxY) {
        y = minY;
      }
    }
    
    // Final bounds check
    y = Math.max(minY, Math.min(maxY, y));
    
    return { x, y };
  };

  // Update toolbar when selected element changes
  useEffect(() => {
    if (selectedElement) {
      const elementType = getElementType(selectedElement);
      const availableTools = toolbarConfig[elementType as keyof typeof toolbarConfig] || [];
      
      setTools(availableTools);
      setPosition(calculatePosition(selectedElement));
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setTools([]);
    }
  }, [selectedElement]);

  // Handle tool click
  const handleToolClick = (toolName: string) => {
    if (selectedElement && toolDefinitions[toolName as keyof typeof toolDefinitions]) {
      const tool = toolDefinitions[toolName as keyof typeof toolDefinitions];
      tool.action(selectedElement);
      
      // Notify parent component
      if (onToolAction) {
        onToolAction(toolName, selectedElement);
      }
      
      // Solo ocultar toolbar para acciones destructivas o que cambien el contexto
      const hideToolbarActions = ['eliminar', 'duplicar', 'cambiarTexto'];
      if (hideToolbarActions.includes(toolName)) {
        setTimeout(() => {
          setIsVisible(false);
        }, 100);
      }
      // Para acciones de formato (negrita, cursiva, etc.), mantener la toolbar visible
    }
  };

  // Hide toolbar when clicking outside or on escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        // Don't hide if clicking on the selected element
        if (selectedElement && !selectedElement.contains(event.target as Node)) {
          setIsVisible(false);
        }
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isVisible, selectedElement]);

  if (!isVisible || tools.length === 0) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      className="contextual-toolbar"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '8px',
        display: 'flex',
        gap: '4px',
        maxWidth: '400px',
        flexWrap: 'wrap'
      }}
    >
      {tools.map((toolName) => {
        const tool = toolDefinitions[toolName as keyof typeof toolDefinitions];
        if (!tool) return null;
        
        return (
          <button
            key={toolName}
            onClick={() => handleToolClick(toolName)}
            title={tool.title}
            style={{
              background: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: '14px',
              minWidth: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: tool.icon }} />
          </button>
        );
      })}
    </div>
  );
};

export default ContextualToolbar;