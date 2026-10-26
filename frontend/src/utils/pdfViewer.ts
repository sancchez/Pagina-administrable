// Visor de PDF propio para el componente 'pdf-viewer' del editor (GrapesJS).
//
// Antes se usaba un <iframe> con el visor nativo del navegador. Eso fallaba en
// el sitio público: en tarjetas angostas Chrome oculta su barra (sin zoom ni
// descarga), los celulares no muestran PDFs dentro de un iframe y el tamaño
// guardado desde el editor (alto fijo, anchos en % mal calculados) desbordaba
// la tarjeta. Aquí el PDF se dibuja con PDF.js, igual en todos los navegadores:
// - Tarjeta: miniatura de la primera página + botones "Ver" y "Descargar".
// - Visor ampliado: pantalla completa con todas las páginas y zoom propio.
// El mismo módulo lo usan el editor (vista previa) y PageRenderer (público),
// así lo que se ve en el editor es lo que se ve publicado.

type PdfjsLib = typeof import('pdfjs-dist');
type PdfDocument = Awaited<ReturnType<PdfjsLib['getDocument']>['promise']>;

let pdfjsPromise: Promise<PdfjsLib> | null = null;
const docCache = new Map<string, Promise<PdfDocument>>();
const thumbCache = new Map<string, Promise<{ src: string; ratio: number }>>();

const THUMB_WIDTH = 800;
const MAX_CANVAS_PIXELS = 16_000_000;

function loadPdfjs(): Promise<PdfjsLib> {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([
      import('pdfjs-dist/legacy/build/pdf.mjs'),
      import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
    ])
      .then(([lib, worker]) => {
        const pdfjs = lib as unknown as PdfjsLib;
        pdfjs.GlobalWorkerOptions.workerSrc = (worker as { default: string }).default;
        return pdfjs;
      })
      .catch((e) => {
        pdfjsPromise = null;
        throw e;
      });
  }
  return pdfjsPromise;
}

function getPdfDocument(url: string): Promise<PdfDocument> {
  let cached = docCache.get(url);
  if (!cached) {
    cached = loadPdfjs().then((pdfjs) =>
      pdfjs.getDocument({ url, isEvalSupported: false, disableAutoFetch: true }).promise
    );
    cached.catch(() => docCache.delete(url));
    docCache.set(url, cached);
  }
  return cached;
}

// Convierte el data-src guardado en una URL absoluta y codificada.
// new URL() codifica espacios y caracteres como "°" igual que el nombre en disco.
export function resolvePdfUrl(src: string): string {
  const clean = (src || '').trim().split('#')[0];
  if (!clean) return '';
  if (/%[0-9a-f]{2}/i.test(clean)) return clean;
  try {
    return new URL(clean, window.location.origin).href;
  } catch {
    return clean;
  }
}

// Archivos subidos antes del fix de nombres quedaron como "NÂ°" (UTF-8 leído
// como latin1). Si todos los caracteres caben en un byte, se intenta recuperar.
function fixMojibake(text: string): string {
  if (!/[ÂÃ]/.test(text) || /[^\u0000-ÿ]/.test(text)) return text;
  try {
    const bytes = Uint8Array.from(text, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return text;
  }
}

export function pdfDisplayName(src: string, title?: string | null): string {
  if (title && title.trim()) return title.trim();
  let file = (src || '').split('#')[0].split('?')[0].split('/').pop() || '';
  try {
    file = decodeURIComponent(file);
  } catch {
    /* nombre sin codificar */
  }
  const name = fixMojibake(file)
    .replace(/\.pdf$/i, '')
    .replace(/_\d{13}_[0-9a-f]{8}$/i, '')
    .replace(/_+/g, ' ')
    .trim();
  return name || 'Documento PDF';
}

// Normaliza el ancho escrito en el trait: "300" -> "300px".
export function normalizeCssSize(value: string): string {
  const v = String(value ?? '').trim();
  return /^\d+(\.\d+)?$/.test(v) ? `${v}px` : v;
}

const STYLES = `
.pdf-viewer-component{height:auto!important;min-height:0!important;max-width:100%!important;box-sizing:border-box;overflow:visible!important}
.pdfv{display:flex;flex-direction:column;width:100%;box-sizing:border-box;border:1px solid #e2e8f0;border-radius:8px;background:#fff;overflow:hidden;font-family:inherit;text-align:left}
.pdfv-preview{position:relative;display:block;width:100%;margin:0;padding:0;border:0;border-radius:0;background:#f1f5f9;cursor:zoom-in;aspect-ratio:var(--pdfv-ratio,0.7071)}
.pdfv-preview img{display:block;width:100%;height:100%;object-fit:contain;margin:0}
.pdfv-status{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px;color:#64748b;font-size:13px;text-align:center}
.pdfv-status b{font-size:28px;line-height:1}
.pdfv-hint{position:absolute;right:8px;bottom:8px;padding:4px 8px;border-radius:999px;background:rgba(15,23,42,.75);color:#fff;font-size:12px;opacity:0;transition:opacity .15s;pointer-events:none}
.pdfv-preview:hover .pdfv-hint,.pdfv-preview:focus-visible .pdfv-hint{opacity:1}
@media (hover:none){.pdfv-hint{opacity:1}}
.pdfv-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px;border-top:1px solid #e2e8f0}
.pdfv-title{flex:1 1 100%;margin:0;color:#1e293b!important;font-size:13px;font-weight:600;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:break-word}
.pdfv .pdfv-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:4px;min-height:36px;margin:0;padding:6px 10px;border:1px solid #1d4ed8!important;border-radius:6px;font-size:13px;font-weight:600;line-height:1;text-decoration:none!important;white-space:nowrap;cursor:pointer;box-sizing:border-box}
.pdfv .pdfv-btn--primary{background:#1d4ed8!important;color:#fff!important}
.pdfv .pdfv-btn--ghost{background:#fff!important;color:#1d4ed8!important}
.pdfv--editor .pdfv-preview,.pdfv--editor .pdfv-btn{pointer-events:none}
.pdfv-lb{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;background:rgba(15,23,42,.94);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.pdfv-lb-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 12px;background:#0f172a;color:#fff}
.pdfv-lb-title{flex:1 1 180px;min-width:0;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pdfv-lb-tools{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.pdfv-lb-btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;min-width:36px;height:36px;padding:0 10px;border:1px solid rgba(255,255,255,.25);border-radius:6px;background:rgba(255,255,255,.08);color:#fff!important;font-size:14px;text-decoration:none!important;cursor:pointer;box-sizing:border-box}
.pdfv-lb-btn:hover{background:rgba(255,255,255,.18)}
.pdfv-lb-zoom{min-width:48px;color:#cbd5e1;font-size:13px;text-align:center}
.pdfv-lb-body{flex:1;overflow:auto;padding:16px;-webkit-overflow-scrolling:touch}
.pdfv-lb-pages{width:max-content;min-width:100%}
.pdfv-lb-page{position:relative;margin:0 auto 12px;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.4)}
.pdfv-lb-page canvas{display:block;width:100%;height:100%}
.pdfv-lb-msg{padding:40px 16px;color:#e2e8f0;text-align:center;font-size:15px}
@media (max-width:640px){.pdfv-lbl{display:none}.pdfv-lb-body{padding:8px}}
`;

export function ensurePdfViewerStyles(doc: Document): void {
  if (doc.getElementById('pdfv-styles')) return;
  const style = doc.createElement('style');
  style.id = 'pdfv-styles';
  style.textContent = STYLES;
  (doc.head || doc.documentElement).appendChild(style);
}

function getPdfThumbnail(url: string): Promise<{ src: string; ratio: number }> {
  let cached = thumbCache.get(url);
  if (!cached) {
    cached = getPdfDocument(url).then(async (pdf) => {
      const page = await pdf.getPage(1);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: THUMB_WIDTH / base.width });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas no disponible');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      // data: (no blob:) porque la CSP del backend solo permite img-src 'self' data: https:
      return { src: canvas.toDataURL('image/jpeg', 0.85), ratio: base.width / base.height };
    });
    cached.catch(() => thumbCache.delete(url));
    thumbCache.set(url, cached);
  }
  return cached;
}

function el<K extends keyof HTMLElementTagNameMap>(
  doc: Document,
  tag: K,
  className: string,
  html?: string
): HTMLElementTagNameMap[K] {
  const node = doc.createElement(tag);
  node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Construye la tarjeta (miniatura + título + botones) dentro de `host`.
// interactive=false se usa en el canvas del editor: se ve igual pero no reacciona a clics.
export function mountPdfCard(
  host: HTMLElement,
  src: string,
  title: string,
  { interactive }: { interactive: boolean }
): void {
  const doc = host.ownerDocument;
  ensurePdfViewerStyles(doc);
  const url = resolvePdfUrl(src);
  const name = pdfDisplayName(src, title);

  const card = el(doc, 'div', interactive ? 'pdfv' : 'pdfv pdfv--editor');
  const preview = el(doc, interactive ? 'button' : 'div', 'pdfv-preview');
  if (interactive) (preview as HTMLButtonElement).type = 'button';
  preview.setAttribute('aria-label', `Ver ${name}`);
  const status = el(doc, 'div', 'pdfv-status', '<b>📄</b><span>Cargando vista previa…</span>');
  preview.append(status, el(doc, 'span', 'pdfv-hint', '🔍 Ampliar'));

  const bar = el(doc, 'div', 'pdfv-bar');
  const titleEl = el(doc, 'p', 'pdfv-title');
  titleEl.textContent = name;
  titleEl.title = name;
  const viewBtn = el(doc, 'button', 'pdfv-btn pdfv-btn--primary', '👁 Ver');
  viewBtn.type = 'button';
  const download = el(doc, 'a', 'pdfv-btn pdfv-btn--ghost', '⬇ Descargar');
  download.href = url;
  download.setAttribute('download', `${name}.pdf`);
  download.rel = 'noopener';
  bar.append(titleEl, viewBtn, download);
  card.append(preview, bar);
  host.replaceChildren(card);

  if (interactive) {
    const open = () => openPdfLightbox(src, title);
    preview.addEventListener('click', open);
    viewBtn.addEventListener('click', open);
  }

  // Contenedor que limita al visor: en el editor la tarjeta va dentro de un
  // envoltorio extra, así que se sube hasta el padre de .pdf-viewer-component.
  const outerParent = () => (host.closest('.pdf-viewer-component') || host).parentElement;

  // Si el contenedor tiene un alto fijo (p. ej. la tarjeta de la home con
  // height:439px puesto por clase desde el editor), la miniatura se achica
  // para no desbordarlo. Con alto automático no hay desborde y no cambia nada.
  const fitToParent = () => {
    const parent = outerParent();
    if (!parent || !card.isConnected) return;
    preview.style.removeProperty('height');
    preview.style.removeProperty('aspect-ratio');
    const view = parent.ownerDocument.defaultView || window;
    const limit = parent.getBoundingClientRect().bottom - parseFloat(view.getComputedStyle(parent).paddingBottom || '0');
    const overflow = card.getBoundingClientRect().bottom - limit;
    if (overflow > 1) {
      const height = Math.max(120, preview.getBoundingClientRect().height - overflow);
      preview.style.setProperty('aspect-ratio', 'auto');
      preview.style.setProperty('height', `${Math.floor(height)}px`);
    }
  };
  // Reajustar cuando cambie el ancho del contenedor (ventana, o el canvas del
  // editor que se redimensiona después de cargar). Se observa desde la ventana
  // del documento donde vive la tarjeta en ese momento (en el editor, el iframe).
  const watchSize = () => {
    const win = card.ownerDocument.defaultView;
    const parent = outerParent();
    if (!win || !parent || !('ResizeObserver' in win)) return;
    let lastWidth = -1;
    const ro = new win.ResizeObserver(() => {
      if (!card.isConnected) return ro.disconnect();
      const width = Math.round(parent.getBoundingClientRect().width);
      if (width === lastWidth) return;
      lastWidth = width;
      fitToParent();
    });
    ro.observe(parent);
  };

  const load = () =>
    getPdfThumbnail(url)
      .then(({ src: dataUrl, ratio }) => {
        const img = doc.createElement('img');
        img.alt = `Primera página de ${name}`;
        img.src = dataUrl;
        preview.style.setProperty('--pdfv-ratio', String(ratio));
        status.replaceWith(img);
        fitToParent();
      })
      .catch((e) => {
        console.warn('[pdfViewer] No se pudo generar la vista previa', url, e);
        status.innerHTML = '<b>📄</b><span>Vista previa no disponible</span>';
        fitToParent();
      });

  // Ajustar ya desde el estado "Cargando…" (no solo cuando llega la miniatura).
  // Un frame después: en el editor la tarjeta aún no está dentro del canvas.
  requestAnimationFrame(() => {
    fitToParent();
    watchSize();
  });

  // Miniatura solo cuando la tarjeta se acerca a la pantalla (la home tiene varias).
  const IO = doc.defaultView?.IntersectionObserver;
  if (!IO || !interactive) {
    load();
    return;
  }
  const io = new IO(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        load();
      }
    },
    { rootMargin: '300px 0px' }
  );
  io.observe(card);
}

// Reemplaza el contenido publicado de cada .pdf-viewer-component (iframe viejo
// o enlace de respaldo) por la tarjeta interactiva.
export function hydratePdfViewers(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('.pdf-viewer-component').forEach((host) => {
    if (host.dataset.pdfvReady) return;
    host.dataset.pdfvReady = '1';
    const src = host.getAttribute('data-src') || host.querySelector('iframe')?.getAttribute('src') || '';
    if (!src.trim()) {
      host.replaceChildren();
      return;
    }
    mountPdfCard(host, src, host.getAttribute('data-title') || '', { interactive: true });
  });
}

// Visor a pantalla completa: todas las páginas con PDF.js, zoom propio,
// descarga y opción de abrir en el visor del navegador.
export function openPdfLightbox(src: string, title?: string): void {
  const doc = document;
  ensurePdfViewerStyles(doc);
  const url = resolvePdfUrl(src);
  const name = pdfDisplayName(src, title);

  const overlay = el(doc, 'div', 'pdfv-lb');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', name);
  overlay.innerHTML = `
    <div class="pdfv-lb-top">
      <div class="pdfv-lb-title"></div>
      <div class="pdfv-lb-tools">
        <span class="pdfv-lb-zoom pdfv-lb-pageno" aria-live="polite">–</span>
        <button type="button" class="pdfv-lb-btn" data-act="out" aria-label="Alejar">−</button>
        <span class="pdfv-lb-zoom">–</span>
        <button type="button" class="pdfv-lb-btn" data-act="in" aria-label="Acercar">+</button>
        <button type="button" class="pdfv-lb-btn" data-act="fit" aria-label="Ajustar al ancho">↔<span class="pdfv-lbl"> Ajustar</span></button>
        <a class="pdfv-lb-btn" data-act="download" aria-label="Descargar">⬇<span class="pdfv-lbl"> Descargar</span></a>
        <a class="pdfv-lb-btn" data-act="tab" target="_blank" rel="noopener" aria-label="Abrir en pestaña nueva">↗<span class="pdfv-lbl"> Pestaña nueva</span></a>
        <button type="button" class="pdfv-lb-btn" data-act="close" aria-label="Cerrar">✕</button>
      </div>
    </div>
    <div class="pdfv-lb-body"><div class="pdfv-lb-pages"><div class="pdfv-lb-msg">Cargando documento…</div></div></div>`;
  const q = <T extends HTMLElement>(sel: string) => overlay.querySelector(sel) as T;
  q('.pdfv-lb-title').textContent = name;
  const downloadA = q<HTMLAnchorElement>('[data-act="download"]');
  downloadA.href = url;
  downloadA.setAttribute('download', `${name}.pdf`);
  q<HTMLAnchorElement>('[data-act="tab"]').href = url;
  const zoomLabel = q('[data-act="out"] + .pdfv-lb-zoom');
  const pageLabel = q('.pdfv-lb-pageno');
  const body = q('.pdfv-lb-body');
  const pages = q('.pdfv-lb-pages');

  // Ancho real de la pantalla. Si algo de la página se desborda (p. ej. un
  // header con ancho fijo), en celulares un position:fixed mide el ancho del
  // contenido y no el de la pantalla; por eso se fija a mano.
  const screenWidth = () =>
    Math.min(doc.documentElement.clientWidth || Infinity, window.visualViewport?.width || Infinity, window.innerWidth);
  const fitOverlay = () => {
    overlay.style.width = `${screenWidth()}px`;
    overlay.style.right = 'auto';
  };
  fitOverlay();

  const prevOverflow = doc.body.style.overflow;
  doc.body.style.overflow = 'hidden';
  doc.body.appendChild(overlay);
  q<HTMLButtonElement>('[data-act="close"]').focus();

  type Slot = { num: number; box: HTMLDivElement; w: number; h: number; rendered: number; task?: { cancel(): void } };
  let closed = false;
  let pdf: PdfDocument | null = null;
  let fitScale = 1;
  let scale = 1;
  let slots: Slot[] = [];
  let observer: IntersectionObserver | null = null;
  const visible = new Set<Slot>();

  const close = () => {
    if (closed) return;
    closed = true;
    observer?.disconnect();
    slots.forEach((s) => s.task?.cancel());
    doc.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    overlay.remove();
    doc.body.style.overflow = prevOverflow;
  };

  const sizeSlot = (slot: Slot) => {
    slot.box.style.width = `${Math.floor(slot.w * scale)}px`;
    slot.box.style.height = `${Math.floor(slot.h * scale)}px`;
  };

  const renderSlot = async (slot: Slot) => {
    if (!pdf || slot.rendered === scale) return;
    const target = scale;
    slot.task?.cancel();
    const page = await pdf.getPage(slot.num);
    if (closed || target !== scale) return;
    const base = page.getViewport({ scale: 1 });
    if (base.width !== slot.w || base.height !== slot.h) {
      slot.w = base.width;
      slot.h = base.height;
      sizeSlot(slot);
    }
    const viewport = page.getViewport({ scale: target });
    let ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (viewport.width * viewport.height * ratio * ratio > MAX_CANVAS_PIXELS) {
      ratio = Math.sqrt(MAX_CANVAS_PIXELS / (viewport.width * viewport.height));
    }
    const canvas = doc.createElement('canvas');
    canvas.width = Math.floor(viewport.width * ratio);
    canvas.height = Math.floor(viewport.height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const task = page.render({
      canvasContext: ctx,
      viewport,
      transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined,
    });
    slot.task = task;
    try {
      await task.promise;
    } catch {
      return; // cancelado por zoom o cierre
    }
    if (closed || target !== scale) return;
    slot.box.replaceChildren(canvas);
    slot.rendered = target;
  };

  const setScale = (next: number) => {
    if (!pdf) return;
    next = Math.min(Math.max(next, fitScale * 0.5), 5);
    const anchor = body.scrollHeight ? body.scrollTop / body.scrollHeight : 0;
    scale = next;
    zoomLabel.textContent = `${Math.round((scale / fitScale) * 100)}%`;
    slots.forEach(sizeSlot);
    body.scrollTop = anchor * body.scrollHeight;
    visible.forEach((s) => renderSlot(s));
  };

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
    else if (e.key === '+' || e.key === '=') setScale(scale * 1.25);
    else if (e.key === '-') setScale(scale / 1.25);
  }
  doc.addEventListener('keydown', onKey);

  // "Página X / N": la página que ocupa el tercio superior de la vista.
  let labelFrame = 0;
  function updatePageLabel() {
    labelFrame = 0;
    if (!slots.length) return;
    const probe = body.getBoundingClientRect().top + body.clientHeight / 3;
    let current = slots[0];
    for (const slot of slots) {
      if (slot.box.getBoundingClientRect().top <= probe) current = slot;
      else break;
    }
    pageLabel.textContent = `${current.num} / ${slots.length}`;
  }
  body.addEventListener('scroll', () => {
    if (!labelFrame) labelFrame = requestAnimationFrame(updatePageLabel);
  }, { passive: true });

  const computeFitScale = (pageWidth: number) => {
    const available = Math.min(body.clientWidth - 32, 1000);
    return Math.max(available, 200) / pageWidth;
  };
  // Al girar el celular o cambiar el tamaño de la ventana se reajusta; si el
  // usuario estaba en "ajustar al ancho" (100%) se mantiene ajustado.
  function onResize() {
    fitOverlay();
    if (!pdf || !slots.length) return;
    const wasFit = Math.abs(scale - fitScale) < 1e-6;
    const relative = scale / fitScale;
    fitScale = computeFitScale(slots[0].w);
    setScale(wasFit ? fitScale : fitScale * relative);
  }
  window.addEventListener('resize', onResize);

  overlay.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const act = target.closest<HTMLElement>('[data-act]')?.dataset.act;
    if (act === 'close') close();
    else if (act === 'in') setScale(scale * 1.25);
    else if (act === 'out') setScale(scale / 1.25);
    else if (act === 'fit') setScale(fitScale);
    else if (target === body || target === pages) close(); // clic en el fondo oscuro
  });

  const showError = () => {
    pages.innerHTML = `<div class="pdfv-lb-msg">No se pudo mostrar "${escapeHtml(name)}" aquí.<br><br>
      <a class="pdfv-lb-btn" href="${escapeHtml(url)}" target="_blank" rel="noopener">↗ Abrir en pestaña nueva</a></div>`;
  };

  getPdfDocument(url)
    .then(async (doc_) => {
      if (closed) return;
      pdf = doc_;
      const first = (await pdf.getPage(1)).getViewport({ scale: 1 });
      fitScale = computeFitScale(first.width);
      scale = fitScale;
      zoomLabel.textContent = '100%';
      pages.replaceChildren();
      slots = Array.from({ length: pdf.numPages }, (_, i) => {
        const box = doc.createElement('div');
        box.className = 'pdfv-lb-page';
        box.setAttribute('aria-label', `Página ${i + 1}`);
        const slot: Slot = { num: i + 1, box, w: first.width, h: first.height, rendered: 0 };
        sizeSlot(slot);
        pages.appendChild(box);
        return slot;
      });
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const slot = slots.find((s) => s.box === entry.target);
            if (!slot) return;
            if (entry.isIntersecting) {
              visible.add(slot);
              renderSlot(slot);
            } else {
              visible.delete(slot);
              // Liberar páginas lejanas: en PDFs largos con zoom los canvas
              // acumulados agotan la memoria del celular.
              slot.task?.cancel();
              slot.box.replaceChildren();
              slot.rendered = 0;
            }
          });
        },
        { root: body, rootMargin: '800px 0px' }
      );
      slots.forEach((s) => observer!.observe(s.box));
      updatePageLabel();
    })
    .catch((e) => {
      console.warn('[pdfViewer] No se pudo abrir el PDF', url, e);
      if (!closed) showError();
    });
}
