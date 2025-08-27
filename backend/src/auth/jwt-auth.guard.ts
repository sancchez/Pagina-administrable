import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    
    // Para simplificar en desarrollo, aceptamos cualquier token
    // En producción aquí validarías el JWT real
    request.user = { userId: 1, email: 'admin@acueducto.com', role: 'admin' };
    return true;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('Acceso denegado: se requieren permisos de administrador');
    }
    
    return true;
  }
}