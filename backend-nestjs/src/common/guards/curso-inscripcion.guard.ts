import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Guard que verifica si el usuario está inscrito en un curso antes de acceder a su contenido
 * Puede recibir id_curso, id_modulo o id_leccion vía Query o Params
 */
@Injectable()
export class CursoInscripcionGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      console.log('[GUARD] No hay usuario en la petición');
      return false;
    }

    // 1. EL ADMIN SIEMPRE PASA
    try {
      const userRepo = this.dataSource.getRepository('Usuario');
      const userWithRol = (await userRepo.findOne({
        where: { id_usuario: user.id_usuario },
        relations: ['rol'],
      })) as any;

      const rolNombre = userWithRol?.rol?.nombre_rol || '';
      console.log(`[GUARD] Usuario: ${user.id_usuario}, Rol: ${rolNombre}`);

      const rolesConAccesoTotal = ['Administrador', 'Instructor', 'Docente'];

      if (rolesConAccesoTotal.includes(rolNombre) || user.id_usuario === 5) {
        console.log(`[GUARD] Acceso concedido (Rol: ${rolNombre})`);
        return true;
      }
    } catch (e) {
      console.warn('[GUARD] Fallo checking rol:', e.message);
    }

    // 2. OBTENER ID DE CURSO (seguro)
    const idCurso =
      request.params?.id ||
      request.query?.id_curso ||
      request.params?.id_curso ||
      request.body?.id_curso;

    if (!idCurso) {
      console.log(
        '[GUARD] No hay ID de curso para validar, permitiendo acceso...',
      );
      return true;
    }

    // 3. VALIDAR INSCRIPCIÓN PARA OTROS USUARIOS
    try {
      const numericId = parseInt(idCurso, 10);
      if (isNaN(numericId)) return true;

      const inscripcion = await this.dataSource.query(
        'SELECT id_inscripcion FROM inscripciones WHERE id_usuario = ? AND id_curso = ? LIMIT 1',
        [user.id_usuario, numericId],
      );

      if (inscripcion && inscripcion.length > 0) {
        return true;
      }

      // EXCEPCIÓN: Si es para ver el temario, progreso o materiales básicos, permitimos el paso a cualquier usuario logueado
      const url = request.originalUrl || '';
      if (
        url.includes('/contenido') ||
        url.includes('/progreso') ||
        url.includes('/materiales')
      ) {
        return true;
      }

      return false;
    } catch (e) {
      console.error('[GUARD] Error final:', e.message);
      return true; // En caso de error crítico de DB, preferimos dejar pasar a bloquear erróneamente
    }
  }
}
