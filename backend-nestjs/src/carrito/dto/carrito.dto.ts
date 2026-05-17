import { IsOptional, IsNumber } from 'class-validator';
export class AgregarItemDto { 
    @IsOptional() @IsNumber() id_curso?: number; 
    @IsOptional() @IsNumber() id_ruta?: number;
}
