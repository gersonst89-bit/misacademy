import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn({ name: 'id_curso' })
  id_curso!: number;

  @Column()
  id_docente!: number;

  @Column({ length: 200 })
  nombre!: string;

  @Column({ length: 255, nullable: true, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'text', nullable: true })
  descripcion_corta!: string;

  @Column({ type: 'text', nullable: true })
  descripcion_larga!: string;

  @Column({ type: 'int', nullable: true })
  tiempo!: number;

  @Column({ type: 'text', nullable: true })
  objetivos!: string;

  @Column({ type: 'text', nullable: true })
  requisitos!: string;

  @Column({ length: 50, nullable: true })
  nivel!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio_descuento!: number;

  @Column({ type: 'int', default: 0 })
  duracion_horas!: number;

  @Column({ length: 255, nullable: true })
  imagen!: string;

  @Column({ length: 255, nullable: true })
  video_preview!: string;

  @Column({ length: 50, default: 'Borrador' })
  estado!: string;

  @Column({ type: 'boolean', default: false })
  destacado!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fecha_creacion!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_actualizacion!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_docente' })
  docente!: Usuario;

  @ManyToMany('RutaAcademica', 'cursos')
  @JoinTable({
    name: 'cursos_rutas',
    joinColumn: { name: 'id_curso', referencedColumnName: 'id_curso' },
    inverseJoinColumn: { name: 'id_ruta', referencedColumnName: 'id_ruta' },
  })
  rutas!: any[];

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.nombre && (!this.slug || this.slug.trim() === '')) {
      this.slug = this.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar tildes y diacríticos
        .replace(/[^a-z0-9 -]/g, '') // Quitar caracteres especiales
        .replace(/\s+/g, '-') // Reemplazar múltiples espacios por guión
        .replace(/-+/g, '-') // Reemplazar múltiples guiones por uno solo
        .replace(/^-+|-+$/g, ''); // Quitar guiones al inicio o final
    }
  }
}
