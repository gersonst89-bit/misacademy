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
} from '@nestjs/common';
import { ModulosService } from './modulos.service';
import { CreateModuloDto, UpdateModuloDto } from './dto/modulos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOrDocenteGuard } from '../common/guards/roles.guard';

@Controller('modulos')
export class ModulosController {
  constructor(private readonly modulosService: ModulosService) {}
  @Get('curso/:cursoId') findByCurso(@Param('cursoId') cursoId: number) {
    return this.modulosService.findByCurso(cursoId).then((data) => ({ data }));
  }
  @Get(':id') findById(@Param('id') id: number) {
    return this.modulosService.findById(id);
  }
}

@Controller('admin/modulos')
@UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
export class AdminModulosController {
  constructor(private readonly modulosService: ModulosService) {}
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('q') query?: string,
    @Query('id_curso') id_curso?: number,
    @Query('estado') estado?: string,
  ) {
    return this.modulosService.findAll(page, perPage, query, id_curso, estado);
  }
  @Post() create(@Body() dto: CreateModuloDto) {
    return this.modulosService.create(dto);
  }
  @Get(':id') findById(@Param('id') id: number) {
    return this.modulosService.findById(id);
  }
  @Put(':id') update(@Param('id') id: number, @Body() dto: UpdateModuloDto) {
    return this.modulosService.update(id, dto);
  }
  @Delete(':id') delete(@Param('id') id: number) {
    return this.modulosService.delete(id);
  }
}
