import { Test, TestingModule } from '@nestjs/testing';
import { EvaluacionesRepository } from './evaluaciones.repository';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  Evaluacion,
  Pregunta,
  OpcionRespuesta,
  IntentoEvaluacion,
  RespuestaUsuario,
  Inscripcion,
  ProgresoEstudiante,
  Modulo,
  Leccion,
} from '../entities';

describe('EvaluacionesRepository', () => {
  let repository: EvaluacionesRepository;

  let evalRepo: any;
  let preguntaRepo: any;
  let opcionRepo: any;
  let intentoRepo: any;
  let respuestaRepo: any;
  let inscripcionRepo: any;
  let progresoRepo: any;
  let moduloRepo: any;
  let leccionRepo: any;

  let manager: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    manager = {
      createQueryBuilder: jest.fn(),
      getRepository: jest.fn(),
    };

    evalRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data) => data),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
      manager,
    };

    preguntaRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data) => data),
      update: jest.fn(),
      delete: jest.fn(),
      query: jest.fn(),
    };

    opcionRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data) => data),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    intentoRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data) => data),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    respuestaRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((data) => data),
      delete: jest.fn(),
    };

    inscripcionRepo = {
      findOne: jest.fn(),
    };

    progresoRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    moduloRepo = {
      find: jest.fn(),
    };

    leccionRepo = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluacionesRepository,

        {
          provide: getRepositoryToken(Evaluacion),
          useValue: evalRepo,
        },

        {
          provide: getRepositoryToken(Pregunta),
          useValue: preguntaRepo,
        },

        {
          provide: getRepositoryToken(OpcionRespuesta),
          useValue: opcionRepo,
        },

        {
          provide: getRepositoryToken(IntentoEvaluacion),
          useValue: intentoRepo,
        },

        {
          provide: getRepositoryToken(RespuestaUsuario),
          useValue: respuestaRepo,
        },

        {
          provide: getRepositoryToken(Inscripcion),
          useValue: inscripcionRepo,
        },

        {
          provide: getRepositoryToken(ProgresoEstudiante),
          useValue: progresoRepo,
        },

        {
          provide: getRepositoryToken(Modulo),
          useValue: moduloRepo,
        },

        {
          provide: getRepositoryToken(Leccion),
          useValue: leccionRepo,
        },
      ],
    }).compile();

    repository = module.get<EvaluacionesRepository>(EvaluacionesRepository);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  // ============================================================
  // FIND ALL
  // ============================================================

  it('debe devolver evaluaciones paginadas', async () => {
    const evaluaciones = [
      {
        id_evaluacion: 1,
        id_curso: 681,
        titulo: 'Evaluación Final',
      },
    ];

    evalRepo.findAndCount.mockResolvedValue([evaluaciones, 1]);

    const result = await repository.findAll(1, 20);

    expect(result).toEqual({
      data: evaluaciones,
      total: 1,
      current_page: 1,
      per_page: 20,
      last_page: 1,
    });

    expect(evalRepo.findAndCount).toHaveBeenCalledWith({
      relations: ['curso'],
      skip: 0,
      take: 20,
    });
  });

  // ============================================================
  // FIND BY ID
  // ============================================================

  it('debe buscar una evaluación por ID', async () => {
    const evaluacion = {
      id_evaluacion: 10,
      id_curso: 681,
      titulo: 'Evaluación Final',
    };

    evalRepo.findOne.mockResolvedValue(evaluacion);

    const result = await repository.findById(10);

    expect(result).toEqual(evaluacion);

    expect(evalRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_evaluacion: 10,
      },
      relations: ['curso'],
    });
  });

  // ============================================================
  // FIND PREGUNTAS
  // ============================================================

  it('debe devolver las preguntas ordenadas de una evaluación', async () => {
    const preguntas = [
      {
        id_pregunta: 1,
        id_evaluacion: 10,
        orden: 1,
      },
      {
        id_pregunta: 2,
        id_evaluacion: 10,
        orden: 2,
      },
    ];

    preguntaRepo.find.mockResolvedValue(preguntas);

    const result = await repository.findPreguntas(10);

    expect(result).toEqual(preguntas);

    expect(preguntaRepo.find).toHaveBeenCalledWith({
      where: {
        id_evaluacion: 10,
      },
      relations: ['opciones'],
      order: {
        orden: 'ASC',
      },
    });
  });

  // ============================================================
  // START EVALUATION
  // ============================================================

  it('debe crear un intento y ocultar las respuestas correctas al iniciar', async () => {
    evalRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id_evaluacion: 20,
        id_curso: 681,
        titulo: 'Examen Final',
        aleatorio: false,
      }),
    });

    intentoRepo.createQueryBuilder.mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(2),
    });

    const intento = {
      id_intento: 100,
      id_evaluacion: 20,
      id_usuario: 10,
      numero_intento: 3,
      estado: 'En Progreso',
    };

    intentoRepo.save.mockResolvedValue(intento);

    preguntaRepo.find.mockResolvedValue([
      {
        id_pregunta: 1,
        id_evaluacion: 20,
        texto: 'Pregunta 1',
        orden: 1,
      },
    ]);

    opcionRepo.find.mockResolvedValue([
      {
        id_opcion: 1,
        id_pregunta: 1,
        texto: 'Respuesta A',
        es_correcta: true,
      },
      {
        id_opcion: 2,
        id_pregunta: 1,
        texto: 'Respuesta B',
        es_correcta: false,
      },
    ]);

    const result = await repository.iniciarEvaluacion(
      681,
      10,
      '127.0.0.1',
      'jest-test',
    );

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un resultado al iniciar la evaluación');
    }

    expect(intentoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_evaluacion: 20,
        id_usuario: 10,
        numero_intento: 3,
        estado: 'En Progreso',
        ip_address: '127.0.0.1',
        user_agent: 'jest-test',
      }),
    );

    expect(intentoRepo.save).toHaveBeenCalled();

    const preguntas = result.preguntas as any[];

    expect(preguntas[0].texto_pregunta).toBe('Pregunta 1');

    expect(preguntas[0].opciones).toEqual([
      {
        id_opcion: 1,
        id_pregunta: 1,
        texto_opcion: 'Respuesta A',
      },
      {
        id_opcion: 2,
        id_pregunta: 1,
        texto_opcion: 'Respuesta B',
      },
    ]);

    expect(preguntas[0].opciones[0].es_correcta).toBeUndefined();
  });

  // ============================================================
  // RESUME SESSION
  // ============================================================

  it('debe devolver null y marcar tiempo agotado cuando la sesión expiró', async () => {
    intentoRepo.findOne.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'En Progreso',
      fecha_inicio: new Date(Date.now() - 120_000),
      evaluacion: {
        duracion_minutos: 1,
      },
    });

    const result = await repository.resumeSession(100, 10);

    expect(result).toBeNull();

    expect(intentoRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: 'Tiempo Agotado',
        fecha_fin: expect.any(Date),
      }),
    );
  });

  // ============================================================
  // SAVE ANSWER
  // ============================================================

  it('debe guardar una respuesta nueva correctamente', async () => {
    intentoRepo.findOne.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'En Progreso',
    });

    preguntaRepo.findOne.mockResolvedValue({
      id_pregunta: 5,
      id_evaluacion: 20,
    });

    opcionRepo.findOne.mockResolvedValue({
      id_opcion: 8,
      id_pregunta: 5,
      texto: 'Respuesta A',
    });

    respuestaRepo.findOne.mockResolvedValue(null);

    const nuevaRespuesta = {
      id_intento: 100,
      id_pregunta: 5,
      id_opcion: 8,
      respuesta_texto: 'Respuesta A',
    };

    respuestaRepo.create.mockReturnValue(nuevaRespuesta);

    respuestaRepo.save.mockResolvedValue(nuevaRespuesta);

    const result = await repository.saveAnswer(
      100,
      {
        id_pregunta: 5,
        id_opcion: 8,
        respuesta_texto: 'Respuesta A',
      } as any,
      10,
    );

    expect(respuestaRepo.create).toHaveBeenCalledWith({
      id_intento: 100,
      id_pregunta: 5,
      id_opcion: 8,
      respuesta_texto: 'Respuesta A',
    });

    expect(respuestaRepo.save).toHaveBeenCalledWith(nuevaRespuesta);

    expect(result).toEqual(nuevaRespuesta);
  });

  // ============================================================
  // INVALID QUESTION / OPTION
  // ============================================================

  it('debe rechazar una respuesta cuya pregunta no pertenece a la evaluación', async () => {
    intentoRepo.findOne.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'En Progreso',
    });

    preguntaRepo.findOne.mockResolvedValue(null);

    const result = await repository.saveAnswer(
      100,
      {
        id_pregunta: 999,
        id_opcion: 8,
      } as any,
      10,
    );

    expect(result).toBeNull();

    expect(respuestaRepo.findOne).not.toHaveBeenCalled();

    expect(respuestaRepo.save).not.toHaveBeenCalled();
  });

  it('debe rechazar una opción que no pertenece a la pregunta', async () => {
    intentoRepo.findOne.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'En Progreso',
    });

    preguntaRepo.findOne.mockResolvedValue({
      id_pregunta: 5,
      id_evaluacion: 20,
    });

    opcionRepo.findOne.mockResolvedValue(null);

    const result = await repository.saveAnswer(
      100,
      {
        id_pregunta: 5,
        id_opcion: 999,
      } as any,
      10,
    );

    expect(result).toBeNull();

    expect(respuestaRepo.save).not.toHaveBeenCalled();
  });

  // ============================================================
  // SUBMIT - APPROVED
  // ============================================================

  it('debe calcular correctamente una evaluación aprobada y generar certificado', async () => {
    const intento = {
      id_intento: 100,
      id_evaluacion: 20,
      id_usuario: 10,
      numero_intento: 1,
      estado: 'En Progreso',
      puntaje_obtenido: 0,
      puntaje_total: 0,
      fecha_inicio: new Date(Date.now() - 60_000),
      evaluacion: {
        id_evaluacion: 20,
        id_curso: 681,
        titulo: 'Evaluación Final',
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      },
    };

    intentoRepo.findOne.mockResolvedValue(intento);

    respuestaRepo.find.mockResolvedValue([
      {
        id_respuesta: 1,
        id_intento: 100,
        id_pregunta: 1,
        id_opcion: 11,
      },
      {
        id_respuesta: 2,
        id_intento: 100,
        id_pregunta: 2,
        id_opcion: 22,
      },
    ]);

    preguntaRepo.findOne
      .mockResolvedValueOnce({
        id_pregunta: 1,
        id_evaluacion: 20,
        puntaje: 5,
      })
      .mockResolvedValueOnce({
        id_pregunta: 2,
        id_evaluacion: 20,
        puntaje: 5,
      });

    opcionRepo.findOne
      .mockResolvedValueOnce({
        id_opcion: 11,
        id_pregunta: 1,
        es_correcta: true,
      })
      .mockResolvedValueOnce({
        id_opcion: 22,
        id_pregunta: 2,
        es_correcta: true,
      });

    intentoRepo.save.mockResolvedValue(intento);

    const certificacionRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue({}),
    };

    const usuarioRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_usuario: 10,
        nombre: 'Jair',
        apellido: 'Usuario',
      }),
    };

    manager.getRepository.mockImplementation((entity: string) => {
      if (entity === 'Certificacion') {
        return certificacionRepo;
      }

      if (entity === 'Usuario') {
        return usuarioRepo;
      }

      return {};
    });

    const result = await repository.submitEvaluacion(100, {} as any, 10);

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un resultado al enviar la evaluación');
    }

    expect(result.porcentaje).toBe(100);
    expect(result.calificacion).toBe(100);
    expect(result.calificacion_sobre_20).toBe(20);
    expect(result.aprobado).toBe(true);
    expect(result.estado_texto).toBe('Aprobado');

    expect(intento.estado).toBe('Aprobado');

    expect(intentoRepo.save).toHaveBeenCalledWith(intento);

    expect(certificacionRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
        id_curso: 681,
      },
    });

    expect(certificacionRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id_usuario: 10,
        id_curso: 681,
        nombre_estudiante: 'Jair Usuario',
        calificacion_final: 20,
        tipo_certificado: 'Certificado de Aprobación',
        estado: 'Activo',
      }),
    );
  });

  // ============================================================
  // SUBMIT - FAILED
  // ============================================================

  it('debe calcular una evaluación desaprobada sin generar certificado', async () => {
    const intento = {
      id_intento: 200,
      id_evaluacion: 30,
      id_usuario: 10,
      numero_intento: 1,
      estado: 'En Progreso',
      puntaje_obtenido: 0,
      puntaje_total: 0,
      fecha_inicio: new Date(Date.now() - 60_000),
      evaluacion: {
        id_evaluacion: 30,
        id_curso: 682,
        titulo: 'Evaluación',
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      },
    };

    intentoRepo.findOne.mockResolvedValue(intento);

    respuestaRepo.find.mockResolvedValue([
      {
        id_respuesta: 1,
        id_intento: 200,
        id_pregunta: 3,
        id_opcion: 31,
      },
    ]);

    preguntaRepo.findOne.mockResolvedValue({
      id_pregunta: 3,
      id_evaluacion: 30,
      puntaje: 10,
    });

    opcionRepo.findOne.mockResolvedValue({
      id_opcion: 31,
      id_pregunta: 3,
      es_correcta: false,
    });

    intentoRepo.save.mockResolvedValue(intento);

    const certificacionRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    manager.getRepository.mockReturnValue(certificacionRepo);

    const result = await repository.submitEvaluacion(200, {} as any, 10);

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un resultado al enviar la evaluación');
    }

    expect(result.porcentaje).toBe(0);
    expect(result.calificacion).toBe(0);
    expect(result.calificacion_sobre_20).toBe(0);
    expect(result.aprobado).toBe(false);
    expect(result.estado_texto).toBe('Reprobado');

    expect(intento.estado).toBe('Desaprobado');

    expect(certificacionRepo.findOne).not.toHaveBeenCalled();

    expect(certificacionRepo.save).not.toHaveBeenCalled();
  });

  // ============================================================
  // GET ATTEMPT
  // ============================================================

  it('debe devolver un intento con su porcentaje calculado', async () => {
    const intento = {
      id_intento: 300,
      id_usuario: 10,
      puntaje_obtenido: 8,
      puntaje_total: 10,
      numero_intento: 2,
      evaluacion: {
        intentos_permitidos: 3,
      },
    };

    intentoRepo.findOne.mockResolvedValue(intento);

    const respuestas = [
      {
        id_respuesta: 1,
        id_pregunta: 1,
        id_opcion: 5,
      },
    ];

    respuestaRepo.find.mockResolvedValue(respuestas);

    const result = await repository.getIntento(300, 10);

    expect(result).toEqual({
      ...intento,
      respuestas,
      puntos_obtenidos: 8,
      puntos_maximos: 10,
      porcentaje: 80,
      calificacion: 80,
      calificacion_sobre_20: 16,
      intentos_permitidos: 3,
      intentos_realizados: 2,
    });

    expect(intentoRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_intento: 300,
        id_usuario: 10,
      },
      relations: ['evaluacion'],
    });

    expect(respuestaRepo.find).toHaveBeenCalledWith({
      where: {
        id_intento: 300,
      },
      relations: ['pregunta', 'opcion'],
    });
  });
  // ============================================================
  // CHECK ELIGIBILITY - BLOQUE COMPLEMENTARIO
  // ============================================================

  it('debe devolver curso no encontrado cuando se consulta por slug inexistente', async () => {
    const cursoQb = {
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(null),
    };

    manager.createQueryBuilder.mockReturnValue(cursoQb);

    const result = await repository.checkEligibility('curso-inexistente', 10);

    expect(result).toEqual({
      eligible: false,
      reason: 'Curso no encontrado',
    });

    expect(manager.createQueryBuilder).toHaveBeenCalledWith(
      expect.anything(),
      'c',
    );

    expect(cursoQb.where).toHaveBeenCalledWith('c.slug = :slug', {
      slug: 'curso-inexistente',
    });
  });

  it('debe convertir correctamente un slug de curso a su ID', async () => {
    const cursoQb = {
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        id_curso: 681,
      }),
    };

    const userRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_usuario: 10,
        rol: {
          nombre_rol: 'Estudiante',
        },
      }),
    };

    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id_evaluacion: 20,
        id_curso: 681,
        titulo: 'Examen Final',
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
        estado: 'Activo',
      }),
    };

    const intentosQb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    manager.createQueryBuilder.mockReturnValue(cursoQb);
    manager.getRepository.mockReturnValue(userRepo);

    evalRepo.createQueryBuilder.mockReturnValue(evalQb);
    intentoRepo.createQueryBuilder.mockReturnValue(intentosQb);
    leccionRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    });
    progresoRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    });

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
      id_usuario: 10,
      id_curso: 681,
    });

    moduloRepo.find.mockResolvedValue([]);

    const result = await repository.checkEligibility('curso-681', 10);

    expect(result).toEqual(
      expect.objectContaining({
        eligible: true,
        configuration: expect.objectContaining({
          id_evaluacion: 20,
        }),
        intentos_usados: 0,
        intentos_permitidos: 3,
        lastAttempt: null,
        bestAttempt: null,
        hasPassed: null,
      }),
    );

    expect(cursoQb.where).toHaveBeenCalledWith('c.slug = :slug', {
      slug: 'curso-681',
    });
  });

  it('debe rechazar al usuario que no está inscrito en el curso', async () => {
    const userRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_usuario: 10,
        rol: {
          nombre_rol: 'Estudiante',
        },
      }),
    };

    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id_evaluacion: 20,
        id_curso: 681,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      }),
    };

    manager.getRepository.mockReturnValue(userRepo);
    evalRepo.createQueryBuilder.mockReturnValue(evalQb);

    inscripcionRepo.findOne.mockResolvedValue(null);

    const result = await repository.checkEligibility(681, 10);

    expect(result).toEqual({
      eligible: false,
      reason: 'No estás inscrito en este curso',
    });

    expect(moduloRepo.find).not.toHaveBeenCalled();
  });

  it('debe permitir la evaluación a un administrador sin inscripción', async () => {
    const userRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_usuario: 10,
        rol: {
          nombre_rol: 'Administrador',
        },
      }),
    };

    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id_evaluacion: 20,
        id_curso: 681,
        titulo: 'Examen Final',
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
        estado: 'Activo',
      }),
    };

    const intentosQb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    manager.getRepository.mockReturnValue(userRepo);

    evalRepo.createQueryBuilder.mockReturnValue(evalQb);
    intentoRepo.createQueryBuilder.mockReturnValue(intentosQb);

    inscripcionRepo.findOne.mockResolvedValue(null);
    moduloRepo.find.mockResolvedValue([]);

    const result = await repository.checkEligibility(681, 10);

    expect(result).toEqual(
      expect.objectContaining({
        eligible: true,
        intentos_usados: 0,
        intentos_permitidos: 3,
      }),
    );

    expect(moduloRepo.find).toHaveBeenCalledWith({
      where: {
        id_curso: 681,
      },
    });

    expect(intentoRepo.createQueryBuilder).toHaveBeenCalled();
  });

  it('debe rechazar cuando no se han completado todas las lecciones', async () => {
    const userRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_usuario: 10,
        rol: {
          nombre_rol: 'Estudiante',
        },
      }),
    };

    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id_evaluacion: 20,
        id_curso: 681,
        titulo: 'Examen',
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      }),
    };

    const leccionesQb = {
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(5),
    };

    const progresoQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(3),
    };

    manager.getRepository.mockReturnValue(userRepo);
    evalRepo.createQueryBuilder.mockReturnValue(evalQb);

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
      id_usuario: 10,
      id_curso: 681,
    });

    moduloRepo.find.mockResolvedValue([
      { id_modulo: 1, id_curso: 681 },
      { id_modulo: 2, id_curso: 681 },
    ]);

    leccionRepo.createQueryBuilder.mockReturnValue(leccionesQb);

    progresoRepo.createQueryBuilder.mockReturnValue(progresoQb);

    const result = await repository.checkEligibility(681, 10);

    expect(result).toEqual({
      eligible: false,
      reason: 'Debes completar todas las lecciones (3/5)',
      completadas: 3,
      totalLecciones: 5,
    });
  });

  it('debe rechazar cuando no existe una evaluación disponible', async () => {
    const userRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_usuario: 10,
        rol: {
          nombre_rol: 'Estudiante',
        },
      }),
    };

    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    manager.getRepository.mockReturnValue(userRepo);
    evalRepo.createQueryBuilder.mockReturnValue(evalQb);

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
    });

    moduloRepo.find.mockResolvedValue([]);

    const result = await repository.checkEligibility(681, 10);

    expect(result).toEqual({
      eligible: false,
      reason: 'No hay evaluación disponible para este curso',
    });
  });

  it('debe rechazar cuando el usuario ya obtuvo la calificación máxima', async () => {
    const userRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_usuario: 10,
        rol: {
          nombre_rol: 'Estudiante',
        },
      }),
    };

    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id_evaluacion: 20,
        id_curso: 681,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      }),
    };

    const intentosQb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id_intento: 100,
          puntaje_obtenido: 10,
          puntaje_total: 10,
          fecha_inicio: new Date('2026-08-29T10:00:00.000Z'),
        },
      ]),
    };

    manager.getRepository.mockReturnValue(userRepo);
    evalRepo.createQueryBuilder.mockReturnValue(evalQb);
    intentoRepo.createQueryBuilder.mockReturnValue(intentosQb);

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
    });

    moduloRepo.find.mockResolvedValue([]);

    const result = await repository.checkEligibility(681, 10);

    expect(result).toEqual(
      expect.objectContaining({
        eligible: false,
        reason: 'Ya has alcanzado la calificación máxima en esta evaluación',
        intentos_usados: 1,
        intentos_permitidos: 3,
        hasPassed: true,
      }),
    );

    if (!result.bestAttempt) {
      throw new Error('Se esperaba un bestAttempt en el resultado');
    }

    expect(result.bestAttempt.porcentaje).toBe(100);
  });

  it('debe rechazar cuando el usuario agotó sus intentos permitidos', async () => {
    const userRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_usuario: 10,
        rol: {
          nombre_rol: 'Estudiante',
        },
      }),
    };

    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id_evaluacion: 20,
        id_curso: 681,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 2,
      }),
    };

    const intentosQb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id_intento: 100,
          puntaje_obtenido: 5,
          puntaje_total: 10,
          fecha_inicio: new Date('2026-08-29T09:00:00.000Z'),
        },
        {
          id_intento: 101,
          puntaje_obtenido: 4,
          puntaje_total: 10,
          fecha_inicio: new Date('2026-08-29T08:00:00.000Z'),
        },
      ]),
    };

    manager.getRepository.mockReturnValue(userRepo);
    evalRepo.createQueryBuilder.mockReturnValue(evalQb);
    intentoRepo.createQueryBuilder.mockReturnValue(intentosQb);

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
    });

    moduloRepo.find.mockResolvedValue([]);

    const result = await repository.checkEligibility(681, 10);

    expect(result).toEqual(
      expect.objectContaining({
        eligible: false,
        reason: 'Has agotado tus intentos permitidos',
        intentos_usados: 2,
        intentos_permitidos: 2,
        hasPassed: false,
      }),
    );

    if (!result.lastAttempt || !result.bestAttempt) {
      throw new Error('Se esperaban lastAttempt y bestAttempt en el resultado');
    }

    expect(result.lastAttempt.id_intento).toBe(100);
    expect(result.bestAttempt.id_intento).toBe(100);
  });

  it('debe permitir iniciar la evaluación cuando el usuario es elegible', async () => {
    const userRepo = {
      findOne: jest.fn().mockResolvedValue({
        id_usuario: 10,
        rol: {
          nombre_rol: 'Estudiante',
        },
      }),
    };

    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id_evaluacion: 20,
        id_curso: 681,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      }),
    };

    const intentosQb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id_intento: 101,
          puntaje_obtenido: 6,
          puntaje_total: 10,
          fecha_inicio: new Date('2026-08-29T10:00:00.000Z'),
        },
        {
          id_intento: 100,
          puntaje_obtenido: 5,
          puntaje_total: 10,
          fecha_inicio: new Date('2026-08-28T10:00:00.000Z'),
        },
      ]),
    };

    manager.getRepository.mockReturnValue(userRepo);
    evalRepo.createQueryBuilder.mockReturnValue(evalQb);
    intentoRepo.createQueryBuilder.mockReturnValue(intentosQb);

    inscripcionRepo.findOne.mockResolvedValue({
      id_inscripcion: 100,
    });

    moduloRepo.find.mockResolvedValue([]);

    const result = await repository.checkEligibility(681, 10);

    expect(result).toEqual(
      expect.objectContaining({
        eligible: true,
        intentos_usados: 2,
        intentos_permitidos: 3,
        hasPassed: false,
      }),
    );

    if (!result.bestAttempt || !result.lastAttempt) {
      throw new Error('Se esperaban bestAttempt y lastAttempt en el resultado');
    }

    expect(result.bestAttempt.porcentaje).toBe(60);
    expect(result.lastAttempt.porcentaje).toBe(60);
  });

  // ============================================================
  // GET EVALUATION INFO
  // ============================================================

  it('debe devolver null cuando se consulta información por slug y el curso no existe', async () => {
    const cursoQb = {
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(null),
    };

    manager.createQueryBuilder.mockReturnValue(cursoQb);

    const result = await repository.getEvaluationInfo('curso-no-existe', 10);

    expect(result).toBeNull();

    expect(cursoQb.where).toHaveBeenCalledWith('c.slug = :slug', {
      slug: 'curso-no-existe',
    });
  });

  it('debe devolver null cuando no existe evaluación disponible', async () => {
    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    evalRepo.createQueryBuilder.mockReturnValue(evalQb);

    const result = await repository.getEvaluationInfo(681, 10);

    expect(result).toBeNull();
  });

  it('debe devolver información completa de la evaluación con intentos calculados', async () => {
    const evaluacion = {
      id_evaluacion: 20,
      id_curso: 681,
      titulo: 'Evaluación Final',
      duracion_minutos: 30,
      puntaje_aprobatorio: 70,
      intentos_permitidos: 3,
      estado: 'Activo',
    };

    const preguntas = [
      {
        id_pregunta: 1,
        id_evaluacion: 20,
      },
      {
        id_pregunta: 2,
        id_evaluacion: 20,
      },
      {
        id_pregunta: 3,
        id_evaluacion: 20,
      },
    ];

    const intentos = [
      {
        id_intento: 101,
        id_usuario: 10,
        puntaje_obtenido: 7,
        puntaje_total: 10,
        fecha_inicio: new Date('2026-08-29T10:00:00.000Z'),
      },
      {
        id_intento: 100,
        id_usuario: 10,
        puntaje_obtenido: 5,
        puntaje_total: 10,
        fecha_inicio: new Date('2026-08-29T09:00:00.000Z'),
      },
    ];

    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(evaluacion),
    };

    const intentosQb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(intentos),
    };

    evalRepo.createQueryBuilder.mockReturnValue(evalQb);

    intentoRepo.createQueryBuilder.mockReturnValue(intentosQb);

    preguntaRepo.find.mockResolvedValue(preguntas);

    const result = await repository.getEvaluationInfo(681, 10);

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba información de la evaluación');
    }

    expect(result).toEqual(
      expect.objectContaining({
        id_evaluacion: 20,
        total_preguntas: 3,
        intentos_usados: 2,
        intentos_permitidos: 3,
        courseTitle: 'Evaluación Final',
        hasPassed: true,
      }),
    );

    expect(result.configuration).toEqual(
      expect.objectContaining({
        totalQuestions: 3,
        timeLimitSeconds: 1800,
        passingPercentage: 70,
        remainingAttempts: 1,
      }),
    );

    expect(result.bestAttempt.porcentaje).toBe(70);

    expect(result.lastAttempt.porcentaje).toBe(70);
  });

  it('debe aceptar un curso por slug existente en getEvaluationInfo', async () => {
    const cursoQb = {
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        id_curso: 681,
      }),
    };

    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id_evaluacion: 20,
        id_curso: 681,
        titulo: 'Examen',
        duracion_minutos: 15,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 2,
      }),
    };

    const intentosQb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    manager.createQueryBuilder.mockReturnValue(cursoQb);

    evalRepo.createQueryBuilder.mockReturnValue(evalQb);

    intentoRepo.createQueryBuilder.mockReturnValue(intentosQb);

    preguntaRepo.find.mockResolvedValue([]);

    const result = await repository.getEvaluationInfo('curso-frontend', 10);

    expect(result).not.toBeNull();

    expect(cursoQb.where).toHaveBeenCalledWith('c.slug = :slug', {
      slug: 'curso-frontend',
    });

    expect(result?.configuration.timeLimitSeconds).toBe(900);

    expect(result?.configuration.remainingAttempts).toBe(2);
  });

  // ============================================================
  // CRUD PREGUNTAS
  // ============================================================

  it('debe buscar una pregunta por ID', async () => {
    const pregunta = {
      id_pregunta: 5,
      id_evaluacion: 20,
      texto: '¿Qué es NestJS?',
      orden: 1,
    };

    preguntaRepo.findOne.mockResolvedValue(pregunta);

    const result = await repository.findPreguntaById(5);

    expect(result).toEqual(pregunta);

    expect(preguntaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_pregunta: 5,
      },
    });
  });

  it('debe crear una pregunta', async () => {
    const data = {
      id_evaluacion: 20,
      texto: '¿Qué es NestJS?',
      puntaje: 5,
      orden: 1,
    };

    const preguntaCreada = {
      id_pregunta: 10,
      ...data,
    };

    preguntaRepo.create.mockImplementation((payload: any) => payload);

    preguntaRepo.save.mockResolvedValue(preguntaCreada);

    const result = await repository.createPregunta(data as any);

    expect(preguntaRepo.create).toHaveBeenCalledWith(data);

    expect(preguntaRepo.save).toHaveBeenCalledWith(data);

    expect(result).toEqual(preguntaCreada);
  });

  it('debe actualizar una pregunta y devolverla nuevamente', async () => {
    const data = {
      texto: 'Pregunta actualizada',
      puntaje: 10,
    };

    const preguntaActualizada = {
      id_pregunta: 10,
      id_evaluacion: 20,
      texto: 'Pregunta actualizada',
      puntaje: 10,
      orden: 1,
    };

    preguntaRepo.update.mockResolvedValue({
      affected: 1,
    });

    jest
      .spyOn(repository, 'findPreguntaById')
      .mockResolvedValue(preguntaActualizada as any);

    const result = await repository.updatePregunta(10, data as any);

    expect(preguntaRepo.update).toHaveBeenCalledWith(
      {
        id_pregunta: 10,
      },
      data,
    );

    expect(repository.findPreguntaById).toHaveBeenCalledWith(10);

    expect(result).toEqual(preguntaActualizada);
  });

  it('debe eliminar una pregunta y sus datos relacionados', async () => {
    respuestaRepo.delete.mockResolvedValue({
      affected: 2,
    });

    opcionRepo.delete.mockResolvedValue({
      affected: 3,
    });

    preguntaRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.deletePregunta(10);

    expect(respuestaRepo.delete).toHaveBeenCalledWith({
      id_pregunta: 10,
    });

    expect(opcionRepo.delete).toHaveBeenCalledWith({
      id_pregunta: 10,
    });

    expect(preguntaRepo.delete).toHaveBeenCalledWith({
      id_pregunta: 10,
    });
  });

  it('debe devolver preguntas paginadas', async () => {
    const preguntas = [
      {
        id_pregunta: 1,
        id_evaluacion: 20,
        orden: 1,
      },
      {
        id_pregunta: 2,
        id_evaluacion: 20,
        orden: 2,
      },
    ];

    preguntaRepo.findAndCount.mockResolvedValue([preguntas, 12]);

    const result = await repository.findAllPreguntas(2, 5);

    expect(result).toEqual({
      data: preguntas,
      total: 12,
      current_page: 2,
      per_page: 5,
      last_page: 3,
    });

    expect(preguntaRepo.findAndCount).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
    });
  });

  // ============================================================
  // CRUD OPCIONES
  // ============================================================

  it('debe devolver las opciones de una pregunta', async () => {
    const opciones = [
      {
        id_opcion: 1,
        id_pregunta: 5,
        texto: 'A',
        es_correcta: true,
      },
      {
        id_opcion: 2,
        id_pregunta: 5,
        texto: 'B',
        es_correcta: false,
      },
    ];

    opcionRepo.find.mockResolvedValue(opciones);

    const result = await repository.findOpciones(5);

    expect(result).toEqual(opciones);

    expect(opcionRepo.find).toHaveBeenCalledWith({
      where: {
        id_pregunta: 5,
      },
    });
  });

  it('debe buscar una opción por ID', async () => {
    const opcion = {
      id_opcion: 10,
      id_pregunta: 5,
      texto: 'Respuesta A',
      es_correcta: true,
    };

    opcionRepo.findOne.mockResolvedValue(opcion);

    const result = await repository.findOpcionById(10);

    expect(result).toEqual(opcion);

    expect(opcionRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_opcion: 10,
      },
    });
  });

  it('debe crear una opción', async () => {
    const data = {
      id_pregunta: 5,
      texto: 'Respuesta A',
      es_correcta: true,
    };

    const opcionCreada = {
      id_opcion: 10,
      ...data,
    };

    opcionRepo.create.mockImplementation((payload: any) => payload);

    opcionRepo.save.mockResolvedValue(opcionCreada);

    const result = await repository.createOpcion(data as any);

    expect(opcionRepo.create).toHaveBeenCalledWith(data);

    expect(opcionRepo.save).toHaveBeenCalledWith(data);

    expect(result).toEqual(opcionCreada);
  });

  it('debe actualizar una opción y devolverla nuevamente', async () => {
    const data = {
      texto: 'Respuesta modificada',
      es_correcta: false,
    };

    const opcionActualizada = {
      id_opcion: 10,
      id_pregunta: 5,
      texto: 'Respuesta modificada',
      es_correcta: false,
    };

    opcionRepo.update.mockResolvedValue({
      affected: 1,
    });

    jest
      .spyOn(repository, 'findOpcionById')
      .mockResolvedValue(opcionActualizada as any);

    const result = await repository.updateOpcion(10, data as any);

    expect(opcionRepo.update).toHaveBeenCalledWith(
      {
        id_opcion: 10,
      },
      data,
    );

    expect(repository.findOpcionById).toHaveBeenCalledWith(10);

    expect(result).toEqual(opcionActualizada);
  });

  it('debe eliminar una opción y sus respuestas asociadas', async () => {
    respuestaRepo.delete.mockResolvedValue({
      affected: 2,
    });

    opcionRepo.delete.mockResolvedValue({
      affected: 1,
    });

    await repository.deleteOpcion(10);

    expect(respuestaRepo.delete).toHaveBeenCalledWith({
      id_opcion: 10,
    });

    expect(opcionRepo.delete).toHaveBeenCalledWith({
      id_opcion: 10,
    });
  });

  it('debe devolver opciones paginadas', async () => {
    const opciones = [
      {
        id_opcion: 1,
        id_pregunta: 5,
        texto: 'A',
      },
      {
        id_opcion: 2,
        id_pregunta: 5,
        texto: 'B',
      },
    ];

    opcionRepo.findAndCount.mockResolvedValue([opciones, 7]);

    const result = await repository.findAllOpciones(2, 3);

    expect(result).toEqual({
      data: opciones,
      total: 7,
      current_page: 2,
      per_page: 3,
      last_page: 3,
    });

    expect(opcionRepo.findAndCount).toHaveBeenCalledWith({
      skip: 3,
      take: 3,
    });
  });

  // ============================================================
  // RESUME SESSION - VÁLIDA
  // ============================================================

  it('debe reanudar una sesión perteneciente al usuario', async () => {
    const intento = {
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'En Progreso',
      fecha_inicio: new Date(),
      evaluacion: {
        id_evaluacion: 20,
        titulo: 'Evaluación Final',
        duracion_minutos: 30,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      },
    };

    intentoRepo.findOne.mockResolvedValue(intento);

    const preguntas = [
      {
        id_pregunta: 1,
        id_evaluacion: 20,
        texto: 'Pregunta 1',
        orden: 1,
      },
    ];

    preguntaRepo.find.mockResolvedValue(preguntas);

    opcionRepo.find.mockResolvedValue([
      {
        id_opcion: 1,
        id_pregunta: 1,
        texto: 'Respuesta A',
        es_correcta: true,
      },
      {
        id_opcion: 2,
        id_pregunta: 1,
        texto: 'Respuesta B',
        es_correcta: false,
      },
    ]);

    const respuestas = [
      {
        id_respuesta: 50,
        id_intento: 100,
        id_pregunta: 1,
        id_opcion: 2,
      },
    ];

    respuestaRepo.find.mockResolvedValue(respuestas);

    const result = await repository.resumeSession(100, 10);

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba una sesión válida');
    }

    expect(result.session).toBeDefined();

    const preguntasResultado = result.session.preguntas as any[];

    expect(preguntasResultado).toHaveLength(1);

    expect(preguntasResultado[0].texto_pregunta).toBe('Pregunta 1');

    expect(preguntasResultado[0].opciones).toEqual([
      {
        id_opcion: 1,
        id_pregunta: 1,
        texto_opcion: 'Respuesta A',
      },
      {
        id_opcion: 2,
        id_pregunta: 1,
        texto_opcion: 'Respuesta B',
      },
    ]);

    expect(preguntasResultado[0].opciones[0].es_correcta).toBeUndefined();

    expect(result.session.respuestas).toEqual(respuestas);

    expect(result.session.evaluacion.configuration).toEqual(
      expect.objectContaining({
        totalQuestions: 1,
        timeLimitSeconds: 1800,
        passingPercentage: 70,
      }),
    );

    expect(intentoRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_intento: 100,
        id_usuario: 10,
      },
      relations: ['evaluacion'],
    });

    expect(respuestaRepo.find).toHaveBeenCalledWith({
      where: {
        id_intento: 100,
      },
    });
  });
  // ============================================================
  // SAVE ANSWER - CASOS ADICIONALES
  // ============================================================

  it('debe devolver null cuando el intento no existe al guardar una respuesta', async () => {
    intentoRepo.findOne.mockResolvedValue(null);

    const result = await repository.saveAnswer(
      100,
      {
        id_pregunta: 5,
        id_opcion: 8,
      } as any,
      10,
    );

    expect(result).toBeNull();

    expect(respuestaRepo.findOne).not.toHaveBeenCalled();
    expect(respuestaRepo.save).not.toHaveBeenCalled();
  });

  it('debe devolver null cuando el intento no está en progreso al guardar una respuesta', async () => {
    intentoRepo.findOne.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'Aprobado',
    });

    const result = await repository.saveAnswer(
      100,
      {
        id_pregunta: 5,
        id_opcion: 8,
      } as any,
      10,
    );

    expect(result).toBeNull();

    expect(preguntaRepo.findOne).not.toHaveBeenCalled();
    expect(respuestaRepo.save).not.toHaveBeenCalled();
  });

  it('debe lanzar un error cuando falta id_pregunta y questionId', async () => {
    intentoRepo.findOne.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'En Progreso',
    });

    await expect(
      repository.saveAnswer(
        100,
        {
          id_opcion: 8,
        } as any,
        10,
      ),
    ).rejects.toThrow(
      'id_pregunta or questionId is required to save an answer',
    );

    expect(preguntaRepo.findOne).not.toHaveBeenCalled();
    expect(respuestaRepo.findOne).not.toHaveBeenCalled();
  });

  it('debe permitir guardar una respuesta usando questionId y selectedOptions', async () => {
    const intento = {
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'En Progreso',
    };

    const pregunta = {
      id_pregunta: 5,
      id_evaluacion: 20,
    };

    const opcion = {
      id_opcion: 8,
      id_pregunta: 5,
    };

    const respuestaNueva = {
      id_intento: 100,
      id_pregunta: 5,
      id_opcion: 8,
    };

    intentoRepo.findOne.mockResolvedValue(intento);
    preguntaRepo.findOne.mockResolvedValue(pregunta);
    opcionRepo.findOne.mockResolvedValue(opcion);
    respuestaRepo.findOne.mockResolvedValue(null);
    respuestaRepo.create.mockReturnValue(respuestaNueva);
    respuestaRepo.save.mockResolvedValue(respuestaNueva);

    const result = await repository.saveAnswer(
      100,
      {
        questionId: 5,
        selectedOptions: [8],
      } as any,
      10,
    );

    expect(preguntaRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_pregunta: 5,
        id_evaluacion: 20,
      },
    });

    expect(opcionRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_opcion: 8,
        id_pregunta: 5,
      },
    });

    expect(respuestaRepo.create).toHaveBeenCalledWith({
      id_intento: 100,
      id_pregunta: 5,
      id_opcion: 8,
      respuesta_texto: undefined,
    });

    expect(result).toEqual(respuestaNueva);
  });

  it('debe actualizar una respuesta existente conservando la opción anterior cuando no se envía una nueva', async () => {
    const respuestaExistente: any = {
      id_respuesta: 50,
      id_intento: 100,
      id_pregunta: 5,
      id_opcion: 8,
      respuesta_texto: 'Respuesta anterior',
    };

    intentoRepo.findOne.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'En Progreso',
    });

    preguntaRepo.findOne.mockResolvedValue({
      id_pregunta: 5,
      id_evaluacion: 20,
    });

    respuestaRepo.findOne.mockResolvedValue(respuestaExistente);

    respuestaRepo.save.mockResolvedValue(respuestaExistente);

    const result = await repository.saveAnswer(
      100,
      {
        id_pregunta: 5,
      } as any,
      10,
    );

    expect(respuestaExistente.id_opcion).toBe(8);

    expect(respuestaExistente.respuesta_texto).toBe('Respuesta anterior');

    expect(respuestaRepo.save).toHaveBeenCalledWith(respuestaExistente);

    expect(result).toEqual(respuestaExistente);
  });

  it('debe actualizar el texto de una respuesta existente cuando se proporciona uno nuevo', async () => {
    const respuestaExistente: any = {
      id_respuesta: 51,
      id_intento: 100,
      id_pregunta: 5,
      id_opcion: null,
      respuesta_texto: 'Texto anterior',
    };

    intentoRepo.findOne.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'En Progreso',
    });

    preguntaRepo.findOne.mockResolvedValue({
      id_pregunta: 5,
      id_evaluacion: 20,
    });

    respuestaRepo.findOne.mockResolvedValue(respuestaExistente);

    respuestaRepo.save.mockResolvedValue(respuestaExistente);

    const result = await repository.saveAnswer(
      100,
      {
        id_pregunta: 5,
        respuesta_texto: 'Texto nuevo',
      } as any,
      10,
    );

    expect(respuestaExistente.respuesta_texto).toBe('Texto nuevo');

    expect(respuestaRepo.save).toHaveBeenCalledWith(respuestaExistente);

    expect(result).toEqual(respuestaExistente);
  });

  // ============================================================
  // SAVE ANSWERS BATCH
  // ============================================================

  it('debe devolver null cuando el intento no existe al guardar respuestas en lote', async () => {
    intentoRepo.findOne.mockResolvedValue(null);

    const result = await repository.saveAnswersBatch(
      100,
      [
        {
          id_pregunta: 5,
          id_opcion: 8,
        } as any,
      ],
      10,
    );

    expect(result).toBeNull();

    expect(respuestaRepo.save).not.toHaveBeenCalled();
  });

  it('debe devolver null cuando el intento no está en progreso al guardar respuestas en lote', async () => {
    intentoRepo.findOne.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'Desaprobado',
    });

    const result = await repository.saveAnswersBatch(
      100,
      [
        {
          id_pregunta: 5,
          id_opcion: 8,
        } as any,
      ],
      10,
    );

    expect(result).toBeNull();

    expect(respuestaRepo.save).not.toHaveBeenCalled();
  });

  it('debe guardar respuestas en lote y devolver todos los resultados', async () => {
    const respuesta1 = {
      id_respuesta: 1,
      id_intento: 100,
      id_pregunta: 5,
      id_opcion: 8,
    };

    const respuesta2 = {
      id_respuesta: 2,
      id_intento: 100,
      id_pregunta: 6,
      id_opcion: 9,
    };

    intentoRepo.findOne
      .mockResolvedValueOnce({
        id_intento: 100,
        id_usuario: 10,
        id_evaluacion: 20,
        estado: 'En Progreso',
      })
      .mockResolvedValueOnce({
        id_intento: 100,
        id_usuario: 10,
        id_evaluacion: 20,
        estado: 'En Progreso',
      })
      .mockResolvedValueOnce({
        id_intento: 100,
        id_usuario: 10,
        id_evaluacion: 20,
        estado: 'En Progreso',
      });

    preguntaRepo.findOne
      .mockResolvedValueOnce({
        id_pregunta: 5,
        id_evaluacion: 20,
      })
      .mockResolvedValueOnce({
        id_pregunta: 6,
        id_evaluacion: 20,
      });

    opcionRepo.findOne
      .mockResolvedValueOnce({
        id_opcion: 8,
        id_pregunta: 5,
      })
      .mockResolvedValueOnce({
        id_opcion: 9,
        id_pregunta: 6,
      });

    respuestaRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    respuestaRepo.create
      .mockReturnValueOnce(respuesta1)
      .mockReturnValueOnce(respuesta2);

    respuestaRepo.save
      .mockResolvedValueOnce(respuesta1)
      .mockResolvedValueOnce(respuesta2);

    const answers = [
      {
        id_pregunta: 5,
        id_opcion: 8,
      },
      {
        id_pregunta: 6,
        id_opcion: 9,
      },
    ] as any[];

    const result = await repository.saveAnswersBatch(100, answers, 10);

    expect(result).toEqual([respuesta1, respuesta2]);

    expect(respuestaRepo.save).toHaveBeenCalledTimes(2);

    expect(preguntaRepo.findOne).toHaveBeenCalledTimes(2);

    expect(opcionRepo.findOne).toHaveBeenCalledTimes(2);
  });

  // ============================================================
  // GET INTENTO
  // ============================================================

  it('debe devolver null cuando el intento no pertenece al usuario', async () => {
    intentoRepo.findOne.mockResolvedValue(null);

    const result = await repository.getIntento(300, 999);

    expect(result).toBeNull();

    expect(intentoRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_intento: 300,
        id_usuario: 999,
      },
      relations: ['evaluacion'],
    });

    expect(respuestaRepo.find).not.toHaveBeenCalled();
  });

  it('debe devolver un intento con porcentaje 0 cuando el puntaje total es 0', async () => {
    const intento = {
      id_intento: 301,
      id_usuario: 10,
      puntaje_obtenido: 0,
      puntaje_total: 0,
      numero_intento: 1,
      evaluacion: {
        intentos_permitidos: 3,
      },
    };

    const respuestas: any[] = [];

    intentoRepo.findOne.mockResolvedValue(intento);

    respuestaRepo.find.mockResolvedValue(respuestas);

    const result = await repository.getIntento(301, 10);

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un intento');
    }

    expect(result.porcentaje).toBe(0);
    expect(result.calificacion).toBe(0);
    expect(result.calificacion_sobre_20).toBe(0);
    expect(result.puntos_obtenidos).toBe(0);
    expect(result.puntos_maximos).toBe(0);
    expect(result.intentos_permitidos).toBe(3);
    expect(result.intentos_realizados).toBe(1);
  });
  // ============================================================
  // SUBMIT EVALUACION - CASOS ADICIONALES
  // ============================================================

  it('debe devolver null cuando el intento no existe al enviar la evaluación', async () => {
    intentoRepo.findOne.mockResolvedValue(null);

    const result = await repository.submitEvaluacion(999, {} as any, 10);

    expect(result).toBeNull();

    expect(respuestaRepo.find).not.toHaveBeenCalled();

    expect(intentoRepo.save).not.toHaveBeenCalled();
  });

  it('debe devolver null cuando el intento ya no está en progreso', async () => {
    intentoRepo.findOne.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
      id_evaluacion: 20,
      estado: 'Aprobado',
      evaluacion: {
        id_curso: 681,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      },
    });

    const result = await repository.submitEvaluacion(100, {} as any, 10);

    expect(result).toBeNull();

    expect(respuestaRepo.find).not.toHaveBeenCalled();

    expect(intentoRepo.save).not.toHaveBeenCalled();
  });

  it('debe guardar las respuestas finales antes de calcular el resultado', async () => {
    const intento = {
      id_intento: 100,
      id_evaluacion: 20,
      id_usuario: 10,
      numero_intento: 1,
      estado: 'En Progreso',
      puntaje_obtenido: 0,
      puntaje_total: 0,
      fecha_inicio: new Date(Date.now() - 60_000),
      evaluacion: {
        id_evaluacion: 20,
        id_curso: 681,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      },
    };

    intentoRepo.findOne.mockResolvedValue(intento);

    respuestaRepo.find.mockResolvedValue([]);

    intentoRepo.save.mockResolvedValue(intento);

    const saveAnswerSpy = jest
      .spyOn(repository, 'saveAnswer')
      .mockResolvedValue({
        id_intento: 100,
        id_pregunta: 1,
        id_opcion: 2,
      } as any);

    const result = await repository.submitEvaluacion(
      100,
      {
        finalAnswers: [
          {
            questionId: 1,
            selectedOptions: [2],
          },
          {
            questionId: 2,
            selectedOptions: [4],
          },
        ],
      } as any,
      10,
    );

    expect(saveAnswerSpy).toHaveBeenCalledTimes(2);

    expect(saveAnswerSpy).toHaveBeenNthCalledWith(
      1,
      100,
      {
        id_pregunta: 1,
        id_opcion: 2,
      },
      10,
    );

    expect(saveAnswerSpy).toHaveBeenNthCalledWith(
      2,
      100,
      {
        id_pregunta: 2,
        id_opcion: 4,
      },
      10,
    );

    expect(result).not.toBeNull();

    saveAnswerSpy.mockRestore();
  });

  it('debe ignorar una pregunta inexistente al calcular el resultado', async () => {
    const intento = {
      id_intento: 100,
      id_evaluacion: 20,
      id_usuario: 10,
      numero_intento: 1,
      estado: 'En Progreso',
      puntaje_obtenido: 0,
      puntaje_total: 0,
      fecha_inicio: new Date(Date.now() - 60_000),
      evaluacion: {
        id_evaluacion: 20,
        id_curso: 681,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      },
    };

    intentoRepo.findOne.mockResolvedValue(intento);

    respuestaRepo.find.mockResolvedValue([
      {
        id_respuesta: 1,
        id_intento: 100,
        id_pregunta: 999,
        id_opcion: 50,
      },
    ]);

    preguntaRepo.findOne.mockResolvedValue(null);

    intentoRepo.save.mockResolvedValue(intento);

    const result = await repository.submitEvaluacion(100, {} as any, 10);

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un resultado');
    }

    expect(result.porcentaje).toBe(0);
    expect(result.calificacion).toBe(0);
    expect(result.calificacion_sobre_20).toBe(0);
    expect(result.aprobado).toBe(false);

    expect(intento.puntaje_total).toBe(0);

    expect(intento.puntaje_obtenido).toBe(0);

    expect(intentoRepo.save).toHaveBeenCalledWith(intento);
  });

  it('debe actualizar un certificado existente cuando la nueva calificación es mayor', async () => {
    const intento = {
      id_intento: 100,
      id_evaluacion: 20,
      id_usuario: 10,
      numero_intento: 2,
      estado: 'En Progreso',
      puntaje_obtenido: 0,
      puntaje_total: 0,
      fecha_inicio: new Date(Date.now() - 60_000),
      evaluacion: {
        id_evaluacion: 20,
        id_curso: 681,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      },
    };

    intentoRepo.findOne.mockResolvedValue(intento);

    respuestaRepo.find.mockResolvedValue([
      {
        id_respuesta: 1,
        id_intento: 100,
        id_pregunta: 1,
        id_opcion: 11,
      },
    ]);

    preguntaRepo.findOne.mockResolvedValue({
      id_pregunta: 1,
      id_evaluacion: 20,
      puntaje: 10,
    });

    opcionRepo.findOne.mockResolvedValue({
      id_opcion: 11,
      id_pregunta: 1,
      es_correcta: true,
    });

    intentoRepo.save.mockResolvedValue(intento);

    const certificacion = {
      id_certificacion: 50,
      id_usuario: 10,
      id_curso: 681,
      calificacion_final: 12,
    };

    const certificacionRepo = {
      findOne: jest.fn().mockResolvedValue(certificacion),
      save: jest.fn().mockResolvedValue(certificacion),
    };

    manager.getRepository.mockReturnValue(certificacionRepo);

    const result = await repository.submitEvaluacion(100, {} as any, 10);

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un resultado aprobado');
    }

    expect(result.aprobado).toBe(true);
    expect(result.porcentaje).toBe(100);
    expect(result.calificacion_sobre_20).toBe(20);

    expect(certificacionRepo.findOne).toHaveBeenCalledWith({
      where: {
        id_usuario: 10,
        id_curso: 681,
      },
    });

    expect(certificacion.calificacion_final).toBe(20);

    expect(certificacionRepo.save).toHaveBeenCalledWith(certificacion);
  });

  it('no debe actualizar un certificado existente cuando la nueva calificación no es mayor', async () => {
    const intento = {
      id_intento: 100,
      id_evaluacion: 20,
      id_usuario: 10,
      numero_intento: 2,
      estado: 'En Progreso',
      puntaje_obtenido: 0,
      puntaje_total: 0,
      fecha_inicio: new Date(Date.now() - 60_000),
      evaluacion: {
        id_evaluacion: 20,
        id_curso: 681,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      },
    };

    intentoRepo.findOne.mockResolvedValue(intento);

    respuestaRepo.find.mockResolvedValue([
      {
        id_respuesta: 1,
        id_intento: 100,
        id_pregunta: 1,
        id_opcion: 11,
      },
    ]);

    preguntaRepo.findOne.mockResolvedValue({
      id_pregunta: 1,
      id_evaluacion: 20,
      puntaje: 10,
    });

    opcionRepo.findOne.mockResolvedValue({
      id_opcion: 11,
      id_pregunta: 1,
      es_correcta: true,
    });

    intentoRepo.save.mockResolvedValue(intento);

    const certificacion = {
      id_certificacion: 50,
      id_usuario: 10,
      id_curso: 681,
      calificacion_final: 20,
    };

    const certificacionRepo = {
      findOne: jest.fn().mockResolvedValue(certificacion),
      save: jest.fn(),
    };

    manager.getRepository.mockReturnValue(certificacionRepo);

    const result = await repository.submitEvaluacion(100, {} as any, 10);

    expect(result).not.toBeNull();

    expect(certificacion.calificacion_final).toBe(20);

    expect(certificacionRepo.save).not.toHaveBeenCalled();
  });

  it('debe conservar la calificación del certificado cuando es menor que la existente', async () => {
    const intento = {
      id_intento: 100,
      id_evaluacion: 20,
      id_usuario: 10,
      numero_intento: 2,
      estado: 'En Progreso',
      puntaje_obtenido: 0,
      puntaje_total: 0,
      fecha_inicio: new Date(Date.now() - 60_000),
      evaluacion: {
        id_evaluacion: 20,
        id_curso: 681,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      },
    };

    intentoRepo.findOne.mockResolvedValue(intento);

    respuestaRepo.find.mockResolvedValue([
      {
        id_respuesta: 1,
        id_intento: 100,
        id_pregunta: 1,
        id_opcion: 11,
      },
    ]);

    preguntaRepo.findOne.mockResolvedValue({
      id_pregunta: 1,
      id_evaluacion: 20,
      puntaje: 8,
    });

    opcionRepo.findOne.mockResolvedValue({
      id_opcion: 11,
      id_pregunta: 1,
      es_correcta: true,
    });

    intentoRepo.save.mockResolvedValue(intento);

    const certificacion = {
      id_certificacion: 50,
      id_usuario: 10,
      id_curso: 681,
      calificacion_final: 20,
    };

    const certificacionRepo = {
      findOne: jest.fn().mockResolvedValue(certificacion),
      save: jest.fn(),
    };

    manager.getRepository.mockReturnValue(certificacionRepo);

    const result = await repository.submitEvaluacion(100, {} as any, 10);

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un resultado');
    }

    expect(result.aprobado).toBe(true);
    expect(result.porcentaje).toBe(100);

    expect(certificacion.calificacion_final).toBe(20);

    expect(certificacionRepo.save).not.toHaveBeenCalled();
  });

  it('debe continuar devolviendo el resultado aunque falle la generación del certificado', async () => {
    const intento = {
      id_intento: 100,
      id_evaluacion: 20,
      id_usuario: 10,
      numero_intento: 1,
      estado: 'En Progreso',
      puntaje_obtenido: 0,
      puntaje_total: 0,
      fecha_inicio: new Date(Date.now() - 60_000),
      evaluacion: {
        id_evaluacion: 20,
        id_curso: 681,
        puntaje_aprobatorio: 70,
        intentos_permitidos: 3,
      },
    };

    intentoRepo.findOne.mockResolvedValue(intento);

    respuestaRepo.find.mockResolvedValue([
      {
        id_respuesta: 1,
        id_intento: 100,
        id_pregunta: 1,
        id_opcion: 11,
      },
    ]);

    preguntaRepo.findOne.mockResolvedValue({
      id_pregunta: 1,
      id_evaluacion: 20,
      puntaje: 10,
    });

    opcionRepo.findOne.mockResolvedValue({
      id_opcion: 11,
      id_pregunta: 1,
      es_correcta: true,
    });

    intentoRepo.save.mockResolvedValue(intento);

    const certificacionRepo = {
      findOne: jest.fn().mockRejectedValue(new Error('Error de base de datos')),
      save: jest.fn(),
    };

    manager.getRepository.mockReturnValue(certificacionRepo);

    const result = await repository.submitEvaluacion(100, {} as any, 10);

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba un resultado');
    }

    expect(result.aprobado).toBe(true);
    expect(result.porcentaje).toBe(100);
    expect(result.calificacion_sobre_20).toBe(20);

    expect(intento.estado).toBe('Aprobado');

    expect(intentoRepo.save).toHaveBeenCalledWith(intento);
  });
  // ============================================================
  // FIND BY CURSO - CASOS ADICIONALES
  // ============================================================

  it('debe devolver las evaluaciones cuando se consulta por slug válido', async () => {
    const cursoQb = {
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        id_curso: 681,
      }),
    };

    const evaluaciones = [
      {
        id_evaluacion: 20,
        id_curso: 681,
        titulo: 'Evaluación Final',
      },
      {
        id_evaluacion: 19,
        id_curso: 681,
        titulo: 'Evaluación Parcial',
      },
    ];

    manager.createQueryBuilder.mockReturnValue(cursoQb);

    evalRepo.find.mockResolvedValue(evaluaciones);

    const result = await repository.findByCurso('curso-final');

    expect(result).toEqual(evaluaciones);

    expect(manager.createQueryBuilder).toHaveBeenCalledWith(
      expect.anything(),
      'c',
    );

    expect(cursoQb.where).toHaveBeenCalledWith('c.slug = :slug', {
      slug: 'curso-final',
    });

    expect(evalRepo.find).toHaveBeenCalledWith({
      where: {
        id_curso: 681,
      },
    });
  });

  it('debe convertir correctamente un cursoId numérico string a número', async () => {
    const evaluaciones = [
      {
        id_evaluacion: 20,
        id_curso: 681,
        titulo: 'Evaluación Final',
      },
    ];

    evalRepo.find.mockResolvedValue(evaluaciones);

    const result = await repository.findByCurso('681');

    expect(result).toEqual(evaluaciones);

    expect(evalRepo.find).toHaveBeenCalledWith({
      where: {
        id_curso: 681,
      },
    });

    expect(manager.createQueryBuilder).not.toHaveBeenCalled();
  });

  // ============================================================
  // DELETE EVALUACION
  // ============================================================

  it('debe eliminar una evaluación sin datos relacionados', async () => {
    intentoRepo.find.mockResolvedValue([]);
    preguntaRepo.find.mockResolvedValue([]);

    await repository.deleteEval(20);

    expect(intentoRepo.find).toHaveBeenCalledWith({
      where: {
        id_evaluacion: 20,
      },
    });

    expect(preguntaRepo.find).toHaveBeenCalledWith({
      where: {
        id_evaluacion: 20,
      },
    });

    expect(respuestaRepo.delete).not.toHaveBeenCalled();

    expect(intentoRepo.delete).not.toHaveBeenCalled();

    expect(opcionRepo.createQueryBuilder).not.toHaveBeenCalled();

    expect(preguntaRepo.delete).not.toHaveBeenCalled();

    expect(evalRepo.delete).toHaveBeenCalledWith({
      id_evaluacion: 20,
    });
  });

  it('debe eliminar una evaluación y todos sus datos relacionados', async () => {
    const intentos = [
      {
        id_intento: 100,
        id_evaluacion: 20,
      },
      {
        id_intento: 101,
        id_evaluacion: 20,
      },
    ];

    const preguntas = [
      {
        id_pregunta: 5,
        id_evaluacion: 20,
      },
      {
        id_pregunta: 6,
        id_evaluacion: 20,
      },
    ];

    const opcionesDeleteQb = {
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({
        affected: 2,
      }),
    };

    intentoRepo.find.mockResolvedValue(intentos);

    preguntaRepo.find.mockResolvedValue(preguntas);

    respuestaRepo.delete.mockResolvedValue({
      affected: 4,
    });

    intentoRepo.delete.mockResolvedValue({
      affected: 2,
    });

    preguntaRepo.delete.mockResolvedValue({
      affected: 2,
    });

    evalRepo.delete.mockResolvedValue({
      affected: 1,
    });

    opcionRepo.createQueryBuilder.mockReturnValue(opcionesDeleteQb);

    await repository.deleteEval(20);

    // Respuestas vinculadas a intentos
    expect(respuestaRepo.delete).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id_intento: expect.anything(),
      }),
    );

    // Eliminación de intentos
    expect(intentoRepo.delete).toHaveBeenCalledWith({
      id_evaluacion: 20,
    });

    // Respuestas vinculadas directamente a preguntas
    expect(respuestaRepo.delete).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id_pregunta: expect.anything(),
      }),
    );

    // Eliminación de opciones
    expect(opcionRepo.createQueryBuilder).toHaveBeenCalled();

    expect(opcionesDeleteQb.delete).toHaveBeenCalled();

    expect(opcionesDeleteQb.where).toHaveBeenCalledWith(
      'id_pregunta IN (:...ids)',
      {
        ids: [5, 6],
      },
    );

    expect(opcionesDeleteQb.execute).toHaveBeenCalled();

    // Eliminación de preguntas
    expect(preguntaRepo.delete).toHaveBeenCalledWith({
      id_evaluacion: 20,
    });

    // Finalmente la evaluación
    expect(evalRepo.delete).toHaveBeenCalledWith({
      id_evaluacion: 20,
    });
  });

  // ============================================================
  // INICIAR EVALUACION - SLUG
  // ============================================================

  it('debe iniciar una evaluación cuando se recibe el curso mediante slug', async () => {
    const cursoQb = {
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        id_curso: 681,
      }),
    };

    const evalQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id_evaluacion: 20,
        id_curso: 681,
        titulo: 'Evaluación Final',
        aleatorio: false,
        duracion_minutos: 30,
      }),
    };

    const intentosQb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(2),
    };

    const intento = {
      id_intento: 103,
      id_evaluacion: 20,
      id_usuario: 10,
      numero_intento: 3,
      estado: 'En Progreso',
    };

    manager.createQueryBuilder.mockReturnValue(cursoQb);

    evalRepo.createQueryBuilder.mockReturnValue(evalQb);

    intentoRepo.createQueryBuilder.mockReturnValue(intentosQb);

    intentoRepo.create.mockReturnValue({
      id_evaluacion: 20,
      id_usuario: 10,
      numero_intento: 3,
      estado: 'En Progreso',
      ip_address: '127.0.0.1',
      user_agent: 'jest-test',
    });

    intentoRepo.save.mockResolvedValue(intento);

    preguntaRepo.find.mockResolvedValue([
      {
        id_pregunta: 1,
        id_evaluacion: 20,
        texto: 'Pregunta 1',
        orden: 1,
      },
    ]);

    opcionRepo.find.mockResolvedValue([
      {
        id_opcion: 1,
        id_pregunta: 1,
        texto: 'Respuesta A',
        es_correcta: true,
      },
    ]);

    const result = await repository.iniciarEvaluacion(
      'curso-final',
      10,
      '127.0.0.1',
      'jest-test',
    );

    expect(result).not.toBeNull();

    if (!result) {
      throw new Error('Se esperaba una evaluación iniciada');
    }

    expect(cursoQb.where).toHaveBeenCalledWith('c.slug = :slug', {
      slug: 'curso-final',
    });

    expect(evalQb.where).toHaveBeenCalledWith('e.id_curso = :cursoId', {
      cursoId: 681,
    });

    expect(intentoRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_evaluacion: 20,
        id_usuario: 10,
        numero_intento: 3,
        estado: 'En Progreso',
        ip_address: '127.0.0.1',
        user_agent: 'jest-test',
        fecha_inicio: expect.any(Date),
      }),
    );

    expect(intentoRepo.save).toHaveBeenCalled();

    expect(result.intento).toEqual(intento);

    expect(result.preguntas).toBeDefined();
  });
});
