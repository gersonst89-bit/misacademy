import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Evaluacion } from './evaluacion.entity';
import { Usuario } from './usuario.entity';

@Entity('intentos_evaluacion')
export class IntentoEvaluacion {
  @PrimaryGeneratedColumn({ name: 'id_intento' })
  id_intento!: number;

  @Column()
  id_evaluacion!: number;

  @Column()
  id_usuario!: number;

  @Column({ type: 'int', default: 1 })
  numero_intento!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  puntaje_obtenido!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  puntaje_total!: number;

  @Column({ length: 20, default: 'En Progreso' })
  estado!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_inicio!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_fin!: Date;

  @Column({ type: 'int', nullable: true })
  tiempo_usado_segundos!: number;

  @Column({ type: 'text', nullable: true })
  ip_address!: string;

  @Column({ type: 'text', nullable: true })
  user_agent!: string;

  @ManyToOne(() => Evaluacion)
  @JoinColumn({ name: 'id_evaluacion' })
  evaluacion!: Evaluacion;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;
}
