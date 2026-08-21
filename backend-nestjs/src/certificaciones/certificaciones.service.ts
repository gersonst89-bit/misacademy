import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CertificacionesRepository } from './certificaciones.repository';
import { CreateCertificacionDto } from './dto/certificaciones.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import QRCode = require('qrcode');

@Injectable()
export class CertificacionesService {
  constructor(
    private readonly repo: CertificacionesRepository,
    private readonly notificacionesService: NotificacionesService,
  ) {}
  async findAll(
    page = 1,
    perPage = 20,
    tipoCertificado?: string,
    programa?: string,
    cursoId?: number,
  ) {
    return this.repo.findAll(page, perPage, tipoCertificado, programa, cursoId);
  }
  async findProgramas() {
    return this.repo.findProgramas();
  }
  async findById(id: number) {
    const c = await this.repo.findById(id);
    if (!c)
      throw new HttpException(
        'Certificación no encontrada',
        HttpStatus.NOT_FOUND,
      );
    return c;
  }
  async findByUsuario(userId: number) {
    return this.repo.findByUsuario(userId);
  }
  async buscarPorCodigo(codigo: string) {
    const c = await this.repo.findByCodigo(codigo);
    if (!c)
      throw new HttpException(
        'Certificado no encontrado',
        HttpStatus.NOT_FOUND,
      );
    return c;
  }
  async buscar(query: string, tipo?: string) {
    return this.repo.buscar(query, tipo);
  }
  async create(dto: CreateCertificacionDto, idUsuarioAdministrador: number) {
    const validacion = await this.validarDniMismatch(dto);

    const cert = await this.repo.create(dto);

    try {
      await this.notificacionesService.crear(
        idUsuarioAdministrador,
        `Se registró el certificado ${cert.codigo_certificado}.`,
      );
    } catch (error) {
      console.error('Error creando notificación del certificado:', error);
    }

    return {
      ...cert,
      dni_mismatch: validacion.dni_mismatch,
      warning: validacion.warning,
      usuario_dni: validacion.usuario_dni,
    };
  }
  async update(id: number, dto: any) {
    const actual = await this.findById(id);

    const dataValidar = {
      ...actual,
      ...dto,
      id_usuario: dto.id_usuario ?? actual.id_usuario,
      dni_estudiante: dto.dni_estudiante ?? actual.dni_estudiante,
    };

    const validacion = await this.validarDniMismatch(dataValidar);
    const cert = await this.repo.update(id, dto);

    return {
      ...cert,
      dni_mismatch: validacion.dni_mismatch,
      warning: validacion.warning,
      usuario_dni: validacion.usuario_dni,
    };
  }

  async delete(id: number) {
    await this.repo.delete(id);
    return { message: 'Certificación eliminada' };
  }

  async verificarAprobacion(userId: number, cursoId: number): Promise<boolean> {
    return this.repo.tieneIntentoAprobado(userId, cursoId);
  }

  private async validarDniMismatch(data: any) {
    if (!data.id_usuario) {
      return {
        dni_mismatch: false,
        warning: null,
        usuario_dni: null,
      };
    }

    const usuario = await this.repo.findUsuarioById(Number(data.id_usuario));

    if (!usuario) {
      return {
        dni_mismatch: false,
        warning: null,
        usuario_dni: null,
      };
    }

    const usuarioDni = usuario.dni ? String(usuario.dni).trim() : null;

    const certificadoDni = data.dni_estudiante
      ? String(data.dni_estudiante).trim()
      : null;

    if (!usuarioDni || !certificadoDni) {
      return {
        dni_mismatch: false,
        warning: null,
        usuario_dni: usuarioDni,
      };
    }

    const hayMismatch = usuarioDni !== certificadoDni;

    return {
      dni_mismatch: hayMismatch,
      warning: hayMismatch
        ? 'El DNI del certificado no coincide con el DNI registrado del usuario.'
        : null,
      usuario_dni: usuarioDni,
    };
  }

  async obtenerOCrear(userId: number, cursoId: number) {
    return this.repo.obtenerOCrear(userId, cursoId);
  }

  async obtenerQr(codigo: string): Promise<Buffer> {
    const certificado = await this.repo.findByCodigo(codigo.trim());

    if (!certificado) {
      throw new HttpException(
        'Certificado no encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    const frontendUrl =
      process.env.FRONTEND_URL || 'https://misacademyonline.com';

    const url = `${frontendUrl}/consulta?codigo=${encodeURIComponent(
      certificado.codigo_certificado,
    )}`;

    return QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
    });
  }
}
