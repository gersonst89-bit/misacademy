import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Evaluacion } from './evaluacion.entity';
import { OpcionRespuesta } from './opcion-respuesta.entity';

@Entity('preguntas')
export class Pregunta {
  @PrimaryGeneratedColumn({ name: 'id_pregunta' })
  id_pregunta!: number;

  @Column()
  id_evaluacion!: number;

  @Column({ type: 'text' })
  texto!: string;

  @Column({ length: 50, default: 'opcion_multiple' })
  tipo!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  puntaje!: number;

  @Column({ type: 'int', default: 0 })
  orden!: number;

  @ManyToOne(() => Evaluacion)
  @JoinColumn({ name: 'id_evaluacion' })
  evaluacion!: Evaluacion;

  @OneToMany(() => OpcionRespuesta, (o) => o.pregunta)
  opciones!: OpcionRespuesta[];
}
