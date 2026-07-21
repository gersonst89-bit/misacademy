import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoCompra } from '../entities/carrito-compra.entity';
import { CarritoItem } from '../entities/carrito-item.entity';
import { Curso } from '../entities/curso.entity';
import { RutaAcademica } from '../entities/ruta-academica.entity';

@Injectable()
export class CarritoRepository {
  constructor(
    @InjectRepository(CarritoCompra)
    private readonly carritoRepo: Repository<CarritoCompra>,
    @InjectRepository(CarritoItem)
    private readonly itemRepo: Repository<CarritoItem>,
    @InjectRepository(Curso) private readonly cursoRepo: Repository<Curso>,
    @InjectRepository(RutaAcademica)
    private readonly rutaRepo: Repository<RutaAcademica>,
  ) {}

  async getOrCreate(userId: number): Promise<CarritoCompra> {
    let carrito = await this.carritoRepo.findOne({
      where: { id_usuario: userId, estado: 'activo' },
    });
    if (!carrito)
      carrito = await this.carritoRepo.save(
        this.carritoRepo.create({
          id_usuario: userId,
          estado: 'activo',
          created_at: new Date(),
        }),
      );
    return carrito;
  }
  async getItems(userId: number) {
    const carrito = await this.getOrCreate(userId);
    return this.itemRepo.find({
      where: { id_carrito: carrito.id_carrito },
      relations: ['curso', 'ruta'],
    });
  }
  async agregarItem(userId: number, cursoId?: number, rutaId?: number) {
    const carrito = await this.getOrCreate(userId);

    if (cursoId) {
      const exists = await this.itemRepo.findOne({
        where: { id_carrito: carrito.id_carrito, id_curso: cursoId },
      });
      if (exists) return exists;
      const curso = await this.cursoRepo.findOne({
        where: { id_curso: cursoId },
      });
      return this.itemRepo.save(
        this.itemRepo.create({
          id_carrito: carrito.id_carrito,
          id_curso: cursoId,
          precio: curso?.precio || 0,
          created_at: new Date(),
        }),
      );
    }

    if (rutaId) {
      const exists = await this.itemRepo.findOne({
        where: { id_carrito: carrito.id_carrito, id_ruta: rutaId },
      });
      if (exists) return exists;
      const ruta = await this.rutaRepo.findOne({ where: { id_ruta: rutaId } });
      return this.itemRepo.save(
        this.itemRepo.create({
          id_carrito: carrito.id_carrito,
          id_ruta: rutaId,
          precio: ruta?.precio || 0,
          created_at: new Date(),
        }),
      );
    }
  }
  async quitarItem(userId: number, itemId: number) {
    const carrito = await this.getOrCreate(userId);
    await this.itemRepo.delete({
      id_carrito: carrito.id_carrito,
      id_item: itemId,
    });
  }
  async vaciar(userId: number) {
    const carrito = await this.getOrCreate(userId);
    await this.itemRepo.delete({ id_carrito: carrito.id_carrito });
  }
}


