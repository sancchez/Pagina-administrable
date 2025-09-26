import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import { AlertTriangle, Zap, Clock, Database } from 'lucide-react';

/**
 * Monitor de rendimiento del editor
 */
export const PerformanceMonitor: React.FC = memo(() => {
  const { nodes } = useEditor((state) => ({
    nodes: state.nodes
  }));

  // Calcular métricas de rendimiento
  const performanceMetrics = useMemo(() => {
    const nodeCount = Object.keys(nodes).length;
    const complexNodes = Object.values(nodes).filter(
      node => node.data.nodes && node.data.nodes.length > 5
    ).length;
    
    return {
      nodeCount,
      complexNodes,
      memoryEstimate: nodeCount * 0.5, // KB estimados por nodo
      renderComplexity: nodeCount + (complexNodes * 2)
    };
  }, [nodes]);

  // Detectar problemas de rendimiento
  const performanceIssues = useMemo(() => {
    const issues = [];
    
    if (performanceMetrics.nodeCount > 50) {
      issues.push({
        type: 'warning',
        message: `Muchos elementos (${performanceMetrics.nodeCount}). Considera optimizar.`,
        icon: AlertTriangle
      });
    }
    
    if (performanceMetrics.complexNodes > 10) {
      issues.push({
        type: 'warning', 
        message: `${performanceMetrics.complexNodes} elementos complejos detectados.`,
        icon: Clock
      });
    }
    
    if (performanceMetrics.memoryEstimate > 100) {
      issues.push({
        type: 'error',
        message: `Alto uso de memoria estimado: ${performanceMetrics.memoryEstimate.toFixed(1)}KB`,
        icon: Database
      });
    }
    
    return issues;
  }, [performanceMetrics]);

  const [showMonitor, setShowMonitor] = useState(false);

  if (!showMonitor && performanceIssues.length === 0) {
    return (
      <button
        onClick={() => setShowMonitor(true)}
        className="fixed bottom-4 left-4 bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
        title="Monitor de rendimiento"
      >
        <Zap className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white shadow-lg rounded-lg border p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Rendimiento
        </h3>
        <button
          onClick={() => setShowMonitor(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Elementos:</span>
          <span className="font-medium">{performanceMetrics.nodeCount}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Complejos:</span>
          <span className="font-medium">{performanceMetrics.complexNodes}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Memoria est.:</span>
          <span className="font-medium">{performanceMetrics.memoryEstimate.toFixed(1)}KB</span>
        </div>
      </div>
      
      {performanceIssues.length > 0 && (
        <div className="mt-3 pt-3 border-t space-y-2">
          {performanceIssues.map((issue, index) => {
            const Icon = issue.icon;
            return (
              <div
                key={index}
                className={`flex items-start gap-2 text-sm ${
                  issue.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`}
              >
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{issue.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

/**
 * Optimizador de renderizado para componentes pesados
 */
export const OptimizedRenderer: React.FC<{
  children: React.ReactNode;
  threshold?: number;
}> = memo(({ children, threshold = 100 }) => {
  const [shouldRender, setShouldRender] = useState(true);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    
    if (renderCount > threshold) {
      console.warn(`🐌 [Performance] Component rendered ${renderCount} times`);
    }
  });



  return <>{children}</>;
});

/**
 * Cache inteligente para datos del editor
 */
export class EditorCache {
  private static cache = new Map<string, any>();
  private static maxSize = 50;
  private static ttl = 5 * 60 * 1000; // 5 minutos

  static set(key: string, value: any): void {
    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  static get(key: string): any {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Verificar TTL
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  static clear(): void {
    this.cache.clear();
  }

  static getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * Hook para optimizar actualizaciones del editor
 */
export const useOptimizedEditor = () => {
  const { actions, query, ...editorState } = useEditor();
  
  // Debounce para acciones frecuentes
  const debouncedSetProp = useCallback(
    debounce((nodeId: string, props: any) => {
      actions.setProp(nodeId, props);
    }, 300),
    [actions]
  );
  
  // Cache para queries frecuentes
  const cachedQuery = useCallback(
    (queryFn: string, ...args: any[]) => {
      const cacheKey = `query_${queryFn}_${JSON.stringify(args)}`;
      const cached = EditorCache.get(cacheKey);
      
      if (cached) return cached;
      
      const result = (query as any)[queryFn](...args);
      EditorCache.set(cacheKey, result);
      
      return result;
    },
    [query]
  );
  
  return {
    ...editorState,
    actions: {
      ...actions,
      setProp: debouncedSetProp
    },
    query: {
      ...query,
      cached: cachedQuery
    }
  };
};

/**
 * Utilidad de debounce
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Validador de datos para prevenir errores
 */
export const DataValidator = {
  validateNodeData: (nodeData: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!nodeData) {
      errors.push('Node data is required');
      return { valid: false, errors };
    }
    
    if (!nodeData.type) {
      errors.push('Node type is required');
    }
    
    if (nodeData.props && typeof nodeData.props !== 'object') {
      errors.push('Node props must be an object');
    }
    
    if (nodeData.nodes && !Array.isArray(nodeData.nodes)) {
      errors.push('Node children must be an array');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  validatePageData: (pageData: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!pageData) {
      errors.push('Page data is required');
      return { valid: false, errors };
    }
    
    if (!pageData.ROOT) {
      errors.push('Page must have a ROOT node');
    }
    
    // Validar estructura de nodos
    if (pageData.ROOT && pageData.ROOT.nodes) {
      pageData.ROOT.nodes.forEach((nodeId: string, index: number) => {
        if (!pageData[nodeId]) {
          errors.push(`Missing node data for ${nodeId} at index ${index}`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default {
  PerformanceMonitor,
  OptimizedRenderer,
  EditorCache,
  useOptimizedEditor,
  DataValidator
};