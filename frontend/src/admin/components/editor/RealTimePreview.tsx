import React, { useState, useEffect, useRef } from 'react';
import { useEditor } from '@craftjs/core';
import { Eye, EyeOff, Monitor, Smartphone, Tablet, Maximize2 } from 'lucide-react';

interface RealTimePreviewProps {
  isVisible: boolean;
  onToggle: () => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceSizes = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' }
};

const deviceIcons = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone
};

export const RealTimePreview: React.FC<RealTimePreviewProps> = ({ isVisible, onToggle }) => {
  const { query } = useEditor();
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Actualizar preview cuando cambie el contenido del editor
  useEffect(() => {
    const updatePreview = () => {
      try {
        const serializedNodes = query.serialize();
        
        // Enviar datos al iframe para renderizar
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'UPDATE_CONTENT',
            data: serializedNodes
          }, '*');
        }
      } catch (error) {
        console.error('Error updating preview:', error);
      }
    };

    // Debounce las actualizaciones para mejor rendimiento
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(updatePreview, 300);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [query]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const DeviceIcon = deviceIcons[device];

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-20 right-4 bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Mostrar preview"
      >
        <Eye className="h-5 w-5" />
      </button>
    );
  }

  return (
    <>
      {/* Panel de preview */}
      <div className={`fixed right-0 top-0 bg-white border-l border-gray-200 shadow-lg z-40 transition-all duration-300 ${
        isFullscreen 
          ? 'inset-0' 
          : 'w-96 h-full'
      }`}>
        {/* Header del preview */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">Preview en Tiempo Real</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Selector de dispositivo */}
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              {(Object.keys(deviceSizes) as DeviceType[]).map((deviceType) => {
                const Icon = deviceIcons[deviceType];
                return (
                  <button
                    key={deviceType}
                    onClick={() => setDevice(deviceType)}
                    className={`p-1 rounded transition-colors ${
                      device === deviceType
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={deviceType}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            
            {/* Botón fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            
            {/* Botón cerrar */}
            <button
              onClick={onToggle}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Ocultar preview"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Contenido del preview */}
        <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 mx-auto transition-all duration-300"
            style={{
              width: deviceSizes[device].width,
              height: isFullscreen ? 'calc(100vh - 120px)' : deviceSizes[device].height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              ref={iframeRef}
              src="/preview-frame"
              className="w-full h-full rounded-lg"
              title="Preview en tiempo real"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
        
        {/* Información del dispositivo */}
        <div className="p-2 bg-gray-50 border-t border-gray-200 text-center">
          <span className="text-xs text-gray-600 flex items-center justify-center gap-1">
            <DeviceIcon className="h-3 w-3" />
            {device === 'desktop' ? 'Escritorio' : 
             device === 'tablet' ? 'Tablet (768px)' : 
             'Móvil (375px)'}
          </span>
        </div>
      </div>
      
      {/* Overlay para fullscreen */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={toggleFullscreen} />
      )}
    </>
  );
};

export default RealTimePreview;