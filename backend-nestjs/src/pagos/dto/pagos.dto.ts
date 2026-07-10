import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
export class CreatePagoDto {
  @IsOptional() @IsNumber() id_tipo_pago?: number;
  @IsNotEmpty() @IsNumber() monto_total!: number;
  @IsOptional() @IsString() numero_operacion?: string;
  @IsOptional() @IsString() comprobante_url?: string;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() cursos?: { id_curso: number; precio: number }[];
}
export class UpdatePagoDto {
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsString() observaciones?: string;
}
export class CreateTipoPagoDto {
  @IsNotEmpty() @IsString() nombre!: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsNumber() comision?: number;
}
