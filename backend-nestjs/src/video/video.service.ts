import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { VideoHeartbeatDto } from './dto/video.dto';
import { Leccion } from '../entities/leccion.entity';
import { Inscripcion } from '../entities/inscripcion.entity';
import { DetallePago } from '../entities/detalle-pago.entity';

interface VideoSession {
  user_id: number;
  lesson_id: number;
  fingerprint?: string;
  created_at: number;
  last_activity: number;
}

@Injectable()
export class VideoService {
  private sessions = new Map<string, VideoSession>();

  constructor(
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

    const key =
      process.env.VIDEO_ENCRYPTION_KEY || 'DiZuqhWkHpzeTgFfd1wfRZwYUU2Gxphd';
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(key),
      Buffer.alloc(16, 0),
    );
    let encrypted = cipher.update(videoId, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const secret =
      process.env.VIDEO_JWT_SECRET || '8kJ3nF9dL2pQw7xR5tY6vB1mN4cH0sA9';
    const ttl = parseInt(process.env.VIDEO_TOKEN_TTL || '3600', 10);
    const accessToken = this.jwtService.sign(
      { sub: userId, lesson_id: leccionId, video_id: videoId },
      { secret, expiresIn: ttl },
    );

    const sessionId = 'vs_' + crypto.randomBytes(8).toString('hex');
    this.sessions.set(sessionId, {
      user_id: userId,
      lesson_id: leccionId,
      fingerprint,
      created_at: Date.now(),
      last_activity: Date.now(),
    });

    return {
      access_token: accessToken,
      encrypted_video_id: encrypted,
      session_id: sessionId,
      expires_in: ttl,
      player_config: {
        type: 'videojs',
        controls: ['play', 'pause', 'seek', 'volume'],
        protection: { disableRightClick: true, detectDevTools: true },
      },
    };
  }

  heartbeat(data: VideoHeartbeatDto) {
    const session = this.sessions.get(data.session_id ?? '');
    if (!session)
      throw new HttpException('Sesión no encontrada', HttpStatus.UNAUTHORIZED);

    if (data.fingerprint && data.fingerprint !== session.fingerprint) {
      this.sessions.delete(data.session_id ?? '');
      throw new HttpException('Fingerprint inválido', HttpStatus.FORBIDDEN);
    }

    session.last_activity = Date.now();
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
