import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { Curso } from '../entities/curso.entity';
import { Modulo } from '../entities/modulo.entity';
import { Leccion } from '../entities/leccion.entity';
import { Inscripcion } from '../entities/inscripcion.entity';
import { ProgresoEstudiante } from '../entities/progreso-estudiante.entity';
import { Resena } from '../entities/resena.entity';

@Injectable()
export class CursosRepository {
  constructor(
    @InjectRepository(Curso) private readonly cursoRepo: Repository<Curso>,
    @InjectRepository(Modulo) private readonly moduloRepo: Repository<Modulo>,
    @InjectRepository(Leccion) private readonly leccionRepo: Repository<Leccion>,
    @InjectRepository(Inscripcion) private readonly inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(ProgresoEstudiante) private readonly progresoRepo: Repository<ProgresoEstudiante>,
    @InjectRepository(Resena) private readonly resenaRepo: Repository<Resena>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filters: any = {}, page = 1, perPage = 15) {
    const qb = this.cursoRepo.createQueryBuilder('c');
    
    // Seleccionar solo campos necesarios para listados
    qb.select([
      'c.id_curso', 'c.nombre', 'c.descripcion_corta', 
      'c.precio', 'c.imagen', 'c.nivel', 
      'c.estado', 'c.destacado', 'c.slug'
    ]);

    qb.leftJoinAndSelect('c.rutas', 'r');
    qb.leftJoinAndSelect('c.docente', 'd');
    
    if (filters.id_docente) qb.andWhere('c.id_docente = :docente', { docente: filters.id_docente });
    if (filters.nombre || filters.titulo) qb.andWhere('c.nombre LIKE :nombre', { nombre: `%${filters.nombre || filters.titulo}%` });
    if (filters.nivel) qb.andWhere('c.nivel = :nivel', { nivel: filters.nivel });
    if (filters.estado) qb.andWhere('c.estado = :estado', { estado: filters.estado });
    if (filters.precio_min) qb.andWhere('c.precio >= :pmin', { pmin: filters.precio_min });
    if (filters.precio_max) qb.andWhere('c.precio <= :pmax', { pmax: filters.precio_max });
    if (filters.destacado !== undefined) qb.andWhere('c.destacado = :dest', { dest: filters.destacado });

    const [data, total] = await qb.skip((page - 1) * perPage).take(perPage).getManyAndCount();
    return { data, total, current_page: page, per_page: perPage, last_page: Math.ceil(total / perPage) };
  }

  async findById(id: number) {
    return this.cursoRepo.findOne({ where: { id_curso: id }, relations: ['docente'] });
  }

  async findBySlug(slug: string) {
    let curso: any = await this.cursoRepo.findOne({ where: { slug }, relations: ['docente'] });
    
    // 1. Si no se encuentra por slug exacto, verificar si es un ID numérico puro o formato ID_TIMESTAMP
    if (!curso) {
      const parts = slug.split('_');
      const possibleId = parseInt(parts[0], 10);
      
      // Si es un número válido (ya sea "681" o "681_timestamp")
      if (!isNaN(possibleId)) {
        curso = await this.cursoRepo.findOne({ 
          where: { id_curso: possibleId }, 
          relations: ['docente'] 
        });
      }
    }

    // 2. Autoreparación: Si aún no se encuentra, buscar por nombre
    if (!curso) {
      const allCursos = await this.cursoRepo.find({ relations: ['docente'] });
      curso = allCursos.find(c => {
        const generatedSlug = c.nombre.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9 -]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
        return generatedSlug === slug;
      });

      if (curso) {
        // Guardar el slug para la próxima vez y asegurar que esté publicado
        await this.cursoRepo.update(curso.id_curso, { 
          slug: slug, 
          estado: 'Publicado',
          fecha_actualizacion: new Date() 
        });
      } else {
        return null;
      }
    }

    // Cargar módulos con lecciones optimizado (evitar N+1)
    const modulos = await this.moduloRepo.find({ where: { id_curso: curso.id_curso }, order: { orden: 'ASC' } });
    
    if (modulos && modulos.length > 0) {
      const moduloIds = modulos.map(m => m.id_modulo);
      const lecciones = await this.leccionRepo.createQueryBuilder('l')
        .where('l.id_modulo IN (:...moduloIds)', { moduloIds })
        .orderBy('l.id_modulo', 'ASC')
        .addOrderBy('l.orden', 'ASC')
        .getMany();

      const leccionesMap = new Map();
      lecciones.forEach(l => {
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
    curso.lo_que_aprenderas = curso.objetivos || curso.lo_que_aprenderas || "";
    curso.video_previsualizacion = curso.video_preview || curso.video_previsualizacion || "";
    curso.duracion = curso.duracion_horas || curso.duracion || 0;
    
    if (!curso.descripcion_corta) curso.descripcion_corta = "Inicia tu formación profesional en MIS Academy.";
    if (!curso.descripcion_larga) curso.descripcion_larga = curso.descripcion_larga || curso.descripcion || "En este curso aprenderás las habilidades necesarias.";

    return curso;
  }

  async findDestacados(limit = 8) {
    return this.cursoRepo.find({ 
      where: { destacado: true, estado: 'Publicado' }, 
      select: ['id_curso', 'nombre', 'descripcion_corta', 'precio', 'imagen', 'nivel', 'estado', 'destacado', 'slug'],
      order: { fecha_actualizacion: 'DESC' }, 
      take: limit 
    });
  }

  async buscar(query: string, page = 1, perPage = 15) {
    const [data, total] = await this.cursoRepo.findAndCount({
      where: { nombre: Like(`%${query}%`) },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return { data, total, current_page: page, per_page: perPage, last_page: Math.ceil(total / perPage) };
  }

  async create(data: any): Promise<Curso> {
    const curso = this.cursoRepo.create({ ...data, fecha_creacion: new Date(), fecha_actualizacion: new Date() });
    return this.cursoRepo.save(curso as any);
  }

  async update(id: number, data: any): Promise<Curso | null> {
    await this.cursoRepo.update({ id_curso: id }, { ...data, fecha_actualizacion: new Date() });
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.cursoRepo.delete({ id_curso: id });
  }

  async assignRutas(cursoId: number, rutas: number[], manager?: any): Promise<void> {
    const executor = manager || this.dataSource;
    await executor.query('DELETE FROM cursos_rutas WHERE id_curso = ?', [cursoId]);
    
    // Filtrar rutas para asegurar que solo procesamos IDs válidos (números > 0)
    const validRutas = (rutas || []).filter(r => r && Number(r) > 0);
    
    for (let i = 0; i < validRutas.length; i++) {
      await executor.query('INSERT INTO cursos_rutas (id_curso, id_ruta) VALUES (?, ?)', [cursoId, Number(validRutas[i])]);
    }
  }

  async getContenido(cursoId: number, userId: number) {
    try {
      console.log(`[DEBUG] getContenido QueryBuilder para cursoId: ${cursoId}`);
      
      // 1. Obtener la inscripción del usuario para este curso
      const inscripcion = await this.dataSource.query(
        'SELECT id_inscripcion FROM inscripciones WHERE id_usuario = ? AND id_curso = ? LIMIT 1',
        [userId, cursoId]
      );
      const idInscripcion = inscripcion[0]?.id_inscripcion || 0;

      // 2. Obtener módulos
      const modulos = await this.dataSource.query(
        'SELECT * FROM modulos WHERE id_curso = ? ORDER BY orden ASC',
        [cursoId]
      );

      if (!modulos || modulos.length === 0) return [];

      // 3. Obtener lecciones con progreso vinculado
      const lecciones = await this.dataSource.query(
        `SELECT l.*, p.estado as estado_progreso, p.porcentaje_completado 
         FROM lecciones l 
         JOIN modulos m ON l.id_modulo = m.id_modulo 
         LEFT JOIN progreso_estudiante p ON l.id_leccion = p.id_leccion AND p.id_inscripcion = ?
         WHERE m.id_curso = ? 
         ORDER BY l.orden ASC`,
        [idInscripcion, cursoId]
      );

      // 4. Vincular lecciones a módulos de forma robusta
      const result = modulos.map((m: any) => {
        const moduloId = Number(m.id_modulo || m.id || 0);
        return {
          ...m,
          id_modulo: moduloId, // Normalizamos el ID
          lecciones: lecciones.filter((l: any) => Number(l.id_modulo) === moduloId).map((l: any) => ({
            ...l,
            progreso: l.estado_progreso ? { estado: l.estado_progreso, porcentaje: l.porcentaje_completado } : null
          }))
        };
      });

      console.log(`[DEBUG] Contenido generado: ${result.length} módulos con lecciones vinculadas`);
      return result;

    } catch (err: any) {
      console.error('[CRITICAL ERROR] getContenido falló:', err.message);
      // Usamos el error nativo si HttpException no está disponible o el nombre correcto
      throw err;
    }
  }

  async getProgreso(cursoId: number, userId: number) {
    const inscripcion = await this.inscripcionRepo.findOne({ where: { id_curso: cursoId, id_usuario: userId } });
    if (!inscripcion) return { progreso: 0, lecciones_completadas: 0, total_lecciones: 0 };

    const modulos = await this.moduloRepo.find({ where: { id_curso: cursoId } });
    const moduloIds = modulos.map(m => m.id_modulo);
    if (moduloIds.length === 0) return { progreso: 0, lecciones_completadas: 0, total_lecciones: 0 };

    const totalLecciones = await this.leccionRepo.createQueryBuilder('l')
      .where('l.id_modulo IN (:...ids)', { ids: moduloIds }).getCount();
    const completadas = await this.progresoRepo.createQueryBuilder('p')
      .where('p.id_inscripcion = :insc', { insc: inscripcion.id_inscripcion })
      .andWhere('p.estado = :est', { est: 'Completado' }).getCount();

    return {
      progreso: totalLecciones > 0 ? Math.round((completadas / totalLecciones) * 100) : 0,
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
