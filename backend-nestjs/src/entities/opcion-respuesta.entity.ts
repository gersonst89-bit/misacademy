import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pregunta } from './pregunta.entity';

@Entity('opciones_respuesta')
export class OpcionRespuesta {
  @PrimaryGeneratedColumn({ name: 'id_opcion' })
  id_opcion!: number;

  @Column()
  id_pregunta!: number;

  @Column({ type: 'text' })
  texto!: string;

  @Column({ type: 'boolean', default: false })
  es_correcta!: boolean;

  @ManyToOne(() => Pregunta)
  @JoinColumn({ name: 'id_pregunta' })
  pregunta!: Pregunta;
}
