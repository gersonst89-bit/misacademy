import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Curso } from './curso.entity';

@Entity('certificaciones')
export class Certificacion {
  @PrimaryGeneratedColumn({ name: 'id_certificacion' })
  id_certificacion!: number;

  @Column()
  id_usuario!: number;

  @Column({ nullable: true })
  id_curso!: number;

  @Column({ length: 100, unique: true })
  codigo_certificado!: string;

  @Column({ length: 200 })
  nombre_estudiante!: string;

  @Column({ length: 200, nullable: true })
  nombre_curso!: string;

  @Column({ length: 50, default: 'Certificado de Aprobación' })
  tipo_certificado!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  calificacion_final!: number;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'int', nullable: true })
  horas!: number;

  @Column({ type: 'timestamp', nullable: true })
  fecha_inicio!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_fin!: Date;

  @Column({ length: 255, nullable: true })
  email_destinatario!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_emision!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_vencimiento!: Date;

  @Column({ length: 255, nullable: true })
  url_certificado!: string;

  @Column({ length: 20, default: 'Activo' })
  estado!: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @ManyToOne(() => Curso)
  @JoinColumn({ name: 'id_curso' })
  curso!: Curso;
}
