import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EstadisticasRepository } from './estadisticas.repository';

import {
  Usuario,
  Curso,
  Inscripcion,
  Pago,
  Certificacion,
  LineaAcademica,
} from '../entities';

describe('EstadisticasRepository', () => {
  let repository: EstadisticasRepository;

  let usuarioRepo: any;
  let cursoRepo: any;
  let inscripcionRepo: any;
  let pagoRepo: any;
  let certificacionRepo: any;
  let lineaRepo: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    usuarioRepo = {
      count: jest.fn(),
    };

    cursoRepo = {
      count: jest.fn(),
    };

    inscripcionRepo = {
      count: jest.fn(),
      find: jest.fn(),
    };

    pagoRepo = {
      count: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    certificacionRepo = {
      count: jest.fn(),
    };

    lineaRepo = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadisticasRepository,
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepo,
        },
        {
          provide: getRepositoryToken(Curso),
          useValue: cursoRepo,
        },
        {
          provide: getRepositoryToken(Inscripcion),
          useValue: inscripcionRepo,
        },
        {
          provide: getRepositoryToken(Pago),
          useValue: pagoRepo,
        },
        {
          provide: getRepositoryToken(Certificacion),
          useValue: certificacionRepo,
        },
        {
          provide: getRepositoryToken(LineaAcademica),
          useValue: lineaRepo,
        },
      ],
    }).compile();

    repository = module.get<EstadisticasRepository>(EstadisticasRepository);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // ============================================================
  // DASHBOARD
  // ============================================================

  it('debe devolver las estadísticas completas del dashboard', async () => {
    const totalUsuarios = 100;
    const totalEstudiantes = 80;
    const totalCursos = 25;
    const totalCertificados = 60;
    const totalInscripciones = 150;
    const totalPagos = 120;

    const inscripcionesRecientes = [
      {
        id_inscripcion: 1,
        id_usuario: 10,
        id_curso: 681,
      },
    ];

    const pagosRecientes = [
      {
        id_pago: 50,
        id_usuario: 10,
      },
    ];

    const ingresoQb = {
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        total: '15499.50',
      }),
    };

    usuarioRepo.count
      .mockResolvedValueOnce(totalUsuarios)
      .mockResolvedValueOnce(totalEstudiantes);

    cursoRepo.count.mockResolvedValue(totalCursos);

    certificacionRepo.count.mockResolvedValue(totalCertificados);

    inscripcionRepo.count.mockResolvedValue(totalInscripciones);

    pagoRepo.count.mockResolvedValue(totalPagos);

    pagoRepo.createQueryBuilder.mockReturnValue(ingresoQb);

    inscripcionRepo.find.mockResolvedValue(inscripcionesRecientes);

    pagoRepo.find.mockResolvedValue(pagosRecientes);

    const result = await repository.getDashboard();

    expect(result).toEqual({
      totalUsuarios,
      totalEstudiantes,
      totalCursos,
      totalCertificados,
      totalInscripciones,
      totalPagos,
      ingresoTotal: '15499.50',
      inscripcionesRecientes,
      pagosRecientes,
    });

    expect(usuarioRepo.count).toHaveBeenNthCalledWith(1);

    expect(usuarioRepo.count).toHaveBeenNthCalledWith(2, {
      where: {
        id_rol: 3,
        estado: 'Activo',
      },
    });

    expect(cursoRepo.count).toHaveBeenCalled();

    expect(certificacionRepo.count).toHaveBeenCalled();

    expect(inscripcionRepo.count).toHaveBeenCalled();

    expect(pagoRepo.count).toHaveBeenCalledWith({
      where: {
        estado: 'Completado',
      },
    });

    expect(pagoRepo.createQueryBuilder).toHaveBeenCalledWith('p');

    expect(ingresoQb.where).toHaveBeenCalledWith('p.estado = :e', {
      e: 'Completado',
    });

    expect(ingresoQb.select).toHaveBeenCalledWith(
      'SUM(p.monto_total)',
      'total',
    );

    expect(inscripcionRepo.find).toHaveBeenCalledWith({
      relations: ['usuario', 'curso'],
      order: {
        fecha_inscripcion: 'DESC',
      },
      take: 10,
    });

    expect(pagoRepo.find).toHaveBeenCalledWith({
      relations: ['usuario'],
      order: {
        fecha_pago: 'DESC',
      },
      take: 10,
    });
  });

  it('debe devolver ingresoTotal en 0 cuando la consulta no devuelve total', async () => {
    const ingresoQb = {
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(undefined),
    };

    usuarioRepo.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

    cursoRepo.count.mockResolvedValue(0);
    certificacionRepo.count.mockResolvedValue(0);
    inscripcionRepo.count.mockResolvedValue(0);
    pagoRepo.count.mockResolvedValue(0);

    pagoRepo.createQueryBuilder.mockReturnValue(ingresoQb);

    inscripcionRepo.find.mockResolvedValue([]);
    pagoRepo.find.mockResolvedValue([]);

    const result = await repository.getDashboard();

    expect(result.ingresoTotal).toBe(0);

    expect(result.inscripcionesRecientes).toEqual([]);

    expect(result.pagosRecientes).toEqual([]);
  });

  // ============================================================
  // ESTUDIANTES POR LINEA
  // ============================================================

  it('debe devolver estudiantes agrupados por línea académica', async () => {
    const data = [
      {
        nombre_linea: 'Inteligencia Artificial',
        total_estudiantes: '15',
      },
      {
        nombre_linea: 'Desarrollo Web',
        total_estudiantes: '8',
      },
      {
        nombre_linea: 'Datos',
        total_estudiantes: '0',
      },
    ];

    const queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(data),
    };

    lineaRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await repository.getEstudiantesPorLinea();

    expect(result).toEqual({
      status: 'success',
      lineas_academicas: [
        {
          nombre_linea: 'Inteligencia Artificial',
          total_estudiantes: 15,
        },
        {
          nombre_linea: 'Desarrollo Web',
          total_estudiantes: 8,
        },
        {
          nombre_linea: 'Datos',
          total_estudiantes: 0,
        },
      ],
    });

    expect(lineaRepo.createQueryBuilder).toHaveBeenCalledWith('la');

    expect(queryBuilder.leftJoin).toHaveBeenNthCalledWith(
      1,
      'rutas_academicas',
      'ra',
      'ra.id_linea_academica = la.id_linea_academica',
    );

    expect(queryBuilder.leftJoin).toHaveBeenNthCalledWith(
      2,
      'inscripciones_rutas',
      'ir',
      'ir.id_ruta = ra.id_ruta',
    );

    expect(queryBuilder.select).toHaveBeenCalledWith(
      'la.nombre',
      'nombre_linea',
    );

    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'COUNT(ir.id_inscripcion_ruta)',
      'total_estudiantes',
    );

    expect(queryBuilder.groupBy).toHaveBeenCalledWith('la.id_linea_academica');
  });

  it('debe convertir resultados inválidos de estudiantes por línea a 0', async () => {
    const queryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          nombre_linea: 'Línea X',
          total_estudiantes: undefined,
        },
        {
          nombre_linea: 'Línea Y',
          total_estudiantes: 'abc',
        },
        {
          nombre_linea: 'Línea Z',
          total_estudiantes: '12',
        },
      ]),
    };

    lineaRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await repository.getEstudiantesPorLinea();

    expect(result.lineas_academicas).toEqual([
      {
        nombre_linea: 'Línea X',
        total_estudiantes: 0,
      },
      {
        nombre_linea: 'Línea Y',
        total_estudiantes: 0,
      },
      {
        nombre_linea: 'Línea Z',
        total_estudiantes: 12,
      },
    ]);
  });

  // ============================================================
  // RETENCION MENSUAL
  // ============================================================

  it('debe calcular correctamente el porcentaje de retención', async () => {
    usuarioRepo.count.mockResolvedValueOnce(200).mockResolvedValueOnce(150);

    const result = await repository.getRetencionMensual();

    expect(result.status).toBe('success');

    expect(result.porcentaje_retencion).toBe('75%');

    expect(result.mes_actual).toEqual(expect.any(String));

    expect(usuarioRepo.count).toHaveBeenNthCalledWith(1);

    expect(usuarioRepo.count).toHaveBeenNthCalledWith(2, {
      where: {
        estado: 'Activo',
      },
    });
  });

  it('debe devolver 0% de retención cuando no existen usuarios', async () => {
    usuarioRepo.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

    const result = await repository.getRetencionMensual();

    expect(result.porcentaje_retencion).toBe('0%');
  });

  // ============================================================
  // MAS VENDIDOS
  // ============================================================

  it('debe devolver los cursos más vendidos del mes', async () => {
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          nombre_curso: 'Curso de IA',
          total_ventas: '25',
        },
        {
          nombre_curso: 'NestJS',
          total_ventas: '10',
        },
      ]),
    };

    pagoRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await repository.getMasVendidosMes();

    expect(result).toEqual({
      status: 'success',
      cursos_mas_vendidos: [
        {
          nombre_curso: 'Curso de IA',
          total_ventas: 25,
        },
        {
          nombre_curso: 'NestJS',
          total_ventas: 10,
        },
      ],
    });

    expect(pagoRepo.createQueryBuilder).toHaveBeenCalledWith('p');

    expect(queryBuilder.innerJoin).toHaveBeenNthCalledWith(
      1,
      'detalle_pagos',
      'dp',
      'dp.id_pago = p.id_pago',
    );

    expect(queryBuilder.innerJoin).toHaveBeenNthCalledWith(
      2,
      'cursos',
      'c',
      'c.id_curso = dp.id_curso',
    );

    expect(queryBuilder.where).toHaveBeenCalledWith('p.estado = :est', {
      est: 'Completado',
    });

    expect(queryBuilder.select).toHaveBeenCalledWith(
      'c.nombre',
      'nombre_curso',
    );

    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'COUNT(dp.id_detalle)',
      'total_ventas',
    );

    expect(queryBuilder.groupBy).toHaveBeenCalledWith('c.id_curso');

    expect(queryBuilder.orderBy).toHaveBeenCalledWith('total_ventas', 'DESC');

    expect(queryBuilder.limit).toHaveBeenCalledWith(5);
  });

  it('debe convertir ventas inválidas a 0', async () => {
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          nombre_curso: 'Curso A',
          total_ventas: undefined,
        },
        {
          nombre_curso: 'Curso B',
          total_ventas: 'abc',
        },
        {
          nombre_curso: 'Curso C',
          total_ventas: '7',
        },
      ]),
    };

    pagoRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await repository.getMasVendidosMes();

    expect(result.cursos_mas_vendidos).toEqual([
      {
        nombre_curso: 'Curso A',
        total_ventas: 0,
      },
      {
        nombre_curso: 'Curso B',
        total_ventas: 0,
      },
      {
        nombre_curso: 'Curso C',
        total_ventas: 7,
      },
    ]);
  });
});
