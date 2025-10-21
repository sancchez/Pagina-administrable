import { Editor } from 'grapesjs';

// Configuración de tipos personalizados para Style Manager
export const setupCustomStyleTypes = (editor: Editor) => {
  const styleManager = editor.StyleManager;

  // Tipo personalizado 'gradient'
  styleManager.addType('gradient', {
    create({ props, change }: any) {
      const el = document.createElement('div');
      el.innerHTML = `
        <div class="gradient-picker" style="padding: 10px;">
          <div style="margin-bottom: 10px;">
            <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #666;">Ángulo:</label>
            <input type="range" class="gradient-angle" min="0" max="360" value="90" 
                   style="width: 100%; margin-bottom: 5px;">
            <span class="angle-value" style="font-size: 11px; color: #888;">90°</span>
          </div>
          
          <div style="margin-bottom: 10px;">
            <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #666;">Modo:</label>
            <select class="gradient-mode" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 3px;">
              <option value="free">Libre</option>
              <option value="to-top">Arriba</option>
              <option value="to-bottom">Abajo</option>
              <option value="to-left">Izquierda</option>
              <option value="to-right">Derecha</option>
              <option value="to-top-left">Arriba-Izquierda</option>
              <option value="to-top-right">Arriba-Derecha</option>
              <option value="to-bottom-left">Abajo-Izquierda</option>
              <option value="to-bottom-right">Abajo-Derecha</option>
            </select>
          </div>
          
          <div style="margin-bottom: 10px;">
            <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #666;">Colores:</label>
            <div class="gradient-colors"></div>
            <button type="button" class="add-color-btn" 
                    style="width: 100%; padding: 6px; margin-top: 5px; background: #007cba; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
              + Agregar Color
            </button>
          </div>
          
          <div style="margin-bottom: 10px;">
            <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #666;">Vista previa:</label>
            <div class="gradient-preview" style="width: 100%; height: 30px; border: 1px solid #ddd; border-radius: 3px; background: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);"></div>
          </div>
        </div>
      `;

      const angleInput = el.querySelector('.gradient-angle') as HTMLInputElement;
      const angleValue = el.querySelector('.angle-value') as HTMLElement;
      const modeSelect = el.querySelector('.gradient-mode') as HTMLSelectElement;
      const colorsContainer = el.querySelector('.gradient-colors') as HTMLElement;
      const addColorBtn = el.querySelector('.add-color-btn') as HTMLButtonElement;
      const preview = el.querySelector('.gradient-preview') as HTMLElement;

      let colors = [
        { color: '#ff0000', position: 0 },
        { color: '#0000ff', position: 100 }
      ];

      const updatePreview = () => {
        const mode = modeSelect.value;
        const angle = angleInput.value;
        
        let direction = mode === 'free' ? `${angle}deg` : mode;
        
        const colorStops = colors
          .sort((a, b) => a.position - b.position)
          .map(c => `${c.color} ${c.position}%`)
          .join(', ');
        
        const gradient = `linear-gradient(${direction}, ${colorStops})`;
        preview.style.background = gradient;
      };

      const renderColors = () => {
        colorsContainer.innerHTML = '';
        colors.forEach((colorData, index) => {
          const colorEl = document.createElement('div');
          colorEl.style.cssText = 'display: flex; align-items: center; margin-bottom: 5px; gap: 5px;';
          colorEl.innerHTML = `
            <input type="color" value="${colorData.color}" style="width: 30px; height: 25px; border: none; cursor: pointer;">
            <input type="range" min="0" max="100" value="${colorData.position}" style="flex: 1;">
            <span style="font-size: 10px; color: #888; width: 30px;">${colorData.position}%</span>
            <button type="button" style="background: #dc3545; color: white; border: none; border-radius: 2px; width: 20px; height: 20px; cursor: pointer; font-size: 10px;">×</button>
          `;

          const colorInput = colorEl.querySelector('input[type="color"]') as HTMLInputElement;
          const positionInput = colorEl.querySelector('input[type="range"]') as HTMLInputElement;
          const positionSpan = colorEl.querySelector('span') as HTMLElement;
          const deleteBtn = colorEl.querySelector('button') as HTMLButtonElement;

          colorInput.addEventListener('input', () => {
            colors[index].color = colorInput.value;
            updatePreview();
            change({ partial: false });
          });

          positionInput.addEventListener('input', () => {
            colors[index].position = parseInt(positionInput.value);
            positionSpan.textContent = `${positionInput.value}%`;
            updatePreview();
            change({ partial: false });
          });

          deleteBtn.addEventListener('click', () => {
            if (colors.length > 2) {
              colors.splice(index, 1);
              renderColors();
              updatePreview();
              change({ partial: false });
            }
          });

          colorsContainer.appendChild(colorEl);
        });
      };

      angleInput.addEventListener('input', () => {
        angleValue.textContent = `${angleInput.value}°`;
        if (modeSelect.value === 'free') {
          updatePreview();
          change({ partial: false });
        }
      });

      modeSelect.addEventListener('change', () => {
        updatePreview();
        change({ partial: false });
      });

      addColorBtn.addEventListener('click', () => {
        const newPosition = colors.length > 0 ? Math.max(...colors.map(c => c.position)) + 10 : 50;
        colors.push({
          color: '#ffffff',
          position: Math.min(newPosition, 100)
        });
        renderColors();
        updatePreview();
        change({ partial: false });
      });

      renderColors();
      updatePreview();

      return el;
    },

    emit({ props, updateStyle }: any) {
      const el = props.target;
      if (!el) return '';

      const angleInput = el.querySelector('.gradient-angle') as HTMLInputElement;
      const modeSelect = el.querySelector('.gradient-mode') as HTMLSelectElement;
      const colorInputs = el.querySelectorAll('.gradient-colors input[type="color"]');
      const positionInputs = el.querySelectorAll('.gradient-colors input[type="range"]');

      if (!angleInput || !modeSelect || !colorInputs.length) return '';

      const mode = modeSelect.value;
      const angle = angleInput.value;
      
      let direction = mode === 'free' ? `${angle}deg` : mode;
      
      const colors = Array.from(colorInputs).map((colorInput: any, index) => {
        const positionInput = positionInputs[index] as HTMLInputElement;
        return {
          color: colorInput.value,
          position: parseInt(positionInput.value)
        };
      });

      if (colors.length === 1) {
        return colors[0].color;
      }

      const colorStops = colors
        .sort((a, b) => a.position - b.position)
        .map(c => `${c.color} ${c.position}%`)
        .join(', ');

      const gradient = `linear-gradient(${direction}, ${colorStops})`;
      
      // Detectar si es gradiente de texto
      const isTextGradient = props.property === 'color';
      
      if (isTextGradient) {
        updateStyle({
          'background': gradient,
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          'color': 'transparent'
        });
        return '';
      }

      return gradient;
    },

    update({ value, el }: any) {
      if (!el || !value) return;

      const angleInput = el.querySelector('.gradient-angle') as HTMLInputElement;
      const modeSelect = el.querySelector('.gradient-mode') as HTMLSelectElement;
      const preview = el.querySelector('.gradient-preview') as HTMLElement;

      // Parsear gradiente existente
      if (value.includes('linear-gradient')) {
        const match = value.match(/linear-gradient\(([^,]+),\s*(.+)\)/);
        if (match) {
          const direction = match[1].trim();
          const colorStops = match[2];

          // Actualizar dirección
          if (direction.endsWith('deg')) {
            modeSelect.value = 'free';
            angleInput.value = direction.replace('deg', '');
          } else {
            modeSelect.value = direction;
          }

          // Parsear colores (implementación básica)
          const colorMatches = colorStops.match(/(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\([^)]+\)|rgba\([^)]+\))\s*(\d+%)?/g);
          if (colorMatches && colorMatches.length >= 2) {
            // Actualizar vista previa
            preview.style.background = value;
          }
        }
      } else if (value.match(/^#[a-fA-F0-9]{6}$|^#[a-fA-F0-9]{3}$/)) {
        // Color sólido
        preview.style.background = value;
      } else {
        // Fallback a background-color si no hay gradiente
        const bgColor = getComputedStyle(el.closest('[data-gjs-type]') || document.body).backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          preview.style.background = bgColor;
        }
      }
    }
  });

  // Tipo personalizado 'align'
  styleManager.addType('align', {
    create({ props }: any) {
      const el = document.createElement('div');
      el.innerHTML = `
        <div class="align-buttons" style="display: flex; gap: 2px;">
          <button type="button" data-align="left" style="flex: 1; padding: 8px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 3px 0 0 3px;">
            <i class="fa fa-align-left"></i>
          </button>
          <button type="button" data-align="center" style="flex: 1; padding: 8px; border: 1px solid #ddd; background: white; cursor: pointer;">
            <i class="fa fa-align-center"></i>
          </button>
          <button type="button" data-align="right" style="flex: 1; padding: 8px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 0 3px 3px 0;">
            <i class="fa fa-align-right"></i>
          </button>
        </div>
      `;

      const buttons = el.querySelectorAll('button[data-align]');
      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          buttons.forEach(b => b.style.background = 'white');
          (button as HTMLElement).style.background = '#007cba';
          (button as HTMLElement).style.color = 'white';
        });
      });

      return el;
    },

    emit({ props }: any) {
      const el = props.target;
      if (!el) return '';

      const activeButton = el.querySelector('button[style*="rgb(0, 124, 186)"]') as HTMLElement;
      if (!activeButton) return '';

      const align = activeButton.getAttribute('data-align');
      const selectedEl = editor.getSelected();
      
      if (!selectedEl) return align || '';

      const elStyle = selectedEl.getStyle();
      const elPosition = elStyle.position;
      const parentEl = selectedEl.parent();
      const parentStyle = parentEl ? parentEl.getStyle() : {};

      // Lógica de alineación según el contexto
      if (elPosition === 'absolute') {
        switch (align) {
          case 'left':
            selectedEl.addStyle({ left: '0', right: 'auto', transform: 'none' });
            break;
          case 'center':
            selectedEl.addStyle({ left: '50%', right: 'auto', transform: 'translateX(-50%)' });
            break;
          case 'right':
            selectedEl.addStyle({ right: '0', left: 'auto', transform: 'none' });
            break;
        }
        return '';
      }

      if (parentStyle.display === 'flex') {
        switch (align) {
          case 'left':
            parentEl?.addStyle({ 'justify-content': 'flex-start' });
            break;
          case 'center':
            parentEl?.addStyle({ 'justify-content': 'center' });
            break;
          case 'right':
            parentEl?.addStyle({ 'justify-content': 'flex-end' });
            break;
        }
        return '';
      }

      if (parentStyle.display === 'grid') {
        switch (align) {
          case 'left':
            selectedEl.addStyle({ 'justify-self': 'start' });
            break;
          case 'center':
            selectedEl.addStyle({ 'justify-self': 'center' });
            break;
          case 'right':
            selectedEl.addStyle({ 'justify-self': 'end' });
            break;
        }
        return '';
      }

      const elDisplay = elStyle.display;
      if (elDisplay === 'inline' || elDisplay === 'inline-block') {
        switch (align) {
          case 'left':
            parentEl?.addStyle({ 'text-align': 'left' });
            break;
          case 'center':
            parentEl?.addStyle({ 'text-align': 'center' });
            break;
          case 'right':
            parentEl?.addStyle({ 'text-align': 'right' });
            break;
        }
        return '';
      }

      // Para elementos SVG
      if (selectedEl.get('tagName') === 'svg') {
        switch (align) {
          case 'left':
            selectedEl.addStyle({ margin: '0 auto 0 0' });
            break;
          case 'center':
            selectedEl.addStyle({ margin: '0 auto' });
            break;
          case 'right':
            selectedEl.addStyle({ margin: '0 0 0 auto' });
            break;
        }
        return '';
      }

      return align || '';
    },

    update({ value, el }: any) {
      if (!el || !value) return;

      const buttons = el.querySelectorAll('button[data-align]');
      buttons.forEach((button: any) => {
        if (button.getAttribute('data-align') === value) {
          button.style.background = '#007cba';
          button.style.color = 'white';
        } else {
          button.style.background = 'white';
          button.style.color = 'black';
        }
      });
    }
  });

  // Agregar propiedades personalizadas a sectores
  const sectors = styleManager.getSectors();
  
  // Agregar gradiente a sector de Apariencia
  const appearanceSector = sectors.filter((sector: any) => sector.get('name') === '🎨 Apariencia')[0];
  if (appearanceSector) {
    appearanceSector.get('properties').add({
      type: 'gradient',
      property: 'background',
      name: 'Gradiente de fondo'
    });
  }

  // Agregar gradiente a sector de Texto
  const textSector = sectors.filter((sector: any) => sector.get('name') === '📝 Texto')[0];
  if (textSector) {
    textSector.get('properties').add({
      type: 'gradient',
      property: 'color',
      name: 'Gradiente de texto'
    });
  }
};

// Configuración de bloques personalizados
export const setupCustomBlocks = (editor: Editor) => {
  const blockManager = editor.BlockManager;

  // Renombrar bloques por defecto
  const defaultBlocks = [
    { id: 'column1', label: 'Columna 1' },
    { id: 'column2', label: 'Columnas 1/2' },
    { id: 'column3', label: 'Columnas 1/3' },
    { id: 'text', label: 'Texto' },
    { id: 'link', label: 'Enlace' },
    { id: 'image', label: 'Imagen' },
    { id: 'video', label: 'Video' },
    { id: 'map', label: 'Mapa' }
  ];

  defaultBlocks.forEach(block => {
    const existingBlock = blockManager.get(block.id);
    if (existingBlock) {
      existingBlock.set('label', block.label);
    }
  });

  // Bloques básicos
  blockManager.add('simple-text', {
    label: 'Texto Simple',
    category: 'Básico',
    content: '<p class="text-gray-800">Escribe tu texto aquí...</p>',
    media: '<i class="fa fa-font"></i>'
  });

  blockManager.add('simple-button', {
    label: 'Botón',
    category: 'Básico',
    content: '<button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">Botón</button>',
    media: '<i class="fa fa-square"></i>'
  });

  blockManager.add('simple-image', {
    label: 'Imagen',
    category: 'Básico',
    content: '<img src="https://via.placeholder.com/300x200" alt="Imagen" class="w-full h-auto rounded-lg">',
    media: '<i class="fa fa-image"></i>'
  });

  // Bloques de elementos
  blockManager.add('cta-button', {
    label: 'Botón CTA',
    category: 'Elementos',
    content: `
      <div class="text-center py-8">
        <a href="#" class="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-8 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
          ¡Actúa Ahora!
        </a>
      </div>
    `,
    media: '<i class="fa fa-hand-pointer-o"></i>'
  });

  blockManager.add('card-basic', {
    label: 'Tarjeta Básica',
    category: 'Elementos',
    content: `
      <div class="bg-white rounded-lg shadow-md p-6 max-w-sm">
        <img src="https://via.placeholder.com/300x200" alt="Imagen" class="w-full h-48 object-cover rounded-lg mb-4">
        <h3 class="text-xl font-bold text-gray-800 mb-2">Título de la Tarjeta</h3>
        <p class="text-gray-600 mb-4">Descripción breve de la tarjeta con información relevante.</p>
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">Leer más</button>
      </div>
    `,
    media: '<i class="fa fa-id-card-o"></i>'
  });

  blockManager.add('divider', {
    label: 'Divisor',
    category: 'Elementos',
    content: '<hr class="border-t-2 border-gray-300 my-8">',
    media: '<i class="fa fa-minus"></i>'
  });

  blockManager.add('icon-text', {
    label: 'Icono + Texto',
    category: 'Elementos',
    content: `
      <div class="flex items-center space-x-4 p-4">
        <div class="bg-blue-500 text-white p-3 rounded-full">
          <i class="fa fa-star text-xl"></i>
        </div>
        <div>
          <h4 class="text-lg font-semibold text-gray-800">Característica</h4>
          <p class="text-gray-600">Descripción de la característica o beneficio.</p>
        </div>
      </div>
    `,
    media: '<i class="fa fa-star"></i>'
  });

  // Bloques de secciones
  blockManager.add('hero-section', {
    label: 'Hero Principal',
    category: 'Secciones',
    content: `
      <section class="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-5xl font-bold mb-6">Título Principal Impactante</h1>
          <p class="text-xl mb-8 max-w-2xl mx-auto">Subtítulo que explica el valor de tu propuesta de manera clara y convincente.</p>
          <button class="bg-white text-blue-600 font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-colors text-lg">
            Comenzar Ahora
          </button>
        </div>
      </section>
    `,
    media: '<i class="fa fa-home"></i>'
  });

  blockManager.add('features-section', {
    label: 'Sección Características',
    category: 'Secciones',
    content: `
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">Nuestras Características</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="bg-blue-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i class="fa fa-rocket text-2xl"></i>
              </div>
              <h3 class="text-xl font-semibold mb-2">Rápido</h3>
              <p class="text-gray-600">Optimizado para máximo rendimiento y velocidad.</p>
            </div>
            <div class="text-center">
              <div class="bg-green-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i class="fa fa-shield text-2xl"></i>
              </div>
              <h3 class="text-xl font-semibold mb-2">Seguro</h3>
              <p class="text-gray-600">Protección avanzada para tus datos y privacidad.</p>
            </div>
            <div class="text-center">
              <div class="bg-purple-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <i class="fa fa-cog text-2xl"></i>
              </div>
              <h3 class="text-xl font-semibold mb-2">Flexible</h3>
              <p class="text-gray-600">Adaptable a tus necesidades específicas.</p>
            </div>
          </div>
        </div>
      </section>
    `,
    media: '<i class="fa fa-th"></i>'
  });

  // Bloques específicos de Acueducto
  blockManager.add('tarjeta-tarifa', {
    label: 'Tarjeta Tarifa',
    category: 'Acueducto',
    content: `
      <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
        <h3 class="text-xl font-bold text-gray-800 mb-2">Tarifa Residencial</h3>
        <div class="text-3xl font-bold text-blue-600 mb-2">$15.000</div>
        <p class="text-gray-600 text-sm mb-4">Por metro cúbico</p>
        <ul class="text-sm text-gray-700 space-y-1">
          <li>• Consumo básico incluido</li>
          <li>• Servicio 24/7</li>
          <li>• Mantenimiento incluido</li>
        </ul>
      </div>
    `,
    media: '<i class="fa fa-money"></i>'
  });

  blockManager.add('boton-pqr', {
    label: 'Botón PQR',
    category: 'Acueducto',
    content: `
      <div class="text-center py-6">
        <a href="/pqr" class="inline-flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          <i class="fa fa-exclamation-triangle mr-2"></i>
          Presentar PQR
        </a>
        <p class="text-sm text-gray-600 mt-2">Peticiones, Quejas y Reclamos</p>
      </div>
    `,
    media: '<i class="fa fa-exclamation-triangle"></i>'
  });

  blockManager.add('info-contacto', {
    label: 'Info Contacto',
    category: 'Acueducto',
    content: `
      <div class="bg-blue-50 rounded-lg p-6">
        <h3 class="text-lg font-bold text-blue-800 mb-4">Información de Contacto</h3>
        <div class="space-y-3">
          <div class="flex items-center">
            <i class="fa fa-phone text-blue-600 w-5"></i>
            <span class="ml-3 text-gray-700">(123) 456-7890</span>
          </div>
          <div class="flex items-center">
            <i class="fa fa-envelope text-blue-600 w-5"></i>
            <span class="ml-3 text-gray-700">info@acueducto.gov.co</span>
          </div>
          <div class="flex items-center">
            <i class="fa fa-map-marker text-blue-600 w-5"></i>
            <span class="ml-3 text-gray-700">Calle 123 #45-67, Ciudad</span>
          </div>
        </div>
      </div>
    `,
    media: '<i class="fa fa-phone"></i>'
  });

  blockManager.add('horario-atencion', {
    label: 'Horario',
    category: 'Acueducto',
    content: `
      <div class="bg-green-50 rounded-lg p-6">
        <h3 class="text-lg font-bold text-green-800 mb-4">Horario de Atención</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-700">Lunes - Viernes:</span>
            <span class="font-semibold text-green-700">8:00 AM - 5:00 PM</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-700">Sábados:</span>
            <span class="font-semibold text-green-700">8:00 AM - 12:00 PM</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-700">Domingos:</span>
            <span class="font-semibold text-red-600">Cerrado</span>
          </div>
        </div>
      </div>
    `,
    media: '<i class="fa fa-clock-o"></i>'
  });
};

// Configuración de comandos personalizados
export const setupCustomCommands = (editor: Editor) => {
  // Comando para pegar desde portapapeles
  editor.Commands.add('paste-from-clipboard', {
    run(editor: Editor) {
      if (navigator.clipboard && navigator.clipboard.read) {
        navigator.clipboard.read().then(clipboardItems => {
          for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
              if (type.startsWith('image/')) {
                clipboardItem.getType(type).then(blob => {
                  const reader = new FileReader();
                  reader.onload = function(e) {
                    const dataUrl = e.target?.result as string;
                    const selected = editor.getSelected();
                    if (selected && selected.get('tagName') === 'img') {
                      selected.addAttributes({ src: dataUrl });
                    } else {
                      editor.getWrapper()?.append(`<img src="${dataUrl}" alt="Imagen pegada" style="max-width: 100%; height: auto;">`);
                    }
                  };
                  reader.readAsDataURL(blob);
                });
                return;
              }
            }
          }
        }).catch(err => {
          console.warn('No se pudo acceder al portapapeles:', err);
        });
      }
    }
  });

  // Comando para alineación rápida
  editor.Commands.add('align-left', {
    run(editor: Editor) {
      const selected = editor.getSelected();
      if (selected) {
        selected.addStyle({ 'text-align': 'left' });
      }
    }
  });

  editor.Commands.add('align-center', {
    run(editor: Editor) {
      const selected = editor.getSelected();
      if (selected) {
        selected.addStyle({ 'text-align': 'center' });
      }
    }
  });

  editor.Commands.add('align-right', {
    run(editor: Editor) {
      const selected = editor.getSelected();
      if (selected) {
        selected.addStyle({ 'text-align': 'right' });
      }
    }
  });

  // Comando para hacer circular
  editor.Commands.add('make-circular', {
    run(editor: Editor) {
      const selected = editor.getSelected();
      if (selected) {
        selected.addStyle({ 'border-radius': '50%' });
      }
    }
  });
};