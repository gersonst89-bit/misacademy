import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcionDto, UpdateInscripcionDto } from './dto/inscripciones.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';

@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly svc: InscripcionesService) {}
  @Get('mis-inscripciones') @UseGuards(JwtAuthGuard) mine(@CurrentUser() u: Usuario) { return this.svc.findByUsuario(u.id_usuario); }
  @Get(':id') @UseGuards(JwtAuthGuard) findById(@Param('id') id: number) { return this.svc.findById(id); }
}

@Controller('admin/inscripciones')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminInscripcionesController {
  constructor(private readonly svc: InscripcionesService) {}
  @Get() findAll(@Query('page') p?: number) { return this.svc.findAll(p); }
  @Post() create(@Body() dto: CreateInscripcionDto) { return this.svc.create(dto); }
  @Get(':id') findById(@Param('id') id: number) { return this.svc.findById(id); }
  @Put(':id') update(@Param('id') id: number, @Body() dto: UpdateInscripcionDto) { return this.svc.update(id, dto); }
  @Delete(':id') delete(@Param('id') id: number) { return this.svc.delete(id); }
}
