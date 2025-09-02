import React, { RefObject } from 'react';
import { EditorState } from './hooks/useEditorState';
import ContextualToolbar from './ContextualToolbar';
import RichTextToolbar from './RichTextToolbar';
import ContextMenu from './ContextMenu';

// ===== TIPOS =====
interface EditorToolsManagerProps {
  contentRef: RefObject<HTMLDivElement>;
  editorState: EditorState;
  editable: boolean;
  onToolAction: (action: string, element?: HTMLElement | null) => void;
}

// ===== COMPONENTE PARA MANEJAR HERRAMIENTAS DEL EDITOR =====
export const EditorToolsManager: React.FC<EditorToolsManagerProps> = ({
  contentRef,
  editorState,
  editable,
  onToolAction
}) => {
  if (!editable) {
    return null;
  }

  return (
    <>
      {/* ContextualToolbar - Solo en modo selección */}
      {editorState.objetoSeleccionado && editorState.modoActual === 'seleccion' && (
        <ContextualToolbar
          selectedElement={editorState.objetoSeleccionado}
          onToolAction={onToolAction}
        />
      )}

      {/* RichTextToolbar - Solo en modo edición */}
      {editorState.objetoSeleccionado && editorState.modoActual === 'edicion' && (
        <RichTextToolbar onToolAction={onToolAction} />
      )}

      {/* Menú contextual */}
      {editorState.showContextMenu && (
        <ContextMenu
          containerRef={contentRef}
          enabled={editorState.showContextMenu}
          onAction={onToolAction}
          style={{
            position: 'fixed',
            left: editorState.contextMenuPosition.x,
            top: editorState.contextMenuPosition.y,
            zIndex: 1001
          }}
        />
      )}
    </>
  );
};

export default EditorToolsManager;