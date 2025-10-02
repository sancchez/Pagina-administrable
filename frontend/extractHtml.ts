import { renderTsxToHtml } from './src/utils/tsxRenderer.ts';

const pages = [
  'home',
  'contacto', 
  'informacion-esal',
  'normatividad',
  'operacion-gestion',
  'portal-usuario',
  'invoice',
  'invoice-query'
];

console.log('=== EXTRAYENDO HTML DE TODAS LAS PÁGINAS ===\n');

for (const page of pages) {
  try {
    console.log(`\n--- PÁGINA: ${page.toUpperCase()} ---`);
    const html = renderTsxToHtml(page);
    console.log(`HTML_START_${page.toUpperCase()}`);
    console.log(html);
    console.log(`HTML_END_${page.toUpperCase()}`);
  } catch (error) {
    console.error(`Error renderizando ${page}:`, error);
  }
}