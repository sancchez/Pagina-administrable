import React, { useState } from 'react';
import { useCollaboration } from '../../context/CollaborationContext';
import { Users, MessageCircle, Wifi, WifiOff, Crown, X, Send } from 'lucide-react';

interface CollaborationPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ isVisible, onToggle }) => {
  const { state, sendMessage } = useCollaboration();
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendMessage(chatMessage);
      setChatMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Users className="w-5 h-5" />
          {state.activeUsers.length > 0 && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {state.activeUsers.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 w-80 bg-white rounded-lg shadow-xl border z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {state.isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="font-medium text-sm">
              {state.isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Users List */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Usuarios Activos ({state.activeUsers.length})
        </h3>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {state.activeUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  {state.isOwner && user.id === state.activeUsers.find(activeUser => activeUser.id === user.id)?.id && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          ))}
        </div>

        {state.activeUsers.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No hay usuarios conectados
          </div>
        )}
      </div>

      {/* Chat Toggle */}
      <div className="border-t px-4 py-3">
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{showChat ? 'Ocultar Chat' : 'Mostrar Chat'}</span>
        </button>
      </div>

      {/* Chat Section */}
      {showChat && (
        <div className="border-t">
          <div className="p-4">
            <div className="h-32 bg-gray-50 rounded-lg p-3 mb-3 overflow-y-auto">
              <div className="text-xs text-gray-500 text-center">
                Chat en tiempo real próximamente...
              </div>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationPanel;