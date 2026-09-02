import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PerfilService } from './perfil.service';
import { Usuario } from '../entities/usuario.entity';

describe('PerfilService', () => {
  let service: PerfilService;

  let repo: {
    findOne: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repo = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<PerfilService>(PerfilService);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // GET PROFILE
  // ============================================================

  it('debe devolver el perfil del usuario con su rol', async () => {
    const usuario = {
      id_usuario: 10,
      nombre: 'Jair',
      email: 'jair@test.com',
      rol: {
        id_rol: 2,
        nombre: 'Alumno',
      },
    };

    repo.findOne.mockResolvedValue(usuario);

    const result = await service.getProfile(10);

    expect(result).toEqual(usuario);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
      },
      relations: ['rol'],
    });
  });

  it('debe rechazar cuando el usuario no existe', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.getProfile(999)).rejects.toThrow(
      'Usuario no encontrado',
    );

    expect(repo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 999,
      },
      relations: ['rol'],
    });
  });

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  it('debe actualizar el perfil sin imagen', async () => {
    const dto = {
      nombre: 'Jair Actualizado',
      telefono: '999999999',
    };

    const usuarioActualizado = {
      id_usuario: 10,
      nombre: 'Jair Actualizado',
      telefono: '999999999',
      email: 'jair@test.com',
    };

    repo.update.mockResolvedValue({
      affected: 1,
    });

    repo.findOne.mockResolvedValue(usuarioActualizado);

    const result = await service.updateProfile(10, dto as any);

    expect(repo.update).toHaveBeenCalledWith(
      {
        id_usuario: 10,
      },
      {
        nombre: 'Jair Actualizado',
        telefono: '999999999',
      },
    );

    expect(result).toEqual(usuarioActualizado);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
      },
      relations: ['rol'],
    });
  });

  it('debe actualizar el perfil incluyendo la imagen cuando se proporciona', async () => {
    const dto = {
      nombre: 'Jair',
    };

    const imagenPerfil = 'storage/perfiles/avatar-123.jpg';

    const usuarioActualizado = {
      id_usuario: 10,
      nombre: 'Jair',
      imagen_perfil: imagenPerfil,
    };

    repo.update.mockResolvedValue({
      affected: 1,
    });

    repo.findOne.mockResolvedValue(usuarioActualizado);

    const result = await service.updateProfile(10, dto as any, imagenPerfil);

    expect(repo.update).toHaveBeenCalledWith(
      {
        id_usuario: 10,
      },
      {
        nombre: 'Jair',
        imagen_perfil: imagenPerfil,
      },
    );

    expect(result).toEqual(usuarioActualizado);
  });

  it('debe volver a consultar el perfil después de actualizarlo', async () => {
    const dto = {
      nombre: 'Nuevo nombre',
    };

    const usuarioActualizado = {
      id_usuario: 10,
      nombre: 'Nuevo nombre',
      rol: {
        id_rol: 2,
        nombre: 'Alumno',
      },
    };

    repo.update.mockResolvedValue({
      affected: 1,
    });

    repo.findOne.mockResolvedValue(usuarioActualizado);

    const result = await service.updateProfile(10, dto as any);

    expect(result).toEqual(usuarioActualizado);

    expect(repo.findOne).toHaveBeenCalledTimes(1);
  });

  it('debe rechazar al devolver el perfil cuando el usuario desaparece después de actualizar', async () => {
    const dto = {
      nombre: 'Nuevo nombre',
    };

    repo.update.mockResolvedValue({
      affected: 1,
    });

    repo.findOne.mockResolvedValue(null);

    await expect(service.updateProfile(10, dto as any)).rejects.toThrow(
      'Usuario no encontrado',
    );

    expect(repo.update).toHaveBeenCalledWith(
      {
        id_usuario: 10,
      },
      {
        nombre: 'Nuevo nombre',
      },
    );
  });
});
