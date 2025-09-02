import React from 'react';

interface RichTextToolbarProps {
  onToolAction: (action: string) => void;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ onToolAction }) => {
  return (
    <div
      className="rich-text-toolbar"
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        gap: '4px'
      }}
    >
      <button
        onClick={() => onToolAction('bold')}
        style={{
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        title="Negrita"
      >
        B
      </button>
      <button
        onClick={() => onToolAction('italic')}
        style={{
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer',
          fontStyle: 'italic'
        }}
        title="Cursiva"
      >
        I
      </button>
      <button
        onClick={() => onToolAction('underline')}
        style={{
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
        title="Subrayado"
      >
        U
      </button>
      <div style={{ width: '1px', background: '#ccc', margin: '0 4px' }} />
      <button
        onClick={() => onToolAction('justifyLeft')}
        style={{
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer'
        }}
        title="Alinear izquierda"
      >
        ⬅
      </button>
      <button
        onClick={() => onToolAction('justifyCenter')}
        style={{
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer'
        }}
        title="Centrar"
      >
        ⬌
      </button>
      <button
        onClick={() => onToolAction('justifyRight')}
        style={{
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: 'white',
          cursor: 'pointer'
        }}
        title="Alinear derecha"
      >
        ➡
      </button>
    </div>
  );
};

export default RichTextToolbar;