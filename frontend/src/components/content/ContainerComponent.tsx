import React, { useState, useCallback, useMemo, memo } from 'react';
import { useNode, UserComponent } from '@craftjs/core';
import { AlertCircle } from 'lucide-react';

// Define prop types for ContainerComponent
interface ContainerComponentProps {
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  border?: string;
  minHeight?: string;
  width?: string;
  maxWidth?: string;
  display?: 'block' | 'flex' | 'grid';
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: string;
  children?: React.ReactNode;
}

// Interfaces para validación
interface StyleError {
  property: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface ValidatedContainerProps extends ContainerComponentProps {
  isValid?: boolean;
  errors?: StyleError[];
}

// Container Component - Funciona tanto en editor como en páginas públicas
const ContainerComponentInner: UserComponent<ContainerComponentProps> = ({ 
  backgroundColor = 'transparent', 
  padding = '16px',
  margin = '0',
  borderRadius = '0px',
  border = 'none',
  minHeight = 'auto',
  width = '100%',
  maxWidth = 'none',
  display = 'block',
  flexDirection = 'column',
  justifyContent = 'flex-start',
  alignItems = 'flex-start',
  gap = '0px',
  children
}) => {
  const { connectors, isActive } = useNode((node) => ({
    isActive: node.events.selected
  }));

  const [styleErrors, setStyleErrors] = useState<StyleError[]>([]);

  // Validación de valores CSS
  const validateCSSValue = useCallback((value: string, property: string): ValidationResult => {
    if (!value || value.trim() === '') {
      return { isValid: false, error: `${property} no puede estar vacío` };
    }

    // Validar unidades CSS comunes
    const cssUnitRegex = /^(auto|none|transparent|inherit|initial|unset|\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax))$/i;
    const colorRegex = /^(transparent|inherit|initial|unset|#[0-9a-f]{3,8}|rgb\(.*\)|rgba\(.*\)|hsl\(.*\)|hsla\(.*\)|[a-z]+)$/i;
    
    switch (property) {
      case 'backgroundColor':
        if (value !== 'transparent' && !colorRegex.test(value)) {
          return { isValid: false, error: 'Color de fondo no válido' };
        }
        break;
      case 'padding':
      case 'margin':
      case 'gap':
        if (!cssUnitRegex.test(value)) {
          return { isValid: false, error: `Valor de ${property} no válido (use px, em, rem, %, etc.)` };
        }
        break;
      case 'borderRadius':
        if (value !== '0px' && !cssUnitRegex.test(value)) {
          return { isValid: false, error: 'Border radius no válido' };
        }
        break;
      case 'width':
      case 'maxWidth':
      case 'minHeight':
        if (!cssUnitRegex.test(value)) {
          return { isValid: false, error: `Valor de ${property} no válido` };
        }
        break;
      case 'border':
        if (value !== 'none' && !/^(\d+(\.\d+)?px\s+(solid|dashed|dotted|double)\s+#[0-9a-f]{3,8}|none)$/i.test(value)) {
          return { isValid: false, error: 'Border debe tener formato: "1px solid #color" o "none"' };
        }
        break;
    }
    
    return { isValid: true };
  }, []);

  // Validar todas las propiedades
  const validateAllProps = useCallback(() => {
    const props = {
      backgroundColor,
      padding,
      margin,
      borderRadius,
      border,
      minHeight,
      width,
      maxWidth,
      gap
    };

    const errors: StyleError[] = [];
    
    Object.entries(props).forEach(([key, value]) => {
      const validation = validateCSSValue(value, key);
      if (!validation.isValid && validation.error) {
        errors.push({ property: key, message: validation.error });
      }
    });

    return errors;
  }, [backgroundColor, padding, margin, borderRadius, border, minHeight, width, maxWidth, gap, validateCSSValue]);

  // Validación memoizada
  const validationErrors = useMemo(() => {
    return validateAllProps();
  }, [validateAllProps]);

  const hasValidationErrors = useMemo(() => {
    return validationErrors.length > 0;
  }, [validationErrors]);

  // Manejo de errores
  const handleStyleError = useCallback((property: string, error: string) => {
    setStyleErrors(prev => {
      const existing = prev.find(err => err.property === property);
      if (existing) {
        return prev.map(err => err.property === property ? { ...err, message: error } : err);
      }
      return [...prev, { property, message: error }];
    });
  }, []);

  const containerStyles: React.CSSProperties = {
    backgroundColor,
    padding,
    margin,
    borderRadius,
    border,
    minHeight,
    width,
    maxWidth,
    display,
    ...(display === 'flex' && {
      flexDirection,
      justifyContent,
      alignItems,
      gap
    }),
    outline: isActive ? '2px solid #3b82f6' : 'none',
    outlineOffset: '2px',
    position: 'relative' as const
  };
  
  // Renderizado directo con soporte para editor mediante connectors
  return (
    <div>
      {/* Errores de validación */}
      {hasValidationErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700 font-medium text-sm">Errores de validación en contenedor</span>
          </div>
          <div className="space-y-1">
            {validationErrors.map((error, index) => (
              <div key={index} className="text-red-600 text-xs">
                • {error.property}: {error.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        ref={(ref) => {
          if (ref && connectors) {
            try {
              connectors.connect(connectors.drag(ref));
            } catch (_) {
              // En modo público o sin contexto de editor, ignorar
            }
          }
        }}
        style={{
          ...containerStyles,
          ...(hasValidationErrors && {
            border: '2px dashed #ef4444',
            backgroundColor: hasValidationErrors ? 'rgba(254, 226, 226, 0.5)' : containerStyles.backgroundColor
          })
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Exportar con memo para optimización
export const ContainerComponent = memo(ContainerComponentInner);

// Configuración de Craft.js
ContainerComponent.craft = {
  displayName: 'Contenedor',
  props: {
    backgroundColor: 'transparent',
    padding: '16px',
    margin: '0',
    borderRadius: '0px',
    border: 'none',
    minHeight: 'auto',
    width: '100%',
    maxWidth: 'none',
    display: 'block',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: '0px'
  },
  related: {
    toolbar: () => {
      const { actions, backgroundColor, padding, margin, borderRadius, border, minHeight, width, maxWidth, display, flexDirection, justifyContent, alignItems, gap } = useNode((node) => ({
        backgroundColor: node.data.props.backgroundColor,
        padding: node.data.props.padding,
        margin: node.data.props.margin,
        borderRadius: node.data.props.borderRadius,
        border: node.data.props.border,
        minHeight: node.data.props.minHeight,
        width: node.data.props.width,
        maxWidth: node.data.props.maxWidth,
        display: node.data.props.display,
        flexDirection: node.data.props.flexDirection,
        justifyContent: node.data.props.justifyContent,
        alignItems: node.data.props.alignItems,
        gap: node.data.props.gap
      }));
      
      return (
        <div className="p-4">
          <h3 className="font-semibold mb-2">Configuración de Contenedor</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Color de fondo</label>
              <input 
                type="color" 
                value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                  props.backgroundColor = e.target.value;
                })}
                className="w-full p-2 border rounded h-10" 
              />
              <label className="flex items-center mt-1">
                <input 
                  type="checkbox" 
                  checked={backgroundColor === 'transparent'}
                  onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                    props.backgroundColor = e.target.checked ? 'transparent' : '#ffffff';
                  })}
                  className="mr-2"
                />
                <span className="text-sm">Transparente</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de display</label>
              <select 
                value={display}
                onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                  props.display = e.target.value as ContainerComponentProps['display'];
                })}
                className="w-full p-2 border rounded"
              >
                <option value="block">Block</option>
                <option value="flex">Flex</option>
                <option value="grid">Grid</option>
              </select>
            </div>
            {display === 'flex' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Dirección</label>
                  <select 
                    value={flexDirection}
                    onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                      props.flexDirection = e.target.value as ContainerComponentProps['flexDirection'];
                    })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="row">Horizontal</option>
                    <option value="column">Vertical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Justificación</label>
                  <select 
                    value={justifyContent}
                    onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                      props.justifyContent = e.target.value as ContainerComponentProps['justifyContent'];
                    })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="flex-start">Inicio</option>
                    <option value="center">Centro</option>
                    <option value="flex-end">Final</option>
                    <option value="space-between">Espacio entre</option>
                    <option value="space-around">Espacio alrededor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alineación</label>
                  <select 
                    value={alignItems}
                    onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                      props.alignItems = e.target.value as ContainerComponentProps['alignItems'];
                    })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="flex-start">Inicio</option>
                    <option value="center">Centro</option>
                    <option value="flex-end">Final</option>
                    <option value="stretch">Estirar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Espacio entre elementos</label>
                  <input 
                    type="text" 
                    value={gap}
                    onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                      props.gap = e.target.value;
                    })}
                    className="w-full p-2 border rounded" 
                    placeholder="16px"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text sm font-medium mb-1">Padding</label>
              <input 
                type="text" 
                value={padding}
                onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                  props.padding = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="16px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Margin</label>
              <input 
                type="text" 
                value={margin}
                onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                  props.margin = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Border radius</label>
              <input 
                type="text" 
                value={borderRadius}
                onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                  props.borderRadius = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="0px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Border</label>
              <input 
                type="text" 
                value={border}
                onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                  props.border = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="1px solid #ccc"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Altura mínima</label>
              <input 
                type="text" 
                value={minHeight}
                onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                  props.minHeight = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="auto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ancho</label>
              <input 
                type="text" 
                value={width}
                onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                  props.width = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="100%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ancho máximo</label>
              <input 
                type="text" 
                value={maxWidth}
                onChange={(e) => actions.setProp((props: ContainerComponentProps) => {
                  props.maxWidth = e.target.value;
                })}
                className="w-full p-2 border rounded" 
                placeholder="none"
              />
            </div>
          </div>
        </div>
      );
    }
  }
};