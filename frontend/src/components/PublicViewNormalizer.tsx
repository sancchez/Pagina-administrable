import React from 'react';

interface PublicViewNormalizerProps {
  content: string;
}

const PublicViewNormalizer: React.FC<PublicViewNormalizerProps> = ({ content }) => {
  console.log('🔍 PublicViewNormalizer: Received content:', content?.substring(0, 100) + '...');
  
  if (!content || !content.trim()) {
    console.log('🔍 PublicViewNormalizer: No content available');
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Esta página no tiene contenido aún.</p>
      </div>
    );
  }

  return (
    <div 
      className="max-w-none text-gray-700"
      style={{
        lineHeight: '1.6',
        fontSize: '16px'
      }}
    >
      <style>{`
        .public-content h1 {
          font-size: 2rem;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 1.5rem;
        }
        .public-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e3a8a;
          margin-bottom: 1rem;
        }
        .public-content p {
          margin-bottom: 1rem;
          color: #374151;
        }
        .public-content .bg-white {
          background-color: white;
        }
        .public-content .max-w-4xl {
          max-width: 56rem;
        }
        .public-content .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
        .public-content .px-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        .public-content .py-8 {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
        .public-content .text-3xl {
          font-size: 1.875rem;
        }
        .public-content .font-bold {
          font-weight: 700;
        }
        .public-content .text-blue-900 {
          color: #1e3a8a;
        }
        .public-content .mb-6 {
          margin-bottom: 1.5rem;
        }
      `}</style>
      <div 
        className="public-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default PublicViewNormalizer;