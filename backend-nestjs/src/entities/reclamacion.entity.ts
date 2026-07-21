import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reclamaciones')
export class Reclamacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  nombre_completo!: string;

  @Column({ length: 20 })
  dni!: string;

  @Column({ length: 150 })
  email!: string;

  @Column({ length: 50 })
  tipo_reclamo!: string;

  @Column({ length: 200 })
  asunto!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ length: 20, default: 'pendiente' })
  estado!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
