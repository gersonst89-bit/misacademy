import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Rol } from './rol.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id_usuario!: number;

  @Column()
  id_rol!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100 })
  apellido!: string;

  @Column({ length: 20, nullable: true })
  dni!: string;

  @Column({ length: 150, unique: true })
  email!: string;

  @Column({ length: 255, select: false })
  password!: string;

  @Column({ length: 20, nullable: true })
  telefono!: string;

  @Column({ length: 255, nullable: true })
  imagen_perfil!: string;

  @Column({ type: 'text', nullable: true })
  biografia!: string;

  @Column({ type: 'boolean', default: false })
  email_verificado!: boolean;

  @Column({ length: 20, default: 'Activo' })
  estado!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_registro!: Date;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_acceso!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at!: Date;

  @ManyToOne(() => Rol, { eager: true })
  @JoinColumn({ name: 'id_rol' })
  rol!: Rol;
}
