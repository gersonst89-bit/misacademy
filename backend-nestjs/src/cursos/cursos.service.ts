import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CursosRepository } from './cursos.repository';
import {
  CreateCursoDto,
  UpdateCursoDto,
  CambiarEstadoDto,
} from './dto/cursos.dto';
import { DataSource } from 'typeorm';
import { Curso } from '../entities/curso.entity';

@Injectable()
export class CursosService {
  constructor(
    private readonly cursosRepo: CursosRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: any) {
    const page = query.page || 1;
    const perPage = query.per_page || 15;
    return this.cursosRepo.findAll(query, page, perPage);
  }

  async findById(id: number) {
    const curso = await this.cursosRepo.findById(id);
    if (!curso)
      throw new HttpException('Curso no encontrado', HttpStatus.NOT_FOUND);
    return curso;
  }

  async findBySlug(slug: string) {
    const curso = await this.cursosRepo.findBySlug(slug);
    if (!curso)
      throw new HttpException('Curso no encontrado', HttpStatus.NOT_FOUND);
    return curso;
  }

  async getDestacados(limit?: number) {
    return this.cursosRepo.findDestacados(limit);
  }

  async buscar(query: string, page = 1, perPage = 15) {
    return this.cursosRepo.buscar(query, page, perPage);
  }

  async create(dto: CreateCursoDto, userId: number) {
    const { rutas, ...data } = dto;
    const cursoData: any = {
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      descripcion_corta: dto.descripcion_corta,
      descripcion_larga: dto.descripcion_larga,
      objetivos: dto.objetivos !== undefined ? dto.objetivos : dto.lo_que_aprenderas,
      requisitos: dto.requisitos,
      nivel: dto.nivel,
      precio: dto.precio,
      precio_descuento: dto.precio_descuento,
      duracion_horas: dto.duracion_horas !== undefined ? dto.duracion_horas : dto.duracion,
      tiempo: dto.tiempo,
      imagen: dto.imagen,
      video_preview: dto.video_preview !== undefined ? dto.video_preview : dto.video_previsualizacion,
      estado: dto.estado,
      destacado: dto.destacado,
      id_docente: dto.id_docente || userId,
    };

    // Usamos transacción para garantizar ACID
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const curso = await queryRunner.manager.save(
        queryRunner.manager.create(Curso, {
          ...cursoData,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        }),
      );

      if (rutas?.length) {
        await this.cursosRepo.assignRutas(
          curso.id_curso,
          rutas,
          queryRunner.manager,
        );
      }
      await queryRunner.commitTransaction();
      return this.findById(curso.id_curso);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        'Error al crear el curso: ' + err.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, dto: UpdateCursoDto) {
    const { rutas, ...data } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const updateData: any = {
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      descripcion_corta: dto.descripcion_corta,
      descripcion_larga: dto.descripcion_larga,
      objetivos: dto.objetivos !== undefined ? dto.objetivos : dto.lo_que_aprenderas,
      requisitos: dto.requisitos,
      nivel: dto.nivel,
      precio: dto.precio,
      precio_descuento: dto.precio_descuento,
      duracion_horas: dto.duracion_horas !== undefined ? dto.duracion_horas : dto.duracion,
      tiempo: dto.tiempo,
      imagen: dto.imagen,
      video_preview: dto.video_preview !== undefined ? dto.video_preview : dto.video_previsualizacion,
      estado: dto.estado,
      destacado: dto.destacado,
      id_docente: dto.id_docente,
    };

    // Remove undefined fields to not overwrite with null if not intended (optional)
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    try {
      // Usar el queryRunner.manager para que la actualización sea parte de la transacción
      await queryRunner.manager.update(
        Curso,
        { id_curso: id },
        { ...updateData, fecha_actualizacion: new Date() },
      );

      if (rutas) {
        await this.cursosRepo.assignRutas(id, rutas, queryRunner.manager);
      }
      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        'Error al actualizar el curso: ' + err.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async cambiarEstado(id: number, dto: CambiarEstadoDto) {
    return this.cursosRepo.update(id, { estado: dto.estado });
  }

  async delete(id: number) {
    await this.cursosRepo.delete(id);
    return { message: 'Curso eliminado correctamente' };
  }

  async getContenido(cursoId: number, userId: number) {
    return this.cursosRepo.getContenido(cursoId, userId);
  }

  async getProgreso(cursoId: number, userId: number) {
    return this.cursosRepo.getProgreso(cursoId, userId);
  }

  async getMisCursos(userId: number) {
    return this.cursosRepo.getMisCursos(userId);
  }
}
