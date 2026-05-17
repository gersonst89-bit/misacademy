import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { UpdatePerfilDto } from './dto/perfil.dto';

@Injectable()
export class PerfilService {
  constructor(
    @InjectRepository(Usuario) private readonly repo: Repository<Usuario>,
  ) {}

  async getProfile(userId: number) {
    const u = await this.repo.findOne({
      where: { id_usuario: userId },
      relations: ['rol'],
    });
    if (!u)
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    return u;
  }

  async updateProfile(
    userId: number,
    dto: UpdatePerfilDto,
    imagenPerfil?: string,
  ) {
    const data: Partial<Usuario> = { ...dto };
    if (imagenPerfil) data.imagen_perfil = imagenPerfil;
    await this.repo.update({ id_usuario: userId }, data);
    return this.getProfile(userId);
  }
}
