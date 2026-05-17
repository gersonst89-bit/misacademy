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
import { LineasAcademicasService } from './lineas-academicas.service';
import {
  CreateLineaDto,
  UpdateLineaDto,
  CreateRutaDto,
  UpdateRutaDto,
} from './dto/lineas-academicas.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/roles.guard';

@Controller('lineas-academicas')
export class LineasAcademicasController {
  constructor(private readonly svc: LineasAcademicasService) {}
  @Get() findAll(@Query() q: any) {
    return this.svc.findAllLineas(q);
  }
  @Get('slug/:slug') findBySlug(@Param('slug') s: string) {
    return this.svc.findLineaBySlug(s);
  }
  @Get(':id') findById(@Param('id') id: number) {
    return this.svc.findLineaById(id);
  }
  @Post() @UseGuards(JwtAuthGuard, AdminGuard) create(
    @Body() dto: CreateLineaDto,
  ) {
    return this.svc.createLinea(dto);
  }
  @Put(':id') @UseGuards(JwtAuthGuard, AdminGuard) update(
    @Param('id') id: number,
    @Body() dto: UpdateLineaDto,
  ) {
    return this.svc.updateLinea(id, dto);
  }
  @Delete(':id') @UseGuards(JwtAuthGuard, AdminGuard) delete(
    @Param('id') id: number,
  ) {
    return this.svc.deleteLinea(id);
  }
}

@Controller('rutas-academicas')
export class RutasAcademicasController {
  constructor(private readonly svc: LineasAcademicasService) {}
  @Get() findAll(@Query() q: any) {
    return this.svc.findAllRutas(q);
  }
  @Get('destacadas') destacadas(@Query('limit') l?: number) {
    return this.svc.findRutasDestacadas(l);
  }
  @Get('buscar') buscar(@Query('q') q: string, @Query('page') p?: number) {
    return this.svc.buscarRutas(q, p);
  }
  @Get(':id') findById(@Param('id') id: number) {
    return this.svc.findRutaById(id);
  }
  @Post() @UseGuards(JwtAuthGuard, AdminGuard) create(
    @Body() dto: CreateRutaDto,
  ) {
    return this.svc.createRuta(dto);
  }
  @Put(':id') @UseGuards(JwtAuthGuard, AdminGuard) update(
    @Param('id') id: number,
    @Body() dto: UpdateRutaDto,
  ) {
    return this.svc.updateRuta(id, dto);
  }
  @Delete(':id') @UseGuards(JwtAuthGuard, AdminGuard) delete(
    @Param('id') id: number,
  ) {
    return this.svc.deleteRuta(id);
  }
}
