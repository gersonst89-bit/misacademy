import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { AuthRepository } from './auth.repository';

import { Usuario } from '../entities/usuario.entity';
import { TokenUsuario } from '../entities/token-usuario.entity';
import { AuthenticationLog } from '../entities/authentication-log.entity';

describe('AuthRepository', () => {
  let repository: AuthRepository;

  let usuarioRepo: any;
  let tokenRepo: any;
  let authLogRepo: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    usuarioRepo = {
      findOne: jest.fn(),
      create: jest.fn((data: any) => data),
      save: jest.fn(),
      update: jest.fn(),
    };

    tokenRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    authLogRepo = {
      create: jest.fn((data: any) => data),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepo,
        },
        {
          provide: getRepositoryToken(TokenUsuario),
          useValue: tokenRepo,
        },
        {
          provide: getRepositoryToken(AuthenticationLog),
          useValue: authLogRepo,
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // ============================================================
  // FIND BY EMAIL
  // ============================================================

  it('debe buscar un usuario por email con rol y campos seleccionados', async () => {
    const usuario = {
      id_usuario: 10,
      nombre: 'Jair',
      apellido: 'Test',
      email: 'jair@test.com',
      password: 'hash',
      id_rol: 3,
      email_verificado: true,
      estado: 'Activo',
      imagen_perfil: null,
      biografia: null,
      telefono: null,
      dni: '12345678',
      fecha_registro: new Date(),
      rol: {
        id_rol: 3,
        nombre: 'Estudiante',
      },
    };

    usuarioRepo.findOne.mockResolvedValue(usuario);

    const result = await repository.findByEmail('jair@test.com');

    expect(result).toEqual(usuario);

    expect(usuarioRepo.findOne).toHaveBeenCalledWith({
      where: {
        email: 'jair@test.com',
      },
      relations: ['rol'],
      select: [
        'id_usuario',
        'nombre',
        'apellido',
        'email',
        'password',
        'id_rol',
        'email_verificado',
        'estado',
        'imagen_perfil',
        'biografia',
        'telefono',
        'dni',
        'fecha_registro',
      ],
    });
  });

  it('debe devolver null cuando el email no existe', async () => {
    usuarioRepo.findOne.mockResolvedValue(null);

    const result = await repository.findByEmail('noexiste@test.com');

    expect(result).toBeNull();
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe buscar un usuario por ID con su rol', async () => {
    const usuario = {
      id_usuario: 10,
      nombre: 'Jair',
      rol: {
        id_rol: 3,
        nombre: 'Estudiante',
      },
    };

    usuarioRepo.findOne.mockResolvedValue(usuario);

    const result = await repository.findById(10);

    expect(result).toEqual(usuario);

    expect(usuarioRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
      },
      relations: ['rol'],
    });
  });

  // ============================================================
  // REGISTER
  // ============================================================

  it('debe registrar un usuario con contraseña hasheada y valores por defecto', async () => {
    const dto: any = {
      nombre: 'Jair',
      apellido: 'Test',
      email: 'jair@test.com',
      password: 'Password123!',
      dni: '12345678',
    };

    const passwordHash = await bcrypt.hash(dto.password, 10);

    usuarioRepo.create.mockImplementation((data: any) => data);

    usuarioRepo.save.mockResolvedValue({
      id_usuario: 10,
      ...dto,
      password: passwordHash,
      id_rol: 3,
      email_verificado: false,
      estado: 'Activo',
    });

    const result = await repository.register(dto);

    expect(usuarioRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Jair',
        apellido: 'Test',
        email: 'jair@test.com',
        password: expect.any(String),
        id_rol: 3,
        email_verificado: false,
        estado: 'Activo',
        fecha_registro: expect.any(Date),
      }),
    );

    const payload = usuarioRepo.create.mock.calls[0][0];

    expect(payload.password).not.toBe(dto.password);

    expect(await bcrypt.compare(dto.password, payload.password)).toBe(true);

    expect(usuarioRepo.save).toHaveBeenCalledWith(payload);

    expect(result).toEqual(
      expect.objectContaining({
        id_usuario: 10,
        email: 'jair@test.com',
        id_rol: 3,
        email_verificado: false,
        estado: 'Activo',
      }),
    );
  });

  // ============================================================
  // VERIFICATION TOKEN
  // ============================================================
  it('debe crear un token de verificación con expiración de 24 horas', async () => {
    const fechaFija = new Date('2026-08-29T12:00:00.000Z');

    jest.useFakeTimers();
    jest.setSystemTime(fechaFija);

    try {
      tokenRepo.save.mockResolvedValue({
        id_token: 1,
      });

      const token = await repository.createVerificationToken(10);

      expect(token).toMatch(/^[a-f0-9]{64}$/);

      expect(tokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id_usuario: 10,
          token,
          tipo: 'Verificacion',
          fecha_creacion: expect.any(Date),
          fecha_expiracion: expect.any(Date),
          usado: false,
        }),
      );

      const payload = tokenRepo.save.mock.calls[0][0];

      expect(payload.fecha_creacion).toEqual(fechaFija);

      expect(payload.fecha_expiracion).toEqual(
        new Date(fechaFija.getTime() + 24 * 60 * 60 * 1000),
      );

      const diferencia =
        payload.fecha_expiracion.getTime() - payload.fecha_creacion.getTime();

      expect(diferencia).toBe(24 * 60 * 60 * 1000);
    } finally {
      jest.useRealTimers();
    }
  });

  it('debe buscar un token de verificación no usado', async () => {
    const token = {
      id_token: 1,
      id_usuario: 10,
      token: 'verification-token',
      tipo: 'Verificacion',
      usado: false,
    };

    tokenRepo.findOne.mockResolvedValue(token);

    const result =
      await repository.findByVerificationToken('verification-token');

    expect(result).toEqual(token);

    expect(tokenRepo.findOne).toHaveBeenCalledWith({
      where: {
        token: 'verification-token',
        usado: false,
      },
    });
  });

  it('debe marcar un token como usado', async () => {
    tokenRepo.update.mockResolvedValue({
      affected: 1,
    });

    await repository.markTokenAsUsed('verification-token');

    expect(tokenRepo.update).toHaveBeenCalledWith(
      {
        token: 'verification-token',
      },
      {
        usado: true,
      },
    );
  });

  // ============================================================
  // RESET TOKEN
  // ============================================================

  it('debe crear un token de recuperación con expiración de 2 horas', async () => {
    tokenRepo.save.mockResolvedValue({
      id_token: 2,
    });

    const token = await repository.createResetToken(10);

    expect(token).toMatch(/^[a-f0-9]{64}$/);

    expect(tokenRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 10,
        token,
        tipo: 'Reseteo',
        fecha_creacion: expect.any(Date),
        fecha_expiracion: expect.any(Date),
        usado: false,
      }),
    );

    const payload = tokenRepo.save.mock.calls[0][0];

    const diferencia =
      payload.fecha_expiracion.getTime() - payload.fecha_creacion.getTime();

    expect(diferencia).toBe(2 * 60 * 60 * 1000);
  });

  it('debe buscar un token de recuperación válido', async () => {
    const token = {
      id_token: 2,
      id_usuario: 10,
      token: 'reset-token',
      tipo: 'Reseteo',
      usado: false,
    };

    tokenRepo.findOne.mockResolvedValue(token);

    const result = await repository.findValidResetToken('reset-token');

    expect(result).toEqual(token);

    expect(tokenRepo.findOne).toHaveBeenCalledWith({
      where: {
        token: 'reset-token',
        tipo: 'Reseteo',
        usado: false,
      },
    });
  });

  // ============================================================
  // PASSWORD / EMAIL
  // ============================================================

  it('debe actualizar la contraseña usando bcrypt', async () => {
    const newPassword = 'NuevaPassword123!';

    usuarioRepo.update.mockResolvedValue({
      affected: 1,
    });

    await repository.updatePassword(10, newPassword);

    expect(usuarioRepo.update).toHaveBeenCalledWith(
      {
        id_usuario: 10,
      },
      {
        password: expect.any(String),
      },
    );

    const updateData = usuarioRepo.update.mock.calls[0][1];

    expect(updateData.password).not.toBe(newPassword);

    expect(await bcrypt.compare(newPassword, updateData.password)).toBe(true);
  });

  it('debe marcar el email del usuario como verificado', async () => {
    usuarioRepo.update.mockResolvedValue({
      affected: 1,
    });

    await repository.markEmailVerified(10);

    expect(usuarioRepo.update).toHaveBeenCalledWith(
      {
        id_usuario: 10,
      },
      {
        email_verificado: true,
      },
    );
  });

  // ============================================================
  // AUTH LOG
  // ============================================================

  it('debe crear y guardar un log de autenticación', async () => {
    const data: any = {
      authenticatable_id: 10,
      authenticatable_type: 'Usuario',
      login_successful: true,
      ip_address: '127.0.0.1',
    };

    const log = {
      id_auth_log: 1,
      ...data,
    };

    authLogRepo.create.mockReturnValue(log);

    authLogRepo.save.mockResolvedValue(log);

    const result = await repository.createAuthLog(data);

    expect(authLogRepo.create).toHaveBeenCalledWith(data);

    expect(authLogRepo.save).toHaveBeenCalledWith(log);

    expect(result).toEqual(log);
  });

  // ============================================================
  // LOGOUT
  // ============================================================

  it('debe actualizar el último login abierto al cerrar sesión', async () => {
    const lastLogin: any = {
      id_auth_log: 50,
      authenticatable_id: 10,
      authenticatable_type: 'Usuario',
      logout_at: null,
      login_at: new Date('2026-08-28T10:00:00.000Z'),
    };

    authLogRepo.findOne.mockResolvedValue(lastLogin);

    authLogRepo.save.mockResolvedValue(lastLogin);

    const before = Date.now();

    await repository.updateLogout(10);

    const after = Date.now();

    expect(authLogRepo.findOne).toHaveBeenCalledWith({
      where: {
        authenticatable_id: 10,
        authenticatable_type: 'Usuario',
        logout_at: IsNull(),
      },
      order: {
        login_at: 'DESC',
      },
    });

    expect(lastLogin.logout_at).toEqual(expect.any(Date));

    expect(lastLogin.logout_at.getTime()).toBeGreaterThanOrEqual(before);

    expect(lastLogin.logout_at.getTime()).toBeLessThanOrEqual(after);

    expect(authLogRepo.save).toHaveBeenCalledWith(lastLogin);
  });

  it('no debe guardar nada al cerrar sesión si no existe un login abierto', async () => {
    authLogRepo.findOne.mockResolvedValue(null);

    await repository.updateLogout(10);

    expect(authLogRepo.save).not.toHaveBeenCalled();
  });

  // ============================================================
  // AVATAR
  // ============================================================

  it('debe actualizar la imagen de perfil del usuario', async () => {
    usuarioRepo.update.mockResolvedValue({
      affected: 1,
    });

    await repository.updateAvatar(10, 'storage/perfiles/avatar.jpg');

    expect(usuarioRepo.update).toHaveBeenCalledWith(
      {
        id_usuario: 10,
      },
      {
        imagen_perfil: 'storage/perfiles/avatar.jpg',
      },
    );
  });

  // ============================================================
  // REFRESH TOKEN
  // ============================================================

  it('debe guardar un refresh token con expiración de 7 días', async () => {
    tokenRepo.save.mockResolvedValue({
      id_token: 100,
    });

    const before = new Date();

    const result = await repository.saveRefreshToken(10, 'refresh-token');

    const after = new Date();

    expect(result).toEqual({
      id_token: 100,
    });

    expect(tokenRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 10,
        token: 'refresh-token',
        tipo: 'Refresh',
        fecha_creacion: expect.any(Date),
        fecha_expiracion: expect.any(Date),
        usado: false,
      }),
    );

    const payload = tokenRepo.save.mock.calls[0][0];

    expect(payload.fecha_creacion.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );

    expect(payload.fecha_creacion.getTime()).toBeLessThanOrEqual(
      after.getTime(),
    );

    const diferencia =
      payload.fecha_expiracion.getTime() - payload.fecha_creacion.getTime();

    expect(diferencia).toBeGreaterThanOrEqual(7 * 24 * 60 * 60 * 1000 - 1000);

    expect(diferencia).toBeLessThanOrEqual(7 * 24 * 60 * 60 * 1000);
  });

  it('debe buscar un refresh token no usado', async () => {
    const token = {
      id_token: 100,
      id_usuario: 10,
      token: 'refresh-token',
      tipo: 'Refresh',
      usado: false,
    };

    tokenRepo.findOne.mockResolvedValue(token);

    const result = await repository.findRefreshToken('refresh-token');

    expect(result).toEqual(token);

    expect(tokenRepo.findOne).toHaveBeenCalledWith({
      where: {
        token: 'refresh-token',
        tipo: 'Refresh',
        usado: false,
      },
    });
  });

  it('debe guardar un token actualizado', async () => {
    const token: any = {
      id_token: 100,
      id_usuario: 10,
      token: 'refresh-token',
      tipo: 'Refresh',
      usado: true,
    };

    tokenRepo.save.mockResolvedValue(token);

    await repository.updateToken(token);

    expect(tokenRepo.save).toHaveBeenCalledWith(token);
  });

  it('debe invalidar todos los refresh tokens de un usuario', async () => {
    tokenRepo.update.mockResolvedValue({
      affected: 3,
    });

    await repository.invalidateAllUserRefreshTokens(10);

    expect(tokenRepo.update).toHaveBeenCalledWith(
      {
        id_usuario: 10,
        tipo: 'Refresh',
      },
      {
        usado: true,
      },
    );
  });
});
