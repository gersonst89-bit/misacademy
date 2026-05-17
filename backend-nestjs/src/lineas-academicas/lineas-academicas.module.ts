import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  LineasAcademicasController,
  RutasAcademicasController,
} from './lineas-academicas.controller';
import { LineasAcademicasService } from './lineas-academicas.service';
import { LineasAcademicasRepository } from './lineas-academicas.repository';
import { LineaAcademica, RutaAcademica } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([LineaAcademica, RutaAcademica])],
  controllers: [LineasAcademicasController, RutasAcademicasController],
  providers: [LineasAcademicasService, LineasAcademicasRepository],
})
export class LineasAcademicasModule {}
