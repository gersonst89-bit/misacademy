import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResenasController } from './resenas.controller';
import { ResenasService } from './resenas.service';
import { ResenasRepository } from './resenas.repository';
import { Resena } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Resena])],
  controllers: [ResenasController],
  providers: [ResenasService, ResenasRepository],
})
export class ResenasModule {}
