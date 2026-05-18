import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
export class CreateCertificacionDto {
  @IsOptional() @IsNumber() id_usuario?: number;
  @IsOptional() @IsNumber() id_curso?: number;
  @IsNotEmpty() @IsString() nombre_estudiante!: string;
  @IsOptional() @IsString() nombre_curso?: string;
  @IsOptional() @IsString() tipo_certificado?: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsNumber() horas?: number;
  @IsOptional() @IsString() codigo_certificado?: string;
  @IsOptional() @IsNumber() total_horas?: number;
  @IsOptional() @IsString() fecha_inicio?: string;
  @IsOptional() @IsString() fecha_fin?: string;
  @IsOptional() @IsString() email_destinatario?: string;
  @IsOptional() @IsString() fecha_emision?: string;
}
export class BuscarCertificadoDto { @IsNotEmpty() @IsString() codigo!: string; }
