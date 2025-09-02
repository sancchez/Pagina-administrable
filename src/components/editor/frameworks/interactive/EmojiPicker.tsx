import React, { useState, useRef, useEffect } from 'react';
import { Smile, Search, Clock, Heart, Star, Zap } from 'lucide-react';

interface EmojiPickerProps {
  position: { x: number; y: number };
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

interface EmojiCategory {
  name: string;
  icon: React.ReactNode;
  emojis: string[];
}

const emojiCategories: EmojiCategory[] = [
  {
    name: 'Recientes',
    icon: <Clock size={16} />,
    emojis: ['😀', '😊', '👍', '❤️', '🎉', '🔥', '💯', '✨']
  },
  {
    name: 'Caras',
    icon: <Smile size={16} />,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
      '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
      '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
      '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😔', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩',
      '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
      '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓'
    ]
  },
  {
    name: 'Gestos',
    icon: <Star size={16} />,
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️',
      '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
      '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜',
      '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅'
    ]
  },
  {
    name: 'Corazones',
    icon: <Heart size={16} />,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
      '💘', '💝', '💟', '♥️', '💌', '💋', '💍', '💎'
    ]
  },
  {
    name: 'Objetos',
    icon: <Zap size={16} />,
    emojis: [
      '💻', '📱', '⌚', '📷', '📹', '🎥', '📞', '☎️',
      '📺', '📻', '🎵', '🎶', '🎤', '🎧', '📢', '📣',
      '📯', '🔔', '🔕', '📯', '🎺', '📻', '📱', '💻',
      '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿',
      '📀', '🧮', '🎬', '📽️', '🎞️', '📸', '📷', '📹'
    ]
  },
  {
    name: 'Naturaleza',
    icon: <Star size={16} />,
    emojis: [
      '🌱', '🌿', '🍀', '🌾', '🌵', '🌴', '🌳', '🌲',
      '🌰', '🌻', '🌺', '🌸', '🌼', '🌷', '🥀', '🌹',
      '🌊', '🌈', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️',
      '🌨️', '❄️', '☀️', '🌞', '🌝', '🌛', '🌜', '🌚'
    ]
  }
];

export default function EmojiPicker({ position, onEmojiSelect, onClose }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentEmojis');
    return saved ? JSON.parse(saved) : ['😀', '😊', '👍', '❤️', '🎉', '🔥', '💯', '✨'];
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  // Filtrar emojis por búsqueda
  const filteredEmojis = searchTerm
    ? emojiCategories.flatMap(cat => cat.emojis).filter(emoji => {
        // Aquí podrías agregar una lógica más sofisticada de búsqueda
        return true; // Por simplicidad, mostrar todos si hay búsqueda
      })
    : selectedCategory === 0 
      ? recentEmojis 
      : emojiCategories[selectedCategory]?.emojis || [];

  // Manejar selección de emoji
  const handleEmojiSelect = (emoji: string) => {
    // Agregar a recientes
    const newRecents = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 24);
    setRecentEmojis(newRecents);
    localStorage.setItem('recentEmojis', JSON.stringify(newRecents));
    
    onEmojiSelect(emoji);
    onClose();
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 h-96"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-semibold text-gray-800">Emojis</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg font-bold"
        >
          ×
        </button>
      </div>

      {/* Búsqueda */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar emojis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categorías */}
      {!searchTerm && (
        <div className="flex border-b">
          {emojiCategories.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(index)}
              className={`flex-1 p-2 text-center hover:bg-gray-50 ${
                selectedCategory === index ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
              title={category.name}
            >
              {category.icon}
            </button>
          ))}
        </div>
      )}

      {/* Grid de emojis */}
      <div className="p-3 h-64 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {filteredEmojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => handleEmojiSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
        
        {filteredEmojis.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Smile size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No se encontraron emojis</p>
          </div>
        )}
      </div>

      {/* Footer con información */}
      <div className="p-2 border-t bg-gray-50 text-xs text-gray-500 text-center">
        Haz clic en un emoji para insertarlo
      </div>
    </div>
  );
}