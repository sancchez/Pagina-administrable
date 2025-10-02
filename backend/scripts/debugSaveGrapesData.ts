import { PageService } from '../src/services/pageService';
import { PageDataManager } from '../src/types/pageTypes';

async function debugSaveGrapesData() {
  try {
    console.log('=== Debug saveGrapesData ===');
    
    const pageId = 'cmg6y1034000c2jcbpxcw2q1z';
    const grapesDataString = JSON.stringify({
      'gjs-components': [{ type: 'text', content: 'Hola mundo desde GrapesJS debug' }],
      'gjs-styles': [{ selectors: ['body'], style: { 'background-color': '#f5f5f5' } }],
      'gjs-html': '<div>HTML desde debug</div>',
      'gjs-css': 'body { background-color: #f5f5f5; }'
    });
    
    console.log('1. Datos de entrada:');
    console.log('pageId:', pageId);
    console.log('grapesDataString:', grapesDataString);
    
    console.log('\n2. Validando datos de GrapesJS...');
    const parsedData = JSON.parse(grapesDataString);
    const isValid = PageDataManager.validateGrapesData(parsedData);
    console.log('Datos válidos:', isValid);
    
    if (!isValid) {
      console.log('Estructura de datos inválida');
      return;
    }
    
    console.log('\n3. Generando contenido público...');
    const publicContent = PageDataManager.generatePublicContent(parsedData);
    console.log('HTML generado:', publicContent.html);
    console.log('CSS generado:', publicContent.css);
    
    console.log('\n4. Intentando guardar en la base de datos...');
    const result = await PageService.saveGrapesData(
      pageId,
      grapesDataString,
      publicContent.html,
      publicContent.css
    );
    
    console.log('\n5. Resultado exitoso:');
    console.log('ID:', result.id);
    console.log('Título:', result.title);
    console.log('Campos disponibles:', Object.keys(result));
    
    // Verificar qué campos existen realmente
    if ('gjsHtml' in result) {
      console.log('gjsHtml length:', (result as any).gjsHtml?.length || 0);
    }
    if ('gjsCss' in result) {
      console.log('gjsCss length:', (result as any).gjsCss?.length || 0);
    }
    if ('gjsComponents' in result) {
      console.log('gjsComponents length:', (result as any).gjsComponents?.length || 0);
    }
    if ('gjsStyles' in result) {
      console.log('gjsStyles length:', (result as any).gjsStyles?.length || 0);
    }
    
  } catch (error) {
    console.error('\n❌ Error en debugSaveGrapesData:');
    if (error instanceof Error) {
      console.error('Tipo:', error.constructor.name);
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Error desconocido:', error);
    }
  }
}

debugSaveGrapesData();