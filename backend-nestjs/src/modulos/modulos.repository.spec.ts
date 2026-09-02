import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ModulosRepository } from './modulos.repository';

import { Modulo } from '../entities/modulo.entity';
import { Leccion } from '../entities/leccion.entity';
import { Material } from '../entities/material.entity';
import { ComentarioLeccion } from '../entities/comentario-leccion.entity';
import { ProgresoEstudiante } from '../entities/progreso-estudiante.entity';

describe('ModulosRepository', () => {
  let repository: ModulosRepository;

  let moduloRepo: any;
  let leccionRepo: any;
  let materialRepo: any;
  let comentarioRepo: any;
  let progresoRepo: any;

  const createQueryBuilderMock = () => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    moduloRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: any) => data),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    leccionRepo = {
      find: jest.fn(),
      delete: jest.fn(),
    };

    materialRepo = {
      find: jest.fn(),
      delete: jest.fn(),
    };

    comentarioRepo = {
      delete: jest.fn(),
    };

    progresoRepo = {
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModulosRepository,
        {
          provide: getRepositoryToken(Modulo),
          useValue: moduloRepo,
        },
        {
          provide: getRepositoryToken(Leccion),
          useValue: leccionRepo,
        },
        {
          provide: getRepositoryToken(Material),
          useValue: materialRepo,
        },
        {
          provide: getRepositoryToken(ComentarioLeccion),
          useValue: comentarioRepo,
        },
        {
          provide: getRepositoryToken(ProgresoEstudiante),
          useValue: progresoRepo,
        },
      ],
    }).compile();

    repository = module.get<ModulosRepository>(ModulosRepository);
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

  it('debe devolver los módulos de un curso con sus lecciones y materiales', async () => {
    const modulos: any[] = [
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

    const leccionesModulo1 = [
      {
        id_leccion: 10,
        id_modulo: 1,
        titulo: 'Lección 1',
        orden: 1,
      },
    ];

    const leccionesModulo2 = [
      {
        id_leccion: 20,
        id_modulo: 2,
        titulo: 'Lección 2',
        orden: 1,
      },
    ];

    const materialesModulo1 = [
      {
        id_material: 100,
        id_modulo: 1,
        nombre: 'Material 1',
        orden: 1,
      },
    ];

    const materialesModulo2 = [
      {
        id_material: 200,
        id_modulo: 2,
        nombre: 'Material 2',
        orden: 1,
      },
    ];

    moduloRepo.find.mockResolvedValue(modulos);

    leccionRepo.find
      .mockResolvedValueOnce(leccionesModulo1)
      .mockResolvedValueOnce(leccionesModulo2);

    materialRepo.find
      .mockResolvedValueOnce(materialesModulo1)
      .mockResolvedValueOnce(materialesModulo2);

    const result = await repository.findByCurso(681);

    expect(result).toEqual([
      {
        ...modulos[0],
        lecciones: leccionesModulo1,
        materiales: materialesModulo1,
      },
      {
        ...modulos[1],
        lecciones: leccionesModulo2,
        materiales: materialesModulo2,
      },
    ]);

    expect(moduloRepo.find).toHaveBeenCalledWith({
      where: {
        id_curso: 681,
      },
      order: {
        orden: 'ASC',
      },
    });

    expect(leccionRepo.find).toHaveBeenNthCalledWith(1, {
      where: {
        id_modulo: 1,
      },
      order: {
        orden: 'ASC',
      },
    });

    expect(leccionRepo.find).toHaveBeenNthCalledWith(2, {
      where: {
        id_modulo: 2,
      },
      order: {
        orden: 'ASC',
      },
    });

    expect(materialRepo.find).toHaveBeenNthCalledWith(1, {
      where: {
        id_modulo: 1,
      },
      order: {
        orden: 'ASC',
      },
    });

    expect(materialRepo.find).toHaveBeenNthCalledWith(2, {
      where: {
        id_modulo: 2,
      },
      order: {
        orden: 'ASC',
      },
    });
  });

  it('debe devolver un array vacío cuando el curso no tiene módulos', async () => {
    moduloRepo.find.mockResolvedValue([]);

    const result = await repository.findByCurso(999);

    expect(result).toEqual([]);

    expect(leccionRepo.find).not.toHaveBeenCalled();

    expect(materialRepo.find).not.toHaveBeenCalled();
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe buscar un módulo por ID', async () => {
    const modulo = {
      id_modulo: 10,
      id_curso: 681,
      titulo: 'Arquitectura Cloud',
      orden: 1,
    };

    moduloRepo.findOne.mockResolvedValue(modulo);

    const result = await repository.findById(10);

    expect(result).toEqual(modulo);

    expect(moduloRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_modulo: 10,
      },
    });
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear un módulo', async () => {
    const data: any = {
      id_curso: 681,
      titulo: 'Nuevo módulo',
      descripcion: 'Descripción',
      orden: 3,
      estado: 'Activo',
    };

    const created = {
      id_modulo: 20,
      ...data,
    };

    moduloRepo.create.mockImplementation((payload: any) => payload);

    moduloRepo.save.mockResolvedValue(created);

    const result = await repository.create(data);

    expect(moduloRepo.create).toHaveBeenCalledWith(data);

    expect(moduloRepo.save).toHaveBeenCalledWith(data);

    expect(result).toEqual(created);
  });

  // ============================================================
  // UPDATE
  // ============================================================

  it('debe actualizar un módulo excluyendo curso, lecciones y materiales', async () => {
    const data: any = {
      titulo: 'Módulo actualizado',
      descripcion: 'Nueva descripción',
      orden: 4,
      curso: {
        id_curso: 681,
      },
      lecciones: [
        {
          id_leccion: 10,
        },
      ],
      materiales: [
        {
          id_material: 100,
        },
      ],
    };

    const updated = {
      id_modulo: 20,
      id_curso: 681,
      titulo: 'Módulo actualizado',
      descripcion: 'Nueva descripción',
      orden: 4,
    };

    moduloRepo.update.mockResolvedValue({
      affected: 1,
    });

    moduloRepo.findOne.mockResolvedValue(updated);

    const result = await repository.update(20, data);

    expect(moduloRepo.update).toHaveBeenCalledWith(
      {
        id_modulo: 20,
      },
      {
        titulo: 'Módulo actualizado',
        descripcion: 'Nueva descripción',
        orden: 4,
      },
    );

    expect(moduloRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_modulo: 20,
      },
    });

    expect(result).toEqual(updated);
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar el módulo y todos sus datos relacionados', async () => {
    const lecciones = [
      {
        id_leccion: 10,
        id_modulo: 20,
      },
      {
        id_leccion: 11,
        id_modulo: 20,
      },
    ];

    leccionRepo.find.mockResolvedValue(lecciones);

    comentarioRepo.delete.mockResolvedValue({
      affected: 2,
    });

    progresoRepo.delete.mockResolvedValue({
      affected: 3,
    });

    leccionRepo.delete.mockResolvedValue({
      affected: 2,
    });

    materialRepo.delete.mockResolvedValue({
      affected: 1,
    });

    moduloRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.delete(20);

    expect(leccionRepo.find).toHaveBeenCalledWith({
      where: {
        id_modulo: 20,
      },
    });

    expect(comentarioRepo.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        id_leccion: expect.anything(),
      }),
    );

    expect(progresoRepo.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        id_leccion: expect.anything(),
      }),
    );

    expect(leccionRepo.delete).toHaveBeenCalledWith({
      id_modulo: 20,
    });

    expect(materialRepo.delete).toHaveBeenCalledWith({
      id_modulo: 20,
    });

    expect(moduloRepo.delete).toHaveBeenCalledWith({
      id_modulo: 20,
    });
  });

  it('debe eliminar materiales y módulo aunque no existan lecciones', async () => {
    leccionRepo.find.mockResolvedValue([]);

    materialRepo.delete.mockResolvedValue({
      affected: 2,
    });

    moduloRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.delete(20);

    expect(comentarioRepo.delete).not.toHaveBeenCalled();

    expect(progresoRepo.delete).not.toHaveBeenCalled();

    expect(leccionRepo.delete).not.toHaveBeenCalled();

    expect(materialRepo.delete).toHaveBeenCalledWith({
      id_modulo: 20,
    });

    expect(moduloRepo.delete).toHaveBeenCalledWith({
      id_modulo: 20,
    });
  });

  // ============================================================
  // FIND ALL
  // ============================================================

  it('debe devolver módulos paginados usando los valores válidos enviados', async () => {
    const qb = createQueryBuilderMock();

    const data = [
      {
        id_modulo: 10,
        titulo: 'Módulo 1',
      },
    ];

    qb.getManyAndCount.mockResolvedValue([data, 25]);

    moduloRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAll(2, 10);

    expect(result).toEqual({
      data,
      total: 25,
      current_page: 2,
      per_page: 10,
      last_page: 3,
    });

    expect(moduloRepo.createQueryBuilder).toHaveBeenCalledWith('m');

    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('m.curso', 'c');

    expect(qb.orderBy).toHaveBeenCalledWith('m.orden', 'ASC');

    expect(qb.skip).toHaveBeenCalledWith(10);

    expect(qb.take).toHaveBeenCalledWith(10);
  });

  it('debe normalizar una página inválida a 1', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    moduloRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAll(0, 10);

    expect(result).toEqual({
      data: [],
      total: 0,
      current_page: 1,
      per_page: 10,
      last_page: 0,
    });

    expect(qb.skip).toHaveBeenCalledWith(0);
  });

  it('debe normalizar un perPage inválido a 20', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    moduloRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAll(1, 0);

    expect(result).toEqual({
      data: [],
      total: 0,
      current_page: 1,
      per_page: 20,
      last_page: 0,
    });

    expect(qb.take).toHaveBeenCalledWith(20);
  });

  it('debe limitar perPage máximo a 200', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    moduloRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAll(1, 999);

    expect(result).toEqual({
      data: [],
      total: 0,
      current_page: 1,
      per_page: 200,
      last_page: 0,
    });

    expect(qb.take).toHaveBeenCalledWith(200);
  });

  it('debe aplicar los filtros de búsqueda, curso y estado', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    moduloRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.findAll(1, 20, {
      query: 'Cloud',
      id_curso: 681,
      estado: 'Publicado',
    });

    expect(qb.andWhere).toHaveBeenCalledWith(
      '(m.titulo LIKE :q OR m.descripcion LIKE :q)',
      {
        q: '%Cloud%',
      },
    );

    expect(qb.andWhere).toHaveBeenCalledWith('m.id_curso = :cur', {
      cur: 681,
    });

    expect(qb.andWhere).toHaveBeenCalledWith('m.estado = :est', {
      est: 'Publicado',
    });
  });

  // ============================================================
  // EXISTS BY CURSO AND ORDEN
  // ============================================================

  it('debe devolver true cuando el orden ya existe en el curso', async () => {
    const qb = createQueryBuilderMock();

    qb.getCount.mockResolvedValue(1);

    moduloRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.existsByCursoAndOrden(681, 3);

    expect(result).toBe(true);

    expect(moduloRepo.createQueryBuilder).toHaveBeenCalledWith('m');

    expect(qb.where).toHaveBeenCalledWith('m.id_curso = :idCurso', {
      idCurso: 681,
    });

    expect(qb.andWhere).toHaveBeenCalledWith('m.orden = :orden', {
      orden: 3,
    });

    expect(qb.getCount).toHaveBeenCalled();
  });

  it('debe devolver false cuando el orden no existe en el curso', async () => {
    const qb = createQueryBuilderMock();

    qb.getCount.mockResolvedValue(0);

    moduloRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.existsByCursoAndOrden(681, 3);

    expect(result).toBe(false);
  });

  it('debe excluir un módulo específico al comprobar el orden', async () => {
    const qb = createQueryBuilderMock();

    qb.getCount.mockResolvedValue(0);

    moduloRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.existsByCursoAndOrden(681, 3, 20);

    expect(qb.andWhere).toHaveBeenCalledWith('m.id_modulo != :excludeId', {
      excludeId: 20,
    });
  });

  it('no debe agregar exclusión cuando excludeId no está definido', async () => {
    const qb = createQueryBuilderMock();

    qb.getCount.mockResolvedValue(0);

    moduloRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.existsByCursoAndOrden(681, 3);

    expect(qb.andWhere).not.toHaveBeenCalledWith(
      'm.id_modulo != :excludeId',
      expect.anything(),
    );
  });
});
