import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipos_pagos')
export class TipoPago {
  @PrimaryGeneratedColumn({ name: 'id_tipo_pago' })
  id_tipo_pago!: number;

  @Column({ length: 50 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  comision!: number;
}
