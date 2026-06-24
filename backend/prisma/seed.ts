import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { socorroPages, BRAND } from './socorroPages';

const prisma = new PrismaClient();

interface ConvertedPage {
  title: string;
  slug: string;
  gjsHtml: string;
  gjsCss: string;
  gjsComponents: string;
  gjsStyles: string;
}

/**
 * Siembra las páginas del sitio.
 *  - Si existe `temp/converted-pages/*.json` (generado por el script
 *    `import:pages` a partir del HTML real del cliente), usa esos archivos.
 *  - Si no, siembra el sitio base de "Acueducto El Socorro" (socorroPages.ts).
 * Todas las páginas quedan publicadas y editables desde el editor.
 */
async function seedPages() {
  const convertedPagesPath = path.resolve(__dirname, '../temp/converted-pages');
  const hasConverted =
    fs.existsSync(convertedPagesPath) &&
    fs.readdirSync(convertedPagesPath).some((f) => f.endsWith('.json'));

  if (hasConverted) {
    const files = fs.readdirSync(convertedPagesPath).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const data: ConvertedPage = JSON.parse(
          fs.readFileSync(path.join(convertedPagesPath, file), 'utf-8')
        );
        await prisma.page.upsert({
          where: { slug: data.slug },
          update: {
            title: data.title,
            gjsHtml: data.gjsHtml,
            gjsCss: data.gjsCss,
            gjsComponents: data.gjsComponents,
            gjsStyles: data.gjsStyles,
            publishedHtml: data.gjsHtml,
            isPublished: true,
          },
          create: {
            slug: data.slug,
            title: data.title,
            gjsHtml: data.gjsHtml,
            gjsCss: data.gjsCss,
            gjsComponents: data.gjsComponents,
            gjsStyles: data.gjsStyles,
            publishedHtml: data.gjsHtml,
            publishedCss: data.gjsCss,
            isPublished: true,
          },
        });
        console.log(`✅ Página importada: ${data.title} (${data.slug})`);
      } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error);
      }
    }
    return;
  }

  // Sitio base de El Socorro
  for (const page of socorroPages) {
    if (page.kind === 'special') {
      // _header / _footer: se guardan en html/publishedHtml (para el render
      // público) y TAMBIÉN en gjsHtml, para que el editor los pueda abrir y
      // editar (el editor carga gjsHtml; con solo `html` + css vacío no cargaba).
      await prisma.page.upsert({
        where: { slug: page.slug },
        update: { title: page.title, html: page.html, gjsHtml: page.html, gjsComponents: '[]', publishedHtml: page.html, isPublished: true },
        create: {
          slug: page.slug,
          title: page.title,
          html: page.html,
          css: '',
          gjsHtml: page.html,
          gjsCss: '',
          gjsComponents: '[]',
          gjsStyles: '[]',
          publishedHtml: page.html,
          publishedCss: '',
          isPublished: true,
        },
      });
    } else {
      // Páginas normales: gjsHtml editable + publishedHtml para el público
      await prisma.page.upsert({
        where: { slug: page.slug },
        update: { title: page.title, gjsHtml: page.html, gjsComponents: '[]', gjsStyles: '[]', publishedHtml: page.html, isPublished: true },
        create: {
          slug: page.slug,
          title: page.title,
          gjsHtml: page.html,
          gjsCss: '',
          gjsComponents: '[]',
          gjsStyles: '[]',
          publishedHtml: page.html,
          publishedCss: '',
          isPublished: true,
        },
      });
    }
    console.log(`✅ Página creada: ${page.title} (${page.slug})`);
  }
}

async function main() {
  console.log(`🌱 Iniciando seed — ${BRAND}...`);

  // Usuario administrador (credenciales demo del cliente)
  const adminPassword = await bcrypt.hash('socorro2026', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@elsocorro.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@elsocorro.com',
      password: adminPassword,
      firstName: 'Administrador',
      lastName: 'El Socorro',
      role: 'ADMIN',
      phone: '(607) 000 0000',
    },
  });
  console.log('✅ Admin creado:', admin.email, '(contraseña: socorro2026)');

  // Un par de usuarios de ejemplo para el portal
  const userPassword = await bcrypt.hash('user123', 12);
  const sampleUsers = [
    { email: 'juan.perez@email.com', firstName: 'Juan', lastName: 'Pérez', phone: '300 111 2222' },
    { email: 'maria.garcia@email.com', firstName: 'María', lastName: 'García', phone: '300 333 4444' },
  ];
  for (const u of sampleUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: userPassword, role: 'USER' },
    });
  }
  console.log('✅ Usuarios de ejemplo creados:', sampleUsers.length);

  // Configuración del sistema
  const settings = [
    { key: 'company_name', value: BRAND, type: 'STRING' as const, description: 'Nombre de la empresa' },
    { key: 'company_address', value: 'Carrera 5 #10-20, El Socorro', type: 'STRING' as const, description: 'Dirección' },
    { key: 'company_phone', value: '(607) 000 0000', type: 'STRING' as const, description: 'Teléfono' },
    { key: 'company_email', value: 'info@elsocorro.com', type: 'STRING' as const, description: 'Email de contacto' },
    { key: 'water_rate_basic', value: '15000', type: 'NUMBER' as const, description: 'Tarifa básica del agua (COP)' },
    { key: 'water_rate_per_m3', value: '2500', type: 'NUMBER' as const, description: 'Tarifa por m³ adicional (COP)' },
    { key: 'maintenance_fee', value: '5000', type: 'NUMBER' as const, description: 'Tarifa de mantenimiento mensual (COP)' },
    { key: 'invoice_due_days', value: '30', type: 'NUMBER' as const, description: 'Días para vencimiento de factura' },
  ];
  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Configuraciones del sistema creadas:', settings.length);

  await seedPages();

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
