import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Settings, Trash2, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

interface GalleryBlockProps {
  title?: string;
  images?: GalleryImage[];
  layout?: 'grid' | 'masonry' | 'carousel' | 'slider';
  columns?: number;
  gap?: number;
  borderRadius?: number;
  showCaptions?: boolean;
  backgroundColor?: string;
  padding?: number;
}

const defaultImages: GalleryImage[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    alt: 'Paisaje montañoso',
    caption: 'Vista panorámica de las montañas'
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    alt: 'Bosque verde',
    caption: 'Sendero en el bosque'
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    alt: 'Lago sereno',
    caption: 'Reflexión en el agua'
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    alt: 'Cielo estrellado',
    caption: 'Noche despejada'
  }
];

export const GalleryBlock: React.FC<GalleryBlockProps> = ({
  title = 'Galería de Imágenes',
  images = defaultImages,
  layout = 'grid',
  columns = 3,
  gap = 16,
  borderRadius = 8,
  showCaptions = true,
  backgroundColor = '#ffffff',
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderGridLayout = () => (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <div key={image.id} className="relative group cursor-pointer">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
            style={{ borderRadius: `${borderRadius}px` }}
            onClick={() => openLightbox(index)}
          />
          {showCaptions && image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm"
                 style={{ borderRadius: `0 0 ${borderRadius}px ${borderRadius}px` }}>
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderMasonryLayout = () => (
    <div
      className="columns-1 md:columns-2 lg:columns-3 xl:columns-4"
      style={{ gap: `${gap}px` }}
    >
      {images.map((image, index) => (
        <div key={image.id} className="break-inside-avoid mb-4 relative group cursor-pointer">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full object-cover transition-transform group-hover:scale-105"
            style={{ borderRadius: `${borderRadius}px` }}
            onClick={() => openLightbox(index)}
          />
          {showCaptions && image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm"
                 style={{ borderRadius: `0 0 ${borderRadius}px ${borderRadius}px` }}>
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderCarouselLayout = () => (
    <div className="relative">
      <div className="overflow-hidden" style={{ borderRadius: `${borderRadius}px` }}>
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={image.id} className="w-full flex-shrink-0 relative">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover cursor-pointer"
                onClick={() => openLightbox(index)}
              />
              {showCaptions && image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
      >
        <ChevronLeft size={20} />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
      >
        <ChevronRight size={20} />
      </button>
      
      <div className="flex justify-center mt-4 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );

  const renderSliderLayout = () => (
    <div className="flex overflow-x-auto space-x-4 pb-4" style={{ gap: `${gap}px` }}>
      {images.map((image, index) => (
        <div key={image.id} className="flex-shrink-0 relative group cursor-pointer">
          <img
            src={image.src}
            alt={image.alt}
            className="w-64 h-48 object-cover transition-transform group-hover:scale-105"
            style={{ borderRadius: `${borderRadius}px` }}
            onClick={() => openLightbox(index)}
          />
          {showCaptions && image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm"
                 style={{ borderRadius: `0 0 ${borderRadius}px ${borderRadius}px` }}>
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'masonry':
        return renderMasonryLayout();
      case 'carousel':
        return renderCarouselLayout();
      case 'slider':
        return renderSliderLayout();
      default:
        return renderGridLayout();
    }
  };

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`relative ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundColor,
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`
      }}
    >
      {selected && (
        <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          Galería
        </div>
      )}
      
      {title && (
        <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
      )}
      
      {renderLayout()}
      
      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
            
            <img
              src={images[lightboxIndex]?.src}
              alt={images[lightboxIndex]?.alt}
              className="max-w-full max-h-full object-contain"
            />
            
            {showCaptions && images[lightboxIndex]?.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 text-center">
                {images[lightboxIndex].caption}
              </div>
            )}
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevLightbox}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <ChevronLeft size={32} />
                </button>
                
                <button
                  onClick={nextLightbox}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const GalleryBlockSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  const [newImage, setNewImage] = useState({ src: '', alt: '', caption: '' });

  const addImage = () => {
    if (newImage.src && newImage.alt) {
      const image: GalleryImage = {
        id: Date.now().toString(),
        src: newImage.src,
        alt: newImage.alt,
        caption: newImage.caption
      };
      
      setProp((props: GalleryBlockProps) => {
        props.images = [...(props.images || []), image];
      });
      
      setNewImage({ src: '', alt: '', caption: '' });
    }
  };

  const removeImage = (imageId: string) => {
    setProp((props: GalleryBlockProps) => {
      props.images = props.images?.filter(img => img.id !== imageId) || [];
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          value={props.title || ''}
          onChange={(e) => setProp((props: GalleryBlockProps) => props.title = e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Layout</label>
        <select
          value={props.layout || 'grid'}
          onChange={(e) => setProp((props: GalleryBlockProps) => props.layout = e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="grid">Cuadrícula</option>
          <option value="masonry">Mosaico</option>
          <option value="carousel">Carrusel</option>
          <option value="slider">Deslizador</option>
        </select>
      </div>
      
      {props.layout === 'grid' && (
        <div>
          <label className="block text-sm font-medium mb-1">Columnas</label>
          <input
            type="range"
            min="1"
            max="6"
            value={props.columns || 3}
            onChange={(e) => setProp((props: GalleryBlockProps) => props.columns = parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-500">{props.columns || 3} columnas</span>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Espaciado</label>
        <input
          type="range"
          min="0"
          max="32"
          value={props.gap || 16}
          onChange={(e) => setProp((props: GalleryBlockProps) => props.gap = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{props.gap || 16}px</span>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Radio de Borde</label>
        <input
          type="range"
          min="0"
          max="20"
          value={props.borderRadius || 8}
          onChange={(e) => setProp((props: GalleryBlockProps) => props.borderRadius = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{props.borderRadius || 8}px</span>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Color de Fondo</label>
        <input
          type="color"
          value={props.backgroundColor || '#ffffff'}
          onChange={(e) => setProp((props: GalleryBlockProps) => props.backgroundColor = e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Padding</label>
        <input
          type="range"
          min="8"
          max="48"
          value={props.padding || 24}
          onChange={(e) => setProp((props: GalleryBlockProps) => props.padding = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{props.padding || 24}px</span>
      </div>
      
      <div>
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={props.showCaptions || false}
            onChange={(e) => setProp((props: GalleryBlockProps) => props.showCaptions = e.target.checked)}
            className="mr-2"
          />
          Mostrar descripciones
        </label>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Imágenes</h4>
        
        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
          {props.images?.map((image: GalleryImage) => (
            <div key={image.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex items-center space-x-2">
                <img src={image.src} alt={image.alt} className="w-8 h-8 object-cover rounded" />
                <span className="text-sm truncate">{image.alt}</span>
              </div>
              <button
                onClick={() => removeImage(image.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 p-3 border border-gray-200 rounded">
          <h5 className="text-sm font-medium">Agregar Imagen</h5>
          
          <input
            type="url"
            placeholder="URL de la imagen"
            value={newImage.src}
            onChange={(e) => setNewImage(prev => ({ ...prev, src: e.target.value }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
          
          <input
            type="text"
            placeholder="Texto alternativo"
            value={newImage.alt}
            onChange={(e) => setNewImage(prev => ({ ...prev, alt: e.target.value }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
          
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={newImage.caption}
            onChange={(e) => setNewImage(prev => ({ ...prev, caption: e.target.value }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
          
          <button
            onClick={addImage}
            className="w-full bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600"
          >
            <Plus size={16} className="inline mr-1" />
            Agregar Imagen
          </button>
        </div>
      </div>
    </div>
  );
};

GalleryBlock.craft = {
  props: {
    title: 'Galería de Imágenes',
    images: defaultImages,
    layout: 'grid',
    columns: 3,
    gap: 16,
    borderRadius: 8,
    showCaptions: true,
    backgroundColor: '#ffffff',
    padding: 24
  },
  related: {
    settings: GalleryBlockSettings
  }
};

export { GalleryBlockSettings };