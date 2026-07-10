import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CursosService } from './cursos.service';
import {
  CreateCursoDto,
  UpdateCursoDto,
  CambiarEstadoDto,
} from './dto/cursos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CursoInscripcionGuard } from '../common/guards/curso-inscripcion.guard';
import { AdminGuard, AdminOrDocenteGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';

@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.cursosService.findAll(query);
  }

  @Get('destacados')
  getDestacados(@Query('limit') limit?: number) {
    return this.cursosService.getDestacados(limit);
  }

  @Get('buscar')
  buscar(
    @Query('q') q: string,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    return this.cursosService.buscar(q, page, perPage);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.cursosService.findBySlug(slug);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.findById(id);
  }

  @Get(':id/contenido')
  @UseGuards(JwtAuthGuard, CursoInscripcionGuard)
  getContenido(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Usuario,
  ) {
    return this.cursosService.getContenido(id, user.id_usuario);
  }

  @Get(':id/progreso')
  @UseGuards(JwtAuthGuard, CursoInscripcionGuard)
  getProgreso(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Usuario,
  ) {
    return this.cursosService.getProgreso(id, user.id_usuario);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
  create(@Body() dto: CreateCursoDto, @CurrentUser() user: Usuario) {
    return this.cursosService.create(dto, user.id_usuario);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCursoDto) {
    return this.cursosService.update(id, dto);
  }

  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoDto,
  ) {
    return this.cursosService.cambiarEstado(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.delete(id);
  }
}
