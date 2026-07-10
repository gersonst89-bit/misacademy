import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pago } from './pago.entity';
import { Curso } from './curso.entity';
import { RutaAcademica } from './ruta-academica.entity';

@Entity('detalle_pagos')
export class DetallePago {
  @PrimaryGeneratedColumn({ name: 'id_detalle' })
  id_detalle!: number;

  @Column()
  id_pago!: number;

  @Column({ nullable: true })
  id_curso!: number;

  @Column({ nullable: true })
  id_ruta!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  descuento!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Pago)
  @JoinColumn({ name: 'id_pago' })
  pago!: Pago;

  @ManyToOne(() => Curso)
  @JoinColumn({ name: 'id_curso' })
  curso!: Curso;

  @ManyToOne(() => RutaAcademica)
  @JoinColumn({ name: 'id_ruta' })
  ruta!: RutaAcademica;
}
