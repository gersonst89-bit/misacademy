import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUsuariosController, AdminAuthLogsController, AdminMaterialesController, AuditoriaController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { Usuario, AuthenticationLog, Material, Pago } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, AuthenticationLog, Material, Pago])],
  controllers: [AdminUsuariosController, AdminAuthLogsController, AdminMaterialesController, AuditoriaController],
  providers: [AdminService, AdminRepository],
})
export class AdminModule {}
