import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, Curso, Inscripcion, Pago, Evaluacion, IntentoEvaluacion, Certificacion, LineaAcademica } from '../entities';
@Injectable()
export class EstadisticasRepository {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Curso) private readonly cursoRepo: Repository<Curso>,
    @InjectRepository(Inscripcion) private readonly inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(Pago) private readonly pagoRepo: Repository<Pago>,
    @InjectRepository(Certificacion) private readonly certificacionRepo: Repository<Certificacion>,
    @InjectRepository(LineaAcademica) private readonly lineaRepo: Repository<LineaAcademica>,
  ) {}

  async getDashboard() {
    const totalUsuarios = await this.usuarioRepo.count();
    const totalEstudiantes = await this.usuarioRepo.count({ where: { id_rol: 3, estado: 'Activo' } });
    const totalCursos = await this.cursoRepo.count();
    const totalCertificados = await this.certificacionRepo.count();
    const totalInscripciones = await this.inscripcionRepo.count();
    const totalPagos = await this.pagoRepo.count({ where: { estado: 'Completado' } });
    const ingresoTotal = await this.pagoRepo.createQueryBuilder('p').where('p.estado = :e', { e: 'Completado' }).select('SUM(p.monto_total)', 'total').getRawOne();
    const inscripcionesRecientes = await this.inscripcionRepo.find({ relations: ['usuario', 'curso'], order: { fecha_inscripcion: 'DESC' }, take: 10 });
    const pagosRecientes = await this.pagoRepo.find({ relations: ['usuario'], order: { fecha_pago: 'DESC' }, take: 10 });
    return { totalUsuarios, totalEstudiantes, totalCursos, totalCertificados, totalInscripciones, totalPagos, ingresoTotal: ingresoTotal?.total || 0, inscripcionesRecientes, pagosRecientes };
  }

  async getEstudiantesPorLinea() {
    const data = await this.lineaRepo.createQueryBuilder('la')
      .leftJoin('rutas_academicas', 'ra', 'ra.id_linea_academica = la.id_linea_academica')
      .leftJoin('inscripciones_rutas', 'ir', 'ir.id_ruta = ra.id_ruta')
      .select('la.nombre', 'nombre_linea')
      .addSelect('COUNT(ir.id_inscripcion_ruta)', 'total_estudiantes')
      .groupBy('la.id_linea_academica')
      .getRawMany();

    return {
      status: 'success',
      lineas_academicas: data.map(d => ({
        nombre_linea: d.nombre_linea,
        total_estudiantes: parseInt(d.total_estudiantes, 10) || 0
      }))
    };
  }

  async getRetencionMensual() {
    // Cálculo simple de retención basado en usuarios activos vs totales
    const total = await this.usuarioRepo.count();
    const activos = await this.usuarioRepo.count({ where: { estado: 'Activo' } });
    const porcentaje = total > 0 ? Math.round((activos / total) * 100) : 0;

    return {
      status: 'success',
      mes_actual: new Date().toLocaleString('es-ES', { month: 'long' }),
      porcentaje_retencion: `${porcentaje}%`
    };
  }

  async getMasVendidosMes() {
    const data = await this.pagoRepo.createQueryBuilder('p')
      .innerJoin('detalle_pagos', 'dp', 'dp.id_pago = p.id_pago')
      .innerJoin('cursos', 'c', 'c.id_curso = dp.id_curso')
      .where('p.estado = :est', { est: 'Completado' })
      .select('c.nombre', 'nombre_curso')
      .addSelect('COUNT(dp.id_detalle)', 'total_ventas')
      .groupBy('c.id_curso')
      .orderBy('total_ventas', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      status: 'success',
      cursos_mas_vendidos: data.map(d => ({
        nombre_curso: d.nombre_curso,
        total_ventas: parseInt(d.total_ventas, 10) || 0
      }))
    };
  }
}
