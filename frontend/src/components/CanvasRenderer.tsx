import React from 'react';
import { CanvasPage, CanvasBlock } from '../types/canvas';

interface CanvasRendererProps {
  page: CanvasPage;
  className?: string;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({ page, className = '' }) => {
  const renderBlock = (block: CanvasBlock) => {
    // No renderizar bloques ocultos
    if (block.visible === false) {
      return null;
    }

    const blockStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${block.position.x}px`,
      top: `${block.position.y}px`,
      width: `${block.size.width}px`,
      height: `${block.size.height}px`,
      fontSize: block.style?.fontSize ? `${block.style.fontSize}px` : undefined,
      fontFamily: block.style?.fontFamily,
      fontWeight: block.style?.fontWeight,
      color: block.style?.color,
      backgroundColor: block.style?.backgroundColor,
      textAlign: block.style?.textAlign as any,
      borderRadius: block.style?.borderRadius ? `${block.style.borderRadius}px` : undefined,
      opacity: block.style?.opacity,
      transform: block.style?.rotation ? `rotate(${block.style.rotation}deg)` : undefined,
      padding: block.style?.padding ? `${block.style.padding}px` : undefined,
      border: block.style?.border,
      boxShadow: block.style?.boxShadow,
      overflow: 'hidden',
      wordWrap: 'break-word',
      display: 'flex',
      alignItems: block.type === 'button' ? 'center' : 'flex-start',
      justifyContent: block.style?.textAlign === 'center' ? 'center' : 
                     block.style?.textAlign === 'right' ? 'flex-end' : 'flex-start'
    };

    switch (block.type) {
      case 'text':
        return (
          <div
            key={block.id}
            style={blockStyle}
            className="canvas-text-block"
          >
            {block.content}
          </div>
        );

      case 'heading':
        const HeadingTag = block.style.fontSize && block.style.fontSize >= 32 ? 'h1' :
                          block.style.fontSize && block.style.fontSize >= 24 ? 'h2' :
                          block.style.fontSize && block.style.fontSize >= 20 ? 'h3' : 'h4';
        
        return React.createElement(
          HeadingTag,
          {
            key: block.id,
            style: blockStyle,
            className: 'canvas-heading-block'
          },
          block.content
        );

      case 'image':
        return (
          <img
            key={block.id}
            src={block.src}
            alt={block.alt || block.content || 'Imagen'}
            style={blockStyle}
            className="canvas-image-block"
            loading="lazy"
          />
        );

      case 'card':
        return (
          <div
            key={block.id}
            style={{
              ...blockStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              whiteSpace: 'pre-line'
            }}
            className="canvas-card-block"
          >
            {block.content?.split('\n').map((line, index) => (
              <div key={index} style={{ 
                fontWeight: index === 0 ? 'bold' : 'normal',
                fontSize: index === 1 ? '1.5em' : 'inherit',
                marginBottom: index < 2 ? '4px' : '0'
              }}>
                {line}
              </div>
            ))}
          </div>
        );

      case 'background':
        return (
          <div
            key={block.id}
            style={blockStyle}
            className="canvas-background-block"
          />
        );

      case 'button':
        const handleButtonClick = () => {
          if (block.href) {
            if (block.href.startsWith('http') || block.href.startsWith('mailto:') || block.href.startsWith('tel:')) {
              window.open(block.href, block.target || '_self');
            } else {
              window.location.href = block.href;
            }
          }
        };

        return (
          <button
            key={block.id}
            style={{
              ...blockStyle,
              cursor: block.href ? 'pointer' : 'default',
              border: block.style.border || 'none',
              outline: 'none'
            }}
            className="canvas-button-block"
            onClick={handleButtonClick}
            disabled={!block.href}
          >
            {block.content}
          </button>
        );

      case 'video':
        const isYouTube = block.src?.includes('youtube.com') || block.src?.includes('youtu.be');
        const isVimeo = block.src?.includes('vimeo.com');
        
        if (isYouTube || isVimeo) {
          let embedSrc = block.src;
          
          if (isYouTube && block.src) {
            const videoId = block.src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
            if (videoId) {
              embedSrc = `https://www.youtube.com/embed/${videoId[1]}`;
            }
          } else if (isVimeo && block.src) {
            const videoId = block.src.match(/vimeo\.com\/(\d+)/);
            if (videoId) {
              embedSrc = `https://player.vimeo.com/video/${videoId[1]}`;
            }
          }
          
          return (
            <iframe
              key={block.id}
              src={embedSrc}
              style={blockStyle}
              className="canvas-video-block"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          );
        } else {
          return (
            <video
              key={block.id}
              src={block.src}
              style={blockStyle}
              className="canvas-video-block"
              controls
              preload="metadata"
            >
              Tu navegador no soporta el elemento de video.
            </video>
          );
        }

      default:
        return (
          <div
            key={block.id}
            style={blockStyle}
            className="canvas-unknown-block"
          >
            {block.content || 'Elemento desconocido'}
          </div>
        );
    }
  };

  // Calcular el tamaño del contenedor basado en los bloques
  const calculateContainerSize = () => {
    if (page.blocks.length === 0) {
      return { width: 1200, height: 800 };
    }

    let maxX = 0;
    let maxY = 0;

    page.blocks.forEach(block => {
      if (block.visible !== false) {
        const blockRight = block.position.x + block.size.width;
        const blockBottom = block.position.y + block.size.height;
        
        if (blockRight > maxX) maxX = blockRight;
        if (blockBottom > maxY) maxY = blockBottom;
      }
    });

    return {
      width: Math.max(maxX + 50, 1200), // Mínimo 1200px con padding
      height: Math.max(maxY + 50, 400)  // Mínimo 400px con padding
    };
  };

  const containerSize = calculateContainerSize();

  return (
    <div 
      className={`canvas-renderer ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: `${containerSize.height}px`,
        overflow: 'hidden'
      }}
    >
      {/* Contenedor de bloques */}
      <div
        style={{
          position: 'relative',
          width: `${containerSize.width}px`,
          height: `${containerSize.height}px`,
          margin: '0 auto'
        }}
      >
        {page.blocks.map(renderBlock)}
      </div>
      
      {/* Estilos CSS adicionales para SEO y accesibilidad */}
      <style>{`
        .canvas-renderer {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
        }
        
        .canvas-text-block,
        .canvas-heading-block {
          line-height: 1.4;
          word-break: break-word;
          hyphens: auto;
        }
        
        .canvas-image-block {
          object-fit: cover;
          max-width: 100%;
          height: auto;
        }
        
        .canvas-button-block {
          transition: all 0.2s ease;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .canvas-button-block:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .canvas-button-block:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .canvas-video-block {
          border: none;
        }
        
        @media (max-width: 768px) {
          .canvas-renderer {
            transform: scale(0.8);
            transform-origin: top left;
          }
        }
        
        @media (max-width: 480px) {
          .canvas-renderer {
            transform: scale(0.6);
            transform-origin: top left;
          }
        }
      `}</style>
    </div>
  );
};

// Hook para usar el renderizador con datos de página
export const useCanvasRenderer = (pageData: any) => {
  console.log('🎨 [CanvasRenderer] Hook INICIADO con pageData:', {
    pageData,
    pageDataType: typeof pageData,
    pageDataKeys: pageData ? Object.keys(pageData) : null,
    hasPageData: !!pageData
  });
  
  const [canvasPage, setCanvasPage] = React.useState<CanvasPage | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    console.log('🔄 [CanvasRenderer] useEffect EJECUTADO con pageData:', {
      pageData,
      pageDataExists: !!pageData,
      pageDataType: typeof pageData
    });
    
    const processPageData = async () => {
      console.log('⚙️ [CanvasRenderer] processPageData INICIADO');
      
      try {
        setIsLoading(true);
        setError(null);
        console.log('🔄 [CanvasRenderer] Estados inicializados (loading=true, error=null)');

        if (!pageData) {
          console.log('❌ [CanvasRenderer] No hay pageData, estableciendo error');
          setError('No hay datos de página');
          return;
        }

        console.log('📊 [CanvasRenderer] Analizando estructura de pageData:', {
          pageData,
          keys: Object.keys(pageData),
          hasDraftJson: !!pageData.draftJson,
          hasPublishedJson: !!pageData.publishedJson,
          draftJsonType: typeof pageData.draftJson,
          publishedJsonType: typeof pageData.publishedJson,
          draftJsonContent: pageData.draftJson,
          publishedJsonContent: pageData.publishedJson
        });

        // Verificar si ya está en formato Canvas
        if (pageData.draftJson && pageData.draftJson.blocks && Array.isArray(pageData.draftJson.blocks)) {
          console.log('✅ [CanvasRenderer] Usando draftJson como CanvasPage:', {
            draftJson: pageData.draftJson,
            blocksCount: pageData.draftJson.blocks.length,
            blocks: pageData.draftJson.blocks
          });
          setCanvasPage(pageData.draftJson as CanvasPage);
        } else if (pageData.publishedJson && pageData.publishedJson.blocks && Array.isArray(pageData.publishedJson.blocks)) {
          console.log('✅ [CanvasRenderer] Usando publishedJson como CanvasPage:', {
            publishedJson: pageData.publishedJson,
            blocksCount: pageData.publishedJson.blocks.length,
            blocks: pageData.publishedJson.blocks
          });
          setCanvasPage(pageData.publishedJson as CanvasPage);
        } else {
          console.log('🔄 [CanvasRenderer] No hay datos Canvas válidos, iniciando migración desde HTML:', {
            hasContent: !!pageData.content,
            contentLength: pageData.content ? pageData.content.length : 0,
            contentPreview: pageData.content ? pageData.content.substring(0, 200) + '...' : null
          });
          
          // Convertir desde HTML usando el migrador
          console.log('📦 [CanvasRenderer] Importando canvasMigrator...');
          const { migrateToCanvasFormat } = await import('../utils/canvasMigrator');
          
          console.log('🔄 [CanvasRenderer] Ejecutando migración...');
          const migrationResult = await migrateToCanvasFormat(pageData);
          
          console.log('📋 [CanvasRenderer] Resultado de migración:', {
            migrationResult,
            success: migrationResult.success,
            hasPage: !!migrationResult.page,
            errors: migrationResult.errors,
            page: migrationResult.page
          });
          
          if (migrationResult.success && migrationResult.page) {
            console.log('✅ [CanvasRenderer] Migración exitosa, estableciendo CanvasPage:', migrationResult.page);
            setCanvasPage(migrationResult.page);
          } else {
            console.error('❌ [CanvasRenderer] Error en migración:', migrationResult.errors);
            setError('Error al migrar los datos de la página');
          }
        }
      } catch (err) {
        console.error('❌ [CanvasRenderer] Error COMPLETO procesando datos de página:', {
          error: err,
          errorMessage: err instanceof Error ? err.message : 'Error desconocido',
          errorStack: err instanceof Error ? err.stack : null,
          pageData
        });
        setError('Error al procesar los datos de la página');
      } finally {
        console.log('🏁 [CanvasRenderer] processPageData FINALIZADO, estableciendo loading=false');
        setIsLoading(false);
      }
    };

    processPageData();
  }, [pageData]);

  console.log('📤 [CanvasRenderer] Hook retornando:', {
    canvasPage,
    isLoading,
    error,
    hasCanvasPage: !!canvasPage,
    canvasPageBlocksCount: canvasPage?.blocks?.length || 0
  });

  return { canvasPage, isLoading, error };
};