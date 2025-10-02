import bcrypt from 'bcryptjs';
import prisma from '../src/config/database';

async function createAdmin() {
  try {
    console.log('🔧 Creando usuario administrador...');
    
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acueducto.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ El usuario admin ya existe');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nombre:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('🔑 Rol:', existingAdmin.role);
      return;
    }
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Crear el usuario admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@acueducto.com',
        password: hashedPassword,
        firstName: 'Administrador',
        lastName: 'Sistema',
        phone: '+57 123 456 7890',
        role: 'ADMIN',
        isActive: true
      }
    });
    
    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Contraseña: admin123');
    console.log('👤 Nombre:', admin.firstName, admin.lastName);
    console.log('🔑 Rol:', admin.role);
    console.log('🆔 ID:', admin.id);
    
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();