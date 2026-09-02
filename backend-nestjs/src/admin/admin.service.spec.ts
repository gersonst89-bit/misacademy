import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';

import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';

describe('AdminService', () => {
  let service: AdminService;

  let repository: {
    findAllUsuarios: jest.Mock;
    createUsuario: jest.Mock;
    updateUsuario: jest.Mock;
    deactivateUsuario: jest.Mock;
    forceDeleteUsuario?: jest.Mock;
    getPagosByUsuario: jest.Mock;
    deleteUsuario: jest.Mock;
    getAuthLogs: jest.Mock;
    findAllMateriales: jest.Mock;
    createMaterial: jest.Mock;
    updateMaterial: jest.Mock;
    deleteMaterial: jest.Mock;
    findAllReclamaciones: jest.Mock;
    findReclamacionById: jest.Mock;
    updateReclamacionEstado: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repository = {
      findAllUsuarios: jest.fn(),
      createUsuario: jest.fn(),
      updateUsuario: jest.fn(),
      deactivateUsuario: jest.fn(),
      getPagosByUsuario: jest.fn(),
      deleteUsuario: jest.fn(),
      getAuthLogs: jest.fn(),
      findAllMateriales: jest.fn(),
      createMaterial: jest.fn(),
      updateMaterial: jest.fn(),
      deleteMaterial: jest.fn(),
      findAllReclamaciones: jest.fn(),
      findReclamacionById: jest.fn(),
      updateReclamacionEstado: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // USUARIOS
  // ============================================================

  it('debe devolver usuarios usando page y per_page del query', async () => {
    const resultData = {
      data: [],
      total: 0,
      current_page: 1,
      per_page: 50,
      last_page: 0,
    };

    repository.findAllUsuarios.mockResolvedValue(resultData);

    const q = {
      search: 'jair',
      estado: 'Activo',
      id_rol: 3,
      page: 2,
      per_page: 25,
    };

    const result = await service.findAllUsuarios(q);

    expect(result).toEqual(resultData);

    expect(repository.findAllUsuarios).toHaveBeenCalledWith(q, 2, 25);
  });

  it('debe crear un usuario', async () => {
    const dto = {
      nombre: 'Jair',
      email: 'jair@test.com',
      password: '123456',
    };

    const usuario = {
      id_usuario: 10,
      nombre: 'Jair',
      email: 'jair@test.com',
    };

    repository.createUsuario.mockResolvedValue(usuario);

    const result = await service.createUsuario(dto as any);

    expect(result).toEqual(usuario);

    expect(repository.createUsuario).toHaveBeenCalledWith(dto);
  });

  it('debe actualizar un usuario', async () => {
    const dto = {
      nombre: 'Jair Actualizado',
    };

    const usuario = {
      id_usuario: 10,
      nombre: 'Jair Actualizado',
    };

    repository.updateUsuario.mockResolvedValue(usuario);

    const result = await service.updateUsuario(10, dto as any);

    expect(result).toEqual(usuario);

    expect(repository.updateUsuario).toHaveBeenCalledWith(10, dto);
  });

  it('debe desactivar un usuario', async () => {
    repository.deactivateUsuario.mockResolvedValue(undefined);

    const result = await service.deactivateUsuario(10);

    expect(repository.deactivateUsuario).toHaveBeenCalledWith(10);

    expect(result).toEqual({
      message: 'Usuario desactivado exitosamente',
    });
  });

  it('debe impedir que un administrador elimine su propio usuario', async () => {
    await expect(service.forceDeleteUsuario(10, 10)).rejects.toEqual(
      new HttpException(
        'No puedes eliminar tu propio usuario',
        HttpStatus.FORBIDDEN,
      ),
    );

    expect(repository.getPagosByUsuario).not.toHaveBeenCalled();

    expect(repository.deleteUsuario).not.toHaveBeenCalled();
  });

  it('debe impedir eliminar un usuario que tiene compras registradas', async () => {
    const pagos = [
      {
        id_pago: 1,
        estado: 'Completado',
      },
    ];

    repository.getPagosByUsuario.mockResolvedValue(pagos);

    await expect(service.forceDeleteUsuario(20, 10)).rejects.toEqual(
      new HttpException(
        {
          message:
            'No se puede eliminar definitivamente. Este usuario tiene compras registradas.',
          has_pagos: true,
          pagos,
        },
        HttpStatus.BAD_REQUEST,
      ),
    );

    expect(repository.getPagosByUsuario).toHaveBeenCalledWith(20);

    expect(repository.deleteUsuario).not.toHaveBeenCalled();
  });

  it('debe eliminar permanentemente un usuario sin compras', async () => {
    repository.getPagosByUsuario.mockResolvedValue([]);

    repository.deleteUsuario.mockResolvedValue(undefined);

    const result = await service.forceDeleteUsuario(20, 10);

    expect(repository.getPagosByUsuario).toHaveBeenCalledWith(20);

    expect(repository.deleteUsuario).toHaveBeenCalledWith(20);

    expect(result).toEqual({
      message: 'Usuario eliminado permanentemente',
    });
  });

  it('debe permitir eliminar un usuario cuando el repository no devuelve pagos', async () => {
    repository.getPagosByUsuario.mockResolvedValue(undefined);

    repository.deleteUsuario.mockResolvedValue(undefined);

    const result = await service.forceDeleteUsuario(20, 10);

    expect(repository.deleteUsuario).toHaveBeenCalledWith(20);

    expect(result).toEqual({
      message: 'Usuario eliminado permanentemente',
    });
  });

  // ============================================================
  // AUTH LOGS
  // ============================================================

  it('debe devolver logs de autenticación', async () => {
    const logs = {
      data: [],
      total: 0,
      current_page: 1,
      per_page: 50,
      last_page: 0,
    };

    repository.getAuthLogs.mockResolvedValue(logs);

    const result = await service.getAuthLogs(2);

    expect(result).toEqual(logs);

    expect(repository.getAuthLogs).toHaveBeenCalledWith(2);
  });

  // ============================================================
  // MATERIALES
  // ============================================================

  it('debe devolver materiales', async () => {
    const materiales = {
      data: [],
      total: 0,
    };

    repository.findAllMateriales.mockResolvedValue(materiales);

    const result = await service.findAllMateriales(3);

    expect(result).toEqual(materiales);

    expect(repository.findAllMateriales).toHaveBeenCalledWith(3);
  });

  it('debe crear un material', async () => {
    const dto = {
      nombre: 'Material',
    };

    const material = {
      id_material: 1,
      nombre: 'Material',
    };

    repository.createMaterial.mockResolvedValue(material);

    const result = await service.createMaterial(dto as any);

    expect(result).toEqual(material);

    expect(repository.createMaterial).toHaveBeenCalledWith(dto);
  });

  it('debe actualizar un material', async () => {
    const dto = {
      nombre: 'Material actualizado',
    };

    const material = {
      id_material: 1,
      nombre: 'Material actualizado',
    };

    repository.updateMaterial.mockResolvedValue(material);

    const result = await service.updateMaterial(1, dto as any);

    expect(result).toEqual(material);

    expect(repository.updateMaterial).toHaveBeenCalledWith(1, dto);
  });

  it('debe eliminar un material', async () => {
    repository.deleteMaterial.mockResolvedValue(undefined);

    const result = await service.deleteMaterial(1);

    expect(repository.deleteMaterial).toHaveBeenCalledWith(1);

    expect(result).toEqual({
      message: 'Material eliminado',
    });
  });

  // ============================================================
  // RECLAMACIONES
  // ============================================================

  it('debe normalizar la paginación de reclamaciones', async () => {
    const data = {
      data: [],
      total: 0,
      current_page: 1,
      per_page: 100,
      last_page: 0,
    };

    repository.findAllReclamaciones.mockResolvedValue(data);

    const q = {
      search: 'jair',
      page: 0,
      per_page: 500,
      estado: 'pendiente',
    };

    const result = await service.findAllReclamaciones(q);

    expect(result).toEqual(data);

    expect(repository.findAllReclamaciones).toHaveBeenCalledWith(q, 1, 100);
  });

  it('debe usar page 1 y per_page 15 cuando los valores no son válidos', async () => {
    repository.findAllReclamaciones.mockResolvedValue({});

    await service.findAllReclamaciones({
      page: 'abc',
      per_page: undefined,
    });

    expect(repository.findAllReclamaciones).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 'abc',
      }),
      1,
      15,
    );
  });

  it('debe devolver una reclamación por ID', async () => {
    const reclamacion = {
      id: 10,
      asunto: 'Problema',
    };

    repository.findReclamacionById.mockResolvedValue(reclamacion);

    const result = await service.findReclamacionById(10);

    expect(result).toEqual(reclamacion);

    expect(repository.findReclamacionById).toHaveBeenCalledWith(10);
  });

  it('debe actualizar una reclamación a un estado permitido', async () => {
    const reclamacion = {
      id: 10,
      estado: 'resuelto',
    };

    repository.updateReclamacionEstado.mockResolvedValue(reclamacion);

    const result = await service.updateReclamacionEstado(10, 'resuelto');

    expect(result).toEqual(reclamacion);

    expect(repository.updateReclamacionEstado).toHaveBeenCalledWith(
      10,
      'resuelto',
    );
  });

  it('debe rechazar un estado de reclamación no permitido', async () => {
    await expect(
      service.updateReclamacionEstado(10, 'cerrado'),
    ).rejects.toEqual(
      new HttpException(
        'Estado de reclamación no válido',
        HttpStatus.BAD_REQUEST,
      ),
    );

    expect(repository.updateReclamacionEstado).not.toHaveBeenCalled();
  });
});
