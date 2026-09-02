import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { VideoService } from './video.service';
import { VideoSessionStore, VideoSession } from './video-session.store';

import { Leccion } from '../entities/leccion.entity';
import { Inscripcion } from '../entities/inscripcion.entity';
import { DetallePago } from '../entities/detalle-pago.entity';

describe('VideoService', () => {
  let service: VideoService;

  let sessions: {
    get: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
    clearExpired: jest.Mock;
  };

  let leccionRepo: {
    findOne: jest.Mock;
  };

  let inscripcionRepo: {
    findOne: jest.Mock;
  };

  let detalleRepo: {
    findOne: jest.Mock;
  };

  let jwtService: {
    sign: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    delete process.env.VIDEO_ENCRYPTION_KEY;
    delete process.env.VIDEO_JWT_SECRET;
    delete process.env.VIDEO_TOKEN_TTL;

    sessions = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      clearExpired: jest.fn().mockResolvedValue(undefined),
    };

    leccionRepo = {
      findOne: jest.fn(),
    };

    inscripcionRepo = {
      findOne: jest.fn(),
    };

    detalleRepo = {
      findOne: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('video-access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: VideoSessionStore,
          useValue: sessions,
        },
        {
          provide: getRepositoryToken(Leccion),
          useValue: leccionRepo,
        },
        {
          provide: getRepositoryToken(Inscripcion),
          useValue: inscripcionRepo,
        },
        {
          provide: getRepositoryToken(DetallePago),
          useValue: detalleRepo,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
  });

  afterEach(() => {
    delete process.env.VIDEO_ENCRYPTION_KEY;
    delete process.env.VIDEO_JWT_SECRET;
    delete process.env.VIDEO_TOKEN_TTL;
    jest.restoreAllMocks();
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // GET VIDEO TOKEN
  // ============================================================

  it('debe rechazar cuando la lección no existe', async () => {
    leccionRepo.findOne.mockResolvedValue(null);

    await expect(service.getVideoToken(100, 10, 'fingerprint')).rejects.toThrow(
      'Lección no encontrada',
    );

    expect(leccionRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_leccion: 100,
      },
      relations: ['modulo'],
    });

    expect(inscripcionRepo.findOne).not.toHaveBeenCalled();
  });

  it('debe rechazar cuando no se puede determinar el curso', async () => {
    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 100,
      modulo: null,
    });

    await expect(service.getVideoToken(100, 10, 'fingerprint')).rejects.toThrow(
      'No se pudo determinar el curso',
    );

    expect(inscripcionRepo.findOne).not.toHaveBeenCalled();
  });

  it('debe rechazar cuando el usuario no tiene inscripción activa ni completada', async () => {
    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 100,
      url_video: 'https://www.youtube.com/watch?v=abc123',
      modulo: {
        id_curso: 50,
      },
    });

    inscripcionRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(service.getVideoToken(100, 10, 'fingerprint')).rejects.toThrow(
      'No tienes inscripción activa en el curso',
    );

    expect(inscripcionRepo.findOne).toHaveBeenNthCalledWith(1, {
      where: {
        id_usuario: 10,
        id_curso: 50,
        estado: 'Activo',
      },
    });

    expect(inscripcionRepo.findOne).toHaveBeenNthCalledWith(2, {
      where: {
        id_usuario: 10,
        id_curso: 50,
        estado: 'Completado',
      },
    });
  });

  it('debe continuar cuando la inscripción está activa', async () => {
    process.env.VIDEO_ENCRYPTION_KEY = '12345678901234567890123456789012';

    process.env.VIDEO_JWT_SECRET = 'video-secret';

    process.env.VIDEO_TOKEN_TTL = '1800';

    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 100,
      url_video: 'https://www.youtube.com/watch?v=abc123',
      modulo: {
        id_curso: 50,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 1,
      id_usuario: 10,
      id_curso: 50,
      estado: 'Activo',
    });

    const result = await service.getVideoToken(100, 10, 'fingerprint-test');

    expect(result.access_token).toBe('video-access-token');

    expect(result.expires_in).toBe(1800);

    expect(result.encrypted_video_id).toMatch(/^[a-f0-9]{32}:[a-f0-9]+$/);

    expect(result.session_id).toMatch(/^vs_[a-f0-9]{16}$/);

    expect(result.player_config).toEqual({
      type: 'videojs',
      controls: ['play', 'pause', 'seek', 'volume'],
      protection: {
        disableRightClick: true,
        detectDevTools: true,
      },
    });

    expect(jwtService.sign).toHaveBeenCalledWith(
      {
        sub: 10,
        lesson_id: 100,
        video_id: 'abc123',
      },
      {
        secret: 'video-secret',
        expiresIn: 1800,
      },
    );

    expect(sessions.set).toHaveBeenCalledWith(
      expect.stringMatching(/^vs_[a-f0-9]{16}$/),
      expect.objectContaining({
        user_id: 10,
        lesson_id: 100,
        fingerprint: 'fingerprint-test',
        created_at: expect.any(Number),
        last_activity: expect.any(Number),
      }),
      1800,
    );
  });

  it('debe continuar cuando la inscripción está completada', async () => {
    process.env.VIDEO_ENCRYPTION_KEY = '12345678901234567890123456789012';

    process.env.VIDEO_JWT_SECRET = 'video-secret';

    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 101,
      url_video: 'https://youtu.be/abc123',
      modulo: {
        id_curso: 50,
      },
    });

    inscripcionRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id_inscripcion: 2,
      id_usuario: 10,
      id_curso: 50,
      estado: 'Completado',
    });

    const result = await service.getVideoToken(101, 10, 'fingerprint');

    expect(result.access_token).toBe('video-access-token');

    expect(inscripcionRepo.findOne).toHaveBeenCalledTimes(2);
  });

  it('debe rechazar cuando el video no está disponible', async () => {
    process.env.VIDEO_ENCRYPTION_KEY = '12345678901234567890123456789012';

    process.env.VIDEO_JWT_SECRET = 'video-secret';

    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 100,
      url_video: '',
      modulo: {
        id_curso: 50,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 1,
    });

    await expect(service.getVideoToken(100, 10, 'fingerprint')).rejects.toThrow(
      'Video no disponible',
    );

    expect(jwtService.sign).not.toHaveBeenCalled();

    expect(sessions.set).not.toHaveBeenCalled();
  });

  it('debe rechazar una clave de cifrado inexistente', async () => {
    process.env.VIDEO_JWT_SECRET = 'video-secret';

    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 100,
      url_video: 'https://www.youtube.com/watch?v=abc123',
      modulo: {
        id_curso: 50,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 1,
    });

    await expect(service.getVideoToken(100, 10, 'fingerprint')).rejects.toThrow(
      'VIDEO_ENCRYPTION_KEY must be set and exactly 32 characters long',
    );
  });

  it('debe rechazar una clave de cifrado con longitud incorrecta', async () => {
    process.env.VIDEO_ENCRYPTION_KEY = 'clave-corta';

    process.env.VIDEO_JWT_SECRET = 'video-secret';

    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 100,
      url_video: 'https://www.youtube.com/watch?v=abc123',
      modulo: {
        id_curso: 50,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 1,
    });

    await expect(service.getVideoToken(100, 10, 'fingerprint')).rejects.toThrow(
      'VIDEO_ENCRYPTION_KEY must be set and exactly 32 characters long',
    );
  });

  it('debe rechazar cuando VIDEO_JWT_SECRET no está configurado', async () => {
    process.env.VIDEO_ENCRYPTION_KEY = '12345678901234567890123456789012';

    delete process.env.VIDEO_JWT_SECRET;

    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 100,
      url_video: 'https://www.youtube.com/watch?v=abc123',
      modulo: {
        id_curso: 50,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 1,
    });

    await expect(service.getVideoToken(100, 10, 'fingerprint')).rejects.toThrow(
      'VIDEO_JWT_SECRET env variable is required but not set',
    );

    expect(jwtService.sign).not.toHaveBeenCalled();

    expect(sessions.set).not.toHaveBeenCalled();
  });

  it('debe usar TTL 3600 por defecto', async () => {
    process.env.VIDEO_ENCRYPTION_KEY = '12345678901234567890123456789012';

    process.env.VIDEO_JWT_SECRET = 'video-secret';

    delete process.env.VIDEO_TOKEN_TTL;

    leccionRepo.findOne.mockResolvedValue({
      id_leccion: 100,
      url_video: 'https://www.youtube.com/watch?v=abc123',
      modulo: {
        id_curso: 50,
      },
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 1,
    });

    const result = await service.getVideoToken(100, 10, 'fingerprint');

    expect(result.expires_in).toBe(3600);

    expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object), {
      secret: 'video-secret',
      expiresIn: 3600,
    });

    expect(sessions.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      3600,
    );
  });

  // ============================================================
  // HEARTBEAT
  // ============================================================

  it('debe rechazar un heartbeat cuando la sesión no existe', async () => {
    sessions.get.mockResolvedValue(null);

    await expect(
      service.heartbeat({
        session_id: 'session-1',
      } as any),
    ).rejects.toThrow('Sesión no encontrada');

    expect(sessions.get).toHaveBeenCalledWith('session-1');

    expect(sessions.set).not.toHaveBeenCalled();
  });

  it('debe rechazar un heartbeat cuando el fingerprint es inválido', async () => {
    sessions.get.mockResolvedValue({
      user_id: 10,
      lesson_id: 100,
      fingerprint: 'fingerprint-correcto',
      created_at: 1000,
      last_activity: 1000,
    });

    await expect(
      service.heartbeat({
        session_id: 'session-1',
        fingerprint: 'fingerprint-incorrecto',
      } as any),
    ).rejects.toThrow('Fingerprint inválido');

    expect(sessions.delete).toHaveBeenCalledWith('session-1');

    expect(sessions.set).not.toHaveBeenCalled();

    expect(sessions.clearExpired).not.toHaveBeenCalled();
  });

  it('debe aceptar un heartbeat válido y actualizar la actividad', async () => {
    const session: VideoSession = {
      user_id: 10,
      lesson_id: 100,
      fingerprint: 'fingerprint-correcto',
      created_at: 1000,
      last_activity: 1000,
    };

    sessions.get.mockResolvedValue(session);

    process.env.VIDEO_TOKEN_TTL = '1800';

    const before = Date.now();

    const result = await service.heartbeat({
      session_id: 'session-1',
      fingerprint: 'fingerprint-correcto',
    } as any);

    const after = Date.now();

    expect(result).toEqual({
      message: 'Sesión válida',
    });

    expect(session.last_activity).toBeGreaterThanOrEqual(before);

    expect(session.last_activity).toBeLessThanOrEqual(after);

    expect(sessions.set).toHaveBeenCalledWith('session-1', session, 1800);

    expect(sessions.clearExpired).toHaveBeenCalledWith(2 * 60 * 60 * 1000);
  });

  it('debe usar TTL 3600 por defecto en heartbeat', async () => {
    delete process.env.VIDEO_TOKEN_TTL;

    const session: VideoSession = {
      user_id: 10,
      lesson_id: 100,
      fingerprint: 'fingerprint',
      created_at: 1000,
      last_activity: 1000,
    };

    sessions.get.mockResolvedValue(session);

    await service.heartbeat({
      session_id: 'session-1',
      fingerprint: 'fingerprint',
    } as any);

    expect(sessions.set).toHaveBeenCalledWith('session-1', session, 3600);

    expect(sessions.clearExpired).toHaveBeenCalledWith(2 * 60 * 60 * 1000);
  });

  it('debe aceptar heartbeat sin fingerprint', async () => {
    const session: VideoSession = {
      user_id: 10,
      lesson_id: 100,
      fingerprint: 'fingerprint',
      created_at: 1000,
      last_activity: 1000,
    };

    sessions.get.mockResolvedValue(session);

    const result = await service.heartbeat({
      session_id: 'session-1',
    } as any);

    expect(result).toEqual({
      message: 'Sesión válida',
    });

    expect(sessions.delete).not.toHaveBeenCalled();

    expect(sessions.set).toHaveBeenCalled();
  });

  it('debe usar session_id vacío cuando no se proporciona', async () => {
    sessions.get.mockResolvedValue(null);

    await expect(service.heartbeat({} as any)).rejects.toThrow(
      'Sesión no encontrada',
    );

    expect(sessions.get).toHaveBeenCalledWith('');
  });

  // ============================================================
  // EXTRACT VIDEO ID
  // ============================================================

  it('debe extraer el ID desde youtube.com/watch', () => {
    const result = (service as any).extractVideoId(
      'https://www.youtube.com/watch?v=abc123&list=test',
    );

    expect(result).toBe('abc123');
  });

  it('debe extraer el ID desde youtu.be', () => {
    const result = (service as any).extractVideoId(
      'https://youtu.be/xyz789?si=test',
    );

    expect(result).toBe('xyz789');
  });

  it('debe extraer el ID desde youtube.com/embed', () => {
    const result = (service as any).extractVideoId(
      'https://www.youtube.com/embed/embed123?autoplay=1',
    );

    expect(result).toBe('embed123');
  });

  it('debe devolver la URL cuando no coincide con un formato de YouTube conocido', () => {
    const result = (service as any).extractVideoId(
      'https://videos.example.com/video-123',
    );

    expect(result).toBe('https://videos.example.com/video-123');
  });

  it('debe devolver cadena vacía cuando la URL está vacía', () => {
    const result = (service as any).extractVideoId('');

    expect(result).toBe('');
  });

  it('debe devolver cadena vacía cuando la URL es undefined', () => {
    const result = (service as any).extractVideoId(undefined);

    expect(result).toBe('');
  });
});
