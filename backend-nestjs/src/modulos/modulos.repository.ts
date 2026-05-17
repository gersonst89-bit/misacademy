import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modulo } from '../entities/modulo.entity';
import { Leccion } from '../entities/leccion.entity';
import { Material } from '../entities/material.entity';

import { ComentarioLeccion } from '../entities/comentario-leccion.entity';
import { ProgresoEstudiante } from '../entities/progreso-estudiante.entity';

@Injectable()
export class ModulosRepository {
  constructor(
    @InjectRepository(Modulo) private readonly moduloRepo: Repository<Modulo>,
    @InjectRepository(Leccion)
    private readonly leccionRepo: Repository<Leccion>,
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
    @InjectRepository(ComentarioLeccion)
    private readonly comentarioRepo: Repository<ComentarioLeccion>,
    @InjectRepository(ProgresoEstudiante)
    private readonly progresoRepo: Repository<ProgresoEstudiante>,
  ) {}

  async findByCurso(cursoId: number) {
    const modulos = await this.moduloRepo.find({
      where: { id_curso: cursoId },
      order: { orden: 'ASC' },
    });
    for (const mod of modulos as any[]) {
      mod.lecciones = await this.leccionRepo.find({
        where: { id_modulo: mod.id_modulo },
        order: { orden: 'ASC' },
      });
      mod.materiales = await this.materialRepo.find({
        where: { id_modulo: mod.id_modulo },
        order: { orden: 'ASC' },
      });
    }
    return modulos;
  }

  async findById(id: number) {
    return this.moduloRepo.findOne({ where: { id_modulo: id } });
  }
  async create(data: any) {
    return this.moduloRepo.save(this.moduloRepo.create(data));
  }
  async update(id: number, data: any) {
    const { curso, lecciones, materiales, ...updateData } = data;
    await this.moduloRepo.update({ id_modulo: id }, updateData);
    return this.findById(id);
  }

  async delete(id: number) {
    // 1. Obtener todas las lecciones del módulo
    const lecciones = await this.leccionRepo.find({ where: { id_modulo: id } });
    const leccionIds = lecciones.map((l) => l.id_leccion);

    if (leccionIds.length > 0) {
      // 2. Limpiar comentarios de todas esas lecciones
      await this.comentarioRepo.delete({
        id_leccion: require('typeorm').In(leccionIds),
      });
      // 3. Limpiar progreso de todas esas lecciones
      await this.progresoRepo.delete({
        id_leccion: require('typeorm').In(leccionIds),
      });
      // 4. Borrar las lecciones
      await this.leccionRepo.delete({ id_modulo: id });
    }

    // 5. Borrar materiales
    await this.materialRepo.delete({ id_modulo: id });

    // 6. Finalmente borrar el módulo
    await this.moduloRepo.delete({ id_modulo: id });
  }
  async findAll(page = 1, perPage = 20, filters: any = {}) {
    const qb = this.moduloRepo.createQueryBuilder('m');
    qb.leftJoinAndSelect('m.curso', 'c');

    if (filters.query) {
      qb.andWhere('(m.titulo LIKE :q OR m.descripcion LIKE :q)', {
        q: `%${filters.query}%`,
      });
    }

    if (filters.id_curso) {
      qb.andWhere('m.id_curso = :cur', { cur: filters.id_curso });
    }

    if (filters.estado) {
      qb.andWhere('m.estado = :est', { est: filters.estado });
    }

    qb.orderBy('m.orden', 'ASC');

    const [data, total] = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return {
      data,
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    };
  }
}
