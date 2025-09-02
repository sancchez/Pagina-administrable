import React, { useState, useRef, useEffect } from 'react';
import { Monitor, ChevronDown } from 'lucide-react';

interface SheetFormat {
  name: string;
  ratio: string;
  width: string;
  height: string;
  description: string;
}

const SHEET_FORMATS: SheetFormat[] = [
  {
    name: 'Libre',
    ratio: 'auto',
    width: '100%',
    height: 'auto',
    description: 'Formato libre (predeterminado)'
  },
  {
    name: '16:9',
    ratio: '16/9',
    width: '100%',
    height: '56.25vw', // 9/16 * 100vw
    description: 'Formato panorámico'
  },
  {
    name: '4:3',
    ratio: '4/3',
    width: '100%',
    height: '75vw', // 3/4 * 100vw
    description: 'Formato clásico'
  },
  {
    name: 'A4',
    ratio: '210/297',
    width: '100%',
    height: '141.4vw', // 297/210 * 100vw
    description: 'Formato de documento'
  },
  {
    name: '1:1',
    ratio: '1/1',
    width: '100%',
    height: '100vw',
    description: 'Formato cuadrado'
  }
];

interface SheetFormatSelectorProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onFormatChange?: (format: SheetFormat) => void;
}

const SheetFormatSelector: React.FC<SheetFormatSelectorProps> = ({
  containerRef,
  onFormatChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<SheetFormat>(SHEET_FORMATS[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFormatSelect = (format: SheetFormat) => {
    setSelectedFormat(format);
    setIsOpen(false);
    
    // Aplicar el formato al contenedor
    if (containerRef.current) {
      const previewPane = containerRef.current.querySelector('[data-preview-pane]') as HTMLElement;
      if (previewPane) {
        if (format.ratio === 'auto') {
          // Formato libre - remover restricciones
          previewPane.style.width = '';
          previewPane.style.height = '';
          previewPane.style.maxWidth = '';
          previewPane.style.aspectRatio = '';
          previewPane.style.overflow = '';
        } else {
          // Aplicar formato específico
          previewPane.style.width = '100%';
          previewPane.style.maxWidth = '1200px';
          previewPane.style.aspectRatio = format.ratio;
          previewPane.style.overflow = 'hidden';
          previewPane.style.margin = '0 auto';
        }
      }
    }
    
    // Notificar cambio
    onFormatChange?.(format);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40" ref={dropdownRef}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md transition-all duration-200 shadow-sm"
        title={`Formato actual: ${selectedFormat.name} (${selectedFormat.description})`}
      >
        <Monitor className="h-4 w-4" />
        <span className="hidden sm:inline">{selectedFormat.name}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] max-w-[250px]">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
            Formatos de Hoja
          </div>
          {SHEET_FORMATS.map((format) => (
            <button
              key={format.name}
              onClick={() => handleFormatSelect(format)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                selectedFormat.name === format.name
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{format.name}</div>
                  <div className="text-xs text-gray-500">{format.description}</div>
                </div>
                {selectedFormat.name === format.name && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SheetFormatSelector;