import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { RutaAcademica } from './ruta-academica.entity';

@Entity('inscripciones_rutas')
export class InscripcionRuta {
  @PrimaryGeneratedColumn({ name: 'id_inscripcion_ruta' })
  id_inscripcion_ruta!: number;

  @Column()
  id_usuario!: number;

  @Column()
  id_ruta!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio_pagado!: number;

  @Column({ length: 20, default: 'Activo' })
  estado!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_inscripcion!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_completado!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @ManyToOne(() => RutaAcademica)
  @JoinColumn({ name: 'id_ruta' })
  ruta!: RutaAcademica;
}
