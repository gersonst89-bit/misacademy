import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Leccion } from './leccion.entity';
import { Usuario } from './usuario.entity';

@Entity('comentarios_leccion')
export class ComentarioLeccion {
  @PrimaryGeneratedColumn({ name: 'id_comentario' })
  id_comentario!: number;

  @Column()
  id_leccion!: number;

  @Column()
  id_usuario!: number;

  @Column({ type: 'text' })
  contenido!: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_comentario!: Date;

  @ManyToOne(() => Leccion)
  @JoinColumn({ name: 'id_leccion' })
  leccion!: Leccion;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;
}
