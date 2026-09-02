import { Test, TestingModule } from '@nestjs/testing';

import { ResenasService } from './resenas.service';
import { ResenasRepository } from './resenas.repository';

describe('ResenasService', () => {
  let service: ResenasService;

  let repo: {
    findByCurso: jest.Mock;
    findByUsuario: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repo = {
      findByCurso: jest.fn(),
      findByUsuario: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResenasService,
        {
          provide: ResenasRepository,
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<ResenasService>(ResenasService);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // FIND BY CURSO
  // ============================================================

  it('debe devolver las reseñas de un curso', async () => {
    const resenas = [
      {
        id_resena: 1,
        id_curso: 681,
        id_usuario: 10,
        calificacion: 5,
        comentario: 'Excelente curso',
      },
      {
        id_resena: 2,
        id_curso: 681,
        id_usuario: 11,
        calificacion: 4,
        comentario: 'Muy bueno',
      },
    ];

    repo.findByCurso.mockResolvedValue(resenas);

    const result = await service.findByCurso(681);

    expect(result).toEqual(resenas);

    expect(repo.findByCurso).toHaveBeenCalledWith(681);
  });

  // ============================================================
  // FIND BY USUARIO
  // ============================================================

  it('debe devolver las reseñas de un usuario', async () => {
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

    repo.findByUsuario.mockResolvedValue(resenas);

    const result = await service.findByUsuario(10);

    expect(result).toEqual(resenas);

    expect(repo.findByUsuario).toHaveBeenCalledWith(10);
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear una reseña', async () => {
    const dto = {
      id_curso: 681,
      calificacion: 5,
      comentario: 'Excelente curso',
    };

    const created = {
      id_resena: 10,
      id_usuario: 10,
      ...dto,
    };

    repo.create.mockResolvedValue(created);

    const result = await service.create(10, dto as any);

    expect(result).toEqual(created);

    expect(repo.create).toHaveBeenCalledWith(10, dto);
  });

  // ============================================================
  // UPDATE
  // ============================================================

  it('debe actualizar una reseña', async () => {
    const dto = {
      calificacion: 4,
      comentario: 'Actualizada',
    };

    const updated = {
      id_resena: 10,
      id_usuario: 10,
      id_curso: 681,
      calificacion: 4,
      comentario: 'Actualizada',
    };

    repo.update.mockResolvedValue(updated);

    const result = await service.update(10, dto as any);

    expect(result).toEqual(updated);

    expect(repo.update).toHaveBeenCalledWith(10, dto);
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar una reseña', async () => {
    repo.delete.mockResolvedValue(undefined);

    const result = await service.delete(10);

    expect(result).toEqual({
      message: 'Reseña eliminada',
    });

    expect(repo.delete).toHaveBeenCalledWith(10);
  });
});
