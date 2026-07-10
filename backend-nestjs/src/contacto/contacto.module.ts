import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactoController } from './contacto.controller';
import { ContactoService } from './contacto.service';
import { Contacto, Reclamacion } from '../entities';
@Module({
  imports: [TypeOrmModule.forFeature([Contacto, Reclamacion])],
  controllers: [ContactoController],
  providers: [ContactoService],
})
export class ContactoModule {}
