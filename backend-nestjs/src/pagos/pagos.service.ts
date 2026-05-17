import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PagosRepository } from './pagos.repository';
import {
  CreatePagoDto,
  UpdatePagoDto,
  CreateTipoPagoDto,
} from './dto/pagos.dto';

@Injectable()
export class PagosService {
  constructor(private readonly pagosRepo: PagosRepository) {}

  async findAll(
    page?: number,
    perPage?: number,
    estado?: string,
    fecha_inicio?: string,
    fecha_fin?: string,
  ) {
    return this.pagosRepo.findAll(page, perPage, {
      estado,
      fecha_inicio,
      fecha_fin,
    });
  }

  async findById(id: number) {
    const p = await this.pagosRepo.findById(id);
    if (!p) throw new HttpException('Pago no encontrado', HttpStatus.NOT_FOUND);
    return p;
  }

  async findByUsuario(userId: number) {
    return this.pagosRepo.findByUsuario(userId);
  }

  async create(userId: number, dto: CreatePagoDto) {
    return this.pagosRepo.create(userId, dto);
  }

  async updateEstado(id: number, dto: UpdatePagoDto) {
    return this.pagosRepo.updateEstado(id, dto.estado!, dto.observaciones);
  }

  async delete(id: number) {
    await this.pagosRepo.delete(id);
    return { message: 'Pago eliminado' };
  }

  async findAllTipos() {
    return this.pagosRepo.findAllTipos();
  }

  async createTipo(dto: CreateTipoPagoDto) {
    return this.pagosRepo.createTipo(dto);
  }

  async updateTipo(id: number, dto: Partial<CreateTipoPagoDto>) {
    return this.pagosRepo.updateTipo(id, dto);
  }

  async deleteTipo(id: number) {
    await this.pagosRepo.deleteTipo(id);
    return { message: 'Tipo eliminado' };
  }

  async findHistorial(userId: number) {
    return this.pagosRepo.findHistorial(userId);
  }
}
