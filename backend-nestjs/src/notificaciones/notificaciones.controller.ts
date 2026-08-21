import { Controller, Get, UseGuards } from '@nestjs/common';

import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  async listar() {
    const data = await this.notificacionesService.listar();

    return {
      data,
    };
  }
}
