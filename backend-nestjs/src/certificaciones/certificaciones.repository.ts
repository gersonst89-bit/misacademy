import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, QueryFailedError, Repository } from 'typeorm';
import { Certificacion } from '../entities/certificacion.entity';
import * as crypto from 'crypto';

@Injectable()
export class CertificacionesRepository {
  constructor(
    @InjectRepository(Certificacion)
    private readonly repo: Repository<Certificacion>,
  ) {}

  async findAll(
    page: number = 1,
    perPage: number = 20,
    tipoCertificado?: string,
    programa?: string,
    cursoId?: number,
    busqueda?: string,
  ) {
    const pageNum = Math.max(Number(page) || 1, 1);

    const perPageNum = Math.min(Math.max(Number(perPage) || 20, 1), 100);

    const query = this.repo
      .createQueryBuilder('cert')
      .leftJoinAndSelect('cert.usuario', 'usuario')
      .leftJoinAndSelect('cert.curso', 'curso');

    if (tipoCertificado === 'adicional') {
      query.andWhere('cert.tipo_certificado = :tipo', {
        tipo: 'adicional',
      });
    }

    if (tipoCertificado === 'empresa') {
      query.andWhere('cert.tipo_certificado <> :tipo', {
        tipo: 'adicional',
      });
    }

    if (programa) {
      query.andWhere(
        'LOWER(TRIM(cert.nombre_curso)) = LOWER(TRIM(:programa))',
        { programa },
      );
    }

    if (cursoId) {
      query.andWhere('cert.id_curso = :cursoId', {
        cursoId,
      });
    }

    const termino = busqueda?.trim().replace(/\s+/g, ' ');

    if (termino) {
      const patron = `%${termino.toLowerCase()}%`;

      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(cert.codigo_certificado) LIKE :patron', { patron })
            .orWhere(
              "LOWER(COALESCE(cert.nombre_estudiante, '')) LIKE :patron",
              { patron },
            )
            .orWhere(
              `LOWER(CONCAT_WS(' ', COALESCE(usuario.nombre, ''), COALESCE(usuario.apellido, ''))) LIKE :patron`,
              { patron },
            )
            .orWhere("LOWER(COALESCE(cert.nombre_curso, '')) LIKE :patron", {
              patron,
            })
            .orWhere("LOWER(COALESCE(curso.nombre, '')) LIKE :patron", {
              patron,
            });
        }),
      );
    }

    query
      .orderBy('cert.id_certificacion', 'DESC')
      .skip((pageNum - 1) * perPageNum)
      .take(perPageNum);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      currentPage: pageNum,
      perPage: perPageNum,
      lastPage: Math.max(1, Math.ceil(total / perPageNum)),
    };
  }

  async findProgramas(): Promise<string[]> {
    const rows = await this.repo
      .createQueryBuilder('cert')
      .select('cert.nombre_curso', 'nombre')
      .where('cert.tipo_certificado = :tipo', {
        tipo: 'adicional',
      })
      .andWhere('cert.nombre_curso IS NOT NULL')
      .andWhere(`TRIM(cert.nombre_curso) <> ''`)
      .groupBy('cert.nombre_curso')
      .orderBy('cert.nombre_curso', 'ASC')
      .getRawMany();

    return rows.map((row) => String(row.nombre).trim()).filter(Boolean);
  }

  async findById(id: number) {
    return this.repo.findOne({
      where: { id_certificacion: id },
      relations: ['usuario', 'curso'],
    });
  }

  async findByUsuario(userId: number) {
    return this.repo.find({
      where: { id_usuario: userId },
      relations: ['curso'],
    });
  }

  async findByCodigo(codigo: string) {
    return this.repo.findOne({
      where: { codigo_certificado: codigo },
      relations: ['usuario', 'curso'],
    });
  }
  private quitarAcentosSQL(expr: string): string {
    const pares: [string, string][] = [
      ['á', 'a'],
      ['é', 'e'],
      ['í', 'i'],
      ['ó', 'o'],
      ['ú', 'u'],
      ['à', 'a'],
      ['è', 'e'],
      ['ì', 'i'],
      ['ò', 'o'],
      ['ù', 'u'],
      ['ä', 'a'],
      ['ë', 'e'],
      ['ï', 'i'],
      ['ö', 'o'],
      ['ü', 'u'],
      ['ñ', 'n'],
    ];

    return pares.reduce(
      (acc, [con, sin]) => `REPLACE(${acc}, '${con}', '${sin}')`,
      `LOWER(${expr})`,
    );
  }

  async buscar(query: string, tipo?: string) {
    const q = (query || '').trim().replace(/\s+/g, ' ');
    const fullName = q.toLowerCase().replace(/\s+/g, ' ').trim();

    if (tipo === 'codigo') {
      return this.repo.find({
        where: [{ codigo_certificado: q }],
        relations: ['usuario', 'curso'],
      });
    } else if (tipo === 'dni') {
      return this.repo
        .createQueryBuilder('cert')
        .leftJoinAndSelect('cert.usuario', 'usuario')
        .leftJoinAndSelect('cert.curso', 'curso')
        .where('usuario.dni = :dni', { dni: q })
        .orWhere('cert.dni_estudiante = :dni', { dni: q })
        .getMany();
    } else if (tipo === 'nombre') {
      const tokens = fullName
        .split(' ')
        .map((token) => token.trim())
        .filter(Boolean);

      if (tokens.length < 2) {
        throw new BadRequestException(
          'Ingresa el nombre completo, incluyendo al menos un apellido.',
        );
      }

      const queryBuilder = this.repo
        .createQueryBuilder('cert')
        .leftJoinAndSelect('cert.usuario', 'usuario')
        .leftJoinAndSelect('cert.curso', 'curso');

      const parameters: Record<string, string> = {};

      const conditions = tokens.map((token, index) => {
        const parameterName = `nombreToken${index}`;
        parameters[parameterName] = token;

        const nombreEstudianteExpr = this.quitarAcentosSQL(
          `COALESCE(cert.nombre_estudiante, '')`,
        );
        const nombreUsuarioExpr = this.quitarAcentosSQL(
          `CONCAT_WS(' ', COALESCE(usuario.nombre, ''), COALESCE(usuario.apellido, ''))`,
        );

        return `
    (
      ${nombreEstudianteExpr} REGEXP
        CONCAT('(^|[[:space:]-])', :${parameterName}, '([[:space:]-]|$)')
      OR ${nombreUsuarioExpr} REGEXP
        CONCAT('(^|[[:space:]-])', :${parameterName}, '([[:space:]-]|$)')
    )
  `;
      });

      queryBuilder.where(
        new Brackets((subQuery) => {
          conditions.forEach((condition, index) => {
            if (index === 0) {
              subQuery.where(condition);
            } else {
              subQuery.andWhere(condition);
            }
          });
        }),
      );

      return queryBuilder.setParameters(parameters).getMany();
    } else {
      return this.repo
        .createQueryBuilder('cert')
        .leftJoinAndSelect('cert.usuario', 'usuario')
        .leftJoinAndSelect('cert.curso', 'curso')
        .where('cert.codigo_certificado = :codigo', { codigo: q })
        .orWhere(
          `LOWER(REPLACE(TRIM(cert.nombre_estudiante), '  ', ' ')) = :nombre`,
          { nombre: fullName },
        )
        .orWhere(
          `LOWER(REPLACE(TRIM(CONCAT_WS(' ', usuario.nombre, usuario.apellido)), '  ', ' ')) = :nombre`,
          { nombre: fullName },
        )
        .orWhere('usuario.dni = :dni', { dni: q })
        .orWhere('cert.dni_estudiante = :dni', { dni: q })
        .getMany();
    }
  }

  async create(data: any): Promise<Certificacion> {
    const generatedCodigo =
      'CERT-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const horasValue =
      data.total_horas !== undefined && data.total_horas !== null
        ? Number(data.total_horas)
        : data.horas !== undefined && data.horas !== null
          ? Number(data.horas)
          : null;

    const entityData: DeepPartial<Certificacion> = {
      nombre_estudiante: data.nombre_estudiante,
      dni_estudiante: data.dni_estudiante ?? null,
      nombre_curso: data.nombre_curso ?? null,
      tipo_certificado: data.tipo_certificado ?? 'Certificado de Aprobación',
      descripcion: data.descripcion ?? null,
      horas: horasValue,
      calificacion_final:
        data.calificacion_final !== undefined &&
        data.calificacion_final !== null
          ? Number(data.calificacion_final)
          : null,
      codigo_certificado: data.codigo_certificado ?? generatedCodigo,
      email_destinatario: data.email_destinatario ?? null,
      fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : null,
      fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
      fecha_emision: data.fecha_emision
        ? new Date(data.fecha_emision)
        : new Date(),
      estado: 'Activo',
      created_at: new Date(),
      id_usuario: data.id_usuario ?? null,
      id_curso: data.id_curso ?? null,
    };

    const nuevaCertificacion = this.repo.create(entityData);

    return this.repo.save(nuevaCertificacion);
  }

  async update(id: number, data: any) {
    const updateData: any = {};

    if (data.nombre_estudiante !== undefined)
      updateData.nombre_estudiante = data.nombre_estudiante;
    if (data.dni_estudiante !== undefined)
      updateData.dni_estudiante = data.dni_estudiante;
    if (data.nombre_curso !== undefined) {
      updateData.nombre_curso = data.nombre_curso ?? null;
    }
    if (data.tipo_certificado !== undefined)
      updateData.tipo_certificado = data.tipo_certificado;
    if (data.descripcion !== undefined) {
      updateData.descripcion = data.descripcion ?? null;
    }
    if (data.email_destinatario !== undefined) {
      updateData.email_destinatario = data.email_destinatario ?? null;
    }
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.calificacion_final !== undefined)
      updateData.calificacion_final = data.calificacion_final;

    // Map total_horas to horas
    if (data.total_horas !== undefined) {
      updateData.horas = Number(data.total_horas);
    } else if (data.horas !== undefined) {
      updateData.horas = Number(data.horas);
    }

    // Convert string dates to Date objects
    if (data.fecha_inicio !== undefined) {
      updateData.fecha_inicio = data.fecha_inicio
        ? new Date(data.fecha_inicio)
        : null;
    }

    if (data.fecha_fin !== undefined) {
      updateData.fecha_fin = data.fecha_fin ? new Date(data.fecha_fin) : null;
    }

    if (data.fecha_emision !== undefined) {
      updateData.fecha_emision = data.fecha_emision
        ? new Date(data.fecha_emision)
        : null;
    }
    updateData.updated_at = new Date();

    await this.repo.update({ id_certificacion: id }, updateData);
    return this.findById(id);
  }

  async obtenerOCrear(userId: number, cursoId: number) {
    const existente = await this.repo.findOne({
      where: {
        id_usuario: userId,
        id_curso: cursoId,
      },
    });

    if (existente) {
      return existente;
    }

    const usuario = await this.repo.manager.getRepository('Usuario').findOne({
      where: {
        id_usuario: userId,
      },
    });

    const curso = await this.repo.manager.getRepository('Curso').findOne({
      where: {
        id_curso: cursoId,
      },
    });

    const intentos = await this.repo.manager.query(
      `
    SELECT
      i.puntaje_obtenido,
      i.puntaje_total
    FROM intentos_evaluacion i
    INNER JOIN evaluaciones e
      ON i.id_evaluacion = e.id_evaluacion
    WHERE i.id_usuario = ?
      AND e.id_curso = ?
      AND i.estado = 'Aprobado'
      AND i.puntaje_total > 0
    LIMIT 1
    `,
      [userId, cursoId],
    );

    // Protección: no crear certificados sin un intento válido.
    if (!intentos || intentos.length === 0) {
      throw new BadRequestException(
        'No existe un intento aprobado válido para generar el certificado.',
      );
    }

    const puntajeObtenido = Number(intentos[0].puntaje_obtenido);

    const puntajeTotal = Number(intentos[0].puntaje_total);

    // Protección adicional contra valores inválidos.
    if (
      !Number.isFinite(puntajeObtenido) ||
      !Number.isFinite(puntajeTotal) ||
      puntajeTotal <= 0
    ) {
      throw new BadRequestException(
        'El intento aprobado no tiene una puntuación válida para generar el certificado.',
      );
    }

    const calificacion = (puntajeObtenido / puntajeTotal) * 20;

    const fechaFin = new Date();

    const semanas =
      curso?.tiempo && Number(curso.tiempo) > 0 ? Number(curso.tiempo) : 4;

    const fechaInicio = new Date(
      fechaFin.getTime() - semanas * 7 * 24 * 60 * 60 * 1000,
    );

    const nombreEstudiante = usuario
      ? `${usuario.nombre} ${usuario.apellido}`.trim().replace(/\s+/g, ' ')
      : 'Estudiante';

    const codigoCertificado =
      'CERT-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const nuevaCertificacion = this.repo.create({
      id_usuario: userId,
      id_curso: cursoId,
      codigo_certificado: codigoCertificado,
      nombre_estudiante: nombreEstudiante,
      nombre_curso: curso?.nombre ?? 'Curso',
      calificacion_final: calificacion,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      horas: curso?.duracion_horas ?? 0,
      estado: 'Activo',
      fecha_emision: fechaFin,
      created_at: fechaFin,
    });

    try {
      return await this.repo.save(nuevaCertificacion);
    } catch (error) {
      const dbError = error as QueryFailedError & {
        driverError?: {
          code?: string;
        };
      };

      const esDuplicado =
        dbError.driverError?.code === 'ER_DUP_ENTRY' ||
        dbError.driverError?.code === '1062';

      if (!esDuplicado) {
        throw error;
      }

      const certificadoExistente = await this.repo.findOne({
        where: {
          id_usuario: userId,
          id_curso: cursoId,
        },
      });

      if (!certificadoExistente) {
        throw error;
      }

      return certificadoExistente;
    }
  }

  async delete(id: number) {
    return this.repo.delete({ id_certificacion: id });
  }

  async findUsuarioById(idUsuario: number) {
    return this.repo.manager.getRepository('Usuario').findOne({
      where: {
        id_usuario: idUsuario,
      },
    });
  }

  async tieneIntentoAprobado(
    userId: number,
    cursoId: number,
  ): Promise<boolean> {
    const intentos = await this.repo.manager.query(
      `
      SELECT i.id_intento
      FROM intentos_evaluacion i
      INNER JOIN evaluaciones e
        ON i.id_evaluacion = e.id_evaluacion
      WHERE i.id_usuario = ?
        AND e.id_curso = ?
        AND i.estado = 'Aprobado'
      LIMIT 1
    `,
      [userId, cursoId],
    );

    return intentos.length > 0;
  }
}
