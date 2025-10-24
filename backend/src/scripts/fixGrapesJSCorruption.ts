import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GrapesComponent {
  type?: string;
  tagName?: string;
  attributes?: Record<string, any>;
  components?: GrapesComponent[];
  classes?: string[];
  [key: string]: any;
}

interface GrapesData {
  components?: GrapesComponent[];
  styles?: any[];
  [key: string]: any;
}

function cleanTemplateStrings(obj: any): any {
  if (typeof obj === 'string') {
    // Detectar y limpiar template literals malformados
    if (obj.includes('${') || obj.includes('`}')) {
      console.log(`🔧 Limpiando template literal malformado: ${obj.substring(0, 100)}...`);
      
      // Patrones comunes de template literals corruptos
      let cleaned = obj
        // Limpiar className con template literals
        .replace(/className=\{`[^`]*\$\{[^}]*\}[^`]*`\}/g, 'className="transition-all duration-300"')
        // Limpiar atributos con template literals
        .replace(/\$\{[^}]*\}/g, 'blue-500')
        // Limpiar backticks malformados
        .replace(/`\}/g, '"')
        .replace(/\{`/g, '"')
        // Limpiar caracteres de template literal
        .replace(/`/g, '"')
        // Normalizar espacios
        .replace(/\s+/g, ' ')
        .trim();
      
      return cleaned;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanTemplateStrings(item));
  }
  
  if (obj && typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Limpiar la clave también
      const cleanKey = cleanTemplateStrings(key);
      cleaned[cleanKey] = cleanTemplateStrings(value);
    }
    return cleaned;
  }
  
  return obj;
}

function validateAndCleanGrapesData(grapesData: any): GrapesData {
  if (!grapesData || typeof grapesData !== 'object') {
    return { components: [], styles: [] };
  }

  try {
    // Si es string, intentar parsear
    let data = typeof grapesData === 'string' ? JSON.parse(grapesData) : grapesData;
    
    // Limpiar template literals recursivamente
    data = cleanTemplateStrings(data);
    
    // Asegurar estructura básica
    if (!data.components) data.components = [];
    if (!data.styles) data.styles = [];
    
    // Validar componentes
    if (Array.isArray(data.components)) {
      data.components = data.components.map((comp: any) => validateComponent(comp));
    }
    
    return data;
  } catch (error) {
    console.warn('Error al procesar grapesData, usando estructura vacía:', error);
    return { components: [], styles: [] };
  }
}

function validateComponent(component: any): GrapesComponent {
  if (!component || typeof component !== 'object') {
    return { type: 'text', content: '' };
  }

  // Limpiar atributos problemáticos
  if (component.attributes) {
    const cleanAttributes: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(component.attributes)) {
      // Validar nombre de atributo
      const cleanKey = String(key).replace(/[^a-zA-Z0-9\-_]/g, '');
      if (cleanKey && cleanKey.length > 0) {
        // Limpiar valor del atributo
        let cleanValue = cleanTemplateStrings(value);
        
        // Validaciones específicas
        if (cleanKey === 'class' || cleanKey === 'className') {
          cleanValue = String(cleanValue)
            .replace(/\$\{[^}]*\}/g, 'blue-500')
            .replace(/`/g, '')
            .replace(/\{|\}/g, '')
            .trim();
        }
        
        cleanAttributes[cleanKey] = cleanValue;
      }
    }
    
    component.attributes = cleanAttributes;
  }

  // Limpiar componentes hijos recursivamente
  if (component.components && Array.isArray(component.components)) {
    component.components = component.components.map(child => validateComponent(child));
  }

  return component;
}

async function fixGrapesJSCorruption() {
  console.log('🔧 Iniciando corrección de datos GrapesJS corruptos...');
  
  try {
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        grapesData: true
      }
    });

    console.log(`📄 Encontradas ${pages.length} páginas para revisar`);
    
    let fixedCount = 0;
    let errorCount = 0;

    for (const page of pages) {
      try {
        console.log(`\n🔍 Revisando página: ${page.name} (${page.slug})`);
        
        // Validar y limpiar grapesData
        const originalData = page.grapesData;
        const cleanedData = validateAndCleanGrapesData(originalData);
        
        // Verificar si hubo cambios
        const originalStr = JSON.stringify(originalData);
        const cleanedStr = JSON.stringify(cleanedData);
        
        if (originalStr !== cleanedStr) {
          console.log(`✅ Corrigiendo datos corruptos en: ${page.name}`);
          
          await prisma.page.update({
            where: { id: page.id },
            data: {
              grapesData: JSON.stringify(cleanedData)
            }
          });
          
          fixedCount++;
        } else {
          console.log(`✓ Página ${page.name} ya está limpia`);
        }
        
      } catch (error) {
        console.error(`❌ Error procesando página ${page.name}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Resumen de corrección:');
    console.log(`✅ Páginas corregidas: ${fixedCount}`);
    console.log(`❌ Errores encontrados: ${errorCount}`);
    console.log(`📄 Total páginas procesadas: ${pages.length}`);
    
    if (fixedCount > 0) {
      console.log('\n🎉 Corrección completada. Los datos GrapesJS han sido limpiados.');
    } else {
      console.log('\n✓ No se encontraron datos corruptos que corregir.');
    }

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  fixGrapesJSCorruption()
    .then(() => {
      console.log('✅ Script de corrección completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script de corrección:', error);
      process.exit(1);
    });
}

export { fixGrapesJSCorruption };