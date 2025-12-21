import prisma from './src/config/database';

const footerHtml = `<footer class="bg-gradient-to-r from-blue-900 to-green-900 text-white">
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="col-span-1 md:col-span-2">
        <h3 class="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-200 to-green-200 bg-clip-text text-transparent">
          Acueducto Municipal
        </h3>
        <p class="text-blue-100">
          Comprometidos con brindar servicios de agua potable de calidad para nuestra comunidad,
          garantizando el acceso continuo y confiable al recurso hídrico.
        </p>
      </div>
      <div>
        <h4 class="text-md font-semibold mb-4 text-green-200">Servicios</h4>
        <ul class="space-y-2">
          <li>
            <a href="/portal-usuario" class="text-blue-100 hover:text-white transition-colors">
              Portal Usuario
            </a>
          </li>
          <li>
            <a href="/quienes-somos" class="text-blue-100 hover:text-white transition-colors">
              Quiénes Somos
            </a>
          </li>
          <li>
            <a href="/contacto" class="text-blue-100 hover:text-white transition-colors">
              Contacto
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 class="text-md font-semibold mb-4 text-green-200">Información</h4>
        <ul class="space-y-2">
          <li>
            <a href="/informacion-esal" class="text-blue-100 hover:text-white transition-colors">
              Información ESAL
            </a>
          </li>
          <li>
            <a href="/operacion-gestion" class="text-blue-100 hover:text-white transition-colors">
              Operación y Gestión
            </a>
          </li>
          <li>
            <a href="/normatividad" class="text-blue-100 hover:text-white transition-colors">
              Normatividad
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="mt-8 pt-8 border-t border-blue-800">
      <p class="text-center text-blue-200">
        © 2024 Acueducto Municipal. Todos los derechos reservados.
      </p>
    </div>
  </div>
</footer>`;

const footerCss = `
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-900 {
  --tw-gradient-from: #1e3a8a;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(30, 58, 138, 0));
}

.to-green-900 {
  --tw-gradient-to: #14532d;
}

.text-white {
  color: #ffffff;
}

.max-w-7xl {
  max-width: 80rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.gap-8 {
  gap: 2rem;
}

.col-span-1 {
  grid-column: span 1 / span 1;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.font-semibold {
  font-weight: 600;
}

.mb-4 {
  margin-bottom: 1rem;
}

.from-blue-200 {
  --tw-gradient-from: #bfdbfe;
}

.to-green-200 {
  --tw-gradient-to: #bbf7d0;
}

.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

.text-transparent {
  color: transparent;
}

.text-blue-100 {
  color: #dbeafe;
}

.text-md {
  font-size: 1rem;
}

.text-green-200 {
  color: #bbf7d0;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.hover\\:text-white:hover {
  color: #ffffff;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.mt-8 {
  margin-top: 2rem;
}

.pt-8 {
  padding-top: 2rem;
}

.border-t {
  border-top-width: 1px;
}

.border-blue-800 {
  border-color: #1e40af;
}

.text-center {
  text-align: center;
}

.text-blue-200 {
  color: #bfdbfe;
}

@media (min-width: 640px) {
  .sm\\:px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 768px) {
  .md\\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  
  .md\\:col-span-2 {
    grid-column: span 2 / span 2;
  }
}

@media (min-width: 1024px) {
  .lg\\:px-8 {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
`;

async function copiarFooterHardcoded() {
    try {
        console.log('\n🔄 Copiando footer hardcodeado a la página editable...\n');

        const footer = await prisma.page.findUnique({
            where: { slug: '_footer' }
        });

        if (!footer) {
            console.log('❌ No se encontró la página _footer');
            return;
        }

        console.log('📄 Página encontrada:', footer.title);
        console.log('📝 Actualizando contenido...\n');

        // Actualizar la página con el HTML y CSS del footer hardcodeado
        const updated = await prisma.page.update({
            where: { slug: '_footer' },
            data: {
                gjsHtml: footerHtml,
                gjsCss: footerCss,
                publishedHtml: footerHtml,
                publishedCss: footerCss,
                html: footerHtml,
                css: footerCss,
                isPublished: true,
                publishedAt: new Date()
            }
        });

        console.log('✅ Footer actualizado exitosamente!');
        console.log('\n📊 Detalles:');
        console.log('  - gjsHtml:', updated.gjsHtml ? `${updated.gjsHtml.length} caracteres` : 'vacío');
        console.log('  - gjsCss:', updated.gjsCss ? `${updated.gjsCss.length} caracteres` : 'vacío');
        console.log('  - publishedHtml:', updated.publishedHtml ? `${updated.publishedHtml.length} caracteres` : 'vacío');
        console.log('  - publishedCss:', updated.publishedCss ? `${updated.publishedCss.length} caracteres` : 'vacío');
        console.log('  - isPublished:', updated.isPublished);
        console.log('  - publishedAt:', updated.publishedAt?.toLocaleString());

        console.log('\n🎉 LISTO!');
        console.log('\n📝 Próximos pasos:');
        console.log('1. Recarga la página pública (Ctrl+Shift+R)');
        console.log('2. Ve a /admin/dashboard/editor/_footer para editar el footer');
        console.log('3. Realiza los cambios que desees');
        console.log('4. Guarda y publica');
        console.log('5. Los cambios aparecerán en todas las páginas\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

copiarFooterHardcoded();
