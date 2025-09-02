import React from 'react';
import { Undo, Redo, History, Clock } from 'lucide-react';
import { TextEditingManager } from '../core/TextEditingManager';

export interface HistoryPanelProps {
  manager: TextEditingManager;
  activeElement?: HTMLElement;
  className?: string;
  showDetailedHistory?: boolean;
}

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
  content?: string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  manager,
  activeElement,
  className = '',
  showDetailedHistory = false
}) => {
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const [historyEntries, setHistoryEntries] = React.useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  React.useEffect(() => {
    const updateHistoryState = () => {
      setCanUndo(manager.canUndo());
      setCanRedo(manager.canRedo());
      
      // Simular entradas de historial (en una implementación real, esto vendría del manager)
      const mockEntries: HistoryEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 300000),
          action: 'type',
          description: 'Texto agregado: "Hola mundo"'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 240000),
          action: 'format',
          description: 'Aplicado formato: negrita'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 180000),
          action: 'type',
          description: 'Texto agregado: " con formato"'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 120000),
          action: 'delete',
          description: 'Texto eliminado: 5 caracteres'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 60000),
          action: 'format',
          description: 'Aplicado formato: cursiva'
        }
      ];
      
      setHistoryEntries(mockEntries);
      setCurrentIndex(mockEntries.length - 1);
    };

    updateHistoryState();
    
    // En una implementación real, el manager emitiría eventos
    // manager.on('stateChange', handleStateChange);
    
    return () => {
      // manager.off('stateChange', handleStateChange);
    };
  }, [manager, activeElement]);

  const handleUndo = () => {
    if (canUndo) {
      manager.undo();
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      manager.redo();
      setCurrentIndex(prev => Math.min(historyEntries.length - 1, prev + 1));
    }
  };

  const handleResetToPoint = (index: number) => {
    // En una implementación real, esto resetearía el estado a un punto específico
    setCurrentIndex(index);
    setShowHistory(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `hace ${days} día${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else {
      return 'hace un momento';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'type':
        return '✏️';
      case 'format':
        return '🎨';
      case 'delete':
        return '🗑️';
      case 'insert':
        return '➕';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'type':
        return 'text-blue-600';
      case 'format':
        return 'text-purple-600';
      case 'delete':
        return 'text-red-600';
      case 'insert':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!activeElement) {
    return null;
  }

  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg shadow-lg p-3
      ${className}
    `}>
      <div className="flex items-center space-x-2">
        {/* Botones principales */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          title="Deshacer (Ctrl+Z)"
          className={`
            p-2 rounded-md transition-all duration-200 flex items-center justify-center
            ${!canUndo 
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm active:scale-95'
            }
          `}
        >
          <Undo size={16} />
        </button>
        
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          title="Rehacer (Ctrl+Y)"
          className={`
            p-2 rounded-md transition-all duration-200 flex items-center justify-center
            ${!canRedo 
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm active:scale-95'
            }
          `}
        >
          <Redo size={16} />
        </button>
        
        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        {/* Botón de historial detallado */}
        {showDetailedHistory && (
          <div className="relative">
            <button
              onClick={() => setShowHistory(!showHistory)}
              title="Ver historial completo"
              className="p-2 rounded-md transition-all duration-200 flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm active:scale-95"
            >
              <History size={16} />
            </button>
            
            {/* Panel de historial */}
            {showHistory && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-gray-600" />
                    <h3 className="font-medium text-gray-900">Historial de cambios</h3>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {historyEntries.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No hay cambios en el historial
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {historyEntries.map((entry, index) => (
                        <button
                          key={entry.id}
                          onClick={() => handleResetToPoint(index)}
                          className={`
                            w-full p-3 text-left hover:bg-gray-50 transition-colors border-l-4
                            ${index === currentIndex 
                              ? 'border-blue-500 bg-blue-50' 
                              : index < currentIndex 
                                ? 'border-green-500' 
                                : 'border-gray-200'
                            }
                          `}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-lg mt-0.5">{getActionIcon(entry.action)}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${getActionColor(entry.action)}`}>
                                {entry.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTimestamp(entry.timestamp)}
                              </p>
                            </div>
                            {index === currentIndex && (
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setShowHistory(false)}
                    className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cerrar historial
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Indicador de estado */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>Cambios: {historyEntries.length}</span>
          {currentIndex >= 0 && (
            <span>• Posición: {currentIndex + 1}/{historyEntries.length}</span>
          )}
        </div>
      </div>
      
      {/* Atajos de teclado */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <span>Ctrl+Z: Deshacer</span>
          <span>Ctrl+Y: Rehacer</span>
          {showDetailedHistory && <span>Ctrl+H: Historial</span>}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;