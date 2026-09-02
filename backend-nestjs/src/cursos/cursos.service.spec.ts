import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { CursosService } from './cursos.service';
import { CursosRepository } from './cursos.repository';

describe('CursosService', () => {
  let service: CursosService;

  let cursosRepo: {
    findAll: jest.Mock;
    findMenu: jest.Mock;
    findById: jest.Mock;
    findBySlug: jest.Mock;
    findDestacados: jest.Mock;
    buscar: jest.Mock;
    assignRutas: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    getContenido: jest.Mock;
    getProgreso: jest.Mock;
    getMisCursos: jest.Mock;
  };

  let dataSource: {
    createQueryRunner: jest.Mock;
  };

  let queryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    manager: {
      create: jest.Mock;
      save: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),

      manager: {
        create: jest.fn((entity, data) => data),
        save: jest.fn(),
        update: jest.fn(),
      },
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    cursosRepo = {
      findAll: jest.fn(),
      findMenu: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findDestacados: jest.fn(),
      buscar: jest.fn(),
      assignRutas: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getContenido: jest.fn(),
      getProgreso: jest.fn(),
      getMisCursos: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursosService,
        {
          provide: CursosRepository,
          useValue: cursosRepo,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<CursosService>(CursosService);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // FIND ALL
  // ============================================================

  it('debe devolver cursos paginados', async () => {
    const query = {
      page: 2,
      per_page: 10,
      estado: 'Publicado',
    };

    const expected = {
      data: [
        {
          id_curso: 681,
          nombre: 'Fundamentos de IA',
        },
      ],
      total: 1,
      current_page: 2,
      per_page: 10,
      last_page: 2,
    };

    cursosRepo.findAll.mockResolvedValue(expected);

    const result = await service.findAll(query);

    expect(result).toEqual(expected);

    expect(cursosRepo.findAll).toHaveBeenCalledWith(query, 2, 10);
  });

  it('debe usar paginación por defecto cuando no se envía', async () => {
    cursosRepo.findAll.mockResolvedValue({
      data: [],
      total: 0,
      current_page: 1,
      per_page: 15,
      last_page: 0,
    });

    await service.findAll({});

    expect(cursosRepo.findAll).toHaveBeenCalledWith({}, 1, 15);
  });

  // ============================================================
  // MENU
  // ============================================================

  it('debe devolver el menú de cursos', async () => {
    const menu = [
      {
        id_curso: 681,
        nombre: 'Fundamentos de IA',
      },
      {
        id_curso: 682,
        nombre: 'Python para Ciencia de Datos',
      },
    ];

    cursosRepo.findMenu.mockResolvedValue(menu);

    const result = await service.getMenu();

    expect(result).toEqual(menu);
    expect(cursosRepo.findMenu).toHaveBeenCalled();
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe devolver un curso existente', async () => {
    const curso = {
      id_curso: 681,
      nombre: 'Fundamentos de IA',
    };

    cursosRepo.findById.mockResolvedValue(curso);

    const result = await service.findById(681);

    expect(result).toEqual(curso);
    expect(cursosRepo.findById).toHaveBeenCalledWith(681);
  });

  it('debe rechazar un curso inexistente', async () => {
    cursosRepo.findById.mockResolvedValue(null);

    await expect(service.findById(999)).rejects.toThrow('Curso no encontrado');

    expect(cursosRepo.findById).toHaveBeenCalledWith(999);
  });

  // ============================================================
  // FIND BY SLUG
  // ============================================================

  it('debe devolver un curso por slug', async () => {
    const curso = {
      id_curso: 681,
      nombre: 'Fundamentos de IA',
      slug: 'fundamentos-de-ia',
    };

    cursosRepo.findBySlug.mockResolvedValue(curso);

    const result = await service.findBySlug('fundamentos-de-ia');

    expect(result).toEqual(curso);
    expect(cursosRepo.findBySlug).toHaveBeenCalledWith('fundamentos-de-ia');
  });

  it('debe rechazar un slug inexistente', async () => {
    cursosRepo.findBySlug.mockResolvedValue(null);

    await expect(service.findBySlug('no-existe')).rejects.toThrow(
      'Curso no encontrado',
    );
  });

  // ============================================================
  // DESTACADOS
  // ============================================================

  it('debe devolver los cursos destacados', async () => {
    const destacados = [
      {
        id_curso: 681,
        nombre: 'Curso destacado',
        destacado: true,
      },
    ];

    cursosRepo.findDestacados.mockResolvedValue(destacados);

    const result = await service.getDestacados(5);

    expect(result).toEqual(destacados);

    expect(cursosRepo.findDestacados).toHaveBeenCalledWith(5);
  });

  it('debe permitir obtener destacados sin indicar límite', async () => {
    cursosRepo.findDestacados.mockResolvedValue([]);

    await service.getDestacados();

    expect(cursosRepo.findDestacados).toHaveBeenCalledWith(undefined);
  });

  // ============================================================
  // SEARCH
  // ============================================================

  it('debe buscar cursos', async () => {
    const expected = {
      data: [
        {
          id_curso: 681,
          nombre: 'React',
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    };

    cursosRepo.buscar.mockResolvedValue(expected);

    const result = await service.buscar('React', 1, 15);

    expect(result).toEqual(expected);

    expect(cursosRepo.buscar).toHaveBeenCalledWith('React', 1, 15);
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear un curso correctamente usando el usuario como docente por defecto', async () => {
    const dto = {
      nombre: 'Nuevo Curso',
      descripcion: 'Descripción',
      descripcion_corta: 'Curso corto',
      nivel: 'Principiante',
      precio: 99,
      duracion_horas: 20,
      tiempo: 4,
      estado: 'Publicado',
      destacado: false,
      rutas: [1, 2],
    };

    const cursoCreado = {
      id_curso: 700,
      ...dto,
    };

    const cursoGuardado = {
      id_curso: 700,
    };

    queryRunner.manager.create.mockReturnValue({
      ...dto,
      id_docente: 10,
    });

    queryRunner.manager.save.mockResolvedValue(cursoGuardado);

    cursosRepo.assignRutas.mockResolvedValue(undefined);

    cursosRepo.findById.mockResolvedValue(cursoCreado);

    const result = await service.create(dto as any, 10);

    expect(dataSource.createQueryRunner).toHaveBeenCalled();

    expect(queryRunner.connect).toHaveBeenCalled();
    expect(queryRunner.startTransaction).toHaveBeenCalled();

    expect(queryRunner.manager.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        nombre: 'Nuevo Curso',
        descripcion: 'Descripción',
        objetivos: undefined,
        precio: 99,
        duracion_horas: 20,
        id_docente: 10,
        fecha_creacion: expect.any(Date),
        fecha_actualizacion: expect.any(Date),
      }),
    );

    expect(queryRunner.manager.save).toHaveBeenCalled();

    expect(cursosRepo.assignRutas).toHaveBeenCalledWith(
      700,
      [1, 2],
      queryRunner.manager,
    );

    expect(queryRunner.commitTransaction).toHaveBeenCalled();

    expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();

    expect(queryRunner.release).toHaveBeenCalled();

    expect(result).toEqual(cursoCreado);
  });

  it('debe usar lo_que_aprenderas cuando objetivos no está definido', async () => {
    const dto = {
      nombre: 'Curso Objetivos',
      lo_que_aprenderas: 'Aprenderás React y Tailwind',
      rutas: [],
    };

    queryRunner.manager.create.mockReturnValue({});

    queryRunner.manager.save.mockResolvedValue({
      id_curso: 701,
    });

    cursosRepo.findById.mockResolvedValue({
      id_curso: 701,
      nombre: 'Curso Objetivos',
    });

    await service.create(dto as any, 25);

    expect(queryRunner.manager.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        objetivos: 'Aprenderás React y Tailwind',
        id_docente: 25,
      }),
    );

    expect(cursosRepo.assignRutas).not.toHaveBeenCalled();
  });

  it('debe usar id_docente del DTO cuando viene informado', async () => {
    const dto = {
      nombre: 'Curso Docente',
      id_docente: 50,
    };

    queryRunner.manager.create.mockReturnValue({});

    queryRunner.manager.save.mockResolvedValue({
      id_curso: 702,
    });

    cursosRepo.findById.mockResolvedValue({
      id_curso: 702,
    });

    await service.create(dto as any, 10);

    expect(queryRunner.manager.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id_docente: 50,
      }),
    );
  });

  it('debe hacer rollback si falla la creación del curso', async () => {
    const dto = {
      nombre: 'Curso con error',
    };

    queryRunner.manager.create.mockImplementation(() => {
      throw new Error('DB error');
    });

    await expect(service.create(dto as any, 10)).rejects.toThrow(
      'Error al crear el curso: DB error',
    );

    expect(queryRunner.startTransaction).toHaveBeenCalled();

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();

    expect(queryRunner.commitTransaction).not.toHaveBeenCalled();

    expect(queryRunner.release).toHaveBeenCalled();
  });

  // ============================================================
  // UPDATE
  // ============================================================

  it('debe actualizar un curso correctamente', async () => {
    const dto = {
      nombre: 'Curso actualizado',
      descripcion: 'Nueva descripción',
      precio: 120,
      rutas: [3, 4],
    };

    queryRunner.manager.update.mockResolvedValue({
      affected: 1,
    });

    cursosRepo.assignRutas.mockResolvedValue(undefined);

    const actualizado = {
      id_curso: 681,
      nombre: 'Curso actualizado',
    };

    cursosRepo.findById.mockResolvedValue(actualizado);

    const result = await service.update(681, dto as any);

    expect(queryRunner.manager.update).toHaveBeenCalledWith(
      expect.anything(),
      { id_curso: 681 },
      expect.objectContaining({
        nombre: 'Curso actualizado',
        descripcion: 'Nueva descripción',
        precio: 120,
        fecha_actualizacion: expect.any(Date),
      }),
    );

    expect(cursosRepo.assignRutas).toHaveBeenCalledWith(
      681,
      [3, 4],
      queryRunner.manager,
    );

    expect(queryRunner.commitTransaction).toHaveBeenCalled();

    expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();

    expect(queryRunner.release).toHaveBeenCalled();

    expect(result).toEqual(actualizado);
  });

  it('debe eliminar campos undefined antes de actualizar', async () => {
    const dto = {
      nombre: 'Solo nombre',
      descripcion: undefined,
      precio: undefined,
      estado: undefined,
    };

    queryRunner.manager.update.mockResolvedValue({
      affected: 1,
    });

    cursosRepo.findById.mockResolvedValue({
      id_curso: 681,
      nombre: 'Solo nombre',
    });

    await service.update(681, dto as any);

    const updateCall = queryRunner.manager.update.mock.calls[0][2];

    expect(updateCall.nombre).toBe('Solo nombre');

    expect(updateCall).not.toHaveProperty('descripcion');

    expect(updateCall).not.toHaveProperty('precio');

    expect(updateCall).not.toHaveProperty('estado');
  });

  it('debe hacer rollback si falla la actualización', async () => {
    queryRunner.manager.update.mockRejectedValue(new Error('Update DB error'));

    await expect(
      service.update(681, {
        nombre: 'Curso',
      } as any),
    ).rejects.toThrow('Error al actualizar el curso: Update DB error');

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();

    expect(queryRunner.commitTransaction).not.toHaveBeenCalled();

    expect(queryRunner.release).toHaveBeenCalled();
  });

  // ============================================================
  // CHANGE STATE
  // ============================================================

  it('debe cambiar el estado de un curso', async () => {
    const expected = {
      affected: 1,
    };

    cursosRepo.update.mockResolvedValue(expected);

    const result = await service.cambiarEstado(681, {
      estado: 'Publicado',
    } as any);

    expect(result).toEqual(expected);

    expect(cursosRepo.update).toHaveBeenCalledWith(681, {
      estado: 'Publicado',
    });
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar un curso', async () => {
    cursosRepo.delete.mockResolvedValue(undefined);

    const result = await service.delete(681);

    expect(result).toEqual({
      message: 'Curso eliminado correctamente',
    });

    expect(cursosRepo.delete).toHaveBeenCalledWith(681);
  });

  // ============================================================
  // CONTENT
  // ============================================================

  it('debe devolver el contenido de un curso para un usuario', async () => {
    const contenido = [
      {
        id_modulo: 1,
        titulo: 'Módulo 1',
        lecciones: [],
      },
    ];

    cursosRepo.getContenido.mockResolvedValue(contenido);

    const result = await service.getContenido(681, 10);

    expect(result).toEqual(contenido);

    expect(cursosRepo.getContenido).toHaveBeenCalledWith(681, 10);
  });

  // ============================================================
  // PROGRESS
  // ============================================================

  it('debe devolver el progreso de un curso', async () => {
    const progreso = {
      progreso: 75,
      lecciones_completadas: 6,
      total_lecciones: 8,
    };

    cursosRepo.getProgreso.mockResolvedValue(progreso);

    const result = await service.getProgreso(681, 10);

    expect(result).toEqual(progreso);

    expect(cursosRepo.getProgreso).toHaveBeenCalledWith(681, 10);
  });

  // ============================================================
  // MY COURSES
  // ============================================================

  it('debe devolver los cursos del usuario', async () => {
    const cursos = [
      {
        id_inscripcion: 1,
        id_usuario: 10,
        id_curso: 681,
      },
    ];

    cursosRepo.getMisCursos.mockResolvedValue(cursos);

    const result = await service.getMisCursos(10);

    expect(result).toEqual(cursos);

    expect(cursosRepo.getMisCursos).toHaveBeenCalledWith(10);
  });
});
