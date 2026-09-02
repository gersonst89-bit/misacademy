import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PagosRepository } from './pagos.repository';

import { Pago } from '../entities/pago.entity';
import { DetallePago } from '../entities/detalle-pago.entity';
import { TipoPago } from '../entities/tipo-pago.entity';

describe('PagosRepository', () => {
  let repository: PagosRepository;

  let pagoRepo: any;
  let detalleRepo: any;
  let tipoRepo: any;

  const createQueryBuilderMock = () => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    pagoRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: any) => data),
      update: jest.fn(),
      delete: jest.fn(),
    };

    detalleRepo = {
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: any) => data),
    };

    tipoRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: any) => data),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosRepository,
        {
          provide: getRepositoryToken(Pago),
          useValue: pagoRepo,
        },
        {
          provide: getRepositoryToken(DetallePago),
          useValue: detalleRepo,
        },
        {
          provide: getRepositoryToken(TipoPago),
          useValue: tipoRepo,
        },
      ],
    }).compile();

    repository = module.get<PagosRepository>(PagosRepository);
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

  it('debe devolver pagos paginados y mapear monto_total a monto', async () => {
    const pagos = [
      {
        id_pago: 1,
        id_usuario: 10,
        monto_total: 199.99,
        estado: 'Pendiente',
      },
      {
        id_pago: 2,
        id_usuario: 11,
        monto_total: 99,
        estado: 'Completado',
      },
    ];

    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([pagos, 2]);

    pagoRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAll(2, 10);

    expect(result).toEqual({
      data: [
        {
          ...pagos[0],
          monto: 199.99,
        },
        {
          ...pagos[1],
          monto: 99,
        },
      ],
      total: 2,
      current_page: 2,
      per_page: 10,
      last_page: 1,
    });

    expect(pagoRepo.createQueryBuilder).toHaveBeenCalledWith('p');

    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('p.usuario', 'u');

    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('p.tipo_pago', 't');

    expect(qb.orderBy).toHaveBeenCalledWith('p.fecha_pago', 'DESC');

    expect(qb.skip).toHaveBeenCalledWith(10);

    expect(qb.take).toHaveBeenCalledWith(10);
  });

  it('debe aplicar el filtro por estado', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    pagoRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.findAll(1, 20, {
      estado: 'Completado',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('p.estado = :est', {
      est: 'Completado',
    });
  });

  it('debe aplicar el filtro por fecha de inicio', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    pagoRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.findAll(1, 20, {
      fecha_inicio: '2026-08-01',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('p.fecha_pago >= :inicio', {
      inicio: '2026-08-01',
    });
  });

  it('debe aplicar el filtro por fecha de fin', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    pagoRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.findAll(1, 20, {
      fecha_fin: '2026-08-31',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('p.fecha_pago <= :fin', {
      fin: '2026-08-31',
    });
  });

  it('debe aplicar simultáneamente estado y rango de fechas', async () => {
    const qb = createQueryBuilderMock();

    qb.getManyAndCount.mockResolvedValue([[], 0]);

    pagoRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.findAll(1, 20, {
      estado: 'Completado',
      fecha_inicio: '2026-08-01',
      fecha_fin: '2026-08-31',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('p.estado = :est', {
      est: 'Completado',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('p.fecha_pago >= :inicio', {
      inicio: '2026-08-01',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('p.fecha_pago <= :fin', {
      fin: '2026-08-31',
    });
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe devolver un pago con sus detalles', async () => {
    const pago = {
      id_pago: 50,
      id_usuario: 10,
      monto_total: 199,
    };

    const detalles = [
      {
        id_detalle_pago: 1,
        id_pago: 50,
        id_curso: 681,
        precio_unitario: 99,
        subtotal: 99,
      },
      {
        id_detalle_pago: 2,
        id_pago: 50,
        id_ruta: 749,
        precio_unitario: 100,
        subtotal: 100,
      },
    ];

    pagoRepo.findOne.mockResolvedValue(pago);

    detalleRepo.find.mockResolvedValue(detalles);

    const result = await repository.findById(50);

    expect(result).toEqual({
      ...pago,
      detalles,
    });

    expect(pagoRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_pago: 50,
      },
      relations: ['usuario'],
    });

    expect(detalleRepo.find).toHaveBeenCalledWith({
      where: {
        id_pago: 50,
      },
      relations: ['curso', 'ruta'],
    });
  });

  it('debe devolver null cuando el pago no existe', async () => {
    pagoRepo.findOne.mockResolvedValue(null);

    const result = await repository.findById(999);

    expect(result).toBeNull();

    expect(detalleRepo.find).not.toHaveBeenCalled();
  });

  // ============================================================
  // FIND BY USER
  // ============================================================

  it('debe devolver los pagos de un usuario con sus detalles', async () => {
    const pagos = [
      {
        id_pago: 1,
        id_usuario: 10,
      },
      {
        id_pago: 2,
        id_usuario: 10,
      },
    ];

    pagoRepo.find.mockResolvedValue(pagos);

    detalleRepo.find
      .mockResolvedValueOnce([
        {
          id_detalle_pago: 1,
          id_pago: 1,
          id_curso: 681,
        },
      ])
      .mockResolvedValueOnce([
        {
          id_detalle_pago: 2,
          id_pago: 2,
          id_ruta: 749,
        },
      ]);

    const result = await repository.findByUsuario(10);

    expect(result).toEqual([
      {
        ...pagos[0],
        detalles: [
          {
            id_detalle_pago: 1,
            id_pago: 1,
            id_curso: 681,
          },
        ],
      },
      {
        ...pagos[1],
        detalles: [
          {
            id_detalle_pago: 2,
            id_pago: 2,
            id_ruta: 749,
          },
        ],
      },
    ]);

    expect(pagoRepo.find).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
      },
      order: {
        fecha_pago: 'DESC',
      },
    });

    expect(detalleRepo.find).toHaveBeenNthCalledWith(1, {
      where: {
        id_pago: 1,
      },
      relations: ['curso', 'ruta'],
    });

    expect(detalleRepo.find).toHaveBeenNthCalledWith(2, {
      where: {
        id_pago: 2,
      },
      relations: ['curso', 'ruta'],
    });
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear un pago pendiente con detalles de cursos', async () => {
    const data: any = {
      id_tipo_pago: 1,
      monto_total: 198,
      cursos: [
        {
          id_curso: 681,
          precio: 99,
        },
        {
          id_curso: 682,
          precio: 99,
        },
      ],
    };

    const pagoCreado: any = {
      id_pago: 100,
      id_usuario: 10,
      id_tipo_pago: 1,
      monto_total: 198,
      estado: 'Pendiente',
    };

    const pagoFinal = {
      ...pagoCreado,
      detalles: [
        {
          id_detalle_pago: 1,
          id_pago: 100,
          id_curso: 681,
          precio_unitario: 99,
          subtotal: 99,
        },
        {
          id_detalle_pago: 2,
          id_pago: 100,
          id_curso: 682,
          precio_unitario: 99,
          subtotal: 99,
        },
      ],
    };

    pagoRepo.create.mockImplementation((payload: any) => payload);

    pagoRepo.save.mockResolvedValue(pagoCreado);

    detalleRepo.create.mockImplementation((payload: any) => payload);

    detalleRepo.save.mockResolvedValue({});

    jest.spyOn(repository, 'findById').mockResolvedValue(pagoFinal as any);

    const result = await repository.create(10, data);

    expect(pagoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_tipo_pago: 1,
        monto_total: 198,
        cursos: data.cursos,
        id_usuario: 10,
        estado: 'Pendiente',
        fecha_pago: expect.any(Date),
      }),
    );

    expect(pagoRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 10,
        estado: 'Pendiente',
        fecha_pago: expect.any(Date),
      }),
    );

    expect(detalleRepo.create).toHaveBeenNthCalledWith(1, {
      id_pago: 100,
      id_curso: 681,
      precio_unitario: 99,
      subtotal: 99,
    });

    expect(detalleRepo.create).toHaveBeenNthCalledWith(2, {
      id_pago: 100,
      id_curso: 682,
      precio_unitario: 99,
      subtotal: 99,
    });

    expect(detalleRepo.save).toHaveBeenCalledTimes(2);

    expect(repository.findById).toHaveBeenCalledWith(100);

    expect(result).toEqual(pagoFinal);
  });

  it('debe crear detalles de rutas cuando el pago contiene rutas', async () => {
    const data: any = {
      id_tipo_pago: 2,
      monto_total: 300,
      rutas: [
        {
          id_ruta: 749,
          precio: 300,
        },
      ],
    };

    const pagoCreado = {
      id_pago: 101,
      id_usuario: 10,
      estado: 'Pendiente',
    };

    pagoRepo.create.mockImplementation((payload: any) => payload);

    pagoRepo.save.mockResolvedValue(pagoCreado);

    detalleRepo.create.mockImplementation((payload: any) => payload);

    detalleRepo.save.mockResolvedValue({});

    jest.spyOn(repository, 'findById').mockResolvedValue({
      ...pagoCreado,
      detalles: [],
    } as any);

    await repository.create(10, data);

    expect(detalleRepo.create).toHaveBeenCalledWith({
      id_pago: 101,
      id_ruta: 749,
      precio_unitario: 300,
      subtotal: 300,
    });

    expect(detalleRepo.save).toHaveBeenCalledTimes(1);
  });

  it('debe crear el pago sin detalles cuando no se envían cursos ni rutas', async () => {
    const data: any = {
      id_tipo_pago: 3,
      monto_total: 50,
    };

    const pagoCreado = {
      id_pago: 102,
      id_usuario: 10,
      estado: 'Pendiente',
    };

    pagoRepo.create.mockImplementation((payload: any) => payload);

    pagoRepo.save.mockResolvedValue(pagoCreado);

    jest.spyOn(repository, 'findById').mockResolvedValue(pagoCreado as any);

    const result = await repository.create(10, data);

    expect(detalleRepo.create).not.toHaveBeenCalled();

    expect(detalleRepo.save).not.toHaveBeenCalled();

    expect(result).toEqual(pagoCreado);
  });

  // ============================================================
  // UPDATE ESTADO
  // ============================================================

  it('debe actualizar el estado de un pago y registrar la fecha de verificación', async () => {
    const pagoActualizado = {
      id_pago: 100,
      estado: 'Completado',
      observaciones: 'Pago verificado',
    };

    pagoRepo.update.mockResolvedValue({
      affected: 1,
    });

    jest
      .spyOn(repository, 'findById')
      .mockResolvedValue(pagoActualizado as any);

    const result = await repository.updateEstado(
      100,
      'Completado',
      'Pago verificado',
    );

    expect(pagoRepo.update).toHaveBeenCalledWith(
      {
        id_pago: 100,
      },
      {
        estado: 'Completado',
        observaciones: 'Pago verificado',
        fecha_verificacion: expect.any(Date),
      },
    );

    expect(repository.findById).toHaveBeenCalledWith(100);

    expect(result).toEqual(pagoActualizado);
  });

  it('debe permitir actualizar el estado sin observaciones', async () => {
    pagoRepo.update.mockResolvedValue({
      affected: 1,
    });

    jest.spyOn(repository, 'findById').mockResolvedValue({
      id_pago: 100,
      estado: 'Rechazado',
    } as any);

    await repository.updateEstado(100, 'Rechazado');

    expect(pagoRepo.update).toHaveBeenCalledWith(
      {
        id_pago: 100,
      },
      {
        estado: 'Rechazado',
        observaciones: undefined,
        fecha_verificacion: expect.any(Date),
      },
    );
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar un pago por ID', async () => {
    pagoRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.delete(100);

    expect(pagoRepo.delete).toHaveBeenCalledWith({
      id_pago: 100,
    });
  });

  // ============================================================
  // TIPOS DE PAGO
  // ============================================================

  it('debe devolver todos los tipos de pago', async () => {
    const tipos = [
      {
        id_tipo_pago: 1,
        nombre: 'Yape',
      },
      {
        id_tipo_pago: 2,
        nombre: 'Transferencia',
      },
    ];

    tipoRepo.find.mockResolvedValue(tipos);

    const result = await repository.findAllTipos();

    expect(result).toEqual(tipos);

    expect(tipoRepo.find).toHaveBeenCalled();
  });

  it('debe buscar un tipo de pago por ID', async () => {
    const tipo = {
      id_tipo_pago: 1,
      nombre: 'Yape',
    };

    tipoRepo.findOne.mockResolvedValue(tipo);

    const result = await repository.findTipoById(1);

    expect(result).toEqual(tipo);

    expect(tipoRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_tipo_pago: 1,
      },
    });
  });

  it('debe crear un tipo de pago', async () => {
    const data = {
      nombre: 'Tarjeta',
    };

    const created = {
      id_tipo_pago: 3,
      nombre: 'Tarjeta',
    };

    tipoRepo.create.mockReturnValue(data);

    tipoRepo.save.mockResolvedValue(created);

    const result = await repository.createTipo(data as any);

    expect(tipoRepo.create).toHaveBeenCalledWith(data);

    expect(tipoRepo.save).toHaveBeenCalledWith(data);

    expect(result).toEqual(created);
  });

  it('debe actualizar un tipo de pago', async () => {
    const updated = {
      id_tipo_pago: 1,
      nombre: 'Yape actualizado',
    };

    tipoRepo.update.mockResolvedValue({
      affected: 1,
    });

    jest.spyOn(repository, 'findTipoById').mockResolvedValue(updated as any);

    const result = await repository.updateTipo(1, {
      nombre: 'Yape actualizado',
    });

    expect(tipoRepo.update).toHaveBeenCalledWith(
      {
        id_tipo_pago: 1,
      },
      {
        nombre: 'Yape actualizado',
      },
    );

    expect(repository.findTipoById).toHaveBeenCalledWith(1);

    expect(result).toEqual(updated);
  });

  it('debe eliminar un tipo de pago', async () => {
    tipoRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.deleteTipo(1);

    expect(tipoRepo.delete).toHaveBeenCalledWith({
      id_tipo_pago: 1,
    });
  });
});
