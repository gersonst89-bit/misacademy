import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateResenaDto {
  @IsNotEmpty()
  @IsNumber()
  id_curso!: number;

  @IsNotEmpty()
  @IsNumber()
  calificacion!: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}

export class UpdateResenaDto {
  @IsOptional()
  @IsNumber()
  calificacion?: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}
