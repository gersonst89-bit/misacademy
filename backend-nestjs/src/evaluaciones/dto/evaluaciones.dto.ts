import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateEvaluacionDto {
  @IsNotEmpty() @IsNumber() id_curso!: number;
  @IsNotEmpty() @IsString() titulo!: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsNumber() duracion_minutos?: number;
  @IsOptional() @IsNumber() intentos_permitidos?: number;
  @IsOptional() @IsNumber() puntaje_aprobatorio?: number;
  @IsOptional() @IsBoolean() aleatorio?: boolean;
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @IsString() estado?: string;
}
export class UpdateEvaluacionDto extends CreateEvaluacionDto {}

export class CreatePreguntaDto {
  @IsNotEmpty() @IsNumber() id_evaluacion!: number;
  @IsNotEmpty() @IsString() texto!: string;
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @IsNumber() puntaje?: number;
  @IsOptional() @IsNumber() orden?: number;
  @IsOptional() @IsString() imagen_url?: string;
}
export class UpdatePreguntaDto extends CreatePreguntaDto {}

export class CreateOpcionDto {
  @IsNotEmpty() @IsNumber() id_pregunta!: number;
  @IsNotEmpty() @IsString() texto!: string;
  @IsOptional() @IsBoolean() es_correcta?: boolean;
}
export class UpdateOpcionDto extends CreateOpcionDto {}

export class IniciarEvaluacionDto {
  @IsOptional() @IsBoolean() acceptedRules?: boolean;
  @IsOptional() @IsString() clientTimestamp?: string;
}

export class SaveAnswerDto {
  @IsOptional() @IsNumber() id_pregunta?: number;
  @IsOptional() @IsNumber() id_opcion?: number;
  @IsOptional() @IsString() respuesta_texto?: string;

  // Campos alternativos enviados por el frontend
  @IsOptional() @IsNumber() questionId?: number;
  @IsOptional() @IsArray() selectedOptions?: number[];
  @IsOptional() @IsBoolean() markedForReview?: boolean;
  @IsOptional() @IsString() answeredAt?: string;
}

export class SubmitEvaluacionDto {
  @IsOptional() @IsString() finishedAt?: string;
  @IsOptional() @IsArray() finalAnswers?: any[];
  @IsOptional() @IsString() submissionType?: string;
}
