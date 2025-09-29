import { PrismaClient, UserRole, ReportStatus, ReportType, Priority, PQRType, PQRStatus, InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PasswordService } from '../src/utils/password';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('👥 Seeding users...');

  // Crear usuario administrador
  const adminPassword = await PasswordService.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@adminpanel.com' },
    update: {},
    create: {
      email: 'admin@adminpanel.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: UserRole.ADMIN
    }
  });

  // Crear usuario manager
  const managerPassword = await PasswordService.hash('manager123');
  const manager = await prisma.user.upsert({
    where: { email: 'manager@adminpanel.com' },
    update: {},
    create: {
      email: 'manager@adminpanel.com',
      password: managerPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: UserRole.MANAGER
    }
  });

  // Crear usuarios regulares
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const userPassword = await PasswordService.hash(`user${i}123`);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        password: userPassword,
        firstName: `User${i}`,
        lastName: `Test`,
        role: UserRole.USER
      }
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length + 2} users`);
  return { admin, manager, users };
}

async function seedReports(users: any[]) {
  console.log('📊 Seeding reports...');

  const reports = [];
  const reportTitles = [
    'Análisis de Ventas Q1',
    'Reporte de Usuarios Activos',
    'Estadísticas de Rendimiento',
    'Informe de Errores del Sistema',
    'Análisis de Satisfacción del Cliente'
  ];

  for (let i = 0; i < reportTitles.length; i++) {
    const user = users[i % users.length];
    const report = await prisma.report.create({
      data: {
        title: reportTitles[i],
        description: `Descripción detallada del ${reportTitles[i].toLowerCase()}`,
        content: `Contenido completo del reporte: ${reportTitles[i]}. Este es un reporte de ejemplo con datos ficticios para demostrar la funcionalidad del sistema.`,
        status: i % 3 === 0 ? ReportStatus.COMPLETED : i % 3 === 1 ? ReportStatus.IN_PROGRESS : ReportStatus.PENDING,
        type: i % 2 === 0 ? ReportType.SALES : ReportType.SYSTEM,
        priority: i % 3 === 0 ? Priority.HIGH : i % 3 === 1 ? Priority.MEDIUM : Priority.LOW,
        userId: user.id
      }
    });

    // Agregar algunos comentarios
    if (i % 2 === 0) {
      await prisma.reportComment.create({
        data: {
          content: 'Excelente análisis, muy detallado.',
          reportId: report.id,
          userId: users[(i + 1) % users.length].id
        }
      });
    }

    reports.push(report);
  }

  console.log(`✅ Created ${reports.length} reports`);
  return reports;
}

async function seedPQRs(users: any[]) {
  console.log('📝 Seeding PQRs...');

  const pqrs = [];
  const pqrData = [
    { type: PQRType.PETICION, subject: 'Solicitud de nueva funcionalidad', description: 'Me gustaría solicitar la implementación de un sistema de notificaciones push.' },
    { type: PQRType.QUEJA, subject: 'Problema con el sistema de login', description: 'He tenido dificultades para acceder al sistema en múltiples ocasiones.' },
    { type: PQRType.RECLAMO, subject: 'Error en la facturación', description: 'Se ha cobrado incorrectamente en mi última factura.' },
    { type: PQRType.PETICION, subject: 'Acceso a reportes históricos', description: 'Necesito acceso a los reportes del año anterior para análisis.' },
    { type: PQRType.QUEJA, subject: 'Lentitud en el sistema', description: 'El sistema ha estado muy lento durante las últimas semanas.' }
  ];

  for (let i = 0; i < pqrData.length; i++) {
    const user = users[i % users.length];
    const pqr = await prisma.pQR.create({
      data: {
        type: pqrData[i].type,
        subject: pqrData[i].subject,
        description: pqrData[i].description,
        status: i % 3 === 0 ? PQRStatus.RESOLVED : i % 3 === 1 ? PQRStatus.IN_PROGRESS : PQRStatus.PENDING,
        priority: i % 2 === 0 ? Priority.HIGH : Priority.MEDIUM,
        userId: user.id
      }
    });

    pqrs.push(pqr);
  }

  console.log(`✅ Created ${pqrs.length} PQRs`);
  return pqrs;
}

async function seedInvoices(users: any[]) {
  console.log('💰 Seeding invoices...');

  const invoices = [];
  
  for (let i = 1; i <= 10; i++) {
    const user = users[i % users.length];
    const amount = Math.floor(Math.random() * 1000) + 100;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (Math.floor(Math.random() * 60) - 30)); // Entre -30 y +30 días

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${String(i).padStart(4, '0')}`,
        amount: amount,
        description: `Factura de servicios #${i}`,
        dueDate: dueDate,
        status: i % 4 === 0 ? InvoiceStatus.PAID : i % 4 === 1 ? InvoiceStatus.OVERDUE : InvoiceStatus.PENDING,
        userId: user.id
      }
    });

    // Crear items de factura
    await prisma.invoiceItem.createMany({
      data: [
        {
          description: 'Servicio Premium',
          quantity: 1,
          unitPrice: amount * 0.7,
          total: amount * 0.7,
          invoiceId: invoice.id
        },
        {
          description: 'Soporte Técnico',
          quantity: 1,
          unitPrice: amount * 0.3,
          total: amount * 0.3,
          invoiceId: invoice.id
        }
      ]
    });

    // Crear pagos para facturas pagadas
    if (invoice.status === InvoiceStatus.PAID) {
      await prisma.payment.create({
        data: {
          amount: amount,
          paymentMethod: i % 2 === 0 ? PaymentMethod.CREDIT_CARD : PaymentMethod.BANK_TRANSFER,
          transactionId: `TXN-${Date.now()}-${i}`,
          status: PaymentStatus.COMPLETED,
          invoiceId: invoice.id,
          userId: user.id
        }
      });
    }

    invoices.push(invoice);
  }

  console.log(`✅ Created ${invoices.length} invoices`);
  return invoices;
}

async function seedPages() {
  console.log('📄 Seeding pages...');

  const pages = [];
  const pageData = [
    {
      title: 'Página de Inicio',
      slug: 'inicio',
      content: '<h1>Bienvenido</h1><p>Esta es la página de inicio de nuestro sitio web.</p>',
      metaTitle: 'Inicio - Admin Panel',
      metaDescription: 'Página de inicio del panel de administración',
      isPublished: true
    },
    {
      title: 'Acerca de Nosotros',
      slug: 'acerca-de',
      content: '<h1>Acerca de Nosotros</h1><p>Información sobre nuestra empresa y servicios.</p>',
      metaTitle: 'Acerca de Nosotros - Admin Panel',
      metaDescription: 'Conoce más sobre nuestra empresa y servicios',
      isPublished: true
    },
    {
      title: 'Contacto',
      slug: 'contacto',
      content: '<h1>Contacto</h1><p>Información de contacto y formulario.</p>',
      metaTitle: 'Contacto - Admin Panel',
      metaDescription: 'Ponte en contacto con nosotros',
      isPublished: false
    }
  ];

  for (const pageInfo of pageData) {
    const page = await prisma.page.create({
      data: {
        ...pageInfo,
        grapesData: JSON.stringify({
          'gjs-html': pageInfo.content,
          'gjs-css': 'body { font-family: Arial, sans-serif; }',
          'gjs-components': [],
          'gjs-styles': []
        })
      }
    });

    pages.push(page);
  }

  console.log(`✅ Created ${pages.length} pages`);
  return pages;
}

async function main() {
  try {
    console.log('🌱 Starting database seeding...');

    // Conectar a la base de datos
    await prisma.$connect();
    console.log('✅ Database connected');

    // Ejecutar seeds
    const { admin, manager, users } = await seedUsers();
    const allUsers = [admin, manager, ...users];
    
    await seedReports(allUsers);
    await seedPQRs(allUsers);
    await seedInvoices(allUsers);
    await seedPages();

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📋 Seeded data summary:
- Users: ${allUsers.length} (1 admin, 1 manager, ${users.length} regular users)
- Reports: 5 with comments
- PQRs: 5 with different types and statuses
- Invoices: 10 with payments for paid invoices
- Pages: 3 with GrapesJS data

🔑 Default credentials:
- Admin: admin@adminpanel.com / admin123
- Manager: manager@adminpanel.com / manager123
- Users: user1@example.com / user1123 (user1-user5)
    `);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar seeding
main();