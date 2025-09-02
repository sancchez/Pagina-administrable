import React, { useEffect, useRef, useState } from 'react';

interface BackgroundRendererProps {
  containerRef: React.RefObject<HTMLElement>;
  onColorChange?: (color: string) => void;
}

interface BackgroundData {
  color?: string;
  gradient?: string;
  image?: string;
  video?: string;
  heroBackground?: string;
  bodyBackground?: string;
}

interface ColorMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  position: { x: number; y: number };
}

// Componente del menú de colores
const ColorMenu: React.FC<ColorMenuProps> = ({ isOpen, onClose, onColorSelect, position }) => {
  const predefinedColors = [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd',
    '#6c757d', '#495057', '#343a40', '#212529', '#000000',
    '#ff6b6b', '#ee5a24', '#ff9ff3', '#54a0ff', '#5f27cd',
    '#00d2d3', '#ff9f43', '#feca57', '#48dbfb', '#0abde3',
    '#006ba6', '#0582ca', '#00a8cc', '#ffbe0b', '#fb8500',
    '#8ecae6', '#219ebc', '#023047', '#ffb3c6', '#fb8b24'
  ];

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50" 
      onClick={onClose}
    >
      <div 
        className="absolute bg-white rounded-lg shadow-xl border p-4 min-w-[280px]"
        style={{ 
          left: Math.min(position.x, window.innerWidth - 300), 
          top: Math.min(position.y, window.innerHeight - 400) 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold mb-3 text-gray-700">Colores de Fondo</h3>
        
        {/* Colores sólidos */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Colores Sólidos</p>
          <div className="grid grid-cols-6 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-gray-200 hover:border-blue-400 transition-colors"
                style={{ backgroundColor: color }}
                onClick={() => {
                  onColorSelect(color);
                  onClose();
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Gradientes */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Gradientes</p>
          <div className="grid grid-cols-2 gap-2">
            {gradients.map((gradient, index) => (
              <button
                key={index}
                className="w-full h-8 rounded border-2 border-gray-200 hover:border-blue-400 transition-colors"
                style={{ background: gradient }}
                onClick={() => {
                  onColorSelect(gradient);
                  onClose();
                }}
                title={`Gradiente ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Botón para cerrar */}
        <button
          onClick={onClose}
          className="mt-3 w-full px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({ 
  containerRef, 
  onColorChange 
}) => {
  const [backgroundData, setBackgroundData] = useState<BackgroundData>({});
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const backgroundRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Función para capturar el fondo real de la página
  const capturePageBackground = () => {
    const newBackgroundData: BackgroundData = {};

    // 1. Capturar fondo del body
    const bodyStyle = window.getComputedStyle(document.body);
    if (bodyStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      newBackgroundData.bodyBackground = bodyStyle.backgroundColor;
    }
    if (bodyStyle.backgroundImage !== 'none') {
      newBackgroundData.bodyBackground = bodyStyle.background;
    }

    // 2. Buscar elementos Hero con fondos específicos
    const heroSelectors = [
      'section[class*="hero"]',
      '.hero',
      'section:first-of-type',
      '[class*="bg-gradient"]',
      '[style*="background"]'
    ];
    
    heroSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const style = window.getComputedStyle(element as HTMLElement);
        
        // Capturar gradientes
        if (style.background.includes('gradient')) {
          newBackgroundData.gradient = style.background;
        }
        
        // Capturar imágenes de fondo
        if (style.backgroundImage !== 'none') {
          newBackgroundData.image = style.backgroundImage;
        }
        
        // Capturar colores de fondo
        if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          newBackgroundData.color = style.backgroundColor;
        }
      });
    });

    // 3. Buscar videos de fondo
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach((video) => {
      const videoEl = video as HTMLVideoElement;
      const videoStyle = window.getComputedStyle(videoEl);
      
      // Verificar si es un video de fondo
      if (videoEl.autoplay && 
          (videoStyle.position === 'fixed' || 
           videoStyle.position === 'absolute' ||
           videoEl.closest('section') || 
           videoEl.closest('.hero'))) {
        
        const src = videoEl.src || 
                   (videoEl.querySelector('source') as HTMLSourceElement)?.src ||
                   videoEl.currentSrc;
        
        if (src) {
          newBackgroundData.video = src;
        }
      }
    });

    // 4. Buscar fondos en elementos específicos del proyecto
    const projectElements = document.querySelectorAll('[class*="bg-"], [class*="from-"], [class*="to-"]');
    projectElements.forEach((element) => {
      const style = window.getComputedStyle(element as HTMLElement);
      if (style.background.includes('gradient')) {
        newBackgroundData.heroBackground = style.background;
      }
    });

    setBackgroundData(newBackgroundData);
    // Background captured silently
  };

  // Función para manejar cambio de color desde el menú
  const handleColorChange = (color: string) => {
    if (!backgroundRef.current) return;

    const backgroundEl = backgroundRef.current;
    
    // Aplicar el color seleccionado
    if (color.includes('gradient')) {
      backgroundEl.style.background = color;
      backgroundEl.style.backgroundColor = '';
    } else {
      backgroundEl.style.backgroundColor = color;
      backgroundEl.style.background = '';
    }
    
    // Actualizar el estado
    setBackgroundData(prev => ({
      ...prev,
      color: color.includes('gradient') ? undefined : color,
      gradient: color.includes('gradient') ? color : undefined
    }));
    
    // Notificar al componente padre
    onColorChange?.(color);
    
    console.log('🎨 Color de fondo cambiado:', color);
  };

  // Función para mostrar el menú de colores
  const handleShowColorMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setIsColorMenuOpen(true);
  };

  // Función para aplicar el fondo capturado al editor
  const applyBackgroundToEditor = () => {
    if (!backgroundRef.current) return;

    const backgroundEl = backgroundRef.current;
    
    // Limpiar estilos previos
    backgroundEl.style.background = '';
    backgroundEl.style.backgroundColor = '';
    backgroundEl.style.backgroundImage = '';
    
    // Remover video anterior si existe
    if (videoRef.current) {
      videoRef.current.remove();
      videoRef.current = null;
    }

    // Aplicar fondo en orden de prioridad
    if (backgroundData.video) {
      // Crear elemento de video de fondo
      const videoEl = document.createElement('video');
      videoEl.src = backgroundData.video;
      videoEl.autoplay = true;
      videoEl.loop = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: -1;
        opacity: 0.8;
      `;
      
      // Manejar errores de carga del video
      videoEl.onerror = () => {
        console.warn('⚠️ Error cargando video de fondo, usando fallback');
        videoEl.remove();
        applyFallbackBackground();
      };
      
      backgroundEl.appendChild(videoEl);
      videoRef.current = videoEl;
      
      // Aplicar gradiente sobre el video si existe
      if (backgroundData.gradient || backgroundData.heroBackground) {
        backgroundEl.style.background = backgroundData.gradient || backgroundData.heroBackground || '';
        backgroundEl.style.backgroundBlendMode = 'overlay';
      }
    } else if (backgroundData.gradient || backgroundData.heroBackground) {
      backgroundEl.style.background = backgroundData.gradient || backgroundData.heroBackground || '';
    } else if (backgroundData.image) {
      backgroundEl.style.backgroundImage = backgroundData.image;
      backgroundEl.style.backgroundSize = 'cover';
      backgroundEl.style.backgroundPosition = 'center';
      backgroundEl.style.backgroundRepeat = 'no-repeat';
    } else if (backgroundData.color) {
      backgroundEl.style.backgroundColor = backgroundData.color;
    } else if (backgroundData.bodyBackground) {
      backgroundEl.style.background = backgroundData.bodyBackground;
    } else {
      // Fondo por defecto si no se encuentra nada
      backgroundEl.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    // Background applied to editor
  };

  // Función de fallback para cuando falla la carga del video
  const applyFallbackBackground = () => {
    if (!backgroundRef.current) return;
    
    const backgroundEl = backgroundRef.current;
    
    if (backgroundData.gradient || backgroundData.heroBackground) {
      backgroundEl.style.background = backgroundData.gradient || backgroundData.heroBackground || '';
    } else {
      backgroundEl.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  // Efecto para capturar el fondo al montar el componente
  useEffect(() => {
    // Capturar inmediatamente
    capturePageBackground();
    
    // Capturar después de que se carguen las imágenes
    const timer = setTimeout(() => {
      capturePageBackground();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para aplicar el fondo cuando cambian los datos
  useEffect(() => {
    applyBackgroundToEditor();
  }, [backgroundData]);

  // Efecto para observar cambios en el fondo de la página (optimizado)
  useEffect(() => {
    let updateTimeout: NodeJS.Timeout;
    let lastCaptureTime = 0;
    const MIN_CAPTURE_INTERVAL = 2000; // Mínimo 2 segundos entre capturas
    
    const debouncedCapture = () => {
      const now = Date.now();
      if (now - lastCaptureTime < MIN_CAPTURE_INTERVAL) {
        return; // Evitar capturas muy frecuentes
      }
      
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        lastCaptureTime = Date.now();
        capturePageBackground();
      }, 1500); // Debounce aumentado a 1.5 segundos
    };
    
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        // Solo actualizar para cambios críticos en estilos de fondo
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'style' &&
            mutation.target instanceof HTMLElement) {
          const target = mutation.target;
          const style = target.style;
          if (style.background || style.backgroundColor || style.backgroundImage) {
            shouldUpdate = true;
          }
        }
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.tagName === 'VIDEO') {
                shouldUpdate = true;
              }
            }
          });
        }
      });
      
      if (shouldUpdate) {
        debouncedCapture();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true, // Observar cambios en elementos hijos para estilos de fondo
      attributes: true,
      attributeFilter: ['style']
    });

    return () => {
      observer.disconnect();
      clearTimeout(updateTimeout);
    };
  }, []);

  return (
    <>
      <div
        ref={backgroundRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -10,
          pointerEvents: 'none',
          overflow: 'hidden',
          borderRadius: 'inherit'
        }}
        className="background-renderer"
      >
        {/* El fondo se renderiza aquí dinámicamente */}
      </div>
      
      {/* Botón flotante para abrir el menú de colores */}
      <button
        onClick={handleShowColorMenu}
        className="fixed bottom-4 right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Cambiar color de fondo"
        style={{ pointerEvents: 'auto' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      </button>
      
      {/* Menú de colores */}
      <ColorMenu
        isOpen={isColorMenuOpen}
        onClose={() => setIsColorMenuOpen(false)}
        onColorSelect={handleColorChange}
        position={menuPosition}
      />
    </>
  );
};

export default BackgroundRenderer;