import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Editor, Frame } from '@craftjs/core';
import { 
  HeroBlock, 
  ContactBlock, 
  TeamBlock,
  FormBlock,
  GalleryBlock,
  MapBlock,
  TableBlock,
  SliderBlock
} from './blocks';

// Resolver para el preview - memoizado para evitar recreaciones
const previewResolver = {
  HeroBlock,
  ContactBlock,
  TeamBlock,
  FormBlock,
  GalleryBlock,
  MapBlock,
  TableBlock,
  SliderBlock
};

export const PreviewFrame: React.FC = memo(() => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoizar el manejador de mensajes
  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.data.type === 'UPDATE_CONTENT') {
      setContent(event.data.data);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    
    // Solicitar contenido inicial
    window.parent.postMessage({ type: 'REQUEST_INITIAL_CONTENT' }, '*');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando preview...</p>
        </div>
      </div>
    );
  }

  // Memoizar el contenido de "sin contenido"
  const noContentView = useMemo(() => (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin contenido</h3>
        <p className="text-gray-600">Agrega componentes al editor para ver el preview</p>
      </div>
    </div>
  ), []);

  if (!content) {
    return noContentView;
  }

  return (
    <div className="min-h-screen bg-white">
      <Editor 
        resolver={previewResolver}
        enabled={false} // Solo lectura para el preview
      >
        <Frame data={content}>
          <div className="p-4">
            <p className="text-gray-500 text-center">Contenido del preview</p>
          </div>
        </Frame>
      </Editor>
    </div>
  );
});

export default PreviewFrame;