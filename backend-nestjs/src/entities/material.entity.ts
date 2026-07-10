import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Modulo } from './modulo.entity';
import { Curso } from './curso.entity';

@Entity('materiales')
export class Material {
  @PrimaryGeneratedColumn({ name: 'id_material' })
  id_material!: number;

  @Column({ name: 'id_curso' })
  id_curso!: number;

  @Column({ name: 'id_modulo', nullable: true })
  id_modulo!: number;

  @Column({ length: 200 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ length: 50, nullable: true })
  tipo!: string;

  @Column({ length: 500, nullable: true })
  url_archivo!: string;

  @Column({ type: 'int', default: 0 })
  orden!: number;

  @Column({ length: 20, default: 'Activo' })
  estado!: string;

  @ManyToOne(() => Modulo)
  @JoinColumn({ name: 'id_modulo' })
  modulo!: Modulo;

  @ManyToOne(() => Curso)
  @JoinColumn({ name: 'id_curso' })
  curso: any;
}
