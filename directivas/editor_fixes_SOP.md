# Editor GrapesJS: Fixes de Redimensionamiento y Consistencia

## Objetivo
Corregir 2 bugs críticos en `GrapesEditor.tsx`:
1. Visor PDF no redimensionable verticalmente
2. Inconsistencias de botones e imágenes entre editor y página pública

---

## Bug 1: PDF Viewer — Resize Vertical

### Síntoma
El componente pdf-viewer se podía extender horizontalmente pero no verticalmente.

### Causa Raíz
`resizable: true` genérico en GrapesJS habilita los handles, pero sin especificar los ejes puede omitir `tc` (top-center) y `bc` (bottom-center) que son los handles de resize vertical.

### Solución
```js
resizable: {
  tl: true, tc: true, tr: true,
  ml: true,           mr: true,
  bl: true, bc: true, br: true,
  minWidth: 100,
  minHeight: 80,
  currentUnit: 1,
  unitWidth: 'px',
  unitHeight: 'px',
}
```

### Restricciones conocidas
- `minHeight: 80` es mínimo seguro para que el iframe sea visible
- Los traits `width`/`height` ya sincronizan con `change:style` en el init del modelo

---

## Bug 2: Botones ejecutan acciones en el editor

### Síntoma
Los botones del canvas del editor ejecutaban su acción (navegar a URL) al hacer clic, cuando solo deberían hacerlo en la página pública.

### Causa Raíz
En `canvas:frame:load`, se aplicaba el parche:
```js
// INCORRECTO ❌
frame.contentWindow.checkEditorContext = () => false;
```
Esto hacía que los scripts de botones dentro del iframe creyeran que NO estaban en el editor, ejecutando sus acciones.

### Solución
```js
// CORRECTO ✅
frame.contentWindow.checkEditorContext = () => true;
```
El valor `true` indica "estamos en el editor", lo que bloquea la ejecución de acciones (navegar, descargar, etc.) dentro del canvas.

### Nota Importante
- La función `checkEditorContext` en `window` (fuera del iframe) sigue siendo la original que detecta automáticamente el contexto
- Solo el iframe del canvas necesita este parche manual

---

## Bug 3: Imágenes con tamaño no modificable (footer y similares)

### Síntoma
Imágenes del footer u otras secciones que vienen con `width="150"` (atributo HTML) no cambiaban de tamaño aunque se modificaran en el Style Manager.

### Causa Raíz
Los atributos HTML `width` y `height` tienen mayor especificidad que el `style` inlineado por GrapesJS para estas propiedades. El Style Manager escribe en `style`, pero el atributo HTML lo sobreescribe al renderizarse.

### Solución
Al seleccionar cualquier imagen (`component:selected`), normalizar:
1. Leer el atributo HTML `width`/`height`
2. Si existe y no hay ya un `style.width`/`style.height`, moverlo al style
3. Eliminar el atributo HTML

```js
comp.addStyle({ width: '150px' });
comp.removeAttributes(['width', 'height']);
```

### Restricciones conocidas
- Solo normaliza si el atributo existe Y no hay ya un style para esa propiedad (evita sobreescribir estilos deliberados)
- Se ejecuta en cada `component:selected`, no en la carga inicial (se activa cuando el usuario toca el componente)

---

## Bug 4: Botón bloquea elementos hijos (droppable/stylable)

### Síntoma
No se podían soltar iconos ni mantener imágenes o colores interiores en el componente botón del editor.

### Causa Raíz
El componente base \utton\ de la paleta tenía \droppable: false\ y le faltaba \stylable: true\ preventivo.

### Solución
Se actualizó el modelo en \GrapesEditor.tsx\ para \droppable: true\, \editable: false\ y \stylable: true\.

---

## Bug 5: Error de navegación y footer en portal de usuario

### Síntoma
El Footer aparecía a la mitad de la pantalla tapando contenido, y al hacer clic en enlaces no funcionaba la navegación.

### Causa Raíz
1) \Layout.tsx\ renderizaba el footer dinámico usando un \<div>\ directamente despues de \<main>\, rompiendo el flex/grid base.
2) Un \useEffect\ global interceptaba CADA CLIC en cualquier \<a>\ y forzaba \e.preventDefault()\, lo que impedía que React Router funcionara internamente.

### Solución
1) Se envolvió el renderizado del footer dinámico en \<footer id=\"site-footer\" className=\"flex-none mt-auto\">...</footer>\.
2) Se filtró el manejador global de clics para abortar ejecución (dejar pasar natural) en enlaces internos de la app.

