import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Match } from '../../common/decorators/match.decorator';

export class RegisterDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  nombre!: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString()
  apellido!: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}

export class LoginDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail()
  email!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  @Match('password', { message: 'Las contraseñas no coinciden' })
  password_confirmation!: string;
}
