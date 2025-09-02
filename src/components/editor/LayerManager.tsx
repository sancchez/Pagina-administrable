import React, { useState, useEffect } from 'react';
import { Layers, ChevronUp, ChevronDown, Eye, EyeOff, Trash2, X } from 'lucide-react';

interface LayerItem {
  id: string;
  name: string;
  element: HTMLElement;
  zIndex: number;
  visible: boolean;
  type: string;
}

interface LayerManagerProps {
  visible: boolean;
  onClose: () => void;
  containerRef?: React.RefObject<HTMLElement>;
  onLayerChange?: () => void;
}

const LayerManager: React.FC<LayerManagerProps> = ({
  visible,
  onClose,
  containerRef,
  onLayerChange
}) => {
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  // Detectar elementos y crear capas
  const detectLayers = () => {
    if (!containerRef?.current) return;

    const elements = containerRef.current.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, img, table, blockquote, div[data-shape], div[data-movable], div[data-resizable]'
    );

    const newLayers: LayerItem[] = [];
    
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      
      // Determinar el tipo de elemento
      let type = 'Texto';
      let name = 'Elemento';
      
      if (htmlElement.tagName.match(/^H[1-6]$/)) {
        type = 'Título';
        name = htmlElement.textContent?.substring(0, 20) || 'Título';
      } else if (htmlElement.tagName === 'P') {
        type = 'Párrafo';
        name = htmlElement.textContent?.substring(0, 20) || 'Párrafo';
      } else if (htmlElement.tagName === 'IMG') {
        type = 'Imagen';
        name = 'Imagen';
      } else if (htmlElement.hasAttribute('data-shape')) {
        const shape = htmlElement.getAttribute('data-shape');
        type = 'Forma';
        name = `${shape?.charAt(0).toUpperCase()}${shape?.slice(1)}` || 'Forma';
      } else if (htmlElement.hasAttribute('data-movable')) {
        type = 'Recuadro';
        name = htmlElement.textContent?.substring(0, 20) || 'Recuadro';
      } else if (htmlElement.tagName === 'TABLE') {
        type = 'Tabla';
        name = 'Tabla';
      } else if (htmlElement.tagName === 'BLOCKQUOTE') {
        type = 'Cita';
        name = htmlElement.textContent?.substring(0, 20) || 'Cita';
      }
      
      // Asignar z-index si no tiene
      if (!htmlElement.style.zIndex) {
        htmlElement.style.zIndex = (index + 1).toString();
      }
      
      newLayers.push({
        id: `layer-${index}`,
        name: name.trim() || `${type} ${index + 1}`,
        element: htmlElement,
        zIndex: parseInt(htmlElement.style.zIndex || (index + 1).toString()),
        visible: htmlElement.style.display !== 'none',
        type
      });
    });
    
    // Ordenar por z-index descendente (arriba primero)
    newLayers.sort((a, b) => b.zIndex - a.zIndex);
    setLayers(newLayers);
  };

  // Actualizar capas cuando se abre el panel
  useEffect(() => {
    if (visible) {
      detectLayers();
    }
  }, [visible, containerRef]);

  // Mover capa hacia arriba
  const moveLayerUp = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const newZIndex = layer.zIndex + 1;
    layer.element.style.zIndex = newZIndex.toString();
    
    setLayers(prev => 
      prev.map(l => 
        l.id === layerId ? { ...l, zIndex: newZIndex } : l
      ).sort((a, b) => b.zIndex - a.zIndex)
    );
    
    onLayerChange?.();
  };

  // Mover capa hacia abajo
  const moveLayerDown = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer || layer.zIndex <= 1) return;
    
    const newZIndex = layer.zIndex - 1;
    layer.element.style.zIndex = newZIndex.toString();
    
    setLayers(prev => 
      prev.map(l => 
        l.id === layerId ? { ...l, zIndex: newZIndex } : l
      ).sort((a, b) => b.zIndex - a.zIndex)
    );
    
    onLayerChange?.();
  };

  // Alternar visibilidad
  const toggleVisibility = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const newVisible = !layer.visible;
    layer.element.style.display = newVisible ? '' : 'none';
    
    setLayers(prev => 
      prev.map(l => 
        l.id === layerId ? { ...l, visible: newVisible } : l
      )
    );
    
    onLayerChange?.();
  };

  // Eliminar elemento
  const deleteLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${layer.name}"?`)) {
      layer.element.remove();
      setLayers(prev => prev.filter(l => l.id !== layerId));
      onLayerChange?.();
    }
  };

  // Seleccionar elemento en el editor
  const selectLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    // Remover selección anterior
    const previousSelected = containerRef?.current?.querySelector('.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }
    
    // Seleccionar nuevo elemento
    layer.element.classList.add('selected');
    layer.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setSelectedLayer(layerId);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-80 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Capas</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="text-sm text-gray-600 mb-4">
            Gestiona el orden y visibilidad de los elementos
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {layers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No hay elementos para gestionar
              </div>
            ) : (
              layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`flex items-center space-x-2 p-2 rounded border ${
                    selectedLayer === layer.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => selectLayer(layer.id)}
                >
                  {/* Tipo y nombre */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {layer.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {layer.type} • Z-index: {layer.zIndex}
                    </div>
                  </div>
                  
                  {/* Controles */}
                  <div className="flex items-center space-x-1">
                    {/* Visibilidad */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(layer.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title={layer.visible ? 'Ocultar' : 'Mostrar'}
                    >
                      {layer.visible ? (
                        <Eye className="h-4 w-4 text-gray-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    
                    {/* Mover arriba */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayerUp(layer.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Mover arriba"
                    >
                      <ChevronUp className="h-4 w-4 text-gray-600" />
                    </button>
                    
                    {/* Mover abajo */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayerDown(layer.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Mover abajo"
                      disabled={layer.zIndex <= 1}
                    >
                      <ChevronDown className={`h-4 w-4 ${
                        layer.zIndex <= 1 ? 'text-gray-300' : 'text-gray-600'
                      }`} />
                    </button>
                    
                    {/* Eliminar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <button
            onClick={detectLayers}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Actualizar capas
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayerManager;