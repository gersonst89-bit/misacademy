import { Test, TestingModule } from '@nestjs/testing';
import { EvaluacionesService } from './evaluaciones.service';
import { EvaluacionesRepository } from './evaluaciones.repository';

describe('EvaluacionesService', () => {
  let service: EvaluacionesService;

  let evalRepo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findByCurso: jest.Mock;

    createEval: jest.Mock;
    updateEval: jest.Mock;
    deleteEval: jest.Mock;

    findPreguntas: jest.Mock;
    findAllPreguntas: jest.Mock;
    createPregunta: jest.Mock;
    updatePregunta: jest.Mock;
    deletePregunta: jest.Mock;

    findOpciones: jest.Mock;
    findAllOpciones: jest.Mock;
    createOpcion: jest.Mock;
    updateOpcion: jest.Mock;
    deleteOpcion: jest.Mock;

    checkEligibility: jest.Mock;
    getEvaluationInfo: jest.Mock;
    iniciarEvaluacion: jest.Mock;

    resumeSession: jest.Mock;
    saveAnswer: jest.Mock;
    saveAnswersBatch: jest.Mock;
    submitEvaluacion: jest.Mock;
    getIntento: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    evalRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCurso: jest.fn(),

      createEval: jest.fn(),
      updateEval: jest.fn(),
      deleteEval: jest.fn(),

      findPreguntas: jest.fn(),
      findAllPreguntas: jest.fn(),
      createPregunta: jest.fn(),
      updatePregunta: jest.fn(),
      deletePregunta: jest.fn(),

      findOpciones: jest.fn(),
      findAllOpciones: jest.fn(),
      createOpcion: jest.fn(),
      updateOpcion: jest.fn(),
      deleteOpcion: jest.fn(),

      checkEligibility: jest.fn(),
      getEvaluationInfo: jest.fn(),
      iniciarEvaluacion: jest.fn(),

      resumeSession: jest.fn(),
      saveAnswer: jest.fn(),
      saveAnswersBatch: jest.fn(),
      submitEvaluacion: jest.fn(),
      getIntento: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluacionesService,
        {
          provide: EvaluacionesRepository,
          useValue: evalRepo,
        },
      ],
    }).compile();

    service = module.get<EvaluacionesService>(EvaluacionesService);
  });

  // ============================================================
  // BASIC
  // ============================================================

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ============================================================
  // EVALUACIONES CRUD
  // ============================================================

  it('debe devolver todas las evaluaciones', async () => {
    const expected = {
      data: [
        {
          id_evaluacion: 1,
          titulo: 'Evaluación final',
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 20,
      last_page: 1,
    };

    evalRepo.findAll.mockResolvedValue(expected);

    const result = await service.findAll(1, 20);

    expect(result).toEqual(expected);

    expect(evalRepo.findAll).toHaveBeenCalledWith(1, 20);
  });

  it('debe devolver una evaluación existente', async () => {
    const evaluacion = {
      id_evaluacion: 10,
      id_curso: 681,
      titulo: 'Evaluación final',
    };

    evalRepo.findById.mockResolvedValue(evaluacion);

    const result = await service.findById(10);

    expect(result).toEqual(evaluacion);
    expect(evalRepo.findById).toHaveBeenCalledWith(10);
  });

  it('debe rechazar una evaluación inexistente', async () => {
    evalRepo.findById.mockResolvedValue(null);

    await expect(service.findById(999)).rejects.toThrow(
      'Evaluación no encontrada',
    );

    expect(evalRepo.findById).toHaveBeenCalledWith(999);
  });

  it('debe crear una evaluación', async () => {
    const dto = {
      id_curso: 681,
      titulo: 'Evaluación final',
    };

    const created = {
      id_evaluacion: 15,
      ...dto,
    };

    evalRepo.createEval.mockResolvedValue(created);

    const result = await service.create(dto as any);

    expect(result).toEqual(created);
    expect(evalRepo.createEval).toHaveBeenCalledWith(dto);
  });

  it('debe actualizar una evaluación', async () => {
    const dto = {
      titulo: 'Evaluación final actualizada',
    };

    const updated = {
      id_evaluacion: 15,
      ...dto,
    };

    evalRepo.updateEval.mockResolvedValue(updated);

    const result = await service.update(15, dto as any);

    expect(result).toEqual(updated);
    expect(evalRepo.updateEval).toHaveBeenCalledWith(15, dto);
  });

  it('debe eliminar una evaluación correctamente', async () => {
    evalRepo.deleteEval.mockResolvedValue(undefined);

    const result = await service.delete(15);

    expect(result).toEqual({
      message: 'Evaluación eliminada',
    });

    expect(evalRepo.deleteEval).toHaveBeenCalledWith(15);
  });

  // ============================================================
  // PREGUNTAS
  // ============================================================

  it('debe devolver las preguntas de una evaluación', async () => {
    const preguntas = [
      {
        id_pregunta: 1,
        id_evaluacion: 10,
        texto: '¿Qué es una API?',
      },
    ];

    evalRepo.findPreguntas.mockResolvedValue(preguntas);

    const result = await service.findPreguntas(10);

    expect(result).toEqual(preguntas);
    expect(evalRepo.findPreguntas).toHaveBeenCalledWith(10);
  });

  it('debe crear una pregunta', async () => {
    const dto = {
      id_evaluacion: 10,
      texto: '¿Qué es una API?',
      puntaje: 5,
    };

    const pregunta = {
      id_pregunta: 20,
      ...dto,
    };

    evalRepo.createPregunta.mockResolvedValue(pregunta);

    const result = await service.createPregunta(dto as any);

    expect(result).toEqual(pregunta);
    expect(evalRepo.createPregunta).toHaveBeenCalledWith(dto);
  });

  it('debe eliminar una pregunta', async () => {
    evalRepo.deletePregunta.mockResolvedValue(undefined);

    const result = await service.deletePregunta(20);

    expect(result).toEqual({
      message: 'Pregunta eliminada',
    });

    expect(evalRepo.deletePregunta).toHaveBeenCalledWith(20);
  });

  // ============================================================
  // OPCIONES
  // ============================================================

  it('debe devolver las opciones de una pregunta', async () => {
    const opciones = [
      {
        id_opcion: 1,
        id_pregunta: 20,
        texto: 'Respuesta A',
      },
      {
        id_opcion: 2,
        id_pregunta: 20,
        texto: 'Respuesta B',
      },
    ];

    evalRepo.findOpciones.mockResolvedValue(opciones);

    const result = await service.findOpciones(20);

    expect(result).toEqual(opciones);
    expect(evalRepo.findOpciones).toHaveBeenCalledWith(20);
  });

  it('debe crear una opción', async () => {
    const dto = {
      id_pregunta: 20,
      texto: 'Respuesta correcta',
      es_correcta: true,
    };

    const opcion = {
      id_opcion: 5,
      ...dto,
    };

    evalRepo.createOpcion.mockResolvedValue(opcion);

    const result = await service.createOpcion(dto as any);

    expect(result).toEqual(opcion);
    expect(evalRepo.createOpcion).toHaveBeenCalledWith(dto);
  });

  it('debe eliminar una opción', async () => {
    evalRepo.deleteOpcion.mockResolvedValue(undefined);

    const result = await service.deleteOpcion(5);

    expect(result).toEqual({
      message: 'Opción eliminada',
    });

    expect(evalRepo.deleteOpcion).toHaveBeenCalledWith(5);
  });

  // ============================================================
  // EVALUATION FLOW
  // ============================================================

  it('debe devolver la elegibilidad del estudiante', async () => {
    const eligibility = {
      eligible: true,
      intentos_usados: 1,
      intentos_permitidos: 3,
    };

    evalRepo.checkEligibility.mockResolvedValue(eligibility);

    const result = await service.checkEligibility(681, 10);

    expect(result).toEqual(eligibility);

    expect(evalRepo.checkEligibility).toHaveBeenCalledWith(681, 10);
  });

  it('debe devolver la información de la evaluación', async () => {
    const info = {
      id_evaluacion: 10,
      courseTitle: 'Fundamentos de IA',
      total_preguntas: 10,
      intentos_usados: 1,
      intentos_permitidos: 3,
    };

    evalRepo.getEvaluationInfo.mockResolvedValue(info);

    const result = await service.getEvaluationInfo(681, 10);

    expect(result).toEqual(info);

    expect(evalRepo.getEvaluationInfo).toHaveBeenCalledWith(681, 10);
  });

  // ============================================================
  // START EVALUATION
  // ============================================================

  it('debe iniciar una evaluación cuando el usuario es elegible', async () => {
    const eligibility = {
      eligible: true,
    };

    const session = {
      intento: {
        id_intento: 100,
        id_usuario: 10,
        id_evaluacion: 20,
      },
      preguntas: [],
      evaluacion: {
        id_evaluacion: 20,
      },
    };

    evalRepo.checkEligibility.mockResolvedValue(eligibility);

    evalRepo.iniciarEvaluacion.mockResolvedValue(session);

    const result = await service.iniciar(681, 10, '127.0.0.1', 'jest-test');

    expect(result).toEqual(session);

    expect(evalRepo.checkEligibility).toHaveBeenCalledWith(681, 10);

    expect(evalRepo.iniciarEvaluacion).toHaveBeenCalledWith(
      681,
      10,
      '127.0.0.1',
      'jest-test',
    );
  });

  it('debe rechazar iniciar una evaluación cuando el usuario no es elegible', async () => {
    evalRepo.checkEligibility.mockResolvedValue({
      eligible: false,
      reason: 'No estás inscrito en este curso',
    });

    await expect(
      service.iniciar(681, 10, '127.0.0.1', 'jest-test'),
    ).rejects.toThrow('No estás inscrito en este curso');

    expect(evalRepo.iniciarEvaluacion).not.toHaveBeenCalled();
  });

  it('debe rechazar iniciar cuando no existe una evaluación disponible', async () => {
    evalRepo.checkEligibility.mockResolvedValue({
      eligible: true,
    });

    evalRepo.iniciarEvaluacion.mockResolvedValue(null);

    await expect(
      service.iniciar(681, 10, '127.0.0.1', 'jest-test'),
    ).rejects.toThrow('No hay evaluación disponible');

    expect(evalRepo.iniciarEvaluacion).toHaveBeenCalled();
  });

  // ============================================================
  // SESSION OWNERSHIP
  // ============================================================

  it('debe validar correctamente la propiedad de un intento', async () => {
    evalRepo.getIntento.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
      estado: 'En Progreso',
    });

    const result = await service.verifySessionOwnership(100, 10);

    expect(result).toEqual({
      status: 'ok',
    });

    expect(evalRepo.getIntento).toHaveBeenCalledWith(100, 10);
  });

  it('debe rechazar un intento inexistente', async () => {
    evalRepo.getIntento.mockResolvedValue(null);

    await expect(service.verifySessionOwnership(100, 10)).rejects.toThrow(
      'Intento no encontrado',
    );
  });

  it('debe rechazar un intento que pertenece a otro usuario', async () => {
    evalRepo.getIntento.mockResolvedValue({
      id_intento: 100,
      id_usuario: 50,
      estado: 'En Progreso',
    });

    await expect(service.verifySessionOwnership(100, 10)).rejects.toThrow(
      'Intento no encontrado',
    );

    expect(evalRepo.getIntento).toHaveBeenCalledWith(100, 10);
  });

  // ============================================================
  // RESUME SESSION
  // ============================================================

  it('debe reanudar una sesión perteneciente al usuario', async () => {
    const session = {
      session: {
        id_intento: 100,
        id_usuario: 10,
        estado: 'En Progreso',
      },
    };

    evalRepo.getIntento.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
    });

    evalRepo.resumeSession.mockResolvedValue(session);

    const result = await service.resumeSession(100, 10);

    expect(result).toEqual(session);

    expect(evalRepo.getIntento).toHaveBeenCalledWith(100, 10);

    expect(evalRepo.resumeSession).toHaveBeenCalledWith(100, 10);
  });

  it('debe rechazar cuando la sesión no existe', async () => {
    evalRepo.getIntento.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
    });

    evalRepo.resumeSession.mockResolvedValue(null);

    await expect(service.resumeSession(100, 10)).rejects.toThrow(
      'Sesión no encontrada',
    );
  });

  // ============================================================
  // ANSWERS
  // ============================================================

  it('debe guardar una respuesta cuando el intento pertenece al usuario', async () => {
    const answer = {
      id_respuesta: 1,
      id_intento: 100,
      id_pregunta: 20,
    };

    evalRepo.getIntento.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
    });

    evalRepo.saveAnswer.mockResolvedValue(answer);

    const dto = {
      id_pregunta: 20,
      id_opcion: 5,
    };

    const result = await service.saveAnswer(100, dto as any, 10);

    expect(result).toEqual(answer);

    expect(evalRepo.getIntento).toHaveBeenCalledWith(100, 10);

    expect(evalRepo.saveAnswer).toHaveBeenCalledWith(100, dto, 10);
  });

  it('debe guardar respuestas en lote cuando el intento pertenece al usuario', async () => {
    const answers = [
      {
        id_pregunta: 20,
        id_opcion: 5,
      },
      {
        id_pregunta: 21,
        id_opcion: 8,
      },
    ];

    const expected = [{ id_respuesta: 1 }, { id_respuesta: 2 }];

    evalRepo.getIntento.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
    });

    evalRepo.saveAnswersBatch.mockResolvedValue(expected);

    const result = await service.saveAnswersBatch(100, answers as any, 10);

    expect(result).toEqual(expected);

    expect(evalRepo.getIntento).toHaveBeenCalledWith(100, 10);

    expect(evalRepo.saveAnswersBatch).toHaveBeenCalledWith(100, answers, 10);
  });

  // ============================================================
  // SUBMIT
  // ============================================================

  it('debe enviar una evaluación cuando el intento pertenece al usuario', async () => {
    const submitted = {
      id_intento: 100,
      aprobado: true,
      porcentaje: 85,
      calificacion_sobre_20: 17,
    };

    evalRepo.getIntento.mockResolvedValue({
      id_intento: 100,
      id_usuario: 10,
    });

    evalRepo.submitEvaluacion.mockResolvedValue(submitted);

    const dto = {
      finalAnswers: [],
    };

    const result = await service.submit(100, dto as any, 10);

    expect(result).toEqual(submitted);

    expect(evalRepo.getIntento).toHaveBeenCalledWith(100, 10);

    expect(evalRepo.submitEvaluacion).toHaveBeenCalledWith(100, dto, 10);
  });

  it('debe rechazar el envío cuando el intento no existe', async () => {
    evalRepo.getIntento.mockResolvedValue(null);

    await expect(service.submit(100, {} as any, 10)).rejects.toThrow(
      'Intento no encontrado',
    );

    expect(evalRepo.submitEvaluacion).not.toHaveBeenCalled();
  });

  // ============================================================
  // GET ATTEMPT
  // ============================================================

  it('debe devolver los resultados de un intento propio', async () => {
    const intento = {
      id_intento: 100,
      id_usuario: 10,
      puntaje_obtenido: 18,
      puntaje_total: 20,
    };

    evalRepo.getIntento
      .mockResolvedValueOnce(intento)
      .mockResolvedValueOnce(intento);

    const result = await service.getIntento(100, 10);

    expect(result).toEqual(intento);

    expect(evalRepo.getIntento).toHaveBeenCalledWith(100, 10);
  });

  it('debe rechazar consultar un intento inexistente', async () => {
    evalRepo.getIntento.mockResolvedValue(null);

    await expect(service.getIntento(999, 10)).rejects.toThrow(
      'Intento no encontrado',
    );
  });
});
