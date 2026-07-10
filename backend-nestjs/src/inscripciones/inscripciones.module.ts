import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  InscripcionesController,
  AdminInscripcionesController,
} from './inscripciones.controller';
import { InscripcionesService } from './inscripciones.service';
import { InscripcionesRepository } from './inscripciones.repository';
import { Inscripcion } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Inscripcion])],
  controllers: [InscripcionesController, AdminInscripcionesController],
  providers: [InscripcionesService, InscripcionesRepository],
  exports: [InscripcionesService],
})
export class InscripcionesModule {}
