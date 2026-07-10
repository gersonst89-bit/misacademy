import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  EvaluacionesController,
  PreguntasPublicController,
  OpcionesPublicController,
} from './evaluaciones.controller';
import {
  AdminEvaluacionesController,
  AdminPreguntasController,
  AdminOpcionesController,
} from './admin-evaluaciones.controller';
import { EvaluacionesService } from './evaluaciones.service';
import { EvaluacionesRepository } from './evaluaciones.repository';
import {
  Evaluacion,
  Pregunta,
  OpcionRespuesta,
  IntentoEvaluacion,
  RespuestaUsuario,
  Inscripcion,
  ProgresoEstudiante,
  Modulo,
  Leccion,
} from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Evaluacion,
      Pregunta,
      OpcionRespuesta,
      IntentoEvaluacion,
      RespuestaUsuario,
      Inscripcion,
      ProgresoEstudiante,
      Modulo,
      Leccion,
    ]),
  ],
  controllers: [
    EvaluacionesController,
    AdminEvaluacionesController,
    AdminPreguntasController,
    AdminOpcionesController,
    PreguntasPublicController,
    OpcionesPublicController,
  ],
  providers: [EvaluacionesService, EvaluacionesRepository],
  exports: [EvaluacionesService],
})
export class EvaluacionesModule {}
