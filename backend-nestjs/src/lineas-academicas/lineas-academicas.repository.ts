import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { LineaAcademica } from '../entities/linea-academica.entity';
import { RutaAcademica } from '../entities/ruta-academica.entity';

export interface LineaFilters {
  estado?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

@Injectable()
export class LineasAcademicasRepository {
  constructor(
    @InjectRepository(LineaAcademica)
    private readonly lineaRepo: Repository<LineaAcademica>,
    @InjectRepository(RutaAcademica)
    private readonly rutaRepo: Repository<RutaAcademica>,
  ) {}
  // Lineas
  async findAllLineas(filters: LineaFilters = {}, page = 1, perPage = 15): Promise<PaginatedResult<LineaAcademica>> {
    const where: FindOptionsWhere<LineaAcademica> = {};
    if (filters.estado) where.estado = filters.estado;
    const [data, total] = await this.lineaRepo.findAndCount({
      where,
      relations: ['rutas_academicas', 'rutas_academicas.cursos'],
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return {
      data,
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    };
  }
  async findLineaById(id: number): Promise<LineaAcademica | null> {
    const linea = await this.lineaRepo.findOne({
      where: { id_linea_academica: id },
    });
    if (linea) {
      linea.rutas_academicas = await this.rutaRepo.find({
        where: { id_linea_academica: id },
        relations: ['cursos'],
      });
    }
    return linea;
  }
  async findLineaBySlug(slug: string): Promise<LineaAcademica | null> {
    const linea = await this.lineaRepo.findOne({ where: { slug } });
    if (linea) {
      linea.rutas_academicas = await this.rutaRepo.find({
        where: { id_linea_academica: linea.id_linea_academica },
        relations: ['cursos'],
      });
    }
    return linea;
  }
  async createLinea(data: Partial<LineaAcademica>): Promise<LineaAcademica> {
    return this.lineaRepo.save(
      this.lineaRepo.create({
        ...data,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      }),
    );
  }
  async updateLinea(id: number, data: Partial<LineaAcademica>): Promise<LineaAcademica | null> {
    await this.lineaRepo.update(
      { id_linea_academica: id },
      { ...data, fecha_actualizacion: new Date() },
    );
    return this.findLineaById(id);
  }
  async deleteLinea(id: number): Promise<void> {
    await this.lineaRepo.delete({ id_linea_academica: id });
  }
  // Rutas
  async findAllRutas(filters: any = {}, page = 1, perPage = 15): Promise<PaginatedResult<RutaAcademica>> {
    const [data, total] = await this.rutaRepo.findAndCount({
      relations: ['lineaAcademica', 'cursos'],
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return {
      data,
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    };
  }
  async findRutaById(id: number): Promise<RutaAcademica | null> {
    return this.rutaRepo.findOne({
      where: { id_ruta: id },
      relations: ['lineaAcademica', 'cursos'],
    });
  }
  async findRutasDestacadas(limit = 5): Promise<RutaAcademica[]> {
    return this.rutaRepo.find({
      where: { destacado: true },
      relations: ['lineaAcademica', 'cursos'],
      take: limit,
    });
  }
  async buscarRutas(q: string, page = 1, perPage = 15): Promise<PaginatedResult<RutaAcademica>> {
    const [data, total] = await this.rutaRepo.findAndCount({
      where: { nombre: Like(`%${q}%`) },
      relations: ['lineaAcademica'],
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return {
      data,
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    };
  }
  async createRuta(data: Partial<Omit<RutaAcademica, 'cursos'>> & { cursos?: number[] }): Promise<RutaAcademica> {
    const { cursos, ...rest } = data;
    const ruta = this.rutaRepo.create({
      ...rest,
      cursos: cursos ? cursos.map(id => ({ id_curso: id } as any)) : [],
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    });
    return this.rutaRepo.save(ruta);
  }
  async updateRuta(id: number, data: Partial<Omit<RutaAcademica, 'cursos'>> & { cursos?: number[] }): Promise<RutaAcademica | null> {
    const { cursos, ...rest } = data;
    const updateData: any = { ...rest, fecha_actualizacion: new Date() };
    if (cursos) {
      updateData.cursos = cursos.map(id => ({ id_curso: id }));
    }
    
    // Use save for updates with relations to ensure JoinTable is updated
    const existing = await this.findRutaById(id);
    if (!existing) return null;
    
    return this.rutaRepo.save({
      ...existing,
      ...updateData
    });
  }
  async deleteRuta(id: number): Promise<void> {
    await this.rutaRepo.delete({ id_ruta: id });
  }
}
