import React, { useState, useRef } from 'react';
import { Bold, Italic, Link, List, ListOrdered, Eye, Code } from 'lucide-react';

interface SimpleEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({
  value,
  onChange,
  height = 400
}) => {
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restaurar selección
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, label: 'Negrita', before: '<strong>', after: '</strong>' },
    { icon: Italic, label: 'Cursiva', before: '<em>', after: '</em>' },
    { icon: Link, label: 'Enlace', before: '<a href="">', after: '</a>' },
    { icon: List, label: 'Lista', before: '<ul>\n<li>', after: '</li>\n</ul>' },
    { icon: ListOrdered, label: 'Lista numerada', before: '<ol>\n<li>', after: '</li>\n</ol>' }
  ];

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {formatButtons.map((button, index) => {
            const Icon = button.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={() => insertText(button.before, button.after)}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title={button.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`flex items-center px-3 py-1 text-xs rounded ${
              viewMode === 'code'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Code className="h-3 w-3 mr-1" />
            HTML
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center px-3 py-1 text-xs rounded ${
              viewMode === 'preview'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Eye className="h-3 w-3 mr-1" />
            Vista Previa
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ height: `${height}px` }}>
        {viewMode === 'code' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full p-4 border-none resize-none focus:outline-none font-mono text-sm"
            placeholder="<div>Escribe tu contenido HTML aquí...</div>"
          />
        ) : (
          <div className="h-full p-4 overflow-auto bg-white">
            <div 
              dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-500">No hay contenido para mostrar</p>' }}
              className="prose max-w-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleEditor;