import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateResenaDto, UpdateResenaDto } from './dto/resenas.dto';
import { Resena } from '../entities/resena.entity';

@Injectable()
export class ResenasRepository {
  constructor(
    @InjectRepository(Resena) private readonly repo: Repository<Resena>,
  ) {}

  async findByCurso(cursoId: number) {
    return this.repo.find({
      where: { id_curso: cursoId },
      relations: ['usuario'],
      order: { fecha_resena: 'DESC' },
    });
  }

  async findByUsuario(userId: number) {
    return this.repo.find({
      where: { id_usuario: userId },
      relations: ['curso'],
      order: { fecha_resena: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.repo.findOne({
      where: { id_resena: id },
      relations: ['usuario', 'curso'],
    });
  }

  async create(userId: number, data: CreateResenaDto) {
    return this.repo.save(
      this.repo.create({
        ...data,
        id_usuario: userId,
        fecha_resena: new Date(),
      }),
    );
  }

  async update(id: number, data: UpdateResenaDto) {
    await this.repo.update({ id_resena: id }, data);
    return this.findById(id);
  }

  async delete(id: number) {
    await this.repo.delete({ id_resena: id });
  }
}
