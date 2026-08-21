import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCertificacionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_usuario?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_curso?: number;

  @IsNotEmpty()
  @IsString()
  nombre_estudiante!: string;

  @IsOptional()
  @IsString()
  nombre_curso?: string;

  @IsOptional()
  @IsString()
  tipo_certificado?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  horas?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  calificacion_final?: number;

  @IsOptional()
  @IsString()
  codigo_certificado?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total_horas?: number;

  @IsOptional()
  @IsString()
  fecha_inicio?: string;

  @IsOptional()
  @IsString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  email_destinatario?: string;

  @IsOptional()
  @IsString()
  fecha_emision?: string;

  @IsOptional()
  @IsString()
  dni_estudiante?: string;
}
export class BuscarCertificadoDto {
  @IsNotEmpty() @IsString() codigo!: string;
}
