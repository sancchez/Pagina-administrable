import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const prisma = new PrismaClient();

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');

    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Ejecutar migraciones de Prisma
    console.log('📦 Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // Generar cliente de Prisma
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('✅ Migrations completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para crear una nueva migración
async function createMigration(name: string) {
  try {
    console.log(`🔄 Creating new migration: ${name}`);
    
    execSync(`npx prisma migrate dev --name ${name}`, { stdio: 'inherit' });
    
    console.log('✅ Migration created successfully');
  } catch (error) {
    console.error('❌ Failed to create migration:', error);
    process.exit(1);
  }
}

// Función para resetear la base de datos
async function resetDatabase() {
  try {
    console.log('⚠️  Resetting database...');
    
    const confirm = process.argv.includes('--force');
    if (!confirm) {
      console.log('❌ Database reset cancelled. Use --force flag to confirm.');
      return;
    }

    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    process.exit(1);
  }
}

// Función para verificar el estado de las migraciones
async function checkMigrationStatus() {
  try {
    console.log('🔍 Checking migration status...');
    
    execSync('npx prisma migrate status', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Failed to check migration status:', error);
    process.exit(1);
  }
}

// Función principal
async function main() {
  const command = process.argv[2];
  const migrationName = process.argv[3];

  switch (command) {
    case 'run':
    case 'deploy':
      await runMigrations();
      break;
    
    case 'create':
      if (!migrationName) {
        console.error('❌ Migration name is required. Usage: npm run migrate create <name>');
        process.exit(1);
      }
      await createMigration(migrationName);
      break;
    
    case 'reset':
      await resetDatabase();
      break;
    
    case 'status':
      await checkMigrationStatus();
      break;
    
    default:
      console.log(`
📋 Available migration commands:

  npm run migrate run     - Run pending migrations
  npm run migrate create <name> - Create a new migration
  npm run migrate reset   - Reset database (use --force to confirm)
  npm run migrate status  - Check migration status

Examples:
  npm run migrate run
  npm run migrate create add_user_preferences
  npm run migrate reset --force
  npm run migrate status
      `);
      break;
  }
}

// Ejecutar función principal
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});