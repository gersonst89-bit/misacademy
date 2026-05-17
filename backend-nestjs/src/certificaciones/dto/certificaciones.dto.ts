import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
export class CreateCertificacionDto {
  @IsNotEmpty() @IsNumber() id_usuario!: number;
  @IsOptional() @IsNumber() id_curso?: number;
  @IsNotEmpty() @IsString() nombre_estudiante!: string;
  @IsOptional() @IsString() nombre_curso?: string;
  @IsOptional() @IsString() tipo_certificado?: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsNumber() horas?: number;
}
export class BuscarCertificadoDto { @IsNotEmpty() @IsString() codigo!: string; }
