import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ModulosRepository } from './modulos.repository';
import { CreateModuloDto, UpdateModuloDto } from './dto/modulos.dto';

@Injectable()
export class ModulosService {
  constructor(private readonly modulosRepo: ModulosRepository) {}
  async findByCurso(cursoId: number) {
    return this.modulosRepo.findByCurso(cursoId);
  }
  async findById(id: number) {
    const mod = await this.modulosRepo.findById(id);
    if (!mod)
      throw new HttpException('Módulo no encontrado', HttpStatus.NOT_FOUND);
    return mod;
  }
  async findAll(
    page?: number,
    perPage?: number,
    query?: string,
    id_curso?: number,
    estado?: string,
  ) {
    return this.modulosRepo.findAll(page, perPage, { query, id_curso, estado });
  }
  async create(dto: CreateModuloDto) {
    return this.modulosRepo.create(dto);
  }
  async update(id: number, dto: UpdateModuloDto) {
    return this.modulosRepo.update(id, dto);
  }
  async delete(id: number) {
    await this.modulosRepo.delete(id);
    return { message: 'Módulo eliminado' };
  }
}
