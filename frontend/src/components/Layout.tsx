import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  headerHtml?: string;
  headerCss?: string;
  footerHtml?: string;
  footerCss?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, headerHtml, headerCss, footerHtml, footerCss }) => {
  // Cargar header/footer dinámicos si no fueron proporcionados
  const [loadedHeaderHtml, setLoadedHeaderHtml] = useState<string>('');
  const [loadedHeaderCss, setLoadedHeaderCss] = useState<string>('');
  const [loadedFooterHtml, setLoadedFooterHtml] = useState<string>('');
  const [loadedFooterCss, setLoadedFooterCss] = useState<string>('');

  // Mantener el HTML tal cual; no forzar comportamiento desde aquí
  const sanitizeTargets = (html: string) => (html || '');

  useEffect(() => {
    let cancelled = false;
    const loadHeaderFooter = async () => {
      try {
        if (!headerHtml) {
          const hRes = await fetch('/api/pages/public/_header', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
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
          const fRes = await fetch('/api/pages/public/_footer', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
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
  const effectiveHeaderCss = headerCss || loadedHeaderCss;
  const effectiveFooterHtml = footerHtml || loadedFooterHtml;
  const effectiveFooterCss = footerCss || loadedFooterCss;

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
    } catch {}
  }, [effectiveHeaderHtml]);

  // Enlaces internos del header: navegar en la misma ventana salvo que se haya configurado explícitamente "Nueva ventana"
  useEffect(() => {
    try {
      const container = document.getElementById('site-header');
      if (!container) return;
      const onClick = (ev: Event) => {
        const target = ev.target as HTMLElement | null;
        const anchor = target?.closest('a') as HTMLAnchorElement | null;
        if (!anchor) return;
        const href = anchor.getAttribute('href') || '';
        const isExternal = /^https?:\/\//i.test(href);
        const isInternal = !isExternal && href.startsWith('/');
        const dt = anchor.getAttribute('data-target');
        const tg = anchor.getAttribute('target');
        const explicitBlank = dt === '_blank' || tg === '_blank';
        if (isInternal && !explicitBlank) {
          ev.preventDefault();
          anchor.setAttribute('target', '_self');
          window.location.assign(href);
        }
      };
      container.addEventListener('click', onClick, true);
      return () => container.removeEventListener('click', onClick, true);
    } catch {}
  }, [effectiveHeaderHtml]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      {effectiveHeaderHtml ? (
        <>
          {effectiveHeaderCss && <style dangerouslySetInnerHTML={{ __html: effectiveHeaderCss }} />}
          <div id="site-header" dangerouslySetInnerHTML={{ __html: effectiveHeaderHtml }} />
        </>
      ) : (
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
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
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {effectiveFooterHtml ? (
        <>
          {effectiveFooterCss && <style dangerouslySetInnerHTML={{ __html: effectiveFooterCss }} />}
          <div id="site-footer" dangerouslySetInnerHTML={{ __html: effectiveFooterHtml }} />
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