import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CertificacionesController,
  AdminCertificacionesController,
} from './certificaciones.controller';
import { CertificacionesService } from './certificaciones.service';
import { CertificacionesRepository } from './certificaciones.repository';
import { Certificacion } from '../entities';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Certificacion]), NotificacionesModule],
  controllers: [CertificacionesController, AdminCertificacionesController],
  providers: [CertificacionesService, CertificacionesRepository],
})
export class CertificacionesModule {}
