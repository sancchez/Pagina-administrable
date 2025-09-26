import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { contentResolver, ContainerComponent } from './index';

interface PageRendererProps {
  pageJson: unknown; // The published_json from the backend
}

const PageRenderer: React.FC<PageRendererProps> = ({ pageJson }) => {
  if (!pageJson) {
    return <div data-testid="page-renderer">No content to display.</div>;
  }

  // Procesar los datos JSON para Craft.js
  let craftNodes = null;
  
  try {
    // Si pageJson es una cadena, parsearla
    if (typeof pageJson === 'string') {
      craftNodes = JSON.parse(pageJson);
    } else if (typeof pageJson === 'object') {
      // Si ya es un objeto, usarlo directamente
      craftNodes = pageJson;
    }
  } catch (error) {
    console.error('Error parsing pageJson:', error);
    return (
      <div data-testid="page-renderer">
        <p>Error parsing page content.</p>
      </div>
    );
  }

  // Verificar si tenemos datos válidos de Craft.js
  if (!craftNodes || typeof craftNodes !== 'object') {
    return (
      <div data-testid="page-renderer">
        <p>Invalid page content format.</p>
      </div>
    );
  }

  // Si es un objeto con estructura de bloques legacy, convertir o mostrar mensaje
  if (craftNodes.blocks && Array.isArray(craftNodes.blocks)) {
    return (
      <div data-testid="page-renderer">
        <p>Legacy block format detected. Please update content in the admin panel.</p>
      </div>
    );
  }

  // Si no tiene estructura ROOT de Craft.js, mostrar error
  if (!craftNodes.ROOT) {
    return (
      <div data-testid="page-renderer">
        <p>Invalid Craft.js content structure.</p>
      </div>
    );
  }

  // Renderizar usando Craft.js con los mismos componentes que el editor
  return (
    <div data-testid="page-renderer">
      <Editor resolver={contentResolver} enabled={false}>
        <Frame data={craftNodes}>
          <Element 
            is={ContainerComponent} 
            canvas 
            className="w-full"
          >
            {/* El contenido se renderiza automáticamente desde craftNodes */}
          </Element>
        </Frame>
      </Editor>
    </div>
  );
};

export default PageRenderer;