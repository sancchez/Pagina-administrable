import React, { useState } from 'react';
import { 
  Type, 
  Square, 
  Circle, 
  Triangle, 
  Table, 
  MousePointer, 
  Image, 
  Layout, 
  ChevronDown, 
  ChevronRight,
  Plus
} from 'lucide-react';

interface FrameworkItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'text' | 'shape' | 'interactive' | 'layout' | 'media';
  defaultProps: any;
}

interface FrameworkCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: FrameworkItem[];
  expanded: boolean;
}

interface FrameworkMenuProps {
  onAddComponent: (type: string, props: any) => void;
  className?: string;
}

const FrameworkMenu: React.FC<FrameworkMenuProps> = ({ onAddComponent, className = '' }) => {
  const [categories, setCategories] = useState<FrameworkCategory[]>([
    {
      id: 'text',
      name: 'Texto',
      icon: <Type className="w-4 h-4" />,
      expanded: true,
      items: [
        {
          id: 'title',
          name: 'Título',
          icon: <Type className="w-4 h-4" />,
          type: 'text',
          defaultProps: {
            text: 'Nuevo Título',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            x: 50,
            y: 50
          }
        },
        {
          id: 'paragraph',
          name: 'Párrafo',
          icon: <Type className="w-4 h-4" />,
          type: 'text',
          defaultProps: {
            text: 'Nuevo párrafo de texto',
            fontSize: '1rem',
            fontWeight: 'normal',
            color: '#374151',
            x: 50,
            y: 100
          }
        },
        {
          id: 'subtitle',
          name: 'Subtítulo',
          icon: <Type className="w-4 h-4" />,
          type: 'text',
          defaultProps: {
            text: 'Nuevo Subtítulo',
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            x: 50,
            y: 75
          }
        }
      ]
    },
    {
      id: 'shapes',
      name: 'Formas',
      icon: <Square className="w-4 h-4" />,
      expanded: true,
      items: [
        {
          id: 'rectangle',
          name: 'Rectángulo',
          icon: <Square className="w-4 h-4" />,
          type: 'shape',
          defaultProps: {
            shapeType: 'rectangle',
            width: 150,
            height: 100,
            color: '#3b82f6',
            borderColor: '#1d4ed8',
            borderWidth: 2,
            x: 50,
            y: 50
          }
        },
        {
          id: 'circle',
          name: 'Círculo',
          icon: <Circle className="w-4 h-4" />,
          type: 'shape',
          defaultProps: {
            shapeType: 'circle',
            width: 120,
            height: 120,
            color: '#10b981',
            borderColor: '#059669',
            borderWidth: 2,
            x: 50,
            y: 50
          }
        },
        {
          id: 'triangle',
          name: 'Triángulo',
          icon: <Triangle className="w-4 h-4" />,
          type: 'shape',
          defaultProps: {
            shapeType: 'triangle',
            width: 120,
            height: 120,
            color: '#f59e0b',
            borderColor: '#d97706',
            borderWidth: 2,
            x: 50,
            y: 50
          }
        }
      ]
    },
    {
      id: 'interactive',
      name: 'Interactivos',
      icon: <MousePointer className="w-4 h-4" />,
      expanded: false,
      items: [
        {
          id: 'button',
          name: 'Botón',
          icon: <MousePointer className="w-4 h-4" />,
          type: 'interactive',
          defaultProps: {
            text: 'Nuevo Botón',
            href: '#',
            backgroundColor: '#3b82f6',
            textColor: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            x: 50,
            y: 50
          }
        }
      ]
    },
    {
      id: 'layout',
      name: 'Diseño',
      icon: <Layout className="w-4 h-4" />,
      expanded: false,
      items: [
        {
          id: 'table',
          name: 'Tabla',
          icon: <Table className="w-4 h-4" />,
          type: 'layout',
          defaultProps: {
            rows: 3,
            columns: 3,
            data: [
              ['Encabezado 1', 'Encabezado 2', 'Encabezado 3'],
              ['Celda 1', 'Celda 2', 'Celda 3'],
              ['Celda 4', 'Celda 5', 'Celda 6']
            ],
            headerBackgroundColor: '#f3f4f6',
            cellBackgroundColor: '#ffffff',
            borderColor: '#d1d5db',
            x: 50,
            y: 50
          }
        }
      ]
    },
    {
      id: 'media',
      name: 'Multimedia',
      icon: <Image className="w-4 h-4" />,
      expanded: false,
      items: [
        {
          id: 'image',
          name: 'Imagen',
          icon: <Image className="w-4 h-4" />,
          type: 'media',
          defaultProps: {
            src: 'https://via.placeholder.com/300x200',
            alt: 'Nueva imagen',
            width: 300,
            height: 200,
            x: 50,
            y: 50
          }
        }
      ]
    }
  ]);

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, expanded: !cat.expanded }
          : cat
      )
    );
  };

  const handleAddComponent = (item: FrameworkItem) => {
    onAddComponent(item.type, {
      ...item.defaultProps,
      id: `${item.id}_${Date.now()}`,
      componentType: item.id
    });
  };

  return (
    <div className={`w-80 bg-white border-l border-gray-200 h-full overflow-y-auto ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Layout className="w-5 h-5" />
          Frameworks
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Arrastra componentes al editor
        </p>
      </div>

      <div className="p-2">
        {categories.map((category) => (
          <div key={category.id} className="mb-2">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                {category.icon}
                <span className="font-medium text-gray-700">{category.name}</span>
              </div>
              {category.expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {category.expanded && (
              <div className="mt-2 ml-2 space-y-1">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({
                        type: item.type,
                        props: {
                          ...item.defaultProps,
                          id: `${item.id}_${Date.now()}`,
                          componentType: item.id
                        }
                      }));
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <button
                      onClick={() => handleAddComponent(item)}
                      className="opacity-0 group-hover:opacity-100 p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                      title={`Agregar ${item.name}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Arrastra los componentes al área de edición o haz clic en el botón + para agregarlos.
        </div>
      </div>
    </div>
  );
};

export default FrameworkMenu;