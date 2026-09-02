import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ResenasRepository } from './resenas.repository';
import { Resena } from '../entities/resena.entity';

describe('ResenasRepository', () => {
  let repository: ResenasRepository;

  let repo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((data: any) => data),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResenasRepository,
        {
          provide: getRepositoryToken(Resena),
          useValue: repo,
        },
      ],
    }).compile();

    repository = module.get<ResenasRepository>(ResenasRepository);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // ============================================================
  // FIND BY CURSO
  // ============================================================

  it('debe devolver las reseñas de un curso ordenadas por fecha descendente', async () => {
    const resenas = [
      {
        id_resena: 1,
        id_curso: 681,
        id_usuario: 10,
        calificacion: 5,
      },
      {
        id_resena: 2,
        id_curso: 681,
        id_usuario: 11,
        calificacion: 4,
      },
    ];

    repo.find.mockResolvedValue(resenas);

    const result = await repository.findByCurso(681);

    expect(result).toEqual(resenas);

    expect(repo.find).toHaveBeenCalledWith({
      where: {
        id_curso: 681,
      },
      relations: ['usuario'],
      order: {
        fecha_resena: 'DESC',
      },
    });
  });

  // ============================================================
  // FIND BY USUARIO
  // ============================================================

  it('debe devolver las reseñas de un usuario ordenadas por fecha descendente', async () => {
    const resenas = [
      {
        id_resena: 1,
        id_curso: 681,
        id_usuario: 10,
        calificacion: 5,
      },
      {
        id_resena: 2,
        id_curso: 682,
        id_usuario: 10,
        calificacion: 4,
      },
    ];

    repo.find.mockResolvedValue(resenas);

    const result = await repository.findByUsuario(10);

    expect(result).toEqual(resenas);

    expect(repo.find).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
      },
      relations: ['curso'],
      order: {
        fecha_resena: 'DESC',
      },
    });
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe devolver una reseña por ID con usuario y curso', async () => {
    const resena = {
      id_resena: 10,
      id_curso: 681,
      id_usuario: 10,
      calificacion: 5,
      comentario: 'Excelente',
      usuario: {
        id_usuario: 10,
      },
      curso: {
        id_curso: 681,
      },
    };

    repo.findOne.mockResolvedValue(resena);

    const result = await repository.findById(10);

    expect(result).toEqual(resena);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: {
        id_resena: 10,
      },
      relations: ['usuario', 'curso'],
    });
  });

  it('debe devolver null cuando la reseña no existe', async () => {
    repo.findOne.mockResolvedValue(null);

    const result = await repository.findById(999);

    expect(result).toBeNull();

    expect(repo.findOne).toHaveBeenCalledWith({
      where: {
        id_resena: 999,
      },
      relations: ['usuario', 'curso'],
    });
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear una reseña asignando el usuario y la fecha automáticamente', async () => {
    const data: any = {
      id_curso: 681,
      calificacion: 5,
      comentario: 'Excelente curso',
    };

    const created = {
      id_resena: 20,
      id_usuario: 10,
      ...data,
    };

    repo.create.mockImplementation((payload: any) => payload);

    repo.save.mockResolvedValue(created);

    const before = Date.now();

    const result = await repository.create(10, data);

    const after = Date.now();

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_curso: 681,
        id_usuario: 10,
        calificacion: 5,
        comentario: 'Excelente curso',
        fecha_resena: expect.any(Date),
      }),
    );

    const payload = repo.create.mock.calls[0][0];

    expect(payload.fecha_resena.getTime()).toBeGreaterThanOrEqual(before);

    expect(payload.fecha_resena.getTime()).toBeLessThanOrEqual(after);

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_curso: 681,
        id_usuario: 10,
        calificacion: 5,
        comentario: 'Excelente curso',
        fecha_resena: expect.any(Date),
      }),
    );

    expect(result).toEqual(created);
  });

  // ============================================================
  // UPDATE
  // ============================================================

  it('debe actualizar una reseña y devolverla nuevamente', async () => {
    const updated = {
      id_resena: 20,
      id_usuario: 10,
      id_curso: 681,
      calificacion: 4,
      comentario: 'Actualizada',
    };

    repo.update.mockResolvedValue({
      affected: 1,
    });

    jest.spyOn(repository, 'findById').mockResolvedValue(updated as any);

    const result = await repository.update(20, {
      calificacion: 4,
      comentario: 'Actualizada',
    } as any);

    expect(repo.update).toHaveBeenCalledWith(
      {
        id_resena: 20,
      },
      {
        calificacion: 4,
        comentario: 'Actualizada',
      },
    );

    expect(repository.findById).toHaveBeenCalledWith(20);

    expect(result).toEqual(updated);
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar una reseña por ID', async () => {
    repo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.delete(20);

    expect(repo.delete).toHaveBeenCalledWith({
      id_resena: 20,
    });
  });
});
