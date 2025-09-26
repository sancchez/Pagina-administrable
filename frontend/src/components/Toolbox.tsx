import React, { memo, useCallback } from 'react';
import { useEditor, Element } from '@craftjs/core';
import { TextComponent, ButtonComponent, ContainerComponent, ImageComponent } from './content';

export const Toolbox: React.FC = memo(() => {
  const { connectors } = useEditor();

  // Memoizar las funciones de creación de elementos
  const createTextElement = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      connectors.create(ref, <Element is={TextComponent} text="Nuevo texto" />);
    }
  }, [connectors]);

  const createButtonElement = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      connectors.create(ref, <Element is={ButtonComponent} text="Nuevo botón" />);
    }
  }, [connectors]);

  const createImageElement = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      connectors.create(ref, <Element is={ImageComponent} src="https://via.placeholder.com/300x200?text=Nueva+Imagen" alt="Nueva imagen" />);
    }
  }, [connectors]);

  const createContainerElement = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      connectors.create(ref, <Element is={ContainerComponent} padding="20px" />);
    }
  }, [connectors]);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Elementos Básicos</h4>
        <div className="grid grid-cols-2 gap-2">
          {/* Text Component */}
          <div
            ref={createTextElement}
            className="bg-blue-50 border border-blue-200 rounded-lg p-2 cursor-move hover:bg-blue-100 transition-colors flex items-center justify-center text-center"
          >
            <span className="text-sm font-medium text-gray-700">Texto</span>
          </div>

          {/* Button Component */}
          <div
            ref={createButtonElement}
            className="bg-green-50 border border-green-200 rounded-lg p-2 cursor-move hover:bg-green-100 transition-colors flex items-center justify-center text-center"
          >
            <span className="text-sm font-medium text-gray-700">Botón</span>
          </div>

          {/* Image Component */}
          <div
            ref={createImageElement}
            className="bg-orange-50 border border-orange-200 rounded-lg p-2 cursor-move hover:bg-orange-100 transition-colors flex items-center justify-center text-center"
          >
            <span className="text-sm font-medium text-gray-700">Imagen</span>
          </div>
        </div>
      </div>

      {/* Layout Components */}
      <div>
        <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Layouts</h4>
        <div className="grid grid-cols-2 gap-2">
          {/* Container Component */}
          <div
            ref={createContainerElement}
            className="bg-purple-50 border border-purple-200 rounded-lg p-2 cursor-move hover:bg-purple-100 transition-colors flex items-center justify-center text-center"
          >
            <span className="text-sm font-medium text-gray-700">Contenedor</span>
          </div>

          {/* Flex Row Container */}
          <div
            ref={(ref) =>
              connectors.create(
                ref!,
                <Element 
                  is={ContainerComponent} 
                  display="flex" 
                  flexDirection="row" 
                  gap="16px" 
                  padding="16px"
                  canvas
                >
                  <Element is={TextComponent} text="Columna 1" />
                  <Element is={TextComponent} text="Columna 2" />
                </Element>
              )
            }
            className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 cursor-move hover:bg-indigo-100 transition-colors flex items-center justify-center text-center"
          >
            <span className="text-sm font-medium text-gray-700">Fila</span>
          </div>

          {/* Flex Column Container */}
          <div
            ref={(ref) =>
              connectors.create(
                ref!,
                <Element 
                  is={ContainerComponent} 
                  display="flex" 
                  flexDirection="column" 
                  gap="16px" 
                  padding="16px"
                  canvas
                >
                  <Element is={TextComponent} text="Fila 1" />
                  <Element is={TextComponent} text="Fila 2" />
                </Element>
              )
            }
            className="bg-teal-50 border border-teal-200 rounded-lg p-2 cursor-move hover:bg-teal-100 transition-colors flex items-center justify-center text-center"
          >
            <span className="text-sm font-medium text-gray-700">Columna</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Arrastra los componentes al canvas para agregarlos a tu página.
        </p>
      </div>
    </div>
  );
};

export default Toolbox;

// Bloques Avanzados que se pueden agregar después
/*
{/* Bloques Avanzados */}
<div>
  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Bloques</h4>
  <div className="grid grid-cols-1 gap-2">
    {/* Hero Block */}
    <div
      ref={(ref) =>
        ref && connectors.create(
          ref,
          <Element is={ContainerComponent} padding="40px" backgroundColor="#f3f4f6" canvas>
            <Element is={TextComponent} text="Hero Section" fontSize={32} fontWeight="bold" />
            <Element is={TextComponent} text="Descripción del hero" fontSize={16} />
            <Element is={ButtonComponent} text="Call to Action" />
          </Element>
        )
      }
      className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 cursor-move hover:bg-indigo-100 transition-colors"
    >
      <div className="text-center">
        <span className="text-sm font-medium text-gray-700">Hero Block</span>
        <p className="text-xs text-gray-500 mt-1">Sección principal con título y CTA</p>
      </div>
    </div>
  </div>
</div>
*/