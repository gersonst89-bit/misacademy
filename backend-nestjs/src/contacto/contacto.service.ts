import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { MailerService } from '@nestjs-modules/mailer';
import { Contacto } from '../entities/contacto.entity';
import { Reclamacion } from '../entities/reclamacion.entity';

@Injectable()
export class ContactoService {
  private readonly logger = new Logger(ContactoService.name);

  constructor(
    @InjectRepository(Contacto)
    private readonly contactoRepo: Repository<Contacto>,
    @InjectRepository(Reclamacion)
    private readonly reclamacionRepo: Repository<Reclamacion>,
    // private readonly mailerService: MailerService,
  ) {}

  async createContacto(data: any) {
    const contacto = (await this.contactoRepo.save(
      this.contactoRepo.create({
        ...(data as Partial<Contacto>),
        fecha_envio: new Date(),
      }),
    )) as Contacto;

    const fecha = contacto.fecha_envio
      ? new Date(contacto.fecha_envio).toLocaleString('es-PE', { timeZone: 'America/Lima' })
      : new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });

    const contactoMail = {
      to: 'mattinnovasolution@hotmail.com',
      subject: `📧 Nuevo Mensaje de Contacto — ${contacto.nombre} ${contacto.apellido}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">📧 NUEVO MENSAJE DE CONTACTO</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">Un usuario ha enviado una solicitud de información</p>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #ffffff; margin-top: 0; font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; font-weight: 700;">Detalles del Contacto</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; width: 150px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Nombre Completo:</td>
                <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; font-weight: bold;">${contacto.nombre} ${contacto.apellido}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Fecha y Hora:</td>
                <td style="padding: 8px 0; color: #f8fafc; font-size: 14px;">${fecha} (PE)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email de Contacto:</td>
                <td style="padding: 8px 0; color: #0ea5e9; font-size: 14px; font-weight: 600;"><a href="mailto:${contacto.email}" style="color: #0ea5e9; text-decoration: none;">${contacto.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Asunto:</td>
                <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">${contacto.asunto}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;">
              <h3 style="margin-top: 0; color: #ffffff; font-size: 14px; font-weight: 700;">Mensaje:</h3>
              <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; margin-bottom: 0; white-space: pre-wrap;">${contacto.mensaje}</p>
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
            Este es un correo automático generado por la plataforma <strong>MIS Academy</strong>.
          </div>
        </div>
      `,
    };

    this.logger.warn(
      `Mailer temporalmente desactivado. Correo de contacto preparado para ${contactoMail.to} con asunto: ${contactoMail.subject}`,
    );

    return contacto;
  }

  async createReclamacion(data: any) {
    const reclamacion = (await this.reclamacionRepo.save(
      this.reclamacionRepo.create(data as Partial<Reclamacion>),
    )) as Reclamacion;

    const fecha = reclamacion.created_at
      ? new Date(reclamacion.created_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })
      : new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });

    const reclamacionMail = {
      to: 'libroreclamaciones@mattinnovasolution.com',
      subject: `📝 Nueva Reclamación Registrada — N° ${reclamacion.id}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #ef4444, #b91c1c); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">📝 LIBRO DE RECLAMACIONES</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">Nueva reclamación recibida en la plataforma</p>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #ffffff; margin-top: 0; font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; font-weight: 700;">Detalles de la Solicitud</h2>

            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; width: 150px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">ID Reclamación:</td>
                <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; font-weight: bold;">REC-${String(reclamacion.id).padStart(5, '0')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Fecha y Hora:</td>
                <td style="padding: 8px 0; color: #f8fafc; font-size: 14px;">${fecha} (PE)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Remitente:</td>
                <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">${reclamacion.nombre_completo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">DNI:</td>
                <td style="padding: 8px 0; color: #f8fafc; font-size: 14px;">${reclamacion.dni}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email Remitente:</td>
                <td style="padding: 8px 0; color: #0ea5e9; font-size: 14px; font-weight: 600;"><a href="mailto:${reclamacion.email}" style="color: #0ea5e9; text-decoration: none;">${reclamacion.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Tipo de Reclamo:</td>
                <td style="padding: 8px 0; color: #ef4444; font-size: 14px; font-weight: 700; text-transform: uppercase;">${reclamacion.tipo_reclamo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Asunto:</td>
                <td style="padding: 8px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">${reclamacion.asunto}</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;">
              <h3 style="margin-top: 0; color: #ffffff; font-size: 14px; font-weight: 700;">Descripción del Reclamo/Queja:</h3>
              <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; margin-bottom: 0; white-space: pre-wrap;">${reclamacion.descripcion}</p>
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
            Este es un correo automático generado por la plataforma <strong>MIS Academy</strong>.
          </div>
        </div>
      `,
    };

    this.logger.warn(
      `Mailer temporalmente desactivado. Correo de reclamación preparado para ${reclamacionMail.to} con asunto: ${reclamacionMail.subject}`,
    );

    return reclamacion;
  }
}