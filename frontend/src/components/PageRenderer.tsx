import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from './Layout';

// 🔧 Declaración de tipo para checkEditorContext en window
declare global {
  interface Window {
    checkEditorContext?: () => boolean;
  }
}

// Importar todas las páginas estáticas
import HomePage from '../pages/HomePage';
import Contacto from '../pages/Contacto';
import QuienesSomos from '../pages/QuienesSomos';
import InformacionESAL from '../pages/InformacionESAL';
import Normatividad from '../pages/Normatividad';
import OperacionGestion from '../pages/OperacionGestion';
import PortalUsuario from '../pages/PortalUsuario';
import InvoicePage from '../pages/InvoicePage';
import InvoiceQuery from '../pages/InvoiceQuery';

// Mapeo de slugs a componentes estáticos (fallback)
const pageComponents: Record<string, React.ComponentType> = {
  'home': HomePage,
  'contacto': Contacto,
  'quienes-somos': QuienesSomos,
  'informacion-esal': InformacionESAL,
  'normatividad': Normatividad,
  'operacion-gestion': OperacionGestion,
  'portal-usuario': PortalUsuario,
  'invoice': InvoicePage,
  'invoice-query': InvoiceQuery,
  // Alias adicionales
  'inicio': HomePage,
  'nosotros': QuienesSomos,
  'contactanos': Contacto,
  'portal': PortalUsuario,
};

interface DynamicPageData {
  id: number;
  title: string;
  slug: string;
  publishedHtml?: string;
  publishedCss?: string;
  html?: string;
  css?: string;
  gjsHtml?: string;
  gjsCss?: string;
  content?: string;
  grapesData?: string;
}

// 🧼 Función para sanitizar scripts del editor en contenido publicado
function sanitizeEditorScripts(html: string): string {
  // Remover scripts que contengan checkEditorContext o funciones específicas del editor
  return html
    .replace(/<script[^>]*>[\s\S]*?checkEditorContext[\s\S]*?<\/script>/gi, '')
    .replace(/<script[^>]*checkEditorContext[^>]*>[\s\S]*?<\/script>/gi, '')
    // También remover scripts inline que usen checkEditorContext
    .replace(/onclick\s*=\s*["'][^"']*checkEditorContext[^"']*["']/gi, '')
    .replace(/onload\s*=\s*["'][^"']*checkEditorContext[^"']*["']/gi, '');
}

// Remover duplicados de layout incrustados en HTML dinámico de Grapes (header/footer)
function stripDuplicateLayout(html: string, slug: string): string {
  if (!html) return html;
  // No eliminar si estamos renderizando directamente las páginas especiales
  if (slug === '_header' || slug === '_footer') return html;
  try {
    return html
      // Quitar bloques <header> y <footer> completos (no codificados) del contenido dinámico
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '');
  } catch {
    return html;
  }
}

// Prefijar selectores CSS para que apliquen solo dentro del contenedor de contenido
function scopeCssToContent(css: string, containerSelector: string): string {
  if (!css) return css;
  try {
    return css.replace(/(^|\}|\{)\s*([^@}{][^{]+)\{/g, (match, p1, selectors) => {
      const trimmedSelectors = selectors.trim();
      if (!trimmedSelectors) return match;
      const scoped = trimmedSelectors.split(',').map((sel: string) => {
        const s = sel.trim();
        if (!s) return '';
        const cleanSel = s.toLowerCase();
        if (cleanSel === 'body' || cleanSel === 'html' || cleanSel === ':root' || cleanSel === '.wrapper') {
          return containerSelector;
        }
        if (s.startsWith(containerSelector)) {
          return s;
        }
        return `${containerSelector} ${s}`;
      }).join(', ');
      return `${p1} ${scoped} {`;
    });
  } catch {
    return css;
  }
}

// Detectar <style> internos y prefijar sus reglas al contenedor de contenido
function scopeInlineStylesInHtml(html: string, containerSelector: string): string {
  if (!html) return html;
  try {
    return html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, cssBlock: string) => {
      const scoped = scopeCssToContent(cssBlock || '', containerSelector);
      return `<style>${scoped}</style>`;
    });
  } catch {
    return html;
  }
}

const PageRenderer: React.FC = () => {
  const { slug = 'home' } = useParams<{ slug: string }>();
  const [dynamicPage, setDynamicPage] = useState<DynamicPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headerHtml, setHeaderHtml] = useState<string>('');
  const [headerCss, setHeaderCss] = useState<string>('');
  const [footerHtml, setFooterHtml] = useState<string>('');
  const [footerCss, setFooterCss] = useState<string>('');
  // Cache local de la última versión dinámica válida por slug
  const [cachedDynamic, setCachedDynamic] = useState<{ html: string; css: string } | null>(null);
  // Si el backend falla, se usa por defecto la última versión dinámica cacheada
  // (viene de la BD, es el diseño real del editor) en vez de saltar directo a
  // las páginas estáticas antiguas. Se puede forzar el modo estricto (nunca usar
  // cache) con VITE_STRICT_RENDER=true si algún día se necesita.
  const strictRender = (import.meta as any)?.env?.VITE_STRICT_RENDER === 'true' ? true : false;


  // Priorizar contenido dinámico desde BD; usar estático solo como fallback

  useEffect(() => {
    const loadPage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Intentar cargar desde la BD (API pública)
        console.log('🔍 [PageRenderer] Intentando cargar desde BD:', slug);
        const response = await fetch(`/api/pages/public/${slug}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📊 [PageRenderer] Respuesta API:', result);
          const page = result?.data?.page || result?.data;

          console.log('📄 [PageRenderer] Tiene HTML dinámico:', !!page?.html);
          console.log('🎨 [PageRenderer] Tiene CSS dinámico:', !!page?.css);

          if (page && (page.html || page.publishedHtml)) {
            setDynamicPage(page);
            console.log('✅ [PageRenderer] Contenido cargado desde base de datos');
            // Guardar en cache local la última versión válida
            try {
              const html = page.publishedHtml || page.html || page.gjsHtml || '';
              const css = page.publishedCss || page.css || page.gjsCss || '';
              setCachedDynamic({ html, css });
              localStorage.setItem(`page_cache_${slug}`, JSON.stringify({ html, css, ts: Date.now() }));
            } catch { }
          } else {
            console.log('📄 [PageRenderer] No hay contenido dinámico publicado');
            setDynamicPage(null);
            // Intentar usar cache local si existe
            if (!strictRender) {
              try {
                const raw = localStorage.getItem(`page_cache_${slug}`);
                if (raw) {
                  const obj = JSON.parse(raw);
                  if (obj && typeof obj.html === 'string') {
                    setCachedDynamic({ html: obj.html, css: obj.css || '' });
                  }
                }
              } catch { }
            }
          }
        } else if (response.status === 404) {
          console.log('📄 [PageRenderer] Página no encontrada en BD');
          setDynamicPage(null);
          // Intentar usar cache local si existe
          if (!strictRender) {
            try {
              const raw = localStorage.getItem(`page_cache_${slug}`);
              if (raw) {
                const obj = JSON.parse(raw);
                if (obj && typeof obj.html === 'string') {
                  setCachedDynamic({ html: obj.html, css: obj.css || '' });
                }
              }
            } catch { }
          }
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        console.error('❌ [PageRenderer] Error al cargar página:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setDynamicPage(null);
        // Intentar usar cache local si existe
        if (!strictRender) {
          try {
            const raw = localStorage.getItem(`page_cache_${slug}`);
            if (raw) {
              const obj = JSON.parse(raw);
              if (obj && typeof obj.html === 'string') {
                setCachedDynamic({ html: obj.html, css: obj.css || '' });
              }
            }
          } catch { }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  // Cargar header y footer dinámicos
  useEffect(() => {
    // Definimos función de carga independiente para no depender de estados volátiles
    const loadHeaderFooter = async () => {
      try {
        const fetchWithFallback = async (slug: string) => {
          let res = await fetch(`/api/pages/public/${slug}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
          if (!res.ok && slug.startsWith('_')) {
            res = await fetch(`/api/pages/public/${slug.substring(1)}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
          }
          // Try capitalized fallback just in case
          if (!res.ok && slug.startsWith('_')) {
            const plain = slug.substring(1);
            const capitalized = plain.charAt(0).toUpperCase() + plain.slice(1);
            res = await fetch(`/api/pages/public/${capitalized}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
          }
          return res;
        };

        const [hRes, fRes] = await Promise.all([
          fetchWithFallback('_header'),
          fetchWithFallback('_footer'),
        ]);

        if (hRes.ok) {
          const hJson = await hRes.json();
          const hPage = hJson?.data?.page || hJson?.data || {};
          const hHtml = hPage.publishedHtml || hPage.gjsHtml || hPage.html || '';
          const hCss = hPage.publishedCss || hPage.gjsCss || hPage.css || '';
          console.log('🧩 [PageRenderer] Header recibido', {
            slug: hPage.slug,
            len: hHtml.length
          });
          setHeaderHtml(hHtml);
          // Aislar CSS del header para que solo afecte #site-header
          setHeaderCss(scopeCssToContent(hCss, '#site-header'));
        }
        if (fRes.ok) {
          const fJson = await fRes.json();
          const fPage = fJson?.data?.page || fJson?.data || {};
          const fHtml = fPage.publishedHtml || fPage.gjsHtml || fPage.html || '';
          const fCss = fPage.publishedCss || fPage.gjsCss || fPage.css || '';
          console.log('🧩 [PageRenderer] Footer recibido', {
            slug: fPage.slug,
            len: fHtml.length
          });
          setFooterHtml(fHtml);
          // Aislar CSS del footer para que solo afecte #site-footer
          setFooterCss(scopeCssToContent(fCss, '#site-footer'));
        }
      } catch (e) {
        console.error('❌ [PageRenderer] Error al cargar header/footer:', e);
      }
    };
    loadHeaderFooter();
  }, [slug]);

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando página...</p>
        </div>
      </div>
    );
  }

  // Si hay error y no hay ni cache dinámico ni página estática de respaldo, mostrar error
  if (error && !(!strictRender && cachedDynamic) && !pageComponents[slug.toLowerCase()]) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Error al cargar la página</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    );
  }

  // 🎯 RENDERIZADO DE PÁGINA DINÁMICA (prioridad)
  if (dynamicPage || (!strictRender && cachedDynamic)) {
    const rawHtmlContent = dynamicPage
      ? (dynamicPage.publishedHtml || dynamicPage.html || dynamicPage.gjsHtml || '')
      : (cachedDynamic?.html || '');
    const cssContent = dynamicPage
      ? (dynamicPage.publishedCss || dynamicPage.css || dynamicPage.gjsCss || '')
      : (cachedDynamic?.css || '');

    // 🧼 Sanitizar scripts del editor antes de renderizar
    let htmlContent = sanitizeEditorScripts(rawHtmlContent);
    // Remover header/footer duplicados del contenido dinámico (layout global está en <Layout>)
    htmlContent = stripDuplicateLayout(htmlContent, slug);
    // Prefijar estilos inline del HTML para que no afecten header/footer globales
    htmlContent = scopeInlineStylesInHtml(htmlContent, '#page-content');

    console.log('🎬 [PageRenderer] Renderizando:', htmlContent ? 'DINÁMICO' : 'ESTÁTICO');
    console.log('📥 [PageRenderer] Datos recibidos de API', {
      slug: dynamicPage?.slug || slug,
      htmlPreview: htmlContent.substring(0, 50),
      cssPreview: cssContent.substring(0, 50),
      sanitized: rawHtmlContent !== htmlContent ? 'Scripts del editor removidos' : 'Sin cambios',
    });

    if (htmlContent) {
      // Componente para manejar la ejecución de scripts
      const DynamicContent: React.FC = () => {
        const contentRef = React.useRef<HTMLDivElement>(null);

        React.useEffect(() => {
          // 🚀 Ejecutar scripts después de renderizar el HTML
          if (contentRef.current) {
            // 🔧 Parche: Definir checkEditorContext para evitar errores en scripts del editor
            if (typeof window !== 'undefined' && !window.checkEditorContext) {
              window.checkEditorContext = () => false;
            }

            const scripts = contentRef.current.querySelectorAll('script');
            scripts.forEach((oldScript) => {
              const newScript = document.createElement('script');

              // Copiar atributos
              Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
              });

              // Copiar contenido
              newScript.textContent = oldScript.textContent;

              // Reemplazar el script viejo con el nuevo para que se ejecute
              oldScript.parentNode?.replaceChild(newScript, oldScript);
            });

            console.log('🎯 Scripts ejecutados en página publicada:', scripts.length);

            // ✅ Los scripts de action-button manejan la navegación, no forzar nada aquí
          }
        }, []);

        return (
          <div
            id="page-content"
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        );
      };

      return (
        <Layout headerHtml={headerHtml} headerCss={headerCss} footerHtml={footerHtml} footerCss={footerCss}>
          <link rel="stylesheet" href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" />
          {/* CSS de la página */}
          {cssContent && (
            <style dangerouslySetInnerHTML={{ __html: scopeCssToContent(cssContent, '#page-content') }} />
          )}
          {/* HTML de la página con scripts ejecutables, envuelto para scoping correcto */}
          <div className="editor-content">
            <DynamicContent />
          </div>
        </Layout>
      );
    }
  }

  // 🔄 FALLBACK: Buscar componente estático de React
  const PageComponent = pageComponents[slug.toLowerCase()];

  if (PageComponent) {
    console.log('✅ [PageRenderer] Usando componente estático de React');
    console.log('🎬 [PageRenderer] Renderizando:', 'ESTÁTICO');
    return <PageComponent />;
  }

  // 404: No se encontró ni página dinámica ni componente estático
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-6">
          La página "{slug}" no existe o no está disponible.
        </p>
        <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded">
          <strong>Páginas estáticas disponibles:</strong><br />
          {Object.keys(pageComponents).join(', ')}
        </div>
        <a
          href="/"
          className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  );
};

export default PageRenderer;