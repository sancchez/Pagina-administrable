import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// override: igual que config/env.ts, el .env del proyecto manda sobre el sistema
dotenv.config({ override: true });

// Crea (o restablece) la cuenta demo que muestra el login del panel:
//   admin@acueducto.com / admin123
// Solo para desarrollo local. `setup:admin` borra esta cuenta a propósito en
// producción, así que aquí se bloquea con NODE_ENV=production salvo --force.
//
// Uso: npm run create:demo-admin

const DEMO_EMAIL = 'admin@acueducto.com';
const DEMO_PASSWORD = 'admin123';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    console.error('⛔ NODE_ENV=production: no se crea la cuenta demo (contraseña pública).');
    console.error('   Si de verdad la necesitas: npm run create:demo-admin -- --force');
    process.exit(1);
  }

  const password = await bcrypt.hash(DEMO_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password, role: 'ADMIN', isActive: true },
    create: {
      email: DEMO_EMAIL,
      password,
      firstName: 'Administrador',
      lastName: 'Demo',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Cuenta demo lista: ${admin.email} / ${DEMO_PASSWORD} (rol ${admin.role})`);
  console.log(`   Base de datos: ${process.env.DATABASE_URL}`);
}

main()
  .catch((e) => {
    console.error('❌ Error creando la cuenta demo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
