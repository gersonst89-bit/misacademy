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
    this.repo.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns 
      WHERE table_name = 'certificaciones' 
        AND column_name = 'calificacion_final' 
        AND table_schema = '${dbName}'
    `).then(rows => {
      if (!rows || rows.length === 0) {
        this.repo.query(`ALTER TABLE certificaciones ADD calificacion_final DECIMAL(5,2) DEFAULT 0`)
          .catch(err => console.log('Error al crear columna:', err.message));
      }
    }).catch(err => console.log('Error verificando esquema:', err.message));

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
    const codigo = 'CERT-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    return this.repo.save(this.repo.create({ 
      ...data, 
      codigo_certificado: codigo, 
      tipo_certificado: data.tipo_certificado || 'Certificado de Aprobación',
      fecha_emision: new Date(), 
      estado: 'Activo', 
      created_at: new Date() 
    }));
  }
  async update(id: number, data: any) { await this.repo.update({ id_certificacion: id }, data); return this.findById(id); }
  async delete(id: number) { await this.repo.delete({ id_certificacion: id }); }
}
