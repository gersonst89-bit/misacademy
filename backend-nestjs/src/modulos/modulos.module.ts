import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ModulosController,
  AdminModulosController,
} from './modulos.controller';
import { ModulosService } from './modulos.service';
import { ModulosRepository } from './modulos.repository';
import { Modulo } from '../entities/modulo.entity';
import { Leccion } from '../entities/leccion.entity';
import { Material } from '../entities/material.entity';

import { ComentarioLeccion } from '../entities/comentario-leccion.entity';
import { ProgresoEstudiante } from '../entities/progreso-estudiante.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Modulo,
      Leccion,
      Material,
      ComentarioLeccion,
      ProgresoEstudiante,
    ]),
  ],
  controllers: [ModulosController, AdminModulosController],
  providers: [ModulosService, ModulosRepository],
  exports: [ModulosService],
})
export class ModulosModule {}
