/**
 * Páginas semilla para el cliente "Acueducto El Socorro".
 *
 * Como la web del cliente está caída (sin referencia), se crea un sitio base
 * decente y 100% administrable. Todas las páginas son dinámicas y editables
 * desde el editor (/admin).
 *
 * IMPORTANTE sobre estilos:
 *  - Se evitan `bg-clip-text text-transparent` y gradientes con tonos poco
 *    comunes (p.ej. teal) porque el build de Tailwind del front PURGA clases
 *    no usadas en el código → en la página real esas clases no existen y el
 *    texto queda invisible / el gradiente se desvanece a blanco.
 *  - Se usan colores SÓLIDOS y clases comunes (blue, white, gray, text-center).
 *  - `text-center` se pone EXPLÍCITO en cada elemento de texto (no solo en el
 *    contenedor) para que el centrado no se pierda al editar en GrapesJS, que
 *    trata cada elemento como un componente independiente.
 *
 * Convenciones de datos:
 *  - _header / _footer: páginas especiales (se siembran con html + gjsHtml).
 *  - Resto: páginas normales (gjsHtml editable + publishedHtml para el público).
 */

export const BRAND = 'Acueducto El Socorro';

export interface SeedPage {
  kind: 'special' | 'page';
  slug: string;
  title: string;
  html: string;
}

const header = `<header class="bg-white shadow-sm border-b border-gray-200">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <a href="/" class="flex items-center gap-2">
        <span class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white text-lg">💧</span>
        <span class="text-xl font-bold text-blue-700">Acueducto El Socorro</span>
      </a>
      <div class="hidden sm:flex sm:items-center sm:space-x-6">
        <a href="/" class="text-gray-700 hover:text-blue-700 text-sm font-medium">Inicio</a>
        <a href="/quienes-somos" class="text-gray-700 hover:text-blue-700 text-sm font-medium">Quiénes Somos</a>
        <a href="/portal-usuario" class="text-gray-700 hover:text-blue-700 text-sm font-medium">Portal Usuario</a>
        <a href="/contacto" class="text-gray-700 hover:text-blue-700 text-sm font-medium">Contacto</a>
        <a href="/portal-usuario" class="btn-pagar inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Pagar factura</a>
      </div>
    </div>
  </nav>
</header>`;

const footer = `<footer class="bg-blue-900 text-white">
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="md:col-span-2">
        <h3 class="text-lg font-semibold mb-4 text-white">Acueducto El Socorro</h3>
        <p class="text-blue-100 max-w-md">Comprometidos con el suministro de agua potable de calidad para la comunidad de El Socorro, garantizando un servicio continuo, confiable y transparente.</p>
      </div>
      <div>
        <h4 class="text-md font-semibold mb-4 text-blue-200">Servicios</h4>
        <ul class="space-y-2">
          <li><a href="/portal-usuario" class="text-blue-100 hover:text-white">Portal Usuario</a></li>
          <li><a href="/quienes-somos" class="text-blue-100 hover:text-white">Quiénes Somos</a></li>
          <li><a href="/contacto" class="text-blue-100 hover:text-white">Contacto</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-md font-semibold mb-4 text-blue-200">Contacto</h4>
        <ul class="space-y-2 text-blue-100">
          <li>📍 Carrera 5 #10-20, El Socorro</li>
          <li>📞 (607) 000 0000</li>
          <li>✉️ info@elsocorro.com</li>
        </ul>
      </div>
    </div>
    <div class="mt-8 pt-8 border-t border-blue-800">
      <p class="text-center text-blue-200">© 2026 Acueducto El Socorro. Todos los derechos reservados.</p>
    </div>
  </div>
</footer>`;

const home = `<div class="bg-white">
  <section class="bg-blue-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <h1 class="text-4xl sm:text-5xl font-bold text-white text-center mb-4">Agua potable de calidad para El Socorro</h1>
      <p class="text-lg sm:text-xl text-blue-50 text-center max-w-2xl mx-auto mb-8">Servicio continuo, confiable y transparente para toda nuestra comunidad. Gestiona tus facturas y solicitudes en línea.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/portal-usuario" class="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50">Ingresar al portal</a>
        <a href="/contacto" class="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white text-white font-semibold hover:bg-blue-700">Contáctanos</a>
      </div>
    </div>
  </section>

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">Nuestros servicios</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="p-6 rounded-xl border border-gray-200 text-center">
        <div class="text-4xl mb-3 text-center">💧</div>
        <h3 class="text-xl font-semibold text-gray-800 text-center mb-2">Suministro de agua</h3>
        <p class="text-gray-600 text-center">Agua potable tratada y monitoreada para garantizar la salud de la comunidad.</p>
      </div>
      <div class="p-6 rounded-xl border border-gray-200 text-center">
        <div class="text-4xl mb-3 text-center">🧾</div>
        <h3 class="text-xl font-semibold text-gray-800 text-center mb-2">Facturación en línea</h3>
        <p class="text-gray-600 text-center">Consulta y paga tus facturas desde el portal de usuario, sin filas ni desplazamientos.</p>
      </div>
      <div class="p-6 rounded-xl border border-gray-200 text-center">
        <div class="text-4xl mb-3 text-center">📝</div>
        <h3 class="text-xl font-semibold text-gray-800 text-center mb-2">PQR</h3>
        <p class="text-gray-600 text-center">Radica peticiones, quejas y reclamos y haz seguimiento a su estado en línea.</p>
      </div>
    </div>
  </section>

  <section class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h2 class="text-3xl font-bold text-gray-800 text-center mb-4">¿Tienes una solicitud?</h2>
      <p class="text-gray-600 text-center max-w-2xl mx-auto mb-8">Nuestro equipo está listo para ayudarte con tu servicio de acueducto.</p>
      <a href="/contacto" class="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Ir a contacto</a>
    </div>
  </section>
</div>`;

const quienesSomos = `<div class="bg-white">
  <section class="bg-blue-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 class="text-4xl font-bold text-white mb-2">Quiénes Somos</h1>
      <p class="text-blue-50 text-lg">Conoce al Acueducto El Socorro</p>
    </div>
  </section>
  <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
    <div>
      <h2 class="text-2xl font-bold text-gray-800 mb-3">Nuestra historia</h2>
      <p class="text-gray-600 leading-relaxed">El Acueducto El Socorro es una entidad comprometida con el suministro de agua potable para la comunidad. Durante años hemos trabajado para garantizar el acceso continuo y confiable al recurso hídrico, modernizando nuestra infraestructura y nuestros servicios al usuario.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="p-6 rounded-xl bg-blue-50 border border-blue-100">
        <h3 class="text-xl font-semibold text-blue-800 mb-2">Misión</h3>
        <p class="text-gray-600">Suministrar agua potable de calidad de forma continua y sostenible, contribuyendo al bienestar y desarrollo de la comunidad de El Socorro.</p>
      </div>
      <div class="p-6 rounded-xl bg-blue-50 border border-blue-100">
        <h3 class="text-xl font-semibold text-blue-800 mb-2">Visión</h3>
        <p class="text-gray-600">Ser un acueducto modelo en la región, reconocido por la calidad de su servicio, su transparencia y su compromiso ambiental.</p>
      </div>
    </div>
  </section>
</div>`;

const contacto = `<div class="bg-white">
  <section class="bg-blue-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 class="text-4xl font-bold text-white mb-2">Contacto</h1>
      <p class="text-blue-50 text-lg">Estamos para ayudarte</p>
    </div>
  </section>
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">Datos de contacto</h2>
      <ul class="space-y-4 text-gray-700">
        <li class="flex items-start gap-3"><span class="text-2xl">📍</span><span>Carrera 5 #10-20, El Socorro</span></li>
        <li class="flex items-start gap-3"><span class="text-2xl">📞</span><span>(607) 000 0000</span></li>
        <li class="flex items-start gap-3"><span class="text-2xl">✉️</span><span>info@elsocorro.com</span></li>
        <li class="flex items-start gap-3"><span class="text-2xl">🕐</span><span>Lunes a viernes, 8:00 a.m. - 5:00 p.m.</span></li>
      </ul>
    </div>
    <div class="p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Escríbenos</h2>
      <form class="space-y-4">
        <input type="text" placeholder="Nombre completo" class="w-full px-4 py-2 rounded-lg border border-gray-300" />
        <input type="email" placeholder="Correo electrónico" class="w-full px-4 py-2 rounded-lg border border-gray-300" />
        <textarea placeholder="Tu mensaje" rows="4" class="w-full px-4 py-2 rounded-lg border border-gray-300"></textarea>
        <button type="submit" class="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Enviar mensaje</button>
      </form>
    </div>
  </section>
</div>`;

const portalUsuario = `<div class="bg-white">
  <section class="bg-blue-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 class="text-4xl font-bold text-white mb-2">Portal Usuario</h1>
      <p class="text-blue-50 text-lg">Gestiona tu servicio en línea</p>
    </div>
  </section>
  <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="p-6 rounded-xl border border-gray-200 text-center">
        <div class="text-4xl mb-3 text-center">🧾</div>
        <h3 class="text-xl font-semibold text-gray-800 text-center mb-2">Mis facturas</h3>
        <p class="text-gray-600 text-center mb-4">Consulta y descarga tus facturas y paga en línea.</p>
      </div>
      <div class="p-6 rounded-xl border border-gray-200 text-center">
        <div class="text-4xl mb-3 text-center">📝</div>
        <h3 class="text-xl font-semibold text-gray-800 text-center mb-2">Radicar PQR</h3>
        <p class="text-gray-600 text-center mb-4">Envía peticiones, quejas o reclamos y haz seguimiento.</p>
      </div>
      <div class="p-6 rounded-xl border border-gray-200 text-center">
        <div class="text-4xl mb-3 text-center">📊</div>
        <h3 class="text-xl font-semibold text-gray-800 text-center mb-2">Mi consumo</h3>
        <p class="text-gray-600 text-center mb-4">Revisa el histórico de consumo de tu predio.</p>
      </div>
    </div>
    <div class="mt-10 text-center">
      <a href="/login" class="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Iniciar sesión</a>
    </div>
  </section>
</div>`;

export const socorroPages: SeedPage[] = [
  { kind: 'special', slug: '_header', title: 'Header del Sitio', html: header },
  { kind: 'special', slug: '_footer', title: 'Footer del Sitio', html: footer },
  { kind: 'page', slug: 'home', title: 'Inicio', html: home },
  { kind: 'page', slug: 'quienes-somos', title: 'Quiénes Somos', html: quienesSomos },
  { kind: 'page', slug: 'contacto', title: 'Contacto', html: contacto },
  { kind: 'page', slug: 'portal-usuario', title: 'Portal Usuario', html: portalUsuario },
];
