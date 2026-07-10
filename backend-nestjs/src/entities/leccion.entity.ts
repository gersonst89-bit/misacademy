import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Modulo } from './modulo.entity';

@Entity('lecciones')
export class Leccion {
  @PrimaryGeneratedColumn({ name: 'id_leccion' })
  id_leccion!: number;

  @Column()
  id_modulo!: number;

  @Column({ length: 200 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'text', nullable: true })
  contenido!: string;

  @Column({ length: 50, nullable: true })
  tipo!: string;

  @Column({ length: 500, nullable: true })
  url_video!: string;

  @Column({ type: 'int', default: 0 })
  duracion_minutos!: number;

  @Column({ type: 'int', default: 0 })
  orden!: number;

  @Column({ length: 20, default: 'Activo' })
  estado!: string;

  @Column({ type: 'boolean', default: false })
  es_gratuita!: boolean;

  @ManyToOne(() => Modulo)
  @JoinColumn({ name: 'id_modulo' })
  modulo!: Modulo;
}
