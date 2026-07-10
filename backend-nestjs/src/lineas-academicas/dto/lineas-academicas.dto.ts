import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';
export class CreateLineaDto {
  @IsNotEmpty() @IsString() nombre!: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsString() imagen?: string;
  @IsOptional() @IsString() estado?: string;
}
export class UpdateLineaDto extends CreateLineaDto {}
export class CreateRutaDto {
  @IsNotEmpty() @IsNumber() id_linea_academica!: number;
  @IsNotEmpty() @IsString() nombre!: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsString() imagen?: string;
  @IsOptional() @IsNumber() horas_totales?: number;
  @IsOptional() @IsString() nivel?: string;
  @IsOptional() @IsNumber() precio?: number;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsBoolean() destacado?: boolean;
  @IsOptional() @IsArray() cursos?: number[];
}
export class UpdateRutaDto extends CreateRutaDto {}
