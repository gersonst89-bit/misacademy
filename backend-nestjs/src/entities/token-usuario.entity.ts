import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tokens_usuario')
export class TokenUsuario {
  @PrimaryGeneratedColumn({ name: 'id_token' })
  id_token!: number;

  @Column()
  id_usuario!: number;

  @Column({ length: 255 })
  token!: string;

  @Column({ length: 50 })
  tipo!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_creacion!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_expiracion!: Date;

  @Column({ type: 'boolean', default: false })
  usado!: boolean;
}
