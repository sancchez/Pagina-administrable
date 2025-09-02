import React from 'react';
import { TextEditingManager } from '../core/TextEditingManager';

interface HistoryEntry {
  id: string;
  timestamp: number;
  element: HTMLElement;
  beforeContent: string;
  afterContent: string;
  action: 'edit' | 'format' | 'delete' | 'create';
}

interface HistoryManagerRef {
  addHistoryEntry: (element: HTMLElement, beforeContent: string, afterContent: string, action?: HistoryEntry['action']) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface HistoryManagerProps {
  manager: TextEditingManager;
  maxHistorySize?: number;
}

/**
 * Gestor de historial para operaciones de deshacer/rehacer
 */
export const HistoryManager = React.forwardRef<HistoryManagerRef, HistoryManagerProps>(({ 
  manager, 
  maxHistorySize = 50 
}, ref) => {
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(-1);
  const [isVisible, setIsVisible] = React.useState(false);

  // Escuchar cambios en el estado del manager
  React.useEffect(() => {
    const unsubscribe = manager.subscribe(() => {
      const state = manager.getState();
      setIsVisible(state.isActive);
    });

    return unsubscribe;
  }, [manager]);

  // Escuchar eventos de teclado para undo/redo
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'z') {
        event.preventDefault();
        undo();
      } else if (
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')
      ) {
        event.preventDefault();
        redo();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, currentIndex, history]);

  const addHistoryEntry = (
    element: HTMLElement,
    beforeContent: string,
    afterContent: string,
    action: HistoryEntry['action'] = 'edit'
  ) => {
    const entry: HistoryEntry = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      element,
      beforeContent,
      afterContent,
      action
    };

    setHistory(prev => {
      // Remover entradas futuras si estamos en el medio del historial
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Agregar nueva entrada
      newHistory.push(entry);
      
      // Limitar tamaño del historial
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      return newHistory;
    });

    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + 1, maxHistorySize - 1);
      return newIndex;
    });

    console.log('📝 Entrada de historial agregada:', action, beforeContent, '->', afterContent);
  };

  const undo = () => {
    if (currentIndex < 0 || history.length === 0) {
      console.log('❌ No hay acciones para deshacer');
      return;
    }

    const entry = history[currentIndex];
    if (entry && entry.element) {
      // Restaurar contenido anterior
      entry.element.textContent = entry.beforeContent;
      
      // Actualizar índice
      setCurrentIndex(prev => prev - 1);
      
      console.log('↶ Deshecho:', entry.action, entry.afterContent, '->', entry.beforeContent);
    }
  };

  const redo = () => {
    if (currentIndex >= history.length - 1) {
      console.log('❌ No hay acciones para rehacer');
      return;
    }

    const entry = history[currentIndex + 1];
    if (entry && entry.element) {
      // Aplicar contenido posterior
      entry.element.textContent = entry.afterContent;
      
      // Actualizar índice
      setCurrentIndex(prev => prev + 1);
      
      console.log('↷ Rehecho:', entry.action, entry.beforeContent, '->', entry.afterContent);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setCurrentIndex(-1);
    console.log('🗑️ Historial limpiado');
  };

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  // Exponer métodos para uso externo
  React.useImperativeHandle(ref, () => ({
    addHistoryEntry,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo
  }));

  if (!isVisible) {
    return null;
  }

  return (
    <div className="history-manager">
      <div className="history-controls">
        <button
          className={`history-button ${!canUndo ? 'disabled' : ''}`}
          onClick={undo}
          disabled={!canUndo}
          title="Deshacer (Ctrl+Z)"
          type="button"
        >
          ↶ Deshacer
        </button>
        
        <button
          className={`history-button ${!canRedo ? 'disabled' : ''}`}
          onClick={redo}
          disabled={!canRedo}
          title="Rehacer (Ctrl+Y)"
          type="button"
        >
          ↷ Rehacer
        </button>
        
        <span className="history-info">
          {history.length > 0 ? `${currentIndex + 1}/${history.length}` : '0/0'}
        </span>
        
        <button
          className="history-button clear"
          onClick={clearHistory}
          title="Limpiar historial"
          type="button"
        >
          🗑️
        </button>
      </div>
      
      {history.length > 0 && (
        <div className="history-list">
          <div className="history-title">Historial de cambios:</div>
          <div className="history-entries">
            {history.slice(-5).map((entry, index) => (
              <div 
                key={entry.id}
                className={`history-entry ${index === currentIndex ? 'current' : ''}`}
              >
                <span className="history-action">{entry.action}</span>
                <span className="history-time">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className="history-content">
                  {entry.beforeContent.substring(0, 20)}...
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// Hook personalizado para usar el historial
export const useHistoryManager = (manager: TextEditingManager) => {
  const historyRef = React.useRef<HistoryManagerRef>(null);
  
  return {
    addHistoryEntry: (element: HTMLElement, before: string, after: string, action?: HistoryEntry['action']) => {
      historyRef.current?.addHistoryEntry(element, before, after, action);
    },
    undo: () => historyRef.current?.undo(),
    redo: () => historyRef.current?.redo(),
    clearHistory: () => historyRef.current?.clearHistory(),
    canUndo: historyRef.current?.canUndo || false,
    canRedo: historyRef.current?.canRedo || false,
    HistoryComponent: () => <HistoryManager ref={historyRef} manager={manager} />
  };
};