import React from 'react';
import { useNode, UserComponent } from '@craftjs/core';

// Define prop types for ImageComponent
interface ImageComponentProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  borderRadius?: string;
  border?: string;
  margin?: string;
  padding?: string;
  opacity?: number;
  filter?: string;
}

// ImageComponent implementation
export const ImageComponent: UserComponent<ImageComponentProps> = ({
  src = 'https://via.placeholder.com/300x200?text=Imagen',
  alt = 'Imagen',
  width = 'auto',
  height = 'auto',
  objectFit = 'cover',
  borderRadius = '0px',
  border = 'none',
  margin = '0',
  padding = '0',
  opacity = 1,
  filter = 'none'
}) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected
  }));

  const imageStyle: React.CSSProperties = {
    width,
    height,
    objectFit,
    borderRadius,
    border,
    margin,
    padding,
    opacity,
    filter,
    display: 'block',
    maxWidth: '100%',
    outline: selected ? '2px solid #2563eb' : 'none',
    outlineOffset: '2px'
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Error+al+cargar+imagen';
  };

  // Si no estamos en el contexto de Craft.js (página pública), renderizar directamente
  if (!connectors) {
    return (
      <img
        src={src}
        alt={alt}
        style={imageStyle}
        onError={handleImageError}
        draggable={false}
      />
    );
  }

  // Renderizado para el editor
  return (
    <img
      ref={(ref: HTMLImageElement | null) => ref && connectors.connect(connectors.drag(ref))}
      src={src}
      alt={alt}
      style={{
        ...imageStyle,
        cursor: 'pointer'
      }}
      onError={handleImageError}
      onClick={(e) => {
        e.stopPropagation();
      }}
      draggable={false}
    />
  );
};

// Settings for the ImageComponent
ImageComponent.craft = {
  displayName: 'Imagen',
  props: {
    src: 'https://via.placeholder.com/300x200?text=Imagen',
    alt: 'Imagen',
    width: 'auto',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: '0px',
    border: 'none',
    margin: '0',
    padding: '0',
    opacity: 1,
    filter: 'none'
  },
  related: {
    toolbar: () => {
      const { actions, src, alt, width, height, objectFit, borderRadius, border, margin, padding, opacity, filter } = useNode((node) => ({
        src: node.data.props.src,
        alt: node.data.props.alt,
        width: node.data.props.width,
        height: node.data.props.height,
        objectFit: node.data.props.objectFit,
        borderRadius: node.data.props.borderRadius,
        border: node.data.props.border,
        margin: node.data.props.margin,
        padding: node.data.props.padding,
        opacity: node.data.props.opacity,
        filter: node.data.props.filter
      }));
      
      const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/admin/assets/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          if (response.ok) {
            const result = await response.json();
            actions.setProp((props: ImageComponentProps) => {
              props.src = `http://localhost:3000${result.url}`;
            });
          } else {
            console.error('Error uploading file:', response.statusText);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      };
      
      return (
        <div className="p-4">
          <h3 className="font-semibold mb-2">Configuración de Imagen</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">URL de la imagen</label>
              <input 
                type="url" 
                value={src}
                onChange={(e) => actions.setProp((props: ImageComponentProps) => {
                  props.src = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subir imagen</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-2 border rounded" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Texto alternativo</label>
              <input 
                type="text" 
                value={alt}
                onChange={(e) => actions.setProp((props: ImageComponentProps) => {
                  props.alt = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="Descripción de la imagen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ancho</label>
              <input 
                type="text" 
                value={width}
                onChange={(e) => actions.setProp((props: ImageComponentProps) => {
                  props.width = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="auto, 100px, 50%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alto</label>
              <input 
                type="text" 
                value={height}
                onChange={(e) => actions.setProp((props: ImageComponentProps) => {
                  props.height = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="auto, 100px, 50%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ajuste de objeto</label>
              <select 
                value={objectFit}
                onChange={(e) => actions.setProp((props: ImageComponentProps) => {
                  props.objectFit = e.target.value as ImageComponentProps['objectFit'];
                })}
                className="w-full p-2 border rounded"
              >
                <option value="contain">Contener</option>
                <option value="cover">Cubrir</option>
                <option value="fill">Rellenar</option>
                <option value="none">Ninguno</option>
                <option value="scale-down">Escalar hacia abajo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Border radius</label>
              <input 
                type="text" 
                value={borderRadius}
                onChange={(e) => actions.setProp((props: ImageComponentProps) => {
                  props.borderRadius = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="0px, 8px, 50%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Opacidad</label>
              <input 
                type="range" 
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => actions.setProp((props: ImageComponentProps) => {
                  props.opacity = parseFloat(e.target.value);
                })}
                className="w-full" 
              />
              <span className="text-sm text-gray-500">{opacity}</span>
            </div>
          </div>
        </div>
      );
    }
  }
};

export default ImageComponent;