import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { VideoSessionStore } from './video-session.store';
import { DetallePago, Inscripcion, Leccion } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Leccion, Inscripcion, DetallePago]),
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.VIDEO_JWT_SECRET;
        if (!secret) {
          throw new Error('VIDEO_JWT_SECRET env variable is required but not set');
        }
        return {
          secret,
        };
      },
    }),
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoSessionStore],
  exports: [VideoSessionStore],
})
export class VideoModule {}

