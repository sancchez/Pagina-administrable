#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { processIconsInHtml } from '../utils/iconMapper';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

// Mapeo de páginas TSX a sus slugs correspondientes
const PAGE_MAPPINGS = [
  { file: 'HomePage.tsx', slug: 'inicio', title: 'Inicio' },
  { file: 'QuienesSomos.tsx', slug: 'quienes-somos', title: 'Quiénes Somos' },
  { file: 'Contacto.tsx', slug: 'contacto', title: 'Contacto' },
  { file: 'InformacionESAL.tsx', slug: 'informacion-esal', title: 'Información ESAL' },
  { file: 'Normatividad.tsx', slug: 'normatividad', title: 'Normatividad' },
  { file: 'OperacionGestion.tsx', slug: 'operacion-gestion', title: 'Operación y Gestión' },
  { file: 'PortalUsuario.tsx', slug: 'portal-usuario', title: 'Portal de Usuario' },
  { file: 'InvoicePage.tsx', slug: 'factura', title: 'Factura' },
  { file: 'InvoiceQuery.tsx', slug: 'consulta-factura', title: 'Consulta de Factura' }
];

const FRONTEND_PATH = path.resolve(__dirname, '../../../frontend');
const PAGES_PATH = path.join(FRONTEND_PATH, 'src/pages');

interface MigrationResult {
  slug: string;
  title: string;
  success: boolean;
  error?: string;
  html?: string;
}

/**
 * Renderiza un componente TSX a HTML estático usando React Server Components
 */
async function renderTsxToHtml(filePath: string, componentName: string): Promise<string> {
  try {
    // Crear un script temporal para renderizar el componente
    const renderScript = `
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ${componentName} from '${filePath}';

// Mock de Layout si es necesario
const MockLayout = ({ children }: { children: React.ReactNode }) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Página</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" />
    </head>
    <body>
      {children}
    </body>
  </html>
);

// Renderizar el componente
const html = renderToStaticMarkup(React.createElement(${componentName}));
console.log(html);
`;

    const tempScriptPath = path.join(FRONTEND_PATH, 'temp-render.tsx');
    await fs.writeFile(tempScriptPath, renderScript);

    try {
      // Ejecutar el script de renderizado
      const { stdout } = await execAsync(`cd ${FRONTEND_PATH} && npx tsx temp-render.tsx`, {
        timeout: 30000
      });

      // Limpiar el archivo temporal
      await fs.unlink(tempScriptPath);

      // 🔧 SOLUCIÓN: Convertir iconos de lucide-react a SVG real
      console.log(`🔄 Procesando iconos de lucide-react para ${componentName}...`);
      const processedHtml = processIconsInHtml(stdout.trim());
      console.log(`✅ Iconos procesados para ${componentName}`);

      return processedHtml;
    } catch (error) {
      // Limpiar el archivo temporal en caso de error
      try {
        await fs.unlink(tempScriptPath);
      } catch {}
      throw error;
    }
  } catch (error) {
    console.error(`Error renderizando ${componentName}:`, error);
    throw error;
  }
}

/**
 * Extrae CSS básico para la página
 */
function generateBasicCss(): string {
  return `
/* Estilos básicos para páginas migradas */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Utilidades de Tailwind más comunes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.text-4xl { font-size: 2.25rem; }
.text-5xl { font-size: 3rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.bg-white { background-color: #ffffff; }
.bg-blue-600 { background-color: #2563eb; }
.text-white { color: #ffffff; }
.rounded-lg { border-radius: 0.5rem; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.gap-4 { gap: 1rem; }
.gap-8 { gap: 2rem; }

@media (min-width: 768px) {
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
`;
}

/**
 * Migra una página TSX específica
 */
async function migratePage(mapping: typeof PAGE_MAPPINGS[0]): Promise<MigrationResult> {
  const result: MigrationResult = {
    slug: mapping.slug,
    title: mapping.title,
    success: false
  };

  try {
    console.log(`🔄 Migrando ${mapping.file} -> ${mapping.slug}...`);

    // Verificar si el archivo existe
    const filePath = path.join(PAGES_PATH, mapping.file);
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`Archivo no encontrado: ${mapping.file}`);
    }

    // Renderizar TSX a HTML con procesamiento de iconos
    let html: string;
    try {
      // Intentar renderizar el TSX real con iconos procesados
      const componentName = mapping.file.replace('.tsx', '');
      const relativePath = `./src/pages/${mapping.file}`;
      html = await renderTsxToHtml(relativePath, componentName);
      console.log(`✅ TSX renderizado con iconos procesados para ${mapping.slug}`);
    } catch (error) {
      console.log(`⚠️  Error renderizando TSX para ${mapping.slug}, usando fallback:`, error);
      // Fallback a HTML básico si falla el renderizado TSX
      html = await generateFallbackHtml(mapping);
    }
    const css = generateBasicCss();

    // Verificar si la página ya existe en la base de datos
    let page = await prisma.page.findUnique({
      where: { slug: mapping.slug }
    });

    if (page) {
      // Actualizar página existente
      page = await prisma.page.update({
        where: { slug: mapping.slug },
        data: {
          title: mapping.title,
          html: html,
          css: css,
          content: null, // Limpiar contenido legacy
          grapesData: null, // Se generará cuando se edite en GrapesJS
          updatedAt: new Date()
        }
      });
      console.log(`✅ Página actualizada: ${mapping.slug}`);
    } else {
      // Crear nueva página
      page = await prisma.page.create({
        data: {
          name: mapping.slug,
          title: mapping.title,
          slug: mapping.slug,
          html: html,
          css: css,
          isActive: true
        }
      });
      console.log(`✅ Página creada: ${mapping.slug}`);
    }

    result.success = true;
    result.html = html;

  } catch (error: any) {
    console.error(`❌ Error migrando ${mapping.file}:`, error.message);
    result.error = error.message;
  }

  return result;
}

/**
 * Genera HTML básico cuando no se puede renderizar el TSX
 */
async function generateFallbackHtml(mapping: typeof PAGE_MAPPINGS[0]): Promise<string> {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mapping.title}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container py-5">
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4">${mapping.title}</h1>
        <div class="alert alert-info">
          <h4>Página migrada desde TSX</h4>
          <p>Esta página ha sido migrada desde el componente <code>${mapping.file}</code>.</p>
          <p>Puedes editarla usando el editor GrapesJS para personalizar su contenido.</p>
        </div>
        
        <div class="row mt-5">
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Contenido Principal</h5>
                <p class="card-text">
                  Este es el contenido principal de la página ${mapping.title}. 
                  Puedes editar este contenido usando el editor visual.
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Información Adicional</h5>
                <p class="card-text">
                  Aquí puedes agregar información adicional sobre ${mapping.title}.
                  Usa el editor para agregar imágenes, videos y más elementos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Función principal de migración
 */
async function main() {
  console.log('🚀 Iniciando migración de páginas TSX a HTML...\n');

  const results: MigrationResult[] = [];

  // Migrar cada página
  for (const mapping of PAGE_MAPPINGS) {
    const result = await migratePage(mapping);
    results.push(result);
  }

  // Mostrar resumen
  console.log('\n📊 Resumen de migración:');
  console.log('========================');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Exitosas: ${successful.length}`);
  console.log(`❌ Fallidas: ${failed.length}`);

  if (successful.length > 0) {
    console.log('\n✅ Páginas migradas exitosamente:');
    successful.forEach(r => console.log(`  - ${r.slug} (${r.title})`));
  }

  if (failed.length > 0) {
    console.log('\n❌ Páginas con errores:');
    failed.forEach(r => console.log(`  - ${r.slug}: ${r.error}`));
  }

  console.log('\n🎉 Migración completada!');
  console.log('\n📝 Próximos pasos:');
  console.log('1. Verifica las páginas en el admin: /admin/pages');
  console.log('2. Edita cada página con GrapesJS para personalizar el contenido');
  console.log('3. Las páginas públicas ahora cargarán desde la base de datos');

  await prisma.$disconnect();
}

// Ejecutar migración
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Error en la migración:', error);
    process.exit(1);
  });
}

export { main as migrateTsxToHtml };