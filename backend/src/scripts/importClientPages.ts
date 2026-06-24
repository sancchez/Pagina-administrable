/**
 * FIX D — Importador de páginas HTML del cliente al formato de seed.
 *
 * Convierte archivos HTML "ya hechos" (la web actual del cliente) en los JSON
 * que `prisma/seed.ts` consume desde `temp/converted-pages/`. El HTML se limpia
 * (quita <Layout>, extrae el <body>) y se guarda como `gjsHtml`, dejando
 * `gjsComponents` vacío a propósito: al abrir la página en el editor, el Fix A
 * (makeImportedContentEditable) la vuelve editable, y al guardar queda con
 * componentes nativos de GrapesJS.
 *
 * Uso:
 *   1. Coloca los .html del cliente en  backend/temp/client-html/
 *      (el nombre del archivo es el slug:  home.html -> slug "home").
 *      - Opcional: un .css con el mismo nombre (home.css) -> se usa como gjsCss.
 *      - Opcional: backend/temp/client-html/pages.json con títulos:
 *          [{ "slug": "home", "title": "Inicio" }, ...]
 *   2. npm run import:pages
 *   3. npm run db:seed
 */

import fs from 'fs';
import path from 'path';

const INPUT_DIR = path.resolve(__dirname, '../../temp/client-html');
const OUTPUT_DIR = path.resolve(__dirname, '../../temp/converted-pages');

interface TitleManifestEntry {
  slug: string;
  title?: string;
}

/** Limpia el HTML del cliente para que GrapesJS lo cargue de forma consistente. */
function cleanHtml(raw: string): string {
  let html = raw;

  // Quitar wrappers de React/Layout que no aplican en el editor.
  html = html.replace(/<\/?Layout>/g, '');

  // Si viene un documento completo, quedarnos solo con el contenido del <body>.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1].trim().length > 0) {
    html = bodyMatch[1];
  }

  return html.trim();
}

/** Convierte un nombre de slug en un título legible por defecto. */
function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function loadTitleManifest(dir: string): Record<string, string> {
  const manifestPath = path.join(dir, 'pages.json');
  const map: Record<string, string> = {};
  if (!fs.existsSync(manifestPath)) return map;
  try {
    const entries: TitleManifestEntry[] = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    entries.forEach((e) => {
      if (e.slug && e.title) map[e.slug] = e.title;
    });
    console.log(`📑 Manifest de títulos cargado (${Object.keys(map).length} entradas)`);
  } catch (e) {
    console.warn('⚠️  No se pudo leer pages.json, se usarán títulos derivados del slug:', e);
  }
  return map;
}

function main() {
  if (!fs.existsSync(INPUT_DIR)) {
    fs.mkdirSync(INPUT_DIR, { recursive: true });
    console.log(`📂 Carpeta de entrada creada: ${INPUT_DIR}`);
    console.log('   Coloca ahí los .html del cliente y vuelve a ejecutar el script.');
    return;
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const htmlFiles = fs.readdirSync(INPUT_DIR).filter((f) => f.toLowerCase().endsWith('.html'));
  if (htmlFiles.length === 0) {
    console.log(`⚠️  No se encontraron archivos .html en ${INPUT_DIR}`);
    return;
  }

  const titleMap = loadTitleManifest(INPUT_DIR);
  let converted = 0;

  for (const file of htmlFiles) {
    try {
      const slug = path.basename(file, '.html').trim();
      const rawHtml = fs.readFileSync(path.join(INPUT_DIR, file), 'utf-8');
      const gjsHtml = cleanHtml(rawHtml);

      // CSS hermano opcional (home.html -> home.css).
      const cssPath = path.join(INPUT_DIR, `${slug}.css`);
      const gjsCss = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf-8') : '';

      const title = titleMap[slug] || slugToTitle(slug);

      const pageJson = {
        title,
        slug,
        gjsHtml,
        gjsCss,
        // Vacíos a propósito: el editor (Fix A) los vuelve editables al abrir,
        // y los persiste como componentes nativos al guardar.
        gjsComponents: '[]',
        gjsStyles: '[]',
      };

      const outPath = path.join(OUTPUT_DIR, `${slug}.json`);
      fs.writeFileSync(outPath, JSON.stringify(pageJson, null, 2), 'utf-8');
      converted++;
      console.log(`✅ ${file} -> ${path.relative(process.cwd(), outPath)}  (slug: "${slug}", title: "${title}")`);
    } catch (e) {
      console.error(`❌ Error procesando ${file}:`, e);
    }
  }

  console.log(`\n🎉 ${converted}/${htmlFiles.length} página(s) convertida(s).`);
  console.log('   Siguiente paso:  npm run db:seed');
}

main();
