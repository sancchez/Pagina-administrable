import React, { RefObject, useEffect } from 'react';
import { useEditableElements } from './hooks/useEditableElements';

// ===== TIPOS =====
interface EditableElementsManagerProps {
  contentRef: RefObject<HTMLDivElement>;
  editable: boolean;
  onSetupComplete?: () => void;
}

// ===== COMPONENTE PARA MANEJAR ELEMENTOS EDITABLES =====
export const EditableElementsManager: React.FC<EditableElementsManagerProps> = ({
  contentRef,
  editable,
  onSetupComplete
}) => {
  const { setupEditableElements, cleanupEditableElements } = useEditableElements({
    contentRef,
    editable
  });

  // Configurar elementos editables cuando sea necesario
  useEffect(() => {
    if (editable && contentRef.current) {
      setupEditableElements();
      onSetupComplete?.();
    }
    
    return () => {
      cleanupEditableElements();
    };
  }, [editable, setupEditableElements, cleanupEditableElements, onSetupComplete]);

  // Este componente no renderiza nada visible
  return null;
};

export default EditableElementsManager;