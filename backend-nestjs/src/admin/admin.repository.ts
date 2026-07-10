import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { AuthenticationLog } from '../entities/authentication-log.entity';
import { Material } from '../entities/material.entity';
import { Pago } from '../entities/pago.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(AuthenticationLog)
    private readonly authLogRepo: Repository<AuthenticationLog>,
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
    @InjectRepository(Pago) private readonly pagoRepo: Repository<Pago>,
  ) {}

  // Usuarios
  async findAllUsuarios(filters: any = {}, page = 1, perPage = 50) {
    const qb = this.usuarioRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.rol', 'r');
    if (filters.search) {
      qb.andWhere(
        '(u.nombre LIKE :s OR u.apellido LIKE :s OR u.email LIKE :s OR u.dni LIKE :s)',
        { s: `%${filters.search}%` },
      );
    }
    if (filters.estado)
      qb.andWhere('u.estado = :estado', { estado: filters.estado });
    if (filters.id_rol) qb.andWhere('u.id_rol = :rol', { rol: filters.id_rol });
    qb.orderBy('u.id_usuario', 'DESC');
    const [data, total] = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();
    data.forEach((u) => delete (u as any).password);
    return {
      data,
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    };
  }
  async createUsuario(data: any) {
    data.password = await bcrypt.hash(data.password, 10);
    if (!data.email_verificado) data.email_verificado = false;
    const u = await this.usuarioRepo.save(
      this.usuarioRepo.create({ ...data, fecha_registro: new Date() }),
    );
    delete (u as any).password;
    return u;
  }
  async updateUsuario(id: number, data: any) {
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    else delete data.password;
    await this.usuarioRepo.update({ id_usuario: id }, data);
    const u = await this.usuarioRepo.findOne({
      where: { id_usuario: id },
      relations: ['rol'],
    });
    if (u) delete (u as any).password;
    return u;
  }
  async deactivateUsuario(id: number) {
    await this.usuarioRepo.update({ id_usuario: id }, { estado: 'Inactivo' });
  }
  async deleteUsuario(id: number) {
    await this.usuarioRepo.delete({ id_usuario: id });
  }
  async getPagosByUsuario(id: number) {
    return this.pagoRepo.find({
      where: { id_usuario: id },
      relations: ['detalles', 'detalles.curso'],
    });
  }

  // Auth Logs
  async getAuthLogs(page = 1, perPage = 50) {
    const [data, total] = await this.authLogRepo.findAndCount({
      order: { login_at: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return {
      data,
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    };
  }

  // Materiales
  async findAllMateriales(page = 1, perPage = 20) {
    const [data, total] = await this.materialRepo.findAndCount({
      relations: ['modulo', 'curso'],
      skip: (page - 1) * perPage,
      take: perPage,
      order: { id_material: 'DESC' },
    });
    return {
      data,
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    };
  }
  async findMaterialById(id: number) {
    return this.materialRepo.findOne({
      where: { id_material: id },
      relations: ['modulo'],
    });
  }
  async createMaterial(data: any) {
    return this.materialRepo.save(this.materialRepo.create(data));
  }
  async updateMaterial(id: number, data: any) {
    await this.materialRepo.update({ id_material: id }, data);
    return this.findMaterialById(id);
  }
  async deleteMaterial(id: number) {
    await this.materialRepo.delete({ id_material: id });
  }
}
