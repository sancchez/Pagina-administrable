import { useCallback } from 'react';
import { Editor } from 'grapesjs';

export const useGrapesGradients = (editorInstanceRef: React.RefObject<Editor | null>) => {
  
  // Función para aplicar gradiente
  const applyGradient = useCallback((gradientCss: string) => {
    const editor = editorInstanceRef.current;
    if (!editor) return;

    const selected = editor.getSelected();
    if (selected) {
      selected.addStyle({
        'background': gradientCss,
        'background-image': gradientCss
      });
      console.log('✅ Gradiente aplicado:', gradientCss);
    } else {
      console.warn('⚠️ No hay elemento seleccionado para aplicar gradiente');
    }
  }, [editorInstanceRef]);

  // Gradientes predefinidos
  const predefinedGradients = [
    {
      name: 'Azul a Púrpura',
      css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      name: 'Rosa a Naranja',
      css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      name: 'Verde a Azul',
      css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      name: 'Dorado a Rosa',
      css: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    },
    {
      name: 'Púrpura Oscuro',
      css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      name: 'Atardecer',
      css: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      name: 'Océano',
      css: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)'
    },
    {
      name: 'Bosque',
      css: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    }
  ];

  // Función para crear gradiente personalizado
  const createCustomGradient = useCallback((
    direction: string = '135deg',
    colors: Array<{ color: string; position: number }>
  ) => {
    const colorStops = colors
      .map(({ color, position }) => `${color} ${position}%`)
      .join(', ');
    
    return `linear-gradient(${direction}, ${colorStops})`;
  }, []);

  // Función para aplicar gradiente radial
  const applyRadialGradient = useCallback((
    centerColor: string,
    outerColor: string,
    shape: 'circle' | 'ellipse' = 'circle'
  ) => {
    const gradientCss = `radial-gradient(${shape}, ${centerColor} 0%, ${outerColor} 100%)`;
    applyGradient(gradientCss);
  }, [applyGradient]);

  // Función para remover gradiente
  const removeGradient = useCallback(() => {
    const editor = editorInstanceRef.current;
    if (!editor) return;

    const selected = editor.getSelected();
    if (selected) {
      selected.removeStyle('background');
      selected.removeStyle('background-image');
      console.log('✅ Gradiente removido');
    }
  }, [editorInstanceRef]);

  return {
    applyGradient,
    predefinedGradients,
    createCustomGradient,
    applyRadialGradient,
    removeGradient
  };
};