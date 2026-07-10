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

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @Column()
  action!: string; // e.g., 'CREATE', 'UPDATE', 'DELETE'

  @Column()
  module!: string; // e.g., 'cursos', 'pagos', 'auth'

  @Column({ type: 'text', nullable: true })
  details!: string; // JSON with changes or relevant info

  @Column({ nullable: true })
  ip_address!: string;

  @Column({ type: 'text', nullable: true })
  user_agent!: string;

  @CreateDateColumn()
  created_at!: Date;
}
