import React from 'react';
import { useNode, UserComponent, Element } from '@craftjs/core';

// Define prop types for ButtonComponent
interface ButtonComponentProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  borderRadius?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  href?: string;
  target?: '_self' | '_blank';
  variant?: 'primary' | 'secondary' | 'outline';
}

// Button Component - Funciona tanto en editor como en páginas públicas
export const ButtonComponent: UserComponent<ButtonComponentProps> = ({ 
  text = 'Botón', 
  backgroundColor = '#3b82f6', 
  textColor = '#ffffff', 
  padding = '12px 24px',
  borderRadius = '6px',
  fontSize = 16,
  fontWeight = 'normal',
  href = '',
  target = '_self',
  variant = 'primary'
}) => {
  const { connectors, isActive, actions } = useNode((node) => ({
    isActive: node.events.selected
  }));
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#6b7280',
          color: '#ffffff',
          border: 'none'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: backgroundColor,
          border: `2px solid ${backgroundColor}`
        };
      default:
        return {
          backgroundColor,
          color: textColor,
          border: 'none'
        };
    }
  };
  
  const buttonStyles = {
    ...getVariantStyles(),
    padding,
    borderRadius,
    fontSize: `${fontSize}px`,
    fontWeight,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.2s ease',
    outline: isActive ? '2px solid #3b82f6' : 'none',
    outlineOffset: '2px'
  };
  
  // Si no estamos en el contexto de Craft.js (página pública), renderizar directamente
  if (!connectors) {
    const Component = href ? 'a' : 'button';
    const props = href ? { href, target } : { type: 'button' };
    
    return (
      <Component
        {...props}
        style={buttonStyles}
        onMouseEnter={(e) => {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = backgroundColor;
          }
        }}
      >
        {text}
      </Component>
    );
  }
  
  // Renderizado para el editor
  const Component = href ? 'a' : 'button';
  const props = href ? { href, target } : { type: 'button' };
  
  return (
    <Element
      id="button-element"
      is={Component}
      canvas={false}
      ref={(ref) => connectors.connect(connectors.drag(ref))}
      {...props}
      style={buttonStyles}
      onClick={(e) => {
        if (!href) {
          e.preventDefault();
        }
      }}
    >
      {text}
    </Element>
  );
};

// Configuración de Craft.js
ButtonComponent.craft = {
  displayName: 'Botón',
  props: {
    text: 'Botón',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: 16,
    fontWeight: 'normal',
    href: '',
    target: '_self',
    variant: 'primary'
  },
  related: {
    toolbar: () => {
      const { actions, text, backgroundColor, textColor, padding, borderRadius, fontSize, fontWeight, href, target, variant } = useNode((node) => ({
        text: node.data.props.text,
        backgroundColor: node.data.props.backgroundColor,
        textColor: node.data.props.textColor,
        padding: node.data.props.padding,
        borderRadius: node.data.props.borderRadius,
        fontSize: node.data.props.fontSize,
        fontWeight: node.data.props.fontWeight,
        href: node.data.props.href,
        target: node.data.props.target,
        variant: node.data.props.variant
      }));
      
      return (
        <div className="p-4">
          <h3 className="font-semibold mb-2">Configuración de Botón</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Texto del botón</label>
              <input 
                type="text" 
                value={text}
                onChange={(e) => actions.setProp((props: ButtonComponentProps) => {
                  props.text = e.target.value;
                })}
                className="w-full p-2 border rounded" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Variante</label>
              <select 
                value={variant}
                onChange={(e) => actions.setProp((props: ButtonComponentProps) => {
                  props.variant = e.target.value as ButtonComponentProps['variant'];
                })}
                className="w-full p-2 border rounded"
              >
                <option value="primary">Primario</option>
                <option value="secondary">Secundario</option>
                <option value="outline">Contorno</option>
              </select>
            </div>
            {variant === 'primary' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Color de fondo</label>
                  <input 
                    type="color" 
                    value={backgroundColor}
                    onChange={(e) => actions.setProp((props: ButtonComponentProps) => {
                      props.backgroundColor = e.target.value;
                    })}
                    className="w-full p-2 border rounded h-10" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color del texto</label>
                  <input 
                    type="color" 
                    value={textColor}
                    onChange={(e) => actions.setProp((props: ButtonComponentProps) => {
                      props.textColor = e.target.value;
                    })}
                    className="w-full p-2 border rounded h-10" 
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Tamaño de fuente</label>
              <input 
                type="number" 
                value={fontSize}
                onChange={(e) => actions.setProp((props: ButtonComponentProps) => {
                  props.fontSize = parseInt(e.target.value) || 16;
                })}
                className="w-full p-2 border rounded" 
                min="10"
                max="32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Peso de fuente</label>
              <select 
                value={fontWeight}
                onChange={(e) => actions.setProp((props: ButtonComponentProps) => {
                  props.fontWeight = e.target.value as ButtonComponentProps['fontWeight'];
                })}
                className="w-full p-2 border rounded"
              >
                <option value="normal">Normal</option>
                <option value="bold">Negrita</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Padding</label>
              <input 
                type="text" 
                value={padding}
                onChange={(e) => actions.setProp((props: ButtonComponentProps) => {
                  props.padding = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="12px 24px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Border radius</label>
              <input 
                type="text" 
                value={borderRadius}
                onChange={(e) => actions.setProp((props: ButtonComponentProps) => {
                  props.borderRadius = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="6px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Enlace (opcional)</label>
              <input 
                type="url" 
                value={href}
                onChange={(e) => actions.setProp((props: ButtonComponentProps) => {
                  props.href = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="https://ejemplo.com"
              />
            </div>
            {href && (
              <div>
                <label className="block text-sm font-medium mb-1">Abrir en</label>
                <select 
                  value={target}
                  onChange={(e) => actions.setProp((props: ButtonComponentProps) => {
                    props.target = e.target.value as ButtonComponentProps['target'];
                  })}
                  className="w-full p-2 border rounded"
                >
                  <option value="_self">Misma ventana</option>
                  <option value="_blank">Nueva ventana</option>
                </select>
              </div>
            )}
          </div>
        </div>
      );
    }
  }
};