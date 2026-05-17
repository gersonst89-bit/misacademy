import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('carrito_compras')
export class CarritoCompra {
  @PrimaryGeneratedColumn({ name: 'id_carrito' })
  id_carrito!: number;

  @Column()
  id_usuario!: number;

  @Column({ length: 20, default: 'activo' })
  estado!: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at!: Date;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;
}
