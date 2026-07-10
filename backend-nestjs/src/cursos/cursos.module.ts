import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursosController } from './cursos.controller';
import { MisCursosController } from './mis-cursos.controller';
import { AdminCursosController } from './admin-cursos.controller';
import { CursosService } from './cursos.service';
import { CursosRepository } from './cursos.repository';
import { Curso } from '../entities/curso.entity';
import { Modulo } from '../entities/modulo.entity';
import { Leccion } from '../entities/leccion.entity';
import { Inscripcion } from '../entities/inscripcion.entity';
import { ProgresoEstudiante } from '../entities/progreso-estudiante.entity';
import { Resena } from '../entities/resena.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Curso,
      Modulo,
      Leccion,
      Inscripcion,
      ProgresoEstudiante,
      Resena,
    ]),
  ],
  controllers: [CursosController, MisCursosController, AdminCursosController],
  providers: [CursosService, CursosRepository],
  exports: [CursosService, CursosRepository],
})
export class CursosModule {}
