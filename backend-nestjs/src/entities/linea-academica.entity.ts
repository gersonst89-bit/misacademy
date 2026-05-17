import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RutaAcademica } from './ruta-academica.entity';

@Entity('lineas_academicas')
export class LineaAcademica {
  @PrimaryGeneratedColumn({ name: 'id_linea_academica' })
  id_linea_academica!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 255, nullable: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ length: 255, nullable: true })
  imagen!: string;

  @Column({ length: 20, default: 'Activo' })
  estado!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_creacion!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_actualizacion!: Date;

  @OneToMany(() => RutaAcademica, (ruta) => ruta.lineaAcademica)
  rutas_academicas!: RutaAcademica[];
}
