import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PagosController,
  TiposPagoController,
  ComprasController,
} from './pagos.controller';
import { PagosService } from './pagos.service';
import { PagosRepository } from './pagos.repository';
import {
  Pago,
  DetallePago,
  TipoPago,
  Inscripcion,
  RutaAcademica,
  InscripcionRuta,
} from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pago,
      DetallePago,
      TipoPago,
      Inscripcion,
      RutaAcademica,
      InscripcionRuta,
    ]),
  ],
  controllers: [PagosController, TiposPagoController, ComprasController],
  providers: [PagosService, PagosRepository],
  exports: [PagosService],
})
export class PagosModule {}
