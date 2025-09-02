import React from 'react';
import { TextEditingManager } from '../core/TextEditingManager';

interface Suggestion {
  id: string;
  text: string;
  description?: string;
  category: 'word' | 'phrase' | 'template' | 'correction';
  confidence: number;
}

interface AutoCompleteProps {
  manager: TextEditingManager;
  suggestions?: Suggestion[];
  onSuggestionSelect?: (suggestion: Suggestion) => void;
  minCharacters?: number;
  maxSuggestions?: number;
}

/**
 * Componente de autocompletado y sugerencias
 */
export const AutoComplete: React.FC<AutoCompleteProps> = ({
  manager,
  suggestions = [],
  onSuggestionSelect,
  minCharacters = 2,
  maxSuggestions = 5
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [currentSuggestions, setCurrentSuggestions] = React.useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [currentWord, setCurrentWord] = React.useState('');
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  // Sugerencias predefinidas
  const defaultSuggestions: Suggestion[] = [
    { id: '1', text: 'Lorem ipsum', description: 'Texto de relleno clásico', category: 'template', confidence: 0.9 },
    { id: '2', text: 'dolor sit amet', description: 'Continuación de Lorem ipsum', category: 'phrase', confidence: 0.8 },
    { id: '3', text: 'consectetur', description: 'Palabra común en textos', category: 'word', confidence: 0.7 },
    { id: '4', text: 'adipiscing elit', description: 'Frase de Lorem ipsum', category: 'phrase', confidence: 0.8 },
    { id: '5', text: 'sed do eiusmod', description: 'Texto de ejemplo', category: 'phrase', confidence: 0.7 },
    { id: '6', text: 'tempor incididunt', description: 'Continuación de texto', category: 'phrase', confidence: 0.6 },
    { id: '7', text: 'ut labore et dolore', description: 'Frase completa', category: 'phrase', confidence: 0.8 },
    { id: '8', text: 'magna aliqua', description: 'Final de frase común', category: 'phrase', confidence: 0.7 }
  ];

  const allSuggestions = [...suggestions, ...defaultSuggestions];

  // Escuchar cambios en el contenido
  React.useEffect(() => {
    const unsubscribe = manager.subscribe(() => {
      const state = manager.getState();
      
      if (state.isActive && state.content) {
        analyzeCurrentWord(state.content, state.activeElement);
      } else {
        setIsVisible(false);
      }
    });

    return unsubscribe;
  }, [manager]);

  // Manejar teclas de navegación
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < currentSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : currentSuggestions.length - 1
          );
          break;
        case 'Enter':
        case 'Tab':
          if (currentSuggestions[selectedIndex]) {
            event.preventDefault();
            applySuggestion(currentSuggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsVisible(false);
          break;
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, currentSuggestions, selectedIndex]);

  const analyzeCurrentWord = (content: string, element: HTMLElement | null) => {
    if (!element) return;

    // Obtener la posición del cursor (simulada)
    const words = content.split(/\s+/);
    const lastWord = words[words.length - 1] || '';
    
    if (lastWord.length >= minCharacters) {
      const filteredSuggestions = filterSuggestions(lastWord);
      
      if (filteredSuggestions.length > 0) {
        setCurrentWord(lastWord);
        setCurrentSuggestions(filteredSuggestions.slice(0, maxSuggestions));
        setSelectedIndex(0);
        updatePosition(element);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  };

  const filterSuggestions = (word: string): Suggestion[] => {
    const lowerWord = word.toLowerCase();
    
    return allSuggestions
      .filter(suggestion => 
        suggestion.text.toLowerCase().includes(lowerWord) ||
        suggestion.text.toLowerCase().startsWith(lowerWord)
      )
      .sort((a, b) => {
        // Priorizar coincidencias exactas al inicio
        const aStartsWith = a.text.toLowerCase().startsWith(lowerWord);
        const bStartsWith = b.text.toLowerCase().startsWith(lowerWord);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Luego por confianza
        return b.confidence - a.confidence;
      });
  };

  const updatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX
    });
  };

  const applySuggestion = (suggestion: Suggestion) => {
    const state = manager.getState();
    if (!state.activeElement) return;

    const currentContent = state.content;
    const words = currentContent.split(/\s+/);
    
    // Reemplazar la última palabra con la sugerencia
    words[words.length - 1] = suggestion.text;
    const newContent = words.join(' ');
    
    manager.updateContent(newContent);
    onSuggestionSelect?.(suggestion);
    setIsVisible(false);
    
    console.log('💡 Sugerencia aplicada:', suggestion.text);
  };

  const getCategoryIcon = (category: Suggestion['category']) => {
    switch (category) {
      case 'word': return '📝';
      case 'phrase': return '💬';
      case 'template': return '📄';
      case 'correction': return '✏️';
      default: return '💡';
    }
  };

  const getCategoryColor = (category: Suggestion['category']) => {
    switch (category) {
      case 'word': return '#3b82f6';
      case 'phrase': return '#10b981';
      case 'template': return '#f59e0b';
      case 'correction': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (!isVisible || currentSuggestions.length === 0) {
    return null;
  }

  return (
    <div 
      className="autocomplete-popup"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000
      }}
    >
      <div className="autocomplete-header">
        <span className="autocomplete-title">Sugerencias para: "{currentWord}"</span>
        <span className="autocomplete-hint">↑↓ navegar, Enter/Tab seleccionar, Esc cerrar</span>
      </div>
      
      <div className="autocomplete-list">
        {currentSuggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => applySuggestion(suggestion)}
            style={{
              borderLeft: `3px solid ${getCategoryColor(suggestion.category)}`
            }}
          >
            <div className="autocomplete-item-main">
              <span className="autocomplete-icon">
                {getCategoryIcon(suggestion.category)}
              </span>
              <span className="autocomplete-text">{suggestion.text}</span>
              <span className="autocomplete-confidence">
                {Math.round(suggestion.confidence * 100)}%
              </span>
            </div>
            
            {suggestion.description && (
              <div className="autocomplete-description">
                {suggestion.description}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="autocomplete-footer">
        <span className="autocomplete-stats">
          {currentSuggestions.length} sugerencias encontradas
        </span>
      </div>
    </div>
  );
};

// Hook para usar autocompletado
export const useAutoComplete = (
  manager: TextEditingManager,
  customSuggestions: Suggestion[] = []
) => {
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>(customSuggestions);
  
  const addSuggestion = (suggestion: Omit<Suggestion, 'id'>) => {
    const newSuggestion: Suggestion = {
      ...suggestion,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setSuggestions(prev => [...prev, newSuggestion]);
  };
  
  const removeSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };
  
  const clearSuggestions = () => {
    setSuggestions([]);
  };
  
  return {
    suggestions,
    addSuggestion,
    removeSuggestion,
    clearSuggestions,
    AutoCompleteComponent: (props: Partial<AutoCompleteProps>) => (
      <AutoComplete 
        manager={manager} 
        suggestions={suggestions}
        {...props}
      />
    )
  };
};