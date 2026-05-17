import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Curso } from './curso.entity';

@Entity('inscripciones')
export class Inscripcion {
  @PrimaryGeneratedColumn({ name: 'id_inscripcion' })
  id_inscripcion!: number;

  @Column()
  id_usuario!: number;

  @Column()
  id_curso!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio_pagado!: number;

  @Column({ length: 20, default: 'Activo' })
  estado!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_inscripcion!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_completado!: Date;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @ManyToOne(() => Curso)
  @JoinColumn({ name: 'id_curso' })
  curso!: Curso;
}
