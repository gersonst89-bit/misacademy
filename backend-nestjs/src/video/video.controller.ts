import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { GetVideoTokenDto, VideoHeartbeatDto } from './dto/video.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';

@Controller()
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private readonly svc: VideoService) {}

  @Get('video-token/:id')
  getToken(
    @Param('id') id: number,
    @CurrentUser() u: Usuario,
    @Body() dto: GetVideoTokenDto,
  ) {
    return this.svc.getVideoToken(
      id,
      u.id_usuario,
      dto.fingerprint || 'default',
    );
  }

  @Post('video-session/heartbeat')
  heartbeat(@Body() dto: VideoHeartbeatDto) {
    return this.svc.heartbeat(dto);
  }
}
