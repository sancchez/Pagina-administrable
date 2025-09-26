import React, { useEffect, useState } from 'react';
import { useCollaboration } from '../../context/CollaborationContext';
import { MousePointer2 } from 'lucide-react';

const CollaborationCursors: React.FC = () => {
  const { state, updateCursor } = useCollaboration();
  const [isMouseTracking, setIsMouseTracking] = useState(false);

  useEffect(() => {
    if (!state.isConnected) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseTracking) {
        updateCursor(e.clientX, e.clientY);
      }
    };

    const handleMouseEnter = () => {
      setIsMouseTracking(true);
    };

    const handleMouseLeave = () => {
      setIsMouseTracking(false);
    };

    // Agregar listeners al documento
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [state.isConnected, updateCursor, isMouseTracking]);

  if (!state.isConnected) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {state.cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-100 ease-out pointer-events-none"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          {/* Cursor Icon */}
          <div className="relative">
            <MousePointer2 
              className="w-5 h-5 drop-shadow-lg" 
              style={{ color: cursor.user.color }}
              fill={cursor.user.color}
            />
            
            {/* User Label */}
            <div 
              className="absolute top-6 left-2 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap shadow-lg"
              style={{ backgroundColor: cursor.user.color }}
            >
              {cursor.user.name}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollaborationCursors;