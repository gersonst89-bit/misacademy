import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacionDto, UpdateEvaluacionDto, CreatePreguntaDto, UpdatePreguntaDto, CreateOpcionDto, UpdateOpcionDto, IniciarEvaluacionDto, SaveAnswerDto, SubmitEvaluacionDto } from './dto/evaluaciones.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard, AdminOrDocenteGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Usuario } from '../entities/usuario.entity';
import type { Request } from 'express';

@Controller()
export class EvaluacionesController {
  constructor(private readonly svc: EvaluacionesService) {}

  @Get('courses/:courseId/evaluation/check-eligibility')
  @UseGuards(JwtAuthGuard)
  checkEligibility(@Param('courseId') id: string, @CurrentUser() u: Usuario) { return this.svc.checkEligibility(id, u.id_usuario); }

  @Get('courses/:courseId/evaluation/info')
  @UseGuards(JwtAuthGuard)
  getInfo(@Param('courseId') id: string, @CurrentUser() u: Usuario) { return this.svc.getEvaluationInfo(id, u.id_usuario); }

  @Post('evaluaciones/:courseId/iniciar')
  @UseGuards(JwtAuthGuard)
  iniciar(@Param('courseId') id: string, @CurrentUser() u: Usuario, @Req() req: Request) {
    return this.svc.iniciar(id, u.id_usuario, req.ip || '', req.headers['user-agent'] || '');
  }

  @Get('evaluation-sessions/:sessionId/resume')
  @UseGuards(JwtAuthGuard)
  resume(@Param('sessionId') id: number) { return this.svc.resumeSession(id); }

  @Post('evaluation-sessions/:sessionId/answers')
  @UseGuards(JwtAuthGuard)
  saveAnswer(@Param('sessionId') id: number, @Body() dto: SaveAnswerDto) { return this.svc.saveAnswer(id, dto); }

  @Post('evaluation-sessions/:sessionId/answers/batch')
  @UseGuards(JwtAuthGuard)
  saveBatch(@Param('sessionId') id: number, @Body('answers') answers: any[]) { return this.svc.saveAnswersBatch(id, answers); }

  @Post('evaluation-sessions/:sessionId/heartbeat')
  @UseGuards(JwtAuthGuard)
  heartbeat(@Param('sessionId') id: number) { return { status: 'ok', session_id: id }; }

  @Post('evaluation-sessions/:sessionId/events')
  @UseGuards(JwtAuthGuard)
  events(@Param('sessionId') id: number) { return { status: 'ok' }; }

  @Post('evaluation-sessions/:sessionId/submit')
  @UseGuards(JwtAuthGuard)
  submit(@Param('sessionId') id: number, @Body() dto: SubmitEvaluacionDto) { return this.svc.submit(id, dto); }

  @Get('evaluaciones/intentos/:intentoId')
  @UseGuards(JwtAuthGuard)
  getIntento(@Param('intentoId') id: number) { return this.svc.getIntento(id); }

  @Get('evaluaciones/curso/:cursoId')
  findByCurso(@Param('cursoId') id: string) { return this.svc.findByCurso(id); }
}

// Admin endpoints
@Controller('admin/evaluaciones')
@UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
export class AdminEvaluacionesController {
  constructor(private readonly svc: EvaluacionesService) {}
  @Get() findAll(@Query('page') p?: number) { return this.svc.findAll(p); }
  @Post() create(@Body() dto: CreateEvaluacionDto) { return this.svc.create(dto); }
  @Get(':id') findById(@Param('id') id: number) { return this.svc.findById(id); }
  @Put(':id') update(@Param('id') id: number, @Body() dto: UpdateEvaluacionDto) { return this.svc.update(id, dto); }
  @Delete(':id') delete(@Param('id') id: number) { return this.svc.delete(id); }
}

@Controller('admin/preguntas')
@UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
export class AdminPreguntasController {
  constructor(private readonly svc: EvaluacionesService) {}
  @Get() findAll(@Query() query: any) { 
    const evalId = query.id_evaluacion;
    const p = query.page;
    if (evalId) return this.svc.findPreguntas(Number(evalId));
    return this.svc.findAllPreguntas(p); 
  }
  @Post() create(@Body() dto: CreatePreguntaDto) { return this.svc.createPregunta(dto); }
  @Put(':id') update(@Param('id') id: number, @Body() dto: UpdatePreguntaDto) { return this.svc.updatePregunta(id, dto); }
  @Delete(':id') delete(@Param('id') id: number) { return this.svc.deletePregunta(id); }
}

@Controller('admin/opciones-respuesta')
@UseGuards(JwtAuthGuard, AdminOrDocenteGuard)
export class AdminOpcionesController {
  constructor(private readonly svc: EvaluacionesService) {}
  @Get() findAll(@Query('page') p?: number) { return this.svc.findAllOpciones(p); }
  @Post() create(@Body() dto: CreateOpcionDto) { return this.svc.createOpcion(dto); }
  @Put(':id') update(@Param('id') id: number, @Body() dto: UpdateOpcionDto) { return this.svc.updateOpcion(id, dto); }
  @Delete(':id') delete(@Param('id') id: number) { return this.svc.deleteOpcion(id); }
}

@Controller('preguntas')
export class PreguntasPublicController {
  constructor(private readonly svc: EvaluacionesService) {}
  @Get('evaluacion/:evalId') findByEval(@Param('evalId') id: number) { return this.svc.findPreguntas(id); }
}

@Controller('opciones-respuesta')
export class OpcionesPublicController {
  constructor(private readonly svc: EvaluacionesService) {}
  @Get('pregunta/:preguntaId') findByPregunta(@Param('preguntaId') id: number) { return this.svc.findOpciones(id); }
}
