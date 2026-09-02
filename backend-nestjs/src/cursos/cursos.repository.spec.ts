import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CursosRepository } from './cursos.repository';

import { Curso } from '../entities/curso.entity';
import { Modulo } from '../entities/modulo.entity';
import { Leccion } from '../entities/leccion.entity';
import { Inscripcion } from '../entities/inscripcion.entity';
import { ProgresoEstudiante } from '../entities/progreso-estudiante.entity';
import { Resena } from '../entities/resena.entity';

describe('CursosRepository', () => {
  let repository: CursosRepository;

  let cursoRepo: any;
  let moduloRepo: any;
  let leccionRepo: any;
  let inscripcionRepo: any;
  let progresoRepo: any;
  let resenaRepo: any;

  let dataSource: any;

  const createQueryBuilderMock = () => {
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      relation: jest.fn().mockReturnThis(),
      of: jest.fn().mockReturnThis(),
      remove: jest.fn().mockResolvedValue(undefined),
      add: jest.fn().mockResolvedValue(undefined),
      getManyAndCount: jest.fn(),
      getMany: jest.fn(),
      getRawMany: jest.fn(),
      getCount: jest.fn(),
    };

    return qb;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    cursoRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    moduloRepo = {
      find: jest.fn(),
    };

    leccionRepo = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    inscripcionRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    progresoRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    resenaRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    dataSource = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursosRepository,

        {
          provide: getRepositoryToken(Curso),
          useValue: cursoRepo,
        },

        {
          provide: getRepositoryToken(Modulo),
          useValue: moduloRepo,
        },

        {
          provide: getRepositoryToken(Leccion),
          useValue: leccionRepo,
        },

        {
          provide: getRepositoryToken(Inscripcion),
          useValue: inscripcionRepo,
        },

        {
          provide: getRepositoryToken(ProgresoEstudiante),
          useValue: progresoRepo,
        },

        {
          provide: getRepositoryToken(Resena),
          useValue: resenaRepo,
        },

        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    repository = module.get<CursosRepository>(CursosRepository);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // ============================================================
  // FIND ALL
  // ============================================================

  it('debe devolver cursos paginados', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([
      [
        {
          id_curso: 681,
          nombre: 'Curso de IA',
        },
      ],
      1,
    ]);

    cursoRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAll({}, 1, 15);

    expect(result).toEqual({
      data: [
        {
          id_curso: 681,
          nombre: 'Curso de IA',
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });

    expect(cursoRepo.createQueryBuilder).toHaveBeenCalledWith('c');

    expect(qb.select).toHaveBeenCalledWith([
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

    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('c.rutas', 'r');

    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('c.docente', 'd');

    expect(qb.skip).toHaveBeenCalledWith(0);
    expect(qb.take).toHaveBeenCalledWith(15);
  });

  it('debe aplicar los filtros de cursos correctamente', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    cursoRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.findAll(
      {
        id_docente: 10,
        nombre: 'React',
        nivel: 'Avanzado',
        estado: 'Publicado',
        precio_min: 50,
        precio_max: 200,
        destacado: true,
        id_linea_academica: 3,
      },
      2,
      10,
    );

    expect(qb.andWhere).toHaveBeenCalledWith('c.id_docente = :docente', {
      docente: 10,
    });

    expect(qb.andWhere).toHaveBeenCalledWith('c.nombre LIKE :nombre', {
      nombre: '%React%',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('c.nivel = :nivel', {
      nivel: 'Avanzado',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('c.estado = :estado', {
      estado: 'Publicado',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('c.precio >= :pmin', {
      pmin: 50,
    });

    expect(qb.andWhere).toHaveBeenCalledWith('c.precio <= :pmax', {
      pmax: 200,
    });

    expect(qb.andWhere).toHaveBeenCalledWith('c.destacado = :dest', {
      dest: true,
    });

    expect(qb.andWhere).toHaveBeenCalledWith(
      'r.id_linea_academica = :idLinea',
      {
        idLinea: 3,
      },
    );

    expect(qb.skip).toHaveBeenCalledWith(10);
    expect(qb.take).toHaveBeenCalledWith(10);
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe buscar un curso por ID', async () => {
    const curso = {
      id_curso: 681,
      nombre: 'Fundamentos de IA',
    };

    cursoRepo.findOne.mockResolvedValue(curso);

    const result = await repository.findById(681);

    expect(result).toEqual(curso);

    expect(cursoRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_curso: 681,
      },
      relations: ['docente'],
    });
  });

  // ============================================================
  // MENU
  // ============================================================

  it('debe devolver el menú de cursos ordenado por nombre', async () => {
    const menu = [
      {
        id_curso: 681,
        nombre: 'Curso A',
      },
      {
        id_curso: 682,
        nombre: 'Curso B',
      },
    ];

    cursoRepo.find.mockResolvedValue(menu);

    const result = await repository.findMenu();

    expect(result).toEqual(menu);

    expect(cursoRepo.find).toHaveBeenCalledWith({
      select: ['id_curso', 'nombre'],
      order: {
        nombre: 'ASC',
      },
    });
  });

  // ============================================================
  // FIND BY SLUG
  // ============================================================

  it('debe devolver un curso por slug exacto y cargar módulos y lecciones', async () => {
    const curso = {
      id_curso: 681,
      nombre: 'Fundamentos de IA',
      slug: 'fundamentos-de-ia',
      objetivos: 'Aprender IA',
      video_preview: 'video.mp4',
      duracion_horas: 20,
      descripcion_corta: 'Curso corto',
      descripcion_larga: 'Curso completo',
    };

    const modulos = [
      {
        id_modulo: 1,
        id_curso: 681,
        orden: 2,
        titulo: 'Módulo 2',
      },
      {
        id_modulo: 2,
        id_curso: 681,
        orden: 1,
        titulo: 'Módulo 1',
      },
    ];

    const lecciones = [
      {
        id_leccion: 10,
        id_modulo: 1,
        titulo: 'Lección 1',
        orden: 1,
      },
      {
        id_leccion: 11,
        id_modulo: 2,
        titulo: 'Lección 2',
        orden: 1,
      },
    ];

    cursoRepo.findOne.mockResolvedValue(curso);

    moduloRepo.find.mockResolvedValue(modulos);

    const qb = createQueryBuilderMock();

    qb.getMany.mockResolvedValue(lecciones);

    leccionRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findBySlug('fundamentos-de-ia');

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un curso');
    }

    expect(result.modulos).toEqual([
      {
        ...modulos[0],
        lecciones: [lecciones[0]],
      },
      {
        ...modulos[1],
        lecciones: [lecciones[1]],
      },
    ]);

    expect(result.lo_que_aprenderas).toBe('Aprender IA');

    expect(result.video_previsualizacion).toBe('video.mp4');

    expect(result.duracion).toBe(20);

    expect(leccionRepo.createQueryBuilder).toHaveBeenCalledWith('l');
  });

  it('debe buscar por ID cuando el slug exacto no existe', async () => {
    cursoRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id_curso: 681,
      nombre: 'Curso por ID',
      slug: 'curso-por-id',
      objetivos: null,
      video_preview: null,
      duracion_horas: null,
      descripcion: 'Descripción base',
      descripcion_corta: null,
      descripcion_larga: null,
    });

    moduloRepo.find.mockResolvedValue([]);

    const result = await repository.findBySlug('681');

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un curso por ID');
    }

    expect(result.id_curso).toBe(681);

    expect(cursoRepo.findOne).toHaveBeenNthCalledWith(1, {
      where: {
        slug: '681',
      },
      relations: ['docente'],
    });

    expect(cursoRepo.findOne).toHaveBeenNthCalledWith(2, {
      where: {
        id_curso: 681,
      },
      relations: ['docente'],
    });

    expect(result.lo_que_aprenderas).toBe('');

    expect(result.video_previsualizacion).toBe('');

    expect(result.duracion).toBe(0);

    expect(result.descripcion_corta).toBe(
      'Inicia tu formación profesional en MIS Academy.',
    );

    expect(result.descripcion_larga).toBe('Descripción base');
  });

  it('debe buscar por formato ID_timestamp', async () => {
    cursoRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id_curso: 700,
      nombre: 'Curso timestamp',
    });

    moduloRepo.find.mockResolvedValue([]);

    const result = await repository.findBySlug('700_123456789');

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un curso por ID');
    }

    expect(result.id_curso).toBe(700);

    expect(cursoRepo.findOne).toHaveBeenNthCalledWith(2, {
      where: {
        id_curso: 700,
      },
      relations: ['docente'],
    });
  });

  it('debe devolver null cuando no existe el curso', async () => {
    cursoRepo.findOne.mockResolvedValue(null);

    const result = await repository.findBySlug('curso-inexistente');

    expect(result).toBeNull();

    expect(moduloRepo.find).not.toHaveBeenCalled();
  });

  // ============================================================
  // DESTACADOS
  // ============================================================

  it('debe devolver cursos destacados publicados', async () => {
    const destacados = [
      {
        id_curso: 681,
        nombre: 'Curso destacado',
        destacado: true,
        estado: 'Publicado',
      },
    ];

    cursoRepo.find.mockResolvedValue(destacados);

    const result = await repository.findDestacados(5);

    expect(result).toEqual(destacados);

    expect(cursoRepo.find).toHaveBeenCalledWith({
      where: {
        destacado: true,
        estado: 'Publicado',
      },
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
      order: {
        fecha_actualizacion: 'DESC',
      },
      take: 5,
    });
  });

  // ============================================================
  // SEARCH
  // ============================================================

  it('debe buscar cursos por nombre', async () => {
    const data = [
      {
        id_curso: 681,
        nombre: 'React',
      },
    ];

    cursoRepo.findAndCount.mockResolvedValue([data, 1]);

    const result = await repository.buscar('React', 1, 15);

    expect(result).toEqual({
      data,
      total: 1,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });

    expect(cursoRepo.findAndCount).toHaveBeenCalledWith({
      where: {
        nombre: expect.anything(),
      },
      skip: 0,
      take: 15,
    });
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear un curso y asignar rutas', async () => {
    const dto = {
      nombre: 'Nuevo Curso',
      precio: 99,
      rutas: [1, 2],
    };

    const cursoCreado = {
      id_curso: 700,
      nombre: 'Nuevo Curso',
    };

    const cursoGuardado = {
      id_curso: 700,
    };

    cursoRepo.create.mockImplementation((data: any) => data);

    cursoRepo.save.mockResolvedValue(cursoGuardado);

    cursoRepo.findOne.mockResolvedValue(cursoCreado);

    jest.spyOn(repository, 'assignRutas').mockResolvedValue(undefined);

    const result = await repository.create(dto as any);

    expect(cursoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Nuevo Curso',
        precio: 99,
        fecha_creacion: expect.any(Date),
        fecha_actualizacion: expect.any(Date),
      }),
    );

    expect(cursoRepo.save).toHaveBeenCalled();

    expect(repository.assignRutas).toHaveBeenCalledWith(700, [1, 2]);

    expect(result).toEqual(cursoCreado);
  });

  it('no debe asignar rutas cuando rutas no es un array', async () => {
    const dto = {
      nombre: 'Curso sin rutas',
    };

    cursoRepo.create.mockImplementation((data: any) => data);

    cursoRepo.save.mockResolvedValue({
      id_curso: 701,
    });

    cursoRepo.findOne.mockResolvedValue({
      id_curso: 701,
      nombre: 'Curso sin rutas',
    });

    jest.spyOn(repository, 'assignRutas').mockResolvedValue(undefined);

    await repository.create(dto as any);

    expect(repository.assignRutas).not.toHaveBeenCalled();
  });

  // ============================================================
  // UPDATE
  // ============================================================

  it('debe actualizar un curso y devolverlo', async () => {
    const actualizado = {
      id_curso: 681,
      nombre: 'Curso actualizado',
    };

    cursoRepo.update.mockResolvedValue({
      affected: 1,
    });

    cursoRepo.findOne.mockResolvedValue(actualizado);

    const result = await repository.update(681, {
      nombre: 'Curso actualizado',
    } as any);

    expect(cursoRepo.update).toHaveBeenCalledWith(
      {
        id_curso: 681,
      },
      expect.objectContaining({
        nombre: 'Curso actualizado',
        fecha_actualizacion: expect.any(Date),
      }),
    );

    expect(result).toEqual(actualizado);
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar un curso', async () => {
    cursoRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.delete(681);

    expect(cursoRepo.delete).toHaveBeenCalledWith({
      id_curso: 681,
    });
  });

  // ============================================================
  // ASSIGN ROUTES
  // ============================================================

  it('debe reemplazar las rutas de un curso', async () => {
    const manager = {
      createQueryBuilder: jest.fn(),
    };

    const loadMany = jest
      .fn()
      .mockResolvedValue([{ id_ruta: 1 }, { id_ruta: 2 }]);

    const remove = jest.fn().mockResolvedValue(undefined);

    const add = jest.fn().mockResolvedValue(undefined);

    const relationBuilder = {
      relation: jest.fn().mockReturnThis(),
      of: jest.fn().mockReturnThis(),
      loadMany,
      remove,
      add,
    };

    manager.createQueryBuilder.mockReturnValue(relationBuilder);

    await repository.assignRutas(681, [3, 4, null as any, 0, -1], manager);

    expect(loadMany).toHaveBeenCalled();

    expect(remove).toHaveBeenCalledWith([{ id_ruta: 1 }, { id_ruta: 2 }]);

    expect(add).toHaveBeenCalledWith([3, 4]);
  });

  it('no debe agregar rutas inválidas', async () => {
    const manager = {
      createQueryBuilder: jest.fn(),
    };

    const remove = jest.fn().mockResolvedValue(undefined);

    const add = jest.fn().mockResolvedValue(undefined);

    const relationBuilder = {
      relation: jest.fn().mockReturnThis(),
      of: jest.fn().mockReturnThis(),
      loadMany: jest.fn().mockResolvedValue([]),
      remove,
      add,
    };

    manager.createQueryBuilder.mockReturnValue(relationBuilder);

    await repository.assignRutas(681, [null as any, 0, -5], manager);

    expect(remove).toHaveBeenCalledWith([]);

    expect(add).not.toHaveBeenCalled();
  });

  // ============================================================
  // GET CONTENIDO
  // ============================================================

  it('debe devolver el contenido del curso con progreso por lección', async () => {
    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
    });

    moduloRepo.find.mockResolvedValue([
      {
        id_modulo: 1,
        id_curso: 681,
        orden: 1,
        titulo: 'Módulo 1',
      },
      {
        id_modulo: 2,
        id_curso: 681,
        orden: 2,
        titulo: 'Módulo 2',
      },
    ]);

    const qb = createQueryBuilderMock();

    qb.getRawMany.mockResolvedValue([
      {
        id_leccion: '10',
        id_modulo: '1',
        titulo: 'Lección 1',
        descripcion: 'Desc',
        contenido: 'Contenido',
        tipo: 'video',
        url_video: 'video.mp4',
        duracion_minutos: '15',
        orden: '1',
        estado: 'Publicado',
        es_gratuita: 1,
        estado_progreso: 'Completado',
        porcentaje_completado: '100',
      },
      {
        id_leccion: '11',
        id_modulo: '2',
        titulo: 'Lección 2',
        descripcion: null,
        contenido: 'Contenido 2',
        tipo: 'texto',
        url_video: null,
        duracion_minutos: null,
        orden: '1',
        estado: 'Publicado',
        es_gratuita: 0,
        estado_progreso: null,
        porcentaje_completado: null,
      },
    ]);

    leccionRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.getContenido(681, 10);

    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      id_modulo: 1,
      id_curso: 681,
      orden: 1,
      titulo: 'Módulo 1',
      lecciones: [
        {
          id_leccion: 10,
          id_modulo: 1,
          titulo: 'Lección 1',
          descripcion: 'Desc',
          contenido: 'Contenido',
          tipo: 'video',
          url_video: 'video.mp4',
          duracion_minutos: 15,
          orden: 1,
          estado: 'Publicado',
          es_gratuita: true,
          progreso: {
            estado: 'Completado',
            porcentaje: 100,
          },
        },
      ],
    });

    expect(result[1].lecciones).toEqual([
      {
        id_leccion: 11,
        id_modulo: 2,
        titulo: 'Lección 2',
        descripcion: null,
        contenido: 'Contenido 2',
        tipo: 'texto',
        url_video: null,
        duracion_minutos: 0,
        orden: 1,
        estado: 'Publicado',
        es_gratuita: false,
        progreso: null,
      },
    ]);
  });

  it('debe devolver contenido vacío cuando el curso no tiene módulos', async () => {
    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
    });

    moduloRepo.find.mockResolvedValue([]);

    const result = await repository.getContenido(681, 10);

    expect(result).toEqual([]);

    expect(leccionRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  // ============================================================
  // GET PROGRESO
  // ============================================================

  it('debe devolver progreso 0 cuando el usuario no está inscrito', async () => {
    inscripcionRepo.findOne.mockResolvedValue(null);

    const result = await repository.getProgreso(681, 10);

    expect(result).toEqual({
      progreso: 0,
      lecciones_completadas: 0,
      total_lecciones: 0,
    });
  });

  it('debe devolver progreso 0 cuando el curso no tiene módulos', async () => {
    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
    });

    moduloRepo.find.mockResolvedValue([]);

    const result = await repository.getProgreso(681, 10);

    expect(result).toEqual({
      progreso: 0,
      lecciones_completadas: 0,
      total_lecciones: 0,
    });
  });

  it('debe calcular correctamente el progreso del curso', async () => {
    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
    });

    moduloRepo.find.mockResolvedValue([
      {
        id_modulo: 1,
      },
      {
        id_modulo: 2,
      },
    ]);

    const leccionesQb = createQueryBuilderMock();

    leccionesQb.getCount.mockResolvedValue(8);

    leccionRepo.createQueryBuilder.mockReturnValue(leccionesQb);

    const progresoQb = createQueryBuilderMock();

    progresoQb.getCount.mockResolvedValue(6);

    progresoRepo.createQueryBuilder.mockReturnValue(progresoQb);

    const result = await repository.getProgreso(681, 10);

    expect(result).toEqual({
      progreso: 75,
      lecciones_completadas: 6,
      total_lecciones: 8,
    });

    expect(leccionesQb.where).toHaveBeenCalledWith('l.id_modulo IN (:...ids)', {
      ids: [1, 2],
    });

    expect(progresoQb.where).toHaveBeenCalledWith('p.id_inscripcion = :insc', {
      insc: 100,
    });

    expect(progresoQb.andWhere).toHaveBeenCalledWith('p.estado = :est', {
      est: 'Completado',
    });
  });

  // ============================================================
  // MY COURSES
  // ============================================================

  it('debe devolver los cursos inscritos por el usuario', async () => {
    const inscripciones = [
      {
        id_inscripcion: 1,
        id_usuario: 10,
        id_curso: 681,
        curso: {
          id_curso: 681,
          nombre: 'Curso IA',
        },
      },
    ];

    inscripcionRepo.find.mockResolvedValue(inscripciones);

    const result = await repository.getMisCursos(10);

    expect(result).toEqual(inscripciones);

    expect(inscripcionRepo.find).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
      },
      relations: ['curso'],
    });
  });
});
