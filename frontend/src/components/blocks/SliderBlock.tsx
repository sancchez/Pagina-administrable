import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { ChevronLeft, ChevronRight, Plus, Trash2, Upload, Play, Pause } from 'lucide-react';

interface SlideItem {
  id: string;
  type: 'image' | 'video' | 'content';
  src?: string;
  title?: string;
  description?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
}

interface SliderBlockProps {
  title?: string;
  slides?: SlideItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
  showDots?: boolean;
  showArrows?: boolean;
  showTitles?: boolean;
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
  textColor?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  padding?: number;
}

const defaultSlides: SlideItem[] = [
  {
    id: '1',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
    title: 'Servicios de Calidad',
    description: 'Brindamos agua potable de la más alta calidad para toda la comunidad',
    buttonText: 'Conocer Más',
    buttonLink: '#servicios'
  },
  {
    id: '2',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=400&fit=crop',
    title: 'Infraestructura Moderna',
    description: 'Contamos con tecnología de punta para garantizar el suministro continuo',
    buttonText: 'Ver Proyectos',
    buttonLink: '#proyectos'
  },
  {
    id: '3',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
    title: 'Compromiso Ambiental',
    description: 'Trabajamos por la sostenibilidad y el cuidado del medio ambiente',
    buttonText: 'Nuestro Compromiso',
    buttonLink: '#ambiente'
  }
];

export const SliderBlock: React.FC<SliderBlockProps> = ({
  title = 'Nuestros Servicios',
  slides = defaultSlides,
  autoplay = true,
  autoplayDelay = 5000,
  showDots = true,
  showArrows = true,
  showTitles = true,
  height = 400,
  borderRadius = 12,
  backgroundColor = '#000000',
  textColor = '#ffffff',
  overlayColor = '#000000',
  overlayOpacity = 0.4,
  padding = 24
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoplayDelay);
      return () => clearInterval(interval);
    }
  }, [isPlaying, slides.length, autoplayDelay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleImageError = (slideId: string) => {
    setImageErrors(prev => new Set([...prev, slideId]));
  };

  const renderSlideContent = (slide: SlideItem) => {
    const hasError = imageErrors.has(slide.id);
    
    switch (slide.type) {
      case 'image':
        return (
          <div className="relative w-full h-full">
            {!hasError && slide.src ? (
              <img
                src={slide.src}
                alt={slide.title || 'Slide'}
                className="w-full h-full object-cover"
                onError={() => handleImageError(slide.id)}
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Upload size={48} className="mx-auto mb-2" />
                  <p>Imagen no disponible</p>
                </div>
              </div>
            )}
            
            {/* Overlay */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundColor: overlayColor,
                opacity: overlayOpacity
              }}
            />
            
            {/* Content */}
            {showTitles && (slide.title || slide.description || slide.buttonText) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-6 max-w-2xl">
                  {slide.title && (
                    <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: textColor }}>
                      {slide.title}
                    </h3>
                  )}
                  {slide.description && (
                    <p className="text-lg md:text-xl mb-6 opacity-90" style={{ color: textColor }}>
                      {slide.description}
                    </p>
                  )}
                  {slide.buttonText && (
                    <a
                      href={slide.buttonLink || '#'}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      {slide.buttonText}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'video':
        return (
          <div className="relative w-full h-full">
            {slide.src ? (
              <video
                src={slide.src}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Upload size={48} className="mx-auto mb-2" />
                  <p>Video no disponible</p>
                </div>
              </div>
            )}
            
            {showTitles && (slide.title || slide.description) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="text-center px-6 max-w-2xl">
                  {slide.title && (
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                      {slide.title}
                    </h3>
                  )}
                  {slide.description && (
                    <p className="text-lg md:text-xl text-white opacity-90">
                      {slide.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'content':
        return (
          <div 
            className="w-full h-full flex items-center justify-center p-8"
            style={{ backgroundColor, color: textColor }}
          >
            <div className="text-center max-w-2xl">
              {slide.title && (
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  {slide.title}
                </h3>
              )}
              {slide.content && (
                <div className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: slide.content }} />
              )}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Contenido no válido</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`relative ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`
      }}
    >
      {selected && (
        <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs z-20">
          Slider
        </div>
      )}
      
      {title && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
      )}
      
      <div className="relative overflow-hidden" style={{ height: `${height}px`, borderRadius: `${borderRadius}px` }}>
        {/* Slides */}
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="w-full h-full flex-shrink-0">
              {renderSlideContent(slide)}
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        {showArrows && slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all z-10"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
        
        {/* Play/Pause Button */}
        {selected && slides.length > 1 && (
          <button
            onClick={togglePlayPause}
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all z-10"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        )}
        
        {/* Dots Navigation */}
        {showDots && slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Add Slide Button (only when selected) */}
      {selected && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              const newSlide: SlideItem = {
                id: Date.now().toString(),
                type: 'image',
                title: 'Nueva Diapositiva',
                description: 'Descripción de la nueva diapositiva',
                buttonText: 'Acción',
                buttonLink: '#'
              };
              setProp((props: SliderBlockProps) => {
                props.slides = [...(props.slides || []), newSlide];
              });
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Agregar Diapositiva</span>
          </button>
        </div>
      )}
    </div>
  );
};

const SliderBlockSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  const [editingSlide, setEditingSlide] = useState<string | null>(null);

  const updateSlide = (slideId: string, updates: Partial<SlideItem>) => {
    setProp((props: SliderBlockProps) => {
      const slideIndex = props.slides?.findIndex(s => s.id === slideId);
      if (slideIndex !== undefined && slideIndex >= 0 && props.slides) {
        props.slides[slideIndex] = { ...props.slides[slideIndex], ...updates };
      }
    });
  };

  const removeSlide = (slideId: string) => {
    setProp((props: SliderBlockProps) => {
      props.slides = props.slides?.filter(s => s.id !== slideId) || [];
    });
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          value={props.title || ''}
          onChange={(e) => setProp((props: SliderBlockProps) => props.title = e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Altura</label>
          <input
            type="range"
            min="200"
            max="600"
            value={props.height || 400}
            onChange={(e) => setProp((props: SliderBlockProps) => props.height = parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-500">{props.height || 400}px</span>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Radio de Borde</label>
          <input
            type="range"
            min="0"
            max="24"
            value={props.borderRadius || 12}
            onChange={(e) => setProp((props: SliderBlockProps) => props.borderRadius = parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-500">{props.borderRadius || 12}px</span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Padding</label>
        <input
          type="range"
          min="0"
          max="48"
          value={props.padding || 24}
          onChange={(e) => setProp((props: SliderBlockProps) => props.padding = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{props.padding || 24}px</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Color de Fondo</label>
          <input
            type="color"
            value={props.backgroundColor || '#000000'}
            onChange={(e) => setProp((props: SliderBlockProps) => props.backgroundColor = e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Color de Texto</label>
          <input
            type="color"
            value={props.textColor || '#ffffff'}
            onChange={(e) => setProp((props: SliderBlockProps) => props.textColor = e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Color de Overlay</label>
          <input
            type="color"
            value={props.overlayColor || '#000000'}
            onChange={(e) => setProp((props: SliderBlockProps) => props.overlayColor = e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Opacidad del Overlay</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={props.overlayOpacity || 0.4}
            onChange={(e) => setProp((props: SliderBlockProps) => props.overlayOpacity = parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-500">{Math.round((props.overlayOpacity || 0.4) * 100)}%</span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Retraso del Autoplay (ms)</label>
        <input
          type="number"
          min="1000"
          max="10000"
          step="500"
          value={props.autoplayDelay || 5000}
          onChange={(e) => setProp((props: SliderBlockProps) => props.autoplayDelay = parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={props.autoplay || false}
            onChange={(e) => setProp((props: SliderBlockProps) => props.autoplay = e.target.checked)}
            className="mr-2"
          />
          Reproducción automática
        </label>
        
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={props.showDots || false}
            onChange={(e) => setProp((props: SliderBlockProps) => props.showDots = e.target.checked)}
            className="mr-2"
          />
          Mostrar puntos de navegación
        </label>
        
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={props.showArrows || false}
            onChange={(e) => setProp((props: SliderBlockProps) => props.showArrows = e.target.checked)}
            className="mr-2"
          />
          Mostrar flechas de navegación
        </label>
        
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={props.showTitles || false}
            onChange={(e) => setProp((props: SliderBlockProps) => props.showTitles = e.target.checked)}
            className="mr-2"
          />
          Mostrar títulos y descripciones
        </label>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Diapositivas</h4>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {props.slides?.map((slide: SlideItem, index: number) => (
            <div key={slide.id} className="border border-gray-200 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Diapositiva {index + 1}</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingSlide(editingSlide === slide.id ? null : slide.id)}
                    className="text-blue-500 hover:text-blue-700 text-xs"
                  >
                    {editingSlide === slide.id ? 'Cerrar' : 'Editar'}
                  </button>
                  <button
                    onClick={() => removeSlide(slide.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {editingSlide === slide.id && (
                <div className="space-y-2">
                  <select
                    value={slide.type}
                    onChange={(e) => updateSlide(slide.id, { type: e.target.value as any })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="image">Imagen</option>
                    <option value="video">Video</option>
                    <option value="content">Contenido</option>
                  </select>
                  
                  {(slide.type === 'image' || slide.type === 'video') && (
                    <input
                      type="url"
                      placeholder="URL de la imagen/video"
                      value={slide.src || ''}
                      onChange={(e) => updateSlide(slide.id, { src: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  )}
                  
                  <input
                    type="text"
                    placeholder="Título"
                    value={slide.title || ''}
                    onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  
                  {slide.type === 'content' ? (
                    <textarea
                      placeholder="Contenido HTML"
                      value={slide.content || ''}
                      onChange={(e) => updateSlide(slide.id, { content: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      rows={3}
                    />
                  ) : (
                    <textarea
                      placeholder="Descripción"
                      value={slide.description || ''}
                      onChange={(e) => updateSlide(slide.id, { description: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      rows={2}
                    />
                  )}
                  
                  {slide.type !== 'content' && (
                    <>
                      <input
                        type="text"
                        placeholder="Texto del botón"
                        value={slide.buttonText || ''}
                        onChange={(e) => updateSlide(slide.id, { buttonText: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Enlace del botón"
                        value={slide.buttonLink || ''}
                        onChange={(e) => updateSlide(slide.id, { buttonLink: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </>
                  )}
                </div>
              )}
              
              {!editingSlide && (
                <div className="text-xs text-gray-500">
                  <div>Tipo: {slide.type}</div>
                  {slide.title && <div>Título: {slide.title}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

SliderBlock.craft = {
  props: {
    title: 'Nuestros Servicios',
    slides: defaultSlides,
    autoplay: true,
    autoplayDelay: 5000,
    showDots: true,
    showArrows: true,
    showTitles: true,
    height: 400,
    borderRadius: 12,
    backgroundColor: '#000000',
    textColor: '#ffffff',
    overlayColor: '#000000',
    overlayOpacity: 0.4,
    padding: 24
  },
  related: {
    settings: SliderBlockSettings
  }
};

export { SliderBlockSettings };