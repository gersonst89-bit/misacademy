import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('contacto')
export class Contacto {
  @PrimaryGeneratedColumn({ name: 'id_contacto' })
  id_contacto!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100, nullable: true })
  apellido!: string;

  @Column({ length: 150 })
  email!: string;

  @Column({ length: 255, nullable: true })
  asunto!: string;

  @Column({ type: 'text' })
  mensaje!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_envio!: Date;
}
