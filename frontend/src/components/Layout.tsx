import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  headerHtml?: string;
  headerCss?: string;
  footerHtml?: string;
  footerCss?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, headerHtml, headerCss, footerHtml, footerCss }) => {
  const navigate = useNavigate();
  // Cargar header/footer dinámicos si no fueron proporcionados
  const [loadedHeaderHtml, setLoadedHeaderHtml] = useState<string>('');
  const [loadedHeaderCss, setLoadedHeaderCss] = useState<string>('');
  const [loadedFooterHtml, setLoadedFooterHtml] = useState<string>('');
  const [loadedFooterCss, setLoadedFooterCss] = useState<string>('');

  // Mantener el HTML tal cual; no forzar comportamiento desde aquí
  const sanitizeTargets = (html: string) => (html || '');

  // Aislar CSS del footer/header para que solo afecte su contenedor
      const scopeCSS = (css: string, scopeId: string): string => {
    if (!css) return '';
    return css.replace(/(^|\}|\{)\s*([^@}{][^{]+)\{/g, (match, p1, selectors) => {
      const trimmedSelectors = selectors.trim();
      if (!trimmedSelectors) return match;
      const scoped = trimmedSelectors.split(',').map(sel => {
        const s = sel.trim();
        if (!s) return '';
        const cleanSel = s.toLowerCase();
        // Si es raíz, mapear al contenedor
        if (cleanSel === 'body' || cleanSel === 'html' || cleanSel === ':root' || cleanSel === '.wrapper') {
          return `#${scopeId}`;
        }
        // SI YA EMPIEZA CON EL ID, NO VOLVER A PREFIJAR NI APLASTAR
        if (s.startsWith(`#${scopeId}`)) {
          return s;
        }
        return `#${scopeId} ${s}`;
      }).join(', ');
      return `${p1} ${scoped} {`;
    });
  };

  useEffect(() => {
    let cancelled = false;
    const loadHeaderFooter = async () => {
      try {
        if (!headerHtml) {
          let hRes = await fetch('/api/pages/public/_header', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
          if (!hRes.ok) {
            // Fallback: try 'header' without underscore
            hRes = await fetch('/api/pages/public/header', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
            // Fallback 2: try 'Header' (capitalized)
            if (!hRes.ok) hRes = await fetch('/api/pages/public/Header', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
          }
          if (hRes.ok) {
            const hJson = await hRes.json();
            const hPage = hJson?.data?.page || hJson?.data || {};
            const hHtml = hPage.publishedHtml || hPage.gjsHtml || hPage.html || '';
            const hCss = hPage.publishedCss || hPage.gjsCss || hPage.css || '';
            if (!cancelled) {
              setLoadedHeaderHtml(sanitizeTargets(hHtml));
              setLoadedHeaderCss(hCss);
            }
          }
        }
        if (!footerHtml) {
          let fRes = await fetch('/api/pages/public/_footer', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
          if (!fRes.ok) {
            // Fallback: try 'footer' without underscore
            fRes = await fetch('/api/pages/public/footer', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
          }
          if (fRes.ok) {
            const fJson = await fRes.json();
            const fPage = fJson?.data?.page || fJson?.data || {};
            const fHtml = fPage.publishedHtml || fPage.gjsHtml || fPage.html || '';
            const fCss = fPage.publishedCss || fPage.gjsCss || fPage.css || '';
            if (!cancelled) {
              setLoadedFooterHtml(fHtml);
              setLoadedFooterCss(fCss);
            }
          }
        }
      } catch (e) {
        // Silenciar errores para no afectar render
      }
    };
    loadHeaderFooter();
    return () => { cancelled = true; };
  }, [headerHtml, footerHtml]);

  const effectiveHeaderHtml = sanitizeTargets(headerHtml || loadedHeaderHtml);
  const effectiveHeaderCss = scopeCSS(headerCss || loadedHeaderCss, 'site-header');
  const effectiveFooterHtml = footerHtml || loadedFooterHtml;
  const effectiveFooterCss = scopeCSS(footerCss || loadedFooterCss, 'site-footer');

  // Ajuste suave: establecer target por defecto en enlaces internos si falta
  useEffect(() => {
    try {
      const container = document.getElementById('site-header');
      if (!container) return;
      container.querySelectorAll('a').forEach((a) => {
        const href = a.getAttribute('href') || '';
        const isExternal = /^https?:\/\//i.test(href);
        const isInternal = !isExternal && href.startsWith('/');
        const hasTarget = a.hasAttribute('target') || a.hasAttribute('data-target');
        if (isInternal && !hasTarget) a.setAttribute('target', '_self');
      });
    } catch { }
  }, [effectiveHeaderHtml]);

  // Global Capture Listener to fix button/link targets
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // 1. Find closest relevant element
      const target = e.target as HTMLElement;
      const el = target.closest('a, button') as HTMLElement;
      if (!el) return;

      // 2. Identify traits
      const href = el.getAttribute('href') || el.getAttribute('data-url') || el.getAttribute('data-file-url');
      const action = el.getAttribute('data-action-type') || el.getAttribute('data-action');

      // If it's a button without explicit action 'link' (and no href), ignore unless it has href
      if (el.tagName === 'BUTTON' && !href) return;
      if (el.tagName === 'BUTTON' && action !== 'link' && !href) return;

      // 3. Determine target
      const targetAttr = el.getAttribute('data-target') || el.getAttribute('target');
      const newTabAttr = el.getAttribute('data-new-tab');
      // Logic: _blank=true, _self=false, boolean flags fallback
      let isNewTab = targetAttr === '_blank' || newTabAttr === 'true' || newTabAttr === '1';

      // Explicit _self override (Critical fix)
      if (targetAttr === '_self') isNewTab = false;

      // HANDLE DOWNLOAD ACTION
      if (action === 'download' && href) {
        e.preventDefault();
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = href;
        link.download = ''; // Force download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // 4. Force behavior ONLY for external or explicitly handled links
      if (href) {
        const isExternal = /^https?:\/\//i.test(href);
        const isAnchor = href.startsWith('#');
        const isMailtoCall = /^(mailto|tel):/i.test(href);

        // Si es un enlace interno (SPA) o un botón GrapesJS
        if (!isExternal && !isAnchor && !isMailtoCall && action !== 'download') {
          // Normalizar href para navegación interna
          let targetPath = href || '/';
          if (!targetPath.startsWith('/') && !targetPath.includes('://')) {
            targetPath = '/' + targetPath;
          }

          console.log('🚀 [Layout] SPA Intercept:', { href, targetPath, isNewTab });

          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          if (isNewTab) {
            window.open(targetPath, '_blank');
          } else {
            navigate(targetPath);
          }
          return;
        }

        // Stop default behavior and propagation para links externos mapeados por GrapesJS
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (isNewTab) {
          console.log('🚀 [Layout] Opening in new tab:', href);
          window.open(href, '_blank');
        } else {
          console.log('🚀 [Layout] Forcing navigation in same tab:', href);
          window.location.href = href;
        }
      }
    };

    // Use Capture phase to intercept before GrapesJS/React listeners
    window.addEventListener('click', handleGlobalClick, true);
    return () => window.removeEventListener('click', handleGlobalClick, true);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      {effectiveHeaderHtml ? (
        <>
          {effectiveHeaderCss && <style dangerouslySetInnerHTML={{ __html: effectiveHeaderCss }} />}
          <div id="site-header" className="relative w-full z-50 shrink-0" dangerouslySetInnerHTML={{ __html: effectiveHeaderHtml }} />
        </>
      ) : (
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 flex-none z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Acueducto Municipal
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Inicio
                  </Link>
                  <Link
                    to="/quienes-somos"
                    className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Quiénes Somos
                  </Link>
                  <Link
                    to="/informacion-esal"
                    className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Información ESAL
                  </Link>
                  <Link
                    to="/operacion-gestion"
                    className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Operación y Gestión
                  </Link>
                  <Link
                    to="/portal-usuario"
                    className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Portal Usuario
                  </Link>
                  <Link
                    to="/normatividad"
                    className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Normatividad
                  </Link>
                  <Link
                    to="/contacto"
                    className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                  >
                    Contacto
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-grow w-full relative z-10 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      {effectiveFooterHtml ? (
        <>
          {effectiveFooterCss && <style dangerouslySetInnerHTML={{ __html: effectiveFooterCss }} />}
          <footer id="site-footer" className="relative w-full z-40 flex-none mt-auto" dangerouslySetInnerHTML={{ __html: effectiveFooterHtml }} />
        </>
      ) : (
        <footer className="bg-gradient-to-r from-blue-900 to-green-900 text-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-200 to-green-200 bg-clip-text text-transparent">
                  Acueducto Municipal
                </h3>
                <p className="text-blue-100">
                  Comprometidos con brindar servicios de agua potable de calidad para nuestra comunidad,
                  garantizando el acceso continuo y confiable al recurso hídrico.
                </p>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-4 text-green-200">Servicios</h4>
                <ul className="space-y-2">
                  <li>
                    <Link to="/portal-usuario" className="text-blue-100 hover:text-white transition-colors">
                      Portal Usuario
                    </Link>
                  </li>
                  <li>
                    <Link to="/quienes-somos" className="text-blue-100 hover:text-white transition-colors">
                      Quiénes Somos
                    </Link>
                  </li>
                  <li>
                    <Link to="/contacto" className="text-blue-100 hover:text-white transition-colors">
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-4 text-green-200">Información</h4>
                <ul className="space-y-2">
                  <li>
                    <Link to="/informacion-esal" className="text-blue-100 hover:text-white transition-colors">
                      Información ESAL
                    </Link>
                  </li>
                  <li>
                    <Link to="/operacion-gestion" className="text-blue-100 hover:text-white transition-colors">
                      Operación y Gestión
                    </Link>
                  </li>
                  <li>
                    <Link to="/normatividad" className="text-blue-100 hover:text-white transition-colors">
                      Normatividad
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-blue-800">
              <p className="text-center text-blue-200">
                © 2024 Acueducto Municipal. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;