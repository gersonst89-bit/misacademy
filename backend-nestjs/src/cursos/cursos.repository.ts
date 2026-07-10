import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { Curso } from '../entities/curso.entity';
import { Modulo } from '../entities/modulo.entity';
import { Leccion } from '../entities/leccion.entity';
import { Inscripcion } from '../entities/inscripcion.entity';
import { ProgresoEstudiante } from '../entities/progreso-estudiante.entity';
import { Resena } from '../entities/resena.entity';
import { CreateCursoDto, UpdateCursoDto } from './dto/cursos.dto';

export interface CursoFilters {
  id_docente?: number;
  nombre?: string;
  titulo?: string;
  nivel?: string;
  estado?: string;
  precio_min?: number;
  precio_max?: number;
  destacado?: boolean;
}

@Injectable()
export class CursosRepository {
  constructor(
    @InjectRepository(Curso) private readonly cursoRepo: Repository<Curso>,
    @InjectRepository(Modulo) private readonly moduloRepo: Repository<Modulo>,
    @InjectRepository(Leccion)
    private readonly leccionRepo: Repository<Leccion>,
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(ProgresoEstudiante)
    private readonly progresoRepo: Repository<ProgresoEstudiante>,
    @InjectRepository(Resena) private readonly resenaRepo: Repository<Resena>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filters: CursoFilters = {}, page = 1, perPage = 15) {
    const qb = this.cursoRepo.createQueryBuilder('c');

    // Seleccionar solo campos necesarios para listados
    qb.select([
      'c.id_curso',
      'c.nombre',
      'c.descripcion_corta',
      'c.precio',
      'c.imagen',
      'c.nivel',
      'c.estado',
      'c.destacado',
      'c.slug',
      'c.duracion_horas',
      'c.tiempo',
    ]);

    qb.leftJoinAndSelect('c.rutas', 'r');
    qb.leftJoinAndSelect('c.docente', 'd');

    if (filters.id_docente)
      qb.andWhere('c.id_docente = :docente', { docente: filters.id_docente });
    if (filters.nombre || filters.titulo)
      qb.andWhere('c.nombre LIKE :nombre', {
        nombre: `%${filters.nombre || filters.titulo}%`,
      });
    if (filters.nivel)
      qb.andWhere('c.nivel = :nivel', { nivel: filters.nivel });
    if (filters.estado)
      qb.andWhere('c.estado = :estado', { estado: filters.estado });
    if (filters.precio_min)
      qb.andWhere('c.precio >= :pmin', { pmin: filters.precio_min });
    if (filters.precio_max)
      qb.andWhere('c.precio <= :pmax', { pmax: filters.precio_max });
    if (filters.destacado !== undefined)
      qb.andWhere('c.destacado = :dest', { dest: filters.destacado });

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

  async findById(id: number) {
    return this.cursoRepo.findOne({
      where: { id_curso: id },
      relations: ['docente'],
    });
  }

  async findBySlug(slug: string) {
    let curso: any = await this.cursoRepo.findOne({
      where: { slug },
      relations: ['docente'],
    });

    // 1. Si no se encuentra por slug exacto, verificar si es un ID numérico puro o formato ID_TIMESTAMP
    if (!curso) {
      const parts = slug.split('_');
      const possibleId = parseInt(parts[0], 10);

      // Si es un número válido (ya sea "681" o "681_timestamp")
      if (!isNaN(possibleId)) {
        curso = await this.cursoRepo.findOne({
          where: { id_curso: possibleId },
          relations: ['docente'],
        });
      }
    }

    // Si aún no se encuentra el curso, retornamos null inmediatamente
    if (!curso) {
      return null;
    }

    // Cargar módulos con lecciones optimizado (evitar N+1)
    const modulos = await this.moduloRepo.find({
      where: { id_curso: curso.id_curso },
      order: { orden: 'ASC' },
    });

    if (modulos && modulos.length > 0) {
      const moduloIds = modulos.map((m) => m.id_modulo);
      const lecciones = await this.leccionRepo
        .createQueryBuilder('l')
        .where('l.id_modulo IN (:...moduloIds)', { moduloIds })
        .orderBy('l.id_modulo', 'ASC')
        .addOrderBy('l.orden', 'ASC')
        .getMany();

      const leccionesMap = new Map();
      lecciones.forEach((l) => {
        if (!leccionesMap.has(l.id_modulo)) leccionesMap.set(l.id_modulo, []);
        leccionesMap.get(l.id_modulo).push(l);
      });

      modulos.forEach((mod: any) => {
        mod.lecciones = leccionesMap.get(mod.id_modulo) || [];
      });
    } else {
      curso.modulos = [];
    }
    curso.modulos = modulos || [];

    // Mapeo de campos para compatibilidad con el Frontend (Safeguards)
    curso.lo_que_aprenderas = curso.objetivos || curso.lo_que_aprenderas || '';
    curso.video_previsualizacion =
      curso.video_preview || curso.video_previsualizacion || '';
    curso.duracion = curso.duracion_horas || curso.duracion || 0;

    if (!curso.descripcion_corta)
      curso.descripcion_corta =
        'Inicia tu formación profesional en MIS Academy.';
    if (!curso.descripcion_larga)
      curso.descripcion_larga =
        curso.descripcion_larga ||
        curso.descripcion ||
        'En este curso aprenderás las habilidades necesarias.';

    return curso;
  }

  async findDestacados(limit = 8) {
    return this.cursoRepo.find({
      where: { destacado: true, estado: 'Publicado' },
      select: [
        'id_curso',
        'nombre',
        'descripcion_corta',
        'precio',
        'imagen',
        'nivel',
        'estado',
        'destacado',
        'slug',
      ],
      order: { fecha_actualizacion: 'DESC' },
      take: limit,
    });
  }

  async buscar(query: string, page = 1, perPage = 15) {
    const [data, total] = await this.cursoRepo.findAndCount({
      where: { nombre: Like(`%${query}%`) },
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

  async create(data: CreateCursoDto): Promise<Curso> {
    const curso = this.cursoRepo.create({
      ...data,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
    });
    return this.cursoRepo.save(curso as any);
  }

  async update(id: number, data: UpdateCursoDto): Promise<Curso | null> {
    const { rutas, ...updateData } = data;
    await this.cursoRepo.update(
      { id_curso: id },
      { ...updateData, fecha_actualizacion: new Date() } as any,
    );
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.cursoRepo.delete({ id_curso: id });
  }

  async assignRutas(
    cursoId: number,
    rutas: number[],
    manager?: any,
  ): Promise<void> {
    const executor = manager || this.dataSource;

    // Obtener las rutas actualmente vinculadas
    const currentRutas = await executor
      .createQueryBuilder()
      .relation(Curso, 'rutas')
      .of(cursoId)
      .loadMany();

    // Desvincular todas las rutas existentes
    await executor
      .createQueryBuilder()
      .relation(Curso, 'rutas')
      .of(cursoId)
      .remove(currentRutas);

    // Filtrar e insertar las nuevas rutas válidas
    const validRutas = (rutas || []).filter((r) => r && Number(r) > 0);
    if (validRutas.length > 0) {
      await executor
        .createQueryBuilder()
        .relation(Curso, 'rutas')
        .of(cursoId)
        .add(validRutas);
    }
  }

  async getContenido(cursoId: number, userId: number) {
    try {
      console.log(`[DEBUG] getContenido QueryBuilder para cursoId: ${cursoId}`);

      // 1. Obtener la inscripción del usuario para este curso
      const inscripcion = await this.inscripcionRepo.findOne({
        where: { id_usuario: userId, id_curso: cursoId },
        select: ['id_inscripcion'],
      });
      const idInscripcion = inscripcion?.id_inscripcion || 0;

      // 2. Obtener módulos
      const modulos = await this.moduloRepo.find({
        where: { id_curso: cursoId },
        order: { orden: 'ASC' },
      });

      if (!modulos || modulos.length === 0) return [];

      // 3. Obtener lecciones de estos módulos, vinculando progresos mediante un join limpio en QueryBuilder
      const moduloIds = modulos.map((m) => m.id_modulo);

      const leccionesRaw = await this.leccionRepo
        .createQueryBuilder('l')
        .leftJoin(
          ProgresoEstudiante,
          'p',
          'p.id_leccion = l.id_leccion AND p.id_inscripcion = :idInscripcion',
          { idInscripcion },
        )
        .where('l.id_modulo IN (:...moduloIds)', { moduloIds })
        .select([
          'l.id_leccion AS id_leccion',
          'l.id_modulo AS id_modulo',
          'l.titulo AS titulo',
          'l.descripcion AS descripcion',
          'l.contenido AS contenido',
          'l.tipo AS tipo',
          'l.url_video AS url_video',
          'l.duracion_minutos AS duracion_minutos',
          'l.orden AS orden',
          'l.estado AS estado',
          'l.es_gratuita AS es_gratuita',
          'p.estado AS estado_progreso',
          'p.porcentaje_completado AS porcentaje_completado',
        ])
        .orderBy('l.orden', 'ASC')
        .getRawMany();

      // 4. Vincular lecciones a módulos de forma robusta
      const result = modulos.map((m: any) => {
        const moduloId = Number(m.id_modulo || m.id || 0);
        return {
          ...m,
          id_modulo: moduloId, // Normalizamos el ID
          lecciones: leccionesRaw
            .filter((l: any) => Number(l.id_modulo) === moduloId)
            .map((l: any) => ({
              id_leccion: Number(l.id_leccion),
              id_modulo: Number(l.id_modulo),
              titulo: l.titulo,
              descripcion: l.descripcion,
              contenido: l.contenido,
              tipo: l.tipo,
              url_video: l.url_video,
              duracion_minutos: Number(l.duracion_minutos || 0),
              orden: Number(l.orden || 0),
              estado: l.estado,
              es_gratuita: Boolean(l.es_gratuita),
              progreso: l.estado_progreso
                ? {
                    estado: l.estado_progreso,
                    porcentaje: l.porcentaje_completado ? Number(l.porcentaje_completado) : 0,
                  }
                : null,
            })),
        };
      });

      console.log(
        `[DEBUG] Contenido generado: ${result.length} módulos con lecciones vinculadas`,
      );
      return result;
    } catch (err: any) {
      console.error('[CRITICAL ERROR] getContenido falló:', err.message);
      throw err;
    }
  }

  async getProgreso(cursoId: number, userId: number) {
    const inscripcion = await this.inscripcionRepo.findOne({
      where: { id_curso: cursoId, id_usuario: userId },
    });
    if (!inscripcion)
      return { progreso: 0, lecciones_completadas: 0, total_lecciones: 0 };

    const modulos = await this.moduloRepo.find({
      where: { id_curso: cursoId },
    });
    const moduloIds = modulos.map((m) => m.id_modulo);
    if (moduloIds.length === 0)
      return { progreso: 0, lecciones_completadas: 0, total_lecciones: 0 };

    const totalLecciones = await this.leccionRepo
      .createQueryBuilder('l')
      .where('l.id_modulo IN (:...ids)', { ids: moduloIds })
      .getCount();
    const completadas = await this.progresoRepo
      .createQueryBuilder('p')
      .where('p.id_inscripcion = :insc', { insc: inscripcion.id_inscripcion })
      .andWhere('p.estado = :est', { est: 'Completado' })
      .getCount();

    return {
      progreso:
        totalLecciones > 0
          ? Math.round((completadas / totalLecciones) * 100)
          : 0,
      lecciones_completadas: completadas,
      total_lecciones: totalLecciones,
    };
  }

  async getMisCursos(userId: number) {
    const inscripciones = await this.inscripcionRepo.find({
      where: { id_usuario: userId },
      relations: ['curso'],
    });
    return inscripciones;
  }
}
