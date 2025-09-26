import React from 'react';
import { useNode, UserComponent } from '@craftjs/core';

// Define prop types for TextComponent
interface TextComponentProps {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: 'none' | 'underline' | 'line-through';
  margin?: string;
  padding?: string;
}

// TextComponent implementation
export const TextComponent: UserComponent<TextComponentProps> = ({
  text = 'Texto de ejemplo',
  fontSize = 16,
  fontFamily = 'Arial, sans-serif',
  fontWeight = 'normal',
  color = '#000000',
  textAlign = 'left',
  lineHeight = 1.5,
  letterSpacing = 0,
  textDecoration = 'none',
  margin = '0',
  padding = '8px'
}) => {
  const { connectors, selected, actions } = useNode((state) => ({
    selected: state.events.selected
  }));

  const textStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily,
    fontWeight,
    color,
    textAlign,
    lineHeight,
    letterSpacing: `${letterSpacing}px`,
    textDecoration,
    margin,
    padding,
    minHeight: '20px',
    display: 'block',
    outline: selected ? '2px solid #2563eb' : 'none',
    outlineOffset: '2px'
  };

  // Si no estamos en el contexto de Craft.js (página pública), renderizar directamente
  if (!connectors) {
    return (
      <div
        style={textStyle}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  // Renderizado para el editor
  return (
    <div
      ref={(ref) => connectors.connect(connectors.drag(ref))}
      style={{
        ...textStyle,
        cursor: 'pointer'
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        actions.setProp((props: TextComponentProps) => {
          props.text = e.currentTarget.textContent || '';
        });
      }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

// Settings for the TextComponent
TextComponent.craft = {
  displayName: 'Texto',
  props: {
    text: 'Texto de ejemplo',
    fontSize: 16,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    color: '#000000',
    textAlign: 'left',
    lineHeight: 1.5,
    letterSpacing: 0,
    textDecoration: 'none',
    margin: '0',
    padding: '8px'
  }
};

export default TextComponent;