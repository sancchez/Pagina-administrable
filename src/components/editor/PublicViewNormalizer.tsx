import React from 'react';

interface PublicViewNormalizerProps {
  content: string;
  className?: string;
}

const PublicViewNormalizer: React.FC<PublicViewNormalizerProps> = ({ content, className = '' }) => {
  return (
    <div className={`public-view-normalizer ${className}`}>
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <style>{`
        /* Normalización de estilos para vista pública */
        .public-view-normalizer .prose {
          /* Resetear estilos específicos del editor */
        }
        
        .public-view-normalizer .prose h1,
        .public-view-normalizer .prose h2,
        .public-view-normalizer .prose h3,
        .public-view-normalizer .prose h4,
        .public-view-normalizer .prose h5,
        .public-view-normalizer .prose h6 {
          /* Remover estilos de editor */
          padding: 0 !important;
          margin: 1.5rem 0 1rem 0 !important;
          background: transparent !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          transform: none !important;
          transition: none !important;
          cursor: default !important;
          min-height: auto !important;
          display: block !important;
          align-items: initial !important;
          justify-content: initial !important;
          text-align: left !important;
          width: auto !important;
          max-width: none !important;
        }
        
        .public-view-normalizer .prose p {
          /* Remover estilos de editor */
          padding: 0 !important;
          margin: 1rem 0 !important;
          background: transparent !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          transform: none !important;
          transition: none !important;
          cursor: default !important;
          min-height: auto !important;
          display: block !important;
          align-items: initial !important;
          justify-content: initial !important;
          text-align: left !important;
          width: auto !important;
          max-width: none !important;
        }
        
        .public-view-normalizer .prose blockquote {
          /* Remover estilos de editor */
          padding: 1rem 1.5rem !important;
          margin: 1.5rem 0 !important;
          background-color: #f9fafb !important;
          border-left: 4px solid #e5e7eb !important;
          border-radius: 0 6px 6px 0 !important;
          box-shadow: none !important;
          transform: none !important;
          transition: none !important;
          cursor: default !important;
          min-height: auto !important;
          text-align: left !important;
          width: auto !important;
          max-width: none !important;
        }
        
        .public-view-normalizer .prose li {
          /* Remover estilos de editor */
          padding: 0 !important;
          margin: 0.25rem 0 !important;
          background: transparent !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          transform: none !important;
          transition: none !important;
          cursor: default !important;
          min-height: auto !important;
          text-align: left !important;
          width: auto !important;
          max-width: none !important;
        }
        
        .public-view-normalizer .prose img {
          /* Remover estilos de editor */
          border-radius: 8px !important;
          transition: none !important;
          cursor: default !important;
          transform: none !important;
          box-shadow: none !important;
        }
        
        /* Ocultar elementos vacíos en vista pública */
        .public-view-normalizer .prose h1:empty,
        .public-view-normalizer .prose h2:empty,
        .public-view-normalizer .prose h3:empty,
        .public-view-normalizer .prose h4:empty,
        .public-view-normalizer .prose h5:empty,
        .public-view-normalizer .prose h6:empty,
        .public-view-normalizer .prose p:empty,
        .public-view-normalizer .prose blockquote:empty,
        .public-view-normalizer .prose li:empty {
          display: none !important;
        }
        
        /* Remover pseudo-elementos del editor */
        .public-view-normalizer .prose *:hover::after {
          display: none !important;
        }
        
        .public-view-normalizer .prose *::before {
          content: none !important;
        }
        
        /* Remover clases específicas del editor */
        .public-view-normalizer .prose .manual-empty {
          display: none !important;
        }
        
        /* Normalizar elementos con data-attributes del editor */
        .public-view-normalizer .prose div[data-shape],
        .public-view-normalizer .prose div[data-movable] {
          cursor: default !important;
          transition: none !important;
          user-select: text !important;
        }
        
        .public-view-normalizer .prose div[data-shape]:hover,
        .public-view-normalizer .prose div[data-movable]:hover {
          transform: none !important;
          filter: none !important;
          box-shadow: none !important;
        }
        
        /* Remover outlines de selección */
        .public-view-normalizer .prose *.selected {
          outline: none !important;
          z-index: auto !important;
        }
        
        /* Normalizar posicionamiento */
        .public-view-normalizer .prose > * {
          position: static !important;
          transition: none !important;
        }
        
        /* Asegurar que el texto se alinee correctamente */
        .public-view-normalizer .prose h1 {
          text-align: center !important;
          font-size: 2.25rem !important;
          line-height: 2.5rem !important;
          font-weight: 800 !important;
        }
        
        .public-view-normalizer .prose h2 {
          text-align: left !important;
          font-size: 1.875rem !important;
          line-height: 2.25rem !important;
          font-weight: 700 !important;
        }
        
        .public-view-normalizer .prose h3 {
          text-align: left !important;
          font-size: 1.5rem !important;
          line-height: 2rem !important;
          font-weight: 600 !important;
        }
        
        .public-view-normalizer .prose p {
          text-align: left !important;
          font-size: 1rem !important;
          line-height: 1.75rem !important;
          font-weight: 400 !important;
        }
        
        /* Espaciado consistente */
        .public-view-normalizer .prose > * + * {
          margin-top: 1rem !important;
        }
        
        .public-view-normalizer .prose > h1 + * {
          margin-top: 1.5rem !important;
        }
        
        .public-view-normalizer .prose > h2 + * {
          margin-top: 1.25rem !important;
        }
        
        .public-view-normalizer .prose > h3 + * {
          margin-top: 1rem !important;
        }
      `}</style>
    </div>
  );
};

export default PublicViewNormalizer;