import React, { useState } from 'react';
import { 
  Type, 
  Square, 
  Circle, 
  Triangle, 
  Table, 
  Button, 
  Image, 
  Video, 
  List, 
  Heading1, 
  Heading2, 
  Heading3,
  AlignLeft,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';

interface ComponentItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  description: string;
  defaultProps?: any;
}

interface ComponentCategory {
  id: string;
  name: string;
  items: ComponentItem[];
  expanded: boolean;
}

const componentCategories: ComponentCategory[] = [
  {
    id: 'text',
    name: 'Texto',
    expanded: true,
    items: [
      {
        id: 'heading1',
        name: 'Título H1',
        icon: <Heading1 className="w-4 h-4" />,
        category: 'text',
        description: 'Título principal',
        defaultProps: { text: 'Título Principal', fontSize: '2.5rem', color: '#1f2937' }
      },
      {
        id: 'heading2',
        name: 'Título H2',
        icon: <Heading2 className="w-4 h-4" />,
        category: 'text',
        description: 'Subtítulo',
        defaultProps: { text: 'Subtítulo', fontSize: '2rem', color: '#374151' }
      },
      {
        id: 'heading3',
        name: 'Título H3',
        icon: <Heading3 className="w-4 h-4" />,
        category: 'text',
        description: 'Título de sección',
        defaultProps: { text: 'Título de Sección', fontSize: '1.5rem', color: '#4b5563' }
      },
      {
        id: 'paragraph',
        name: 'Párrafo',
        icon: <AlignLeft className="w-4 h-4" />,
        category: 'text',
        description: 'Texto de párrafo',
        defaultProps: { text: 'Escribe tu texto aquí...', fontSize: '1rem', color: '#6b7280' }
      },
      {
        id: 'text',
        name: 'Texto Simple',
        icon: <Type className="w-4 h-4" />,
        category: 'text',
        description: 'Texto editable',
        defaultProps: { text: 'Texto', fontSize: '1rem', color: '#000000' }
      }
    ]
  },
  {
    id: 'shapes',
    name: 'Formas',
    expanded: false,
    items: [
      {
        id: 'rectangle',
        name: 'Rectángulo',
        icon: <Square className="w-4 h-4" />,
        category: 'shapes',
        description: 'Forma rectangular',
        defaultProps: { width: 200, height: 100, backgroundColor: '#3b82f6', borderRadius: 8 }
      },
      {
        id: 'circle',
        name: 'Círculo',
        icon: <Circle className="w-4 h-4" />,
        category: 'shapes',
        description: 'Forma circular',
        defaultProps: { width: 100, height: 100, backgroundColor: '#10b981', borderRadius: '50%' }
      },
      {
        id: 'triangle',
        name: 'Triángulo',
        icon: <Triangle className="w-4 h-4" />,
        category: 'shapes',
        description: 'Forma triangular',
        defaultProps: { width: 100, height: 100, backgroundColor: '#f59e0b' }
      }
    ]
  },
  {
    id: 'interactive',
    name: 'Interactivos',
    expanded: false,
    items: [
      {
        id: 'button',
        name: 'Botón',
        icon: <Button className="w-4 h-4" />,
        category: 'interactive',
        description: 'Botón clickeable',
        defaultProps: { text: 'Botón', backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px' }
      },
      {
        id: 'link',
        name: 'Enlace',
        icon: <Type className="w-4 h-4" />,
        category: 'interactive',
        description: 'Enlace de navegación',
        defaultProps: { text: 'Enlace', href: '#', color: '#3b82f6' }
      }
    ]
  },
  {
    id: 'layout',
    name: 'Diseño',
    expanded: false,
    items: [
      {
        id: 'table',
        name: 'Tabla',
        icon: <Table className="w-4 h-4" />,
        category: 'layout',
        description: 'Tabla de datos',
        defaultProps: { rows: 3, cols: 3, borderColor: '#d1d5db' }
      },
      {
        id: 'list',
        name: 'Lista',
        icon: <List className="w-4 h-4" />,
        category: 'layout',
        description: 'Lista de elementos',
        defaultProps: { items: ['Elemento 1', 'Elemento 2', 'Elemento 3'], listType: 'bullet' }
      }
    ]
  },
  {
    id: 'media',
    name: 'Multimedia',
    expanded: false,
    items: [
      {
        id: 'image',
        name: 'Imagen',
        icon: <Image className="w-4 h-4" />,
        category: 'media',
        description: 'Imagen',
        defaultProps: { src: '', alt: 'Imagen', width: 300, height: 200 }
      },
      {
        id: 'video',
        name: 'Video',
        icon: <Video className="w-4 h-4" />,
        category: 'media',
        description: 'Video embebido',
        defaultProps: { src: '', width: 400, height: 300 }
      }
    ]
  }
];

interface ComponentPaletteProps {
  onComponentSelect: (component: ComponentItem) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ 
  onComponentSelect, 
  isVisible, 
  onToggle 
}) => {
  const [categories, setCategories] = useState<ComponentCategory[]>(componentCategories);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, expanded: !cat.expanded }
          : cat
      )
    );
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const handleDragStart = (e: React.DragEvent, component: ComponentItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (!isVisible) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={onToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-l-lg shadow-lg transition-colors"
          title="Abrir paleta de componentes"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Componentes</h3>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
            title="Cerrar paleta"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Buscar componentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredCategories.map(category => (
          <div key={category.id} className="border border-gray-200 rounded-lg">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">{category.name}</span>
              {category.expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Category Items */}
            {category.expanded && (
              <div className="border-t border-gray-200 p-2 space-y-1">
                {category.items.map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => onComponentSelect(item)}
                    className="flex items-center p-2 rounded-md hover:bg-blue-50 cursor-pointer transition-colors group"
                    title={item.description}
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md mr-3 group-hover:bg-blue-100 transition-colors">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Arrastra los componentes al área de edición
        </p>
      </div>
    </div>
  );
};

export default ComponentPalette;