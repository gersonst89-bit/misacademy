import { Test, TestingModule } from '@nestjs/testing';

import { InscripcionesService } from './inscripciones.service';
import { InscripcionesRepository } from './inscripciones.repository';

describe('InscripcionesService', () => {
  let service: InscripcionesService;

  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findByUsuario: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUsuario: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscripcionesService,
        {
          provide: InscripcionesRepository,
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<InscripcionesService>(InscripcionesService);
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

  it('debe devolver todas las inscripciones', async () => {
    const expected = {
      data: [
        {
          id_inscripcion: 1,
          id_usuario: 10,
          id_curso: 681,
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 20,
      last_page: 1,
    };

    repo.findAll.mockResolvedValue(expected);

    const result = await service.findAll(1, 20);

    expect(result).toEqual(expected);

    expect(repo.findAll).toHaveBeenCalledWith(1, 20);
  });

  it('debe permitir listar inscripciones usando los valores por defecto', async () => {
    const expected = {
      data: [],
      total: 0,
      current_page: undefined,
      per_page: undefined,
      last_page: undefined,
    };

    repo.findAll.mockResolvedValue(expected);

    const result = await service.findAll();

    expect(result).toEqual(expected);

    expect(repo.findAll).toHaveBeenCalledWith(undefined, undefined);
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe devolver una inscripción existente', async () => {
    const inscripcion = {
      id_inscripcion: 10,
      id_usuario: 20,
      id_curso: 681,
      estado: 'Activo',
    };

    repo.findById.mockResolvedValue(inscripcion);

    const result = await service.findById(10);

    expect(result).toEqual(inscripcion);

    expect(repo.findById).toHaveBeenCalledWith(10);
  });

  it('debe rechazar una inscripción inexistente', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById(999)).rejects.toThrow(
      'Inscripción no encontrada',
    );

    expect(repo.findById).toHaveBeenCalledWith(999);
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

    repo.findByUsuario.mockResolvedValue(inscripciones);

    const result = await service.findByUsuario(10);

    expect(result).toEqual(inscripciones);

    expect(repo.findByUsuario).toHaveBeenCalledWith(10);
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear una inscripción', async () => {
    const dto = {
      id_usuario: 10,
      id_curso: 681,
      estado: 'Activo',
    };

    const created = {
      id_inscripcion: 50,
      ...dto,
    };

    repo.create.mockResolvedValue(created);

    const result = await service.create(dto as any);

    expect(result).toEqual(created);

    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  // ============================================================
  // UPDATE
  // ============================================================

  it('debe actualizar una inscripción', async () => {
    const dto = {
      estado: 'Completado',
    };

    const updated = {
      id_inscripcion: 50,
      id_usuario: 10,
      id_curso: 681,
      estado: 'Completado',
    };

    repo.update.mockResolvedValue(updated);

    const result = await service.update(50, dto as any);

    expect(result).toEqual(updated);

    expect(repo.update).toHaveBeenCalledWith(50, dto);
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar una inscripción', async () => {
    repo.delete.mockResolvedValue(undefined);

    const result = await service.delete(50);

    expect(result).toEqual({
      message: 'Inscripción eliminada',
    });

    expect(repo.delete).toHaveBeenCalledWith(50);
  });
});
