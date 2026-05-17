import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GetVideoTokenDto {
  @IsOptional()
  @IsString()
  fingerprint?: string;
}

export class VideoHeartbeatDto {
  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsNumber()
  lesson_id?: number;

  @IsOptional()
  @IsNumber()
  current_time?: number;

  @IsOptional()
  timestamp?: any;

  @IsOptional()
  @IsString()
  fingerprint?: string;
}
