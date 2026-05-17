import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
export class CreateContactoDto { 
  @IsNotEmpty() @IsString() nombre: string; 
  @IsOptional() @IsString() apellido?: string; 
  @IsNotEmpty() @IsEmail() email: string; 
  @IsOptional() @IsString() asunto?: string; 
  @IsNotEmpty() @IsString() mensaje: string; 
}
export class CreateReclamacionDto {
  @IsNotEmpty() @IsString() nombre_completo: string; @IsNotEmpty() @IsString() dni: string; @IsNotEmpty() @IsEmail() email: string;
  @IsNotEmpty() @IsString() tipo_reclamo: string; @IsNotEmpty() @IsString() asunto: string; @IsNotEmpty() @IsString() descripcion: string;
}
