import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { InscripcionesRepository } from './inscripciones.repository';
import { Inscripcion } from '../entities/inscripcion.entity';

describe('InscripcionesRepository', () => {
  let repository: InscripcionesRepository;
  let repo: {
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((data: any) => data),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscripcionesRepository,
        {
          provide: getRepositoryToken(Inscripcion),
          useValue: repo,
        },
      ],
    }).compile();

    repository = module.get<InscripcionesRepository>(InscripcionesRepository);
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

  it('debe devolver inscripciones paginadas', async () => {
    const data = [
      {
        id_inscripcion: 1,
        id_usuario: 10,
        id_curso: 681,
      },
    ];

    repo.findAndCount.mockResolvedValue([data, 1]);

    const result = await repository.findAll(1, 20);

    expect(result).toEqual({
      data,
      total: 1,
      current_page: 1,
      per_page: 20,
      last_page: 1,
    });

    expect(repo.findAndCount).toHaveBeenCalledWith({
      relations: ['usuario', 'curso'],
      skip: 0,
      take: 20,
      order: {
        fecha_inscripcion: 'DESC',
      },
    });
  });

  it('debe aplicar correctamente la paginación', async () => {
    repo.findAndCount.mockResolvedValue([[], 35]);

    const result = await repository.findAll(2, 10);

    expect(result).toEqual({
      data: [],
      total: 35,
      current_page: 2,
      per_page: 10,
      last_page: 4,
    });

    expect(repo.findAndCount).toHaveBeenCalledWith({
      relations: ['usuario', 'curso'],
      skip: 10,
      take: 10,
      order: {
        fecha_inscripcion: 'DESC',
      },
    });
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe buscar una inscripción por ID', async () => {
    const inscripcion = {
      id_inscripcion: 15,
      id_usuario: 10,
      id_curso: 681,
    };

    repo.findOne.mockResolvedValue(inscripcion);

    const result = await repository.findById(15);

    expect(result).toEqual(inscripcion);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: {
        id_inscripcion: 15,
      },
      relations: ['usuario', 'curso'],
    });
  });

  it('debe devolver null cuando la inscripción no existe', async () => {
    repo.findOne.mockResolvedValue(null);

    const result = await repository.findById(999);

    expect(result).toBeNull();

    expect(repo.findOne).toHaveBeenCalledWith({
      where: {
        id_inscripcion: 999,
      },
      relations: ['usuario', 'curso'],
    });
  });

  // ============================================================
  // FIND BY USER
  // ============================================================

  it('debe devolver las inscripciones de un usuario', async () => {
    const inscripciones = [
      {
        id_inscripcion: 1,
        id_usuario: 10,
        id_curso: 681,
      },
      {
        id_inscripcion: 2,
        id_usuario: 10,
        id_curso: 682,
      },
    ];

    repo.find.mockResolvedValue(inscripciones);

    const result = await repository.findByUsuario(10);

    expect(result).toEqual(inscripciones);

    expect(repo.find).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
      },
      relations: ['curso'],
    });
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear una inscripción agregando la fecha automáticamente', async () => {
    const data = {
      id_usuario: 10,
      id_curso: 681,
      estado: 'Activo',
    };

    const created = {
      id_inscripcion: 50,
      ...data,
    };

    repo.create.mockImplementation((payload: any) => payload);

    repo.save.mockResolvedValue(created);

    const before = Date.now();

    const result = await repository.create(data);

    const after = Date.now();

    expect(result).toEqual(created);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 10,
        id_curso: 681,
        estado: 'Activo',
        fecha_inscripcion: expect.any(Date),
      }),
    );

    const payload = repo.create.mock.calls[0][0];

    expect(payload.fecha_inscripcion.getTime()).toBeGreaterThanOrEqual(before);

    expect(payload.fecha_inscripcion.getTime()).toBeLessThanOrEqual(after);

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 10,
        id_curso: 681,
        estado: 'Activo',
        fecha_inscripcion: expect.any(Date),
      }),
    );
  });

  // ============================================================
  // UPDATE
  // ============================================================

  it('debe actualizar una inscripción y devolverla nuevamente', async () => {
    const updated = {
      id_inscripcion: 50,
      id_usuario: 10,
      id_curso: 681,
      estado: 'Completado',
    };

    repo.update.mockResolvedValue({
      affected: 1,
    });

    repo.findOne.mockResolvedValue(updated);

    const result = await repository.update(50, {
      estado: 'Completado',
    });

    expect(repo.update).toHaveBeenCalledWith(
      {
        id_inscripcion: 50,
      },
      {
        estado: 'Completado',
      },
    );

    expect(repo.findOne).toHaveBeenCalledWith({
      where: {
        id_inscripcion: 50,
      },
      relations: ['usuario', 'curso'],
    });

    expect(result).toEqual(updated);
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar una inscripción por ID', async () => {
    repo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.delete(50);

    expect(repo.delete).toHaveBeenCalledWith({
      id_inscripcion: 50,
    });
  });
});
