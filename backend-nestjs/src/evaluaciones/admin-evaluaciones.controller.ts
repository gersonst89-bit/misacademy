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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../common/utils/multer.config';
import { EvaluacionesService } from './evaluaciones.service';
import {
  CreateEvaluacionDto,
  UpdateEvaluacionDto,
  CreatePreguntaDto,
  UpdatePreguntaDto,
  CreateOpcionDto,
  UpdateOpcionDto,
} from './dto/evaluaciones.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOrDocenteGuard } from '../common/guards/roles.guard';

@Controller('admin/evaluaciones')
@UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
export class AdminEvaluacionesController {
  constructor(private readonly svc: EvaluacionesService) {}

  @Get()
  findAll(@Query('page') p?: number) {
    return this.svc.findAll(p);
  }

  @Post()
  create(@Body() dto: CreateEvaluacionDto) {
    return this.svc.create(dto);
  }

  @Get(':id')
  findById(@Param('id') id: number) {
    return this.svc.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateEvaluacionDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.svc.delete(id);
  }
}

@Controller('admin/preguntas')
@UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
export class AdminPreguntasController {
  constructor(private readonly svc: EvaluacionesService) {}

  @Get()
  findAll(@Query() query: any) {
    const evalId = query.id_evaluacion;
    const p = query.page;
    if (evalId) return this.svc.findPreguntas(Number(evalId));
    return this.svc.findAllPreguntas(p);
  }

  @Post()
  create(@Body() dto: CreatePreguntaDto) {
    return this.svc.createPregunta(dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('imagen_pregunta', multerOptions))
  uploadImage(@UploadedFile() file: any) {
    return {
      url: `storage/preguntas/${file.filename}`
    };
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdatePreguntaDto) {
    return this.svc.updatePregunta(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.svc.deletePregunta(id);
  }
}

@Controller('admin/opciones-respuesta')
@UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
export class AdminOpcionesController {
  constructor(private readonly svc: EvaluacionesService) {}

  @Get()
  findAll(@Query('page') p?: number) {
    return this.svc.findAllOpciones(p);
  }

  @Post()
  create(@Body() dto: CreateOpcionDto) {
    return this.svc.createOpcion(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateOpcionDto) {
    return this.svc.updateOpcion(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.svc.deleteOpcion(id);
  }
}

