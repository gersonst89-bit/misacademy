import { Test, TestingModule } from '@nestjs/testing';

import { ModulosService } from './modulos.service';
import { ModulosRepository } from './modulos.repository';

describe('ModulosService', () => {
  let service: ModulosService;

  let repo: {
    findByCurso: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
    existsByCursoAndOrden: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repo = {
      findByCurso: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      existsByCursoAndOrden: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModulosService,
        {
          provide: ModulosRepository,
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<ModulosService>(ModulosService);
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

  it('debe devolver los módulos de un curso', async () => {
    const modulos = [
      {
        id_modulo: 1,
        id_curso: 681,
        titulo: 'Módulo 1',
        orden: 1,
      },
      {
        id_modulo: 2,
        id_curso: 681,
        titulo: 'Módulo 2',
        orden: 2,
      },
    ];

    repo.findByCurso.mockResolvedValue(modulos);

    const result = await service.findByCurso(681);

    expect(result).toEqual(modulos);

    expect(repo.findByCurso).toHaveBeenCalledWith(681);
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe devolver un módulo existente', async () => {
    const modulo = {
      id_modulo: 10,
      id_curso: 681,
      titulo: 'Arquitectura Cloud',
      orden: 1,
    };

    repo.findById.mockResolvedValue(modulo);

    const result = await service.findById(10);

    expect(result).toEqual(modulo);

    expect(repo.findById).toHaveBeenCalledWith(10);
  });

  it('debe rechazar un módulo inexistente', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById(999)).rejects.toThrow('Módulo no encontrado');

    expect(repo.findById).toHaveBeenCalledWith(999);
  });

  // ============================================================
  // FIND ALL
  // ============================================================

  it('debe devolver módulos paginados con filtros', async () => {
    const expected = {
      data: [
        {
          id_modulo: 10,
          titulo: 'Arquitectura Cloud',
        },
      ],
      total: 1,
      current_page: 2,
      per_page: 10,
      last_page: 1,
    };

    repo.findAll.mockResolvedValue(expected);

    const result = await service.findAll(2, 10, 'Cloud', 681, 'Publicado');

    expect(result).toEqual(expected);

    expect(repo.findAll).toHaveBeenCalledWith(2, 10, {
      query: 'Cloud',
      id_curso: 681,
      estado: 'Publicado',
    });
  });

  it('debe enviar al repository los filtros opcionales sin modificar', async () => {
    repo.findAll.mockResolvedValue({
      data: [],
      total: 0,
      current_page: 1,
      per_page: 20,
      last_page: 0,
    });

    await service.findAll();

    expect(repo.findAll).toHaveBeenCalledWith(undefined, undefined, {
      query: undefined,
      id_curso: undefined,
      estado: undefined,
    });
  });

  // ============================================================
  // CHECK ORDER
  // ============================================================

  it('debe comprobar si un orden está ocupado dentro de un curso', async () => {
    repo.existsByCursoAndOrden.mockResolvedValue(true);

    const result = await service.existsByCursoAndOrden(681, 3);

    expect(result).toBe(true);

    expect(repo.existsByCursoAndOrden).toHaveBeenCalledWith(681, 3, undefined);
  });

  it('debe comprobar el orden excluyendo un módulo', async () => {
    repo.existsByCursoAndOrden.mockResolvedValue(false);

    const result = await service.existsByCursoAndOrden(681, 3, 10);

    expect(result).toBe(false);

    expect(repo.existsByCursoAndOrden).toHaveBeenCalledWith(681, 3, 10);
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear un módulo', async () => {
    const dto = {
      id_curso: 681,
      titulo: 'Nuevo módulo',
      descripcion: 'Descripción',
      orden: 3,
      estado: 'Activo',
    };

    const created = {
      id_modulo: 20,
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

  it('debe actualizar un módulo', async () => {
    const dto = {
      titulo: 'Módulo actualizado',
      orden: 4,
    };

    const updated = {
      id_modulo: 20,
      id_curso: 681,
      titulo: 'Módulo actualizado',
      orden: 4,
    };

    repo.update.mockResolvedValue(updated);

    const result = await service.update(20, dto as any);

    expect(result).toEqual(updated);

    expect(repo.update).toHaveBeenCalledWith(20, dto);
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar un módulo', async () => {
    repo.delete.mockResolvedValue(undefined);

    const result = await service.delete(20);

    expect(result).toEqual({
      message: 'Módulo eliminado',
    });

    expect(repo.delete).toHaveBeenCalledWith(20);
  });
});
