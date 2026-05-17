import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.rol || user.rol.nombre_rol?.toLowerCase() !== 'administrador') {
      throw new ForbiddenException('No autorizado. Se requiere rol de Administrador.');
    }
    return true;
  }
}

@Injectable()
export class DocenteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.rol || user.rol.nombre_rol?.toLowerCase() !== 'docente') {
      throw new ForbiddenException('No autorizado. Se requiere rol de Docente.');
    }
    return true;
  }
}

@Injectable()
export class AdminOrDocenteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const rol = user?.rol?.nombre_rol?.toLowerCase();
    if (!user || !rol || (rol !== 'administrador' && rol !== 'docente' && rol !== 'instructor')) {
      throw new ForbiddenException('No autorizado. Se requiere rol de Administrador, Docente o Instructor.');
    }
    return true;
  }
}
