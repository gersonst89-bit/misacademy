import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { TipoPago } from './tipo-pago.entity';
import { DetallePago } from './detalle-pago.entity';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn({ name: 'id_pago' })
  id_pago!: number;

  @Column()
  id_usuario!: number;

  @Column({ nullable: true })
  id_tipo_pago!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto_total!: number;

  @Column({ length: 100, nullable: true })
  numero_operacion!: string;

  @Column({ length: 255, nullable: true })
  comprobante_url!: string;

  @Column({ length: 20, default: 'Pendiente' })
  estado!: string;

  @Column({ type: 'text', nullable: true })
  observaciones!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_pago!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_verificacion!: Date;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @ManyToOne(() => TipoPago, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'id_tipo_pago' })
  tipo_pago!: TipoPago;

  @OneToMany(() => DetallePago, (detalle) => detalle.pago)
  detalles?: DetallePago[];
}
