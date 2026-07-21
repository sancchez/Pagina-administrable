# Plan de mejoras — Asomielrodas (rama `asomiel`)

Diagnóstico de las discrepancias entre lo que se ve en el **editor** y lo que se
ve en la **página pública**, más un plan de corrección para cada una. Objetivo:
arreglar sin romper el comportamiento actual del editor.

---

## 1. Subtítulo descentrado (editor OK, público mal)

**Estado:** por confirmar con más detalle visual (necesito ver el editor abierto
en esa página específica, comparado con el público, para señalar el elemento
exacto).

**Hipótesis (ya validada en un caso similar en Socorro):** cuando el `text-align`
solo se aplica al contenedor padre y no al elemento hijo directamente, Tailwind
en el sitio público puede perder esa herencia según el orden de las reglas CSS
generadas — el editor y el público NO comparten el mismo orden de carga de CSS,
así que un estilo "heredado" en el editor puede no heredarse igual en público.

**Fix:** mismo patrón que usamos en Socorro — asegurar `text-align` explícito en
cada elemento de texto (no solo en el contenedor), tanto al generar contenido
nuevo como al corregir el existente vía editor.

**Riesgo al editor:** ninguno, es una corrección de contenido/CSS, no de lógica.

**Pendiente:** que me indiques la página/slug exacta o yo la reviso ahí mismo en
el navegador para identificar el selector.

---

## 2. Visor de PDF — feo, controles inconsistentes, altura no editable

**Causa raíz:** el componente `pdf-viewer` (`GrapesEditor.tsx` ~línea 2061) hoy
probablemente delega en el visor **nativo del navegador** (Chrome/Edge) vía
`<embed>`/`<iframe>` apuntando directo al PDF. Por eso:
- Los controles (mover, ver completo, descargar) son los del navegador, **no
  los controla la app** → por eso cambian según el zoom/navegador, no es un bug
  nuestro sino una limitación del visor nativo.
- La altura no es un trait editable en Style Manager, por eso "se puede pero
  incómodo".

**Fix propuesto:** reemplazar el visor nativo por un visor **propio basado en
PDF.js** (librería estándar, gratuita, la misma que usa Firefox) con:
- Toolbar propio y consistente (zoom, página, descargar, pantalla completa)
  igual en cualquier navegador.
- Trait de altura en el Style Manager (resizable de verdad, con drag-handle).
- Se integra como un componente más de GrapesJS, mismo patrón que ya existe.

**Riesgo al editor:** bajo-medio — es un componente nuevo que reemplaza al
actual, no toca el resto del editor. Se prueba aislado antes de integrar.

**Esfuerzo:** medio (requiere agregar la librería `pdfjs-dist` al frontend).

---

## 3. Recuadros con logo/SVG perdidos, difícil volver a poner

**CAUSA RAÍZ CONFIRMADA** ✅ — encontrada en el código:

`backend/src/utils/grapesValidator.ts` línea 43-49, la lista de tags permitidos
al guardar (`ALLOWED_TAGS`) **no incluye `svg`, `path`, `circle`, `g`, etc.**
Cuando el editor guarda el árbol de componentes (`gjsComponents`), el backend
reescribe cualquier tag no permitido a `<div>` — **por eso el ícono SVG
desaparece silenciosamente al guardar**, no es un problema del editor sino de
la validación del servidor.

**Fix:** agregar los tags de SVG a la whitelist:
```
'svg', 'path', 'circle', 'ellipse', 'g', 'rect', 'line',
'polygon', 'polyline', 'defs', 'use', 'linearGradient',
'radialGradient', 'stop', 'clipPath', 'mask', 'title'
```
Es seguro: los atributos ya pasan por `sanitizeAttributes` (que filtra
`onload`/`onclick`/etc.), y `<script>` sigue fuera de la whitelist.

**Además (mejora de UX):** para que sea fácil "clic en el recuadro → subir
imagen/logo" sin pelear con SVG crudo, conviene que esos recuadros usen el
componente `image` existente (que ya sube archivos vía `/api/upload`) en vez
de requerir pegar código SVG a mano.

**Riesgo al editor:** ninguno — es un cambio de 1 línea en el backend, no toca
el editor ni su UI.

**Prioridad:** ALTA — es el fix más simple y de mayor impacto de toda la lista.

---

## 4. Botón de Facebook — se puso ícono, quedó solo el texto

**Hipótesis fuerte (relacionada con el Fix A que hicimos en el editor):**

El Fix A (`makeImportedContentEditable`, que SÍ está en `asomiel`) marca como
"editable" cualquier componente sin hijos-elemento que tenga contenido de
texto. Si el botón de Facebook tiene el ícono metido en el campo `content`
como HTML crudo (`<img src="facebook.svg"> Facebook`) en lugar de como un
componente hijo real, Fix A lo detecta como "texto" (porque `content` no está
vacío) y lo marca editable. Al hacer doble clic para editarlo, el RTE de
GrapesJS reemplaza todo el HTML interno por texto plano — **borrando el ícono**.

**Fix:** afinar Fix A para que NO marque como editable ningún componente cuyo
`content` contenga tags HTML (ícono, imagen, svg embebido), solo texto plano
real. Es una condición adicional, no cambia el comportamiento ya probado para
texto puro.

**Riesgo al editor:** bajo — hace el Fix A más estricto (menos falsos
positivos), no revierte nada de lo ya validado.

**Pendiente de confirmar:** revisar en vivo ese botón específico en el editor
para confirmar si el ícono está en `content` o como componente hijo antes de
tocar el código.

---

## 5. Cuando el backend cae, se ve la web vieja/fea en vez de la última versión dinámica

**CAUSA RAÍZ CONFIRMADA** ✅ — encontrada en `PageRenderer.tsx`:

El componente **ya tiene** un mecanismo de caché: cada vez que carga una página
dinámica exitosamente, guarda una copia en `localStorage` (`page_cache_{slug}`).
El problema es que ese caché solo se usa si `VITE_STRICT_RENDER === 'false'`, y
por defecto es `true` (línea 132). Con el flag en `true`, cuando el backend
falla, el render salta directo al fallback **viejo**: las páginas estáticas de
React (`pageComponents`, líneas 12-39) — que son el diseño antiguo, no el
diseño actual del editor.

**Fix (justo lo que pediste):** cambiar el orden de prioridad de fallback a:
1. Página dinámica desde la API (normal)
2. **Última versión dinámica cacheada en localStorage** (ya construida, solo
   falta activarla por defecto — sin depender del flag)
3. Página estática de React (estas quedan solo como último recurso, o se
   podrían eliminar más adelante si el caché es confiable)

Así, si el backend cae, se ve la ÚLTIMA versión real que el editor publicó
(porque viene de una copia local de lo que ya trajo la BD), no un diseño
antiguo desconectado del editor.

**Riesgo al editor:** ninguno — es lógica del sitio público, no toca
`GrapesEditor.tsx`.

**Prioridad:** ALTA — mecanismo ya existe, es activarlo bien.

---

## Resumen y prioridad sugerida

| # | Problema | Causa | Esfuerzo | Riesgo editor | Prioridad |
|---|---|---|---|---|---|
| 3 | SVG/logos se pierden al guardar | Confirmada (whitelist backend) | Muy bajo | Ninguno | 🔴 Alta |
| 5 | Fallback muestra diseño viejo | Confirmada (flag mal puesto) | Bajo | Ninguno | 🔴 Alta |
| 4 | Ícono de botón se borra al editar | Hipótesis fuerte (Fix A) | Bajo | Bajo | 🟡 Media |
| 1 | Subtítulo descentrado | Por confirmar visualmente | Bajo | Ninguno | 🟡 Media |
| 2 | Visor de PDF feo/inconsistente | Confirmada (visor nativo del navegador) | Medio | Bajo-medio | 🟢 Cuando haya tiempo |

**Sugerencia:** empezar por el **3** y el **5** — son los de mayor impacto visual,
menor esfuerzo, y cero riesgo de tocar el editor. Después el **4** (relacionado,
mismo archivo que ya tocamos). El **1** necesito verlo en vivo para precisar. El
**2** es el más grande (nuevo componente), se deja para una sesión aparte.
