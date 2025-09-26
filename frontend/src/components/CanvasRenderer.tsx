import React, { memo, useCallback, useMemo } from 'react';
import { Frame, Element } from '@craftjs/core';
import { TextComponent, ButtonComponent, ContainerComponent, ImageComponent, contentResolver } from './content';
import { CanvasPage, CanvasBlock } from '../types/canvas';

// Usar el resolver centralizado
const resolver = contentResolver;

interface CanvasRendererProps {
  page: CanvasPage;
  className?: string;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = memo(({ page, className = '' }) => {
  // Memoizar la función de conversión de bloques
  const convertBlockToCraftElement = useCallback((block: CanvasBlock) => {
    // No renderizar bloques ocultos
    if (block.visible === false) {
      return null;
    }

    const commonProps = {
      position: {
        x: block.position.x,
        y: block.position.y
      },
      size: {
        width: block.size.width,
        height: block.size.height
      },
      style: block.style || {}
    };

    switch (block.type) {
      case 'text':
      case 'heading':
        return (
          <Element
            key={block.id}
            is={TextComponent}
            text={block.content || ''}
            fontSize={block.style?.fontSize || 16}
            fontFamily={block.style?.fontFamily || 'Arial'}
            fontWeight={block.style?.fontWeight || 'normal'}
            color={block.style?.color || '#000000'}
            textAlign={block.style?.textAlign || 'left'}
            {...commonProps}
          />
        );
      case 'image':
        return (
          <Element
            key={block.id}
            is={ImageComponent}
            src={block.src || ''}
            alt={block.alt || block.content || 'Imagen'}
            {...commonProps}
          />
        );

      case 'card':
      case 'background':
        return (
          <Element
            key={block.id}
            is={ContainerComponent}
            backgroundColor={block.style?.backgroundColor || 'transparent'}
            padding={block.style?.padding || 0}
            borderRadius={block.style?.borderRadius || 0}
            {...commonProps}
          >
            {block.content && (
              <Element
                is={TextComponent}
                text={block.content}
                fontSize={block.style?.fontSize || 16}
                color={block.style?.color || '#000000'}
                textAlign={block.style?.textAlign || 'center'}
              />
            )}
          </Element>
        );

      case 'button':
        return (
          <Element
            key={block.id}
            is={ButtonComponent}
            text={block.content || 'Button'}
            href={block.href || ''}
            target={block.target || '_self'}
            backgroundColor={block.style?.backgroundColor || '#007bff'}
            color={block.style?.color || '#ffffff'}
            fontSize={block.style?.fontSize || 16}
            padding={block.style?.padding || 12}
            borderRadius={block.style?.borderRadius || 4}
            {...commonProps}
          />
        );

      default:
        return (
          <Element
            key={block.id}
            is={ContainerComponent}
            {...commonProps}
          >
            <Element
              is={TextComponent}
              text={block.content || 'Elemento desconocido'}
              fontSize={16}
              color="#666666"
            />
          </Element>
        );
    }
  }, []); // Sin dependencias ya que no usa variables externas

  // Memoizar los elementos renderizados
  const renderedBlocks = useMemo(() => {
    return page.blocks.map(convertBlockToCraftElement);
  }, [page.blocks, convertBlockToCraftElement]);

  // Memoizar las configuraciones de la página
  const pageSettings = useMemo(() => ({
    backgroundColor: page.settings?.backgroundColor || '#ffffff',
    padding: 20
  }), [page.settings]);

  return (
    <Frame>
      <Element
        is={ContainerComponent}
        backgroundColor={pageSettings.backgroundColor}
        padding={pageSettings.padding}
        className={className}
      >
        {renderedBlocks}
      </Element>
    </Frame>
  );
});

// Hook para usar el renderizador con datos de página
export const useCanvasRenderer = (pageData: any) => {
  const [canvasPage, setCanvasPage] = React.useState<CanvasPage | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const processPageData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!pageData) {
          setError('No hay datos de página');
          return;
        }

        // Verificar si ya está en formato Canvas JSON
        if (pageData.publishedJson && pageData.publishedJson.blocks && Array.isArray(pageData.publishedJson.blocks)) {
          setCanvasPage(pageData.publishedJson as CanvasPage);
        } else if (pageData.draftJson && pageData.draftJson.blocks && Array.isArray(pageData.draftJson.blocks)) {
          setCanvasPage(pageData.draftJson as CanvasPage);
        } else {
          // Crear estructura Canvas con contenido básico si no existe
          const defaultCanvasPage: CanvasPage = {
            id: pageData.id || 'default',
            title: pageData.title || 'Página sin título',
            slug: pageData.slug || 'untitled',
            settings: {
              width: 1200,
              height: 800,
              backgroundColor: '#ffffff'
            },
            blocks: [
              {
                id: 'default-text',
                type: 'text',
                content: pageData.title || 'Esta página necesita ser editada con el editor visual',
                position: { x: 50, y: 50 },
                size: { width: 600, height: 100 },
                style: {
                  fontSize: 24,
                  color: '#333333',
                  fontFamily: 'Arial',
                  textAlign: 'left'
                },
                visible: true
              }
            ],
            version: 1
          };
          
          setCanvasPage(defaultCanvasPage);
        }
      } catch (err) {
        console.error('Error procesando datos de página:', err);
        setError('Error al procesar los datos de la página');
      } finally {
        setIsLoading(false);
      }
    };

    processPageData();
  }, [pageData]);

  return { canvasPage, isLoading, error };
};