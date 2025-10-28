/**
 * Script para manejar las acciones de botones en páginas publicadas
 * Este script se inyecta automáticamente en todas las páginas que contienen botones
 */
(function() {
  'use strict';
  
  function initButtonActions() {
    // Buscar todos los botones con data-action-type
    const buttons = document.querySelectorAll('[data-action-type]');
    
    buttons.forEach(function(button) {
      // Evitar múltiples event listeners
      if (button.hasAttribute('data-button-initialized')) {
        return;
      }
      
      button.setAttribute('data-button-initialized', 'true');
      
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const actionType = button.getAttribute('data-action-type');
        const url = button.getAttribute('data-url');
        const target = button.getAttribute('data-target') || '_self';
        
        // Sin acción
        if (!actionType || actionType === 'none') {
          return;
        }
        
        // Validar URL
        if (!url) {
          console.warn('Botón sin URL configurada');
          return;
        }
        
        // ENLACE - Ir a otra página
        if (actionType === 'link') {
          if (target === '_blank') {
            window.open(url, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = url;
          }
        }
        
        // PDF - Siempre en nueva pestaña
        else if (actionType === 'pdf') {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        
        // DESCARGA - Descargar archivo
        else if (actionType === 'download') {
          const a = document.createElement('a');
          a.href = url;
          a.download = url.split('/').pop() || 'archivo';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    });
  }
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButtonActions);
  } else {
    initButtonActions();
  }
  
  // También inicializar después de cambios dinámicos en el DOM
  const observer = new MutationObserver(function(mutations) {
    let shouldReinit = false;
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.hasAttribute && node.hasAttribute('data-action-type')) {
              shouldReinit = true;
            } else if (node.querySelector && node.querySelector('[data-action-type]')) {
              shouldReinit = true;
            }
          }
        });
      }
    });
    
    if (shouldReinit) {
      initButtonActions();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('✅ Button Actions Script cargado');
})();