import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { VideoHeartbeatDto } from './dto/video.dto';
import { Leccion } from '../entities/leccion.entity';
import { Inscripcion } from '../entities/inscripcion.entity';
import { DetallePago } from '../entities/detalle-pago.entity';
import { VideoSessionStore, VideoSession } from './video-session.store';

@Injectable()
export class VideoService {
  constructor(
    private readonly sessions: VideoSessionStore,
    @InjectRepository(Leccion)
    private readonly leccionRepo: Repository<Leccion>,
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(DetallePago)
    private readonly detalleRepo: Repository<DetallePago>,
    private readonly jwtService: JwtService,
  ) {}

  async getVideoToken(leccionId: number, userId: number, fingerprint: string) {
    const leccion = await this.leccionRepo.findOne({
      where: { id_leccion: leccionId },
      relations: ['modulo'],
    });
    if (!leccion)
      throw new HttpException('Lección no encontrada', HttpStatus.NOT_FOUND);

    const cursoId = leccion.modulo?.id_curso;
    if (!cursoId)
      throw new HttpException(
        'No se pudo determinar el curso',
        HttpStatus.NOT_FOUND,
      );

    const inscripcion = await this.inscripcionRepo.findOne({
      where: { id_usuario: userId, id_curso: cursoId, estado: 'Activo' },
    });
    if (!inscripcion) {
      const inscComp = await this.inscripcionRepo.findOne({
        where: { id_usuario: userId, id_curso: cursoId, estado: 'Completado' },
      });
      if (!inscComp)
        throw new HttpException(
          'No tienes inscripción activa en el curso',
          HttpStatus.FORBIDDEN,
        );
    }

    const videoUrl = leccion.url_video || '';
    const videoId = this.extractVideoId(videoUrl);
    if (!videoId)
      throw new HttpException('Video no disponible', HttpStatus.NOT_FOUND);

    const key = process.env.VIDEO_ENCRYPTION_KEY;
    if (!key || key.length !== 32) {
      throw new Error('VIDEO_ENCRYPTION_KEY must be set and exactly 32 characters long');
    }

    // IV aleatorio por operación (16 bytes), se antepone al resultado cifrado
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(key),
      iv,
    );
    let encrypted = cipher.update(videoId, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Formato: iv_hex:encrypted_hex  (el frontend/player lo separa para descifrar)
    const encryptedPayload = iv.toString('hex') + ':' + encrypted;

    const videoJwtSecret = process.env.VIDEO_JWT_SECRET;
    if (!videoJwtSecret) {
      throw new Error('VIDEO_JWT_SECRET env variable is required but not set');
    }
    const ttl = parseInt(process.env.VIDEO_TOKEN_TTL || '3600', 10);
    const accessToken = this.jwtService.sign(
      { sub: userId, lesson_id: leccionId, video_id: videoId },
      { secret: videoJwtSecret, expiresIn: ttl },
    );

    const sessionId = 'vs_' + crypto.randomBytes(8).toString('hex');
    await this.sessions.set(
      sessionId,
      {
        user_id: userId,
        lesson_id: leccionId,
        fingerprint,
        created_at: Date.now(),
        last_activity: Date.now(),
      },
      ttl,
    );

    return {
      access_token: accessToken,
      encrypted_video_id: encryptedPayload,
      session_id: sessionId,
      expires_in: ttl,
      player_config: {
        type: 'videojs',
        controls: ['play', 'pause', 'seek', 'volume'],
        protection: { disableRightClick: true, detectDevTools: true },
      },
    };
  }

  async heartbeat(data: VideoHeartbeatDto) {
    const session = await this.sessions.get(data.session_id ?? '');
    if (!session)
      throw new HttpException('Sesión no encontrada', HttpStatus.UNAUTHORIZED);

    if (data.fingerprint && data.fingerprint !== session.fingerprint) {
      await this.sessions.delete(data.session_id ?? '');
      throw new HttpException('Fingerprint inválido', HttpStatus.FORBIDDEN);
    }

    session.last_activity = Date.now();
    const ttl = parseInt(process.env.VIDEO_TOKEN_TTL || '3600', 10);
    await this.sessions.set(data.session_id ?? '', session, ttl);

    // Limpiar sesiones expiradas en memoria (más de 2 horas sin actividad)
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    await this.sessions.clearExpired(TWO_HOURS);

    return { message: 'Sesión válida' };
  }

  private extractVideoId(url: string): string {
    if (!url) return '';
    if (url.includes('youtube.com/watch')) {
      const parts = url.split('v=');
      return parts[1]?.split('&')[0] || '';
    }
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      return parts[1]?.split('?')[0] || '';
    }
    if (url.includes('youtube.com/embed/')) {
      const parts = url.split('embed/');
      return parts[1]?.split('?')[0] || '';
    }
    return url;
  }
}
