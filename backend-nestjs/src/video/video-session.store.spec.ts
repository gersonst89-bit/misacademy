import { VideoSessionStore, VideoSession } from './video-session.store';

describe('VideoSessionStore', () => {
  let store: VideoSessionStore;

  const session: VideoSession = {
    user_id: 10,
    lesson_id: 25,
    fingerprint: 'fingerprint-test',
    created_at: 1000,
    last_activity: 1000,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.REDIS_PASSWORD;

    store = new VideoSessionStore();
  });

  // ============================================================
  // BASIC / FALLBACK LOCAL
  // ============================================================

  it('debe estar definido', () => {
    expect(store).toBeDefined();
  });

  it('debe usar memoria local cuando no existe REDIS_HOST', async () => {
    await store.set('session-1', session, 60);

    const result = await store.get('session-1');

    expect(result).toEqual(session);
  });

  it('debe devolver null cuando la sesión no existe en memoria', async () => {
    const result = await store.get('no-existe');

    expect(result).toBeNull();
  });

  it('debe eliminar una sesión de memoria', async () => {
    await store.set('session-1', session, 60);

    expect(await store.get('session-1')).toEqual(session);

    await store.delete('session-1');

    expect(await store.get('session-1')).toBeNull();
  });

  it('debe eliminar una sesión inexistente sin lanzar error', async () => {
    await expect(store.delete('no-existe')).resolves.toBeUndefined();
  });

  // ============================================================
  // CLEAR EXPIRED
  // ============================================================

  it('debe eliminar sesiones expiradas del almacenamiento local', async () => {
    const now = Date.now();

    const expiredSession: VideoSession = {
      ...session,
      last_activity: now - 10_000,
    };

    const activeSession: VideoSession = {
      ...session,
      last_activity: now - 1_000,
    };

    await store.set('expired', expiredSession, 60);

    await store.set('active', activeSession, 60);

    await store.clearExpired(5_000);

    expect(await store.get('expired')).toBeNull();

    expect(await store.get('active')).toEqual(activeSession);
  });

  it('no debe eliminar una sesión cuando su antigüedad no supera maxAgeMs', async () => {
    const now = Date.now();

    const activeSession: VideoSession = {
      ...session,
      last_activity: now - 4_000,
    };

    await store.set('active', activeSession, 5_000);

    await store.clearExpired(5_000);

    expect(await store.get('active')).toEqual(activeSession);
  });

  // ============================================================
  // REDIS GET
  // ============================================================

  it('debe obtener una sesión desde Redis cuando está conectado', async () => {
    const redisGet = jest.fn().mockResolvedValue(JSON.stringify(session));

    const redisClient = {
      get: redisGet,
      set: jest.fn(),
      del: jest.fn(),
    };

    (store as any).redisClient = redisClient;
    (store as any).isRedisConnected = true;

    const result = await store.get('session-redis');

    expect(result).toEqual(session);

    expect(redisGet).toHaveBeenCalledWith('vsession:session-redis');
  });
  it('debe usar fallback local cuando Redis falla al leer', async () => {
    const redisGet = jest.fn().mockRejectedValue(new Error('Redis read error'));

    const redisClient = {
      get: redisGet,
      set: jest.fn(),
      del: jest.fn(),
    };

    (store as any).redisClient = redisClient;
    (store as any).isRedisConnected = true;

    (store as any).memoryStore.set('session-local', session);

    const result = await store.get('session-local');

    expect(result).toEqual(session);

    expect(redisGet).toHaveBeenCalledWith('vsession:session-local');
  });

  it('debe usar fallback local cuando Redis falla al leer', async () => {
    const redisGet = jest.fn().mockRejectedValue(new Error('Redis read error'));

    const redisClient = {
      get: redisGet,
      set: jest.fn(),
      del: jest.fn(),
    };

    (store as any).redisClient = redisClient;
    (store as any).isRedisConnected = true;

    (store as any).memoryStore.set('session-local', session);

    const result = await store.get('session-local');

    expect(result).toEqual(session);

    expect(redisGet).toHaveBeenCalledWith('vsession:session-local');
  });

  it('debe devolver null cuando Redis falla y no existe sesión local', async () => {
    const redisClient = {
      get: jest.fn().mockRejectedValue(new Error('Redis unavailable')),
      set: jest.fn(),
      del: jest.fn(),
    };

    (store as any).redisClient = redisClient;
    (store as any).isRedisConnected = true;

    const result = await store.get('no-existe');

    expect(result).toBeNull();
  });

  // ============================================================
  // REDIS SET
  // ============================================================

  it('debe guardar una sesión en Redis cuando está conectado', async () => {
    const redisSet = jest.fn().mockResolvedValue('OK');

    const redisClient = {
      get: jest.fn(),
      set: redisSet,
      del: jest.fn(),
    };

    (store as any).redisClient = redisClient;
    (store as any).isRedisConnected = true;

    await store.set('session-redis', session, 120);

    expect(redisSet).toHaveBeenCalledWith(
      'vsession:session-redis',
      JSON.stringify(session),
      'EX',
      120,
    );

    expect(await store.get('session-redis')).toBeNull();
  });

  it('debe guardar en memoria cuando falla Redis al guardar', async () => {
    const redisSet = jest
      .fn()
      .mockRejectedValue(new Error('Redis write error'));

    const redisClient = {
      get: jest.fn(),
      set: redisSet,
      del: jest.fn(),
    };

    (store as any).redisClient = redisClient;
    (store as any).isRedisConnected = true;

    await store.set('session-fallback', session, 60);

    const memoryStore = (store as any).memoryStore;

    expect(memoryStore.get('session-fallback')).toEqual(session);

    expect(redisSet).toHaveBeenCalledWith(
      'vsession:session-fallback',
      JSON.stringify(session),
      'EX',
      60,
    );
  });

  // ============================================================
  // REDIS DELETE
  // ============================================================

  it('debe eliminar una sesión de Redis y de memoria', async () => {
    const redisDel = jest.fn().mockResolvedValue(1);

    const redisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: redisDel,
    };

    (store as any).redisClient = redisClient;
    (store as any).isRedisConnected = true;

    await store.set('session-delete', session, 60);

    await store.delete('session-delete');

    expect(redisDel).toHaveBeenCalledWith('vsession:session-delete');

    expect((store as any).memoryStore.has('session-delete')).toBe(false);
  });

  it('debe eliminar de memoria aunque Redis falle al eliminar', async () => {
    const redisDel = jest
      .fn()
      .mockRejectedValue(new Error('Redis delete error'));

    const redisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: redisDel,
    };

    (store as any).redisClient = redisClient;
    (store as any).isRedisConnected = true;

    const memoryStore = (store as any).memoryStore;

    memoryStore.set('session-delete', session);

    await store.delete('session-delete');

    expect(redisDel).toHaveBeenCalledWith('vsession:session-delete');

    expect(memoryStore.has('session-delete')).toBe(false);
  });

  // ============================================================
  // REDIS INVALID JSON
  // ============================================================

  it('debe usar fallback local cuando Redis devuelve JSON inválido', async () => {
    const redisClient = {
      get: jest.fn().mockResolvedValue('{json-invalido'),
      set: jest.fn(),
      del: jest.fn(),
    };

    (store as any).redisClient = redisClient;
    (store as any).isRedisConnected = true;

    const memoryStore = (store as any).memoryStore;

    memoryStore.set('session-invalid-json', session);

    const result = await store.get('session-invalid-json');

    expect(result).toEqual(session);
  });

  // ============================================================
  // REDIS INACTIVO
  // ============================================================

  it('debe usar memoria aunque exista redisClient pero no esté conectado', async () => {
    const redisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    (store as any).redisClient = redisClient;
    (store as any).isRedisConnected = false;

    await store.set('session-memory', session, 60);

    expect(redisClient.set).not.toHaveBeenCalled();

    expect(await store.get('session-memory')).toEqual(session);
  });

  // ============================================================
  // DATA INTEGRITY
  // ============================================================

  it('debe conservar todos los datos de la sesión', async () => {
    const completeSession: VideoSession = {
      user_id: 99,
      lesson_id: 123,
      fingerprint: 'abc-123',
      created_at: 5000,
      last_activity: 7000,
    };

    await store.set('complete', completeSession, 300);

    const result = await store.get('complete');

    expect(result).toEqual(completeSession);
  });
});
