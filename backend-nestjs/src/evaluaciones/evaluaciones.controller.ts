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
  Req,
} from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import {
  CreateEvaluacionDto,
  UpdateEvaluacionDto,
  CreatePreguntaDto,
  UpdatePreguntaDto,
  CreateOpcionDto,
  UpdateOpcionDto,
  IniciarEvaluacionDto,
  SaveAnswerDto,
  SubmitEvaluacionDto,
} from './dto/evaluaciones.dto';
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
  checkEligibility(@Param('courseId') id: string, @CurrentUser() u: Usuario) {
    return this.svc.checkEligibility(id, u.id_usuario);
  }

  @Get('courses/:courseId/evaluation/info')
  @UseGuards(JwtAuthGuard)
  getInfo(@Param('courseId') id: string, @CurrentUser() u: Usuario) {
    return this.svc.getEvaluationInfo(id, u.id_usuario);
  }

  @Post('evaluaciones/:courseId/iniciar')
  @UseGuards(JwtAuthGuard)
  iniciar(
    @Param('courseId') id: string,
    @CurrentUser() u: Usuario,
    @Req() req: Request,
  ) {
    return this.svc.iniciar(
      id,
      u.id_usuario,
      req.ip || '',
      req.headers['user-agent'] || '',
    );
  }

  @Get('evaluation-sessions/:sessionId/resume')
  @UseGuards(JwtAuthGuard)
  resume(@Param('sessionId') id: number) {
    return this.svc.resumeSession(id);
  }

  @Post('evaluation-sessions/:sessionId/answers')
  @UseGuards(JwtAuthGuard)
  saveAnswer(@Param('sessionId') id: number, @Body() dto: SaveAnswerDto) {
    return this.svc.saveAnswer(id, dto);
  }

  @Post('evaluation-sessions/:sessionId/answers/batch')
  @UseGuards(JwtAuthGuard)
  saveBatch(@Param('sessionId') id: number, @Body('answers') answers: any[]) {
    return this.svc.saveAnswersBatch(id, answers);
  }

  @Post('evaluation-sessions/:sessionId/heartbeat')
  @UseGuards(JwtAuthGuard)
  heartbeat(@Param('sessionId') id: number) {
    return { status: 'ok', session_id: id };
  }

  @Post('evaluation-sessions/:sessionId/events')
  @UseGuards(JwtAuthGuard)
  events(@Param('sessionId') id: number) {
    return { status: 'ok' };
  }

  @Post('evaluation-sessions/:sessionId/submit')
  @UseGuards(JwtAuthGuard)
  submit(@Param('sessionId') id: number, @Body() dto: SubmitEvaluacionDto) {
    return this.svc.submit(id, dto);
  }

  @Get('evaluaciones/intentos/:intentoId')
  @UseGuards(JwtAuthGuard)
  getIntento(@Param('intentoId') id: number) {
    return this.svc.getIntento(id);
  }

  @Get('evaluaciones/curso/:cursoId')
  findByCurso(@Param('cursoId') id: string) {
    return this.svc.findByCurso(id);
  }
}

// Public/Student endpoints
@Controller('preguntas')
export class PreguntasPublicController {
  constructor(private readonly svc: EvaluacionesService) {}
  @Get('evaluacion/:evalId') findByEval(@Param('evalId') id: number) {
    return this.svc.findPreguntas(id);
  }
}

@Controller('opciones-respuesta')
export class OpcionesPublicController {
  constructor(private readonly svc: EvaluacionesService) {}
  @Get('pregunta/:preguntaId') findByPregunta(@Param('preguntaId') id: number) {
    return this.svc.findOpciones(id);
  }
}

