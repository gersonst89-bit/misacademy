import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from '../entities/notificacion.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
  ) {}

  async listar() {
    return this.notificacionRepository.find({
      order: {
        fecha_creacion: 'DESC',
      },
    });
  }

  async crear(idUsuario: number, mensaje: string) {
    const notificacion = this.notificacionRepository.create({
      id_usuario: idUsuario,
      mensaje,
      leido: false,
      fecha_creacion: new Date(),
    });

    return this.notificacionRepository.save(notificacion);
  }
}
