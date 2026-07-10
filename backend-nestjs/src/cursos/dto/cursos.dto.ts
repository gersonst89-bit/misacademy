import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateCursoDto {
  @IsNotEmpty() @IsString() nombre!: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsString() descripcion_corta?: string;
  @IsOptional() @IsString() descripcion_larga?: string;
  @IsOptional() @IsString() objetivos?: string;
  @IsOptional() @IsString() requisitos?: string;
  @IsOptional() @IsString() lo_que_aprenderas?: string;
  @IsOptional() @IsString() nivel?: string;
  @IsOptional() @IsNumber() precio?: number;
  @IsOptional() @IsNumber() precio_descuento?: number;
  @IsOptional() @IsNumber() duracion?: number;
  @IsOptional() @IsNumber() duracion_horas?: number;
  @IsOptional() @IsNumber() tiempo?: number;
  @IsOptional() @IsString() imagen?: string;
  @IsOptional() @IsString() video_preview?: string;
  @IsOptional() @IsString() video_previsualizacion?: string;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsBoolean() destacado?: boolean;
  @IsOptional() @IsNumber() id_docente?: number;
  @IsOptional() @IsArray() rutas?: number[];
}

export class UpdateCursoDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsString() descripcion_corta?: string;
  @IsOptional() @IsString() descripcion_larga?: string;
  @IsOptional() @IsString() objetivos?: string;
  @IsOptional() @IsString() requisitos?: string;
  @IsOptional() @IsString() lo_que_aprenderas?: string;
  @IsOptional() @IsString() nivel?: string;
  @IsOptional() @IsNumber() precio?: number;
  @IsOptional() @IsNumber() precio_descuento?: number;
  @IsOptional() @IsNumber() duracion?: number;
  @IsOptional() @IsNumber() duracion_horas?: number;
  @IsOptional() @IsNumber() tiempo?: number;
  @IsOptional() @IsString() imagen?: string;
  @IsOptional() @IsString() video_preview?: string;
  @IsOptional() @IsString() video_previsualizacion?: string;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsBoolean() destacado?: boolean;
  @IsOptional() @IsNumber() id_docente?: number;
  @IsOptional() @IsArray() rutas?: number[];
}

export class CambiarEstadoDto {
  @IsNotEmpty() @IsString() estado!: string;
}
