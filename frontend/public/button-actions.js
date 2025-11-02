// button-actions.js - SCRIPT ÚNICO PARA PÁGINAS PUBLICADAS
console.log('🚀 CARGANDO button-actions.js');

// Detectar contexto
const isEditor = window.location.pathname.includes('/admin') || 
                 window.location.pathname.includes('/editor') ||
                 window.grapesjs ||
                 document.querySelector('.gjs-editor');

console.log('📍 Contexto detectado:', isEditor ? 'EDITOR' : 'PÁGINA PÚBLICA');

// Solo ejecutar en páginas públicas
if (!isEditor) {
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
                // Remover listeners previos
                button.removeEventListener('click', handleButtonClick);
                
                // Agregar nuevo listener
                button.addEventListener('click', function(e) {
                    console.log(`🖱️ Click en botón con URL: ${targetUrl}`);
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Abrir en nueva pestaña
                    window.open(targetUrl, '_blank');
                    console.log('🚀 Abriendo URL en nueva pestaña');
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