import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AdminRepository } from './admin.repository';

import { Usuario } from '../entities/usuario.entity';
import { AuthenticationLog } from '../entities/authentication-log.entity';
import { Material } from '../entities/material.entity';
import { Pago } from '../entities/pago.entity';
import { Reclamacion } from '../entities/reclamacion.entity';

describe('AdminRepository', () => {
  let repository: AdminRepository;

  let usuarioRepo: any;
  let authLogRepo: any;
  let materialRepo: any;
  let pagoRepo: any;
  let reclamacionRepo: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    usuarioRepo = {
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: any) => data),
      update: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    authLogRepo = {
      findAndCount: jest.fn(),
    };

    materialRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data: any) => data),
      update: jest.fn(),
      delete: jest.fn(),
    };

    pagoRepo = {
      find: jest.fn(),
    };

    reclamacionRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRepository,
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepo,
        },
        {
          provide: getRepositoryToken(AuthenticationLog),
          useValue: authLogRepo,
        },
        {
          provide: getRepositoryToken(Material),
          useValue: materialRepo,
        },
        {
          provide: getRepositoryToken(Pago),
          useValue: pagoRepo,
        },
        {
          provide: getRepositoryToken(Reclamacion),
          useValue: reclamacionRepo,
        },
      ],
    }).compile();

    repository = module.get<AdminRepository>(AdminRepository);
  });

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // ============================================================
  // USUARIOS
  // ============================================================

  it('debe devolver usuarios paginados sin contraseña y con filtros', async () => {
    const data = [
      {
        id_usuario: 3,
        nombre: 'Jair',
        apellido: 'Usuario',
        email: 'jair@test.com',
        password: 'hash-secreto',
      },
    ];

    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([data, 21]),
    };

    usuarioRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAllUsuarios(
      {
        search: 'jair',
        estado: 'Activo',
        id_rol: 3,
      },
      2,
      10,
    );

    expect(data[0].password).toBeUndefined();

    expect(result).toEqual({
      data,
      total: 21,
      current_page: 2,
      per_page: 10,
      last_page: 3,
    });

    expect(usuarioRepo.createQueryBuilder).toHaveBeenCalledWith('u');
    expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('u.rol', 'r');

    expect(qb.andWhere).toHaveBeenCalledWith(
      '(u.nombre LIKE :s OR u.apellido LIKE :s OR u.email LIKE :s OR u.dni LIKE :s)',
      { s: '%jair%' },
    );

    expect(qb.andWhere).toHaveBeenCalledWith('u.estado = :estado', {
      estado: 'Activo',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('u.id_rol = :rol', { rol: 3 });

    expect(qb.orderBy).toHaveBeenCalledWith('u.id_usuario', 'DESC');
    expect(qb.skip).toHaveBeenCalledWith(10);
    expect(qb.take).toHaveBeenCalledWith(10);
  });

  it('debe listar usuarios sin filtros', async () => {
    const data = [
      {
        id_usuario: 1,
        nombre: 'Ana',
        password: 'hash',
      },
    ];

    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([data, 1]),
    };

    usuarioRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAllUsuarios({}, 1, 50);

    expect(result.last_page).toBe(1);
    expect(data[0].password).toBeUndefined();
    expect(qb.andWhere).not.toHaveBeenCalled();
  });

  it('debe crear un usuario con contraseña hasheada y fecha de registro', async () => {
    const input: any = {
      nombre: 'Jair',
      apellido: 'Usuario',
      email: 'jair@test.com',
      password: '123456',
    };

    usuarioRepo.save.mockImplementation(async (entity: any) => ({
      id_usuario: 10,
      ...entity,
    }));

    const result = await repository.createUsuario(input);

    expect(input.password).not.toBe('123456');
    expect(input.password).toEqual(expect.any(String));

    expect(usuarioRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Jair',
        apellido: 'Usuario',
        email: 'jair@test.com',
        password: expect.any(String),
        fecha_registro: expect.any(Date),
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        id_usuario: 10,
        nombre: 'Jair',
        email: 'jair@test.com',
      }),
    );

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un usuario actualizado');
    }

    expect((result as any).password).toBeUndefined();
  });

  it('debe establecer email_verificado en false cuando no viene informado', async () => {
    const input: any = {
      nombre: 'Ana',
      email: 'ana@test.com',
      password: 'password',
    };

    usuarioRepo.save.mockImplementation(async (entity: any) => ({
      id_usuario: 11,
      ...entity,
    }));

    await repository.createUsuario(input);

    expect(usuarioRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email_verificado: false,
      }),
    );
  });

  it('debe conservar email_verificado cuando ya viene definido', async () => {
    const input: any = {
      nombre: 'Luis',
      email: 'luis@test.com',
      password: 'password',
      email_verificado: true,
    };

    usuarioRepo.save.mockImplementation(async (entity: any) => ({
      id_usuario: 12,
      ...entity,
    }));

    await repository.createUsuario(input);

    expect(usuarioRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email_verificado: true,
      }),
    );
  });

  it('debe actualizar un usuario y hashear la nueva contraseña', async () => {
    const data: any = {
      nombre: 'Jair Actualizado',
      password: 'nueva-clave',
    };

    usuarioRepo.update.mockResolvedValue({ affected: 1 });

    const usuarioActualizado = {
      id_usuario: 10,
      nombre: 'Jair Actualizado',
      password: 'hash',
      rol: {},
    };

    usuarioRepo.findOne.mockResolvedValue(usuarioActualizado);

    const result = await repository.updateUsuario(10, data);

    expect(data.password).not.toBe('nueva-clave');
    expect(data.password).toEqual(expect.any(String));

    expect(usuarioRepo.update).toHaveBeenCalledWith({ id_usuario: 10 }, data);

    expect(usuarioRepo.findOne).toHaveBeenCalledWith({
      where: { id_usuario: 10 },
      relations: ['rol'],
    });

    expect(result).toEqual(usuarioActualizado);
    expect((result as any).password).toBeUndefined();
  });

  it('debe eliminar la contraseña del payload cuando no se proporciona', async () => {
    const data: any = {
      nombre: 'Usuario',
      password: undefined,
    };

    usuarioRepo.update.mockResolvedValue({ affected: 1 });
    usuarioRepo.findOne.mockResolvedValue({
      id_usuario: 10,
      nombre: 'Usuario',
    });

    await repository.updateUsuario(10, data);

    expect(data.password).toBeUndefined();
    expect(usuarioRepo.update).toHaveBeenCalledWith({ id_usuario: 10 }, data);
  });

  it('debe devolver undefined cuando el usuario actualizado ya no existe', async () => {
    const data: any = {
      nombre: 'Usuario',
    };

    usuarioRepo.update.mockResolvedValue({ affected: 0 });
    usuarioRepo.findOne.mockResolvedValue(null);

    const result = await repository.updateUsuario(10, data);

    expect(result).toBeNull();
  });

  it('debe desactivar un usuario', async () => {
    await repository.deactivateUsuario(10);

    expect(usuarioRepo.update).toHaveBeenCalledWith(
      { id_usuario: 10 },
      { estado: 'Inactivo' },
    );
  });

  it('debe eliminar un usuario', async () => {
    await repository.deleteUsuario(10);

    expect(usuarioRepo.delete).toHaveBeenCalledWith({
      id_usuario: 10,
    });
  });

  it('debe devolver los pagos de un usuario con sus detalles', async () => {
    const pagos = [
      {
        id_pago: 1,
        id_usuario: 10,
        detalles: [],
      },
    ];

    pagoRepo.find.mockResolvedValue(pagos);

    const result = await repository.getPagosByUsuario(10);

    expect(result).toEqual(pagos);

    expect(pagoRepo.find).toHaveBeenCalledWith({
      where: { id_usuario: 10 },
      relations: ['detalles', 'detalles.curso'],
    });
  });

  // ============================================================
  // AUTH LOGS
  // ============================================================

  it('debe devolver logs de autenticación paginados', async () => {
    const logs = [
      {
        id: 1,
        login_at: new Date('2026-08-29T10:00:00.000Z'),
      },
    ];

    authLogRepo.findAndCount.mockResolvedValue([logs, 12]);

    const result = await repository.getAuthLogs(2, 5);

    expect(result).toEqual({
      data: logs,
      total: 12,
      current_page: 2,
      per_page: 5,
      last_page: 3,
    });

    expect(authLogRepo.findAndCount).toHaveBeenCalledWith({
      order: { login_at: 'DESC' },
      skip: 5,
      take: 5,
    });
  });

  // ============================================================
  // MATERIALES
  // ============================================================

  it('debe devolver materiales paginados con módulo y curso', async () => {
    const materiales = [
      {
        id_material: 10,
        nombre: 'PDF',
      },
    ];

    materialRepo.findAndCount.mockResolvedValue([materiales, 11]);

    const result = await repository.findAllMateriales(2, 5);

    expect(result).toEqual({
      data: materiales,
      total: 11,
      current_page: 2,
      per_page: 5,
      last_page: 3,
    });

    expect(materialRepo.findAndCount).toHaveBeenCalledWith({
      relations: ['modulo', 'curso'],
      skip: 5,
      take: 5,
      order: { id_material: 'DESC' },
    });
  });

  it('debe buscar un material por ID', async () => {
    const material = {
      id_material: 10,
      nombre: 'Material',
    };

    materialRepo.findOne.mockResolvedValue(material);

    const result = await repository.findMaterialById(10);

    expect(result).toEqual(material);

    expect(materialRepo.findOne).toHaveBeenCalledWith({
      where: { id_material: 10 },
      relations: ['modulo'],
    });
  });

  it('debe crear un material', async () => {
    const data = {
      nombre: 'Material nuevo',
      url: 'archivo.pdf',
    };

    const material = {
      id_material: 20,
      ...data,
    };

    materialRepo.save.mockResolvedValue(material);

    const result = await repository.createMaterial(data);

    expect(materialRepo.create).toHaveBeenCalledWith(data);
    expect(materialRepo.save).toHaveBeenCalledWith(data);
    expect(result).toEqual(material);
  });

  it('debe actualizar un material y devolverlo nuevamente', async () => {
    materialRepo.update.mockResolvedValue({ affected: 1 });
    materialRepo.findOne.mockResolvedValue({
      id_material: 20,
      nombre: 'Actualizado',
    });

    const data = {
      nombre: 'Actualizado',
    };

    const result = await repository.updateMaterial(20, data);

    expect(materialRepo.update).toHaveBeenCalledWith({ id_material: 20 }, data);

    expect(materialRepo.findOne).toHaveBeenCalledWith({
      where: { id_material: 20 },
      relations: ['modulo'],
    });

    expect(result).toEqual({
      id_material: 20,
      nombre: 'Actualizado',
    });
  });

  it('debe eliminar un material', async () => {
    await repository.deleteMaterial(20);

    expect(materialRepo.delete).toHaveBeenCalledWith({
      id_material: 20,
    });
  });

  // ============================================================
  // RECLAMACIONES
  // ============================================================

  it('debe devolver reclamaciones paginadas con todos los filtros', async () => {
    const reclamaciones = [
      {
        id: 1,
        nombre_completo: 'Jair Usuario',
        estado: 'pendiente',
      },
    ];

    const qb = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([reclamaciones, 14]),
    };

    reclamacionRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAllReclamaciones(
      {
        search: '  Jair ',
        estado: 'pendiente',
        tipo_reclamo: 'reclamo',
        fecha_inicio: '2026-08-01',
        fecha_fin: '2026-08-29',
      },
      2,
      5,
    );

    expect(result).toEqual({
      data: reclamaciones,
      total: 14,
      current_page: 2,
      per_page: 5,
      last_page: 3,
    });

    expect(qb.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('r.nombre_completo LIKE :search'),
      { search: '%Jair%' },
    );

    expect(qb.andWhere).toHaveBeenCalledWith('r.estado = :estado', {
      estado: 'pendiente',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('r.tipo_reclamo = :tipo_reclamo', {
      tipo_reclamo: 'reclamo',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('r.created_at >= :fecha_inicio', {
      fecha_inicio: '2026-08-01',
    });

    expect(qb.andWhere).toHaveBeenCalledWith('r.created_at <= :fecha_fin', {
      fecha_fin: '2026-08-29 23:59:59',
    });

    expect(qb.orderBy).toHaveBeenCalledWith('r.created_at', 'DESC');

    expect(qb.skip).toHaveBeenCalledWith(5);
    expect(qb.take).toHaveBeenCalledWith(5);
  });

  it('debe normalizar la paginación inválida de reclamaciones', async () => {
    const qb = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    reclamacionRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await repository.findAllReclamaciones({}, 0, 500);

    expect(result.current_page).toBe(1);
    expect(result.per_page).toBe(100);
    expect(result.last_page).toBe(0);

    expect(qb.skip).toHaveBeenCalledWith(0);
    expect(qb.take).toHaveBeenCalledWith(100);
  });

  it('debe ignorar filtros vacíos de reclamaciones', async () => {
    const qb = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    reclamacionRepo.createQueryBuilder.mockReturnValue(qb);

    await repository.findAllReclamaciones({
      search: '   ',
      estado: undefined,
      tipo_reclamo: undefined,
      fecha_inicio: undefined,
      fecha_fin: undefined,
    });

    expect(qb.andWhere).not.toHaveBeenCalled();
    expect(qb.orderBy).toHaveBeenCalledWith('r.created_at', 'DESC');
  });

  it('debe buscar una reclamación por ID', async () => {
    const reclamacion = {
      id: 20,
      asunto: 'Problema',
    };

    reclamacionRepo.findOne.mockResolvedValue(reclamacion);

    const result = await repository.findReclamacionById(20);

    expect(result).toEqual(reclamacion);

    expect(reclamacionRepo.findOne).toHaveBeenCalledWith({
      where: { id: 20 },
    });
  });

  it('debe actualizar el estado de una reclamación existente', async () => {
    const reclamacion: any = {
      id: 20,
      estado: 'pendiente',
    };

    reclamacionRepo.findOne.mockResolvedValue(reclamacion);

    reclamacionRepo.save.mockResolvedValue(reclamacion);

    const result = await repository.updateReclamacionEstado(20, 'resuelto');

    expect(reclamacion.estado).toBe('resuelto');

    expect(reclamacionRepo.save).toHaveBeenCalledWith(reclamacion);

    expect(result).toEqual(reclamacion);
  });

  it('debe rechazar actualizar una reclamación inexistente', async () => {
    reclamacionRepo.findOne.mockResolvedValue(null);

    await expect(
      repository.updateReclamacionEstado(999, 'resuelto'),
    ).rejects.toThrow('Reclamación no encontrada');

    expect(reclamacionRepo.save).not.toHaveBeenCalled();
  });
});
