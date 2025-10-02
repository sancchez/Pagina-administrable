import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

interface MigrationScript {
  name: string;
  file: string;
  description: string;
}

const MIGRATION_SCRIPTS: MigrationScript[] = [
  {
    name: 'Inicio',
    file: 'migrateInicioReal.ts',
    description: 'Página principal con información general de ESAL'
  },
  {
    name: 'Nosotros',
    file: 'migrateNosotrosReal.ts',
    description: 'Página sobre la empresa, historia y valores'
  },
  {
    name: 'Servicios',
    file: 'migrateServiciosReal.ts',
    description: 'Página de servicios ofrecidos por ESAL'
  },
  {
    name: 'Contacto',
    file: 'migrateContactoReal.ts',
    description: 'Página de contacto e información de ubicación'
  },
  {
    name: 'Normatividad',
    file: 'migrateNormatividadReal.ts',
    description: 'Página de marco normativo y regulaciones'
  },
  {
    name: 'Operación y Gestión',
    file: 'migrateOperacionGestionReal.ts',
    description: 'Página de operaciones y gestión de calidad'
  },
  {
    name: 'Portal Usuario',
    file: 'migratePortalUsuarioReal.ts',
    description: 'Portal de servicios en línea para usuarios'
  },
  {
    name: 'Facturación',
    file: 'migrateInvoiceReal.ts',
    description: 'Página de información de facturación'
  },
  {
    name: 'Consulta de Facturas',
    file: 'migrateInvoiceQueryReal.ts',
    description: 'Página para consultar el estado de facturas'
  }
];

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    return false;
  }
}

async function runMigrationScript(script: MigrationScript): Promise<boolean> {
  try {
    console.log(`\n🔄 Ejecutando migración: ${script.name}`);
    console.log(`📝 Descripción: ${script.description}`);
    console.log(`📄 Archivo: ${script.file}`);
    
    const { stdout, stderr } = await execAsync(`npx ts-node ${script.file}`);
    
    if (stderr && !stderr.includes('ExperimentalWarning')) {
      console.warn(`⚠️  Advertencias en ${script.name}:`, stderr);
    }
    
    if (stdout) {
      console.log(stdout);
    }
    
    console.log(`✅ Migración ${script.name} completada exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error en migración ${script.name}:`, error);
    return false;
  }
}

async function generateMigrationReport(results: { script: MigrationScript; success: boolean }[]) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 REPORTE DE MIGRACIÓN DE PÁGINAS');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Migraciones exitosas: ${successful.length}/${results.length}`);
  successful.forEach(r => {
    console.log(`   • ${r.script.name}`);
  });
  
  if (failed.length > 0) {
    console.log(`\n❌ Migraciones fallidas: ${failed.length}/${results.length}`);
    failed.forEach(r => {
      console.log(`   • ${r.script.name}`);
    });
  }
  
  console.log('\n📄 Páginas disponibles:');
  try {
    const pages = await prisma.page.findMany({
      select: {
        name: true,
        slug: true,
        isPublished: true,
        isActive: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    pages.forEach(page => {
      const status = page.isPublished && page.isActive ? '🟢' : '🔴';
      console.log(`   ${status} /${page.slug} - ${page.name}`);
    });
    
    console.log(`\n📈 Total de páginas en la base de datos: ${pages.length}`);
  } catch (error) {
    console.error('❌ Error obteniendo información de páginas:', error);
  }
  
  console.log('\n🌐 URLs disponibles:');
  console.log('   • http://localhost:3000/ (Inicio)');
  console.log('   • http://localhost:3000/nosotros');
  console.log('   • http://localhost:3000/servicios');
  console.log('   • http://localhost:3000/contacto');
  console.log('   • http://localhost:3000/normatividad');
  console.log('   • http://localhost:3000/operacion-gestion');
  console.log('   • http://localhost:3000/portal-usuario');
  console.log('   • http://localhost:3000/facturacion');
  console.log('   • http://localhost:3000/consulta-facturas');
  
  console.log('\n' + '='.repeat(80));
  
  if (failed.length === 0) {
    console.log('🎉 ¡TODAS LAS MIGRACIONES COMPLETADAS EXITOSAMENTE!');
  } else {
    console.log(`⚠️  ${failed.length} migraciones requieren atención`);
  }
  
  console.log('='.repeat(80));
}

async function migrateAllPages() {
  console.log('🚀 INICIANDO MIGRACIÓN COMPLETA DE PÁGINAS');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // Verificar conexión a la base de datos
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    console.error('💥 No se pudo conectar a la base de datos. Abortando migración.');
    process.exit(1);
  }
  
  console.log(`\n📋 Se ejecutarán ${MIGRATION_SCRIPTS.length} scripts de migración:`);
  MIGRATION_SCRIPTS.forEach((script, index) => {
    console.log(`   ${index + 1}. ${script.name} - ${script.description}`);
  });
  
  console.log('\n⏳ Iniciando proceso de migración...\n');
  
  const results: { script: MigrationScript; success: boolean }[] = [];
  
  // Ejecutar cada script de migración
  for (const script of MIGRATION_SCRIPTS) {
    const success = await runMigrationScript(script);
    results.push({ script, success });
    
    // Pequeña pausa entre migraciones
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Generar reporte final
  await generateMigrationReport(results);
  
  console.log(`\n⏱️  Tiempo total de migración: ${duration} segundos`);
  
  const successCount = results.filter(r => r.success).length;
  if (successCount === MIGRATION_SCRIPTS.length) {
    console.log('\n🎊 ¡MIGRACIÓN COMPLETA EXITOSA!');
    console.log('🌟 Todas las páginas han sido migradas correctamente');
    console.log('🔗 El sitio web está listo para usar');
  } else {
    console.log(`\n⚠️  Migración parcial: ${successCount}/${MIGRATION_SCRIPTS.length} exitosas`);
    console.log('🔧 Revise los errores anteriores y ejecute las migraciones fallidas individualmente');
  }
}

// Manejo de errores globales
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rechazo no manejado en:', promise, 'razón:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

// Ejecutar migración completa
migrateAllPages()
  .then(() => {
    console.log('\n✨ Proceso de migración finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error crítico en el proceso de migración:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });