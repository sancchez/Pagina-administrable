import React, { useState, useEffect, useRef } from 'react';
import { useNode } from '@craftjs/core';
import { MapPin, Navigation, Layers } from 'lucide-react';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  icon?: string;
}

interface MapBlockProps {
  title?: string;
  description?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number;
  markers?: MapMarker[];
  showControls?: boolean;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

const defaultCenter = { lat: -12.0464, lng: -77.0428 }; // Lima, Perú
const defaultMarkers: MapMarker[] = [
  {
    id: '1',
    lat: -12.0464,
    lng: -77.0428,
    title: 'Oficina Principal',
    description: 'Nuestra sede principal en Lima'
  }
];

export const MapBlock: React.FC<MapBlockProps> = ({
  title = 'Nuestra Ubicación',
  description = 'Encuéntranos en nuestra oficina principal',
  center = defaultCenter,
  zoom = 15,
  height = 400,
  markers = defaultMarkers,
  showControls = true,
  mapType = 'roadmap',
  backgroundColor = '#ffffff',
  padding = 24,
  borderRadius = 8
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // Simulación de mapa (en producción se usaría Google Maps, Leaflet, etc.)
  const MapSimulation = () => {
    return (
      <div 
        className="relative bg-gray-200 overflow-hidden"
        style={{ 
          height: `${height}px`,
          borderRadius: `${borderRadius}px`
        }}
      >
        {/* Fondo del mapa simulado */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
          {/* Líneas de cuadrícula para simular calles */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#666" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Elementos decorativos para simular un mapa */}
          <div className="absolute top-1/4 left-1/3 w-16 h-8 bg-blue-300 rounded opacity-60"></div>
          <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-green-300 rounded-full opacity-60"></div>
          <div className="absolute top-1/2 left-1/2 w-20 h-4 bg-gray-400 rounded opacity-40"></div>
        </div>
        
        {/* Marcadores */}
        {markers.map((marker, index) => (
          <div
            key={marker.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10"
            style={{
              left: `${50 + (index * 10)}%`,
              top: `${50 + (index * 5)}%`
            }}
            onClick={() => setSelectedMarker(marker)}
          >
            <div className="relative">
              <MapPin 
                size={32} 
                className="text-red-500 drop-shadow-lg hover:text-red-600 transition-colors" 
                fill="currentColor"
              />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full opacity-50"></div>
            </div>
          </div>
        ))}
        
        {/* Controles del mapa */}
        {showControls && (
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <button className="bg-white p-2 rounded shadow hover:bg-gray-50">
              <Navigation size={16} />
            </button>
            <button className="bg-white p-2 rounded shadow hover:bg-gray-50">
              <Layers size={16} />
            </button>
            <div className="flex flex-col bg-white rounded shadow">
              <button className="p-2 hover:bg-gray-50 text-lg font-bold">+</button>
              <button className="p-2 hover:bg-gray-50 text-lg font-bold">−</button>
            </div>
          </div>
        )}
        
        {/* Información del marcador seleccionado */}
        {selectedMarker && (
          <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
            <button 
              onClick={() => setSelectedMarker(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
            <h4 className="font-semibold text-sm mb-1">{selectedMarker.title}</h4>
            {selectedMarker.description && (
              <p className="text-xs text-gray-600">{selectedMarker.description}</p>
            )}
            <div className="mt-2 text-xs text-gray-500">
              {selectedMarker.lat.toFixed(4)}, {selectedMarker.lng.toFixed(4)}
            </div>
          </div>
        )}
        
        {/* Indicador de tipo de mapa */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {mapType === 'roadmap' && 'Mapa'}
          {mapType === 'satellite' && 'Satélite'}
          {mapType === 'hybrid' && 'Híbrido'}
          {mapType === 'terrain' && 'Terreno'}
        </div>
      </div>
    );
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
          Mapa
        </div>
      )}
      
      <div className="text-center mb-6">
        {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      
      <div ref={mapRef} className="relative">
        <MapSimulation />
      </div>
      
      {/* Información adicional */}
      {markers.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {markers.map((marker) => (
            <div key={marker.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin size={20} className="text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">{marker.title}</h4>
                {marker.description && (
                  <p className="text-xs text-gray-600 mt-1">{marker.description}</p>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MapBlockSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  const [newMarker, setNewMarker] = useState({
    lat: '',
    lng: '',
    title: '',
    description: ''
  });

  const addMarker = () => {
    if (newMarker.lat && newMarker.lng && newMarker.title) {
      const marker: MapMarker = {
        id: Date.now().toString(),
        lat: parseFloat(newMarker.lat),
        lng: parseFloat(newMarker.lng),
        title: newMarker.title,
        description: newMarker.description
      };
      
      setProp((props: MapBlockProps) => {
        props.markers = [...(props.markers || []), marker];
      });
      
      setNewMarker({ lat: '', lng: '', title: '', description: '' });
    }
  };

  const removeMarker = (markerId: string) => {
    setProp((props: MapBlockProps) => {
      props.markers = props.markers?.filter(m => m.id !== markerId) || [];
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          value={props.title || ''}
          onChange={(e) => setProp((props: MapBlockProps) => props.title = e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={props.description || ''}
          onChange={(e) => setProp((props: MapBlockProps) => props.description = e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Latitud Centro</label>
          <input
            type="number"
            step="0.0001"
            value={props.center?.lat || defaultCenter.lat}
            onChange={(e) => setProp((props: MapBlockProps) => {
              props.center = { ...props.center, lat: parseFloat(e.target.value) || defaultCenter.lat };
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Longitud Centro</label>
          <input
            type="number"
            step="0.0001"
            value={props.center?.lng || defaultCenter.lng}
            onChange={(e) => setProp((props: MapBlockProps) => {
              props.center = { ...props.center, lng: parseFloat(e.target.value) || defaultCenter.lng };
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Zoom</label>
        <input
          type="range"
          min="1"
          max="20"
          value={props.zoom || 15}
          onChange={(e) => setProp((props: MapBlockProps) => props.zoom = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">Nivel {props.zoom || 15}</span>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Altura</label>
        <input
          type="range"
          min="200"
          max="600"
          value={props.height || 400}
          onChange={(e) => setProp((props: MapBlockProps) => props.height = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{props.height || 400}px</span>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de Mapa</label>
        <select
          value={props.mapType || 'roadmap'}
          onChange={(e) => setProp((props: MapBlockProps) => props.mapType = e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="roadmap">Mapa de Carreteras</option>
          <option value="satellite">Satélite</option>
          <option value="hybrid">Híbrido</option>
          <option value="terrain">Terreno</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Color de Fondo</label>
        <input
          type="color"
          value={props.backgroundColor || '#ffffff'}
          onChange={(e) => setProp((props: MapBlockProps) => props.backgroundColor = e.target.value)}
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
          onChange={(e) => setProp((props: MapBlockProps) => props.padding = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{props.padding || 24}px</span>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Radio de Borde</label>
        <input
          type="range"
          min="0"
          max="20"
          value={props.borderRadius || 8}
          onChange={(e) => setProp((props: MapBlockProps) => props.borderRadius = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{props.borderRadius || 8}px</span>
      </div>
      
      <div>
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={props.showControls || false}
            onChange={(e) => setProp((props: MapBlockProps) => props.showControls = e.target.checked)}
            className="mr-2"
          />
          Mostrar controles del mapa
        </label>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Marcadores</h4>
        
        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
          {props.markers?.map((marker: MapMarker) => (
            <div key={marker.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div>
                <div className="font-medium text-sm">{marker.title}</div>
                <div className="text-xs text-gray-500">
                  {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                </div>
              </div>
              <button
                onClick={() => removeMarker(marker.id)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 p-3 border border-gray-200 rounded">
          <h5 className="text-sm font-medium">Agregar Marcador</h5>
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.0001"
              placeholder="Latitud"
              value={newMarker.lat}
              onChange={(e) => setNewMarker(prev => ({ ...prev, lat: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Longitud"
              value={newMarker.lng}
              onChange={(e) => setNewMarker(prev => ({ ...prev, lng: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          
          <input
            type="text"
            placeholder="Título del marcador"
            value={newMarker.title}
            onChange={(e) => setNewMarker(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
          
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={newMarker.description}
            onChange={(e) => setNewMarker(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
          
          <button
            onClick={addMarker}
            className="w-full bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600"
          >
            Agregar Marcador
          </button>
        </div>
      </div>
    </div>
  );
};

MapBlock.craft = {
  props: {
    title: 'Nuestra Ubicación',
    description: 'Encuéntranos en nuestra oficina principal',
    center: defaultCenter,
    zoom: 15,
    height: 400,
    markers: defaultMarkers,
    showControls: true,
    mapType: 'roadmap',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 8
  },
  related: {
    settings: MapBlockSettings
  }
};

export { MapBlockSettings };