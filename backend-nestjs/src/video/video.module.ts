import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { DetallePago, Inscripcion, Leccion } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Leccion, Inscripcion, DetallePago]),
    JwtModule.register({
      secret:
        process.env.VIDEO_JWT_SECRET || '8kJ3nF9dL2pQw7xR5tY6vB1mN4cH0sA9',
    }),
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
