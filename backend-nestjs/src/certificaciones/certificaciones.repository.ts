import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Certificacion } from '../entities/certificacion.entity';
import * as crypto from 'crypto';

@Injectable()
export class CertificacionesRepository {
  constructor(@InjectRepository(Certificacion) public readonly repo: Repository<Certificacion>) {
    // Forma segura de añadir la columna en MySQL (compatible con todas las versiones)
    const dbName = process.env.DB_DATABASE || 'mis_academy';
    
    const checkAndAddColumn = (columnName: string, alterQuery: string) => {
      this.repo.query(`
        SELECT COLUMN_NAME 
        FROM information_schema.columns 
        WHERE table_name = 'certificaciones' 
          AND column_name = '${columnName}' 
          AND table_schema = '${dbName}'
      `).then(rows => {
        if (!rows || rows.length === 0) {
          this.repo.query(alterQuery)
            .catch(err => console.log(`Error al crear columna ${columnName}:`, err.message));
        }
      }).catch(err => console.log(`Error verificando columna ${columnName}:`, err.message));
    };

    checkAndAddColumn('calificacion_final', `ALTER TABLE certificaciones ADD calificacion_final DECIMAL(5,2) DEFAULT 0`);
    checkAndAddColumn('fecha_inicio', `ALTER TABLE certificaciones ADD fecha_inicio TIMESTAMP NULL`);
    checkAndAddColumn('fecha_fin', `ALTER TABLE certificaciones ADD fecha_fin TIMESTAMP NULL`);
    checkAndAddColumn('email_destinatario', `ALTER TABLE certificaciones ADD email_destinatario VARCHAR(255) NULL`);

    // Actualizar registros antiguos de 'empresa' a 'Certificado de Aprobación'
    this.repo.query(`UPDATE certificaciones SET tipo_certificado = 'Certificado de Aprobación' WHERE tipo_certificado = 'empresa'`)
      .catch(err => console.log('Error al actualizar tipos antiguos:', err.message));
  }
  get manager() { return this.repo.manager; }
  async findAll(page = 1, perPage = 20) {
    const [data, total] = await this.repo.findAndCount({ relations: ['usuario', 'curso'], skip: (page-1)*perPage, take: perPage, order: { created_at: 'DESC' } });
    return { data, total, current_page: page, per_page: perPage, last_page: Math.ceil(total/perPage) };
  }
  async findById(id: number) { return this.repo.findOne({ where: { id_certificacion: id }, relations: ['usuario', 'curso'] }); }
  async findByUsuario(userId: number) { return this.repo.find({ where: { id_usuario: userId }, relations: ['curso'] }); }
  async findByCodigo(codigo: string) { return this.repo.findOne({ where: { codigo_certificado: codigo }, relations: ['usuario', 'curso'] }); }
  async buscar(query: string) {
    return this.repo.find({
      where: [
        { codigo_certificado: query },
        { nombre_estudiante: Like(`%${query}%`) }
      ],
      relations: ['usuario', 'curso']
    });
  }
  async create(data: any) {
    const generatedCodigo = 'CERT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    
    // Map total_horas to horas if provided
    const horasValue = data.total_horas !== undefined ? data.total_horas : data.horas;
    
    // Convert string dates to Date objects if needed
    const fInicio = data.fecha_inicio ? new Date(data.fecha_inicio) : null;
    const fFin = data.fecha_fin ? new Date(data.fecha_fin) : null;
    const fEmision = data.fecha_emision ? new Date(data.fecha_emision) : new Date();

    return this.repo.save(this.repo.create({ 
      ...data, 
      horas: horasValue,
      fecha_inicio: fInicio,
      fecha_fin: fFin,
      fecha_emision: fEmision,
      codigo_certificado: data.codigo_certificado || generatedCodigo, 
      tipo_certificado: data.tipo_certificado || 'Certificado de Aprobación',
      estado: 'Activo', 
      created_at: new Date() 
    }));
  }
  async update(id: number, data: any) {
    const updateData = { ...data };
    
    // Map total_horas to horas
    if (data.total_horas !== undefined) {
      updateData.horas = data.total_horas;
    }
    
    // Convert string dates to Date objects
    if (data.fecha_inicio) updateData.fecha_inicio = new Date(data.fecha_inicio);
    if (data.fecha_fin) updateData.fecha_fin = new Date(data.fecha_fin);
    if (data.fecha_emision) updateData.fecha_emision = new Date(data.fecha_emision);
    
    await this.repo.update({ id_certificacion: id }, updateData);
    return this.findById(id);
  }
  async delete(id: number) { await this.repo.delete({ id_certificacion: id }); }
}
