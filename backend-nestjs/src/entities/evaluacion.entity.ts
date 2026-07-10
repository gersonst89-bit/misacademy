import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Curso } from './curso.entity';

@Entity('evaluaciones')
export class Evaluacion {
  @PrimaryGeneratedColumn({ name: 'id_evaluacion' })
  id_evaluacion!: number;

  @Column()
  id_curso!: number;

  @Column({ length: 200 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'int', default: 60 })
  duracion_minutos!: number;

  @Column({ type: 'int', default: 3 })
  intentos_permitidos!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 70 })
  puntaje_aprobatorio!: number;

  @Column({ type: 'boolean', default: true })
  aleatorio!: boolean;

  @Column({ length: 50, nullable: true })
  tipo!: string;

  @Column({ length: 20, default: 'Activo' })
  estado!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_creacion!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_actualizacion!: Date;

  @ManyToOne(() => Curso)
  @JoinColumn({ name: 'id_curso' })
  curso!: Curso;
}
