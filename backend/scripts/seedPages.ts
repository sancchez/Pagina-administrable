import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../src/utils/password';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('🔄 Creando usuarios...');
  
  const adminPassword = await PasswordService.hash('admin123');
  const userPassword = await PasswordService.hash('user123');

  const users = [
    {
      email: 'admin@esal.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'ESAL',
      role: 'ADMIN' as const,
      isActive: true
    },
    {
      email: 'user@esal.com', 
      password: userPassword,
      firstName: 'Usuario',
      lastName: 'Test',
      role: 'USER' as const,
      isActive: true
    }
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });
  }

  console.log('✅ Usuarios creados');
}

async function seedPages() {
  console.log('🔄 Cargando páginas convertidas...');
  
  const convertedPagesDir = path.join(__dirname, '../temp/converted-pages');
  
  if (!fs.existsSync(convertedPagesDir)) {
    console.log('❌ Directorio de páginas convertidas no encontrado');
    return;
  }

  const files = fs.readdirSync(convertedPagesDir).filter(file => file.endsWith('.json'));
  
  for (const file of files) {
    const filePath = path.join(convertedPagesDir, file);
    const pageData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    console.log(`🔄 Creando página: ${pageData.title}`);
    
    await prisma.page.upsert({
      where: { slug: pageData.slug },
      update: {
        title: pageData.title,
        gjsHtml: pageData.gjsHtml,
        gjsCss: pageData.gjsCss,
        gjsComponents: pageData.gjsComponents,
        gjsStyles: pageData.gjsStyles
      },
      create: {
        title: pageData.title,
        slug: pageData.slug,
        gjsHtml: pageData.gjsHtml,
        gjsCss: pageData.gjsCss,
        gjsComponents: pageData.gjsComponents,
        gjsStyles: pageData.gjsStyles
      }
    });
    
    console.log(`✅ Página ${pageData.title} creada/actualizada`);
  }
  
  console.log(`✅ ${files.length} páginas procesadas`);
}

async function main() {
  try {
    console.log('🚀 Iniciando seed de la base de datos...');
    
    await seedUsers();
    await seedPages();
    
    console.log('✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();