import React, { useState, useRef, useEffect } from 'react';
import { Image, Video, Music, FileText, Upload, Link, Settings, Trash2, RotateCw, Move, Crop } from 'lucide-react';

interface MediaEditorProps {
  element: HTMLElement;
  position: { x: number; y: number };
  onClose: () => void;
}

interface MediaStyle {
  width: number;
  height: number;
  borderRadius: number;
  shadow: boolean;
  border: {
    enabled: boolean;
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  filter: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    sepia: number;
  };
  transform: {
    rotate: number;
    scaleX: number;
    scaleY: number;
  };
  opacity: number;
  objectFit: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
}

interface MediaData {
  type: 'image' | 'video' | 'audio' | 'iframe';
  src: string;
  alt: string;
  title: string;
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  muted: boolean;
}

export default function MediaEditor({ element, position, onClose }: MediaEditorProps) {
  const [mediaData, setMediaData] = useState<MediaData>({
    type: 'image',
    src: '',
    alt: 'Imagen descriptiva',
    title: '',
    autoplay: false,
    controls: true,
    loop: false,
    muted: false
  });

  const [mediaStyle, setMediaStyle] = useState<MediaStyle>({
    width: 300,
    height: 200,
    borderRadius: 8,
    shadow: true,
    border: {
      enabled: false,
      width: 2,
      color: '#e5e7eb',
      style: 'solid'
    },
    filter: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0
    },
    transform: {
      rotate: 0,
      scaleX: 1,
      scaleY: 1
    },
    opacity: 100,
    objectFit: 'cover'
  });

  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'effects'>('content');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Cargar media existente si se proporciona
  useEffect(() => {
    if (element) {
      const tagName = element.tagName.toLowerCase();
      const src = element.getAttribute('src') || '';
      const alt = element.getAttribute('alt') || '';
      const title = element.getAttribute('title') || '';
      
      setMediaData(prev => ({
        ...prev,
        type: tagName as any,
        src,
        alt,
        title
      }));

      const computedStyle = window.getComputedStyle(element);
      setMediaStyle(prev => ({
        ...prev,
        width: parseInt(computedStyle.width) || 300,
        height: parseInt(computedStyle.height) || 200,
        borderRadius: parseInt(computedStyle.borderRadius) || 8
      }));
    }
  }, [element]);

  // Manejar subida de archivos
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setMediaData(prev => ({ ...prev, src: result }));
    };
    reader.readAsDataURL(file);

    // Determinar tipo de media basado en el archivo
    if (file.type.startsWith('image/')) {
      setMediaData(prev => ({ ...prev, type: 'image' }));
    } else if (file.type.startsWith('video/')) {
      setMediaData(prev => ({ ...prev, type: 'video' }));
    } else if (file.type.startsWith('audio/')) {
      setMediaData(prev => ({ ...prev, type: 'audio' }));
    }
  };

  // Manejar drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Generar CSS del media
  const generateMediaCSS = () => {
    const filterValues = [
      `brightness(${mediaStyle.filter.brightness}%)`,
      `contrast(${mediaStyle.filter.contrast}%)`,
      `saturate(${mediaStyle.filter.saturation}%)`,
      `blur(${mediaStyle.filter.blur}px)`,
      `sepia(${mediaStyle.filter.sepia}%)`
    ].join(' ');

    const transformValues = [
      `rotate(${mediaStyle.transform.rotate}deg)`,
      `scaleX(${mediaStyle.transform.scaleX})`,
      `scaleY(${mediaStyle.transform.scaleY})`
    ].join(' ');

    const styles = {
      width: `${mediaStyle.width}px`,
      height: `${mediaStyle.height}px`,
      borderRadius: `${mediaStyle.borderRadius}px`,
      boxShadow: mediaStyle.shadow ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
      border: mediaStyle.border.enabled 
        ? `${mediaStyle.border.width}px ${mediaStyle.border.style} ${mediaStyle.border.color}`
        : 'none',
      filter: filterValues,
      transform: transformValues,
      opacity: mediaStyle.opacity / 100,
      objectFit: mediaStyle.objectFit
    };

    return Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  };

  // Generar HTML del media
  const generateMediaHTML = () => {
    const cssStyle = generateMediaCSS();
    const commonAttrs = `style="${cssStyle}" data-movable="true" data-resizable="true"`;

    switch (mediaData.type) {
      case 'image':
        return `<img src="${mediaData.src}" alt="${mediaData.alt}" title="${mediaData.title}" ${commonAttrs} />`;
      
      case 'video':
        const videoAttrs = [
          mediaData.controls ? 'controls' : '',
          mediaData.autoplay ? 'autoplay' : '',
          mediaData.loop ? 'loop' : '',
          mediaData.muted ? 'muted' : ''
        ].filter(Boolean).join(' ');
        return `<video src="${mediaData.src}" title="${mediaData.title}" ${videoAttrs} ${commonAttrs}></video>`;
      
      case 'audio':
        const audioAttrs = [
          mediaData.controls ? 'controls' : '',
          mediaData.autoplay ? 'autoplay' : '',
          mediaData.loop ? 'loop' : '',
          mediaData.muted ? 'muted' : ''
        ].filter(Boolean).join(' ');
        return `<audio src="${mediaData.src}" title="${mediaData.title}" ${audioAttrs} ${commonAttrs}></audio>`;
      
      case 'iframe':
        return `<iframe src="${mediaData.src}" title="${mediaData.title}" ${commonAttrs} frameborder="0" allowfullscreen></iframe>`;
      
      default:
        return '';
    }
  };

  // Aplicar filtros predefinidos
  const applyFilter = (filterName: string) => {
    const filters = {
      normal: { brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0 },
      vintage: { brightness: 110, contrast: 120, saturation: 80, blur: 0, sepia: 30 },
      blackwhite: { brightness: 100, contrast: 120, saturation: 0, blur: 0, sepia: 0 },
      bright: { brightness: 130, contrast: 110, saturation: 110, blur: 0, sepia: 0 },
      dark: { brightness: 70, contrast: 130, saturation: 90, blur: 0, sepia: 0 },
      blur: { brightness: 100, contrast: 100, saturation: 100, blur: 3, sepia: 0 }
    };

    const filter = filters[filterName as keyof typeof filters];
    if (filter) {
      setMediaStyle(prev => ({ ...prev, filter }));
    }
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={editorRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-96 overflow-y-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-semibold text-gray-800">Editor de Media</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg font-bold"
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            activeTab === 'content'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload size={14} className="inline mr-1" /> Contenido
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            activeTab === 'style'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={14} className="inline mr-1" /> Estilo
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            activeTab === 'effects'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Crop size={14} className="inline mr-1" /> Efectos
        </button>
      </div>

      {/* Vista previa */}
      {mediaData.src && (
        <div className="p-3 border-b bg-gray-50 text-center">
          <div className="mb-2 text-xs text-gray-600">Vista previa:</div>
          <div className="inline-block">
            {mediaData.type === 'image' && (
              <img
                src={mediaData.src}
                alt={mediaData.alt}
                style={{
                  width: Math.min(mediaStyle.width, 150),
                  height: Math.min(mediaStyle.height, 100),
                  borderRadius: `${mediaStyle.borderRadius}px`,
                  objectFit: mediaStyle.objectFit
                }}
              />
            )}
            {mediaData.type === 'video' && (
              <video
                src={mediaData.src}
                style={{
                  width: Math.min(mediaStyle.width, 150),
                  height: Math.min(mediaStyle.height, 100),
                  borderRadius: `${mediaStyle.borderRadius}px`,
                  objectFit: mediaStyle.objectFit
                }}
                controls={mediaData.controls}
                muted
              />
            )}
            {mediaData.type === 'audio' && (
              <audio
                src={mediaData.src}
                controls={mediaData.controls}
                style={{ width: '200px' }}
              />
            )}
          </div>
        </div>
      )}

      {/* Contenido de tabs */}
      {activeTab === 'content' && (
        <div className="p-3 space-y-3">
          {/* Tipo de media */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de media</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { type: 'image', icon: Image, label: 'Imagen' },
                { type: 'video', icon: Video, label: 'Video' },
                { type: 'audio', icon: Music, label: 'Audio' },
                { type: 'iframe', icon: FileText, label: 'Iframe' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setMediaData(prev => ({ ...prev, type: type as any }))}
                  className={`p-2 text-xs rounded border ${
                    mediaData.type === type
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} className="mx-auto mb-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Subir archivo o URL */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fuente</label>
            <div className="space-y-2">
              <input
                type="url"
                value={mediaData.src}
                onChange={(e) => setMediaData(prev => ({ ...prev, src: e.target.value }))}
                placeholder="URL del archivo o enlace"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
              
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} className="mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-600">Arrastra un archivo aquí o haz clic para seleccionar</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Metadatos */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Texto alternativo</label>
              <input
                type="text"
                value={mediaData.alt}
                onChange={(e) => setMediaData(prev => ({ ...prev, alt: e.target.value }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="Descripción para accesibilidad"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={mediaData.title}
                onChange={(e) => setMediaData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="Título del elemento"
              />
            </div>
          </div>

          {/* Opciones de video/audio */}
          {(mediaData.type === 'video' || mediaData.type === 'audio') && (
            <div className="space-y-2">
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={mediaData.controls}
                  onChange={(e) => setMediaData(prev => ({ ...prev, controls: e.target.checked }))}
                  className="mr-2"
                />
                Mostrar controles
              </label>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={mediaData.autoplay}
                  onChange={(e) => setMediaData(prev => ({ ...prev, autoplay: e.target.checked }))}
                  className="mr-2"
                />
                Reproducción automática
              </label>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={mediaData.loop}
                  onChange={(e) => setMediaData(prev => ({ ...prev, loop: e.target.checked }))}
                  className="mr-2"
                />
                Repetir en bucle
              </label>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={mediaData.muted}
                  onChange={(e) => setMediaData(prev => ({ ...prev, muted: e.target.checked }))}
                  className="mr-2"
                />
                Silenciado
              </label>
            </div>
          )}
        </div>
      )}

      {activeTab === 'style' && (
        <div className="p-3 space-y-3">
          {/* Dimensiones */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ancho (px)</label>
              <input
                type="number"
                value={mediaStyle.width}
                onChange={(e) => setMediaStyle(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                min="50"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Alto (px)</label>
              <input
                type="number"
                value={mediaStyle.height}
                onChange={(e) => setMediaStyle(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                min="50"
                max="1000"
              />
            </div>
          </div>

          {/* Ajuste de objeto */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ajuste de objeto</label>
            <select
              value={mediaStyle.objectFit}
              onChange={(e) => setMediaStyle(prev => ({ ...prev, objectFit: e.target.value as any }))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="cover">Cubrir</option>
              <option value="contain">Contener</option>
              <option value="fill">Rellenar</option>
              <option value="scale-down">Escalar hacia abajo</option>
              <option value="none">Ninguno</option>
            </select>
          </div>

          {/* Radio del borde */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Radio del borde: {mediaStyle.borderRadius}px</label>
            <input
              type="range"
              value={mediaStyle.borderRadius}
              onChange={(e) => setMediaStyle(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
              className="w-full"
              min="0"
              max="50"
            />
          </div>

          {/* Opacidad */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Opacidad: {mediaStyle.opacity}%</label>
            <input
              type="range"
              value={mediaStyle.opacity}
              onChange={(e) => setMediaStyle(prev => ({ ...prev, opacity: parseInt(e.target.value) }))}
              className="w-full"
              min="0"
              max="100"
            />
          </div>

          {/* Opciones adicionales */}
          <div className="space-y-2">
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={mediaStyle.shadow}
                onChange={(e) => setMediaStyle(prev => ({ ...prev, shadow: e.target.checked }))}
                className="mr-2"
              />
              Sombra
            </label>
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={mediaStyle.border.enabled}
                onChange={(e) => setMediaStyle(prev => ({ 
                  ...prev, 
                  border: { ...prev.border, enabled: e.target.checked }
                }))}
                className="mr-2"
              />
              Borde
            </label>
            {mediaStyle.border.enabled && (
              <div className="ml-4 space-y-1">
                <input
                  type="color"
                  value={mediaStyle.border.color}
                  onChange={(e) => setMediaStyle(prev => ({ 
                    ...prev, 
                    border: { ...prev.border, color: e.target.value }
                  }))}
                  className="w-full h-6 border border-gray-300 rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'effects' && (
        <div className="p-3 space-y-3">
          {/* Filtros predefinidos */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Filtros predefinidos</label>
            <div className="grid grid-cols-3 gap-1">
              {['normal', 'vintage', 'blackwhite', 'bright', 'dark', 'blur'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => applyFilter(filter)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 capitalize"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Controles de filtro */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Brillo: {mediaStyle.filter.brightness}%</label>
              <input
                type="range"
                value={mediaStyle.filter.brightness}
                onChange={(e) => setMediaStyle(prev => ({ 
                  ...prev, 
                  filter: { ...prev.filter, brightness: parseInt(e.target.value) }
                }))}
                className="w-full"
                min="0"
                max="200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contraste: {mediaStyle.filter.contrast}%</label>
              <input
                type="range"
                value={mediaStyle.filter.contrast}
                onChange={(e) => setMediaStyle(prev => ({ 
                  ...prev, 
                  filter: { ...prev.filter, contrast: parseInt(e.target.value) }
                }))}
                className="w-full"
                min="0"
                max="200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Saturación: {mediaStyle.filter.saturation}%</label>
              <input
                type="range"
                value={mediaStyle.filter.saturation}
                onChange={(e) => setMediaStyle(prev => ({ 
                  ...prev, 
                  filter: { ...prev.filter, saturation: parseInt(e.target.value) }
                }))}
                className="w-full"
                min="0"
                max="200"
              />
            </div>
          </div>

          {/* Transformaciones */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rotación: {mediaStyle.transform.rotate}°</label>
              <input
                type="range"
                value={mediaStyle.transform.rotate}
                onChange={(e) => setMediaStyle(prev => ({ 
                  ...prev, 
                  transform: { ...prev.transform, rotate: parseInt(e.target.value) }
                }))}
                className="w-full"
                min="-180"
                max="180"
              />
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2 p-3 border-t">
        <button
          onClick={() => {
            if (mediaData.src) {
              const mediaHTML = generateMediaHTML();
              // Apply changes to existing element or create new one
              if (element) {
                element.outerHTML = mediaHTML;
              }
              onClose();
            }
          }}
          disabled={!mediaData.src}
          className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Insertar Media
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}