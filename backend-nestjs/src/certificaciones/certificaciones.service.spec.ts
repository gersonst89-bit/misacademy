import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';

import { CertificacionesService } from './certificaciones.service';
import { CertificacionesRepository } from './certificaciones.repository';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

jest.mock('qrcode', () => ({
  toBuffer: jest.fn(),
}));

import QRCode = require('qrcode');

describe('CertificacionesService', () => {
  let service: CertificacionesService;

  let repo: {
    findAll: jest.Mock;
    findProgramas: jest.Mock;
    findById: jest.Mock;
    findByUsuario: jest.Mock;
    findByCodigo: jest.Mock;
    buscar: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    tieneIntentoAprobado: jest.Mock;
    obtenerOCrear: jest.Mock;
    findUsuarioById: jest.Mock;
  };

  let notificacionesService: {
    crear: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    repo = {
      findAll: jest.fn(),
      findProgramas: jest.fn(),
      findById: jest.fn(),
      findByUsuario: jest.fn(),
      findByCodigo: jest.fn(),
      buscar: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      tieneIntentoAprobado: jest.fn(),
      obtenerOCrear: jest.fn(),
      findUsuarioById: jest.fn(),
    };

    notificacionesService = {
      crear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificacionesService,
        {
          provide: CertificacionesRepository,
          useValue: repo,
        },
        {
          provide: NotificacionesService,
          useValue: notificacionesService,
        },
      ],
    }).compile();

    service = module.get<CertificacionesService>(CertificacionesService);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // FIND ALL
  // ============================================================

  it('debe devolver todas las certificaciones con filtros', async () => {
    const expected = {
      data: [
        {
          id_certificacion: 1,
          codigo_certificado: 'CERT-ABC123',
        },
      ],
      total: 1,
      currentPage: 1,
      perPage: 20,
      lastPage: 1,
    };

    repo.findAll.mockResolvedValue(expected);

    const result = await service.findAll(
      1,
      20,
      'adicional',
      'Programa A',
      681,
      'Jair',
    );

    expect(result).toEqual(expected);

    expect(repo.findAll).toHaveBeenCalledWith(
      1,
      20,
      'adicional',
      'Programa A',
      681,
      'Jair',
    );
  });

  // ============================================================
  // PROGRAMAS
  // ============================================================

  it('debe devolver los programas disponibles', async () => {
    const programas = ['Programa A', 'Programa B'];

    repo.findProgramas.mockResolvedValue(programas);

    const result = await service.findProgramas();

    expect(result).toEqual(programas);
    expect(repo.findProgramas).toHaveBeenCalled();
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe devolver una certificación existente', async () => {
    const certificacion = {
      id_certificacion: 10,
      codigo_certificado: 'CERT-ABC123',
      id_usuario: 20,
    };

    repo.findById.mockResolvedValue(certificacion);

    const result = await service.findById(10);

    expect(result).toEqual(certificacion);
    expect(repo.findById).toHaveBeenCalledWith(10);
  });

  it('debe rechazar una certificación inexistente', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById(999)).rejects.toThrow(
      'Certificación no encontrada',
    );

    expect(repo.findById).toHaveBeenCalledWith(999);
  });

  // ============================================================
  // FIND BY USER
  // ============================================================

  it('debe devolver las certificaciones de un usuario', async () => {
    const certificaciones = [
      {
        id_certificacion: 1,
        id_usuario: 10,
        codigo_certificado: 'CERT-001',
      },
    ];

    repo.findByUsuario.mockResolvedValue(certificaciones);

    const result = await service.findByUsuario(10);

    expect(result).toEqual(certificaciones);
    expect(repo.findByUsuario).toHaveBeenCalledWith(10);
  });

  // ============================================================
  // FIND BY CODE
  // ============================================================

  it('debe encontrar un certificado por código', async () => {
    const certificado = {
      id_certificacion: 1,
      codigo_certificado: 'CERT-ABC123',
    };

    repo.findByCodigo.mockResolvedValue(certificado);

    const result = await service.buscarPorCodigo('CERT-ABC123');

    expect(result).toEqual(certificado);

    expect(repo.findByCodigo).toHaveBeenCalledWith('CERT-ABC123');
  });

  it('debe rechazar un código de certificado inexistente', async () => {
    repo.findByCodigo.mockResolvedValue(null);

    await expect(service.buscarPorCodigo('CERT-NOEXISTE')).rejects.toThrow(
      'Certificado no encontrado',
    );

    expect(repo.findByCodigo).toHaveBeenCalledWith('CERT-NOEXISTE');
  });

  // ============================================================
  // SEARCH
  // ============================================================

  it('debe buscar certificaciones', async () => {
    const resultados = [
      {
        id_certificacion: 1,
        nombre_estudiante: 'Jair Usuario',
      },
    ];

    repo.buscar.mockResolvedValue(resultados);

    const result = await service.buscar('Jair Usuario', 'nombre');

    expect(result).toEqual(resultados);

    expect(repo.buscar).toHaveBeenCalledWith('Jair Usuario', 'nombre');
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear una certificación correctamente', async () => {
    const dto = {
      id_usuario: 10,
      nombre_estudiante: 'Jair Usuario',
      dni_estudiante: '12345678',
      nombre_curso: 'Curso de IA',
    };

    const certificado = {
      id_certificacion: 50,
      id_usuario: 10,
      nombre_estudiante: 'Jair Usuario',
      dni_estudiante: '12345678',
      codigo_certificado: 'CERT-ABC123',
    };

    repo.findUsuarioById.mockResolvedValue({
      id_usuario: 10,
      dni: '12345678',
    });

    repo.create.mockResolvedValue(certificado);

    notificacionesService.crear.mockResolvedValue(undefined);

    const result = await service.create(dto as any, 99);

    expect(result).toEqual({
      ...certificado,
      dni_mismatch: false,
      warning: null,
      usuario_dni: '12345678',
    });

    expect(repo.findUsuarioById).toHaveBeenCalledWith(10);

    expect(repo.create).toHaveBeenCalledWith(dto);

    expect(notificacionesService.crear).toHaveBeenCalledWith(
      99,
      'Se registró el certificado CERT-ABC123.',
    );
  });

  // ============================================================
  // CREATE - DNI MISMATCH
  // ============================================================

  it('debe detectar cuando el DNI del certificado no coincide con el usuario', async () => {
    const dto = {
      id_usuario: 10,
      nombre_estudiante: 'Jair Usuario',
      dni_estudiante: '87654321',
    };

    const certificado = {
      id_certificacion: 51,
      id_usuario: 10,
      dni_estudiante: '87654321',
      codigo_certificado: 'CERT-MISMATCH',
    };

    repo.findUsuarioById.mockResolvedValue({
      id_usuario: 10,
      dni: '12345678',
    });

    repo.create.mockResolvedValue(certificado);

    const result = await service.create(dto as any, 99);

    expect(result.dni_mismatch).toBe(true);

    expect(result.warning).toBe(
      'El DNI del certificado no coincide con el DNI registrado del usuario.',
    );

    expect(result.usuario_dni).toBe('12345678');

    expect(repo.create).toHaveBeenCalledWith(dto);
  });

  // ============================================================
  // CREATE - NOTIFICATION FAILURE
  // ============================================================

  it('debe crear el certificado aunque falle la notificación', async () => {
    const dto = {
      id_usuario: 10,
      nombre_estudiante: 'Jair Usuario',
      dni_estudiante: '12345678',
    };

    const certificado = {
      id_certificacion: 52,
      id_usuario: 10,
      codigo_certificado: 'CERT-NOTIF',
    };

    repo.findUsuarioById.mockResolvedValue({
      id_usuario: 10,
      dni: '12345678',
    });

    repo.create.mockResolvedValue(certificado);

    notificacionesService.crear.mockRejectedValue(
      new Error('Error de notificación'),
    );

    const result = await service.create(dto as any, 99);

    expect(result).toEqual({
      ...certificado,
      dni_mismatch: false,
      warning: null,
      usuario_dni: '12345678',
    });

    expect(notificacionesService.crear).toHaveBeenCalled();
  });

  // ============================================================
  // UPDATE
  // ============================================================

  it('debe actualizar una certificación correctamente', async () => {
    const actual = {
      id_certificacion: 10,
      id_usuario: 20,
      dni_estudiante: '12345678',
      nombre_estudiante: 'Jair Usuario',
    };

    const dto = {
      nombre_estudiante: 'Jair Actualizado',
      dni_estudiante: '12345678',
    };

    const actualizado = {
      ...actual,
      nombre_estudiante: 'Jair Actualizado',
    };

    repo.findById.mockResolvedValue(actual);

    repo.findUsuarioById.mockResolvedValue({
      id_usuario: 20,
      dni: '12345678',
    });

    repo.update.mockResolvedValue(actualizado);

    const result = await service.update(10, dto);

    expect(result).toEqual({
      ...actualizado,
      dni_mismatch: false,
      warning: null,
      usuario_dni: '12345678',
    });

    expect(repo.findById).toHaveBeenCalledWith(10);

    expect(repo.update).toHaveBeenCalledWith(10, dto);
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar una certificación', async () => {
    repo.delete.mockResolvedValue({
      affected: 1,
    });

    const result = await service.delete(10);

    expect(result).toEqual({
      message: 'Certificación eliminada',
    });

    expect(repo.delete).toHaveBeenCalledWith(10);
  });

  // ============================================================
  // APPROVAL
  // ============================================================

  it('debe devolver true cuando el usuario tiene un intento aprobado', async () => {
    repo.tieneIntentoAprobado.mockResolvedValue(true);

    const result = await service.verificarAprobacion(10, 681);

    expect(result).toBe(true);

    expect(repo.tieneIntentoAprobado).toHaveBeenCalledWith(10, 681);
  });

  it('debe devolver false cuando el usuario no tiene un intento aprobado', async () => {
    repo.tieneIntentoAprobado.mockResolvedValue(false);

    const result = await service.verificarAprobacion(10, 681);

    expect(result).toBe(false);
  });

  // ============================================================
  // GET OR CREATE
  // ============================================================

  it('debe obtener o crear el certificado', async () => {
    const certificado = {
      id_certificacion: 70,
      id_usuario: 10,
      id_curso: 681,
      codigo_certificado: 'CERT-ORCREATE',
    };

    repo.obtenerOCrear.mockResolvedValue(certificado);

    const result = await service.obtenerOCrear(10, 681);

    expect(result).toEqual(certificado);

    expect(repo.obtenerOCrear).toHaveBeenCalledWith(10, 681);
  });

  // ============================================================
  // QR
  // ============================================================

  it('debe generar un QR para un certificado válido', async () => {
    const certificado = {
      id_certificacion: 1,
      codigo_certificado: 'CERT-ABC123',
    };

    const qrBuffer = Buffer.from('fake-qr');

    repo.findByCodigo.mockResolvedValue(certificado);

    (QRCode.toBuffer as jest.Mock).mockResolvedValue(qrBuffer);

    process.env.FRONTEND_URL = 'https://misacademyonline.com';

    const result = await service.obtenerQr(' CERT-ABC123 ');

    expect(result).toEqual(qrBuffer);

    expect(repo.findByCodigo).toHaveBeenCalledWith('CERT-ABC123');

    expect(QRCode.toBuffer).toHaveBeenCalledWith(
      'https://misacademyonline.com/consulta?codigo=CERT-ABC123',
      {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
      },
    );
  });

  it('debe rechazar generar un QR para un certificado inexistente', async () => {
    repo.findByCodigo.mockResolvedValue(null);

    await expect(service.obtenerQr('CERT-NOEXISTE')).rejects.toThrow(
      'Certificado no encontrado',
    );

    expect(QRCode.toBuffer).not.toHaveBeenCalled();
  });
});
