import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosRepository } from './pagos.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inscripcion } from '../entities/inscripcion.entity';
import { InscripcionRuta } from '../entities/inscripcion-ruta.entity';
import { RutaAcademica } from '../entities/ruta-academica.entity';
import { Usuario } from '../entities/usuario.entity';

describe('PagosService', () => {
  let service: PagosService;

  let pagosRepository: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findByUsuario: jest.Mock;
    create: jest.Mock;
    updateEstado: jest.Mock;
    delete: jest.Mock;
    findAllTipos: jest.Mock;
    createTipo: jest.Mock;
    updateTipo: jest.Mock;
    deleteTipo: jest.Mock;
  };

  let inscripcionRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };

  let inscripcionRutaRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };

  let rutaRepo: {
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    pagosRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUsuario: jest.fn(),
      create: jest.fn(),
      updateEstado: jest.fn(),
      delete: jest.fn(),
      findAllTipos: jest.fn(),
      createTipo: jest.fn(),
      updateTipo: jest.fn(),
      deleteTipo: jest.fn(),
    };

    inscripcionRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data) => data),
    };

    inscripcionRutaRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data) => data),
    };

    rutaRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: PagosRepository,
          useValue: pagosRepository,
        },
        {
          provide: getRepositoryToken(Inscripcion),
          useValue: inscripcionRepo,
        },
        {
          provide: getRepositoryToken(InscripcionRuta),
          useValue: inscripcionRutaRepo,
        },
        {
          provide: getRepositoryToken(RutaAcademica),
          useValue: rutaRepo,
        },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
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

  it('debe devolver todos los pagos usando los filtros recibidos', async () => {
    const pagos = {
      data: [
        {
          id_pago: 1,
          id_usuario: 10,
          estado: 'Pendiente',
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 20,
      last_page: 1,
    };

    pagosRepository.findAll.mockResolvedValue(pagos);

    const result = await service.findAll(
      1,
      20,
      'Pendiente',
      '2026-08-01',
      '2026-08-31',
    );

    expect(result).toEqual(pagos);

    expect(pagosRepository.findAll).toHaveBeenCalledWith(1, 20, {
      estado: 'Pendiente',
      fecha_inicio: '2026-08-01',
      fecha_fin: '2026-08-31',
    });
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe devolver un pago existente', async () => {
    const pago = {
      id_pago: 15,
      id_usuario: 10,
      estado: 'Completado',
      detalles: [],
    };

    pagosRepository.findById.mockResolvedValue(pago);

    const result = await service.findById(15);

    expect(result).toEqual(pago);
    expect(pagosRepository.findById).toHaveBeenCalledWith(15);
  });

  it('debe rechazar cuando el pago no existe', async () => {
    pagosRepository.findById.mockResolvedValue(null);

    await expect(service.findById(999)).rejects.toThrow('Pago no encontrado');

    expect(pagosRepository.findById).toHaveBeenCalledWith(999);
  });

  // ============================================================
  // AUTORIZACIÓN DE PAGOS
  // ============================================================

  it('debe impedir que un usuario consulte un pago que pertenece a otro usuario', async () => {
    const pago = {
      id_pago: 20,
      id_usuario: 50,
      estado: 'Completado',
      detalles: [],
    };

    const usuario = {
      id_usuario: 10,
      rol: {
        nombre_rol: 'Estudiante',
      },
    } as Usuario;

    pagosRepository.findById.mockResolvedValue(pago);

    await expect(service.findById(20, usuario)).rejects.toThrow(
      ForbiddenException,
    );

    expect(pagosRepository.findById).toHaveBeenCalledWith(20);
  });

  it('debe permitir que un administrador consulte cualquier pago', async () => {
    const pago = {
      id_pago: 20,
      id_usuario: 50,
      estado: 'Completado',
      detalles: [],
    };

    const admin = {
      id_usuario: 10,
      rol: {
        nombre_rol: 'Administrador',
      },
    } as Usuario;

    pagosRepository.findById.mockResolvedValue(pago);

    const result = await service.findById(20, admin);

    expect(result).toEqual(pago);
  });

  // ============================================================
  // COMPLETAR PAGO DE CURSO
  // ============================================================

  it('debe crear una inscripción al completar un pago de curso', async () => {
    const pago = {
      id_pago: 100,
      id_usuario: 10,
      detalles: [
        {
          id_curso: 681,
          id_ruta: null,
          subtotal: 99,
        },
      ],
    };

    pagosRepository.updateEstado.mockResolvedValue(pago);

    inscripcionRepo.findOne.mockResolvedValue(null);

    await service.updateEstado(100, {
      estado: 'Completado',
      observaciones: 'Pago verificado',
    } as any);

    expect(pagosRepository.updateEstado).toHaveBeenCalledWith(
      100,
      'Completado',
      'Pago verificado',
    );

    expect(inscripcionRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
        id_curso: 681,
      },
    });

    expect(inscripcionRepo.create).toHaveBeenCalledWith({
      id_usuario: 10,
      id_curso: 681,
      precio_pagado: 99,
      estado: 'Activo',
      fecha_inscripcion: expect.any(Date),
    });

    expect(inscripcionRepo.save).toHaveBeenCalled();
  });

  // ============================================================
  // COMPLETAR PAGO DE RUTA
  // ============================================================

  it('debe crear inscripción de ruta y de sus cursos al completar un pago de ruta', async () => {
    const pago = {
      id_pago: 200,
      id_usuario: 10,
      detalles: [
        {
          id_curso: null,
          id_ruta: 50,
          subtotal: 299,
        },
      ],
    };

    const ruta = {
      id_ruta: 50,
      cursos: [
        {
          id_curso: 681,
        },
        {
          id_curso: 682,
        },
      ],
    };

    pagosRepository.updateEstado.mockResolvedValue(pago);

    inscripcionRutaRepo.findOne.mockResolvedValue(null);
    inscripcionRepo.findOne.mockResolvedValue(null);

    rutaRepo.findOne.mockResolvedValue(ruta);

    await service.updateEstado(200, {
      estado: 'Completado',
      observaciones: 'Pago confirmado',
    } as any);

    expect(inscripcionRutaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
        id_ruta: 50,
      },
    });

    expect(inscripcionRutaRepo.create).toHaveBeenCalledWith({
      id_usuario: 10,
      id_ruta: 50,
      precio_pagado: 299,
      estado: 'Activo',
      fecha_inscripcion: expect.any(Date),
    });

    expect(inscripcionRutaRepo.save).toHaveBeenCalled();

    expect(rutaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_ruta: 50,
      },
      relations: ['cursos'],
    });

    expect(inscripcionRepo.findOne).toHaveBeenCalledTimes(2);

    expect(inscripcionRepo.save).toHaveBeenCalledTimes(2);
  });

  // ============================================================
  // NO DUPLICAR INSCRIPCIONES
  // ============================================================

  it('no debe duplicar una inscripción de curso existente', async () => {
    const pago = {
      id_pago: 300,
      id_usuario: 10,
      detalles: [
        {
          id_curso: 681,
          id_ruta: null,
          subtotal: 99,
        },
      ],
    };

    pagosRepository.updateEstado.mockResolvedValue(pago);

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 1,
      id_usuario: 10,
      id_curso: 681,
    });

    await service.updateEstado(300, {
      estado: 'Completado',
    } as any);

    expect(inscripcionRepo.findOne).toHaveBeenCalled();

    expect(inscripcionRepo.save).not.toHaveBeenCalled();
  });

  // ============================================================
  // ESTADO DIFERENTE A COMPLETADO
  // ============================================================

  it('no debe crear inscripciones cuando el pago no está completado', async () => {
    const pago = {
      id_pago: 400,
      id_usuario: 10,
      detalles: [
        {
          id_curso: 681,
          id_ruta: null,
          subtotal: 99,
        },
      ],
    };

    pagosRepository.updateEstado.mockResolvedValue(pago);

    await service.updateEstado(400, {
      estado: 'Pendiente',
    } as any);

    expect(pagosRepository.updateEstado).toHaveBeenCalledWith(
      400,
      'Pendiente',
      undefined,
    );

    expect(inscripcionRepo.findOne).not.toHaveBeenCalled();

    expect(inscripcionRepo.save).not.toHaveBeenCalled();

    expect(inscripcionRutaRepo.findOne).not.toHaveBeenCalled();

    expect(inscripcionRutaRepo.save).not.toHaveBeenCalled();

    expect(rutaRepo.findOne).not.toHaveBeenCalled();
  });

  // ============================================================
  // FIND BY USUARIO
  // ============================================================

  it('debe devolver los pagos de un usuario', async () => {
    const pagos = [
      {
        id_pago: 1,
        id_usuario: 10,
        estado: 'Completado',
      },
      {
        id_pago: 2,
        id_usuario: 10,
        estado: 'Pendiente',
      },
    ];

    pagosRepository.findByUsuario.mockResolvedValue(pagos);

    const result = await service.findByUsuario(10);

    expect(result).toEqual(pagos);
    expect(pagosRepository.findByUsuario).toHaveBeenCalledWith(10);
  });

  // ============================================================
  // CREATE
  // ============================================================

  it('debe crear un pago', async () => {
    const dto = {
      monto_total: 199,
      id_tipo_pago: 1,
      observaciones: 'Pago de prueba',
    };

    const pagoCreado = {
      id_pago: 100,
      id_usuario: 10,
      ...dto,
      estado: 'Pendiente',
    };

    pagosRepository.create.mockResolvedValue(pagoCreado);

    const result = await service.create(10, dto as any);

    expect(result).toEqual(pagoCreado);
    expect(pagosRepository.create).toHaveBeenCalledWith(10, dto);
  });

  // ============================================================
  // DELETE
  // ============================================================

  it('debe eliminar un pago y devolver el mensaje correspondiente', async () => {
    pagosRepository.delete.mockResolvedValue(undefined);

    const result = await service.delete(100);

    expect(pagosRepository.delete).toHaveBeenCalledWith(100);
    expect(result).toEqual({ message: 'Pago eliminado' });
  });

  // ============================================================
  // TIPOS DE PAGO
  // ============================================================

  it('debe devolver todos los tipos de pago', async () => {
    const tipos = [
      { id_tipo_pago: 1, nombre: 'Yape' },
      { id_tipo_pago: 2, nombre: 'Transferencia' },
    ];

    pagosRepository.findAllTipos.mockResolvedValue(tipos);

    const result = await service.findAllTipos();

    expect(result).toEqual(tipos);
    expect(pagosRepository.findAllTipos).toHaveBeenCalled();
  });

  it('debe crear un tipo de pago', async () => {
    const dto = {
      nombre: 'Tarjeta',
      estado: 'Activo',
    };

    const tipoCreado = {
      id_tipo_pago: 3,
      ...dto,
    };

    pagosRepository.createTipo.mockResolvedValue(tipoCreado);

    const result = await service.createTipo(dto as any);

    expect(result).toEqual(tipoCreado);
    expect(pagosRepository.createTipo).toHaveBeenCalledWith(dto);
  });

  it('debe actualizar un tipo de pago', async () => {
    const dto = {
      nombre: 'Tarjeta actualizada',
    };

    const tipoActualizado = {
      id_tipo_pago: 3,
      nombre: 'Tarjeta actualizada',
    };

    pagosRepository.updateTipo.mockResolvedValue(tipoActualizado);

    const result = await service.updateTipo(3, dto as any);

    expect(result).toEqual(tipoActualizado);
    expect(pagosRepository.updateTipo).toHaveBeenCalledWith(3, dto);
  });

  it('debe eliminar un tipo de pago y devolver el mensaje correspondiente', async () => {
    pagosRepository.deleteTipo.mockResolvedValue(undefined);

    const result = await service.deleteTipo(3);

    expect(pagosRepository.deleteTipo).toHaveBeenCalledWith(3);
    expect(result).toEqual({ message: 'Tipo eliminado' });
  });

  // ============================================================
  // UPDATE ESTADO - DETALLES VACIOS
  // ============================================================

  it('debe completar un pago sin detalles sin crear inscripciones', async () => {
    const pago = {
      id_pago: 500,
      id_usuario: 10,
      detalles: [],
    };

    pagosRepository.updateEstado.mockResolvedValue(pago);

    const result = await service.updateEstado(500, {
      estado: 'Completado',
    } as any);

    expect(result).toEqual(pago);
    expect(inscripcionRepo.findOne).not.toHaveBeenCalled();
    expect(inscripcionRepo.save).not.toHaveBeenCalled();
    expect(inscripcionRutaRepo.findOne).not.toHaveBeenCalled();
    expect(inscripcionRutaRepo.save).not.toHaveBeenCalled();
    expect(rutaRepo.findOne).not.toHaveBeenCalled();
  });

  // ============================================================
  // UPDATE ESTADO - CURSO YA INSCRITO
  // ============================================================

  it('no debe duplicar una inscripción cuando el curso ya existe', async () => {
    const pago = {
      id_pago: 501,
      id_usuario: 10,
      detalles: [
        {
          id_curso: 681,
          id_ruta: null,
          subtotal: 150,
        },
      ],
    };

    pagosRepository.updateEstado.mockResolvedValue(pago);
    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 20,
      id_usuario: 10,
      id_curso: 681,
    });

    await service.updateEstado(501, {
      estado: 'Completado',
    } as any);

    expect(inscripcionRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
        id_curso: 681,
      },
    });

    expect(inscripcionRepo.save).not.toHaveBeenCalled();
  });

  // ============================================================
  // UPDATE ESTADO - RUTA YA INSCRITA
  // ============================================================

  it('no debe duplicar la inscripción de una ruta existente', async () => {
    const pago = {
      id_pago: 502,
      id_usuario: 10,
      detalles: [
        {
          id_curso: null,
          id_ruta: 50,
          subtotal: 299,
        },
      ],
    };

    pagosRepository.updateEstado.mockResolvedValue(pago);
    inscripcionRutaRepo.findOne.mockResolvedValue({
      id_inscripcion_ruta: 10,
      id_usuario: 10,
      id_ruta: 50,
    });

    rutaRepo.findOne.mockResolvedValue({
      id_ruta: 50,
      cursos: [],
    });

    await service.updateEstado(502, {
      estado: 'Completado',
    } as any);

    expect(inscripcionRutaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
        id_ruta: 50,
      },
    });

    expect(inscripcionRutaRepo.save).not.toHaveBeenCalled();

    expect(rutaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_ruta: 50,
      },
      relations: ['cursos'],
    });
  });

  // ============================================================
  // UPDATE ESTADO - RUTA SIN CURSOS
  // ============================================================

  it('debe procesar una ruta sin cursos asociados', async () => {
    const pago = {
      id_pago: 503,
      id_usuario: 10,
      detalles: [
        {
          id_curso: null,
          id_ruta: 51,
          subtotal: 199,
        },
      ],
    };

    pagosRepository.updateEstado.mockResolvedValue(pago);
    inscripcionRutaRepo.findOne.mockResolvedValue(null);
    rutaRepo.findOne.mockResolvedValue({
      id_ruta: 51,
      cursos: [],
    });

    await service.updateEstado(503, {
      estado: 'Completado',
    } as any);

    expect(inscripcionRutaRepo.save).toHaveBeenCalled();

    expect(rutaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_ruta: 51,
      },
      relations: ['cursos'],
    });

    expect(inscripcionRepo.findOne).not.toHaveBeenCalled();
  });

  // ============================================================
  // UPDATE ESTADO - RUTA INEXISTENTE
  // ============================================================

  it('debe procesar el pago de una ruta aunque la ruta ya no exista', async () => {
    const pago = {
      id_pago: 504,
      id_usuario: 10,
      detalles: [
        {
          id_curso: null,
          id_ruta: 999,
          subtotal: 250,
        },
      ],
    };

    pagosRepository.updateEstado.mockResolvedValue(pago);
    inscripcionRutaRepo.findOne.mockResolvedValue(null);
    rutaRepo.findOne.mockResolvedValue(null);

    const result = await service.updateEstado(504, {
      estado: 'Completado',
    } as any);

    expect(result).toEqual(pago);
    expect(inscripcionRutaRepo.save).toHaveBeenCalled();
    expect(rutaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_ruta: 999,
      },
      relations: ['cursos'],
    });
    expect(inscripcionRepo.save).not.toHaveBeenCalled();
  });

  // ============================================================
  // HISTORIAL
  // ============================================================

  it('debe devolver el historial de cursos y rutas del usuario', async () => {
    const fechaCurso = new Date('2026-08-20T10:00:00.000Z');
    const fechaRuta = new Date('2026-08-21T10:00:00.000Z');

    inscripcionRepo.find.mockResolvedValue([
      {
        id_inscripcion: 1,
        id_usuario: 10,
        precio_pagado: 99,
        fecha_inscripcion: fechaCurso,
        curso: {
          id_curso: 681,
          nombre: 'Curso de IA',
          descripcion_corta: 'Descripción corta',
          descripcion: 'Descripción completa',
          imagen: 'curso.jpg',
        },
      },
    ]);

    inscripcionRutaRepo.find.mockResolvedValue([
      {
        id_inscripcion_ruta: 2,
        id_usuario: 10,
        precio_pagado: 299,
        fecha_inscripcion: fechaRuta,
        ruta: {
          id_ruta: 50,
          nombre: 'Ruta de IA',
          descripcion: 'Ruta completa',
          imagen: 'ruta.jpg',
          cursos: [{ id_curso: 681 }, { id_curso: 682 }],
          lineaAcademica: {
            slug: 'inteligencia-artificial',
          },
        },
      },
    ]);

    const result = await service.findHistorial(10);

    expect(result).toEqual({
      status: 'success',
      compras: [
        {
          id_pago: 1,
          fecha_pago: '2026-08-20T10:00:00.000Z',
          precio: 99,
          curso: {
            id_curso: 681,
            nombre: 'Curso de IA',
            descripcion: 'Descripción corta',
            imagen: 'curso.jpg',
          },
        },
        {
          id_pago: 2,
          fecha_pago: '2026-08-21T10:00:00.000Z',
          precio: 299,
          ruta: {
            id_ruta: 50,
            nombre: 'Ruta de IA',
            descripcion: 'Ruta completa',
            imagen: 'ruta.jpg',
            cursos_ids: [681, 682],
            linea_slug: 'inteligencia-artificial',
          },
        },
      ],
    });

    expect(inscripcionRepo.find).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
      },
      relations: ['curso'],
      order: {
        fecha_inscripcion: 'DESC',
      },
    });

    expect(inscripcionRutaRepo.find).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
      },
      relations: ['ruta', 'ruta.cursos', 'ruta.lineaAcademica'],
      order: {
        fecha_inscripcion: 'DESC',
      },
    });
  });

  it('debe usar la descripción completa cuando el curso no tiene descripción corta', async () => {
    inscripcionRepo.find.mockResolvedValue([
      {
        id_inscripcion: 3,
        id_usuario: 10,
        precio_pagado: 50,
        fecha_inscripcion: new Date('2026-08-22T10:00:00.000Z'),
        curso: {
          id_curso: 700,
          nombre: 'Curso B',
          descripcion_corta: null,
          descripcion: 'Descripción completa B',
          imagen: null,
        },
      },
    ]);

    inscripcionRutaRepo.find.mockResolvedValue([]);

    const result = await service.findHistorial(10);

    expect(result.compras[0]).toEqual({
      id_pago: 3,
      fecha_pago: '2026-08-22T10:00:00.000Z',
      precio: 50,
      curso: {
        id_curso: 700,
        nombre: 'Curso B',
        descripcion: 'Descripción completa B',
        imagen: null,
      },
    });
  });

  it('debe usar valores por defecto cuando una ruta no tiene cursos o línea académica', async () => {
    inscripcionRepo.find.mockResolvedValue([]);

    inscripcionRutaRepo.find.mockResolvedValue([
      {
        id_inscripcion_ruta: 4,
        id_usuario: 10,
        precio_pagado: 120,
        fecha_inscripcion: new Date('2026-08-23T10:00:00.000Z'),
        ruta: {
          id_ruta: 60,
          nombre: 'Ruta B',
          descripcion: 'Descripción B',
          imagen: null,
          cursos: undefined,
          lineaAcademica: undefined,
        },
      },
    ]);

    const result = await service.findHistorial(10);

    expect(result).toEqual({
      status: 'success',
      compras: [
        {
          id_pago: 4,
          fecha_pago: '2026-08-23T10:00:00.000Z',
          precio: 120,
          ruta: {
            id_ruta: 60,
            nombre: 'Ruta B',
            descripcion: 'Descripción B',
            imagen: null,
            cursos_ids: [],
            linea_slug: 'ruta',
          },
        },
      ],
    });
  });
});
