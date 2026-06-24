# Parámetros de diseño para páginas del seed (Acueducto El Socorro)

Guía para generar el HTML de las páginas que entran al CMS como **seed** y luego
se editan en el editor visual (GrapesJS) sin que se descentren, pierdan colores o
se rompan objetos. **Pásale el bloque "PROMPT PARA GEMINI" tal cual.**

---

## Cómo funciona (contexto técnico)

- El HTML de cada página se guarda en la base de datos y se carga en **GrapesJS**
  (editor visual) y se muestra en la **web pública** vía `publishedHtml`.
- Estilos con **TailwindCSS**. El editor carga Tailwind por CDN (genera cualquier
  clase), pero la **web pública usa el Tailwind compilado del proyecto**, que
  PURGA las clases que no estén en el código fuente. Por eso hay un `safelist`
  (en `frontend/tailwind.config.js`) con la **paleta segura** de abajo.
- En GrapesJS **cada elemento es un componente independiente**. Si un estilo
  (alineación, color) se hereda del padre, al editar un hijo se puede "perder"
  visualmente. Por eso los estilos clave van **explícitos en cada elemento**.

---

## Reglas obligatorias (NO romper)

1. **Estilos clave explícitos por elemento.** Pon `text-center`/`text-left`,
   color de texto (`text-...`) y tamaño en CADA `h1..h6`, `p`, `span`, `a`.
   NO confíes en heredarlos del contenedor padre. (Esto evita el descentrado.)
2. **Paleta segura únicamente** (ver lista). No uses colores fuera de ella: en
   público se purgan y el elemento queda sin color.
3. **Prohibido `bg-clip-text` + `text-transparent`** (texto con gradiente). En
   público el gradiente se purga y el texto queda **invisible**. Usa color sólido.
4. **Gradientes solo con la paleta segura** y siempre con `from-` y `to-`
   definidos (nunca dejes un gradiente "a transparente").
5. **Texto editable = elemento hoja con SOLO texto.** Un `<p>`/`<h2>` debe
   contener únicamente texto, sin íconos/`<span>` mezclados dentro. Si necesitas
   ícono + texto, ponlos como **hermanos** (dos elementos), no anidados.
6. **Botones:** usa `<button>` o `<a class="btn ...">`. Para botones de acción
   del sistema (PDF, pago, descarga) usa `<a data-action-type="...">`.
7. **Imágenes:** `<img src="/uploads/archivo.jpg" class="...">` o URL absoluta
   `https://`. Da tamaño con clases (`w-`, `h-`) o `style="width:..."`.
8. **Sin `<script>` ni atributos `on...`** (onclick, etc.): el validador de
   seguridad los elimina.
9. **Límites:** máx. ~20 niveles de anidación, ~1000 elementos, 10MB por página.
10. **IDs únicos** si los usas (evita repetir `id="..."`).

---

## Paleta segura (colores permitidos)

Familias: `slate, gray, zinc, neutral, stone, blue, sky, cyan, indigo, teal,
green, emerald, lime, red, rose, orange, amber, yellow, purple`
Tonos: `50 100 200 300 400 500 600 700 800 900`
Más: `white, black, transparent`
Prefijos cubiertos: `bg- text- border- from- via- to- ring- divide- placeholder-`
con variantes `hover: focus: sm: md: lg:`.

> Recomendado para acueducto: azules (`blue`, `sky`, `cyan`), verdes
> (`green`, `emerald`, `teal`) y neutros (`gray`, `slate`, `white`).

---

## Plantilla base de una página

```html
<div class="bg-white">
  <!-- HERO -->
  <section class="bg-blue-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 class="text-4xl font-bold text-white text-center mb-4">Título</h1>
      <p class="text-lg text-blue-50 text-center max-w-2xl mx-auto mb-8">Subtítulo descriptivo.</p>
      <div class="flex justify-center gap-4">
        <a href="/destino" class="inline-flex items-center px-6 py-3 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50">Acción</a>
      </div>
    </div>
  </section>

  <!-- SECCIÓN DE TARJETAS -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">Sección</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="p-6 rounded-xl border border-gray-200 text-center">
        <div class="text-4xl text-center mb-3">💧</div>
        <h3 class="text-xl font-semibold text-gray-800 text-center mb-2">Tarjeta</h3>
        <p class="text-gray-600 text-center">Descripción de la tarjeta.</p>
      </div>
    </div>
  </section>
</div>
```

---

## PROMPT PARA GEMINI (copiar y pegar)

```
Eres diseñador web. Genera el HTML de una página para un CMS de un acueducto
("Acueducto El Socorro"). El HTML se edita luego en un editor visual GrapesJS y
se muestra en una web pública con TailwindCSS. DEBES cumplir estas reglas:

ESTILOS:
- Usa SOLO clases utilitarias de Tailwind, de esta paleta de color permitida:
  familias slate, gray, blue, sky, cyan, teal, green, emerald, red, amber,
  yellow; tonos 50-900; más white, black. Para acueducto prioriza azules y verdes.
- Pon estilos clave EXPLÍCITOS en CADA elemento de texto (alineación con
  text-center/text-left, color text-..., tamaño). No dependas de heredar del padre.
- PROHIBIDO bg-clip-text y text-transparent. Usa colores sólidos.
- Gradientes solo con from-<color> y to-<color> de la paleta (nunca a transparente).

ESTRUCTURA (editabilidad):
- Cada bloque de texto editable debe ser un elemento hoja (h1..h6, p, span, a)
  que contenga SOLO texto, sin íconos ni spans anidados dentro.
- Ícono + texto = dos elementos hermanos, no anidados.
- Botones: <button> o <a class="btn ...">. Imágenes: <img src="/uploads/..."> o URL https.
- NADA de <script> ni atributos onclick/on...
- Máximo ~20 niveles de anidación.

SALIDA:
- Devuelve SOLO el HTML del contenido (sin <html>, <head> ni <body>),
  envuelto en un <div> raíz.
- Diseño limpio, moderno, responsivo (usa grid/flex y breakpoints sm/md/lg).

Página a generar: [DESCRIBE AQUÍ: ej. "Inicio: hero + 3 servicios + llamado a pagar factura"]
```

---

## Cómo cargar el resultado de Gemini al sistema

1. Guarda cada página como archivo en `backend/temp/client-html/<slug>.html`
   (el nombre del archivo es el slug: `home.html`, `quienes-somos.html`, etc.).
   Para header/footer del sitio usa `_header.html` y `_footer.html`.
2. (Opcional) crea `backend/temp/client-html/pages.json` con los títulos:
   `[{ "slug": "home", "title": "Inicio" }, ...]`
3. Ejecuta:
   ```
   cd backend
   npm run import:pages     # convierte los .html al formato del seed
   npm run db:seed          # los carga en la base de datos
   ```
4. Abre `/admin`, entra al editor y verifica. Al guardar quedan como componentes
   nativos de GrapesJS (100% editables).

> Si una clase de color no aparece en público, es que está fuera de la paleta
> segura: cámbiala por una de la lista, o pídeme ampliar el `safelist`.

---

## Checklist antes de sembrar

- [ ] Cada texto tiene su `text-center`/alineación y color explícitos.
- [ ] No hay `bg-clip-text` ni `text-transparent`.
- [ ] Todos los colores son de la paleta segura.
- [ ] Los textos editables son elementos hoja (solo texto).
- [ ] No hay `<script>` ni `onclick`.
- [ ] Imágenes con `src` válido (`/uploads/...` o `https://`).
