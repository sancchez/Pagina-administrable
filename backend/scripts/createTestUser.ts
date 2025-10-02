import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('=== Verificando usuarios existentes ===');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    });
    
    console.log('Usuarios encontrados:', users.length);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - Activo: ${user.isActive}`);
    });
    
    // Buscar usuario admin
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!adminUser) {
      console.log('\n=== Creando usuario admin ===');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true
        }
      });
      
      console.log('Usuario admin creado:', adminUser.email);
    } else {
      console.log('\nUsuario admin ya existe:', adminUser.email);
      
      // Verificar si está activo
      if (!adminUser.isActive) {
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { isActive: true }
        });
        console.log('Usuario admin activado');
      }
    }
    
    console.log('\n✅ Usuario admin listo para usar:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();