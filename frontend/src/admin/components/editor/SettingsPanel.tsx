import React from 'react';
import { useEditor } from '@craftjs/core';
import { Settings, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export const SettingsPanel = () => {
  const { selected, actions, query } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').last();
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.toolbar,
        isDeletable: query.node(currentNodeId).isDeletable()
      };
    }

    return {
      selected
    };
  });

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Settings className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="font-semibold text-gray-800">Configuración</h3>
      </div>

      {selected ? (
        <div className="space-y-4">
          <div className="pb-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">
              {selected.name}
            </h4>
            {selected.isDeletable && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  actions.delete(selected.id);
                }}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>

          {selected.settings && React.createElement(selected.settings)}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
          </div>
          <p className="text-sm text-gray-500">
            Selecciona un elemento para ver sus configuraciones
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">Acciones</h4>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              actions.clearEvents();
            }}
            className="w-full text-xs"
          >
            Limpiar selección
          </Button>
        </div>
      </div>
    </div>
  );
};