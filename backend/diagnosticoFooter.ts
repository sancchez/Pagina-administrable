import prisma from './src/config/database';

async function diagnosticoFooter() {
    try {
        console.log('\n🔍 DIAGNÓSTICO DEL FOOTER\n');
        console.log('='.repeat(60));

        const footer = await prisma.page.findUnique({
            where: { slug: '_footer' }
        });

        if (!footer) {
            console.log('\n❌ ERROR: No se encontró página con slug "_footer"');
            return;
        }

        console.log('\n📄 INFORMACIÓN BÁSICA:');
        console.log('  ID:', footer.id);
        console.log('  Título:', footer.title);
        console.log('  Slug:', footer.slug);
        console.log('  Publicada:', footer.isPublished ? '✅ SÍ' : '❌ NO');
        console.log('  Activa:', footer.isActive ? '✅ SÍ' : '❌ NO');
        console.log('  Última actualización:', footer.updatedAt.toLocaleString());

        console.log('\n📊 CONTENIDO DRAFT (Lo que ves en el editor):');
        console.log('  gjsHtml:', footer.gjsHtml ? `✅ ${footer.gjsHtml.length} caracteres` : '❌ Vacío');
        console.log('  gjsCss:', footer.gjsCss ? `✅ ${footer.gjsCss.length} caracteres` : '❌ Vacío');
        console.log('  gjsComponents:', footer.gjsComponents ? `✅ ${footer.gjsComponents.length} caracteres` : '❌ Vacío');
        console.log('  gjsStyles:', footer.gjsStyles ? `✅ ${footer.gjsStyles.length} caracteres` : '❌ Vacío');

        console.log('\n🌐 CONTENIDO PUBLICADO (Lo que ve el público):');
        console.log('  publishedHtml:', footer.publishedHtml ? `✅ ${footer.publishedHtml.length} caracteres` : '❌ Vacío');
        console.log('  publishedCss:', footer.publishedCss ? `✅ ${footer.publishedCss.length} caracteres` : '❌ Vacío');

        console.log('\n' + '='.repeat(60));

        if (!footer.publishedHtml && !footer.publishedCss) {
            console.log('\n⚠️  PROBLEMA ENCONTRADO:');
            console.log('   El footer NO tiene contenido publicado.');
            console.log('   Esto explica por qué no se muestra en el sitio público.\n');
            console.log('💡 SOLUCIÓN:');
            console.log('   1. Abre el editor: http://localhost:5174/admin/dashboard/editor/_footer');
            console.log('   2. Agrega contenido al footer');
            console.log('   3. Haz clic en GUARDAR');
            console.log('   4. Haz clic en PUBLICAR');
            console.log('   5. Recarga cualquier página pública para ver los cambios\n');
        } else if (footer.publishedHtml && footer.publishedCss) {
            console.log('\n✅ El footer tiene contenido publicado.');
            console.log('   Debería mostrarse en el sitio público.\n');
            console.log('🔍 Si no se muestra, verifica:');
            console.log('   - Abre DevTools en el navegador (F12)');
            console.log('   - Ve a la pestaña Network');
            console.log('   - Busca la petición a: /api/pages/public/_footer');
            console.log('   - Verifica la respuesta del servidor\n');

            console.log('\n📄 PREVIEW del publishedHtml (primeros 500 caracteres):');
            console.log('─'.repeat(60));
            console.log(footer.publishedHtml.substring(0, 500));
            console.log('─'.repeat(60));
        }

    } catch (error) {
        console.error('\n❌ Error en el diagnóstico:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnosticoFooter();
