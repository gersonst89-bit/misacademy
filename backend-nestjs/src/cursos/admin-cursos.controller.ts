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
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../common/utils/multer.config';
import { CursosService } from './cursos.service';
import {
  CreateCursoDto,
  UpdateCursoDto,
  CambiarEstadoDto,
} from './dto/cursos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOrDocenteGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';

@Controller('admin/cursos')
@UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
export class AdminCursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.cursosService.findAll(query);
  }

  @Post()
  @UseInterceptors(FileInterceptor('imagen', multerOptions))
  create(
    @Body() dto: CreateCursoDto,
    @CurrentUser() user: Usuario,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      dto.imagen = `storage/cursos/${file.filename}`;
    }
    return this.cursosService.create(dto, user.id_usuario);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.findById(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('imagen', multerOptions))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCursoDto,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      dto.imagen = `storage/cursos/${file.filename}`;
    }
    return this.cursosService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.delete(id);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoDto,
  ) {
    return this.cursosService.cambiarEstado(id, dto);
  }
}
