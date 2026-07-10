import { Expose, Type } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id_usuario!: number;

  @Expose()
  id_rol!: number;

  @Expose()
  nombre!: string;

  @Expose()
  apellido!: string;

  @Expose()
  email!: string;

  @Expose()
  dni?: string;

  @Expose()
  telefono?: string;

  @Expose()
  imagen_perfil?: string;

  @Expose()
  biografia?: string;

  @Expose()
  email_verificado!: boolean;

  @Expose()
  estado!: string;

  @Expose()
  fecha_registro!: Date;
}

export class LoginResponseDto {
  @Expose()
  accessToken!: string;

  @Expose()
  refreshToken!: string;

  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;
}
