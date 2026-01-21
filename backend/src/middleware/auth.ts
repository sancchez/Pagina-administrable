import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '../utils/jwt';

// Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token = JwtService.extractTokenFromHeader(req.headers.authorization);

    // Fallback para tokens en query params (útil para descargas directas)
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
      });
      return;
    }

    const payload = JwtService.verifyAccessToken(token);
    req.user = payload;
    next();
    return;
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
    return;
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    const userRole = (req.user.role as string || '').toUpperCase();
    const allowedRoles = roles.map(r => r.toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      console.warn(`[Auth] Access denied for ${req.user.email}. Role: ${userRole}, Required: ${allowedRoles.join(', ')}`);
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
      });
      return;
    }

    next();
    return;
  };
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = JwtService.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const payload = JwtService.verifyAccessToken(token);
      req.user = payload;
    }

    next();
    return;
  } catch (error) {
    // Si el token es inválido, simplemente continúa sin usuario
    next();
    return;
  }
};