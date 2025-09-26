import React, { useState } from 'react';
import { useEditor, useNode } from '@craftjs/core';
import { Trash2, Move, Copy, Settings, Eye } from 'lucide-react';

/**
 * Herramientas visuales para elementos seleccionados
 */
export const ElementToolbar: React.FC = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').last();
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable()
      };
    }

    return {
      selected,
      isEnabled: state.options.enabled
    };
  });

  if (!isEnabled || !selected) return null;

  const handleDelete = () => {
    if (selected.isDeletable) {
      actions.delete(selected.id);
    }
  };

  const handleClone = () => {
    const { query } = useEditor();
    const tree = query.node(selected.id).toSerializedNode();
    const newNodeTree = query.parseSerializedNode(tree).toNode();
    actions.add(newNodeTree, selected.id);
  };

  const handleMoveUp = () => {
    const { query } = useEditor();
    const parentId = query.node(selected.id).get().data.parent;
    if (parentId) {
      const parent = query.node(parentId).get();
      const currentIndex = parent.data.nodes.indexOf(selected.id);
      if (currentIndex > 0) {
        actions.move(selected.id, parentId, currentIndex - 1);
      }
    }
  };

  const handleMoveDown = () => {
    const { query } = useEditor();
    const parentId = query.node(selected.id).get().data.parent;
    if (parentId) {
      const parent = query.node(parentId).get();
      const currentIndex = parent.data.nodes.indexOf(selected.id);
      if (currentIndex < parent.data.nodes.length - 1) {
        actions.move(selected.id, parentId, currentIndex + 1);
      }
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg border p-2 flex gap-2 z-50">
      <div className="text-sm font-medium text-gray-700 px-2 py-1">
        {selected.name}
      </div>
      
      <div className="flex gap-1">
        <button
          onClick={handleMoveUp}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Mover arriba"
        >
          <Move className="w-4 h-4 rotate-180" />
        </button>
        
        <button
          onClick={handleMoveDown}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Mover abajo"
        >
          <Move className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleClone}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Duplicar"
        >
          <Copy className="w-4 h-4" />
        </button>
        
        {selected.settings && (
          <button
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
        
        {selected.isDeletable && (
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Indicador visual para elementos seleccionados
 */
export const SelectionIndicator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered
  }));

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className={`relative ${
        selected
          ? 'ring-2 ring-blue-500 ring-opacity-75'
          : hovered
          ? 'ring-2 ring-blue-300 ring-opacity-50'
          : ''
      }`}
    >
      {children}
      
      {selected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          Seleccionado
        </div>
      )}
    </div>
  );
};

/**
 * Guías de alineación visual
 */
export const AlignmentGuides: React.FC = () => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Líneas de guía verticales */}
      <div className="absolute left-1/4 top-0 bottom-0 w-px bg-blue-200 opacity-30" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-200 opacity-30" />
      <div className="absolute left-3/4 top-0 bottom-0 w-px bg-blue-200 opacity-30" />
      
      {/* Líneas de guía horizontales */}
      <div className="absolute top-1/4 left-0 right-0 h-px bg-blue-200 opacity-30" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-200 opacity-30" />
      <div className="absolute top-3/4 left-0 right-0 h-px bg-blue-200 opacity-30" />
    </div>
  );
};

/**
 * Panel de capas para visualizar la estructura
 */
export const LayersPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { nodes, actions } = useEditor((state) => ({
    nodes: state.nodes
  }));

  const renderNode = (nodeId: string, level: number = 0) => {
    const node = nodes[nodeId];
    if (!node) return null;

    const hasChildren = node.data.nodes && node.data.nodes.length > 0;
    const [isExpanded, setIsExpanded] = useState(true);

    return (
      <div key={nodeId} className="select-none">
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${
            level > 0 ? `ml-${level * 4}` : ''
          }`}
          onClick={() => actions.selectNode(nodeId)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mr-1 w-4 h-4 flex items-center justify-center"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          
          <span className="text-sm text-gray-700">
            {node.data.displayName || node.data.name}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Toggle visibility
            }}
            className="ml-auto p-1 hover:bg-gray-200 rounded"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.data.nodes.map((childId: string) => 
              renderNode(childId, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 bg-white shadow-lg rounded-lg border p-2 z-50"
        title="Panel de capas"
      >
        <div className="w-4 h-4 border border-gray-400 relative">
          <div className="absolute inset-1 border border-gray-600" />
        </div>
      </button>
      
      {isOpen && (
        <div className="fixed left-4 top-16 w-64 bg-white shadow-lg rounded-lg border z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b">
            <h3 className="font-medium text-gray-900">Capas</h3>
          </div>
          
          <div className="p-2">
            {Object.keys(nodes)
              .filter(nodeId => !nodes[nodeId].data.parent)
              .map(nodeId => renderNode(nodeId))
            }
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Herramientas de zoom y vista
 */
export const ViewTools: React.FC = () => {
  const [zoom, setZoom] = useState(100);
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 25, 200);
    setZoom(newZoom);
    // Aplicar zoom al canvas
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 25, 25);
    setZoom(newZoom);
    // Aplicar zoom al canvas
  };

  const handleResetZoom = () => {
    setZoom(100);
    // Resetear zoom del canvas
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg border p-2 flex items-center gap-2 z-50">
      <button
        onClick={handleZoomOut}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title="Alejar"
      >
        -
      </button>
      
      <button
        onClick={handleResetZoom}
        className="px-2 py-1 text-sm hover:bg-gray-100 rounded transition-colors"
        title="Resetear zoom"
      >
        {zoom}%
      </button>
      
      <button
        onClick={handleZoomIn}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title="Acercar"
      >
        +
      </button>
    </div>
  );
};

export default {
  ElementToolbar,
  SelectionIndicator,
  AlignmentGuides,
  LayersPanel,
  ViewTools
};