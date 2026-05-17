import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('authentication_log')
export class AuthenticationLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  authenticatable_type!: string;

  @Column({ nullable: true })
  authenticatable_id!: number;

  @Column({ length: 45, nullable: true })
  ip_address!: string;

  @Column({ type: 'text', nullable: true })
  user_agent!: string;

  @Column({ type: 'boolean', default: false })
  login_successful!: boolean;

  @Column({ length: 255, nullable: true })
  failure_reason!: string;

  @Column({ type: 'timestamp', nullable: true })
  login_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  logout_at!: Date;
}
