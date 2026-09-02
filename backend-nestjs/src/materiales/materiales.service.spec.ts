import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MaterialesService } from './materiales.service';
import { Material } from '../entities/material.entity';

describe('MaterialesService', () => {
  let service: MaterialesService;

  let materialRepo: {
    find: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    materialRepo = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialesService,
        {
          provide: getRepositoryToken(Material),
          useValue: materialRepo,
        },
      ],
    }).compile();

    service = module.get<MaterialesService>(MaterialesService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe devolver los materiales de un curso ordenados', async () => {
    const materiales = [
      {
        id_material: 1,
        id_curso: 10,
        id_modulo: 2,
        nombre: 'Material 1',
        orden: 1,
      },
      {
        id_material: 2,
        id_curso: 10,
        id_modulo: 2,
        nombre: 'Material 2',
        orden: 2,
      },
    ];

    materialRepo.find.mockResolvedValue(materiales);

    const result = await service.findByCurso(10);

    expect(result).toEqual(materiales);

    expect(materialRepo.find).toHaveBeenCalledWith({
      where: {
        id_curso: 10,
      },
      relations: ['modulo'],
      order: {
        orden: 'ASC',
      },
    });
  });

  it('debe devolver un array vacío cuando el curso no tiene materiales', async () => {
    materialRepo.find.mockResolvedValue([]);

    const result = await service.findByCurso(999);

    expect(result).toEqual([]);

    expect(materialRepo.find).toHaveBeenCalledWith({
      where: {
        id_curso: 999,
      },
      relations: ['modulo'],
      order: {
        orden: 'ASC',
      },
    });
  });

  it('debe devolver los materiales de un módulo ordenados', async () => {
    const materiales = [
      {
        id_material: 10,
        id_modulo: 5,
        nombre: 'PDF',
        orden: 1,
      },
      {
        id_material: 11,
        id_modulo: 5,
        nombre: 'Video',
        orden: 2,
      },
    ];

    materialRepo.find.mockResolvedValue(materiales);

    const result = await service.findByModulo(5);

    expect(result).toEqual(materiales);

    expect(materialRepo.find).toHaveBeenCalledWith({
      where: {
        id_modulo: 5,
      },
      relations: ['modulo'],
      order: {
        orden: 'ASC',
      },
    });
  });

  it('debe devolver un array vacío cuando el módulo no tiene materiales', async () => {
    materialRepo.find.mockResolvedValue([]);

    const result = await service.findByModulo(999);

    expect(result).toEqual([]);

    expect(materialRepo.find).toHaveBeenCalledWith({
      where: {
        id_modulo: 999,
      },
      relations: ['modulo'],
      order: {
        orden: 'ASC',
      },
    });
  });
});
