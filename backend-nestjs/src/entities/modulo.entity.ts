import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Curso } from './curso.entity';

@Entity('modulos')
export class Modulo {
  @PrimaryGeneratedColumn({ name: 'id_modulo' })
  id_modulo!: number;

  @Column()
  id_curso!: number;

  @Column({ length: 200 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'int', default: 0 })
  orden!: number;

  @Column({ length: 20, default: 'Activo' })
  estado!: string;

  @ManyToOne(() => Curso)
  @JoinColumn({ name: 'id_curso' })
  curso!: Curso;

  @OneToMany('Leccion', 'modulo')
  lecciones!: any[];
}
