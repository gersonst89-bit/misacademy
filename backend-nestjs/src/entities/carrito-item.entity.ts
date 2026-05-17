import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CarritoCompra } from './carrito-compra.entity';
import { Curso } from './curso.entity';
import { RutaAcademica } from './ruta-academica.entity';

@Entity('carrito_items')
export class CarritoItem {
  @PrimaryGeneratedColumn({ name: 'id_item' })
  id_item!: number;

  @Column()
  id_carrito!: number;

  @Column({ nullable: true })
  id_curso!: number;

  @Column({ nullable: true })
  id_ruta!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @Column({ type: 'timestamp', nullable: true })
  created_at!: Date;

  @ManyToOne(() => CarritoCompra, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_carrito' })
  carrito!: CarritoCompra;

  @ManyToOne(() => Curso)
  @JoinColumn({ name: 'id_curso' })
  curso!: Curso;

  @ManyToOne(() => RutaAcademica)
  @JoinColumn({ name: 'id_ruta' })
  ruta!: RutaAcademica;
}



