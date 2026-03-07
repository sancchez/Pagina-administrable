// button-actions.js - SCRIPT ÚNICO PARA PÁGINAS PUBLICADAS
(function () {
    console.log('🚀 CARGANDO button-actions.js');

    // Detectar contexto
    const isInEditorMode = window.location.pathname.includes('/admin') ||
        window.location.pathname.includes('/editor') ||
        window.grapesjs ||
        document.querySelector('.gjs-editor');

    console.log('📍 Contexto detectado:', isInEditorMode ? 'EDITOR' : 'PÁGINA PÚBLICA');

    // Solo ejecutar en páginas públicas
    if (!isInEditorMode) {
        console.log('✅ Ejecutando lógica para PÁGINA PÚBLICA');

        // Esperar a que el DOM esté listo
        function initButtons() {
            const buttons = document.querySelectorAll('a[data-url], a[href]:not([href="#"]):not([href=""]), button[data-url]');
            console.log(`🔍 Encontrados ${buttons.length} botones para procesar`);

            buttons.forEach((button, index) => {
                console.log(`\n🔘 Procesando botón ${index + 1}:`);
                console.log('  - Elemento:', button.tagName);
                console.log('  - ID:', button.id || 'sin ID');
                console.log('  - data-url:', button.getAttribute('data-url'));
                console.log('  - href:', button.getAttribute('href'));

                // Obtener URL prioritaria
                let targetUrl = null;

                // 1. Prioridad: data-url (limpiando espacios)
                const dataUrl = button.getAttribute('data-url');
                if (dataUrl && dataUrl.trim() && dataUrl.trim() !== '') {
                    targetUrl = dataUrl.trim();
                    console.log('  ✅ Usando data-url:', targetUrl);
                }
                // 2. Fallback: href válido
                else {
                    const href = button.getAttribute('href');
                    if (href && href !== '#' && href !== '' && href.trim() !== '') {
                        targetUrl = href.trim();
                        console.log('  ✅ Usando href:', targetUrl);
                    }
                }

                if (targetUrl) {
                    // Obtener configuración de target
                    const targetAttr = button.getAttribute('target') || button.getAttribute('data-target') || '_self';
                    const newTabAttr = button.getAttribute('data-new-tab');
                    let isNewTab = targetAttr === '_blank' || newTabAttr === 'true' || newTabAttr === '1';

                    if (targetAttr === '_self') isNewTab = false;

                    // Remover listeners previos
                    button.removeEventListener('click', handleButtonClick);

                    // Agregar nuevo listener
                    button.addEventListener('click', function (e) {
                        console.log(`🖱️ Click en botón con URL: ${targetUrl}`);

                        // Solo interceptar si es un botón o si queremos forzar el target
                        if (button.tagName === 'BUTTON' || isNewTab) {
                            e.preventDefault();
                            e.stopPropagation();

                            if (isNewTab) {
                                console.log('🚀 Abriendo URL en nueva pestaña');
                                window.open(targetUrl, '_blank');
                            } else {
                                console.log('🚀 Navegando en la misma pestaña');
                                window.location.href = targetUrl;
                            }
                        }
                    });

                    console.log('  ✅ Listener agregado correctamente');
                } else {
                    console.log('  ⚠️ No se encontró URL válida para este botón');
                }
            });
        }

        // Función para manejar clicks (para remover listeners duplicados)
        function handleButtonClick(e) {
            // Esta función se usa solo para remover listeners duplicados
        }

        // Inicializar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initButtons);
        } else {
            initButtons();
        }

        console.log('✅ Script button-actions.js inicializado para PÁGINA PÚBLICA');
    } else {
        console.log('⏸️ Script NO ejecutado - Contexto: EDITOR');
    }
})(); // Cierre de la IIFE