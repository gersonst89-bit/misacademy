import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { LineaAcademica } from './linea-academica.entity';
import { Curso } from './curso.entity';

@Entity('rutas_academicas')
export class RutaAcademica {
  @PrimaryGeneratedColumn({ name: 'id_ruta' })
  id_ruta!: number;

  @Column()
  id_linea_academica!: number;

  @Column({ length: 200 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ length: 255, nullable: true })
  imagen!: string;

  @Column({ type: 'int', nullable: true })
  horas_totales!: number;

  @Column({ length: 50, nullable: true })
  nivel!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio!: number;

  @Column({ length: 20, default: 'Activo' })
  estado!: string;

  @Column({ type: 'boolean', default: false })
  destacado!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fecha_creacion!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_actualizacion!: Date;

  @ManyToOne(() => LineaAcademica)
  @JoinColumn({ name: 'id_linea_academica' })
  lineaAcademica!: LineaAcademica;

  @ManyToMany(() => Curso)
  @JoinTable({
    name: 'cursos_rutas',
    joinColumn: { name: 'id_ruta', referencedColumnName: 'id_ruta' },
    inverseJoinColumn: { name: 'id_curso', referencedColumnName: 'id_curso' },
  })
  cursos!: Curso[];
}
