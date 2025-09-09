import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario admin por defecto
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    }
  });
  
  console.log('✅ Usuario admin creado:', adminUser);

  // Crear página home inicial según especificaciones
  const homePage = await prisma.page.upsert({
    where: { id: 'home' },
    update: {},
    create: {
      id: 'home',
      title: 'Inicio',
      draft_json: JSON.stringify({
        meta: { width: 1200, height: null },
        blocks: []
      }),
      published_json: JSON.stringify({
        meta: { width: 1200, height: null },
        blocks: []
      }),
      status: 'published',
      version: 1
    }
  });
  
  console.log('✅ Página home creada:', homePage);

  // Crear páginas adicionales del sitio
  const pages = [
    { id: 'quienes-somos', title: 'Quiénes Somos' },
    { id: 'informacion-esal', title: 'Información ESAL' },
    { id: 'operacion-gestion', title: 'Operación y Gestión' },
    { id: 'normatividad', title: 'Normatividad' },
    { id: 'portal-usuario', title: 'Portal del Usuario' },
    { id: 'contacto', title: 'Contacto' }
  ];

  for (const pageData of pages) {
    const page = await prisma.page.upsert({
      where: { id: pageData.id },
      update: {},
      create: {
        id: pageData.id,
        title: pageData.title,
        draft_json: JSON.stringify({
          meta: { width: 1200, height: null },
          blocks: []
        }),
        published_json: JSON.stringify({
          meta: { width: 1200, height: null },
          blocks: []
        }),
        status: 'published',
        version: 1
      }
    });
    
    console.log(`✅ Página ${pageData.id} creada:`, page);
  }

  // Crear log de audit inicial
  await prisma.auditLog.create({
    data: {
      action: 'create',
      entity: 'page',
      entity_id: 'home',
      user_id: adminUser.id,
      meta: JSON.stringify({ message: 'Página inicial creada durante seed' })
    }
  });

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });