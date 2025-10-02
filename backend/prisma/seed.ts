import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface PageData {
  title: string;
  slug: string;
  gjsHtml: string;
  gjsCss: string;
  gjsComponents: string;
  gjsStyles: string;
}

async function seedPagesFromConvertedFiles() {
  const convertedPagesPath = path.resolve(__dirname, '../temp/converted-pages');
  
  // Verificar si existe el directorio de páginas convertidas
  if (!fs.existsSync(convertedPagesPath)) {
    console.log('⚠️  No se encontraron páginas convertidas. Creando página de inicio por defecto...');
    
    // Crear página de inicio por defecto
    const homePage = await prisma.page.upsert({
      where: { slug: 'home' },
      update: {},
      create: {
        slug: 'home',
        title: 'Bienvenido al Acueducto Municipal',
        gjsHtml: "<div class=\"container\"><h1>Bienvenido al Acueducto Municipal</h1><p>Brindamos servicios de agua potable de calidad para nuestra comunidad.</p></div>",
        gjsCss: ".container { max-width: 1200px; margin: 0 auto; padding: 20px; } h1 { color: #2563eb; text-align: center; } p { font-size: 18px; text-align: center; color: #6b7280; }",
        gjsComponents: "[]",
        gjsStyles: "[]",
      },
    });
    
    console.log('✅ Página de inicio por defecto creada:', homePage.title);
    return;
  }

  // Leer archivos JSON de páginas convertidas
  const files = fs.readdirSync(convertedPagesPath).filter(file => file.endsWith('.json'));
  
  for (const file of files) {
    try {
      const filePath = path.join(convertedPagesPath, file);
      const pageData: PageData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      const page = await prisma.page.upsert({
        where: { slug: pageData.slug },
        update: {
          title: pageData.title,
          gjsHtml: pageData.gjsHtml,
          gjsCss: pageData.gjsCss,
          gjsComponents: pageData.gjsComponents,
          gjsStyles: pageData.gjsStyles,
        },
        create: {
          slug: pageData.slug,
          title: pageData.title,
          gjsHtml: pageData.gjsHtml,
          gjsCss: pageData.gjsCss,
          gjsComponents: pageData.gjsComponents,
          gjsStyles: pageData.gjsStyles,
        },
      });
      
      console.log(`✅ Página creada/actualizada: ${page.title} (${page.slug})`);
    } catch (error) {
      console.error(`❌ Error procesando ${file}:`, error);
    }
  }
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acueducto.com' },
    update: {},
    create: {
      email: 'admin@acueducto.com',
      password: adminPassword,
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: "ADMIN",
      phone: '+57 300 123 4567',
    },
  });

  console.log('✅ Usuario administrador creado:', admin.email);

  // Crear usuario manager de ejemplo
  const managerPassword = await bcrypt.hash('manager123', 12);
  
  const manager = await prisma.user.upsert({
    where: { email: 'manager@acueducto.com' },
    update: {},
    create: {
      email: 'manager@acueducto.com',
      password: managerPassword,
      firstName: 'Gerente',
      lastName: 'Operaciones',
      role: "MANAGER",
      phone: '+57 300 987 6543',
    },
  });

  console.log('✅ Usuario manager creado:', manager.email);

  // Crear algunos usuarios de ejemplo
  const userPassword = await bcrypt.hash('user123', 12);
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'juan.perez@email.com' },
      update: {},
      create: {
        email: 'juan.perez@email.com',
        password: userPassword,
        firstName: 'Juan',
        lastName: 'Pérez',
        role: "USER",
        phone: '+57 300 111 2222',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria.garcia@email.com' },
      update: {},
      create: {
        email: 'maria.garcia@email.com',
        password: userPassword,
        firstName: 'María',
        lastName: 'García',
        role: "USER",
        phone: '+57 300 333 4444',
      },
    }),
  ]);

  console.log('✅ Usuarios de ejemplo creados:', users.length);

  // Crear configuraciones del sistema
  const settings = [
    {
      key: 'company_name',
      value: 'Acueducto Municipal',
      type: 'STRING' as const,
      description: 'Nombre de la empresa',
    },
    {
      key: 'company_address',
      value: 'Calle Principal #123, Ciudad',
      type: 'STRING' as const,
      description: 'Dirección de la empresa',
    },
    {
      key: 'company_phone',
      value: '+57 1 234 5678',
      type: 'STRING' as const,
      description: 'Teléfono de la empresa',
    },
    {
      key: 'company_email',
      value: 'info@acueducto.com',
      type: 'STRING' as const,
      description: 'Email de contacto',
    },
    {
      key: 'water_rate_basic',
      value: '15000',
      type: 'NUMBER' as const,
      description: 'Tarifa básica del agua (COP)',
    },
    {
      key: 'water_rate_per_m3',
      value: '2500',
      type: 'NUMBER' as const,
      description: 'Tarifa por metro cúbico adicional (COP)',
    },
    {
      key: 'maintenance_fee',
      value: '5000',
      type: 'NUMBER' as const,
      description: 'Tarifa de mantenimiento mensual (COP)',
    },
    {
      key: 'invoice_due_days',
      value: '30',
      type: 'NUMBER' as const,
      description: 'Días para vencimiento de factura',
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ Configuraciones del sistema creadas:', settings.length);

  // Crear página de inicio con GrapesJS
  // Cargar páginas convertidas
  await seedPagesFromConvertedFiles();

  console.log('✅ Todas las páginas han sido creadas desde los archivos convertidos');

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