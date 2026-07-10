import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasRepository } from './estadisticas.repository';
import {
  Usuario,
  Curso,
  Inscripcion,
  Pago,
  Certificacion,
  LineaAcademica,
} from '../entities';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Curso,
      Inscripcion,
      Pago,
      Certificacion,
      LineaAcademica,
    ]),
  ],
  controllers: [EstadisticasController],
  providers: [EstadisticasService, EstadisticasRepository],
})
export class EstadisticasModule {}
