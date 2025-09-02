import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Move, Edit3, Copy, Trash2, RotateCw, Eye, EyeOff } from 'lucide-react';
import ComponentPalette from './palette/ComponentPalette';
import PropertyPanel from './properties/PropertyPanel';
import { FrameworkMenu } from './palette/FrameworkMenu';
import { EditableText } from './components/EditableText';
import { EditableShape } from './components/EditableShape';
import { EditableButton } from './components/EditableButton';
import { EditableTable } from './components/EditableTable';
import { TextStyleCopier, TextStyle } from './components/TextStyleCopier';

interface BaseComponent {
  id: string;
  type: 'text' | 'shape' | 'interactive' | 'layout' | 'media';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  zIndex?: number;
  [key: string]: any;
}

interface EditorState {
  components: BaseComponent[];
  selectedComponentId: string | null;
  draggedComponent: BaseComponent | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

const EditorWithPalette: React.FC = () => {
  const [state, setState] = useState<EditorState>({
    components: [],
    selectedComponentId: null,
    draggedComponent: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 }
  });
  
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorBounds, setEditorBounds] = useState<DOMRect | null>(null);

  // Actualizar bounds del editor cuando cambie el tamaño
  useEffect(() => {
    const updateBounds = () => {
      if (editorRef.current) {
        setEditorBounds(editorRef.current.getBoundingClientRect());
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  const getRelativePosition = useCallback((clientX: number, clientY: number) => {
    if (!editorBounds) return { x: 0, y: 0 };
    return {
      x: clientX - editorBounds.left,
      y: clientY - editorBounds.top
    };
  }, [editorBounds]);

  const addComponent = useCallback((type: string, props: any) => {
    const newComponent: BaseComponent = {
      id: props.id || `${type}_${Date.now()}`,
      type: type as BaseComponent['type'],
      x: props.x || 100,
      y: props.y || 100,
      width: props.width || 150,
      height: props.height || 100,
      rotation: props.rotation || 0,
      opacity: props.opacity || 1,
      visible: props.visible !== false,
      zIndex: props.zIndex || state.components.length,
      ...props
    };

    setState(prev => ({
      ...prev,
      components: [...prev.components, newComponent],
      selectedComponentId: newComponent.id
    }));
  }, [state.components.length]);

  const updateComponent = useCallback((id: string, updates: Partial<BaseComponent>) => {
    setState(prev => {
      if (updates.deleted) {
        return {
          ...prev,
          components: prev.components.filter(comp => comp.id !== id),
          selectedComponentId: prev.selectedComponentId === id ? null : prev.selectedComponentId
        };
      }
      return {
        ...prev,
        components: prev.components.map(comp => 
          comp.id === id ? { ...comp, ...updates } : comp
        )
      };
    });
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== id),
      selectedComponentId: prev.selectedComponentId === id ? null : prev.selectedComponentId
    }));
  }, []);

  const duplicateComponent = useCallback((id: string) => {
    const component = state.components.find(comp => comp.id === id);
    if (component) {
      const newComponent = {
        ...component,
        id: `${component.type}_${Date.now()}`,
        x: component.x + 20,
        y: component.y + 20
      };
      addComponent(newComponent.type, newComponent);
    }
  }, [state.components, addComponent]);

  const selectComponent = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedComponentId: id }));
  }, []);

  // Manejo de drag and drop desde el menú
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const position = getRelativePosition(e.clientX, e.clientY);
      
      addComponent(data.type, {
        ...data.props,
        x: position.x - 75, // Centrar el componente
        y: position.y - 50
      });
    } catch (error) {
      console.error('Error al procesar el drop:', error);
    }
  }, [getRelativePosition, addComponent]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Manejo de selección y arrastre directo de componentes
  const handleComponentMouseDown = useCallback((e: React.MouseEvent, component: BaseComponent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const editorRect = editorRef.current?.getBoundingClientRect();
    if (!editorRect) return;
    
    const mouseX = e.clientX - editorRect.left;
    const mouseY = e.clientY - editorRect.top;
    const offsetX = mouseX - component.x;
    const offsetY = mouseY - component.y;
    
    setState(prev => ({
      ...prev,
      selectedComponentId: component.id,
      isDragging: true,
      draggedComponent: component,
      dragOffset: { x: offsetX, y: offsetY }
    }));
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!state.isDragging || !state.draggedComponent) return;
    
    const editorRect = editorRef.current?.getBoundingClientRect();
    if (!editorRect) return;
    
    const newX = e.clientX - editorRect.left - state.dragOffset.x;
    const newY = e.clientY - editorRect.top - state.dragOffset.y;
    
    // Actualizar posición inmediatamente en el estado local
    setState(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === state.draggedComponent!.id 
          ? { 
              ...comp, 
              x: Math.max(0, Math.min(newX, editorRect.width - 100)),
              y: Math.max(0, Math.min(newY, editorRect.height - 50))
            }
          : comp
      )
    }));
  }, [state.isDragging, state.draggedComponent, state.dragOffset]);

  const handleMouseUp = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      draggedComponent: null,
      dragOffset: { x: 0, y: 0 }
    }));
  }, []);

  const handleStyleCopied = useCallback((style: TextStyle) => {
    if (state.selectedComponentId) {
      const selectedComponent = state.components.find(c => c.id === state.selectedComponentId);
      if (selectedComponent && selectedComponent.type === 'text') {
        updateComponent(state.selectedComponentId, {
          style: {
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            color: style.color,
            fontFamily: style.fontFamily,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            textAlign: style.textAlign,
            textDecoration: style.textDecoration,
            textTransform: style.textTransform
          }
        });
      }
    }
  }, [state.selectedComponentId, state.components, updateComponent]);

  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    // Deseleccionar componente si se hace clic en el área vacía del editor
    if (e.target === e.currentTarget) {
      setState(prev => ({ ...prev, selectedComponentId: null }));
    }
  }, []);

  const renderComponent = useCallback((component: BaseComponent) => {
    if (component.visible === false) return null;

    const isSelected = component.id === state.selectedComponentId;
    const commonProps = {
      key: component.id,
      component,
      isSelected,
      onUpdate: (updates: Partial<BaseComponent>) => updateComponent(component.id, updates),
      onSelect: () => selectComponent(component.id),
      style: {
        position: 'absolute' as const,
        left: component.x,
        top: component.y,
        transform: `rotate(${component.rotation || 0}deg)`,
        opacity: component.opacity || 1,
        zIndex: component.zIndex || 0,
        cursor: state.isDragging ? 'grabbing' : 'grab'
      }
    };

    const componentElement = (() => {
      switch (component.type) {
        case 'text':
          return (
            <EditableText
              id={component.id}
              text={component.text || 'Texto'}
              position={{ x: component.x, y: component.y }}
              size={{ width: component.width || 200, height: component.height || 50 }}
              color={component.color || '#000000'}
              rotation={component.rotation || 0}
              onUpdate={(updates) => updateComponent(component.id, updates)}
            />
          );
        case 'shape':
          return (
            <EditableShape
              id={component.id}
              type={component.shapeType || 'rectangle'}
              position={{ x: component.x, y: component.y }}
              size={{ width: component.width || 100, height: component.height || 100 }}
              color={component.color || '#3b82f6'}
              rotation={component.rotation || 0}
              onUpdate={(updates) => updateComponent(component.id, updates)}
            />
          );
        case 'interactive':
          return (
            <EditableButton
              id={component.id}
              text={component.text || 'Botón'}
              position={{ x: component.x, y: component.y }}
              size={{ width: component.width || 120, height: component.height || 40 }}
              color={component.color || '#3b82f6'}
              backgroundColor={component.backgroundColor || '#e5e7eb'}
              rotation={component.rotation || 0}
              onClick={component.onClick || (() => {})}
              onUpdate={(updates) => updateComponent(component.id, updates)}
            />
          );
        case 'layout':
          return (
            <EditableTable
              id={component.id}
              rows={component.rows || 3}
              columns={component.columns || 3}
              position={{ x: component.x, y: component.y }}
              size={{ width: component.width || 300, height: component.height || 200 }}
              onUpdate={(updates) => updateComponent(component.id, updates)}
            />
          );
        default:
          return null;
      }
    })();

    if (!componentElement) return null;

    return (
      <div
        key={component.id}
        onMouseDown={(e) => handleComponentMouseDown(e, component)}
        className={`absolute cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : 'hover:ring-1 hover:ring-gray-300'}`}
        style={{
          left: component.x,
          top: component.y,
          transform: `rotate(${component.rotation || 0}deg)`,
          opacity: component.opacity || 1,
          zIndex: component.zIndex || 0,
          cursor: state.isDragging && state.draggedComponent?.id === component.id ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        {componentElement}
        
        {isSelected && (
          <div className="absolute -top-10 left-0 flex gap-1 bg-white border border-gray-300 rounded-md shadow-lg p-1 z-50">
            <button
              onMouseDown={(e) => {
                e.stopPropagation();
                const editorRect = editorRef.current?.getBoundingClientRect();
                if (!editorRect) return;
                
                const mouseX = e.clientX - editorRect.left;
                const mouseY = e.clientY - editorRect.top;
                const offsetX = mouseX - component.x;
                const offsetY = mouseY - component.y;
                
                setState(prev => ({
                  ...prev,
                  isDragging: true,
                  draggedComponent: component,
                  dragOffset: { x: offsetX, y: offsetY }
                }));
              }}
              className="p-1 hover:bg-blue-100 rounded text-blue-600 border border-blue-200 cursor-move"
              title="Mover componente"
            >
              <Move className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Activar modo de edición específico del componente
                if (component.type === 'text') {
                  updateComponent(component.id, { isEditing: true });
                }
              }}
              className="p-1 hover:bg-green-100 rounded text-green-600 border border-green-200"
              title="Editar contenido"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateComponent(component.id);
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteComponent(component.id);
              }}
              className="p-1 hover:bg-red-100 rounded text-red-600"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }, [state.selectedComponentId, state.isDragging, state.draggedComponent, updateComponent, selectComponent, handleComponentMouseDown, duplicateComponent, deleteComponent]);

  const selectedComponent = useMemo(() => 
    state.components.find(comp => comp.id === state.selectedComponentId),
    [state.components, state.selectedComponentId]
  );

  const sortedComponents = useMemo(() => 
    state.components.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
    [state.components]
  );

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Área principal del editor */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-800">Editor Visual</h2>
          <p className="text-sm text-gray-600">Arrastra componentes desde el menú lateral o haz clic para agregar</p>
        </div>
        
        <div className="flex-1 flex">
          {/* Panel lateral izquierdo - Herramientas */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Herramientas de estilo */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Herramientas de Estilo</h3>
              <TextStyleCopier 
                onStyleCopied={handleStyleCopied}
                className="w-full"
              />
              {state.selectedComponentId && (
                <div className="mt-2 text-xs text-gray-500">
                  Componente seleccionado: {state.selectedComponentId}
                </div>
              )}
            </div>
          </div>
          
          {/* Área de edición */}
          <div 
            ref={editorRef}
            className="flex-1 relative bg-white m-4 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleEditorClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ minHeight: '600px' }}
          >
            {state.components.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-medium mb-2">Área de Diseño</h3>
                  <p className="text-sm">Arrastra componentes aquí para comenzar a diseñar</p>
                </div>
              </div>
            ) : (
              sortedComponents.map(renderComponent)
            )}
          </div>
          
          {/* Panel lateral derecho - Framework y Propiedades */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Framework Menu */}
            <div className="flex-1">
              <FrameworkMenu onAddComponent={addComponent} />
            </div>
            
            {/* Panel de propiedades */}
            {selectedComponent && (
              <div className="border-t border-gray-200">
                <PropertyPanel
                  component={selectedComponent}
                  onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorWithPalette;