import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Usuario } from '../entities/usuario.entity';
import { ResenasService } from './resenas.service';
import { CreateResenaDto, UpdateResenaDto } from './dto/resenas.dto';

@Controller('resenas')
export class ResenasController {
  constructor(private readonly svc: ResenasService) {}

  @Get('curso/:cursoId')
  findByCurso(@Param('cursoId') id: number) {
    return this.svc.findByCurso(id);
  }

  @Get('mis-resenas')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() u: Usuario) {
    return this.svc.findByUsuario(u.id_usuario);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() u: Usuario, @Body() dto: CreateResenaDto) {
    return this.svc.create(u.id_usuario, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: number, @Body() dto: UpdateResenaDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: number) {
    return this.svc.delete(id);
  }
}
