import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('sesiones_usuario')
export class SesionUsuario {
  @PrimaryColumn({ name: 'id_sesion' })
  id_sesion!: string;

  @Column()
  id_usuario!: number;

  @Column({ length: 45, nullable: true })
  ip_address!: string;

  @Column({ type: 'text', nullable: true })
  user_agent!: string;

  @Column({ type: 'text', nullable: true })
  payload!: string;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_acceso!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;
}
