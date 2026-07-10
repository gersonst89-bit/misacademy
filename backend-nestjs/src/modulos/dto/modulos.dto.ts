import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
export class CreateModuloDto {
  @IsNotEmpty() @IsNumber() id_curso!: number;
  @IsNotEmpty() @IsString() titulo!: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsNumber() orden?: number;
  @IsOptional() @IsString() estado?: string;
}
export class UpdateModuloDto extends CreateModuloDto {}
