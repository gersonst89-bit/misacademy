import { Injectable } from '@nestjs/common';
import { AgregarItemDto } from './dto/carrito.dto';
import { CarritoRepository } from './carrito.repository';

@Injectable()
export class CarritoService {
  constructor(private readonly repo: CarritoRepository) {}
  async getItems(userId: number) {
    return this.repo.getItems(userId);
  }
  async agregar(userId: number, dto: AgregarItemDto) {
    return this.repo.agregarItem(userId, dto.id_curso, dto.id_ruta);
  }
  async quitar(userId: number, itemId: number) {
    await this.repo.quitarItem(userId, itemId);
    return { message: 'Item removido' };
  }
  async vaciar(userId: number) {
    await this.repo.vaciar(userId);
    return { message: 'Carrito vaciado' };
  }
}
