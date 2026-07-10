import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEmail,
  IsBoolean,
  MinLength,
} from 'class-validator';
export class CreateUsuarioDto {
  @IsNotEmpty() @IsString() nombre!: string;
  @IsNotEmpty() @IsString() apellido!: string;
  @IsNotEmpty() @IsEmail() email!: string;
  @IsNotEmpty() @MinLength(8) password!: string;
  @IsOptional() @IsNumber() id_rol?: number;
  @IsOptional() @IsString() dni?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsBoolean() email_verificado?: boolean;
}
export class UpdateUsuarioDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() apellido?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsNumber() id_rol?: number;
  @IsOptional() @IsString() dni?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() estado?: string;
}
export class CreateMaterialDto {
  @IsNotEmpty() @IsNumber() id_curso!: number;
  @IsOptional() @IsNumber() id_modulo?: number;
  @IsNotEmpty() @IsString() titulo!: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @IsNumber() orden?: number;
  @IsOptional() @IsString() url_archivo?: string;
  @IsOptional() @IsString() estado?: string;
}
export class UpdateMaterialDto extends CreateMaterialDto {}
