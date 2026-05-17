import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn({ name: 'id_rol' })
  id_rol!: number;

  @Column({ length: 50 })
  nombre_rol!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_creacion!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_actualizacion!: Date;
}
