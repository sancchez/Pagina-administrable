import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { User, Page, Invoice } from '../types/database.types';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    console.log('📊 Base de datos SQLite conectada');
    
    // Verificar si ya existen datos
    const userCount = await this.user.count();
    if (userCount === 0) {
      console.log('📝 Base de datos vacía, creando datos iniciales...');
      await this.seedDatabase();
    } else {
      console.log('✅ Base de datos ya tiene datos:', {
        usuarios: await this.user.count(),
        páginas: await this.page.count(),
        facturas: await this.invoice.count()
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async seedDatabase() {
    console.log('Creando usuario admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Usuario admin
    await this.user.create({
      data: {
        email: 'admin@acueducto.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin'
      }
    });

    // Páginas de ejemplo
    await this.page.createMany({
      data: [
        {
          title: 'Inicio',
          slug: 'home',
          content: '<h1>Bienvenido al Acueducto Municipal</h1><p>Agua pura para tu comunidad</p>',
          published: true
        },
        {
          title: 'Quiénes Somos',
          slug: 'quienes-somos',
          content: '<h1>Quiénes Somos</h1><p>Información sobre el acueducto municipal</p>',
          published: true
        }
      ]
    });

    // Facturas de ejemplo
    await this.invoice.createMany({
      data: [
        {
          accountNumber: '12345',
          customerName: 'Juan Pérez',
          amount: 45000,
          description: 'Factura de agua - Enero 2024',
          status: 'paid',
          dueDate: '2024-01-31'
        },
        {
          accountNumber: '12346',
          customerName: 'María González',
          amount: 52000,
          description: 'Factura de agua - Enero 2024',
          status: 'pending',
          dueDate: '2024-01-31'
        }
      ]
    });

    console.log('Base de datos SQLite inicializada con datos de ejemplo');
    console.log('Usuario admin creado con email: admin@acueducto.com');
  }

  // Métodos para usuarios
  async findUserByEmail(email: string): Promise<User | null> {
    return this.user.findUnique({
      where: { email }
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.user.findUnique({
      where: { id }
    });
  }

  // Métodos para páginas
  async findPageBySlug(slug: string): Promise<Page | null> {
    return this.page.findUnique({
      where: { slug, published: true }  // ← Aquí está la validación
    });
  }

  async findAllPages(): Promise<Page[]> {
    return this.page.findMany();
  }

  async findPageById(id: number): Promise<Page | null> {
    return this.page.findUnique({
      where: { id }
    });
  }

  async createPage(pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page> {
    return this.page.create({
      data: pageData
    });
  }

  async updatePage(id: number, pageData: Partial<Page>): Promise<Page | null> {
    try {
      return await this.page.update({
        where: { id },
        data: pageData
      });
    } catch {
      return null;
    }
  }

  async deletePage(id: number): Promise<boolean> {
    try {
      await this.page.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  // Métodos para facturas
  async findInvoiceByAccount(accountNumber: string): Promise<Invoice | null> {
    return this.invoice.findUnique({
      where: { accountNumber }
    });
  }

  async findAllInvoices(): Promise<Invoice[]> {
    return this.invoice.findMany();
  }
}