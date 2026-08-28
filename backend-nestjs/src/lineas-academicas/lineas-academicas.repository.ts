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
  async findAllLineas(
    filters: LineaFilters = {},
    page = 1,
    perPage = 15,
  ): Promise<PaginatedResult<LineaAcademica>> {
    const where: FindOptionsWhere<LineaAcademica> = {};

    if (filters.estado) {
      where.estado = filters.estado;
    }

    const [data, total] = await this.lineaRepo.findAndCount({
      where,
      select: [
        'id_linea_academica',
        'nombre',
        'slug',
        'descripcion',
        'imagen',
        'estado',
      ],
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
  async updateLinea(
    id: number,
    data: Partial<LineaAcademica>,
  ): Promise<LineaAcademica | null> {
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
  async findAllRutas(
    filters: any = {},
    page = 1,
    perPage = 15,
  ): Promise<PaginatedResult<RutaAcademica>> {
    const qb = this.rutaRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.lineaAcademica', 'lineaAcademica')
      .leftJoinAndSelect('r.cursos', 'cursos');

    if (filters.nombre) {
      qb.andWhere('r.nombre LIKE :nombre', { nombre: `%${filters.nombre}%` });
    }
    if (filters.estado) {
      qb.andWhere('r.estado = :estado', { estado: filters.estado });
    }

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

  async findAllRutasAdmin(
    filters: any = {},
    page = 1,
    perPage = 10,
  ): Promise<PaginatedResult<RutaAcademica>> {
    const qb = this.rutaRepo.createQueryBuilder('r');

    if (filters.nombre) {
      qb.andWhere('r.nombre LIKE :nombre', {
        nombre: `%${filters.nombre}%`,
      });
    }

    if (filters.estado) {
      qb.andWhere('r.estado = :estado', {
        estado: filters.estado,
      });
    }

    const [data, total] = await qb
      .select([
        'r.id_ruta',
        'r.id_linea_academica',
        'r.nombre',
        'r.descripcion',
        'r.imagen',
        'r.horas_totales',
        'r.nivel',
        'r.precio',
        'r.estado',
        'r.destacado',
        'r.fecha_actualizacion',
      ])
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

  async findRutasMenu(): Promise<{ id_ruta: number; nombre: string }[]> {
    return this.rutaRepo.find({
      select: ['id_ruta', 'nombre'],
      order: {
        nombre: 'ASC',
      },
    });
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
  async buscarRutas(
    q: string,
    page = 1,
    perPage = 15,
  ): Promise<PaginatedResult<RutaAcademica>> {
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
  async createRuta(
    data: Partial<Omit<RutaAcademica, 'cursos'>> & { cursos?: number[] },
  ): Promise<RutaAcademica> {
    const { cursos, ...rest } = data;
    const ruta = this.rutaRepo.create({
      ...rest,
      cursos: cursos ? cursos.map((id) => ({ id_curso: id }) as any) : [],
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    });
    return this.rutaRepo.save(ruta);
  }
  async updateRuta(
    id: number,
    data: Partial<Omit<RutaAcademica, 'cursos'>> & { cursos?: number[] },
  ): Promise<RutaAcademica | null> {
    const { cursos, ...rest } = data;

    const existing = await this.findRutaById(id);

    if (!existing) return null;

    await this.rutaRepo.update(
      { id_ruta: id },
      {
        ...rest,
        fecha_actualizacion: new Date(),
      },
    );

    if (cursos) {
      existing.cursos = cursos.map((idCurso) => ({ id_curso: idCurso }) as any);

      await this.rutaRepo.save(existing);
    }

    return this.findRutaById(id);
  }
  async deleteRuta(id: number): Promise<void> {
    await this.rutaRepo.delete({ id_ruta: id });
  }
  async findRutaBySlug(slug: string): Promise<RutaAcademica | null> {
    return this.rutaRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.lineaAcademica', 'lineaAcademica')
      .leftJoinAndSelect('r.cursos', 'cursos')
      .where("LOWER(REPLACE(r.nombre, ' ', '-')) = LOWER(:slug)", { slug })
      .getOne();
  }

  async findLineaByCursoId(
    idCurso: number,
  ): Promise<{ id_linea_academica: number; nombre: string } | null> {
    const resultado = await this.rutaRepo
      .createQueryBuilder('r')
      .innerJoin('r.cursos', 'curso', 'curso.id_curso = :idCurso', {
        idCurso,
      })
      .innerJoin('r.lineaAcademica', 'lineaAcademica')
      .select('lineaAcademica.id_linea_academica', 'id_linea_academica')
      .addSelect('lineaAcademica.nombre', 'nombre')
      .getRawOne<{ id_linea_academica: number; nombre: string }>();

    return resultado ?? null;
  }

  async findLineasMenu(): Promise<LineaAcademica[]> {
    return this.lineaRepo.find({
      where: { estado: 'Publicado' },
      select: ['id_linea_academica', 'nombre', 'descripcion', 'slug', 'estado'],
      order: {
        nombre: 'ASC',
      },
    });
  }
}
