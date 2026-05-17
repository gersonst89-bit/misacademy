import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { LineasAcademicasRepository } from './lineas-academicas.repository';
import {
  CreateLineaDto,
  UpdateLineaDto,
  CreateRutaDto,
  UpdateRutaDto,
} from './dto/lineas-academicas.dto';
export interface QueryDto {
  page?: number;
  per_page?: number;
  estado?: string;
  [key: string]: any;
}

@Injectable()
export class LineasAcademicasService {
  constructor(private readonly repo: LineasAcademicasRepository) {}
  async findAllLineas(q: QueryDto) {
    return this.repo.findAllLineas(q, q.page, q.per_page);
  }
  async findLineaById(id: number) {
    const l = await this.repo.findLineaById(id);
    if (!l)
      throw new HttpException('Línea no encontrada', HttpStatus.NOT_FOUND);
    return l;
  }
  async findLineaBySlug(slug: string) {
    const l = await this.repo.findLineaBySlug(slug);
    if (!l)
      throw new HttpException('Línea no encontrada', HttpStatus.NOT_FOUND);
    return l;
  }
  async createLinea(dto: CreateLineaDto) {
    return this.repo.createLinea(dto);
  }
  async updateLinea(id: number, dto: UpdateLineaDto) {
    return this.repo.updateLinea(id, dto);
  }
  async deleteLinea(id: number) {
    await this.repo.deleteLinea(id);
    return { message: 'Línea eliminada' };
  }
  async findAllRutas(q: QueryDto) {
    return this.repo.findAllRutas(q, q.page, q.per_page);
  }
  async findRutaById(id: number) {
    const r = await this.repo.findRutaById(id);
    if (!r) throw new HttpException('Ruta no encontrada', HttpStatus.NOT_FOUND);
    return r;
  }
  async findRutasDestacadas(limit?: number) {
    return this.repo.findRutasDestacadas(limit);
  }
  async buscarRutas(q: string, page?: number) {
    return this.repo.buscarRutas(q, page);
  }
  async createRuta(dto: CreateRutaDto) {
    return this.repo.createRuta(dto);
  }
  async updateRuta(id: number, dto: UpdateRutaDto) {
    return this.repo.updateRuta(id, dto);
  }
  async deleteRuta(id: number) {
    await this.repo.deleteRuta(id);
    return { message: 'Ruta eliminada' };
  }
}
