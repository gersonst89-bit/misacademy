import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Usuario,
  Curso,
  Inscripcion,
  Pago,
  Certificacion,
  LineaAcademica,
  ProgresoEstudiante,
} from '../entities';

@Injectable()
export class EstadisticasRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Curso)
    private readonly cursoRepo: Repository<Curso>,

    @InjectRepository(Inscripcion)
    private readonly inscripcionRepo: Repository<Inscripcion>,

    @InjectRepository(Pago)
    private readonly pagoRepo: Repository<Pago>,

    @InjectRepository(Certificacion)
    private readonly certificacionRepo: Repository<Certificacion>,

    @InjectRepository(LineaAcademica)
    private readonly lineaRepo: Repository<LineaAcademica>,

    @InjectRepository(ProgresoEstudiante)
    private readonly progresoRepo: Repository<ProgresoEstudiante>,
  ) {}

  // =========================================================
  // DASHBOARD GENERAL
  // =========================================================

  async getDashboard() {
    // -------------------------------------------------------
    // KPIs
    // -------------------------------------------------------

    const totalUsuarios = await this.usuarioRepo.count();

    const totalEstudiantes = await this.usuarioRepo.count({
      where: {
        id_rol: 3,
        estado: 'Activo',
      },
    });

    const totalCursos = await this.cursoRepo.count();

    const totalCertificados = await this.certificacionRepo.count();

    const totalInscripciones = await this.inscripcionRepo.count();

    const totalPagos = await this.pagoRepo.count({
      where: {
        estado: 'Completado',
      },
    });

    const ingresoTotal = await this.pagoRepo
      .createQueryBuilder('p')
      .where('p.estado = :estado', {
        estado: 'Completado',
      })
      .select('SUM(p.monto_total)', 'total')
      .getRawOne();

    // -------------------------------------------------------
    // ACTIVIDAD / COMPRAS RECIENTES
    // -------------------------------------------------------

    const actividadReciente = await this.pagoRepo
      .createQueryBuilder('p')

      .innerJoin('detalle_pagos', 'dp', 'dp.id_pago = p.id_pago')

      .leftJoin('usuarios', 'u', 'u.id_usuario = p.id_usuario')

      .leftJoin('cursos', 'c', 'c.id_curso = dp.id_curso')

      .leftJoin('rutas_academicas', 'r', 'r.id_ruta = dp.id_ruta')

      .where('p.estado = :estado', {
        estado: 'Completado',
      })

      .select('dp.id_detalle', 'id_actividad')

      .addSelect('p.fecha_pago', 'fecha_actividad')

      .addSelect('u.id_usuario', 'id_usuario')

      .addSelect('u.nombre', 'usuario_nombre')

      .addSelect('u.apellido', 'usuario_apellido')

      .addSelect('u.email', 'usuario_email')

      .addSelect('c.id_curso', 'id_curso')

      .addSelect('c.nombre', 'curso_nombre')

      .addSelect('r.id_ruta', 'id_ruta')

      .addSelect('r.nombre', 'ruta_nombre')

      .addSelect(
        `
          CASE
            WHEN dp.id_ruta IS NOT NULL THEN 'ruta'
            WHEN dp.id_curso IS NOT NULL THEN 'curso'
            ELSE 'desconocido'
          END
        `,
        'tipo',
      )

      .orderBy('p.fecha_pago', 'DESC')

      .addOrderBy('dp.id_detalle', 'DESC')

      .take(10)

      .getRawMany();

    const inscripcionesRecientes = actividadReciente.map((item) => ({
      id_actividad: String(item.id_actividad),

      tipo: item.tipo,

      fecha_inscripcion: item.fecha_actividad,

      usuario: {
        id_usuario: Number(item.id_usuario),

        nombre: item.usuario_nombre,

        apellido: item.usuario_apellido,

        email: item.usuario_email,
      },

      curso: item.curso_nombre
        ? {
            id_curso: Number(item.id_curso),

            nombre: item.curso_nombre,
          }
        : null,

      ruta: item.ruta_nombre
        ? {
            id_ruta: Number(item.id_ruta),

            nombre: item.ruta_nombre,
          }
        : null,
    }));

    // -------------------------------------------------------
    // PAGOS RECIENTES
    // -------------------------------------------------------

    const pagosRecientes = await this.pagoRepo.find({
      relations: ['usuario'],
      order: {
        fecha_pago: 'DESC',
      },
      take: 10,
    });

    return {
      totalUsuarios,
      totalEstudiantes,
      totalCursos,
      totalCertificados,
      totalInscripciones,
      totalPagos,
      ingresoTotal: ingresoTotal?.total || 0,
      inscripcionesRecientes,
      pagosRecientes,
    };
  }

  // =========================================================
  // ESTUDIANTES POR LÍNEA ACADÉMICA
  // =========================================================

  async getEstudiantesPorLinea() {
    const data = await this.lineaRepo
      .createQueryBuilder('la')

      .leftJoin(
        'rutas_academicas',
        'ra',
        'ra.id_linea_academica = la.id_linea_academica',
      )

      .leftJoin('inscripciones_rutas', 'ir', 'ir.id_ruta = ra.id_ruta')

      .select('la.nombre', 'nombre_linea')

      .addSelect('COUNT(DISTINCT ir.id_usuario)', 'total_estudiantes')

      .groupBy('la.id_linea_academica')

      .addGroupBy('la.nombre')

      .orderBy('total_estudiantes', 'DESC')

      .getRawMany();

    return {
      status: 'success',

      lineas_academicas: data.map((d) => ({
        nombre_linea: d.nombre_linea,

        total_estudiantes: parseInt(d.total_estudiantes, 10) || 0,
      })),
    };
  }

  // =========================================================
  // RETENCIÓN MENSUAL REAL
  // =========================================================
  //
  // Definición:
  //
  // De los estudiantes que tuvieron actividad de aprendizaje
  // durante el MES ANTERIOR, ¿cuántos volvieron a tener
  // actividad durante el MES ACTUAL?
  //
  // Actividad = progreso_estudiante.ultima_actividad
  //
  // Solo consideramos usuarios con id_rol = 3.
  //
  // Ejemplo:
  //
  // Julio:
  // 20 estudiantes activos académicamente
  //
  // Agosto:
  // 15 de esos 20 volvieron
  //
  // Retención = 15 / 20 * 100 = 75%
  // =========================================================

  async getRetencionMensual() {
    const ahora = new Date();

    // Primer día del mes actual
    const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    // Primer día del mes siguiente
    const inicioMesSiguiente = new Date(
      ahora.getFullYear(),
      ahora.getMonth() + 1,
      1,
    );

    // Primer día del mes anterior
    const inicioMesAnterior = new Date(
      ahora.getFullYear(),
      ahora.getMonth() - 1,
      1,
    );

    // -------------------------------------------------------
    // Estudiantes con actividad durante el mes anterior
    // -------------------------------------------------------

    const estudiantesMesAnterior = await this.progresoRepo
      .createQueryBuilder('p')
      .innerJoin('inscripciones', 'i', 'i.id_inscripcion = p.id_inscripcion')
      .innerJoin('usuarios', 'u', 'u.id_usuario = i.id_usuario')
      .select('DISTINCT i.id_usuario', 'id_usuario')
      .where('u.id_rol = :rol', {
        rol: 3,
      })
      .andWhere('p.ultima_actividad >= :inicioAnterior', {
        inicioAnterior: inicioMesAnterior,
      })
      .andWhere('p.ultima_actividad < :inicioActual', {
        inicioActual: inicioMesActual,
      })
      .andWhere('p.ultima_actividad IS NOT NULL')
      .getRawMany();

    const cohorteAnterior = estudiantesMesAnterior.map((item) =>
      Number(item.id_usuario),
    );

    // -------------------------------------------------------
    // No existe cohorte anterior
    // -------------------------------------------------------

    if (cohorteAnterior.length === 0) {
      return {
        status: 'success',

        hay_datos: false,

        mes_actual: ahora.toLocaleString('es-ES', {
          month: 'long',
        }),

        porcentaje_retencion: '0%',

        estudiantes_mes_anterior: 0,

        estudiantes_retenidos: 0,
      };
    }

    // -------------------------------------------------------
    // Estudiantes de esa cohorte que volvieron este mes
    // -------------------------------------------------------

    const estudiantesRetenidos = await this.progresoRepo
      .createQueryBuilder('p')
      .innerJoin('inscripciones', 'i', 'i.id_inscripcion = p.id_inscripcion')
      .innerJoin('usuarios', 'u', 'u.id_usuario = i.id_usuario')
      .select('COUNT(DISTINCT i.id_usuario)', 'total_retenidos')
      .where('u.id_rol = :rol', {
        rol: 3,
      })
      .andWhere('i.id_usuario IN (:...usuarios)', {
        usuarios: cohorteAnterior,
      })
      .andWhere('p.ultima_actividad >= :inicioActual', {
        inicioActual: inicioMesActual,
      })
      .andWhere('p.ultima_actividad < :inicioSiguiente', {
        inicioSiguiente: inicioMesSiguiente,
      })
      .andWhere('p.ultima_actividad IS NOT NULL')
      .getRawOne();

    const totalAnterior = cohorteAnterior.length;

    const totalRetenidos =
      parseInt(estudiantesRetenidos?.total_retenidos, 10) || 0;

    const porcentaje = Math.round((totalRetenidos / totalAnterior) * 100);

    return {
      status: 'success',

      hay_datos: true,

      mes_actual: ahora.toLocaleString('es-ES', {
        month: 'long',
      }),

      porcentaje_retencion: `${porcentaje}%`,

      estudiantes_mes_anterior: totalAnterior,

      estudiantes_retenidos: totalRetenidos,
    };
  }

  // =========================================================
  // CURSOS MÁS VENDIDOS DEL MES
  // =========================================================

  async getMasVendidosMes() {
    const data = await this.pagoRepo
      .createQueryBuilder('p')

      .innerJoin('detalle_pagos', 'dp', 'dp.id_pago = p.id_pago')

      .innerJoin('cursos', 'c', 'c.id_curso = dp.id_curso')

      .where('p.estado = :estado', {
        estado: 'Completado',
      })

      .andWhere('p.fecha_pago IS NOT NULL')

      .andWhere('YEAR(p.fecha_pago) = YEAR(CURRENT_DATE())')

      .andWhere('MONTH(p.fecha_pago) = MONTH(CURRENT_DATE())')

      .select('c.id_curso', 'id_curso')

      .addSelect('c.nombre', 'nombre_curso')

      .addSelect('COUNT(dp.id_detalle)', 'total_ventas')

      .groupBy('c.id_curso')

      .addGroupBy('c.nombre')

      .orderBy('total_ventas', 'DESC')

      .limit(5)

      .getRawMany();

    return {
      status: 'success',

      cursos_mas_vendidos: data.map((d) => ({
        id_curso: parseInt(d.id_curso, 10),

        nombre_curso: d.nombre_curso,

        total_ventas: parseInt(d.total_ventas, 10) || 0,
      })),
    };
  }

  // =========================================================
  // ESTUDIANTES INSCRITOS POR MES
  // =========================================================

  async getEstudiantesInscritosPorMes() {
    const data = await this.inscripcionRepo
      .createQueryBuilder('i')

      .select("DATE_FORMAT(i.fecha_inscripcion, '%Y-%m')", 'mes')

      .addSelect('COUNT(DISTINCT i.id_usuario)', 'total_estudiantes')

      .where('i.fecha_inscripcion IS NOT NULL')

      .groupBy("DATE_FORMAT(i.fecha_inscripcion, '%Y-%m')")

      .orderBy('mes', 'ASC')

      .getRawMany();

    return {
      status: 'success',

      estudiantes_por_mes: data.map((d) => ({
        mes: d.mes,

        total_estudiantes: parseInt(d.total_estudiantes, 10) || 0,
      })),
    };
  }
}
