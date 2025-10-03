import { PrismaClient, User } from '@prisma/client';
import db from '../config/database';
import { PasswordService } from '../utils/password';
import { createError } from '../middleware/errorHandler';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class UserService {
  static async createUser(data: CreateUserData): Promise<Omit<User, 'password'>> {
    // Verificar si el usuario ya existe
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw createError(409, 'El usuario ya existe con este email');
    }

    // Validar contraseña
    if (!PasswordService.validate(data.password).isValid) {
      throw createError(400, 'La contraseña no cumple con los requisitos de seguridad');
    }

    // Hash de la contraseña
    const hashedPassword = await PasswordService.hash(data.password);

    // Crear usuario
    const user = await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const user = await db.user.findUnique({
      where: { email },
    });

    return user;
  }

  static async updateUser(id: string, data: UpdateUserData): Promise<Omit<User, 'password'>> {
    // Verificar que el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw createError(404, 'Usuario no encontrado');
    }

    // Actualizar usuario
    const user = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async deleteUser(id: string): Promise<void> {
    // Verificar que el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw createError(404, 'Usuario no encontrado');
    }

    // Soft delete - marcar como inactivo
    await db.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async getUsers(filters: UserFilters = {}) {
    const {
      search,
      role,
      isActive,
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    // Construir condiciones de filtro
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Obtener usuarios y total
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserStats() {
    const [total, active, inactive, byRole] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { isActive: false } }),
      db.user.groupBy({
        by: ['role'],
        _count: {
          id: true,
        },
      }),
    ]);

    const roleStats = byRole.reduce((acc: Record<string, number>, item: { role: string; _count: { id: number } }) => {
      acc[item.role] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      byRole: roleStats,
    };
  }

  static async changeUserRole(id: string, role: string): Promise<Omit<User, 'password'>> {
    // Verificar que el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw createError(404, 'Usuario no encontrado');
    }

    // Actualizar rol
    const user = await db.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async toggleUserStatus(id: string): Promise<Omit<User, 'password'>> {
    // Verificar que el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw createError(404, 'Usuario no encontrado');
    }

    // Cambiar estado
    const user = await db.user.update({
      where: { id },
      data: { isActive: !existingUser.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}