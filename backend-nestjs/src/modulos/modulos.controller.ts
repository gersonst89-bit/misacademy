import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { ModulosService } from './modulos.service';
import { CreateModuloDto, UpdateModuloDto } from './dto/modulos.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOrDocenteGuard } from '../common/guards/roles.guard';

@Controller('modulos')
export class ModulosController {
  constructor(private readonly modulosService: ModulosService) {}

  @Get('curso/:cursoId')
  findByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.modulosService.findByCurso(cursoId).then((data) => ({ data }));
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.modulosService.findById(id);
  }
}

@Controller('admin/modulos')
@UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
export class AdminModulosController {
  constructor(private readonly modulosService: ModulosService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('per_page', new DefaultValuePipe(20), ParseIntPipe)
    perPage: number,

    @Query('q') query?: string,
    @Query('id_curso') idCurso?: string,
    @Query('estado') estado?: string,
  ) {
    const parsedCursoId = idCurso ? Number(idCurso) : undefined;

    return this.modulosService.findAll(
      page,
      perPage,
      query,
      parsedCursoId,
      estado,
    );
  }

  @Get('check-order')
  checkOrder(
    @Query('id_curso', ParseIntPipe) idCurso: number,
    @Query('orden', ParseIntPipe) orden: number,
    @Query('exclude_id') excludeId?: string,
  ) {
    return this.modulosService
      .existsByCursoAndOrden(
        idCurso,
        orden,
        excludeId ? Number(excludeId) : undefined,
      )
      .then((exists) => ({ exists }));
  }

  @Post()
  create(@Body() dto: CreateModuloDto) {
    return this.modulosService.create(dto);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.modulosService.findById(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModuloDto) {
    return this.modulosService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.modulosService.delete(id);
  }
}
