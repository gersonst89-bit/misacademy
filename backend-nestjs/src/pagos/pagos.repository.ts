import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePagoDto, CreateTipoPagoDto } from './dto/pagos.dto';
import { Pago } from '../entities/pago.entity';
import { DetallePago } from '../entities/detalle-pago.entity';
import { TipoPago } from '../entities/tipo-pago.entity';
import { Inscripcion } from '../entities/inscripcion.entity';
import { InscripcionRuta } from '../entities/inscripcion-ruta.entity';
import { RutaAcademica } from '../entities/ruta-academica.entity';

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
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(InscripcionRuta)
    private readonly inscripcionRutaRepo: Repository<InscripcionRuta>,
    @InjectRepository(RutaAcademica)
    private readonly rutaRepo: Repository<RutaAcademica>,
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
        relations: ['curso'],
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
        relations: ['curso'],
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

    if (estado === 'Completado') {
      const detalles = await this.detalleRepo.find({ where: { id_pago: id } });
      const pago = await this.pagoRepo.findOne({ where: { id_pago: id } });
      console.log(`[PAGOS] Activando Pago #${id}. Usuario: ${pago?.id_usuario}. Detalles: ${detalles.length}`);
      
      if (!pago) return null;

      for (const detalle of detalles) {
        if (detalle.id_curso) {
          const exists = await this.inscripcionRepo.findOne({
            where: { id_usuario: pago.id_usuario, id_curso: detalle.id_curso },
          });
          if (!exists) {
            await this.inscripcionRepo.save(
              this.inscripcionRepo.create({
                id_usuario: pago.id_usuario,
                id_curso: detalle.id_curso,
                precio_pagado: detalle.subtotal,
                estado: 'Activo',
                fecha_inscripcion: new Date(),
              }),
            );
          }
        }

        if (detalle.id_ruta) {
          const existsRuta = await this.inscripcionRutaRepo.findOne({
            where: { id_usuario: pago.id_usuario, id_ruta: detalle.id_ruta },
          });
          if (!existsRuta) {
            await this.inscripcionRutaRepo.save(
              this.inscripcionRutaRepo.create({
                id_usuario: pago.id_usuario,
                id_ruta: detalle.id_ruta,
                precio_pagado: detalle.subtotal,
                estado: 'Activo',
                fecha_inscripcion: new Date(),
              }),
            );
          }

          const ruta = await this.rutaRepo.findOne({
            where: { id_ruta: detalle.id_ruta },
            relations: ['cursos'],
          });
          if (ruta?.cursos) {
            for (const curso of ruta.cursos) {
              const existsCurso = await this.inscripcionRepo.findOne({
                where: {
                  id_usuario: pago.id_usuario,
                  id_curso: curso.id_curso,
                },
              });
              if (!existsCurso) {
                await this.inscripcionRepo.save(
                  this.inscripcionRepo.create({
                    id_usuario: pago.id_usuario,
                    id_curso: curso.id_curso,
                    precio_pagado: 0,
                    estado: 'Activo',
                    fecha_inscripcion: new Date(),
                  }),
                );
              }
            }
          }
        }
      }
    }

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

  async findHistorial(userId: number) {
    const [inscripciones, inscripcionesRutas] = await Promise.all([
      this.inscripcionRepo.find({
        where: { id_usuario: userId },
        relations: ['curso'],
        order: { fecha_inscripcion: 'DESC' },
      }),
      this.inscripcionRutaRepo.find({
        where: { id_usuario: userId },
        relations: ['ruta', 'ruta.cursos', 'ruta.lineaAcademica'],
        order: { fecha_inscripcion: 'DESC' },
      }),
    ]);

    const comprasCursos = inscripciones.map((ins) => ({
      id_pago: ins.id_inscripcion,
      fecha_pago: ins.fecha_inscripcion.toISOString(),
      precio: ins.precio_pagado,
      curso: {
        id_curso: ins.curso?.id_curso,
        nombre: ins.curso?.nombre,
        descripcion: ins.curso?.descripcion_corta || ins.curso?.descripcion,
        imagen: ins.curso?.imagen,
      },
    }));

    const comprasRutas = inscripcionesRutas.map((ins) => ({
      id_pago: ins.id_inscripcion_ruta,
      fecha_pago: ins.fecha_inscripcion.toISOString(),
      precio: ins.precio_pagado,
      ruta: {
        id_ruta: ins.ruta?.id_ruta,
        nombre: ins.ruta?.nombre,
        descripcion: ins.ruta?.descripcion,
        imagen: ins.ruta?.imagen,
        cursos_ids: ins.ruta?.cursos?.map((c) => c.id_curso) || [],
        linea_slug: ins.ruta?.lineaAcademica?.slug || 'ruta',
      },
    }));

    return { status: 'success', compras: [...comprasCursos, ...comprasRutas] };
  }
}
