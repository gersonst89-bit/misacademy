import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePagoDto, CreateTipoPagoDto } from './dto/pagos.dto';
import { Pago } from '../entities/pago.entity';
import { DetallePago } from '../entities/detalle-pago.entity';
import { TipoPago } from '../entities/tipo-pago.entity';

type PagoFilters = {
  estado?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
};

type CreatePagoPayload = CreatePagoDto & {
  cursos?: { id_curso: number; precio: number }[];
  rutas?: { id_ruta: number; precio: number }[];
};

type PagoWithDetails = Pago & { detalles?: DetallePago[] };

@Injectable()
export class PagosRepository {
  constructor(
    @InjectRepository(Pago) private readonly pagoRepo: Repository<Pago>,
    @InjectRepository(DetallePago)
    private readonly detalleRepo: Repository<DetallePago>,
    @InjectRepository(TipoPago) private readonly tipoRepo: Repository<TipoPago>,
  ) {}

  async findAll(page = 1, perPage = 20, filters: PagoFilters = {}) {
    const qb = this.pagoRepo.createQueryBuilder('p');
    qb.leftJoinAndSelect('p.usuario', 'u');
    qb.leftJoinAndSelect('p.tipo_pago', 't');

    if (filters.estado) {
      qb.andWhere('p.estado = :est', { est: filters.estado });
    }

    if (filters.fecha_inicio) {
      qb.andWhere('p.fecha_pago >= :inicio', { inicio: filters.fecha_inicio });
    }

    if (filters.fecha_fin) {
      qb.andWhere('p.fecha_pago <= :fin', { fin: filters.fecha_fin });
    }

    qb.orderBy('p.fecha_pago', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    const mappedData = data.map((p) => ({
      ...p,
      monto: p.monto_total,
    }));

    return {
      data: mappedData,
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    };
  }

  async findById(id: number): Promise<PagoWithDetails | null> {
    const pago = await this.pagoRepo.findOne({
      where: { id_pago: id },
      relations: ['usuario'],
    });
    if (pago) {
      pago.detalles = await this.detalleRepo.find({
        where: { id_pago: id },
        relations: ['curso', 'ruta'],
      });
    }
    return pago;
  }

  async findByUsuario(userId: number): Promise<PagoWithDetails[]> {
    const pagos = await this.pagoRepo.find({
      where: { id_usuario: userId },
      order: { fecha_pago: 'DESC' },
    });
    for (const pago of pagos) {
      pago.detalles = await this.detalleRepo.find({
        where: { id_pago: pago.id_pago },
        relations: ['curso', 'ruta'],
      });
    }
    return pagos;
  }

  async create(
    userId: number,
    data: CreatePagoPayload,
  ): Promise<PagoWithDetails | null> {
    const pago = await this.pagoRepo.save(
      this.pagoRepo.create({
        ...data,
        id_usuario: userId,
        estado: 'Pendiente',
        fecha_pago: new Date(),
      }) as Partial<Pago>,
    );

    if (data.cursos?.length) {
      for (const curso of data.cursos) {
        await this.detalleRepo.save(
          this.detalleRepo.create({
            id_pago: pago.id_pago,
            id_curso: curso.id_curso,
            precio_unitario: curso.precio,
            subtotal: curso.precio,
          }),
        );
      }
    }

    if (data.rutas?.length) {
      for (const ruta of data.rutas) {
        await this.detalleRepo.save(
          this.detalleRepo.create({
            id_pago: pago.id_pago,
            id_ruta: ruta.id_ruta,
            precio_unitario: ruta.precio,
            subtotal: ruta.precio,
          }),
        );
      }
    }

    return this.findById(pago.id_pago);
  }

  async updateEstado(
    id: number,
    estado: string,
    obs?: string,
  ): Promise<PagoWithDetails | null> {
    await this.pagoRepo.update(
      { id_pago: id },
      { estado, observaciones: obs, fecha_verificacion: new Date() },
    );
    return this.findById(id);
  }

  async delete(id: number) {
    await this.pagoRepo.delete({ id_pago: id });
  }

  async findAllTipos() {
    return this.tipoRepo.find();
  }

  async findTipoById(id: number) {
    return this.tipoRepo.findOne({ where: { id_tipo_pago: id } });
  }

  async createTipo(data: CreateTipoPagoDto) {
    return this.tipoRepo.save(this.tipoRepo.create(data));
  }

  async updateTipo(id: number, data: Partial<CreateTipoPagoDto>) {
    await this.tipoRepo.update({ id_tipo_pago: id }, data);
    return this.findTipoById(id);
  }

  async deleteTipo(id: number) {
    await this.tipoRepo.delete({ id_tipo_pago: id });
  }

}
