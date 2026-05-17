import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CertificacionesRepository } from './certificaciones.repository';
import { CreateCertificacionDto } from './dto/certificaciones.dto';
@Injectable()
export class CertificacionesService {
  constructor(private readonly repo: CertificacionesRepository) {}
  async findAll(page?: number) { return this.repo.findAll(page); }
  async findById(id: number) { const c = await this.repo.findById(id); if (!c) throw new HttpException('Certificación no encontrada', HttpStatus.NOT_FOUND); return c; }
  async findByUsuario(userId: number) { return this.repo.findByUsuario(userId); }
  async buscarPorCodigo(codigo: string) { const c = await this.repo.findByCodigo(codigo); if (!c) throw new HttpException('Certificado no encontrado', HttpStatus.NOT_FOUND); return c; }
  async buscar(query: string) {
    const certs = await this.repo.buscar(query);
    
    // Reparar notas en caliente para certificados que tengan 0 o null
    for (const cert of certs) {
      try {
        const val = cert.calificacion_final;
        // Si la nota es nula, 0 o muy bajita (como 1.00), intentamos repararla/recalcularla
        if ((val === null || val === undefined || Number(val) <= 5) && cert.id_usuario && cert.id_curso) {
          const aprobado = await this.repo.manager.query(
            `SELECT i.puntaje_obtenido, i.puntaje_total FROM intentos_evaluacion i 
             JOIN evaluaciones e ON i.id_evaluacion = e.id_evaluacion
             WHERE i.id_usuario = ? AND e.id_curso = ? 
               AND (i.estado = 'Aprobado' OR i.estado = 'Finalizado')
             ORDER BY i.puntaje_obtenido DESC LIMIT 1`,
            [cert.id_usuario, cert.id_curso]
          );
          if (aprobado && aprobado.length > 0) {
            const { puntaje_obtenido, puntaje_total } = aprobado[0];
            const nota = puntaje_total > 0 ? (Number(puntaje_obtenido) / Number(puntaje_total)) * 100 : 0;
            cert.calificacion_final = nota;
            // Actualizar directamente en la tabla para evitar conflictos de entidad
            await this.repo.manager.query(
              `UPDATE certificaciones SET calificacion_final = ? WHERE id_certificacion = ?`,
              [nota, cert.id_certificacion]
            ).catch(e => console.error('Error actualizando nota:', e));
          }
        }
      } catch (e) {
        console.error('Error reparando nota:', e);
      }
    }
    return certs;
  }
  async create(dto: CreateCertificacionDto) { return this.repo.create(dto); }
  async update(id: number, dto: any) { return this.repo.update(id, dto); }
  async delete(id: number) { await this.repo.delete(id); return { message: 'Certificación eliminada' }; }

  // Nuevos métodos para automatización
  async verificarAprobacion(userId: number, cursoId: number): Promise<boolean> {
    // Buscamos si existe algún intento aprobado para este curso y usuario
    const intento = await this.repo.manager.query(
      `SELECT i.id_intento FROM intentos_evaluacion i 
       JOIN evaluaciones e ON i.id_evaluacion = e.id_evaluacion
       WHERE i.id_usuario = ? AND e.id_curso = ? AND i.estado = 'Aprobado' 
       LIMIT 1`,
      [userId, cursoId]
    );
    return intento && intento.length > 0;
  }

  async obtenerOCrear(userId: number, cursoId: number) {
    let cert = await this.repo.manager.getRepository('Certificacion').findOne({
      where: { id_usuario: userId, id_curso: cursoId }
    });

    if (!cert) {
      // Necesitamos el nombre del estudiante y su nota
      const usuario = await this.repo.manager.getRepository('Usuario').findOne({ where: { id_usuario: userId } });
      const nombreEstudiante = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Estudiante';
      
      // Obtener la nota del último intento aprobado
      const intentos = await this.repo.manager.query(
        `SELECT i.puntaje_obtenido, i.puntaje_total FROM intentos_evaluacion i
         JOIN evaluaciones e ON i.id_evaluacion = e.id_evaluacion
         WHERE i.id_usuario = ? AND e.id_curso = ? AND i.estado = 'Aprobado'
         ORDER BY i.fecha_inicio DESC LIMIT 1`,
        [userId, cursoId]
      );
      let calificacion = 0;
      if (intentos && intentos.length > 0) {
        const { puntaje_obtenido, puntaje_total } = intentos[0];
        calificacion = puntaje_total > 0 ? (Number(puntaje_obtenido) / Number(puntaje_total)) * 100 : 0;
      }

      cert = await this.repo.create({ 
        id_usuario: userId, 
        id_curso: cursoId,
        nombre_estudiante: nombreEstudiante,
        calificacion_final: calificacion,
        estado: 'Activo',
        fecha_emision: new Date()
      });
    }
    return cert;
  }
}
