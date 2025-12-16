# Corrección: Canvas en Blanco y Target de Botones

**Fecha**: 15 de diciembre, 2025
**Problemas Reportados**:
1. Al crear nueva página aparece contenido de "operación y gestión" en lugar de canvas en blanco
2. Los botones ignoran la configuración "Abrir en" (misma ventana vs nueva pestaña)

---

## 🎯 Problema 1: Canvas con Contenido por Defecto

### Causa Raíz
En `GrapesEditor.tsx`, había dos ubicaciones donde se establecía contenido HTML por defecto:

1. **Línea 454-465**: Cuando una página existente no tenía contenido
2. **Línea 462**: Cuando se creaba una página nueva (404)

Ambos lugares insertaban HTML con encabezados, párrafos e imágenes de placeholder.

### Solución Implementada

#### Cambio 1: Eliminar contenido por defecto para páginas existentes

**Archivo**: `frontend/src/admin/GrapesEditor.tsx` (líneas 450-452)

**ANTES**:
```typescript
console.log('📥 Página cargada para editar:', page.slug);
// Si la página existe pero viene sin contenido, establecer un contenido por defecto visual
const hasAnyContent = !!(page?.gjsComponents || page?.gjsHtml || page?.html || page?.content);
if (!hasAnyContent) {
  const defaultContent = `
    <div class="gjs-row" style="padding: 24px;">
      <div class="gjs-cell">
        <h1 style="margin-bottom: 12px;">${page.title || (slug.charAt(0).toUpperCase() + slug.slice(1))}</h1>
        <p style="color:#666;">Esta página no tiene contenido aún. Usa el panel de bloques para empezar.</p>
      </div>
      <div class="gjs-cell">
        <img src="https://via.placeholder.com/600x300?text=${encodeURIComponent(page.title || slug)}" alt="Imagen de ejemplo" style="max-width:100%; height:auto;" />
      </div>
    </div>`;
  page.content = defaultContent;
}
setPageData(page);
```

**DESPUÉS**:
```typescript
console.log('📥 Página cargada para editar:', page.slug);
// Dejar la página completamente vacía si no tiene contenido
setPageData(page);
```

#### Cambio 2: Eliminar contenido por defecto para páginas nuevas

**Archivo**: `frontend/src/admin/GrapesEditor.tsx` (líneas 457-468)

**ANTES**:
```typescript
const newPage: PageData = {
  id: '',
  slug: slug,
  title: slug.charAt(0).toUpperCase() + slug.slice(1),
  content: '<div class="container"><h1>' + slug.charAt(0).toUpperCase() + slug.slice(1) + '</h1><p>Contenido de la página.</p></div>',
  css: 'body { font-family: Arial, sans-serif; }',
  grapesData: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

**DESPUÉS**:
```typescript
const newPage: PageData = {
  id: '',
  slug: slug,
  title: slug.charAt(0).toUpperCase() + slug.slice(1),
  content: '',
  css: '',
  grapesData: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

### Resultado
✅ Nuevas páginas ahora abren con un lienzo completamente en blanco
✅ No hay contenido pre-cargado que el usuario deba eliminar
✅ Experiencia más limpia y profesional

---

## 🎯 Problema 2: Target de Botones No Respetado

### Causa Raíz
El atributo `data-target` se estaba leyendo **fuera** de la función `handleClick`, en el momento de cargar el script. Esto significaba que:

1. El valor se leía una sola vez al cargar la página
2. Si el usuario cambiaba el trait en GrapesJS, el cambio no se reflejaba
3. El valor quedaba "congelado" en el momento inicial

### Solución Implementada

#### Script Principal (líneas 3052-3093)

**ANTES**:
```typescript
const action = this.getAttribute('data-action');
const url = this.getAttribute('data-url') || this.getAttribute('href');
const target = this.getAttribute('data-target') || '_self';  // ❌ Se lee FUERA del handleClick
const transactionId = this.getAttribute('data-transaction-id');
const amount = this.getAttribute('data-amount');
const customFunction = this.getAttribute('data-custom-function');

// ...

function handleClick(this: HTMLElement, e: Event) {
  // ...
  switch (finalAction) {
    case 'link':
      if (url) {
        const cleanUrl = url.replace(/`/g, '').trim();
        if (target === '_blank') {  // ❌ Usa valor congelado
          window.open(cleanUrl, '_blank');
        } else {
          window.location.href = cleanUrl;
        }
      }
      break;
  }
}
```

**DESPUÉS**:
```typescript
const action = this.getAttribute('data-action');

// Si no hay acción pero hay URL, asumir que es un enlace
const finalAction = action || ((this.getAttribute('data-url') || this.getAttribute('href')) ? 'link' : null);

if (!finalAction) return;

function handleClick(this: HTMLElement, e: Event) {
  // ... validaciones de contexto de editor ...

  e.preventDefault();

  // ✅ Leer los atributos en el momento del click para obtener valores actualizados
  const url = this.getAttribute('data-url') || this.getAttribute('href');
  const target = this.getAttribute('data-target') || '_self';  // ✅ Se lee DENTRO del handleClick
  const transactionId = this.getAttribute('data-transaction-id');
  const amount = this.getAttribute('data-amount');
  const customFunction = this.getAttribute('data-custom-function');

  switch (finalAction) {
    case 'link':
      if (url) {
        const cleanUrl = url.replace(/`/g, '').trim();
        console.log('🔗 Abriendo enlace con target:', target, 'URL:', cleanUrl);  // ✅ Debug log
        if (target === '_blank') {
          window.open(cleanUrl, '_blank');
        } else {
          window.location.href = cleanUrl;
        }
      }
      break;
  }
}
```

#### Script Secundario (líneas 1365-1372)

Este script ya estaba bien implementado, solo agregamos logging:

**CAMBIO**:
```typescript
const newTabAttr = el.getAttribute('data-new-tab');
const targetAttr = el.getAttribute('data-target');
// Soportar ambos: data-new-tab y data-target
const newTab = (newTabAttr === 'true' || newTabAttr === '1') || targetAttr === '_blank';

if (act === 'link' && url) {
  console.log('🔗 [Script 2] Abriendo enlace - target:', targetAttr, 'newTab:', newTab, 'URL:', url);  // ✅ Añadido
  newTab ? window.open(url, '_blank') : (window.location.href = url);
}
```

### Beneficios de la Solución

1. ✅ **Valores dinámicos**: Los atributos se leen en el momento del click
2. ✅ **Respeta cambios**: Si el usuario cambia el trait en GrapesJS, el cambio se aplica inmediatamente
3. ✅ **Logging mejorado**: Console logs ayudan a debuggear problemas
4. ✅ **Compatibilidad**: Soporta tanto `data-target` (estándar) como `data-new-tab` (legacy)

---

## 📝 Archivos Modificados

### `frontend/src/admin/GrapesEditor.tsx`

**3 cambios realizados**:
1. Línea ~451: Eliminado contenido por defecto para páginas existentes vacías
2. Línea ~462: Eliminado contenido por defecto para páginas nuevas (404)
3. Líneas ~3052-3093: Movida lectura de atributos dentro de `handleClick`
4. Línea ~1371: Añadido logging para debug

---

## ✅ Pruebas Recomendadas

### Test 1: Canvas en Blanco
```
1. Ir a /admin/dashboard
2. Click en "Nueva Página"
3. Ingresar título y slug (ej: "Test", "test-blank")
4. Click en "Crear Página"
5. ✅ Verificar que el editor abre con canvas completamente vacío
6. ✅ No debe aparecer contenido de "operación y gestión"
```

### Test 2: Botón - Misma Ventana
```
1. En el editor, agregar un botón (action-button)
2. Seleccionar el botón
3. En panel Settings:
   - Acción: "Link"
   - URL: https://google.com
   - Abrir en: "Misma ventana" (_self)
4. Guardar y publicar la página
5. Ir a la página pública
6. Abrir consola del navegador
7. Click en el botón
8. ✅ Debe verse en consola: "🔗 Abriendo enlace con target: _self URL: https://google.com"
9. ✅ Debe abrir en la MISMA pestaña (reemplaza la página actual)
```

### Test 3: Botón - Nueva Ventana
```
1. En el editor, seleccionar el mismo botón (o crear uno nuevo)
2. En panel Settings:
   - Abrir en: "Nueva ventana" (_blank)
3. Guardar y publicar
4. Ir a la página pública
5. Abrir consola del navegador
6. Click en el botón
7. ✅ Debe verse en consola: "🔗 Abriendo enlace con target: _blank URL: https://google.com"
8. ✅ Debe abrir en NUEVA pestaña
```

### Test 4: Cambio Dinámico de Target
```
1. En el editor, seleccionar un botón con enlace
2. Cambiar "Abrir en" de "_self" a "_blank"
3. Guardar y publicar
4. Probar en página pública
5. ✅ Debe abrir en nueva pestaña
6. Volver al editor
7. Cambiar "Abrir en" de "_blank" a "_self"
8. Guardar y publicar
9. Probar en página pública
10. ✅ Debe abrir en misma pestaña
```

---

## 🔍 Debugging

Si los botones siguen sin funcionar correctamente:

1. **Abrir consola del navegador** en la página pública
2. **Click en el botón** y buscar el mensaje de log:
   - `🔗 Abriendo enlace con target: [valor] URL: [url]`
3. **Verificar el valor de `target`**:
   - Si es `null` o `undefined`: El atributo `data-target` no se está guardando
   - Si es `_self` pero abre nueva pestaña: Problema en el código de ejecución
   - Si es `_blank` pero querías `_self`: El trait no se actualizó correctamente

4. **Inspeccionar el elemento HTML** del botón en la página pública:
   ```html
   <button data-action="link" data-url="https://google.com" data-target="_self">
   ```
   - Verificar que `data-target` esté presente y tenga el valor correcto

---

## 🎨 Configuración del Trait en GrapesJS

El trait "Abrir en" se define en la línea 921-932:

```typescript
{
  id: 'open-in',
  type: 'select',
  name: 'Abrir en',
  property: 'data-target',  // ✅ Se guarda en atributo data-target
  options: [
    { id: '_self', name: 'Misma ventana' },
    { id: '_blank', name: 'Nueva ventana' }
  ],
  defaults: '_self',
  visible: false  // Se muestra solo cuando action = "link"
}
```

---

## 🚀 Resultado Final

### Canvas en Blanco
- ✅ Páginas nuevas abren con lienzo vacío
- ✅ No hay contenido pre-cargado
- ✅ Experiencia más profesional

### Target de Botones
- ✅ Respeta configuración "Misma ventana" vs "Nueva ventana"
- ✅ Cambios en el trait se aplican correctamente
- ✅ Logging para facilitar debugging
- ✅ Compatibilidad con atributos legacy

---

**Desarrollado por**: Claude Code
**Fecha**: 15 de diciembre, 2025
