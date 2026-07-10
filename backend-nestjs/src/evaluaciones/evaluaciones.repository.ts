import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as crypto from 'crypto';
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
  Curso,
  Usuario,
} from '../entities';
import {
  CreateEvaluacionDto,
  UpdateEvaluacionDto,
  CreatePreguntaDto,
  UpdatePreguntaDto,
  CreateOpcionDto,
  UpdateOpcionDto,
  SubmitEvaluacionDto,
  SaveAnswerDto,
} from './dto/evaluaciones.dto';

@Injectable()
export class EvaluacionesRepository implements OnApplicationBootstrap {
  private readonly logger = new Logger(EvaluacionesRepository.name);

  async onApplicationBootstrap() {
    try {
      const dbName = process.env.DB_DATABASE || 'siteadmin_mis_academy';
      const rows = await this.preguntaRepo.query(`
          SELECT COLUMN_NAME 
          FROM information_schema.columns 
          WHERE table_name = 'preguntas' 
            AND column_name = 'imagen_url' 
            AND table_schema = '${dbName}'
      `);
      if (!rows || rows.length === 0) {
        await this.preguntaRepo.query(`
          ALTER TABLE preguntas ADD imagen_url VARCHAR(255) NULL
        `);
        this.logger.log('Creada columna imagen_url en la tabla preguntas.');
      }
    } catch (err: any) {
      this.logger.error('Error al verificar/crear columna imagen_url:', err.message);
    }
  }

  constructor(
    @InjectRepository(Evaluacion)
    private readonly evalRepo: Repository<Evaluacion>,
    @InjectRepository(Pregunta)
    private readonly preguntaRepo: Repository<Pregunta>,
    @InjectRepository(OpcionRespuesta)
    private readonly opcionRepo: Repository<OpcionRespuesta>,
    @InjectRepository(IntentoEvaluacion)
    private readonly intentoRepo: Repository<IntentoEvaluacion>,
    @InjectRepository(RespuestaUsuario)
    private readonly respuestaRepo: Repository<RespuestaUsuario>,
    @InjectRepository(Inscripcion)
    private readonly inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(ProgresoEstudiante)
    private readonly progresoRepo: Repository<ProgresoEstudiante>,
    @InjectRepository(Modulo) private readonly moduloRepo: Repository<Modulo>,
    @InjectRepository(Leccion)
    private readonly leccionRepo: Repository<Leccion>,
  ) {}

  // CRUD Evaluaciones
  async findAll(page = 1, perPage = 20) {
    const [data, total] = await this.evalRepo.findAndCount({
      relations: ['curso'],
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return {
      data,
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    };
  }

  async findById(id: number) {
    return this.evalRepo.findOne({
      where: { id_evaluacion: id },
      relations: ['curso'],
    });
  }

  async findByCurso(cursoIdOrSlug: number | string) {
    let cursoId: number;
    if (typeof cursoIdOrSlug === 'string' && isNaN(Number(cursoIdOrSlug))) {
      const curso = await this.evalRepo.manager
        .createQueryBuilder(Curso, 'c')
        .where('c.slug = :slug', { slug: cursoIdOrSlug })
        .getRawOne();
      if (!curso) return [];
      cursoId = curso.id_curso;
    } else {
      cursoId = Number(cursoIdOrSlug);
    }
    return this.evalRepo.find({ where: { id_curso: cursoId } });
  }
  
  async createEval(data: CreateEvaluacionDto) {
    return this.evalRepo.save(
      this.evalRepo.create({
        ...data,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      }),
    );
  }
  async updateEval(id: number, data: UpdateEvaluacionDto) {
    await this.evalRepo.update(
      { id_evaluacion: id },
      { ...data, fecha_actualizacion: new Date() },
    );
    return this.findById(id);
  }
  async deleteEval(id: number) {
    // 1. Find all student attempts for this evaluation
    const intentos = await this.intentoRepo.find({
      where: { id_evaluacion: id },
    });

    if (intentos.length > 0) {
      const intentoIds = intentos.map((i) => i.id_intento);

      // 2. Delete user answers associated with these attempts
      await this.respuestaRepo.delete({
        id_intento: In(intentoIds),
      });

      // 3. Delete the attempts
      await this.intentoRepo.delete({
        id_evaluacion: id,
      });
    }

    // 4. Find all questions of the evaluation
    const preguntas = await this.preguntaRepo.find({
      where: { id_evaluacion: id },
    });

    if (preguntas.length > 0) {
      const pIds = preguntas.map((p) => p.id_pregunta);

      // 5. Delete user answers referencing these questions (safety check)
      await this.respuestaRepo.delete({
        id_pregunta: In(pIds),
      });

      // 6. Delete options for these questions
      await this.opcionRepo
        .createQueryBuilder()
        .delete()
        .where('id_pregunta IN (:...ids)', { ids: pIds })
        .execute();

      // 7. Delete questions
      await this.preguntaRepo.delete({ id_evaluacion: id });
    }

    // 8. Delete the evaluation itself
    await this.evalRepo.delete({ id_evaluacion: id });
  }

  // CRUD Preguntas
  async findPreguntas(evalId: number) {
    return this.preguntaRepo.find({
      where: { id_evaluacion: evalId },
      relations: ['opciones'],
      order: { orden: 'ASC' },
    });
  }
  async findPreguntaById(id: number) {
    return this.preguntaRepo.findOne({ where: { id_pregunta: id } });
  }
  async createPregunta(data: CreatePreguntaDto) {
    return this.preguntaRepo.save(this.preguntaRepo.create(data));
  }
  async updatePregunta(id: number, data: UpdatePreguntaDto) {
    await this.preguntaRepo.update({ id_pregunta: id }, data);
    return this.findPreguntaById(id);
  }
  async deletePregunta(id: number) {
    // 1. Delete user answers referencing this question
    await this.respuestaRepo.delete({ id_pregunta: id });
    // 2. Delete options for this question
    await this.opcionRepo.delete({ id_pregunta: id });
    // 3. Delete the question itself
    await this.preguntaRepo.delete({ id_pregunta: id });
  }
  async findAllPreguntas(page = 1, perPage = 20) {
    const [data, total] = await this.preguntaRepo.findAndCount({
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return {
      data,
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    };
  }

  // CRUD Opciones
  async findOpciones(preguntaId: number) {
    return this.opcionRepo.find({ where: { id_pregunta: preguntaId } });
  }
  async findOpcionById(id: number) {
    return this.opcionRepo.findOne({ where: { id_opcion: id } });
  }
  async createOpcion(data: CreateOpcionDto) {
    return this.opcionRepo.save(this.opcionRepo.create(data));
  }
  async updateOpcion(id: number, data: UpdateOpcionDto) {
    await this.opcionRepo.update({ id_opcion: id }, data);
    return this.findOpcionById(id);
  }
  async deleteOpcion(id: number) {
    // 1. Delete user answers referencing this option
    await this.respuestaRepo.delete({ id_opcion: id });
    // 2. Delete the option itself
    await this.opcionRepo.delete({ id_opcion: id });
  }
  async findAllOpciones(page = 1, perPage = 20) {
    const [data, total] = await this.opcionRepo.findAndCount({
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return {
      data,
      total,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    };
  }

  // Check eligibility
  async checkEligibility(cursoIdOrSlug: number | string, userId: number) {
    let cursoId: number;
    if (typeof cursoIdOrSlug === 'string' && isNaN(Number(cursoIdOrSlug))) {
      const curso = await this.evalRepo.manager
        .createQueryBuilder(Curso, 'c')
        .where('c.slug = :slug', { slug: cursoIdOrSlug })
        .getRawOne();
      if (!curso) return { eligible: false, reason: 'Curso no encontrado' };
      cursoId = curso.id_curso;
    } else {
      cursoId = Number(cursoIdOrSlug);
    }

    // 1. Obtener usuario y verificar si es Master (Administrador/Docente)
    const user = await this.evalRepo.manager.getRepository(Usuario).findOne({
      where: { id_usuario: userId },
      relations: ['rol'],
    });
    const isMaster =
      user &&
      ['Administrador', 'Instructor', 'Docente'].includes(user.rol?.nombre_rol);

    // 2. Verificar inscripción (solo si NO es master)
    const inscripcion = await this.inscripcionRepo.findOne({
      where: { id_usuario: userId, id_curso: cursoId },
    });

    if (!inscripcion && !isMaster) {
      return { eligible: false, reason: 'No estás inscrito en este curso' };
    }

    // 3. Verificar progreso (solo si NO es master)
    const modulos = await this.moduloRepo.find({
      where: { id_curso: cursoId },
    });
    const moduloIds = modulos.map((m) => m.id_modulo);

    if (moduloIds.length > 0 && !isMaster && inscripcion) {
      const totalLecciones = await this.leccionRepo
        .createQueryBuilder('l')
        .where('l.id_modulo IN (:...ids)', { ids: moduloIds })
        .getCount();
      const completadas = await this.progresoRepo
        .createQueryBuilder('p')
        .where('p.id_inscripcion = :insc', { insc: inscripcion.id_inscripcion })
        .andWhere('p.estado = :est', { est: 'Completado' })
        .getCount();

      this.logger.debug(`[EVAL-CHECK] Curso: ${cursoId}, Usuario: ${userId}, Progreso: ${completadas}/${totalLecciones}, isMaster: ${isMaster}`);

      if (completadas < totalLecciones) {
        return {
          eligible: false,
          reason: `Debes completar todas las lecciones (${completadas}/${totalLecciones})`,
          completadas,
          totalLecciones,
        };
      }
    }

    const eval_ = await this.evalRepo
      .createQueryBuilder('e')
      .where('e.id_curso = :cursoId', { cursoId })
      .andWhere('e.estado IN (:...stats)', { stats: ['Activo', 'Publicado'] })
      .orderBy('e.id_evaluacion', 'DESC')
      .getOne();

    this.logger.debug(
      `[EVAL-CHECK] Evaluación seleccionada: ${eval_ ? `${eval_.titulo} (ID: ${eval_.id_evaluacion})` : 'NINGUNA'}`,
    );

    if (!eval_)
      return {
        eligible: false,
        reason: 'No hay evaluación disponible para este curso',
      };

    // Buscar TODOS los intentos del usuario en este CURSO (independientemente del ID de evaluación)
    const intentosRaw = await this.intentoRepo
      .createQueryBuilder('i')
      .innerJoin('evaluaciones', 'e', 'i.id_evaluacion = e.id_evaluacion')
      .where('e.id_curso = :cursoId AND i.id_usuario = :userId', {
        cursoId,
        userId,
      })
      .orderBy('i.fecha_inicio', 'DESC')
      .getMany();

    const intentosCount = intentosRaw.length;
    this.logger.debug(
      `[DEBUG-ELIGIBILITY] Usuario: ${userId}, Curso: ${cursoId}, Total Intentos en el curso: ${intentosCount}`,
    );

    // Calcular porcentajes para cada intento
    const intentosConPorcentaje = intentosRaw.map((i) => {
      const porcentaje =
        i.puntaje_total > 0
          ? (Number(i.puntaje_obtenido) / Number(i.puntaje_total)) * 100
          : 0;
      return { ...i, porcentaje };
    });

    const lastAttempt = intentosConPorcentaje[0] || null;
    const bestAttempt =
      [...intentosConPorcentaje].sort((a, b) => b.porcentaje - a.porcentaje)[0] ||
      null;
    const hasPassed =
      bestAttempt &&
      bestAttempt.porcentaje >= Number(eval_.puntaje_aprobatorio);

    if (!isMaster) {
      if (bestAttempt && Math.round(bestAttempt.porcentaje) >= 100) {
        return {
          eligible: false,
          reason: 'Ya has alcanzado la calificación máxima en esta evaluación',
          intentos_usados: intentosCount,
          intentos_permitidos: eval_.intentos_permitidos,
          lastAttempt,
          bestAttempt,
          hasPassed,
        };
      }

      if (intentosCount >= eval_.intentos_permitidos) {
        return {
          eligible: false,
          reason: 'Has agotado tus intentos permitidos',
          intentos_usados: intentosCount,
          intentos_permitidos: eval_.intentos_permitidos,
          lastAttempt,
          bestAttempt,
          hasPassed,
        };
      }
    }

    return {
      eligible: true,
      configuration: eval_,
      intentos_usados: intentosCount,
      intentos_permitidos: eval_.intentos_permitidos,
      lastAttempt,
      bestAttempt,
      hasPassed,
    };
  }

  // Get evaluation info
  async getEvaluationInfo(cursoIdOrSlug: number | string, userId: number) {
    let cursoId: number;
    if (typeof cursoIdOrSlug === 'string' && isNaN(Number(cursoIdOrSlug))) {
      const curso = await this.evalRepo.manager
        .createQueryBuilder(Curso, 'c')
        .where('c.slug = :slug', { slug: cursoIdOrSlug })
        .getRawOne();
      if (!curso) return null;
      cursoId = curso.id_curso;
    } else {
      cursoId = Number(cursoIdOrSlug);
    }

    const eval_ = await this.evalRepo
      .createQueryBuilder('e')
      .where('e.id_curso = :cursoId', { cursoId })
      .andWhere('e.estado IN (:...stats)', { stats: ['Activo', 'Publicado'] })
      .orderBy('e.id_evaluacion', 'DESC')
      .getOne();
    if (!eval_) return null;
    const preguntas = await this.preguntaRepo.find({
      where: { id_evaluacion: eval_.id_evaluacion },
    });
    // Buscar TODOS los intentos del usuario en este CURSO (independientemente del ID de evaluación)
    const intentosRaw = await this.intentoRepo
      .createQueryBuilder('i')
      .innerJoin('evaluaciones', 'e', 'i.id_evaluacion = e.id_evaluacion')
      .where('e.id_curso = :cursoId AND i.id_usuario = :userId', {
        cursoId,
        userId,
      })
      .orderBy('i.fecha_inicio', 'DESC')
      .getMany();

    this.logger.debug(
      `[DEBUG-EVAL] Usuario: ${userId}, Curso: ${cursoId}, Intentos en el curso: ${intentosRaw.length}`,
    );

    const intentosConPorcentaje = intentosRaw.map((i) => {
      const porcentaje =
        i.puntaje_total > 0
          ? (Number(i.puntaje_obtenido) / Number(i.puntaje_total)) * 100
          : 0;
      return { ...i, porcentaje };
    });

    const lastAttempt = intentosConPorcentaje[0] || null;
    const bestAttempt =
      intentosConPorcentaje.sort((a, b) => b.porcentaje - a.porcentaje)[0] ||
      null;
    const hasPassed =
      bestAttempt &&
      bestAttempt.porcentaje >= Number(eval_.puntaje_aprobatorio);

    return {
      ...eval_,
      configuration: {
        ...eval_,
        totalQuestions: preguntas.length,
        timeLimitSeconds: (eval_.duracion_minutos || 30) * 60,
        passingPercentage: eval_.puntaje_aprobatorio,
        remainingAttempts: eval_.intentos_permitidos - intentosRaw.length,
      },
      total_preguntas: preguntas.length,
      intentos_usados: intentosRaw.length,
      lastAttempt,
      bestAttempt,
      hasPassed,
      courseTitle: eval_.titulo,
      rules: [
        `Puntaje mínimo para aprobar: ${eval_.puntaje_aprobatorio}%`,
        `Tiempo disponible: ${eval_.duracion_minutos} minutos`,
        `Número de intentos: ${eval_.intentos_permitidos}`,
        'Una vez iniciada, no podrás pausar la evaluación.',
        'Asegúrate de tener una conexión a internet estable.',
      ],
    };
  }

  // Start evaluation
  async iniciarEvaluacion(
    cursoIdOrSlug: number | string,
    userId: number,
    ip: string,
    userAgent: string,
  ) {
    let cursoId: number;
    if (typeof cursoIdOrSlug === 'string' && isNaN(Number(cursoIdOrSlug))) {
      const curso = await this.evalRepo.manager
        .createQueryBuilder(Curso, 'c')
        .where('c.slug = :slug', { slug: cursoIdOrSlug })
        .getRawOne();
      if (!curso) return null;
      cursoId = curso.id_curso;
    } else {
      cursoId = Number(cursoIdOrSlug);
    }

    const eval_ = await this.evalRepo
      .createQueryBuilder('e')
      .where('e.id_curso = :cursoId', { cursoId })
      .andWhere('e.estado IN (:...stats)', { stats: ['Activo', 'Publicado'] })
      .orderBy('e.id_evaluacion', 'DESC')
      .getOne();
    if (!eval_) return null;

    const intentosCount = await this.intentoRepo
      .createQueryBuilder('i')
      .innerJoin('evaluaciones', 'e', 'i.id_evaluacion = e.id_evaluacion')
      .where('e.id_curso = :cursoId AND i.id_usuario = :userId', {
        cursoId,
        userId,
      })
      .getCount();
    const intento = await this.intentoRepo.save(
      this.intentoRepo.create({
        id_evaluacion: eval_.id_evaluacion,
        id_usuario: userId,
        numero_intento: intentosCount + 1,
        estado: 'En Progreso',
        fecha_inicio: new Date(),
        ip_address: ip,
        user_agent: userAgent,
      }),
    );

    let preguntas = await this.preguntaRepo.find({
      where: { id_evaluacion: eval_.id_evaluacion },
      order: { orden: 'ASC' },
    });
    if (eval_.aleatorio) preguntas = preguntas.sort(() => Math.random() - 0.5);

    for (const p of preguntas as any[]) {
      p.opciones = await this.opcionRepo.find({
        where: { id_pregunta: p.id_pregunta },
      });
      // Remove es_correcta for student
      p.texto_pregunta = p.texto;
      p.opciones = p.opciones.map((o: any) => ({
        id_opcion: o.id_opcion,
        id_pregunta: o.id_pregunta,
        texto_opcion: o.texto,
      }));
    }

    return { intento, preguntas, evaluacion: eval_ };
  }

  // Resume session
  async resumeSession(intentoId: number) {
    const intento = await this.intentoRepo.findOne({
      where: { id_intento: intentoId },
      relations: ['evaluacion'],
    });
    if (!intento || intento.estado !== 'En Progreso') return null;

    // Verificar si el tiempo límite ya expiró
    if (intento.fecha_inicio && intento.evaluacion?.duracion_minutos) {
      const limitMs = intento.evaluacion.duracion_minutos * 60 * 1000;
      const elapsed = Date.now() - new Date(intento.fecha_inicio).getTime();
      if (elapsed >= limitMs) {
        intento.estado = 'Tiempo Agotado';
        intento.fecha_fin = new Date();
        await this.intentoRepo.save(intento);
        return null;
      }
    }

    const preguntas = await this.preguntaRepo.find({
      where: { id_evaluacion: intento.id_evaluacion },
      order: { orden: 'ASC' },
    });
    for (const p of preguntas as any[]) {
      p.texto_pregunta = p.texto;
      p.opciones = (
        await this.opcionRepo.find({ where: { id_pregunta: p.id_pregunta } })
      ).map((o: any) => ({
        id_opcion: o.id_opcion,
        id_pregunta: o.id_pregunta,
        texto_opcion: o.texto,
      }));
    }

    const respuestas = await this.respuestaRepo.find({
      where: { id_intento: intentoId },
    });
    return {
      session: {
        ...intento,
        preguntas,
        respuestas: respuestas,
        evaluacion: {
          ...intento.evaluacion,
          configuration: {
            ...intento.evaluacion,
            totalQuestions: preguntas.length,
            timeLimitSeconds: (intento.evaluacion?.duracion_minutos || 30) * 60,
            passingPercentage: intento.evaluacion?.puntaje_aprobatorio,
          },
        },
      },
    };
  }

  // Save answer
  async saveAnswer(intentoId: number, data: SaveAnswerDto) {
    const idPregunta = data.id_pregunta ?? data.questionId;
    const idOpcion = data.id_opcion ?? data.selectedOptions?.[0];

    if (!idPregunta) {
      throw new Error('id_pregunta or questionId is required to save an answer');
    }

    let resp = await this.respuestaRepo.findOne({
      where: { id_intento: intentoId, id_pregunta: idPregunta },
    });
    if (resp) {
      resp.id_opcion = idOpcion ?? resp.id_opcion;
      resp.respuesta_texto = data.respuesta_texto || resp.respuesta_texto;
    } else {
      resp = this.respuestaRepo.create({
        id_intento: intentoId,
        id_pregunta: idPregunta,
        id_opcion: idOpcion,
        respuesta_texto: data.respuesta_texto,
      }) as any;
    }
    return this.respuestaRepo.save(resp as any);
  }

  // Save answers batch
  async saveAnswersBatch(intentoId: number, answers: SaveAnswerDto[]) {
    const results = [];
    for (const a of answers) {
      results.push(await this.saveAnswer(intentoId, a));
    }
    return results;
  }

  // Submit evaluation
  async submitEvaluacion(intentoId: number, data: SubmitEvaluacionDto) {
    const intento = await this.intentoRepo.findOne({
      where: { id_intento: intentoId },
      relations: ['evaluacion'],
    });
    if (!intento) return null;

    // Save final answers if provided
    if (data.finalAnswers?.length) {
      for (const a of data.finalAnswers) {
        await this.saveAnswer(intentoId, {
          id_pregunta: a.questionId,
          id_opcion: a.selectedOptions?.[0], // Tomamos la primera opción para selección única
        });
      }
    }

    // Calculate score
    const respuestas = await this.respuestaRepo.find({
      where: { id_intento: intentoId },
    });
    let puntajeTotal = 0;
    let puntajeObtenido = 0;

    for (const resp of respuestas) {
      const pregunta = await this.preguntaRepo.findOne({
        where: { id_pregunta: resp.id_pregunta },
      });
      if (!pregunta) continue;
      puntajeTotal += Number(pregunta.puntaje);

      if (resp.id_opcion) {
        const opcion = await this.opcionRepo.findOne({
          where: { id_opcion: resp.id_opcion },
        });
        if (opcion?.es_correcta) {
          puntajeObtenido += Number(pregunta.puntaje);
          resp.puntos_obtenidos = Number(pregunta.puntaje);
          await this.respuestaRepo.save(resp);
        }
      }
    }

    const porcentaje =
      puntajeTotal > 0 ? (puntajeObtenido / puntajeTotal) * 100 : 0;
    const aprobado =
      porcentaje >= Number(intento.evaluacion.puntaje_aprobatorio);

    intento.puntaje_obtenido = puntajeObtenido;
    intento.puntaje_total = puntajeTotal;
    intento.estado = aprobado ? 'Aprobado' : 'Desaprobado';
    intento.fecha_fin = new Date();
    if (intento.fecha_inicio) {
      intento.tiempo_usado_segundos = Math.floor(
        (new Date().getTime() - new Date(intento.fecha_inicio).getTime()) /
          1000,
      );
    }
    await this.intentoRepo.save(intento);

    // --- AUTOMATIZACIÓN DE CERTIFICADO ---
    if (aprobado) {
      try {
        const cursoId = intento.evaluacion.id_curso;
        const userId = intento.id_usuario;

        // Verificar si ya existe un certificado para este curso y usuario
        const existe = await this.evalRepo.manager
          .getRepository('Certificacion')
          .findOne({
            where: { id_usuario: userId, id_curso: cursoId },
          });

        if (!existe) {
          const usuario = await this.evalRepo.manager
            .getRepository('Usuario')
            .findOne({ where: { id_usuario: userId } });
          const nombreEstudiante = usuario
            ? `${usuario.nombre} ${usuario.apellido}`
            : 'Estudiante';

          const codigo =
            'CERT-' + crypto.randomBytes(6).toString('hex').toUpperCase();

          await this.evalRepo.manager.getRepository('Certificacion').save({
            id_usuario: userId,
            id_curso: cursoId,
            nombre_estudiante: nombreEstudiante,
            codigo_certificado: codigo,
            calificacion_final: porcentaje,
            tipo_certificado: 'Certificado de Aprobación',
            fecha_emision: new Date(),
            estado: 'Activo',
            created_at: new Date(),
          });
          this.logger.log(
            `[CERTIFICACION] Generada para usuario ${userId} en curso ${cursoId} con nota ${porcentaje}`,
          );
        } else {
          if (porcentaje > existe.calificacion_final) {
            existe.calificacion_final = porcentaje;
            await this.evalRepo.manager
              .getRepository('Certificacion')
              .save(existe);
            this.logger.log(
              `[CERTIFICACION] Calificación actualizada para usuario ${userId} en curso ${cursoId} a ${porcentaje}`,
            );
          }
        }
      } catch (e: any) {
        this.logger.error(
          `[CERTIFICACION] Error al generar automáticamente: ${e?.message}`,
        );
      }
    }
    // -------------------------------------

    return {
      ...intento,
      puntos_obtenidos: intento.puntaje_obtenido,
      puntos_maximos: intento.puntaje_total,
      porcentaje: porcentaje,
      calificacion: Math.round(porcentaje),
      puntaje_requerido: intento.evaluacion.puntaje_aprobatorio,
      aprobado: aprobado,
      estado_texto: aprobado ? 'Aprobado' : 'Reprobado',
      intentos_permitidos: intento.evaluacion.intentos_permitidos,
      intentos_realizados: intento.numero_intento,
    };
  }

  // Get attempt results
  async getIntento(intentoId: number) {
    const intento = await this.intentoRepo.findOne({
      where: { id_intento: intentoId },
      relations: ['evaluacion'],
    });
    if (!intento) return null;
    const respuestas = await this.respuestaRepo.find({
      where: { id_intento: intentoId },
      relations: ['pregunta', 'opcion'],
    });
    const porcentaje =
      intento.puntaje_total > 0
        ? (Number(intento.puntaje_obtenido) / Number(intento.puntaje_total)) * 100
        : 0;
    return {
      ...intento,
      respuestas,
      puntos_obtenidos: intento.puntaje_obtenido,
      puntos_maximos: intento.puntaje_total,
      porcentaje: porcentaje,
      calificacion: Math.round(porcentaje),
      intentos_permitidos: intento.evaluacion?.intentos_permitidos,
      intentos_realizados: intento.numero_intento,
    };
  }
}
