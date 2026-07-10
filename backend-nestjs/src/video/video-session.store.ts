import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

export interface VideoSession {
  user_id: number;
  lesson_id: number;
  fingerprint?: string;
  created_at: number;
  last_activity: number;
}

@Injectable()
export class VideoSessionStore {
  private readonly logger = new Logger('VideoSessionStore');
  private readonly memoryStore = new Map<string, VideoSession>();
  private redisClient: Redis | null = null;
  private isRedisConnected = false;

  constructor() {
    const redisHost = process.env.REDIS_HOST;

    if (redisHost) {
      this.logger.log(`Inicializando almacén de sesiones de video en Redis (${redisHost})...`);
      try {
        this.redisClient = new Redis({
          host: redisHost,
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          lazyConnect: true,
        });

        this.redisClient.on('connect', () => {
          this.isRedisConnected = true;
          this.logger.log('Conexión con Redis establecida con éxito.');
        });

        this.redisClient.on('error', (err) => {
          this.isRedisConnected = false;
          this.logger.warn(`Error de conexión con Redis: ${err.message}. Usando memoria local de fallback.`);
        });

        this.redisClient.connect().catch((err) => {
          this.isRedisConnected = false;
          this.logger.warn(`Conexión inicial fallida con Redis: ${err.message}. Usando memoria local de fallback.`);
        });
      } catch (err: any) {
        this.isRedisConnected = false;
        this.logger.warn(`Error al instanciar Redis client: ${err.message}. Usando memoria local de fallback.`);
      }
    } else {
      this.logger.log('No se detectó configuración de REDIS_HOST. Almacenando sesiones de video en memoria local.');
    }
  }


  async get(id: string): Promise<VideoSession | null> {
    if (this.redisClient && this.isRedisConnected) {
      try {
        const raw = await this.redisClient.get(`vsession:${id}`);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (err: any) {
        this.logger.warn(`Error al leer sesión de video de Redis: ${err.message}. Consultando fallback local.`);
      }
    }
    return this.memoryStore.get(id) || null;
  }

  async set(id: string, session: VideoSession, ttlSeconds: number): Promise<void> {
    if (this.redisClient && this.isRedisConnected) {
      try {
        await this.redisClient.set(
          `vsession:${id}`,
          JSON.stringify(session),
          'EX',
          ttlSeconds
        );
        return;
      } catch (err: any) {
        this.logger.warn(`Error al guardar sesión de video en Redis: ${err.message}. Guardando en fallback local.`);
      }
    }
    this.memoryStore.set(id, session);
  }

  async delete(id: string): Promise<void> {
    if (this.redisClient && this.isRedisConnected) {
      try {
        await this.redisClient.del(`vsession:${id}`);
      } catch (err: any) {
        this.logger.warn(`Error al eliminar sesión de video de Redis: ${err.message}.`);
      }
    }
    this.memoryStore.delete(id);
  }

  async clearExpired(maxAgeMs: number): Promise<void> {
    const now = Date.now();
    for (const [id, sess] of this.memoryStore.entries()) {
      if (now - sess.last_activity > maxAgeMs) {
        this.memoryStore.delete(id);
      }
    }
  }
}
