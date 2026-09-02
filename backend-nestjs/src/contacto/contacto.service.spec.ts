import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer';

import { ContactoService } from './contacto.service';
import { Contacto } from '../entities/contacto.entity';
import { Reclamacion } from '../entities/reclamacion.entity';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('ContactoService', () => {
  let service: ContactoService;

  let contactoRepo: {
    create: jest.Mock;
    save: jest.Mock;
  };

  let reclamacionRepo: {
    create: jest.Mock;
    save: jest.Mock;
  };

  let configService: {
    get: jest.Mock;
  };

  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    sendMailMock = jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
    });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const values: Record<string, any> = {
          MAIL_HOST: 'smtp.test.com',
          MAIL_PORT: 465,
          MAIL_USERNAME: 'usuario@test.com',
          MAIL_PASSWORD: 'password-test',
          MAIL_FROM_NAME: 'MIS Academy Test',
          MAIL_FROM_ADDRESS: 'noreply@test.com',
        };

        return values[key] ?? defaultValue;
      }),
    };

    contactoRepo = {
      create: jest.fn((data: any) => data),
      save: jest.fn(),
    };

    reclamacionRepo = {
      create: jest.fn((data: any) => data),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactoService,
        {
          provide: getRepositoryToken(Contacto),
          useValue: contactoRepo,
        },
        {
          provide: getRepositoryToken(Reclamacion),
          useValue: reclamacionRepo,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<ContactoService>(ContactoService);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.test.com',
        port: 465,
        secure: true,
        tls: {
          rejectUnauthorized: false,
        },
        auth: {
          user: 'usuario@test.com',
          pass: 'password-test',
        },
      }),
    );
  });

  // ============================================================
  // CREATE CONTACTO
  // ============================================================

  it('debe crear un contacto y enviar el correo correctamente', async () => {
    const fecha = new Date('2026-08-29T15:00:00.000Z');

    const data = {
      nombre: 'Jair',
      apellido: 'Usuario',
      email: 'jair@test.com',
      asunto: 'Consulta',
      mensaje: 'Quiero información del curso',
    };

    const contacto = {
      id: 1,
      ...data,
      fecha_envio: fecha,
    };

    contactoRepo.save.mockResolvedValue(contacto);

    const result = await service.createContacto(data);

    expect(contactoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Jair',
        apellido: 'Usuario',
        email: 'jair@test.com',
        asunto: 'Consulta',
        mensaje: 'Quiero información del curso',
        fecha_envio: expect.any(Date),
      }),
    );

    expect(contactoRepo.save).toHaveBeenCalled();

    expect(result).toEqual(contacto);

    expect(sendMailMock).toHaveBeenCalledTimes(1);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"MIS Academy Test" <noreply@test.com>',
        to: 'contacto@mattinnovasolution.com',
        subject: '📧 Nuevo Mensaje de Contacto — Jair Usuario',
        html: expect.stringContaining('NUEVO MENSAJE DE CONTACTO'),
      }),
    );
  });

  it('debe conservar los datos recibidos al crear el contacto', async () => {
    const data = {
      nombre: 'Ana',
      apellido: 'Pérez',
      email: 'ana@test.com',
      asunto: 'Información',
      mensaje: 'Necesito información adicional',
      telefono: '999999999',
    };

    const contacto = {
      id: 2,
      ...data,
      fecha_envio: new Date(),
    };

    contactoRepo.save.mockResolvedValue(contacto);

    const result = await service.createContacto(data);

    expect(contactoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...data,
        fecha_envio: expect.any(Date),
      }),
    );

    expect(result).toEqual(contacto);
  });

  it('debe continuar y devolver el contacto aunque falle el envío del correo', async () => {
    const fecha = new Date('2026-08-29T15:00:00.000Z');

    const data = {
      nombre: 'Jair',
      apellido: 'Usuario',
      email: 'jair@test.com',
      asunto: 'Prueba SMTP',
      mensaje: 'Mensaje de prueba',
    };

    const contacto = {
      id: 3,
      ...data,
      fecha_envio: fecha,
    };

    contactoRepo.save.mockResolvedValue(contacto);

    sendMailMock.mockRejectedValue(new Error('SMTP no disponible'));

    const loggerErrorSpy = jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation();

    const result = await service.createContacto(data);

    expect(result).toEqual(contacto);

    expect(contactoRepo.save).toHaveBeenCalled();

    expect(sendMailMock).toHaveBeenCalledTimes(1);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error enviando correo de contacto'),
      expect.any(Error),
    );

    loggerErrorSpy.mockRestore();
  });

  it('debe usar la fecha actual cuando el contacto no trae fecha_envio', async () => {
    const contacto = {
      id: 4,
      nombre: 'Luis',
      apellido: 'Test',
      email: 'luis@test.com',
      asunto: 'Consulta',
      mensaje: 'Hola',
      fecha_envio: undefined,
    };

    contactoRepo.save.mockResolvedValue(contacto);

    await service.createContacto({
      nombre: 'Luis',
      apellido: 'Test',
      email: 'luis@test.com',
      asunto: 'Consulta',
      mensaje: 'Hola',
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Fecha y Hora:'),
      }),
    );
  });

  // ============================================================
  // CREATE RECLAMACION
  // ============================================================

  it('debe crear una reclamación y enviar el correo correctamente', async () => {
    const fecha = new Date('2026-08-29T16:00:00.000Z');

    const data = {
      nombre_completo: 'Jair Usuario',
      dni: '12345678',
      email: 'jair@test.com',
      tipo_reclamo: 'Reclamo',
      asunto: 'Problema con el servicio',
      descripcion: 'Descripción completa del reclamo',
    };

    const reclamacion = {
      id: 25,
      ...data,
      created_at: fecha,
    };

    reclamacionRepo.save.mockResolvedValue(reclamacion);

    const result = await service.createReclamacion(data);

    expect(reclamacionRepo.create).toHaveBeenCalledWith(data);

    expect(reclamacionRepo.save).toHaveBeenCalled();

    expect(result).toEqual(reclamacion);

    expect(sendMailMock).toHaveBeenCalledTimes(1);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"MIS Academy Test" <noreply@test.com>',
        to: 'libroreclamaciones@mattinnovasolution.com',
        subject: '📝 Nueva Reclamación Registrada — N° 25',
        html: expect.stringContaining('LIBRO DE RECLAMACIONES'),
      }),
    );
  });

  it('debe incluir los datos de la reclamación en el correo', async () => {
    const reclamacion = {
      id: 30,
      nombre_completo: 'Ana Pérez',
      dni: '87654321',
      email: 'ana@test.com',
      tipo_reclamo: 'Queja',
      asunto: 'Problema de facturación',
      descripcion: 'Tengo un problema con mi pago',
      created_at: new Date(),
    };

    reclamacionRepo.save.mockResolvedValue(reclamacion);

    await service.createReclamacion({
      nombre_completo: reclamacion.nombre_completo,
      dni: reclamacion.dni,
      email: reclamacion.email,
      tipo_reclamo: reclamacion.tipo_reclamo,
      asunto: reclamacion.asunto,
      descripcion: reclamacion.descripcion,
    });

    const mail = sendMailMock.mock.calls[0][0];

    expect(mail.html).toContain('Ana Pérez');

    expect(mail.html).toContain('87654321');

    expect(mail.html).toContain('ana@test.com');

    expect(mail.html).toContain('Queja');

    expect(mail.html).toContain('Problema de facturación');

    expect(mail.html).toContain('Tengo un problema con mi pago');

    expect(mail.html).toContain('REC-00030');
  });

  it('debe continuar y devolver la reclamación aunque falle el envío del correo', async () => {
    const reclamacion = {
      id: 31,
      nombre_completo: 'Carlos Test',
      dni: '11223344',
      email: 'carlos@test.com',
      tipo_reclamo: 'Reclamo',
      asunto: 'Problema',
      descripcion: 'Descripción',
      created_at: new Date(),
    };

    reclamacionRepo.save.mockResolvedValue(reclamacion);

    sendMailMock.mockRejectedValue(new Error('SMTP no disponible'));

    const loggerErrorSpy = jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation();

    const result = await service.createReclamacion({
      nombre_completo: reclamacion.nombre_completo,
      dni: reclamacion.dni,
      email: reclamacion.email,
      tipo_reclamo: reclamacion.tipo_reclamo,
      asunto: reclamacion.asunto,
      descripcion: reclamacion.descripcion,
    });

    expect(result).toEqual(reclamacion);

    expect(reclamacionRepo.save).toHaveBeenCalled();

    expect(sendMailMock).toHaveBeenCalledTimes(1);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error enviando correo de reclamación'),
      expect.any(Error),
    );
    loggerErrorSpy.mockRestore();
  });

  it('debe usar la fecha actual cuando la reclamación no tiene created_at', async () => {
    const reclamacion = {
      id: 32,
      nombre_completo: 'María Test',
      dni: '99887766',
      email: 'maria@test.com',
      tipo_reclamo: 'Queja',
      asunto: 'Consulta',
      descripcion: 'Consulta de prueba',
      created_at: undefined,
    };

    reclamacionRepo.save.mockResolvedValue(reclamacion);

    await service.createReclamacion({
      nombre_completo: reclamacion.nombre_completo,
      dni: reclamacion.dni,
      email: reclamacion.email,
      tipo_reclamo: reclamacion.tipo_reclamo,
      asunto: reclamacion.asunto,
      descripcion: reclamacion.descripcion,
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Fecha y Hora:'),
      }),
    );
  });

  it('debe usar los valores configurados del correo al construir el transportador', () => {
    expect(configService.get).toHaveBeenCalledWith(
      'MAIL_HOST',
      'smtp.gmail.com',
    );

    expect(configService.get).toHaveBeenCalledWith('MAIL_PORT', 465);

    expect(configService.get).toHaveBeenCalledWith('MAIL_USERNAME');

    expect(configService.get).toHaveBeenCalledWith('MAIL_PASSWORD');
  });
});
