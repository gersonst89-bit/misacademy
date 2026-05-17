import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IntentoEvaluacion } from './intento-evaluacion.entity';
import { Pregunta } from './pregunta.entity';
import { OpcionRespuesta } from './opcion-respuesta.entity';

@Entity('respuestas_usuario')
export class RespuestaUsuario {
  @PrimaryGeneratedColumn({ name: 'id_respuesta' })
  id_respuesta!: number;

  @Column()
  id_intento!: number;

  @Column()
  id_pregunta!: number;

  @Column({ nullable: true })
  id_opcion!: number;

  @Column({ type: 'text', nullable: true })
  respuesta_texto!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  puntos_obtenidos!: number;

  @ManyToOne(() => IntentoEvaluacion)
  @JoinColumn({ name: 'id_intento' })
  intento!: IntentoEvaluacion;

  @ManyToOne(() => Pregunta)
  @JoinColumn({ name: 'id_pregunta' })
  pregunta!: Pregunta;

  @ManyToOne(() => OpcionRespuesta)
  @JoinColumn({ name: 'id_opcion' })
  opcion!: OpcionRespuesta;
}
