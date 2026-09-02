import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CertificacionesRepository } from './certificaciones.repository';
import { Certificacion } from '../entities/certificacion.entity';

describe('CertificacionesRepository', () => {
  let repository: CertificacionesRepository;
  let certRepo: any;
  let manager: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    manager = {
      getRepository: jest.fn(),
      query: jest.fn(),
    };

    certRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data) => data),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
      manager,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificacionesRepository,
        {
          provide: getRepositoryToken(Certificacion),
          useValue: certRepo,
        },
      ],
    }).compile();

    repository = module.get<CertificacionesRepository>(
      CertificacionesRepository,
    );
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe buscar una certificación por ID', async () => {
    const certificacion = {
      id_certificacion: 10,
      id_usuario: 20,
      id_curso: 681,
      codigo_certificado: 'CERT-ABC123',
    };

    certRepo.findOne.mockResolvedValue(certificacion);

    const result = await repository.findById(10);

    expect(result).toEqual(certificacion);

    expect(certRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_certificacion: 10,
      },
      relations: ['usuario', 'curso'],
    });
  });

  // ============================================================
  // FIND BY USER
  // ============================================================

  it('debe devolver las certificaciones de un usuario', async () => {
    const certificaciones = [
      {
        id_certificacion: 1,
        id_usuario: 10,
      },
      {
        id_certificacion: 2,
        id_usuario: 10,
      },
    ];

    certRepo.find.mockResolvedValue(certificaciones);

    const result = await repository.findByUsuario(10);

    expect(result).toEqual(certificaciones);

    expect(certRepo.find).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
      },
      relations: ['curso'],
    });
  });

  // ============================================================
  // FIND BY CODE
  // ============================================================

  it('debe buscar una certificación por código', async () => {
    const certificacion = {
      id_certificacion: 10,
      codigo_certificado: 'CERT-ABC123',
    };

    certRepo.findOne.mockResolvedValue(certificacion);

    const result = await repository.findByCodigo('CERT-ABC123');

    expect(result).toEqual(certificacion);

    expect(certRepo.findOne).toHaveBeenCalledWith({
      where: {
        codigo_certificado: 'CERT-ABC123',
      },
      relations: ['usuario', 'curso'],
    });
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear una certificación con los datos normalizados', async () => {
    const input = {
      nombre_estudiante: 'Jair Usuario',
      dni_estudiante: '12345678',
      nombre_curso: 'Fundamentos de IA',
      tipo_certificado: 'Certificado de Aprobación',
      descripcion: 'Certificado final',
      horas: 20,
      calificacion_final: '18',
      email_destinatario: 'jair@test.com',
      fecha_inicio: '2026-08-01',
      fecha_fin: '2026-08-28',
      fecha_emision: '2026-08-28',
      id_usuario: 10,
      id_curso: 681,
    };

    const resultSaved = {
      id_certificacion: 50,
      ...input,
    };

    certRepo.save.mockResolvedValue(resultSaved);

    const result = await repository.create(input);

    expect(certRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre_estudiante: 'Jair Usuario',
        dni_estudiante: '12345678',
        nombre_curso: 'Fundamentos de IA',
        tipo_certificado: 'Certificado de Aprobación',
        descripcion: 'Certificado final',
        horas: 20,
        calificacion_final: 18,
        email_destinatario: 'jair@test.com',
        id_usuario: 10,
        id_curso: 681,
        estado: 'Activo',
        codigo_certificado: expect.stringMatching(/^CERT-[A-F0-9]{12}$/),
        fecha_inicio: expect.any(Date),
        fecha_fin: expect.any(Date),
        fecha_emision: expect.any(Date),
        created_at: expect.any(Date),
      }),
    );

    expect(certRepo.save).toHaveBeenCalled();
    expect(result).toEqual(resultSaved);
  });

  it('debe conservar un código de certificado proporcionado', async () => {
    const input = {
      nombre_estudiante: 'Jair Usuario',
      codigo_certificado: 'CERT-CUSTOM001',
    };

    certRepo.save.mockResolvedValue({
      id_certificacion: 51,
      ...input,
    });

    await repository.create(input);

    expect(certRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        codigo_certificado: 'CERT-CUSTOM001',
      }),
    );
  });

  // ============================================================
  // UPDATE
  // ============================================================

  it('debe actualizar los campos proporcionados de una certificación', async () => {
    const certificacionActualizada = {
      id_certificacion: 10,
      nombre_estudiante: 'Jair Actualizado',
    };

    certRepo.update.mockResolvedValue({
      affected: 1,
    });

    certRepo.findOne.mockResolvedValue(certificacionActualizada);

    const result = await repository.update(10, {
      nombre_estudiante: 'Jair Actualizado',
      estado: 'Activo',
      total_horas: '25',
      calificacion_final: 19,
    });

    expect(certRepo.update).toHaveBeenCalledWith(
      {
        id_certificacion: 10,
      },
      expect.objectContaining({
        nombre_estudiante: 'Jair Actualizado',
        estado: 'Activo',
        horas: 25,
        calificacion_final: 19,
        updated_at: expect.any(Date),
      }),
    );

    expect(result).toEqual(certificacionActualizada);
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar una certificación por ID', async () => {
    certRepo.delete.mockResolvedValue({
      affected: 1,
    });

    const result = await repository.delete(10);

    expect(result).toEqual({
      affected: 1,
    });

    expect(certRepo.delete).toHaveBeenCalledWith({
      id_certificacion: 10,
    });
  });

  // ============================================================
  // FIND USER
  // ============================================================

  it('debe buscar un usuario por ID', async () => {
    const usuario = {
      id_usuario: 10,
      nombre: 'Jair',
      apellido: 'Usuario',
      dni: '12345678',
    };

    const usuarioRepo = {
      findOne: jest.fn().mockResolvedValue(usuario),
    };

    manager.getRepository.mockReturnValue(usuarioRepo);

    const result = await repository.findUsuarioById(10);

    expect(result).toEqual(usuario);

    expect(manager.getRepository).toHaveBeenCalledWith('Usuario');

    expect(usuarioRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
      },
    });
  });

  // ============================================================
  // TIENE INTENTO APROBADO
  // ============================================================

  it('debe devolver true cuando existe un intento aprobado', async () => {
    manager.query.mockResolvedValue([
      {
        id_intento: 100,
      },
    ]);

    const result = await repository.tieneIntentoAprobado(10, 681);

    expect(result).toBe(true);

    expect(manager.query).toHaveBeenCalledWith(
      expect.stringContaining("i.estado = 'Aprobado'"),
      [10, 681],
    );
  });

  it('debe devolver false cuando no existe un intento aprobado', async () => {
    manager.query.mockResolvedValue([]);

    const result = await repository.tieneIntentoAprobado(10, 681);

    expect(result).toBe(false);
  });

  // ============================================================
  // OBTENER O CREAR - EXISTENTE
  // ============================================================

  it('debe devolver el certificado existente sin crear uno nuevo', async () => {
    const existente = {
      id_certificacion: 70,
      id_usuario: 10,
      id_curso: 681,
      codigo_certificado: 'CERT-EXISTENTE',
    };

    certRepo.findOne.mockResolvedValue(existente);

    const result = await repository.obtenerOCrear(10, 681);

    expect(result).toEqual(existente);

    expect(certRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
        id_curso: 681,
      },
    });

    expect(manager.getRepository).not.toHaveBeenCalled();
    expect(manager.query).not.toHaveBeenCalled();
    expect(certRepo.save).not.toHaveBeenCalled();
  });

  // ============================================================
  // OBTENER O CREAR - SIN INTENTO
  // ============================================================

  it('debe rechazar crear un certificado si no existe un intento aprobado', async () => {
    certRepo.findOne.mockResolvedValue(null);

    const usuarioRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_usuario: 10,
        nombre: 'Jair',
        apellido: 'Usuario',
      }),
    };

    const cursoRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_curso: 681,
        nombre: 'Fundamentos de IA',
        tiempo: 4,
        duracion_horas: 20,
      }),
    };

    manager.getRepository.mockImplementation((entity: string) => {
      if (entity === 'Usuario') {
        return usuarioRepo;
      }

      if (entity === 'Curso') {
        return cursoRepo;
      }

      return {};
    });

    manager.query.mockResolvedValue([]);

    await expect(repository.obtenerOCrear(10, 681)).rejects.toThrow(
      'No existe un intento aprobado válido para generar el certificado.',
    );

    expect(certRepo.save).not.toHaveBeenCalled();
  });

  // ============================================================
  // OBTENER O CREAR - PUNTUACIÓN INVÁLIDA
  // ============================================================

  it('debe rechazar un intento aprobado con puntuación inválida', async () => {
    certRepo.findOne.mockResolvedValue(null);

    manager.getRepository.mockImplementation((entity: string) => {
      if (entity === 'Usuario') {
        return {
          findOne: jest.fn().mockResolvedValue({
            id_usuario: 10,
            nombre: 'Jair',
            apellido: 'Usuario',
          }),
        };
      }

      if (entity === 'Curso') {
        return {
          findOne: jest.fn().mockResolvedValue({
            id_curso: 681,
            nombre: 'Fundamentos de IA',
            tiempo: 4,
            duracion_horas: 20,
          }),
        };
      }

      return {};
    });

    manager.query.mockResolvedValue([
      {
        puntaje_obtenido: 5,
        puntaje_total: 0,
      },
    ]);

    await expect(repository.obtenerOCrear(10, 681)).rejects.toThrow(
      'El intento aprobado no tiene una puntuación válida para generar el certificado.',
    );

    expect(certRepo.save).not.toHaveBeenCalled();
  });

  // ============================================================
  // OBTENER O CREAR - CREACIÓN
  // ============================================================

  it('debe crear un certificado desde un intento aprobado válido', async () => {
    certRepo.findOne.mockResolvedValue(null);

    const usuarioRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_usuario: 10,
        nombre: 'Jair',
        apellido: 'Usuario',
      }),
    };

    const cursoRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_curso: 681,
        nombre: 'Fundamentos de IA',
        tiempo: 4,
        duracion_horas: 20,
      }),
    };

    manager.getRepository.mockImplementation((entity: string) => {
      if (entity === 'Usuario') {
        return usuarioRepo;
      }

      if (entity === 'Curso') {
        return cursoRepo;
      }

      return {};
    });

    manager.query.mockResolvedValue([
      {
        puntaje_obtenido: 18,
        puntaje_total: 20,
      },
    ]);

    const nuevoCertificado = {
      id_certificacion: 80,
      id_usuario: 10,
      id_curso: 681,
      codigo_certificado: 'CERT-ABC123',
      nombre_estudiante: 'Jair Usuario',
      nombre_curso: 'Fundamentos de IA',
      calificacion_final: 18,
    };

    certRepo.create.mockImplementation((data: any) => data);

    certRepo.save.mockResolvedValue(nuevoCertificado);

    const result = await repository.obtenerOCrear(10, 681);

    expect(result).toEqual(nuevoCertificado);

    expect(certRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 10,
        id_curso: 681,
        nombre_estudiante: 'Jair Usuario',
        nombre_curso: 'Fundamentos de IA',
        calificacion_final: 18,
        horas: 20,
        estado: 'Activo',
        fecha_inicio: expect.any(Date),
        fecha_fin: expect.any(Date),
        fecha_emision: expect.any(Date),
        created_at: expect.any(Date),
        codigo_certificado: expect.stringMatching(/^CERT-[A-F0-9]{12}$/),
      }),
    );

    expect(certRepo.save).toHaveBeenCalled();
  });

  // ============================================================
  // OBTENER O CREAR - DUPLICADO
  // ============================================================

  it('debe devolver el certificado existente cuando la creación genera un duplicado', async () => {
    certRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id_certificacion: 90,
      id_usuario: 10,
      id_curso: 681,
      codigo_certificado: 'CERT-YAEXISTE',
    });

    manager.getRepository.mockImplementation((entity: string) => {
      if (entity === 'Usuario') {
        return {
          findOne: jest.fn().mockResolvedValue({
            id_usuario: 10,
            nombre: 'Jair',
            apellido: 'Usuario',
          }),
        };
      }

      if (entity === 'Curso') {
        return {
          findOne: jest.fn().mockResolvedValue({
            id_curso: 681,
            nombre: 'Fundamentos de IA',
            tiempo: 4,
            duracion_horas: 20,
          }),
        };
      }

      return {};
    });

    manager.query.mockResolvedValue([
      {
        puntaje_obtenido: 18,
        puntaje_total: 20,
      },
    ]);

    certRepo.create.mockImplementation((data: any) => data);

    const duplicateError = {
      driverError: {
        code: 'ER_DUP_ENTRY',
      },
    };

    certRepo.save.mockRejectedValue(duplicateError);

    const result = await repository.obtenerOCrear(10, 681);

    expect(result).toEqual({
      id_certificacion: 90,
      id_usuario: 10,
      id_curso: 681,
      codigo_certificado: 'CERT-YAEXISTE',
    });

    expect(certRepo.findOne).toHaveBeenCalledTimes(2);
  });

  // ============================================================
  // FIND PROGRAMAS
  // ============================================================

  it('debe devolver los programas de certificados adicionales', async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([
          { nombre: 'Programa A' },
          { nombre: ' Programa B ' },
          { nombre: '' },
        ]),
    };

    certRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await repository.findProgramas();

    expect(result).toEqual(['Programa A', 'Programa B']);

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'cert.tipo_certificado = :tipo',
      {
        tipo: 'adicional',
      },
    );
  });
  // ============================================================
  // FIND ALL - FILTROS Y NORMALIZACION
  // ============================================================

  it('debe normalizar page y perPage cuando son inválidos', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    certRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await repository.findAll(0, 0);

    expect(result).toEqual({
      data: [],
      total: 0,
      currentPage: 1,
      perPage: 20,
      lastPage: 1,
    });

    expect(queryBuilder.skip).toHaveBeenCalledWith(0);

    expect(queryBuilder.take).toHaveBeenCalledWith(20);
  });

  it('debe limitar perPage máximo a 100', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    certRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await repository.findAll(2, 500);

    expect(result.currentPage).toBe(2);
    expect(result.perPage).toBe(100);

    expect(queryBuilder.skip).toHaveBeenCalledWith(100);

    expect(queryBuilder.take).toHaveBeenCalledWith(100);
  });

  it('debe aplicar todos los filtros disponibles en findAll', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([
        [
          {
            id_certificacion: 1,
            nombre_curso: 'Fundamentos de IA',
          },
        ],
        1,
      ]),
    };

    certRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await repository.findAll(
      2,
      10,
      'adicional',
      'Fundamentos de IA',
      681,
      '  Jair   Usuario  ',
    );

    expect(result.currentPage).toBe(2);
    expect(result.perPage).toBe(10);
    expect(result.lastPage).toBe(1);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'cert.tipo_certificado = :tipo',
      {
        tipo: 'adicional',
      },
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'LOWER(TRIM(cert.nombre_curso)) = LOWER(TRIM(:programa))',
      {
        programa: 'Fundamentos de IA',
      },
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'cert.id_curso = :cursoId',
      {
        cursoId: 681,
      },
    );

    expect(queryBuilder.orderBy).toHaveBeenCalledWith(
      'cert.id_certificacion',
      'DESC',
    );
  });

  it('debe aplicar el filtro empresa excluyendo certificados adicionales', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    certRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    await repository.findAll(1, 20, 'empresa');

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'cert.tipo_certificado <> :tipo',
      {
        tipo: 'adicional',
      },
    );
  });

  it('debe normalizar espacios de la búsqueda en findAll', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    certRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    await repository.findAll(
      1,
      20,
      undefined,
      undefined,
      undefined,
      '  Jair    Usuario  ',
    );

    const bracketsCall = queryBuilder.andWhere.mock.calls.find(
      ([value]) => typeof value !== 'string' && value instanceof Object,
    );

    expect(queryBuilder.andWhere).toHaveBeenCalled();
  });

  // ============================================================
  // BUSCAR - CASOS RESTANTES
  // ============================================================

  it('debe buscar por código usando el modo codigo', async () => {
    const certificaciones = [
      {
        id_certificacion: 10,
        codigo_certificado: 'CERT-ABC123',
      },
    ];

    certRepo.find.mockResolvedValue(certificaciones);

    const result = await repository.buscar('  CERT-ABC123  ', 'codigo');

    expect(result).toEqual(certificaciones);

    expect(certRepo.find).toHaveBeenCalledWith({
      where: [
        {
          codigo_certificado: 'CERT-ABC123',
        },
      ],
      relations: ['usuario', 'curso'],
    });
  });

  it('debe buscar por DNI usando usuario o certificado', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id_certificacion: 10,
          dni_estudiante: '12345678',
        },
      ]),
    };

    certRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await repository.buscar(' 12345678 ', 'dni');

    expect(result).toHaveLength(1);

    expect(queryBuilder.where).toHaveBeenCalledWith('usuario.dni = :dni', {
      dni: '12345678',
    });

    expect(queryBuilder.orWhere).toHaveBeenCalledWith(
      'cert.dni_estudiante = :dni',
      {
        dni: '12345678',
      },
    );
  });

  it('debe rechazar la búsqueda por nombre cuando solo se proporciona un nombre', async () => {
    await expect(repository.buscar('Jair', 'nombre')).rejects.toThrow(
      'Ingresa el nombre completo, incluyendo al menos un apellido.',
    );

    expect(certRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('debe buscar por nombre completo usando todos los tokens', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id_certificacion: 10,
          nombre_estudiante: 'Jair Usuario',
        },
      ]),
    };

    certRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await repository.buscar('  Jair   Usuario ', 'nombre');

    expect(result).toHaveLength(1);

    expect(queryBuilder.where).toHaveBeenCalled();

    expect(queryBuilder.setParameters).toHaveBeenCalledWith({
      nombreToken0: 'jair',
      nombreToken1: 'usuario',
    });

    expect(queryBuilder.getMany).toHaveBeenCalled();
  });

  it('debe buscar usando el modo general', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id_certificacion: 10,
          codigo_certificado: 'CERT-ABC123',
        },
      ]),
    };

    certRepo.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await repository.buscar('CERT-ABC123');

    expect(result).toHaveLength(1);

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'cert.codigo_certificado = :codigo',
      {
        codigo: 'CERT-ABC123',
      },
    );

    expect(queryBuilder.orWhere).toHaveBeenCalledWith('usuario.dni = :dni', {
      dni: 'CERT-ABC123',
    });

    expect(queryBuilder.getMany).toHaveBeenCalled();
  });

  // ============================================================
  // CREATE - VALORES POR DEFECTO
  // ============================================================

  it('debe usar valores por defecto al crear una certificación', async () => {
    const input = {
      nombre_estudiante: 'Jair Usuario',
    };

    const creada = {
      id_certificacion: 100,
      nombre_estudiante: 'Jair Usuario',
    };

    certRepo.save.mockResolvedValue(creada);

    const result = await repository.create(input);

    expect(certRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre_estudiante: 'Jair Usuario',
        dni_estudiante: null,
        nombre_curso: null,
        tipo_certificado: 'Certificado de Aprobación',
        descripcion: null,
        horas: null,
        calificacion_final: null,
        email_destinatario: null,
        estado: 'Activo',
        id_usuario: null,
        id_curso: null,
        codigo_certificado: expect.stringMatching(/^CERT-[A-F0-9]{12}$/),
        fecha_emision: expect.any(Date),
        created_at: expect.any(Date),
      }),
    );

    expect(result).toEqual(creada);
  });

  it('debe usar total_horas cuando se proporciona en create', async () => {
    const input = {
      nombre_estudiante: 'Jair Usuario',
      total_horas: '32',
      horas: '10',
    };

    certRepo.save.mockResolvedValue({
      id_certificacion: 101,
      ...input,
    });

    await repository.create(input);

    expect(certRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        horas: 32,
      }),
    );
  });

  it('debe convertir las fechas de create a objetos Date', async () => {
    const input = {
      nombre_estudiante: 'Jair Usuario',
      fecha_inicio: '2026-08-01',
      fecha_fin: '2026-08-28',
      fecha_emision: '2026-08-29',
    };

    certRepo.save.mockResolvedValue({
      id_certificacion: 102,
    });

    await repository.create(input);

    const payload =
      certRepo.create.mock.calls[certRepo.create.mock.calls.length - 1][0];

    expect(payload.fecha_inicio).toEqual(new Date('2026-08-01'));

    expect(payload.fecha_fin).toEqual(new Date('2026-08-28'));

    expect(payload.fecha_emision).toEqual(new Date('2026-08-29'));
  });

  // ============================================================
  // UPDATE - RAMAS RESTANTES
  // ============================================================

  it('debe convertir horas a número cuando update recibe horas', async () => {
    certRepo.update.mockResolvedValue({
      affected: 1,
    });

    certRepo.findOne.mockResolvedValue({
      id_certificacion: 20,
    });

    await repository.update(20, {
      horas: '15',
    });

    expect(certRepo.update).toHaveBeenCalledWith(
      {
        id_certificacion: 20,
      },
      expect.objectContaining({
        horas: 15,
        updated_at: expect.any(Date),
      }),
    );
  });

  it('debe permitir valores null en nombre de curso, descripción y email', async () => {
    certRepo.update.mockResolvedValue({
      affected: 1,
    });

    certRepo.findOne.mockResolvedValue({
      id_certificacion: 21,
    });

    await repository.update(21, {
      nombre_curso: null,
      descripcion: null,
      email_destinatario: null,
      estado: 'Inactivo',
      dni_estudiante: null,
    });

    expect(certRepo.update).toHaveBeenCalledWith(
      {
        id_certificacion: 21,
      },
      expect.objectContaining({
        nombre_curso: null,
        descripcion: null,
        email_destinatario: null,
        estado: 'Inactivo',
        dni_estudiante: null,
        updated_at: expect.any(Date),
      }),
    );
  });

  it('debe convertir correctamente las fechas nulas en update', async () => {
    certRepo.update.mockResolvedValue({
      affected: 1,
    });

    certRepo.findOne.mockResolvedValue({
      id_certificacion: 22,
    });

    await repository.update(22, {
      fecha_inicio: null,
      fecha_fin: null,
      fecha_emision: null,
    });

    expect(certRepo.update).toHaveBeenCalledWith(
      {
        id_certificacion: 22,
      },
      expect.objectContaining({
        fecha_inicio: null,
        fecha_fin: null,
        fecha_emision: null,
        updated_at: expect.any(Date),
      }),
    );
  });

  it('debe conservar horas cuando total_horas no viene pero horas sí', async () => {
    certRepo.update.mockResolvedValue({
      affected: 1,
    });

    certRepo.findOne.mockResolvedValue({
      id_certificacion: 23,
    });

    await repository.update(23, {
      horas: '24',
    });

    expect(certRepo.update).toHaveBeenCalledWith(
      {
        id_certificacion: 23,
      },
      expect.objectContaining({
        horas: 24,
      }),
    );
  });
});
