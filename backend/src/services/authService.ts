import { User, UserRole } from '@prisma/client';
import prisma from '../config/database';
import { PasswordService } from '../utils/password';
import { JwtService, JwtPayload, TokenPair } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  tokens: TokenPair;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw createError(401, 'Credenciales inválidas');
    }

    if (!user.isActive) {
      throw createError(401, 'Cuenta desactivada');
    }

    // Verificar contraseña
    const isPasswordValid = await PasswordService.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError(401, 'Credenciales inválidas');
    }

    // Generar tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = JwtService.generateTokenPair(payload);

    // Guardar refresh token en la base de datos
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Remover password del objeto user
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password, firstName, lastName, phone } = data;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw createError(409, 'El email ya está registrado');
    }

    // Validar contraseña
    const passwordValidation = PasswordService.validate(password);
    if (!passwordValidation.isValid) {
      throw createError(400, passwordValidation.errors.join(', '));
    }

    // Hash de la contraseña
    const hashedPassword = await PasswordService.hash(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: UserRole.USER, // Por defecto, los nuevos usuarios son USER
      },
    });

    // Generar tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = JwtService.generateTokenPair(payload);

    // Guardar refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Remover password del objeto user
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verificar refresh token
      const payload = JwtService.verifyRefreshToken(refreshToken);

      // Verificar que el refresh token existe en la base de datos
      const storedToken = await prisma.userSession.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw createError(401, 'Refresh token inválido o expirado');
      }

      if (!storedToken.user.isActive) {
        throw createError(401, 'Cuenta desactivada');
      }

      // Generar nuevos tokens
      const newPayload: JwtPayload = {
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      };

      const newTokens = JwtService.generateTokenPair(newPayload);

      // Actualizar refresh token en la base de datos
      await prisma.userSession.update({
        where: { id: storedToken.id },
        data: {
          refreshToken: newTokens.refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        },
      });

      return newTokens;
    } catch (error) {
      throw createError(401, 'Refresh token inválido');
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    await prisma.userSession.deleteMany({
      where: { refreshToken },
    });
  }

  static async logoutAll(userId: string): Promise<void> {
    await prisma.userSession.deleteMany({
      where: { userId },
    });
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError(404, 'Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await PasswordService.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw createError(400, 'Contraseña actual incorrecta');
    }

    // Validar nueva contraseña
    const passwordValidation = PasswordService.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw createError(400, passwordValidation.errors.join(', '));
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await PasswordService.hash(newPassword);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // Cerrar todas las sesiones del usuario
    await this.logoutAll(userId);
  }

  private static async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

    await prisma.userSession.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });
  }

  static async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError(404, 'Usuario no encontrado');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}