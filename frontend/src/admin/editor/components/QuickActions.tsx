import React from 'react';
import { Editor } from 'grapesjs';
import { getAvailableQuickActions, canAlignElement, canMakeCircular, canReceivePastedImage } from '../helpers/selectionHelpers';

interface QuickActionsProps {
  editor: Editor | null;
  onPasteFromClipboard: () => void;
  onPasteImage: () => void;
  onQuickAlign: (alignment: 'left' | 'center' | 'right') => void;
  onMakeCircular: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  editor,
  onPasteFromClipboard,
  onPasteImage,
  onQuickAlign,
  onMakeCircular
}) => {
  if (!editor) return null;

  const canAlign = canAlignElement(editor);
  const canCircular = canMakeCircular(editor);
  const canPasteImg = canReceivePastedImage(editor);

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-2 flex items-center space-x-2 overflow-x-auto">
      {/* Acciones de pegado */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onPasteFromClipboard}
          className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-1 whitespace-nowrap"
          title="Pegar texto desde portapapeles"
        >
          <span>📋</span>
          <span>Pegar</span>
        </button>
        
        {canPasteImg && (
          <button
            onClick={onPasteImage}
            className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-1 whitespace-nowrap"
            title="Pegar imagen desde portapapeles"
          >
            <span>🖼️</span>
            <span>Imagen</span>
          </button>
        )}
      </div>

      {/* Separador */}
      {canAlign && <div className="h-6 w-px bg-gray-600"></div>}

      {/* Acciones de alineación */}
      {canAlign && (
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-400 mr-2">Alinear:</span>
          <button
            onClick={() => onQuickAlign('left')}
            className="px-2 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors duration-200"
            title="Alinear a la izquierda"
          >
            ⬅️
          </button>
          <button
            onClick={() => onQuickAlign('center')}
            className="px-2 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors duration-200"
            title="Centrar elemento"
          >
            ↔️
          </button>
          <button
            onClick={() => onQuickAlign('right')}
            className="px-2 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors duration-200"
            title="Alinear a la derecha"
          >
            ➡️
          </button>
        </div>
      )}

      {/* Separador */}
      {canCircular && <div className="h-6 w-px bg-gray-600"></div>}

      {/* Acciones de forma */}
      {canCircular && (
        <button
          onClick={onMakeCircular}
          className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-1 whitespace-nowrap"
          title="Convertir elemento a forma circular"
        >
          <span>⭕</span>
          <span>Circular</span>
        </button>
      )}

      {/* Información contextual */}
      <div className="flex-1"></div>
      
      <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-400">
        <span>💡</span>
        <span>
          {canAlign || canCircular || canPasteImg 
            ? 'Acciones disponibles para el elemento seleccionado'
            : 'Selecciona un elemento para ver más acciones'
          }
        </span>
      </div>
    </div>
  );
};

export default QuickActions;