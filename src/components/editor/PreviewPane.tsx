import React from 'react';

interface PreviewPaneProps {
  content: string;
  className?: string;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ content, className = '' }) => {
  return (
    <div className={`preview-pane ${className}`}>
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Vista Previa</h3>
      </div>
      <div 
        className="p-6 bg-white min-h-[600px] prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      />
    </div>
  );
};

export default PreviewPane;