import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { LeccionesRepository } from './lecciones.repository';

import { Leccion } from '../entities/leccion.entity';
import { ComentarioLeccion } from '../entities/comentario-leccion.entity';
import { ProgresoEstudiante } from '../entities/progreso-estudiante.entity';
import { Inscripcion } from '../entities/inscripcion.entity';
import { Modulo } from '../entities/modulo.entity';

describe('LeccionesRepository', () => {
  let repository: LeccionesRepository;

  let leccionRepo: any;
  let comentarioRepo: any;
  let progresoRepo: any;
  let inscripcionRepo: any;
  let moduloRepo: any;

  const createQueryBuilderMock = () => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    leccionRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: any) => data),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    comentarioRepo = {
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: any) => data),
      delete: jest.fn(),
    };

    progresoRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: any) => data),
      delete: jest.fn(),
    };

    inscripcionRepo = {
      findOne: jest.fn(),
    };

    moduloRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeccionesRepository,
        {
          provide: getRepositoryToken(Leccion),
          useValue: leccionRepo,
        },
        {
          provide: getRepositoryToken(ComentarioLeccion),
          useValue: comentarioRepo,
        },
        {
          provide: getRepositoryToken(ProgresoEstudiante),
          useValue: progresoRepo,
        },
        {
          provide: getRepositoryToken(Inscripcion),
          useValue: inscripcionRepo,
        },
        {
          provide: getRepositoryToken(Modulo),
          useValue: moduloRepo,
        },
      ],
    }).compile();

    repository = module.get<LeccionesRepository>(LeccionesRepository);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe buscar una lección por ID con módulo y curso', async () => {
    const leccion = {
      id_leccion: 10,
      titulo: 'Introducción',
      id_modulo: 5,
    };

    leccionRepo.findOne.mockResolvedValue(leccion);

    const result = await repository.findById(10);

    expect(result).toEqual(leccion);

    expect(leccionRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_leccion: 10,
      },
      relations: ['modulo', 'modulo.curso'],
    });
  });

  // ============================================================
  // FIND BY MODULO
  // ============================================================

  it('debe devolver las lecciones de un módulo ordenadas', async () => {
    const lecciones = [
      {
        id_leccion: 1,
        id_modulo: 5,
        orden: 1,
      },
      {
        id_leccion: 2,
        id_modulo: 5,
        orden: 2,
      },
    ];

    leccionRepo.find.mockResolvedValue(lecciones);

    const result = await repository.findByModulo(5);

    expect(result).toEqual(lecciones);

    expect(leccionRepo.find).toHaveBeenCalledWith({
      where: {
        id_modulo: 5,
      },
      order: {
        orden: 'ASC',
      },
    });
  });

  // ============================================================
  // FIND BY CURSO
  // ============================================================

  it('debe devolver las lecciones de un curso', async () => {
    const lecciones = [
      {
        id_leccion: 1,
        id_modulo: 5,
      },
      {
        id_leccion: 2,
        id_modulo: 6,
      },
    ];

    leccionRepo.find.mockResolvedValue(lecciones);

    const result = await repository.findByCurso(681);

    expect(result).toEqual(lecciones);

    expect(leccionRepo.find).toHaveBeenCalledWith({
      where: {
        modulo: {
          id_curso: 681,
        },
      },
      relations: ['modulo'],
      order: {
        orden: 'ASC',
      },
    });
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear una lección y usar duracion como duracion_minutos', async () => {
    const data: any = {
      id_modulo: 5,
      titulo: 'Nueva lección',
      duracion: 30,
    };

    const saved = {
      id_leccion: 20,
      id_modulo: 5,
      titulo: 'Nueva lección',
      duracion_minutos: 30,
    };

    leccionRepo.create.mockImplementation((payload: any) => payload);

    leccionRepo.save.mockResolvedValue(saved);

    const result = await repository.create(data);

    expect(data.duracion_minutos).toBe(30);

    expect(leccionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_modulo: 5,
        titulo: 'Nueva lección',
        duracion: 30,
        duracion_minutos: 30,
      }),
    );

    expect(leccionRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        duracion_minutos: 30,
      }),
    );

    expect(result).toEqual(saved);
  });

  it('debe conservar duracion_minutos cuando ya está definida', async () => {
    const data: any = {
      id_modulo: 5,
      titulo: 'Lección',
      duracion: 30,
      duracion_minutos: 45,
    };

    leccionRepo.create.mockImplementation((payload: any) => payload);

    leccionRepo.save.mockResolvedValue(data);

    await repository.create(data);

    expect(leccionRepo.create).toHaveBeenCalledWith(data);
  });

  // ============================================================
  // UPDATE
  // ============================================================

  it('debe actualizar una lección y normalizar la duración', async () => {
    const data: any = {
      titulo: 'Lección actualizada',
      duracion: 40,
      modulo: {
        id_modulo: 5,
      },
    };

    const updated = {
      id_leccion: 20,
      titulo: 'Lección actualizada',
      duracion_minutos: 40,
    };

    leccionRepo.update.mockResolvedValue({
      affected: 1,
    });

    leccionRepo.findOne.mockResolvedValue(updated);

    const result = await repository.update(20, data);

    expect(data.duracion_minutos).toBe(40);

    expect(leccionRepo.update).toHaveBeenCalledWith(
      {
        id_leccion: 20,
      },
      expect.not.objectContaining({
        modulo: expect.anything(),
      }),
    );

    expect(leccionRepo.update.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        titulo: 'Lección actualizada',
        duracion: 40,
        duracion_minutos: 40,
      }),
    );

    expect(result).toEqual(updated);
  });

  it('debe actualizar sin modificar duracion_minutos cuando no viene duracion', async () => {
    const data: any = {
      titulo: 'Solo título',
      duracion_minutos: 25,
    };

    leccionRepo.update.mockResolvedValue({
      affected: 1,
    });

    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 20,
      ...data,
    });

    await repository.update(20, data);

    expect(leccionRepo.update).toHaveBeenCalledWith(
      {
        id_leccion: 20,
      },
      expect.objectContaining({
        titulo: 'Solo título',
        duracion_minutos: 25,
      }),
    );
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar comentarios, progreso y finalmente la lección', async () => {
    comentarioRepo.delete.mockResolvedValue({
      affected: 2,
    });

    progresoRepo.delete.mockResolvedValue({
      affected: 1,
    });

    leccionRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.delete(20);

    expect(comentarioRepo.delete).toHaveBeenCalledWith({
      id_leccion: 20,
    });

    expect(progresoRepo.delete).toHaveBeenCalledWith({
      id_leccion: 20,
    });

    expect(leccionRepo.delete).toHaveBeenCalledWith({
      id_leccion: 20,
    });

    expect(comentarioRepo.delete.mock.invocationCallOrder[0]).toBeLessThan(
      progresoRepo.delete.mock.invocationCallOrder[0],
    );

    expect(progresoRepo.delete.mock.invocationCallOrder[0]).toBeLessThan(
      leccionRepo.delete.mock.invocationCallOrder[0],
    );
  });

  // ============================================================
  // FIND ALL
  // ============================================================

  it('debe devolver lecciones paginadas', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([
      [
        {
          id_leccion: 10,
          titulo: 'Lección 1',
        },
      ],
      1,
    ]);

    leccionRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAll(1, 20, {});

    expect(result).toEqual({
      data: [
        {
          id_leccion: 10,
          titulo: 'Lección 1',
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 20,
      last_page: 1,
    });

    expect(leccionRepo.createQueryBuilder).toHaveBeenCalledWith('l');

    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('l.modulo', 'm');

    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('m.curso', 'c');

    expect(qb.skip).toHaveBeenCalledWith(0);

    expect(qb.take).toHaveBeenCalledWith(20);

    expect(qb.orderBy).toHaveBeenCalledWith('l.orden', 'ASC');
  });

  it('debe aplicar los filtros de búsqueda, módulo y estado', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    leccionRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.findAll(2, 10, {
      query: 'React',
      id_modulo: 5,
      estado: 'Publicado',
    });

    expect(qb.andWhere).toHaveBeenCalledWith(
      '(l.titulo LIKE :q OR l.descripcion LIKE :q)',
      {
        q: '%React%',
      },
    );

    expect(qb.andWhere).toHaveBeenCalledWith('l.id_modulo = :mod', {
      mod: 5,
    });

    expect(qb.andWhere).toHaveBeenCalledWith('l.estado = :est', {
      est: 'Publicado',
    });

    expect(qb.skip).toHaveBeenCalledWith(10);

    expect(qb.take).toHaveBeenCalledWith(10);
  });

  // ============================================================
  // COMPLETAR
  // ============================================================

  it('debe devolver null cuando la lección no existe al completar', async () => {
    leccionRepo.findOne.mockResolvedValue(null);

    const result = await repository.completar(999, 10, {});

    expect(result).toBeNull();

    expect(inscripcionRepo.findOne).not.toHaveBeenCalled();

    expect(progresoRepo.save).not.toHaveBeenCalled();
  });

  it('debe devolver null cuando el usuario no está inscrito al completar', async () => {
    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 20,
      modulo: {
        id_modulo: 5,
        id_curso: 681,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue(null);

    const result = await repository.completar(20, 10, {});

    expect(result).toBeNull();

    expect(progresoRepo.findOne).not.toHaveBeenCalled();

    expect(progresoRepo.save).not.toHaveBeenCalled();
  });

  it('debe crear un progreso nuevo al completar una lección', async () => {
    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 20,
      modulo: {
        id_modulo: 5,
        id_curso: 681,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
      id_usuario: 10,
      id_curso: 681,
    });

    progresoRepo.findOne.mockResolvedValue(null);

    const progresoCreado = {
      id_inscripcion: 100,
      id_leccion: 20,
      estado: 'Completado',
      porcentaje_completado: 90,
    };

    progresoRepo.create.mockImplementation((data: any) => data);

    progresoRepo.save.mockResolvedValue(progresoCreado);

    const result = await repository.completar(20, 10, {
      porcentaje_completado: 90,
    });

    expect(progresoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_inscripcion: 100,
        id_leccion: 20,
        estado: 'Completado',
        porcentaje_completado: 90,
        fecha_completado: expect.any(Date),
        ultima_actividad: expect.any(Date),
      }),
    );

    expect(progresoRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_inscripcion: 100,
        id_leccion: 20,
        estado: 'Completado',
        porcentaje_completado: 90,
        fecha_completado: expect.any(Date),
        ultima_actividad: expect.any(Date),
      }),
    );

    expect(result).toEqual(progresoCreado);
  });

  it('debe actualizar un progreso existente al completar una lección', async () => {
    const progresoExistente: any = {
      id_progreso: 50,
      id_inscripcion: 100,
      id_leccion: 20,
      estado: 'En Progreso',
      porcentaje_completado: 30,
    };

    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 20,
      modulo: {
        id_modulo: 5,
        id_curso: 681,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
      id_usuario: 10,
      id_curso: 681,
    });

    progresoRepo.findOne.mockResolvedValue(progresoExistente);

    progresoRepo.save.mockImplementation(async (data: any) => data);

    const result = await repository.completar(20, 10, {
      porcentaje_completado: 80,
      ultimo_segundo_visto: 120,
      segmentos_vistos: '0-60,61-120',
      duracion_video: 300,
    });

    expect(progresoExistente.estado).toBe('Completado');

    expect(progresoExistente.porcentaje_completado).toBe(80);

    expect(progresoExistente.ultimo_segundo_visto).toBe(120);

    expect(progresoExistente.segmentos_vistos).toBe('0-60,61-120');

    expect(progresoExistente.duracion_video).toBe(300);

    expect(progresoExistente.fecha_completado).toEqual(expect.any(Date));

    expect(progresoExistente.ultima_actividad).toEqual(expect.any(Date));

    expect(result).toEqual(progresoExistente);

    expect(progresoRepo.save).toHaveBeenCalledWith(progresoExistente);
  });

  // ============================================================
  // NAVIGATION
  // ============================================================

  it('debe devolver navegación cuando la lección existe', async () => {
    const actual = {
      id_leccion: 20,
      id_modulo: 5,
      orden: 2,
    };

    const lecciones = [
      {
        id_leccion: 10,
        id_modulo: 5,
        orden: 1,
      },
      actual,
      {
        id_leccion: 30,
        id_modulo: 5,
        orden: 3,
      },
    ];

    leccionRepo.findOne.mockResolvedValue(actual);

    leccionRepo.find.mockResolvedValue(lecciones);

    const result = await repository.navegacion(20);

    expect(result).toEqual({
      anterior: lecciones[0],
      actual,
      siguiente: lecciones[2],
    });

    expect(leccionRepo.find).toHaveBeenCalledWith({
      where: {
        id_modulo: 5,
      },
      order: {
        orden: 'ASC',
      },
    });
  });

  it('debe devolver null en anterior cuando es la primera lección', async () => {
    const actual = {
      id_leccion: 20,
      id_modulo: 5,
      orden: 1,
    };

    leccionRepo.findOne.mockResolvedValue(actual);

    leccionRepo.find.mockResolvedValue([
      actual,
      {
        id_leccion: 30,
        id_modulo: 5,
        orden: 2,
      },
    ]);

    const result = await repository.navegacion(20);

    expect(result).toEqual({
      anterior: null,
      actual,
      siguiente: {
        id_leccion: 30,
        id_modulo: 5,
        orden: 2,
      },
    });
  });

  it('debe devolver null en siguiente cuando es la última lección', async () => {
    const actual = {
      id_leccion: 30,
      id_modulo: 5,
      orden: 2,
    };

    leccionRepo.findOne.mockResolvedValue(actual);

    leccionRepo.find.mockResolvedValue([
      {
        id_leccion: 20,
        id_modulo: 5,
        orden: 1,
      },
      actual,
    ]);

    const result = await repository.navegacion(30);

    expect(result).toEqual({
      anterior: {
        id_leccion: 20,
        id_modulo: 5,
        orden: 1,
      },
      actual,
      siguiente: null,
    });
  });

  it('debe devolver null cuando la lección no existe en navegación', async () => {
    leccionRepo.findOne.mockResolvedValue(null);

    const result = await repository.navegacion(999);

    expect(result).toBeNull();

    expect(leccionRepo.find).not.toHaveBeenCalled();
  });

  // ============================================================
  // COMMENTS
  // ============================================================

  it('debe devolver los comentarios de una lección', async () => {
    const comentarios = [
      {
        id_comentario: 1,
        id_leccion: 20,
        contenido: 'Muy buena clase',
      },
    ];

    comentarioRepo.find.mockResolvedValue(comentarios);

    const result = await repository.getComentarios(20);

    expect(result).toEqual(comentarios);

    expect(comentarioRepo.find).toHaveBeenCalledWith({
      where: {
        id_leccion: 20,
      },
      relations: ['usuario'],
      order: {
        fecha_comentario: 'DESC',
      },
    });
  });

  it('debe agregar un comentario con fecha automática', async () => {
    const resultExpected = {
      id_comentario: 5,
      id_leccion: 20,
      id_usuario: 10,
      contenido: 'Excelente',
    };

    comentarioRepo.create.mockImplementation((data: any) => data);

    comentarioRepo.save.mockResolvedValue(resultExpected);

    const before = Date.now();

    const result = await repository.addComentario(20, 10, 'Excelente');

    const after = Date.now();

    expect(comentarioRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_leccion: 20,
        id_usuario: 10,
        contenido: 'Excelente',
        fecha_comentario: expect.any(Date),
      }),
    );

    const payload = comentarioRepo.create.mock.calls[0][0];

    expect(payload.fecha_comentario.getTime()).toBeGreaterThanOrEqual(before);

    expect(payload.fecha_comentario.getTime()).toBeLessThanOrEqual(after);

    expect(result).toEqual(resultExpected);
  });

  it('debe eliminar un comentario', async () => {
    comentarioRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.deleteComentario(50);

    expect(comentarioRepo.delete).toHaveBeenCalledWith({
      id_comentario: 50,
    });
  });

  // ============================================================
  // HEARTBEAT
  // ============================================================

  it('debe devolver null cuando la lección no existe en heartbeat', async () => {
    leccionRepo.findOne.mockResolvedValue(null);

    const result = await repository.heartbeat(10, {
      id_leccion: 999,
    });

    expect(result).toBeNull();

    expect(inscripcionRepo.findOne).not.toHaveBeenCalled();

    expect(progresoRepo.save).not.toHaveBeenCalled();
  });

  it('debe devolver null cuando el usuario no está inscrito en heartbeat', async () => {
    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 20,
      modulo: {
        id_modulo: 5,
        id_curso: 681,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue(null);

    const result = await repository.heartbeat(10, {
      id_leccion: 20,
      porcentaje_completado: 30,
    });

    expect(result).toBeNull();

    expect(progresoRepo.findOne).not.toHaveBeenCalled();

    expect(progresoRepo.save).not.toHaveBeenCalled();
  });

  it('debe crear progreso nuevo en heartbeat', async () => {
    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 20,
      modulo: {
        id_modulo: 5,
        id_curso: 681,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
      id_usuario: 10,
      id_curso: 681,
    });

    progresoRepo.findOne.mockResolvedValue(null);

    progresoRepo.create.mockImplementation((data: any) => data);

    const saved = {
      id_inscripcion: 100,
      id_leccion: 20,
      estado: 'En Progreso',
      porcentaje_completado: 35,
    };

    progresoRepo.save.mockResolvedValue(saved);

    const result = await repository.heartbeat(10, {
      id_leccion: 20,
      ultimo_segundo_visto: 100,
      segmentos_vistos: '0-100',
      duracion_video: 300,
      porcentaje_completado: 35,
    });

    expect(progresoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_inscripcion: 100,
        id_leccion: 20,
        estado: 'En Progreso',
        ultima_actividad: expect.any(Date),
        primera_visualizacion: expect.any(Date),
      }),
    );

    expect(result).toEqual(saved);

    expect(progresoRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_inscripcion: 100,
        id_leccion: 20,
        estado: 'En Progreso',
        ultimo_segundo_visto: 100,
        segmentos_vistos: '0-100',
        duracion_video: 300,
        porcentaje_completado: 35,
        ultima_actividad: expect.any(Date),
        primera_visualizacion: expect.any(Date),
      }),
    );
  });

  it('debe no generar primera_visualizacion automática cuando heartbeat la recibe explícitamente', async () => {
    const primeraVisualizacion = new Date('2026-08-28T10:00:00.000Z');

    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 20,
      modulo: {
        id_modulo: 5,
        id_curso: 681,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
    });

    progresoRepo.findOne.mockResolvedValue(null);

    progresoRepo.create.mockImplementation((data: any) => data);

    progresoRepo.save.mockResolvedValue({});

    await repository.heartbeat(10, {
      id_leccion: 20,
      primera_visualizacion: primeraVisualizacion,
    });

    const payload = progresoRepo.create.mock.calls[0][0];

    expect(payload).not.toHaveProperty('primera_visualizacion');

    expect(payload.estado).toBe('En Progreso');

    expect(payload.id_inscripcion).toBe(100);

    expect(payload.id_leccion).toBe(20);
  });

  it('debe actualizar progreso existente en heartbeat', async () => {
    const progresoExistente: any = {
      id_progreso: 10,
      id_inscripcion: 100,
      id_leccion: 20,
      estado: 'En Progreso',
    };

    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 20,
      modulo: {
        id_modulo: 5,
        id_curso: 681,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
    });

    progresoRepo.findOne.mockResolvedValue(progresoExistente);

    progresoRepo.save.mockImplementation(async (data: any) => data);

    const result = await repository.heartbeat(10, {
      id_leccion: 20,
      ultimo_segundo_visto: 180,
      segmentos_vistos: '0-180',
      duracion_video: 300,
      porcentaje_completado: 60,
    });

    expect(progresoExistente.ultimo_segundo_visto).toBe(180);

    expect(progresoExistente.segmentos_vistos).toBe('0-180');

    expect(progresoExistente.duracion_video).toBe(300);

    expect(progresoExistente.porcentaje_completado).toBe(60);

    expect(progresoExistente.ultima_actividad).toEqual(expect.any(Date));

    expect(result).toEqual(progresoExistente);

    expect(progresoRepo.save).toHaveBeenCalledWith(progresoExistente);
  });
});
