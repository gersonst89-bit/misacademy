import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn({ name: 'id_notificacion' })
  id_notificacion!: number;

  @Column()
  id_usuario!: number;

  @Column({ type: 'text' })
  mensaje!: string;

  @Column({ type: 'boolean', default: false })
  leido!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fecha_creacion!: Date;
}
