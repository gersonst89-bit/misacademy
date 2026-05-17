import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Leccion } from '../entities/leccion.entity';
import { ComentarioLeccion } from '../entities/comentario-leccion.entity';
import { ProgresoEstudiante } from '../entities/progreso-estudiante.entity';
import { Inscripcion } from '../entities/inscripcion.entity';
import { Modulo } from '../entities/modulo.entity';

export interface LeccionFilters {
  query?: string;
  id_modulo?: number;
  estado?: string;
}

@Injectable()
export class LeccionesRepository {
  constructor(
    @InjectRepository(Leccion) private readonly leccionRepo: Repository<Leccion>,
    @InjectRepository(ComentarioLeccion) private readonly comentarioRepo: Repository<ComentarioLeccion>,
    @InjectRepository(ProgresoEstudiante) private readonly progresoRepo: Repository<ProgresoEstudiante>,
    @InjectRepository(Inscripcion) private readonly inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(Modulo) private readonly moduloRepo: Repository<Modulo>,
  ) {}

  async findById(id: number) { return this.leccionRepo.findOne({ where: { id_leccion: id }, relations: ['modulo', 'modulo.curso'] }); }
  async findByModulo(moduloId: number) { return this.leccionRepo.find({ where: { id_modulo: moduloId }, order: { orden: 'ASC' } }); }
  async findByCurso(cursoId: number) { 
    return this.leccionRepo.find({ 
      where: { modulo: { id_curso: cursoId } }, 
      relations: ['modulo'],
      order: { orden: 'ASC' } 
    }); 
  }
  async create(data: Partial<Leccion> & { duracion?: number }) { 
    if (data.duracion && !data.duracion_minutos) {
      data.duracion_minutos = data.duracion;
    }
    return this.leccionRepo.save(this.leccionRepo.create(data as Leccion)); 
  }
  async update(id: number, data: Partial<Leccion> & { duracion?: number }) { 
    if (data.duracion !== undefined && data.duracion_minutos === undefined) {
      data.duracion_minutos = data.duracion;
    }
    // Remove relation objects from update data to avoid TypeORM errors
    const { modulo, ...updateData } = data;
    await this.leccionRepo.update({ id_leccion: id }, updateData as QueryDeepPartialEntity<Leccion>); 
    return this.findById(id); 
  }

  async delete(id: number) { 
    // 1. Limpiar comentarios relacionados
    await this.comentarioRepo.delete({ id_leccion: id });
    
    // 2. Limpiar progreso de estudiantes
    await this.progresoRepo.delete({ id_leccion: id });

    // 3. Finalmente borrar la lección
    await this.leccionRepo.delete({ id_leccion: id }); 
  }
  async findAll(page = 1, perPage = 20, filters: LeccionFilters = {}) {
    const qb = this.leccionRepo.createQueryBuilder('l');
    qb.leftJoinAndSelect('l.modulo', 'm');
    qb.leftJoinAndSelect('m.curso', 'c');
    
    if (filters.query) {
      qb.andWhere('(l.titulo LIKE :q OR l.descripcion LIKE :q)', { q: `%${filters.query}%` });
    }
    
    if (filters.id_modulo) {
      qb.andWhere('l.id_modulo = :mod', { mod: filters.id_modulo });
    }
    
    if (filters.estado) {
      qb.andWhere('l.estado = :est', { est: filters.estado });
    }

    qb.orderBy('l.orden', 'ASC');
    
    const [data, total] = await qb.skip((page - 1) * perPage).take(perPage).getManyAndCount();
    
    return { 
      data, 
      total, 
      current_page: page, 
      per_page: perPage, 
      last_page: Math.ceil(total / perPage) 
    };
  }

  async completar(leccionId: number, userId: number, data: Partial<ProgresoEstudiante>) {
    const leccion = await this.leccionRepo.findOne({ where: { id_leccion: leccionId }, relations: ['modulo'] });
    if (!leccion) return null;
    const inscripcion = await this.inscripcionRepo.findOne({ where: { id_usuario: userId, id_curso: leccion.modulo.id_curso } });
    if (!inscripcion) return null;

    let progreso = await this.progresoRepo.findOne({ where: { id_inscripcion: inscripcion.id_inscripcion, id_leccion: leccionId } });
    if (!progreso) {
      progreso = this.progresoRepo.create({
        id_inscripcion: inscripcion.id_inscripcion,
        id_leccion: leccionId,
        estado: 'Completado',
        porcentaje_completado: 100,
        fecha_completado: new Date(),
        ultima_actividad: new Date(),
        ...data,
      });
    } else {
      progreso.estado = 'Completado';
      progreso.porcentaje_completado = data.porcentaje_completado || 100;
      progreso.fecha_completado = new Date();
      progreso.ultima_actividad = new Date();
      if (data.ultimo_segundo_visto) progreso.ultimo_segundo_visto = data.ultimo_segundo_visto;
      if (data.segmentos_vistos) progreso.segmentos_vistos = data.segmentos_vistos;
      if (data.duracion_video) progreso.duracion_video = data.duracion_video;
    }
    return this.progresoRepo.save(progreso);
  }

  async navegacion(leccionId: number) {
    const leccion = await this.leccionRepo.findOne({ where: { id_leccion: leccionId }, relations: ['modulo'] });
    if (!leccion) return null;
    const lecciones = await this.leccionRepo.find({ where: { id_modulo: leccion.id_modulo }, order: { orden: 'ASC' } });
    const idx = lecciones.findIndex(l => l.id_leccion === leccionId);
    return {
      anterior: idx > 0 ? lecciones[idx - 1] : null,
      actual: leccion,
      siguiente: idx < lecciones.length - 1 ? lecciones[idx + 1] : null,
    };
  }

  async getComentarios(leccionId: number) {
    return this.comentarioRepo.find({ where: { id_leccion: leccionId }, relations: ['usuario'], order: { fecha_comentario: 'DESC' } });
  }

  async addComentario(leccionId: number, userId: number, contenido: string) {
    return this.comentarioRepo.save(this.comentarioRepo.create({ id_leccion: leccionId, id_usuario: userId, contenido, fecha_comentario: new Date() }));
  }

  async deleteComentario(comentarioId: number) { await this.comentarioRepo.delete({ id_comentario: comentarioId }); }

  async heartbeat(userId: number, data: { id_leccion: number; ultimo_segundo_visto?: number; segmentos_vistos?: string; duracion_video?: number; porcentaje_completado?: number; primera_visualizacion?: Date }) {
    const leccion = await this.leccionRepo.findOne({ where: { id_leccion: data.id_leccion }, relations: ['modulo'] });
    if (!leccion) return null;
    const inscripcion = await this.inscripcionRepo.findOne({ where: { id_usuario: userId, id_curso: leccion.modulo.id_curso } });
    if (!inscripcion) return null;

    let progreso = await this.progresoRepo.findOne({ where: { id_inscripcion: inscripcion.id_inscripcion, id_leccion: data.id_leccion } });
    if (!progreso) {
      progreso = this.progresoRepo.create({
        id_inscripcion: inscripcion.id_inscripcion, id_leccion: data.id_leccion,
        estado: 'En Progreso', ultima_actividad: new Date(),
        ...(data.primera_visualizacion === undefined ? { primera_visualizacion: new Date() } : {}),
      });
    }
    if (data.ultimo_segundo_visto !== undefined) progreso.ultimo_segundo_visto = data.ultimo_segundo_visto;
    if (data.segmentos_vistos !== undefined) progreso.segmentos_vistos = data.segmentos_vistos;
    if (data.duracion_video !== undefined) progreso.duracion_video = data.duracion_video;
    if (data.porcentaje_completado !== undefined) progreso.porcentaje_completado = data.porcentaje_completado;
    progreso.ultima_actividad = new Date();
    return this.progresoRepo.save(progreso);
  }
}
