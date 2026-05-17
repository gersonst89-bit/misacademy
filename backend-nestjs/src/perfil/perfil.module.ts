import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilController } from './perfil.controller';
import { PerfilService } from './perfil.service';
import { Usuario } from '../entities';
@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [PerfilController],
  providers: [PerfilService],
})
export class PerfilModule {}
