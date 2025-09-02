import React, { useState, useEffect, useRef } from 'react';
import { Ruler, Grid, Target, Crosshair, AlignCenter } from 'lucide-react';

interface PositioningGuideProps {
  containerRef: React.RefObject<HTMLElement>;
  activeElement: HTMLElement | null;
  enabled: boolean;
}

interface ElementInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  element: HTMLElement;
}

interface SnapLine {
  type: 'vertical' | 'horizontal';
  position: number;
  label: string;
  color: string;
}

const PositioningGuide: React.FC<PositioningGuideProps> = ({
  containerRef,
  activeElement,
  enabled
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [elementPosition, setElementPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [showDistances, setShowDistances] = useState(true);
  const [showSnapLines, setShowSnapLines] = useState(true);
  const [showAlignment, setShowAlignment] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [allElements, setAllElements] = useState<ElementInfo[]>([]);
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);
  const [nearbyElements, setNearbyElements] = useState<ElementInfo[]>([]);

  // Función para detectar todos los elementos movibles
  const detectAllElements = () => {
    if (!containerRef.current) return [];
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const elements: ElementInfo[] = [];
    
    // Buscar elementos con data-movable o data-resizable
    const movableElements = container.querySelectorAll('[data-movable="true"], [data-resizable="true"]');
    
    movableElements.forEach((element) => {
      if (element === activeElement) return; // Excluir el elemento activo
      
      const rect = element.getBoundingClientRect();
      elements.push({
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
        element: element as HTMLElement
      });
    });
    
    return elements;
  };

  // Función para calcular líneas de snap y alineación mejorada
  const calculateSnapLines = (currentElement: ElementInfo, otherElements: ElementInfo[]) => {
    const lines: SnapLine[] = [];
    const snapDistance = 8; // Distancia más precisa para activar snap
    
    // Líneas de referencia del contenedor más específicas
    const containerHalf = containerDimensions.width / 2;
    const containerQuarterH = containerDimensions.width / 4;
    const containerThreeQuartersH = (containerDimensions.width * 3) / 4;
    const containerThirdH = containerDimensions.width / 3;
    const containerTwoThirdsH = (containerDimensions.width * 2) / 3;
    
    const containerHalfV = containerDimensions.height / 2;
    const containerQuarterV = containerDimensions.height / 4;
    const containerThreeQuartersV = (containerDimensions.height * 3) / 4;
    const containerThirdV = containerDimensions.height / 3;
    const containerTwoThirdsV = (containerDimensions.height * 2) / 3;
    
    // Márgenes estándar para diseño profesional
    const margin20 = containerDimensions.width * 0.05; // 5% margin
    const margin40 = containerDimensions.width * 0.1;  // 10% margin
    const margin60 = containerDimensions.width * 0.15; // 15% margin
    
    // Líneas de referencia principales del contenedor
    lines.push(
      // Centro absoluto - más prominente
      { type: 'vertical', position: containerHalf, label: 'Centro Absoluto', color: '#ef4444' },
      { type: 'horizontal', position: containerHalfV, label: 'Centro Vertical', color: '#ef4444' },
      
      // Cuartos - para layouts balanceados
      { type: 'vertical', position: containerQuarterH, label: '1/4 (25%)', color: '#10b981' },
      { type: 'vertical', position: containerThreeQuartersH, label: '3/4 (75%)', color: '#10b981' },
      { type: 'horizontal', position: containerQuarterV, label: '1/4 Vertical', color: '#10b981' },
      { type: 'horizontal', position: containerThreeQuartersV, label: '3/4 Vertical', color: '#10b981' },
      
      // Tercios - regla de los tercios
      { type: 'vertical', position: containerThirdH, label: '1/3 (33%)', color: '#3b82f6' },
      { type: 'vertical', position: containerTwoThirdsH, label: '2/3 (67%)', color: '#3b82f6' },
      { type: 'horizontal', position: containerThirdV, label: '1/3 Vertical', color: '#3b82f6' },
      { type: 'horizontal', position: containerTwoThirdsV, label: '2/3 Vertical', color: '#3b82f6' },
      
      // Márgenes profesionales
      { type: 'vertical', position: margin20, label: 'Margen 5%', color: '#8b5cf6' },
      { type: 'vertical', position: containerDimensions.width - margin20, label: 'Margen 5%', color: '#8b5cf6' },
      { type: 'vertical', position: margin40, label: 'Margen 10%', color: '#f59e0b' },
      { type: 'vertical', position: containerDimensions.width - margin40, label: 'Margen 10%', color: '#f59e0b' },
      
      // Bordes del contenedor
      { type: 'vertical', position: 0, label: 'Borde Izquierdo', color: '#6b7280' },
      { type: 'vertical', position: containerDimensions.width, label: 'Borde Derecho', color: '#6b7280' },
      { type: 'horizontal', position: 0, label: 'Borde Superior', color: '#6b7280' },
      { type: 'horizontal', position: containerDimensions.height, label: 'Borde Inferior', color: '#6b7280' }
    );
    
    // Líneas de alineación con otros elementos (más precisas)
    otherElements.forEach((element, index) => {
      const elementCenterX = element.x + element.width / 2;
      const elementCenterY = element.y + element.height / 2;
      const currentCenterX = currentElement.x + currentElement.width / 2;
      const currentCenterY = currentElement.y + currentElement.height / 2;
      
      // Obtener información del tipo de elemento para etiquetas más específicas
      const elementType = element.element.tagName.toLowerCase();
      const elementClass = element.element.className;
      const isTitle = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(elementType);
      const isText = ['p', 'span', 'div'].includes(elementType);
      
      const elementLabel = isTitle ? `Título ${elementType.toUpperCase()}` : 
                          isText ? 'Texto' : 
                          elementType === 'img' ? 'Imagen' : 
                          `Elemento ${index + 1}`;
      
      // Alineación horizontal (misma Y) - más específica
      if (Math.abs(element.y - currentElement.y) < snapDistance) {
        lines.push({ 
          type: 'horizontal', 
          position: element.y, 
          label: `Alinear borde superior con ${elementLabel}`, 
          color: '#f59e0b' 
        });
      }
      if (Math.abs((element.y + element.height) - (currentElement.y + currentElement.height)) < snapDistance) {
        lines.push({ 
          type: 'horizontal', 
          position: element.y + element.height, 
          label: `Alinear borde inferior con ${elementLabel}`, 
          color: '#f59e0b' 
        });
      }
      if (Math.abs(elementCenterY - currentCenterY) < snapDistance) {
        lines.push({ 
          type: 'horizontal', 
          position: elementCenterY, 
          label: `Centrar verticalmente con ${elementLabel}`, 
          color: '#ef4444' 
        });
      }
      
      // Alineación vertical (misma X) - más específica
      if (Math.abs(element.x - currentElement.x) < snapDistance) {
        lines.push({ 
          type: 'vertical', 
          position: element.x, 
          label: `Alinear borde izquierdo con ${elementLabel}`, 
          color: '#f59e0b' 
        });
      }
      if (Math.abs((element.x + element.width) - (currentElement.x + currentElement.width)) < snapDistance) {
        lines.push({ 
          type: 'vertical', 
          position: element.x + element.width, 
          label: `Alinear borde derecho con ${elementLabel}`, 
          color: '#f59e0b' 
        });
      }
      if (Math.abs(elementCenterX - currentCenterX) < snapDistance) {
        lines.push({ 
          type: 'vertical', 
          position: elementCenterX, 
          label: `Centrar horizontalmente con ${elementLabel}`, 
          color: '#ef4444' 
        });
      }
      
      // Espaciado uniforme - detectar distancias iguales
      const distanceX = Math.abs(elementCenterX - currentCenterX);
      const distanceY = Math.abs(elementCenterY - currentCenterY);
      
      // Buscar otros elementos para crear espaciado uniforme
      otherElements.forEach((otherElement, otherIndex) => {
        if (otherIndex <= index) return; // Evitar duplicados
        
        const otherCenterX = otherElement.x + otherElement.width / 2;
        const otherCenterY = otherElement.y + otherElement.height / 2;
        
        const otherDistanceX = Math.abs(otherCenterX - currentCenterX);
        const otherDistanceY = Math.abs(otherCenterY - currentCenterY);
        
        // Si las distancias son similares, mostrar línea de espaciado uniforme
        if (Math.abs(distanceX - otherDistanceX) < 20 && distanceX > 50) {
          const midX = (elementCenterX + otherCenterX) / 2;
          lines.push({ 
            type: 'vertical', 
            position: midX, 
            label: `Espaciado uniforme (${Math.round(distanceX)}px)`, 
            color: '#8b5cf6' 
          });
        }
        
        if (Math.abs(distanceY - otherDistanceY) < 20 && distanceY > 50) {
          const midY = (elementCenterY + otherCenterY) / 2;
          lines.push({ 
            type: 'horizontal', 
            position: midY, 
            label: `Espaciado uniforme vertical (${Math.round(distanceY)}px)`, 
            color: '#8b5cf6' 
          });
        }
      });
      
      // Líneas de distancia específicas para títulos
      if (isTitle) {
        // Sugerir posiciones óptimas para títulos
        const titleOptimalY = containerDimensions.height * 0.2; // 20% desde arriba
        if (Math.abs(currentCenterY - titleOptimalY) < 30) {
          lines.push({ 
            type: 'horizontal', 
            position: titleOptimalY, 
            label: 'Posición óptima para título principal', 
            color: '#10b981' 
          });
        }
      }
    });
    
    return lines;
  };

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    setContainerDimensions({ width: rect.width, height: rect.height });

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = container.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [enabled, containerRef]);

  useEffect(() => {
    if (!activeElement || !containerRef.current) {
      setElementPosition({ x: 0, y: 0, width: 0, height: 0 });
      setSnapLines([]);
      setNearbyElements([]);
      return;
    }

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const elementRect = activeElement.getBoundingClientRect();

    const currentElementInfo = {
      x: elementRect.left - containerRect.left,
      y: elementRect.top - containerRect.top,
      width: elementRect.width,
      height: elementRect.height
    };

    setElementPosition(currentElementInfo);
    
    // Detectar todos los elementos
    const elements = detectAllElements();
    setAllElements(elements);
    
    // Calcular líneas de snap si están habilitadas
    if (showSnapLines || showAlignment) {
      const lines = calculateSnapLines({
        ...currentElementInfo,
        element: activeElement
      }, elements);
      setSnapLines(lines);
    }
    
    // Encontrar elementos cercanos para mostrar distancias
    const nearby = elements.filter(el => {
      const distance = Math.sqrt(
        Math.pow(el.x - currentElementInfo.x, 2) + 
        Math.pow(el.y - currentElementInfo.y, 2)
      );
      return distance < 200; // Elementos dentro de 200px
    });
    setNearbyElements(nearby);
  }, [activeElement, containerRef, showSnapLines, showAlignment]);

  // Actualizar elementos cuando cambie el contenedor
  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    
    const updateElements = () => {
      const elements = detectAllElements();
      setAllElements(elements);
    };
    
    // Observar cambios en el DOM
    const observer = new MutationObserver(updateElements);
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-movable', 'data-resizable', 'style']
    });
    
    return () => observer.disconnect();
  }, [enabled, containerRef]);

  if (!enabled) return null;

  const gridSize = 20;
  const rulerHeight = 30;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Controles de guías - más discretos y solo visible cuando hay elemento activo */}
      {activeElement && (
        <div className="absolute top-2 right-2 flex gap-1 pointer-events-auto z-60 bg-white/80 backdrop-blur-sm rounded-md p-1 shadow-sm border border-gray-100 opacity-60 hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded text-xs font-medium transition-all duration-200 ${
              showGrid
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-500'
            }`}
            title="Cuadrícula"
          >
            <Grid className="h-3 w-3" />
          </button>
          <button
            onClick={() => setShowRulers(!showRulers)}
            className={`p-1 rounded text-xs font-medium transition-all duration-200 ${
              showRulers
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-orange-500'
            }`}
            title="Reglas"
          >
            <Ruler className="h-3 w-3" />
          </button>
          <button
            onClick={() => setShowDistances(!showDistances)}
            className={`p-1 rounded text-xs font-medium transition-all duration-200 ${
              showDistances
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500'
            }`}
            title="Distancias"
          >
            <Target className="h-3 w-3" />
          </button>
          <button
            onClick={() => setShowSnapLines(!showSnapLines)}
            className={`p-1 rounded text-xs font-medium transition-all duration-200 ${
              showSnapLines
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-green-50 hover:text-green-500'
            }`}
            title="Líneas de snap"
          >
            <Crosshair className="h-3 w-3" />
          </button>
          <button
            onClick={() => setShowAlignment(!showAlignment)}
            className={`p-1 rounded text-xs font-medium transition-all duration-200 ${
              showAlignment
                ? 'bg-purple-500 text-white shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-purple-50 hover:text-purple-500'
            }`}
            title="Alineación"
          >
            <AlignCenter className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Cuadrícula - más sutil */}
      {showGrid && activeElement && (
        <svg
          className="absolute inset-0 w-full h-full opacity-30"
          style={{ top: showRulers ? rulerHeight : 0, left: showRulers ? rulerHeight : 0 }}
        >
          <defs>
            <pattern
              id="grid"
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                fill="none"
                stroke="#d1d5db"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      )}

      {/* Reglas horizontales y verticales */}
      {showRulers && activeElement && (
        <>
          {/* Regla horizontal */}
          <div
            className="absolute top-0 left-0 bg-gray-100 border-b border-gray-300"
            style={{ width: '100%', height: rulerHeight }}
          >
            <svg width="100%" height={rulerHeight}>
              {Array.from({ length: Math.ceil(containerDimensions.width / 10) }, (_, i) => {
                const x = i * 10;
                const isMainTick = x % 50 === 0;
                return (
                  <g key={i}>
                    <line
                      x1={x + rulerHeight}
                      y1={isMainTick ? 0 : rulerHeight * 0.6}
                      x2={x + rulerHeight}
                      y2={rulerHeight}
                      stroke="#6b7280"
                      strokeWidth={isMainTick ? 1 : 0.5}
                    />
                    {isMainTick && x > 0 && (
                      <text
                        x={x + rulerHeight + 2}
                        y={rulerHeight * 0.4}
                        fontSize="10"
                        fill="#6b7280"
                        fontFamily="monospace"
                      >
                        {x}
                      </text>
                    )}
                  </g>
                );
              })}
              {/* Indicador de posición del mouse */}
              <line
                x1={mousePosition.x + rulerHeight}
                y1={0}
                x2={mousePosition.x + rulerHeight}
                y2={rulerHeight}
                stroke="#ef4444"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Regla vertical */}
          <div
            className="absolute top-0 left-0 bg-gray-100 border-r border-gray-300"
            style={{ width: rulerHeight, height: '100%' }}
          >
            <svg width={rulerHeight} height="100%">
              {Array.from({ length: Math.ceil(containerDimensions.height / 10) }, (_, i) => {
                const y = i * 10;
                const isMainTick = y % 50 === 0;
                return (
                  <g key={i}>
                    <line
                      x1={isMainTick ? 0 : rulerHeight * 0.6}
                      y1={y + rulerHeight}
                      x2={rulerHeight}
                      y2={y + rulerHeight}
                      stroke="#6b7280"
                      strokeWidth={isMainTick ? 1 : 0.5}
                    />
                    {isMainTick && y > 0 && (
                      <text
                        x={rulerHeight * 0.1}
                        y={y + rulerHeight - 2}
                        fontSize="10"
                        fill="#6b7280"
                        fontFamily="monospace"
                        transform={`rotate(-90, ${rulerHeight * 0.1}, ${y + rulerHeight - 2})`}
                      >
                        {y}
                      </text>
                    )}
                  </g>
                );
              })}
              {/* Indicador de posición del mouse */}
              <line
                x1={0}
                y1={mousePosition.y + rulerHeight}
                x2={rulerHeight}
                y2={mousePosition.y + rulerHeight}
                stroke="#ef4444"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Esquina de las reglas */}
          <div
            className="absolute top-0 left-0 bg-gray-200 border-r border-b border-gray-300 flex items-center justify-center"
            style={{ width: rulerHeight, height: rulerHeight }}
          >
            <div className="text-xs text-gray-600 font-mono">px</div>
          </div>
        </>
      )}

      {/* Líneas de guía del mouse */}
      {activeElement && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ top: showRulers ? rulerHeight : 0, left: showRulers ? rulerHeight : 0 }}
        >
          {/* Línea vertical del mouse */}
          <line
            x1={mousePosition.x}
            y1={0}
            x2={mousePosition.x}
            y2={containerDimensions.height}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.7"
          />
          {/* Línea horizontal del mouse */}
          <line
            x1={0}
            y1={mousePosition.y}
            x2={containerDimensions.width}
            y2={mousePosition.y}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.7"
          />
        </svg>
      )}

      {/* Líneas de snap y alineación - más discretas */}
      {(showSnapLines || showAlignment) && activeElement && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-70"
          style={{ top: showRulers ? rulerHeight : 0, left: showRulers ? rulerHeight : 0 }}
        >
          {snapLines.map((line, index) => {
            const isSnapLine = line.color === '#10b981' || line.color === '#6366f1';
            const isAlignmentLine = line.color === '#f59e0b' || line.color === '#ef4444';
            
            if ((isSnapLine && !showSnapLines) || (isAlignmentLine && !showAlignment)) {
              return null;
            }
            
            return (
              <g key={index}>
                {line.type === 'vertical' ? (
                  <line
                    x1={line.position}
                    y1={0}
                    x2={line.position}
                    y2={containerDimensions.height}
                    stroke={line.color}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.8"
                    className="animate-pulse"
                  />
                ) : (
                  <line
                    x1={0}
                    y1={line.position}
                    x2={containerDimensions.width}
                    y2={line.position}
                    stroke={line.color}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.8"
                    className="animate-pulse"
                  />
                )}
                {/* Etiqueta de la línea */}
                <text
                  x={line.type === 'vertical' ? line.position + 3 : 3}
                  y={line.type === 'vertical' ? 12 : line.position - 3}
                  fontSize="9"
                  fill={line.color}
                  fontWeight="500"
                  className="pointer-events-none"
                  opacity="0.9"
                >
                  {line.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Información de posición del mouse - más discreta */}
      {activeElement && (
        <div
          className="absolute bg-gray-800/80 text-white text-xs px-2 py-1 rounded pointer-events-none font-mono opacity-60 hover:opacity-100 transition-opacity duration-200"
          style={{
            left: mousePosition.x + (showRulers ? rulerHeight : 0) + 10,
            top: mousePosition.y + (showRulers ? rulerHeight : 0) - 25,
            transform: mousePosition.x > containerDimensions.width - 100 ? 'translateX(-100%)' : 'none'
          }}
        >
          {Math.round(mousePosition.x)}, {Math.round(mousePosition.y)}
        </div>
      )}

      {/* Información del elemento activo */}
      {activeElement && showDistances && (
        <>
          {/* Contorno del elemento - más sutil */}
          <div
            className="absolute border border-blue-400/60 pointer-events-none shadow-sm"
            style={{
              left: elementPosition.x + (showRulers ? rulerHeight : 0),
              top: elementPosition.y + (showRulers ? rulerHeight : 0),
              width: elementPosition.width,
              height: elementPosition.height,
              backgroundColor: 'rgba(59, 130, 246, 0.05)'
            }}
          />

          {/* Distancias desde los bordes */}
          <div className="absolute pointer-events-none">
            {/* Distancia desde arriba */}
            <div
              className="absolute bg-blue-600 text-white text-xs px-1 py-0.5 rounded font-mono"
              style={{
                left: elementPosition.x + elementPosition.width / 2 + (showRulers ? rulerHeight : 0) - 15,
                top: elementPosition.y / 2 + (showRulers ? rulerHeight : 0) - 10
              }}
            >
              ↑ {Math.round(elementPosition.y)}px
            </div>

            {/* Distancia desde la izquierda */}
            <div
              className="absolute bg-blue-600 text-white text-xs px-1 py-0.5 rounded font-mono"
              style={{
                left: elementPosition.x / 2 + (showRulers ? rulerHeight : 0) - 20,
                top: elementPosition.y + elementPosition.height / 2 + (showRulers ? rulerHeight : 0) - 10
              }}
            >
              ← {Math.round(elementPosition.x)}px
            </div>

            {/* Distancia desde la derecha */}
            <div
              className="absolute bg-blue-600 text-white text-xs px-1 py-0.5 rounded font-mono"
              style={{
                left: elementPosition.x + elementPosition.width + (containerDimensions.width - elementPosition.x - elementPosition.width) / 2 + (showRulers ? rulerHeight : 0) - 20,
                top: elementPosition.y + elementPosition.height / 2 + (showRulers ? rulerHeight : 0) - 10
              }}
            >
              {Math.round(containerDimensions.width - elementPosition.x - elementPosition.width)}px →
            </div>

            {/* Distancia desde abajo */}
            <div
              className="absolute bg-blue-600 text-white text-xs px-1 py-0.5 rounded font-mono"
              style={{
                left: elementPosition.x + elementPosition.width / 2 + (showRulers ? rulerHeight : 0) - 15,
                top: elementPosition.y + elementPosition.height + (containerDimensions.height - elementPosition.y - elementPosition.height) / 2 + (showRulers ? rulerHeight : 0) - 10
              }}
            >
              ↓ {Math.round(containerDimensions.height - elementPosition.y - elementPosition.height)}px
            </div>

            {/* Dimensiones del elemento */}
            <div
              className="absolute bg-green-600 text-white text-xs px-1 py-0.5 rounded font-mono"
              style={{
                left: elementPosition.x + (showRulers ? rulerHeight : 0),
                top: elementPosition.y + (showRulers ? rulerHeight : 0) - 25
              }}
            >
              {Math.round(elementPosition.width)} × {Math.round(elementPosition.height)}px
            </div>

            {/* Distancias entre elementos cercanos */}
            {showDistances && nearbyElements.map((element, index) => {
              const distanceX = Math.abs(element.x - elementPosition.x);
              const distanceY = Math.abs(element.y - elementPosition.y);
              const centerX = (element.x + elementPosition.x + elementPosition.width) / 2;
              const centerY = (element.y + elementPosition.y + elementPosition.height) / 2;
              
              return (
                <div key={index}>
                  {/* Línea de conexión */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ top: showRulers ? rulerHeight : 0, left: showRulers ? rulerHeight : 0 }}
                  >
                    <line
                      x1={elementPosition.x + elementPosition.width / 2}
                      y1={elementPosition.y + elementPosition.height / 2}
                      x2={element.x + element.width / 2}
                      y2={element.y + element.height / 2}
                      stroke="#8b5cf6"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      opacity="0.6"
                    />
                  </svg>
                  
                  {/* Distancia horizontal */}
                  {distanceX > 10 && (
                    <div
                      className="absolute bg-purple-600 text-white text-xs px-1 py-0.5 rounded font-mono"
                      style={{
                        left: centerX + (showRulers ? rulerHeight : 0) - 20,
                        top: Math.min(elementPosition.y, element.y) + (showRulers ? rulerHeight : 0) - 15
                      }}
                    >
                      ↔ {Math.round(distanceX)}px
                    </div>
                  )}
                  
                  {/* Distancia vertical */}
                  {distanceY > 10 && (
                    <div
                      className="absolute bg-purple-600 text-white text-xs px-1 py-0.5 rounded font-mono"
                      style={{
                        left: Math.min(elementPosition.x, element.x) + (showRulers ? rulerHeight : 0) - 25,
                        top: centerY + (showRulers ? rulerHeight : 0) - 10
                      }}
                    >
                      ↕ {Math.round(distanceY)}px
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PositioningGuide;