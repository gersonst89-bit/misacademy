import { Controller, Get, UseGuards } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';

@Controller('mis-cursos')
export class MisCursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getMisCursos(@CurrentUser() user: Usuario) {
    return this.cursosService.getMisCursos(user.id_usuario);
  }
}
