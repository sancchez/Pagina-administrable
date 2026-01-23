import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando configuración de administrador y limpieza de demo...');

    const newAdminEmail = 'asomielrodas@gerencia.com';
    const newAdminPassword = 'AdministradoRAsomielrodaSESP';

    // Hash the password
    const hashedPassword = await bcrypt.hash(newAdminPassword, 12);

    // 1. Crear o actualizar el nuevo usuario administrador
    const admin = await prisma.user.upsert({
        where: { email: newAdminEmail },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
        },
        create: {
            email: newAdminEmail,
            password: hashedPassword,
            firstName: 'Asomiel',
            lastName: 'Rodas',
            role: 'ADMIN',
            isActive: true,
        },
    });

    console.log(`✅ Usuario administrador configurado: ${admin.email}`);

    // 2. Eliminar usuarios de demo actuales
    const demoEmails = [
        'admin@acueducto.com',
        'manager@acueducto.com',
        'juan.perez@email.com',
        'maria.garcia@email.com'
    ];

    console.log(`🧹 Eliminando usuarios demo: ${demoEmails.join(', ')}...`);

    const deleteResult = await prisma.user.deleteMany({
        where: {
            email: {
                in: demoEmails
            }
        }
    });

    console.log(`✅ Usuarios demo eliminados: ${deleteResult.count}`);
    console.log('🎉 Proceso completado exitosamente.');
}

main()
    .catch((e) => {
        console.error('❌ Error durante la ejecución:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
