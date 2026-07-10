import { Injectable, HttpException, HttpStatus, ForbiddenException, Logger } from '@nestjs/common';
import { PagosRepository } from './pagos.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreatePagoDto,
  UpdatePagoDto,
  CreateTipoPagoDto,
} from './dto/pagos.dto';
import { Inscripcion } from '../entities/inscripcion.entity';
import { InscripcionRuta } from '../entities/inscripcion-ruta.entity';
import { RutaAcademica } from '../entities/ruta-academica.entity';
import { Curso } from '../entities/curso.entity';
import { Usuario } from '../entities/usuario.entity';

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);

  constructor(
    private readonly pagosRepo: PagosRepository,
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(InscripcionRuta)
    private readonly inscripcionRutaRepo: Repository<InscripcionRuta>,
    @InjectRepository(RutaAcademica)
    private readonly rutaRepo: Repository<RutaAcademica>,
  ) {}

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

  async findById(id: number, currentUser?: Usuario) {
    const p = await this.pagosRepo.findById(id);
    if (!p) throw new HttpException('Pago no encontrado', HttpStatus.NOT_FOUND);

    // Verificar propiedad: solo el dueño del pago o un admin puede verlo
    if (currentUser) {
      const isAdmin = currentUser.rol?.nombre_rol?.toLowerCase() === 'administrador';
      if (!isAdmin && p.id_usuario !== currentUser.id_usuario) {
        throw new ForbiddenException('No tienes permiso para ver este pago.');
      }
    }

    return p;
  }

  async findByUsuario(userId: number) {
    return this.pagosRepo.findByUsuario(userId);
  }

  async create(userId: number, dto: CreatePagoDto) {
    return this.pagosRepo.create(userId, dto);
  }

  async updateEstado(id: number, dto: UpdatePagoDto) {
    const pago = await this.pagosRepo.updateEstado(id, dto.estado!, dto.observaciones);

    if (dto.estado === 'Completado' && pago) {
      const detalles = pago.detalles || [];
      this.logger.log(
        `[PAGOS] Activando Pago #${id}. Usuario: ${pago.id_usuario}. Detalles: ${detalles.length}`,
      );

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

    return pago;
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

    const comprasCursos = inscripciones.map((ins: Inscripcion) => ({
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

    const comprasRutas = inscripcionesRutas.map((ins: InscripcionRuta) => ({
      id_pago: ins.id_inscripcion_ruta,
      fecha_pago: ins.fecha_inscripcion.toISOString(),
      precio: ins.precio_pagado,
      ruta: {
        id_ruta: ins.ruta?.id_ruta,
        nombre: ins.ruta?.nombre,
        descripcion: ins.ruta?.descripcion,
        imagen: ins.ruta?.imagen,
        cursos_ids: ins.ruta?.cursos?.map((c: Curso) => c.id_curso) || [],
        linea_slug: ins.ruta?.lineaAcademica?.slug || 'ruta',
      },
    }));

    return { status: 'success', compras: [...comprasCursos, ...comprasRutas] };
  }
}
