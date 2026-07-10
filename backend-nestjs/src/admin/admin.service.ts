import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import {
  CreateUsuarioDto,
  UpdateUsuarioDto,
  CreateMaterialDto,
  UpdateMaterialDto,
} from './dto/admin.dto';
@Injectable()
export class AdminService {
  constructor(private readonly repo: AdminRepository) {}
  async findAllUsuarios(q: any) {
    return this.repo.findAllUsuarios(q, q.page, q.per_page);
  }
  async createUsuario(dto: CreateUsuarioDto) {
    return this.repo.createUsuario(dto);
  }
  async updateUsuario(id: number, dto: UpdateUsuarioDto) {
    return this.repo.updateUsuario(id, dto);
  }
  async deactivateUsuario(id: number) {
    await this.repo.deactivateUsuario(id);
    return { message: 'Usuario desactivado exitosamente' };
  }
  async forceDeleteUsuario(id: number, currentUserId: number) {
    if (id === currentUserId)
      throw new HttpException(
        'No puedes eliminar tu propio usuario',
        HttpStatus.FORBIDDEN,
      );

    const pagos = await this.repo.getPagosByUsuario(id);
    if (pagos && pagos.length > 0) {
      throw new HttpException(
        {
          message:
            'No se puede eliminar definitivamente. Este usuario tiene compras registradas.',
          has_pagos: true,
          pagos: pagos,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.repo.deleteUsuario(id);
    return { message: 'Usuario eliminado permanentemente' };
  }
  async getAuthLogs(page?: number) {
    return this.repo.getAuthLogs(page);
  }
  async findAllMateriales(page?: number) {
    return this.repo.findAllMateriales(page);
  }
  async createMaterial(dto: CreateMaterialDto) {
    return this.repo.createMaterial(dto);
  }
  async updateMaterial(id: number, dto: UpdateMaterialDto) {
    return this.repo.updateMaterial(id, dto);
  }
  async deleteMaterial(id: number) {
    await this.repo.deleteMaterial(id);
    return { message: 'Material eliminado' };
  }
}
