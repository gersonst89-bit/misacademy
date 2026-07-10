import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoController } from './carrito.controller';
import { CarritoService } from './carrito.service';
import { CarritoRepository } from './carrito.repository';
import { CarritoCompra, CarritoItem, Curso, RutaAcademica } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CarritoCompra,
      CarritoItem,
      Curso,
      RutaAcademica,
    ]),
  ],
  controllers: [CarritoController],
  providers: [CarritoService, CarritoRepository],
})
export class CarritoModule {}
