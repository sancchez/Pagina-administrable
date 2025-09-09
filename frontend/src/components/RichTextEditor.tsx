import React, { useEffect, useRef, useState } from 'react';
import { Code, Monitor } from 'lucide-react';

// Declarar Quill para TypeScript
declare global {
  interface Window {
    Quill: any;
  }
}

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Escribe tu contenido aquí...",
  height = 400
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [codeContent, setCodeContent] = useState(value);
  const quillRef = useRef<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Cargar Quill desde CDN
  useEffect(() => {
    if (window.Quill) {
      setQuillLoaded(true);
      return;
    }

    // Cargar CSS de Quill
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
    document.head.appendChild(link);

    // Cargar JS de Quill
    const script = document.createElement('script');
    script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
    script.onload = () => {
      setQuillLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Inicializar Quill cuando esté cargado y en modo visual
  useEffect(() => {
    if (quillLoaded && viewMode === 'visual' && editorRef.current && window.Quill) {
      // Destruir instancia existente si existe
      if (quillRef.current) {
        quillRef.current = null;
      }

      // Crear nueva instancia de Quill
      const quill = new window.Quill(editorRef.current, {
        theme: 'snow',
        placeholder,
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
          ]
        }
      });

      // Establecer contenido inicial
      if (value) {
        quill.root.innerHTML = value;
      }

      // Escuchar cambios
      quill.on('text-change', () => {
        const content = quill.root.innerHTML;
        setCodeContent(content);
        onChange(content);
      });

      quillRef.current = quill;
    }
  }, [quillLoaded, viewMode, placeholder]);

  // Actualizar contenido cuando cambie el valor externo
  useEffect(() => {
    if (quillRef.current && value !== codeContent) {
      quillRef.current.root.innerHTML = value;
      setCodeContent(value);
    }
  }, [value]);

  const handleViewModeChange = (mode: 'visual' | 'code') => {
    if (mode === 'code' && quillRef.current) {
      // Obtener contenido de Quill antes de cambiar a código
      const content = quillRef.current.root.innerHTML;
      setCodeContent(content);
      onChange(content);
    } else if (mode === 'visual' && viewMode === 'code') {
      // Al volver a visual, el useEffect se encargará de reinicializar Quill
      onChange(codeContent);
    }
    setViewMode(mode);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setCodeContent(content);
    onChange(content);
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar de modo */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Editor de Contenido</span>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleViewModeChange('visual')}
            className={`flex items-center px-3 py-1 text-xs rounded ${
              viewMode === 'visual'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Monitor className="h-3 w-3 mr-1" />
            Visual
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange('code')}
            className={`flex items-center px-3 py-1 text-xs rounded ${
              viewMode === 'code'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Code className="h-3 w-3 mr-1" />
            HTML
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ height: `${height}px` }}>
        {viewMode === 'visual' ? (
          <div className="h-full">
            {quillLoaded ? (
              <div
                ref={editorRef}
                className="h-full"
                style={{ height: `${height}px` }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Cargando editor visual...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={codeContent}
            onChange={handleCodeChange}
            className="w-full h-full p-4 border-none resize-none focus:outline-none font-mono text-sm"
            placeholder="<div>Contenido HTML...</div>"
          />
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;