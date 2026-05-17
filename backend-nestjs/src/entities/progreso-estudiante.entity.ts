import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Inscripcion } from './inscripcion.entity';
import { Leccion } from './leccion.entity';

@Entity('progreso_estudiante')
export class ProgresoEstudiante {
  @PrimaryGeneratedColumn({ name: 'id_progreso' })
  id_progreso!: number;

  @Column()
  id_inscripcion!: number;

  @Column()
  id_leccion!: number;

  @Column({ length: 20, default: 'No Iniciado' })
  estado!: string;

  @Column({ type: 'int', default: 0 })
  tiempo_visualizacion!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  porcentaje_completado!: number;

  @Column({ type: 'timestamp', nullable: true })
  ultima_actividad!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_completado!: Date;

  @Column({ type: 'int', default: 0 })
  ultimo_segundo_visto!: number;

  @Column({ type: 'json', nullable: true })
  segmentos_vistos: any;

  @Column({ type: 'int', nullable: true })
  duracion_video!: number;

  @Column({ type: 'timestamp', nullable: true })
  primera_visualizacion!: Date;

  @ManyToOne(() => Inscripcion)
  @JoinColumn({ name: 'id_inscripcion' })
  inscripcion!: Inscripcion;

  @ManyToOne(() => Leccion)
  @JoinColumn({ name: 'id_leccion' })
  leccion!: Leccion;
}
