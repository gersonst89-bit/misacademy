import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeccionesController, AdminLeccionesController } from './lecciones.controller';
import { LeccionesService } from './lecciones.service';
import { LeccionesRepository } from './lecciones.repository';
import { Leccion } from '../entities/leccion.entity';
import { ComentarioLeccion } from '../entities/comentario-leccion.entity';
import { ProgresoEstudiante } from '../entities/progreso-estudiante.entity';
import { Inscripcion } from '../entities/inscripcion.entity';
import { Modulo } from '../entities/modulo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Leccion, ComentarioLeccion, ProgresoEstudiante, Inscripcion, Modulo])],
  controllers: [LeccionesController, AdminLeccionesController],
  providers: [LeccionesService, LeccionesRepository],
  exports: [LeccionesService],
})
export class LeccionesModule {}
