import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateLeccionDto {
  @IsNotEmpty() @IsNumber() id_modulo!: number;
  @IsNotEmpty() @IsString() titulo!: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsString() contenido?: string;
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @IsString() url_video?: string;
  @IsOptional() @IsNumber() duracion_minutos?: number;
  @IsOptional() @IsNumber() orden?: number;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsBoolean() es_gratuita?: boolean;
}
export class UpdateLeccionDto extends CreateLeccionDto {}

export class CompletarLeccionDto {
  @IsOptional() @IsNumber() ultimo_segundo_visto?: number;
  @IsOptional() segmentos_vistos?: any;
  @IsOptional() @IsNumber() duracion_video?: number;
  @IsOptional() @IsNumber() porcentaje_completado?: number;
}

export class ComentarioDto {
  @IsNotEmpty() @IsString() contenido!: string;
}

export class HeartbeatDto {
  @IsNotEmpty() @IsNumber() id_leccion!: number;
  @IsOptional() @IsNumber() ultimo_segundo_visto?: number;
  @IsOptional() segmentos_vistos?: any;
  @IsOptional() @IsNumber() duracion_video?: number;
  @IsOptional() @IsNumber() porcentaje_completado?: number;
}
