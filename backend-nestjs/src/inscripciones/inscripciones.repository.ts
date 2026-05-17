import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscripcion } from '../entities/inscripcion.entity';

@Injectable()
export class InscripcionesRepository {
  constructor(@InjectRepository(Inscripcion) private readonly repo: Repository<Inscripcion>) {}
  async findAll(page = 1, perPage = 20) {
    const [data, total] = await this.repo.findAndCount({ relations: ['usuario', 'curso'], skip: (page-1)*perPage, take: perPage, order: { fecha_inscripcion: 'DESC' } });
    return { data, total, current_page: page, per_page: perPage, last_page: Math.ceil(total/perPage) };
  }
  async findById(id: number) { return this.repo.findOne({ where: { id_inscripcion: id }, relations: ['usuario', 'curso'] }); }
  async findByUsuario(userId: number) { return this.repo.find({ where: { id_usuario: userId }, relations: ['curso'] }); }
  async create(data: any) { return this.repo.save(this.repo.create({ ...data, fecha_inscripcion: new Date() })); }
  async update(id: number, data: any) { await this.repo.update({ id_inscripcion: id }, data); return this.findById(id); }
  async delete(id: number) { await this.repo.delete({ id_inscripcion: id }); }
}
