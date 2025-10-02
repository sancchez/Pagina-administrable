import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { PageConverter } from './convertPage';

class DatabaseMigrator {
  private backendPath: string;

  constructor() {
    this.backendPath = process.cwd();
  }

  /**
   * Ejecuta un comando y maneja errores
   */
  private executeCommand(command: string, description: string): void {
    try {
      console.log(`🔄 ${description}...`);
      execSync(command, { 
        stdio: 'inherit', 
        cwd: this.backendPath 
      });
      console.log(`✅ ${description} completado`);
    } catch (error) {
      console.error(`❌ Error en ${description}:`, error);
      throw error;
    }
  }

  /**
   * Limpia migraciones existentes
   */
  private cleanMigrations(): void {
    const migrationsPath = path.join(this.backendPath, 'prisma', 'migrations');
    
    if (fs.existsSync(migrationsPath)) {
      console.log('🧹 Limpiando migraciones existentes...');
      fs.rmSync(migrationsPath, { recursive: true, force: true });
      console.log('✅ Migraciones limpiadas');
    } else {
      console.log('ℹ️  No hay migraciones existentes para limpiar');
    }
  }

  /**
   * Resetea la base de datos completamente
   */
  async resetDatabase(): Promise<void> {
    console.log('🗑️  Reseteando base de datos...');
    
    try {
      // Limpiar migraciones
      this.cleanMigrations();
      
      // Reset completo de la base de datos
      this.executeCommand(
        'npx prisma migrate reset --force --skip-seed',
        'Reset de base de datos'
      );
      
      // Generar cliente
      this.executeCommand(
        'npx prisma generate',
        'Generación de cliente Prisma'
      );
      
    } catch (error) {
      console.error('❌ Error durante el reset:', error);
      throw error;
    }
  }

  /**
   * Crea migración inicial
   */
  async createInitialMigration(): Promise<void> {
    console.log('📝 Creando migración inicial...');
    
    try {
      this.executeCommand(
        'npx prisma migrate dev --name init',
        'Creación de migración inicial'
      );
    } catch (error) {
      console.error('❌ Error creando migración:', error);
      throw error;
    }
  }

  /**
   * Convierte páginas TSX a HTML
   */
  async convertPages(): Promise<void> {
    console.log('🔄 Convirtiendo páginas TSX a HTML...');
    
    try {
      const converter = new PageConverter();
      const results = await converter.convertAllPages();
      
      console.log(`✅ ${results.length} páginas convertidas exitosamente`);
    } catch (error) {
      console.error('❌ Error convirtiendo páginas:', error);
      throw error;
    }
  }

  /**
   * Ejecuta el seed de la base de datos
   */
  async seedDatabase(): Promise<void> {
    console.log('🌱 Poblando base de datos...');
    
    try {
      this.executeCommand(
        'npx prisma db seed',
        'Seed de base de datos'
      );
    } catch (error) {
      console.error('❌ Error durante el seed:', error);
      throw error;
    }
  }

  /**
   * Verifica el estado de la base de datos
   */
  async verifyDatabase(): Promise<void> {
    console.log('🔍 Verificando estado de la base de datos...');
    
    try {
      this.executeCommand(
        'npx prisma db pull',
        'Verificación de esquema'
      );
      
      console.log('✅ Base de datos verificada correctamente');
    } catch (error) {
      console.error('❌ Error verificando base de datos:', error);
      throw error;
    }
  }

  /**
   * Proceso completo de migración
   */
  async fullMigration(): Promise<void> {
    console.log('🚀 Iniciando proceso completo de migración...');
    console.log('=' .repeat(50));
    
    try {
      // 1. Reset completo
      await this.resetDatabase();
      
      // 2. Crear migración inicial
      await this.createInitialMigration();
      
      // 3. Convertir páginas
      await this.convertPages();
      
      // 4. Seed de la base de datos
      await this.seedDatabase();
      
      // 5. Verificar estado final
      await this.verifyDatabase();
      
      console.log('=' .repeat(50));
      console.log('🎉 ¡Migración completada exitosamente!');
      console.log('');
      console.log('📋 Resumen:');
      console.log('  ✅ Base de datos reseteada');
      console.log('  ✅ Migración inicial creada');
      console.log('  ✅ Páginas TSX convertidas a HTML');
      console.log('  ✅ Base de datos poblada');
      console.log('  ✅ Estado verificado');
      console.log('');
      console.log('🔗 Próximos pasos:');
      console.log('  1. Iniciar el servidor: npm run dev');
      console.log('  2. Verificar las páginas en GrapesJS');
      console.log('  3. Editar contenido según necesidades');
      
    } catch (error) {
      console.error('💥 Error durante la migración:', error);
      console.log('');
      console.log('🔧 Posibles soluciones:');
      console.log('  1. Verificar que el archivo .env esté configurado');
      console.log('  2. Asegurar que la base de datos esté accesible');
      console.log('  3. Revisar el schema.prisma');
      console.log('  4. Ejecutar: npm install');
      
      process.exit(1);
    }
  }

  /**
   * Solo conversión de páginas (sin reset de DB)
   */
  async convertPagesOnly(): Promise<void> {
    console.log('🔄 Ejecutando solo conversión de páginas...');
    
    try {
      await this.convertPages();
      console.log('✅ Conversión de páginas completada');
    } catch (error) {
      console.error('❌ Error en conversión:', error);
      throw error;
    }
  }

  /**
   * Solo seed (sin reset de DB)
   */
  async seedOnly(): Promise<void> {
    console.log('🌱 Ejecutando solo seed...');
    
    try {
      await this.seedDatabase();
      console.log('✅ Seed completado');
    } catch (error) {
      console.error('❌ Error en seed:', error);
      throw error;
    }
  }
}

// Función principal
async function main() {
  const migrator = new DatabaseMigrator();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Migración completa por defecto
    await migrator.fullMigration();
  } else {
    const command = args[0];
    
    switch (command) {
      case 'reset':
        await migrator.resetDatabase();
        break;
      case 'migrate':
        await migrator.createInitialMigration();
        break;
      case 'convert':
        await migrator.convertPagesOnly();
        break;
      case 'seed':
        await migrator.seedOnly();
        break;
      case 'verify':
        await migrator.verifyDatabase();
        break;
      case 'full':
        await migrator.fullMigration();
        break;
      default:
        console.log('❌ Comando no reconocido:', command);
        console.log('');
        console.log('📖 Comandos disponibles:');
        console.log('  npm run migrate        - Migración completa (por defecto)');
        console.log('  npm run migrate reset  - Solo reset de DB');
        console.log('  npm run migrate migrate- Solo crear migración');
        console.log('  npm run migrate convert- Solo convertir páginas');
        console.log('  npm run migrate seed   - Solo seed');
        console.log('  npm run migrate verify - Solo verificar DB');
        console.log('  npm run migrate full   - Migración completa');
        process.exit(1);
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

export { DatabaseMigrator };