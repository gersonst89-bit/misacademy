import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Like } from 'typeorm';

import { LineasAcademicasRepository } from './lineas-academicas.repository';

import { LineaAcademica } from '../entities/linea-academica.entity';
import { RutaAcademica } from '../entities/ruta-academica.entity';

describe('LineasAcademicasRepository', () => {
  let repository: LineasAcademicasRepository;

  let lineaRepo: any;
  let rutaRepo: any;

  const createQueryBuilderMock = () => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getOne: jest.fn(),
    getRawOne: jest.fn(),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    lineaRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((data: any) => data),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    rutaRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((data: any) => data),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineasAcademicasRepository,
        {
          provide: getRepositoryToken(LineaAcademica),
          useValue: lineaRepo,
        },
        {
          provide: getRepositoryToken(RutaAcademica),
          useValue: rutaRepo,
        },
      ],
    }).compile();

    repository = module.get<LineasAcademicasRepository>(
      LineasAcademicasRepository,
    );
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // ============================================================
  // LINEAS - FIND ALL
  // ============================================================

  it('debe devolver líneas académicas paginadas', async () => {
    const data = [
      {
        id_linea_academica: 1,
        nombre: 'Tecnología',
        slug: 'tecnologia',
        descripcion: 'Área tecnológica',
        imagen: 'tecnologia.jpg',
        estado: 'Publicado',
      },
    ];

    lineaRepo.findAndCount.mockResolvedValue([data, 1]);

    const result = await repository.findAllLineas({}, 1, 15);

    expect(result).toEqual({
      data,
      total: 1,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });

    expect(lineaRepo.findAndCount).toHaveBeenCalledWith({
      where: {},
      select: [
        'id_linea_academica',
        'nombre',
        'slug',
        'descripcion',
        'imagen',
        'estado',
      ],
      skip: 0,
      take: 15,
    });
  });

  it('debe aplicar el filtro de estado en líneas académicas', async () => {
    lineaRepo.findAndCount.mockResolvedValue([[], 0]);

    await repository.findAllLineas(
      {
        estado: 'Publicado',
      },
      2,
      10,
    );

    expect(lineaRepo.findAndCount).toHaveBeenCalledWith({
      where: {
        estado: 'Publicado',
      },
      select: [
        'id_linea_academica',
        'nombre',
        'slug',
        'descripcion',
        'imagen',
        'estado',
      ],
      skip: 10,
      take: 10,
    });
  });

  // ============================================================
  // LINEA BY ID
  // ============================================================

  it('debe buscar una línea por ID y cargar sus rutas', async () => {
    const linea: any = {
      id_linea_academica: 1,
      nombre: 'Tecnología',
    };

    const rutas = [
      {
        id_ruta: 10,
        id_linea_academica: 1,
        nombre: 'Frontend',
      },
      {
        id_ruta: 11,
        id_linea_academica: 1,
        nombre: 'Backend',
      },
    ];

    lineaRepo.findOne.mockResolvedValue(linea);

    rutaRepo.find.mockResolvedValue(rutas);

    const result = await repository.findLineaById(1);

    expect(result).toEqual({
      ...linea,
      rutas_academicas: rutas,
    });

    expect(lineaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_linea_academica: 1,
      },
    });

    expect(rutaRepo.find).toHaveBeenCalledWith({
      where: {
        id_linea_academica: 1,
      },
      relations: ['cursos'],
    });
  });

  it('debe devolver null cuando la línea no existe', async () => {
    lineaRepo.findOne.mockResolvedValue(null);

    const result = await repository.findLineaById(999);

    expect(result).toBeNull();

    expect(rutaRepo.find).not.toHaveBeenCalled();
  });

  // ============================================================
  // LINEA BY SLUG
  // ============================================================

  it('debe buscar una línea por slug y cargar sus rutas', async () => {
    const linea: any = {
      id_linea_academica: 2,
      nombre: 'Negocios',
      slug: 'negocios',
    };

    const rutas = [
      {
        id_ruta: 20,
        id_linea_academica: 2,
        nombre: 'Marketing',
      },
    ];

    lineaRepo.findOne.mockResolvedValue(linea);

    rutaRepo.find.mockResolvedValue(rutas);

    const result = await repository.findLineaBySlug('negocios');

    expect(result).toEqual({
      ...linea,
      rutas_academicas: rutas,
    });

    expect(lineaRepo.findOne).toHaveBeenCalledWith({
      where: {
        slug: 'negocios',
      },
    });

    expect(rutaRepo.find).toHaveBeenCalledWith({
      where: {
        id_linea_academica: 2,
      },
      relations: ['cursos'],
    });
  });

  it('debe devolver null cuando el slug no existe', async () => {
    lineaRepo.findOne.mockResolvedValue(null);

    const result = await repository.findLineaBySlug('no-existe');

    expect(result).toBeNull();

    expect(rutaRepo.find).not.toHaveBeenCalled();
  });

  // ============================================================
  // CREATE LINEA
  // ============================================================

  it('debe crear una línea con fechas automáticas', async () => {
    const data: any = {
      nombre: 'Tecnología',
      slug: 'tecnologia',
      descripcion: 'Área tecnológica',
      estado: 'Publicado',
    };

    const saved = {
      id_linea_academica: 10,
      ...data,
    };

    lineaRepo.save.mockResolvedValue(saved);

    const result = await repository.createLinea(data);

    expect(lineaRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Tecnología',
        slug: 'tecnologia',
        descripcion: 'Área tecnológica',
        estado: 'Publicado',
        fecha_creacion: expect.any(Date),
        fecha_actualizacion: expect.any(Date),
      }),
    );

    expect(lineaRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Tecnología',
        slug: 'tecnologia',
        fecha_creacion: expect.any(Date),
        fecha_actualizacion: expect.any(Date),
      }),
    );

    expect(result).toEqual(saved);
  });

  // ============================================================
  // UPDATE LINEA
  // ============================================================

  it('debe actualizar una línea y devolverla nuevamente', async () => {
    const updated = {
      id_linea_academica: 1,
      nombre: 'Tecnología Actualizada',
    };

    lineaRepo.update.mockResolvedValue({
      affected: 1,
    });

    jest.spyOn(repository, 'findLineaById').mockResolvedValue(updated as any);

    const result = await repository.updateLinea(1, {
      nombre: 'Tecnología Actualizada',
    });

    expect(lineaRepo.update).toHaveBeenCalledWith(
      {
        id_linea_academica: 1,
      },
      expect.objectContaining({
        nombre: 'Tecnología Actualizada',
        fecha_actualizacion: expect.any(Date),
      }),
    );

    expect(repository.findLineaById).toHaveBeenCalledWith(1);

    expect(result).toEqual(updated);
  });

  // ============================================================
  // DELETE LINEA
  // ============================================================

  it('debe eliminar una línea académica', async () => {
    lineaRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.deleteLinea(1);

    expect(lineaRepo.delete).toHaveBeenCalledWith({
      id_linea_academica: 1,
    });
  });

  // ============================================================
  // RUTAS - FIND ALL
  // ============================================================

  it('debe devolver rutas paginadas', async () => {
    const qb = createQueryBuilderMock();

    const data = [
      {
        id_ruta: 10,
        nombre: 'Ruta Frontend',
      },
    ];

    qb.getManyAndCount.mockResolvedValue([data, 1]);

    rutaRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAllRutas({}, 1, 15);

    expect(result).toEqual({
      data,
      total: 1,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });

    expect(rutaRepo.createQueryBuilder).toHaveBeenCalledWith('r');

    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith(
      'r.lineaAcademica',
      'lineaAcademica',
    );

    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('r.cursos', 'cursos');

    expect(qb.skip).toHaveBeenCalledWith(0);

    expect(qb.take).toHaveBeenCalledWith(15);
  });

  it('debe aplicar nombre y estado en la búsqueda pública de rutas', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    rutaRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.findAllRutas(
      {
        nombre: 'Frontend',
        estado: 'Publicado',
      },
      2,
      10,
    );

    expect(qb.andWhere).toHaveBeenCalledWith('r.nombre LIKE :nombre', {
      nombre: '%Frontend%',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('r.estado = :estado', {
      estado: 'Publicado',
    });

    expect(qb.skip).toHaveBeenCalledWith(10);

    expect(qb.take).toHaveBeenCalledWith(10);
  });

  // ============================================================
  // RUTAS ADMIN
  // ============================================================

  it('debe devolver rutas para administración con campos seleccionados', async () => {
    const qb = createQueryBuilderMock();

    const data = [
      {
        id_ruta: 20,
        nombre: 'Backend',
      },
    ];

    qb.getManyAndCount.mockResolvedValue([data, 1]);

    rutaRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAllRutasAdmin({}, 1, 10);

    expect(result).toEqual({
      data,
      total: 1,
      current_page: 1,
      per_page: 10,
      last_page: 1,
    });

    expect(qb.select).toHaveBeenCalledWith([
      'r.id_ruta',
      'r.id_linea_academica',
      'r.nombre',
      'r.descripcion',
      'r.imagen',
      'r.horas_totales',
      'r.nivel',
      'r.precio',
      'r.estado',
      'r.destacado',
      'r.fecha_actualizacion',
    ]);
  });

  it('debe aplicar nombre y estado en rutas administrativas', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    rutaRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.findAllRutasAdmin(
      {
        nombre: 'Backend',
        estado: 'Activo',
      },
      2,
      10,
    );

    expect(qb.andWhere).toHaveBeenCalledWith('r.nombre LIKE :nombre', {
      nombre: '%Backend%',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('r.estado = :estado', {
      estado: 'Activo',
    });

    expect(qb.skip).toHaveBeenCalledWith(10);

    expect(qb.take).toHaveBeenCalledWith(10);
  });

  // ============================================================
  // RUTAS MENU
  // ============================================================

  it('debe devolver el menú de rutas ordenado por nombre', async () => {
    const rutas = [
      {
        id_ruta: 1,
        nombre: 'Backend',
      },
      {
        id_ruta: 2,
        nombre: 'Frontend',
      },
    ];

    rutaRepo.find.mockResolvedValue(rutas);

    const result = await repository.findRutasMenu();

    expect(result).toEqual(rutas);

    expect(rutaRepo.find).toHaveBeenCalledWith({
      select: ['id_ruta', 'nombre'],
      order: {
        nombre: 'ASC',
      },
    });
  });

  // ============================================================
  // RUTA BY ID
  // ============================================================

  it('debe buscar una ruta por ID con línea y cursos', async () => {
    const ruta = {
      id_ruta: 10,
      nombre: 'Frontend',
    };

    rutaRepo.findOne.mockResolvedValue(ruta);

    const result = await repository.findRutaById(10);

    expect(result).toEqual(ruta);

    expect(rutaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_ruta: 10,
      },
      relations: ['lineaAcademica', 'cursos'],
    });
  });

  // ============================================================
  // DESTACADAS
  // ============================================================

  it('debe devolver rutas destacadas con el límite indicado', async () => {
    const rutas = [
      {
        id_ruta: 10,
        nombre: 'Ruta destacada',
        destacado: true,
      },
    ];

    rutaRepo.find.mockResolvedValue(rutas);

    const result = await repository.findRutasDestacadas(5);

    expect(result).toEqual(rutas);

    expect(rutaRepo.find).toHaveBeenCalledWith({
      where: {
        destacado: true,
      },
      relations: ['lineaAcademica', 'cursos'],
      take: 5,
    });
  });

  // ============================================================
  // BUSCAR RUTAS
  // ============================================================

  it('debe buscar rutas por nombre con Like y paginación', async () => {
    const data = [
      {
        id_ruta: 10,
        nombre: 'Frontend',
      },
    ];

    rutaRepo.findAndCount.mockResolvedValue([data, 1]);

    const result = await repository.buscarRutas('Frontend', 2, 10);

    expect(result).toEqual({
      data,
      total: 1,
      current_page: 2,
      per_page: 10,
      last_page: 1,
    });

    expect(rutaRepo.findAndCount).toHaveBeenCalledWith({
      where: {
        nombre: Like('%Frontend%'),
      },
      relations: ['lineaAcademica'],
      skip: 10,
      take: 10,
    });
  });

  // ============================================================
  // CREATE RUTA
  // ============================================================

  it('debe crear una ruta y convertir los IDs de cursos en relaciones', async () => {
    const data: any = {
      id_linea_academica: 1,
      nombre: 'Ruta Frontend',
      descripcion: 'Ruta especializada',
      cursos: [681, 682],
    };

    const saved = {
      id_ruta: 30,
      id_linea_academica: 1,
      nombre: 'Ruta Frontend',
    };

    rutaRepo.create.mockImplementation((payload: any) => payload);

    rutaRepo.save.mockResolvedValue(saved);

    const result = await repository.createRuta(data);

    expect(rutaRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_linea_academica: 1,
        nombre: 'Ruta Frontend',
        descripcion: 'Ruta especializada',
        cursos: [{ id_curso: 681 }, { id_curso: 682 }],
        fecha_creacion: expect.any(Date),
        fecha_actualizacion: expect.any(Date),
      }),
    );

    expect(rutaRepo.save).toHaveBeenCalled();

    expect(result).toEqual(saved);
  });

  it('debe crear una ruta con cursos vacíos cuando no se envía cursos', async () => {
    const data: any = {
      id_linea_academica: 1,
      nombre: 'Ruta sin cursos',
    };

    const saved = {
      id_ruta: 31,
      nombre: 'Ruta sin cursos',
    };

    rutaRepo.create.mockImplementation((payload: any) => payload);

    rutaRepo.save.mockResolvedValue(saved);

    const result = await repository.createRuta(data);

    expect(rutaRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_linea_academica: 1,
        nombre: 'Ruta sin cursos',
        cursos: [],
        fecha_creacion: expect.any(Date),
        fecha_actualizacion: expect.any(Date),
      }),
    );

    expect(result).toEqual(saved);
  });

  // ============================================================
  // UPDATE RUTA
  // ============================================================

  it('debe devolver null al actualizar una ruta inexistente', async () => {
    jest.spyOn(repository, 'findRutaById').mockResolvedValue(null);

    const result = await repository.updateRuta(999, {
      nombre: 'Ruta',
    });

    expect(result).toBeNull();

    expect(rutaRepo.update).not.toHaveBeenCalled();

    expect(rutaRepo.save).not.toHaveBeenCalled();
  });

  it('debe actualizar una ruta sin modificar cursos cuando cursos no viene', async () => {
    const existing: any = {
      id_ruta: 40,
      nombre: 'Ruta Antigua',
      cursos: [{ id_curso: 681 }],
    };

    const updated: any = {
      id_ruta: 40,
      nombre: 'Ruta Nueva',
    };

    jest
      .spyOn(repository, 'findRutaById')
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(updated);

    rutaRepo.update.mockResolvedValue({
      affected: 1,
    });

    const result = await repository.updateRuta(40, {
      nombre: 'Ruta Nueva',
    });

    expect(rutaRepo.update).toHaveBeenCalledWith(
      {
        id_ruta: 40,
      },
      expect.objectContaining({
        nombre: 'Ruta Nueva',
        fecha_actualizacion: expect.any(Date),
      }),
    );

    expect(rutaRepo.save).not.toHaveBeenCalled();

    expect(result).toEqual(updated);
  });

  it('debe actualizar una ruta y reemplazar los cursos cuando se proporcionan', async () => {
    const existing: any = {
      id_ruta: 40,
      nombre: 'Ruta Antigua',
      cursos: [{ id_curso: 681 }],
    };

    const updated: any = {
      id_ruta: 40,
      nombre: 'Ruta Nueva',
      cursos: [{ id_curso: 682 }, { id_curso: 683 }],
    };

    jest
      .spyOn(repository, 'findRutaById')
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(updated);

    rutaRepo.update.mockResolvedValue({
      affected: 1,
    });

    rutaRepo.save.mockResolvedValue(existing);

    const result = await repository.updateRuta(40, {
      nombre: 'Ruta Nueva',
      cursos: [682, 683],
    });

    expect(rutaRepo.update).toHaveBeenCalledWith(
      {
        id_ruta: 40,
      },
      expect.objectContaining({
        nombre: 'Ruta Nueva',
        fecha_actualizacion: expect.any(Date),
      }),
    );

    expect(existing.cursos).toEqual([{ id_curso: 682 }, { id_curso: 683 }]);

    expect(rutaRepo.save).toHaveBeenCalledWith(existing);

    expect(result).toEqual(updated);
  });

  // ============================================================
  // DELETE RUTA
  // ============================================================

  it('debe eliminar una ruta', async () => {
    rutaRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.deleteRuta(40);

    expect(rutaRepo.delete).toHaveBeenCalledWith({
      id_ruta: 40,
    });
  });

  // ============================================================
  // RUTA BY SLUG
  // ============================================================

  it('debe buscar una ruta por slug normalizado', async () => {
    const qb = createQueryBuilderMock();

    const ruta = {
      id_ruta: 50,
      nombre: 'Ruta Frontend',
    };

    qb.getOne.mockResolvedValue(ruta);

    rutaRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findRutaBySlug('ruta-frontend');

    expect(result).toEqual(ruta);

    expect(rutaRepo.createQueryBuilder).toHaveBeenCalledWith('r');

    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith(
      'r.lineaAcademica',
      'lineaAcademica',
    );

    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('r.cursos', 'cursos');

    expect(qb.where).toHaveBeenCalledWith(
      "LOWER(REPLACE(r.nombre, ' ', '-')) = LOWER(:slug)",
      {
        slug: 'ruta-frontend',
      },
    );
  });

  // ============================================================
  // FIND LINEA BY CURSO
  // ============================================================

  it('debe devolver la línea académica asociada a un curso', async () => {
    const qb = createQueryBuilderMock();

    qb.getRawOne.mockResolvedValue({
      id_linea_academica: 3,
      nombre: 'Tecnología',
    });

    rutaRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findLineaByCursoId(681);

    expect(result).toEqual({
      id_linea_academica: 3,
      nombre: 'Tecnología',
    });

    expect(rutaRepo.createQueryBuilder).toHaveBeenCalledWith('r');

    expect(qb.innerJoin).toHaveBeenCalledWith(
      'r.cursos',
      'curso',
      'curso.id_curso = :idCurso',
      {
        idCurso: 681,
      },
    );

    expect(qb.innerJoin).toHaveBeenCalledWith(
      'r.lineaAcademica',
      'lineaAcademica',
    );

    expect(qb.select).toHaveBeenCalledWith(
      'lineaAcademica.id_linea_academica',
      'id_linea_academica',
    );

    expect(qb.addSelect).toHaveBeenCalledWith(
      'lineaAcademica.nombre',
      'nombre',
    );
  });

  it('debe devolver null cuando un curso no tiene línea académica asociada', async () => {
    const qb = createQueryBuilderMock();

    qb.getRawOne.mockResolvedValue(undefined);

    rutaRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findLineaByCursoId(999);

    expect(result).toBeNull();
  });

  // ============================================================
  // LINEAS MENU
  // ============================================================

  it('debe devolver únicamente líneas publicadas ordenadas por nombre', async () => {
    const lineas = [
      {
        id_linea_academica: 1,
        nombre: 'Tecnología',
        estado: 'Publicado',
      },
    ];

    lineaRepo.find.mockResolvedValue(lineas);

    const result = await repository.findLineasMenu();

    expect(result).toEqual(lineas);

    expect(lineaRepo.find).toHaveBeenCalledWith({
      where: {
        estado: 'Publicado',
      },
      select: ['id_linea_academica', 'nombre', 'descripcion', 'slug', 'estado'],
      order: {
        nombre: 'ASC',
      },
    });
  });
});
