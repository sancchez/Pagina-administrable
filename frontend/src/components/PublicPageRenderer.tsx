import React from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { ContainerComponent, TextComponent, ButtonComponent, ImageComponent } from './content';
import HeroBlock from './blocks/HeroBlock';
import ContactBlock from './blocks/ContactBlock';
import TeamBlock from './blocks/TeamBlock';
import { 
  FormBlock, 
  GalleryBlock, 
  MapBlock, 
  TableBlock, 
  SliderBlock 
} from './blocks';
import { convertToFormat, detectDataFormat } from '../services/dataConverter';

interface PublicPageRendererProps {
  pageData: any;
  className?: string;
}

export const PublicPageRenderer: React.FC<PublicPageRendererProps> = ({ 
  pageData, 
  className = '' 
}) => {
  if (!pageData) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Página en construcción</h1>
          <p className="text-gray-600">Esta página está siendo configurada desde el panel administrativo.</p>
        </div>
      </div>
    );
  }

  console.log('Renderizando página', pageData);

  // Procesar los datos de la página usando el convertidor
  let craftNodes: any = null;
  try {
    // Usar published_json preferentemente, luego draft_json
    const jsonData = pageData.published_json || pageData.draft_json;
    
    if (jsonData) {
      const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      const dataFormat = detectDataFormat(parsedData);
      
      if (dataFormat === 'legacy') {
        // Convertir datos legacy a formato Craft.js
        craftNodes = convertToFormat(parsedData, 'craft');
      } else if (dataFormat === 'craft') {
        craftNodes = parsedData;
      } else {
        console.warn('Formato de datos desconocido, creando página vacía');
        craftNodes = {
          ROOT: {
            type: { resolvedName: 'ContainerComponent' },
            isCanvas: true,
            props: { className: 'min-h-screen' },
            displayName: 'Container',
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {}
          }
        };
      }
    }
  } catch (error) {
    console.error('Error processing page data:', error);
  }

  // Si no hay datos de Craft.js válidos, mostrar contenido por defecto
  if (!craftNodes) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{pageData.title || 'Página'}</h1>
          <p className="text-gray-600">Esta página está siendo configurada desde el panel administrativo.</p>
        </div>
      </div>
    );
  }

  // Resolver con todos los componentes disponibles
  const resolver = {
    ContainerComponent,
    TextComponent,
    ButtonComponent,
    ImageComponent,
    HeroBlock,
    ContactBlock,
    TeamBlock,
    FormBlock,
    GalleryBlock,
    MapBlock,
    TableBlock,
    SliderBlock
  };

  return (
    <div className={`min-h-screen ${className}`}>
      {/* Renderizador público usando los mismos componentes que el editor */}
      <Editor resolver={resolver} enabled={false}>
        <Frame data={craftNodes}>
          <Element 
            is={ContainerComponent} 
            canvas 
            className="min-h-screen"
          >
            {/* El contenido se renderiza automáticamente desde craftNodes */}
          </Element>
        </Frame>
      </Editor>
    </div>
  );
};

export default PublicPageRenderer;