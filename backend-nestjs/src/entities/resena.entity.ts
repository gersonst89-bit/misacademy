import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Curso } from './curso.entity';

@Entity('resenas')
export class Resena {
  @PrimaryGeneratedColumn({ name: 'id_resena' })
  id_resena!: number;

  @Index()
  @Column()
  id_usuario!: number;

  @Index()
  @Column()
  id_curso!: number;

  @Column({ type: 'int' })
  calificacion!: number;

  @Column({ type: 'text', nullable: true })
  comentario!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_resena!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @ManyToOne(() => Curso)
  @JoinColumn({ name: 'id_curso' })
  curso!: Curso;
}
