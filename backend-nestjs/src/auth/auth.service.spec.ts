import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: any;
  let jwtService: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockAuthRepository = {
      findByEmail: jest.fn(),
      register: jest.fn(),
      createVerificationToken: jest.fn(),
      createResetToken: jest.fn(),
      findById: jest.fn(),
      saveRefreshToken: jest.fn(),
      findRefreshToken: jest.fn(),
      updateToken: jest.fn(),
      updateLogout: jest.fn(),
      markTokenAsUsed: jest.fn(),
      markEmailVerified: jest.fn(),
      findByVerificationToken: jest.fn(),
      findValidResetToken: jest.fn(),
      updatePassword: jest.fn(),
      createAuthLog: jest.fn(),
      invalidateAllUserRefreshTokens: jest.fn(),
      updateAvatar: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'JWT_EXPIRATION') return '15m';
        if (key === 'REFRESH_JWT_SECRET') return 'refresh-secret';
        if (key === 'APP_URL_BASE') return 'http://localhost:5173';
        if (key === 'API_URL_PUBLIC') return null;
        if (key === 'APP_PORT') return '8000';

        // Configuración de correo para el constructor de AuthService
        if (key === 'MAIL_HOST') return 'smtp.gmail.com';
        if (key === 'MAIL_PORT') return 465;
        if (key === 'MAIL_USERNAME') return 'test@test.com';
        if (key === 'MAIL_PASSWORD') return 'test-password';
        if (key === 'MAIL_FROM_NAME') return 'MIS Academy';
        if (key === 'MAIL_FROM_ADDRESS') return 'test@test.com';

        return defaultValue ?? null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  // Login

  it('debe hacer login correctamente con credenciales válidas', async () => {
    const password = 'Password123!';

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const user = {
      id_usuario: 10,
      nombre: 'Jair',
      email: 'jair@test.com',
      password: 'hash-falso',
      email_verificado: true,
    };

    authRepository.findByEmail.mockResolvedValue(user);

    jwtService.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');

    authRepository.saveRefreshToken.mockResolvedValue(undefined);

    const result = await service.login(
      {
        email: user.email,
        password,
      } as any,
      '127.0.0.1',
      'jest-test',
    );

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id_usuario: 10,
        nombre: 'Jair',
        email: 'jair@test.com',
      },
    });

    expect(authRepository.findByEmail).toHaveBeenCalledWith(user.email);

    expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);

    expect(authRepository.saveRefreshToken).toHaveBeenCalledWith(
      10,
      'refresh-token',
    );

    expect(jwtService.sign).toHaveBeenCalledTimes(2);
  });

  it('debe rechazar una contraseña incorrecta', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const user = {
      id_usuario: 10,
      nombre: 'Jair',
      email: 'jair@test.com',
      password: 'hash-falso',
      email_verificado: true,
    };

    authRepository.findByEmail.mockResolvedValue(user);
    authRepository.createAuthLog.mockResolvedValue(undefined);

    await expect(
      service.login(
        {
          email: user.email,
          password: 'PasswordIncorrecta123!',
        } as any,
        '127.0.0.1',
        'jest-test',
      ),
    ).rejects.toThrow('Credenciales inválidas.');

    expect(authRepository.createAuthLog).toHaveBeenCalledWith(
      expect.objectContaining({
        authenticatable_type: 'Usuario',
        authenticatable_id: 10,
        login_successful: false,
        failure_reason: 'Credenciales inválidas',
      }),
    );

    expect(jwtService.sign).not.toHaveBeenCalled();
    expect(authRepository.saveRefreshToken).not.toHaveBeenCalled();
  });

  it('debe rechazar un usuario inexistente', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    authRepository.findByEmail.mockResolvedValue(null);
    authRepository.createAuthLog.mockResolvedValue(undefined);

    await expect(
      service.login(
        {
          email: 'noexiste@test.com',
          password: 'Password123!',
        } as any,
        '127.0.0.1',
        'jest-test',
      ),
    ).rejects.toThrow('Credenciales inválidas.');

    expect(authRepository.createAuthLog).toHaveBeenCalledWith(
      expect.objectContaining({
        authenticatable_type: 'Usuario',
        authenticatable_id: undefined,
        login_successful: false,
        failure_reason: 'Credenciales inválidas',
      }),
    );

    expect(jwtService.sign).not.toHaveBeenCalled();
    expect(authRepository.saveRefreshToken).not.toHaveBeenCalled();
  });

  it('debe rechazar un usuario cuyo correo no está verificado', async () => {
    const password = 'Password123!';

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const user = {
      id_usuario: 10,
      nombre: 'Jair',
      email: 'jair@test.com',
      password: 'hash-falso',
      email_verificado: false,
    };

    authRepository.findByEmail.mockResolvedValue(user);

    await expect(
      service.login(
        {
          email: user.email,
          password,
        } as any,
        '127.0.0.1',
        'jest-test',
      ),
    ).rejects.toThrow('Debes verificar tu correo antes de iniciar sesión.');

    expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);

    expect(jwtService.sign).not.toHaveBeenCalled();
    expect(authRepository.saveRefreshToken).not.toHaveBeenCalled();
  });

  // Refresh token

  it('debe renovar el access token con un refresh token válido', async () => {
    const refreshToken = 'refresh-token';

    jwtService.verify.mockReturnValue({
      sub: 10,
      email: 'jair@test.com',
    });

    authRepository.findRefreshToken.mockResolvedValue({
      id_usuario: 10,
      fecha_expiracion: new Date(Date.now() + 60_000),
    });

    authRepository.findById.mockResolvedValue({
      id_usuario: 10,
      email: 'jair@test.com',
      estado: 'Activo',
    });

    jwtService.sign.mockReturnValue('nuevo-access-token');

    const result = await service.refresh(refreshToken);

    expect(result).toEqual({
      accessToken: 'nuevo-access-token',
      refreshToken,
    });

    expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
      secret: 'refresh-secret',
    });

    expect(authRepository.findRefreshToken).toHaveBeenCalledWith(refreshToken);

    expect(authRepository.findById).toHaveBeenCalledWith(10);

    expect(jwtService.sign).toHaveBeenCalledTimes(1);
  });

  it('debe rechazar un refresh token con firma inválida', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    await expect(service.refresh('refresh-token-invalido')).rejects.toThrow(
      'Invalid refresh token signature',
    );

    expect(authRepository.findRefreshToken).not.toHaveBeenCalled();
    expect(authRepository.findById).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('debe rechazar un refresh token inexistente o expirado', async () => {
    jwtService.verify.mockReturnValue({
      sub: 10,
      email: 'jair@test.com',
    });

    authRepository.findRefreshToken.mockResolvedValue(null);

    await expect(service.refresh('refresh-token')).rejects.toThrow(
      'Invalid or expired refresh token',
    );

    expect(authRepository.findRefreshToken).toHaveBeenCalledWith(
      'refresh-token',
    );

    expect(authRepository.findById).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('debe rechazar el refresh cuando el usuario no existe o está inactivo', async () => {
    jwtService.verify.mockReturnValue({
      sub: 10,
      email: 'jair@test.com',
    });

    authRepository.findRefreshToken.mockResolvedValue({
      id_usuario: 10,
      fecha_expiracion: new Date(Date.now() + 60_000),
    });

    authRepository.findById.mockResolvedValue({
      id_usuario: 10,
      email: 'jair@test.com',
      estado: 'Inactivo',
    });

    await expect(service.refresh('refresh-token')).rejects.toThrow(
      'User not found or inactive',
    );

    expect(authRepository.findById).toHaveBeenCalledWith(10);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  // Register

  it('debe registrar correctamente un usuario nuevo', async () => {
    const dto = {
      email: 'nuevo@test.com',
      nombre: 'Nuevo',
      apellido: 'Usuario',
      password: 'Password123!',
    };

    const user = {
      id_usuario: 20,
      nombre: 'Nuevo',
      apellido: 'Usuario',
      email: 'nuevo@test.com',
    };

    const verificationToken = 'verification-token';

    authRepository.findByEmail.mockResolvedValue(null);

    authRepository.register.mockResolvedValue(user);

    authRepository.createVerificationToken.mockResolvedValue(verificationToken);

    const sendMailMock = jest
      .spyOn((service as any).transporter, 'sendMail')
      .mockResolvedValue({
        messageId: 'test-message-id',
      } as any);

    const result = await service.register(dto as any);

    expect(result).toEqual({
      message: 'Usuario registrado. Revisa tu correo para verificar la cuenta.',
      user: {
        id_usuario: 20,
        nombre: 'Nuevo',
        apellido: 'Usuario',
        email: 'nuevo@test.com',
      },
    });

    expect(authRepository.findByEmail).toHaveBeenCalledWith(dto.email);

    expect(authRepository.register).toHaveBeenCalledWith(dto);

    expect(authRepository.createVerificationToken).toHaveBeenCalledWith(20);

    expect(sendMailMock).toHaveBeenCalled();

    const mailOptions = sendMailMock.mock.calls[0][0] as {
      to: string;
      subject: string;
      html: string;
    };

    expect(mailOptions.to).toBe('nuevo@test.com');
    expect(mailOptions.subject).toContain('Verifica tu cuenta');
    expect(mailOptions.html).toContain(verificationToken);

    sendMailMock.mockRestore();
  });

  it('debe rechazar el registro cuando el email ya está registrado', async () => {
    const dto = {
      email: 'existente@test.com',
      nombre: 'Usuario',
      apellido: 'Existente',
      password: 'Password123!',
    };

    authRepository.findByEmail.mockResolvedValue({
      id_usuario: 15,
      email: dto.email,
    });

    await expect(service.register(dto as any)).rejects.toThrow(
      'El email ya está registrado',
    );

    expect(authRepository.findByEmail).toHaveBeenCalledWith(dto.email);

    expect(authRepository.register).not.toHaveBeenCalled();

    expect(authRepository.createVerificationToken).not.toHaveBeenCalled();
  });

  it('debe completar el registro aunque falle el envío del correo', async () => {
    const dto = {
      email: 'correo-falla@test.com',
      nombre: 'Usuario',
      apellido: 'Correo',
      password: 'Password123!',
    };

    const user = {
      id_usuario: 21,
      nombre: 'Usuario',
      apellido: 'Correo',
      email: dto.email,
    };

    authRepository.findByEmail.mockResolvedValue(null);

    authRepository.register.mockResolvedValue(user);

    authRepository.createVerificationToken.mockResolvedValue(
      'verification-token',
    );

    const sendMailMock = jest
      .spyOn((service as any).transporter, 'sendMail')
      .mockRejectedValue(new Error('SMTP no disponible'));

    const result = await service.register(dto as any);

    expect(result).toEqual({
      message: 'Usuario registrado. Revisa tu correo para verificar la cuenta.',
      user: {
        id_usuario: 21,
        nombre: 'Usuario',
        apellido: 'Correo',
        email: dto.email,
      },
    });

    expect(authRepository.register).toHaveBeenCalledWith(dto);

    expect(authRepository.createVerificationToken).toHaveBeenCalledWith(21);

    expect(sendMailMock).toHaveBeenCalled();

    sendMailMock.mockRestore();
  });

  // Verify email

  it('debe verificar correctamente una cuenta con un token válido', async () => {
    const token = 'verification-token';

    authRepository.findByVerificationToken.mockResolvedValue({
      id_usuario: 10,
      fecha_expiracion: new Date(Date.now() + 60_000),
    });

    const result = await service.verify(token);

    expect(result).toEqual({
      redirect: 'http://localhost:5173/verificado?success=1',
    });

    expect(authRepository.findByVerificationToken).toHaveBeenCalledWith(token);

    expect(authRepository.markTokenAsUsed).toHaveBeenCalledWith(token);

    expect(authRepository.markEmailVerified).toHaveBeenCalledWith(10);
  });

  it('debe rechazar la verificación cuando el token no existe', async () => {
    const token = 'token-invalido';

    authRepository.findByVerificationToken.mockResolvedValue(null);

    const result = await service.verify(token);

    expect(result).toEqual({
      redirect: 'http://localhost:5173/verificado?error=token',
    });

    expect(authRepository.markTokenAsUsed).not.toHaveBeenCalled();

    expect(authRepository.markEmailVerified).not.toHaveBeenCalled();
  });

  it('debe rechazar la verificación cuando el token está expirado', async () => {
    const token = 'token-expirado';

    authRepository.findByVerificationToken.mockResolvedValue({
      id_usuario: 10,
      fecha_expiracion: new Date(Date.now() - 60_000),
    });

    const result = await service.verify(token);

    expect(result).toEqual({
      redirect: 'http://localhost:5173/verificado?error=expirado',
    });

    expect(authRepository.markTokenAsUsed).not.toHaveBeenCalled();

    expect(authRepository.markEmailVerified).not.toHaveBeenCalled();
  });

  // Reset password

  it('debe cambiar la contraseña correctamente con un token válido', async () => {
    const dto = {
      token: 'reset-token',
      email: 'jair@test.com',
      password: 'NuevaPassword123!',
    };

    authRepository.findValidResetToken.mockResolvedValue({
      id_usuario: 10,
      fecha_expiracion: new Date(Date.now() + 60_000),
    });

    authRepository.findById.mockResolvedValue({
      id_usuario: 10,
      email: 'jair@test.com',
    });

    const result = await service.resetPassword(dto as any);

    expect(result).toEqual({
      success: true,
      message: 'Contraseña actualizada correctamente',
    });

    expect(authRepository.findValidResetToken).toHaveBeenCalledWith(
      'reset-token',
    );

    expect(authRepository.findById).toHaveBeenCalledWith(10);

    expect(authRepository.updatePassword).toHaveBeenCalledWith(
      10,
      'NuevaPassword123!',
    );

    expect(authRepository.markTokenAsUsed).toHaveBeenCalledWith('reset-token');

    expect(authRepository.invalidateAllUserRefreshTokens).toHaveBeenCalledWith(
      10,
    );
  });

  it('debe rechazar un token de recuperación inválido', async () => {
    const dto = {
      token: 'reset-token-invalido',
      email: 'jair@test.com',
      password: 'NuevaPassword123!',
    };

    authRepository.findValidResetToken.mockResolvedValue(null);

    await expect(service.resetPassword(dto as any)).rejects.toThrow(
      'Token inválido o expirado',
    );

    expect(authRepository.findById).not.toHaveBeenCalled();

    expect(authRepository.updatePassword).not.toHaveBeenCalled();

    expect(authRepository.markTokenAsUsed).not.toHaveBeenCalled();

    expect(
      authRepository.invalidateAllUserRefreshTokens,
    ).not.toHaveBeenCalled();
  });

  it('debe rechazar el cambio cuando el email no coincide con el usuario del token', async () => {
    const dto = {
      token: 'reset-token',
      email: 'otro@test.com',
      password: 'NuevaPassword123!',
    };

    authRepository.findValidResetToken.mockResolvedValue({
      id_usuario: 10,
      fecha_expiracion: new Date(Date.now() + 60_000),
    });

    authRepository.findById.mockResolvedValue({
      id_usuario: 10,
      email: 'jair@test.com',
    });

    await expect(service.resetPassword(dto as any)).rejects.toThrow(
      'Usuario no coincide con el token',
    );

    expect(authRepository.updatePassword).not.toHaveBeenCalled();

    expect(authRepository.markTokenAsUsed).not.toHaveBeenCalled();

    expect(
      authRepository.invalidateAllUserRefreshTokens,
    ).not.toHaveBeenCalled();
  });

  it('debe rechazar un token de recuperación expirado', async () => {
    const dto = {
      token: 'reset-token-expirado',
      email: 'jair@test.com',
      password: 'NuevaPassword123!',
    };

    authRepository.findValidResetToken.mockResolvedValue({
      id_usuario: 10,
      fecha_expiracion: new Date(Date.now() - 60_000),
    });

    await expect(service.resetPassword(dto as any)).rejects.toThrow(
      'Token expirado',
    );

    expect(authRepository.findById).not.toHaveBeenCalled();

    expect(authRepository.updatePassword).not.toHaveBeenCalled();

    expect(authRepository.markTokenAsUsed).not.toHaveBeenCalled();

    expect(
      authRepository.invalidateAllUserRefreshTokens,
    ).not.toHaveBeenCalled();
  });
  // ============================================================
  // GET PROFILE
  // ============================================================

  it('debe devolver el perfil del usuario', async () => {
    const user = {
      id_usuario: 10,
      nombre: 'Jair',
      email: 'jair@test.com',
    };

    authRepository.findById.mockResolvedValue(user);

    const result = await service.getProfile(10);

    expect(result).toEqual(user);

    expect(authRepository.findById).toHaveBeenCalledWith(10);
  });

  it('debe rechazar el perfil cuando el usuario no existe', async () => {
    authRepository.findById.mockResolvedValue(null);

    await expect(service.getProfile(999)).rejects.toThrow(
      'Usuario no encontrado',
    );

    expect(authRepository.findById).toHaveBeenCalledWith(999);
  });

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  it('debe solicitar recuperación de contraseña para un usuario existente', async () => {
    const user = {
      id_usuario: 10,
      nombre: 'Jair',
      email: 'jair@test.com',
    };

    authRepository.findByEmail.mockResolvedValue(user);

    authRepository.createResetToken.mockResolvedValue('reset-token');

    const sendMailMock = jest
      .spyOn((service as any).transporter, 'sendMail')
      .mockResolvedValue({
        messageId: 'reset-message',
      } as any);

    const result = await service.forgotPassword({
      email: user.email,
    } as any);

    expect(result).toEqual({
      message:
        'Se ha enviado un correo con instrucciones para restablecer tu contraseña.',
    });

    expect(authRepository.findByEmail).toHaveBeenCalledWith(user.email);

    expect(authRepository.createResetToken).toHaveBeenCalledWith(10);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: user.email,
        subject: expect.stringContaining('Restablecer contraseña'),
        html: expect.stringContaining('reset-token'),
      }),
    );

    sendMailMock.mockRestore();
  });

  it('debe devolver la misma respuesta aunque el email no exista', async () => {
    authRepository.findByEmail.mockResolvedValue(null);

    const result = await service.forgotPassword({
      email: 'noexiste@test.com',
    } as any);

    expect(result).toEqual({
      message:
        'Se ha enviado un correo con instrucciones para restablecer tu contraseña.',
    });

    expect(authRepository.createResetToken).not.toHaveBeenCalled();
  });

  it('debe continuar aunque falle el envío del correo de recuperación', async () => {
    const user = {
      id_usuario: 10,
      nombre: 'Jair',
      email: 'jair@test.com',
    };

    authRepository.findByEmail.mockResolvedValue(user);

    authRepository.createResetToken.mockResolvedValue('reset-token');

    const sendMailMock = jest
      .spyOn((service as any).transporter, 'sendMail')
      .mockRejectedValue(new Error('SMTP no disponible'));

    const loggerErrorSpy = jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation();

    const result = await service.forgotPassword({
      email: user.email,
    } as any);

    expect(result).toEqual({
      message:
        'Se ha enviado un correo con instrucciones para restablecer tu contraseña.',
    });

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error enviando email a'),
      expect.any(Error),
    );

    sendMailMock.mockRestore();
    loggerErrorSpy.mockRestore();
  });

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  it('debe enviar correctamente el correo de cambio de contraseña', async () => {
    const user: any = {
      id_usuario: 10,
      nombre: 'Jair',
      email: 'jair@test.com',
    };

    authRepository.createResetToken.mockResolvedValue('change-token');

    const sendMailMock = jest
      .spyOn((service as any).transporter, 'sendMail')
      .mockResolvedValue({
        messageId: 'change-message',
      } as any);

    const result = await service.changePassword(user);

    expect(result).toEqual({
      success: true,
      message:
        'Se ha enviado un correo con instrucciones para cambiar tu contraseña.',
    });

    expect(authRepository.createResetToken).toHaveBeenCalledWith(10);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: user.email,
        subject: expect.stringContaining('Cambio de contraseña'),
        html: expect.stringContaining('change-token'),
      }),
    );

    sendMailMock.mockRestore();
  });

  it('debe lanzar error 500 cuando falla el correo de cambio de contraseña', async () => {
    const user: any = {
      id_usuario: 10,
      nombre: 'Jair',
      email: 'jair@test.com',
    };

    authRepository.createResetToken.mockResolvedValue('change-token');

    const sendMailMock = jest
      .spyOn((service as any).transporter, 'sendMail')
      .mockRejectedValue(new Error('SMTP no disponible'));

    const loggerErrorSpy = jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation();

    await expect(service.changePassword(user)).rejects.toThrow(
      'SMTP no disponible',
    );

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('CHANGE PASSWORD -> ERROR'),
    );

    sendMailMock.mockRestore();
    loggerErrorSpy.mockRestore();
  });

  // ============================================================
  // GITHUB LOGIN
  // ============================================================

  it('debe rechazar github login cuando no existe req.user', async () => {
    await expect(service.githubLogin({})).rejects.toThrow(
      'No user from github',
    );

    expect(authRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('debe hacer login con github usando un usuario existente', async () => {
    const user = {
      id_usuario: 20,
      nombre: 'Jair',
      email: 'jair@github.com',
    };

    authRepository.findByEmail.mockResolvedValue(user);

    jwtService.sign
      .mockReturnValueOnce('github-access')
      .mockReturnValueOnce('github-refresh');

    authRepository.saveRefreshToken.mockResolvedValue(undefined);

    const result = await service.githubLogin({
      user: {
        email: user.email,
        nombre: user.nombre,
        imagen_perfil: 'https://image.test/avatar.jpg',
      },
    });

    expect(result).toEqual({
      accessToken: 'github-access',
      refreshToken: 'github-refresh',
      user: {
        id_usuario: 20,
        nombre: 'Jair',
        email: 'jair@github.com',
      },
    });

    expect(authRepository.findByEmail).toHaveBeenCalledWith('jair@github.com');

    expect(authRepository.register).not.toHaveBeenCalled();

    expect(authRepository.markEmailVerified).not.toHaveBeenCalled();

    expect(authRepository.saveRefreshToken).toHaveBeenCalledWith(
      20,
      'github-refresh',
    );

    expect(jwtService.sign).toHaveBeenCalledTimes(2);
  });

  it('debe registrar automáticamente un nuevo usuario de github', async () => {
    const nuevoUsuario = {
      id_usuario: 30,
      nombre: 'Nuevo GitHub',
      apellido: '',
      email: 'nuevo@github.com',
    };

    authRepository.findByEmail.mockResolvedValue(null);

    authRepository.register.mockResolvedValue(nuevoUsuario);

    authRepository.markEmailVerified.mockResolvedValue(undefined);

    authRepository.updateAvatar.mockResolvedValue(undefined);

    jwtService.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');

    const result = await service.githubLogin({
      user: {
        email: 'nuevo@github.com',
        nombre: 'Nuevo GitHub',
        imagen_perfil: 'https://image.test/github.jpg',
      },
    });

    expect(result.user).toEqual({
      id_usuario: 30,
      nombre: 'Nuevo GitHub',
      email: 'nuevo@github.com',
    });

    expect(authRepository.register).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'nuevo@github.com',
        nombre: 'Nuevo GitHub',
        apellido: '',
        password: expect.any(String),
      }),
    );

    expect(authRepository.markEmailVerified).toHaveBeenCalledWith(30);

    expect(authRepository.updateAvatar).toHaveBeenCalledWith(
      30,
      'https://image.test/github.jpg',
    );

    expect(authRepository.saveRefreshToken).toHaveBeenCalledWith(
      30,
      'refresh-token',
    );
  });

  it('debe registrar usuario de github sin actualizar avatar cuando no viene imagen', async () => {
    const nuevoUsuario = {
      id_usuario: 31,
      nombre: 'Sin Avatar',
      apellido: '',
      email: 'sinavatar@github.com',
    };

    authRepository.findByEmail.mockResolvedValue(null);

    authRepository.register.mockResolvedValue(nuevoUsuario);

    jwtService.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');

    await service.githubLogin({
      user: {
        email: 'sinavatar@github.com',
        nombre: 'Sin Avatar',
      },
    });

    expect(authRepository.markEmailVerified).toHaveBeenCalledWith(31);

    expect(authRepository.updateAvatar).not.toHaveBeenCalled();
  });


  // ============================================================
  // INVALIDATE REFRESH TOKEN
  // ============================================================

  it('debe invalidar un refresh token existente', async () => {
    const token: any = {
      id_token: 100,
      id_usuario: 10,
      token: 'refresh-token',
      usado: false,
    };

    authRepository.findRefreshToken.mockResolvedValue(token);

    authRepository.updateToken.mockResolvedValue(undefined);

    await service.invalidateRefreshToken('refresh-token');

    expect(authRepository.findRefreshToken).toHaveBeenCalledWith(
      'refresh-token',
    );

    expect(token.usado).toBe(true);

    expect(authRepository.updateToken).toHaveBeenCalledWith(token);
  });

  it('no debe actualizar un refresh token que no existe', async () => {
    authRepository.findRefreshToken.mockResolvedValue(null);

    await service.invalidateRefreshToken('refresh-token');

    expect(authRepository.updateToken).not.toHaveBeenCalled();
  });

  // ============================================================
  // LOGOUT
  // ============================================================

  it('debe cerrar sesión usando el refresh token', async () => {
    const token: any = {
      id_token: 100,
      id_usuario: 10,
      token: 'refresh-token',
      usado: false,
    };

    authRepository.findRefreshToken.mockResolvedValue(token);

    authRepository.updateToken.mockResolvedValue(undefined);

    authRepository.updateLogout.mockResolvedValue(undefined);

    await service.logout(undefined, 'refresh-token');

    expect(token.usado).toBe(true);

    expect(authRepository.updateToken).toHaveBeenCalledWith(token);

    expect(authRepository.updateLogout).toHaveBeenCalledWith(10);
  });

  it('debe cerrar sesión usando directamente el userId', async () => {
    authRepository.updateLogout.mockResolvedValue(undefined);

    await service.logout(15);

    expect(authRepository.findRefreshToken).not.toHaveBeenCalled();

    expect(authRepository.updateLogout).toHaveBeenCalledWith(15);
  });

  it('debe cerrar sesión usando userId cuando el refresh token no existe', async () => {
    authRepository.findRefreshToken.mockResolvedValue(null);

    authRepository.updateLogout.mockResolvedValue(undefined);

    await service.logout(15, 'refresh-token-invalido');

    expect(authRepository.updateToken).not.toHaveBeenCalled();

    expect(authRepository.updateLogout).toHaveBeenCalledWith(15);
  });

  it('no debe hacer nada cuando logout no recibe userId ni refresh token válido', async () => {
    authRepository.findRefreshToken.mockResolvedValue(null);

    await service.logout(undefined, 'refresh-token-invalido');

    expect(authRepository.updateLogout).not.toHaveBeenCalled();

    expect(authRepository.updateToken).not.toHaveBeenCalled();
  });

  it('debe usar el userId existente antes que el del refresh token', async () => {
    const token: any = {
      id_usuario: 20,
      token: 'refresh-token',
      usado: false,
    };

    authRepository.findRefreshToken.mockResolvedValue(token);

    authRepository.updateToken.mockResolvedValue(undefined);

    authRepository.updateLogout.mockResolvedValue(undefined);

    await service.logout(10, 'refresh-token');

    expect(authRepository.updateLogout).toHaveBeenCalledWith(10);
  });

  // ============================================================
  // DECODE TOKEN
  // ============================================================

  it('debe decodificar un token', () => {
    const decoded = {
      sub: 10,
      email: 'jair@test.com',
    };

    jwtService.decode.mockReturnValue(decoded);

    const result = service.decodeToken('jwt-token');

    expect(result).toEqual(decoded);

    expect(jwtService.decode).toHaveBeenCalledWith('jwt-token');
  });
});
