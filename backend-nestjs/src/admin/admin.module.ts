import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AdminUsuariosController,
  AdminAuthLogsController,
  AdminMaterialesController,
  AdminReclamacionesController,
} from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { Usuario, AuthenticationLog, Material, Pago, Reclamacion } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, AuthenticationLog, Material, Pago, Reclamacion]),
  ],
  controllers: [
    AdminUsuariosController,
    AdminAuthLogsController,
    AdminMaterialesController,
    AdminReclamacionesController,
  ],
  providers: [AdminService, AdminRepository],
})
export class AdminModule {}
