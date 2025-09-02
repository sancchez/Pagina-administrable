import React from 'react';
import { Save } from 'lucide-react';

interface ManualSaveButtonProps {
  onSave: () => void;
  disabled?: boolean;
  saving?: boolean;
  hasUnsavedChanges?: boolean;
  className?: string;
}

/**
 * Botón de guardado manual para reemplazar el autoguardado
 */
export const ManualSaveButton: React.FC<ManualSaveButtonProps> = ({
  onSave,
  disabled = false,
  saving = false,
  hasUnsavedChanges = false,
  className = ''
}) => {
  const handleSave = () => {
    if (!disabled && !saving) {
      onSave();
    }
  };

  const isDisabled = disabled || saving || !hasUnsavedChanges;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <button
      onClick={handleSave}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      className={`
        inline-flex items-center gap-2 px-3 py-2 text-sm font-medium
        rounded-md transition-all duration-200 focus:outline-none focus:ring-2
        focus:ring-blue-500 focus:ring-offset-2
        ${
          hasUnsavedChanges && !saving
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        ${
          isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'
        }
        ${className}
      `}
      title={
        saving 
          ? 'Guardando...' 
          : hasUnsavedChanges 
            ? 'Guardar cambios (Ctrl+S)' 
            : 'Sin cambios pendientes'
      }
    >
      <Save 
        size={16} 
        className={`
          transition-transform duration-200
          ${hasUnsavedChanges ? 'animate-pulse' : ''}
        `} 
      />
      <span>
        {saving ? 'Guardando...' : hasUnsavedChanges ? 'Guardar' : 'Guardado'}
      </span>
      {hasUnsavedChanges && !saving && (
        <span className="ml-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
    </button>
  );
};

export default ManualSaveButton;