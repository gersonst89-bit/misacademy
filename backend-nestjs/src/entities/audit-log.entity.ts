import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id_audit_log!: number;

  @Column({ nullable: true })
  id_usuario!: number;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @Column()
  action!: string;

  @Column()
  module!: string;

  @Column({ type: 'text', nullable: true })
  details!: string;

  @Column({ nullable: true })
  ip_address!: string;

  @Column({ type: 'text', nullable: true })
  user_agent!: string;

  @CreateDateColumn()
  created_at!: Date;
}
