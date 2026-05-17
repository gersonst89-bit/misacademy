import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { LeccionesRepository } from './lecciones.repository';
import {
  CreateLeccionDto,
  UpdateLeccionDto,
  CompletarLeccionDto,
  ComentarioDto,
  HeartbeatDto,
} from './dto/lecciones.dto';

@Injectable()
export class LeccionesService {
  constructor(private readonly leccionesRepo: LeccionesRepository) {}

  async findById(id: number) {
    const lec = await this.leccionesRepo.findById(id);
    if (!lec)
      throw new HttpException('Lección no encontrada', HttpStatus.NOT_FOUND);
    return lec;
  }
  async findByModulo(moduloId: number) {
    return this.leccionesRepo.findByModulo(moduloId);
  }
  async findByCurso(cursoId: number) {
    return this.leccionesRepo.findByCurso(cursoId);
  }
  async findAll(
    page?: number,
    perPage?: number,
    query?: string,
    id_modulo?: number,
    estado?: string,
  ) {
    return this.leccionesRepo.findAll(page, perPage, {
      query,
      id_modulo,
      estado,
    });
  }
  async create(dto: CreateLeccionDto) {
    return this.leccionesRepo.create(dto);
  }
  async update(id: number, dto: UpdateLeccionDto) {
    return this.leccionesRepo.update(id, dto);
  }
  async delete(id: number) {
    await this.leccionesRepo.delete(id);
    return { message: 'Lección eliminada' };
  }

  async completar(leccionId: number, userId: number, dto: CompletarLeccionDto) {
    const result = await this.leccionesRepo.completar(leccionId, userId, dto);
    if (!result)
      throw new HttpException(
        'No se pudo completar la lección',
        HttpStatus.BAD_REQUEST,
      );
    return { message: 'Lección completada', progreso: result };
  }

  async navegacion(leccionId: number) {
    const result = await this.leccionesRepo.navegacion(leccionId);
    if (!result)
      throw new HttpException('Lección no encontrada', HttpStatus.NOT_FOUND);
    return result;
  }

  async getComentarios(leccionId: number) {
    return this.leccionesRepo.getComentarios(leccionId);
  }
  async addComentario(leccionId: number, userId: number, dto: ComentarioDto) {
    return this.leccionesRepo.addComentario(leccionId, userId, dto.contenido);
  }
  async deleteComentario(id: number) {
    await this.leccionesRepo.deleteComentario(id);
    return { message: 'Comentario eliminado' };
  }
  async heartbeat(userId: number, dto: HeartbeatDto) {
    return this.leccionesRepo.heartbeat(userId, dto);
  }
}
