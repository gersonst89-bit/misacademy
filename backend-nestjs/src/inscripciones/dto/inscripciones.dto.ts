import { IsOptional, IsString, IsNumber } from 'class-validator';
export class UpdateInscripcionDto {
    @IsOptional() @IsString() estado?: string;
}
export class CreateInscripcionDto {
    @IsNumber() id_usuario!: number;
    @IsNumber() id_curso!: number;
    @IsOptional() @IsNumber() precio_pagado?: number;
    @IsOptional() @IsString() estado?: string;
}

