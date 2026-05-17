import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { GithubStrategy } from '../common/strategies/github.strategy';
import { Usuario } from '../entities/usuario.entity';
import { TokenUsuario } from '../entities/token-usuario.entity';
import { AuthenticationLog } from '../entities/authentication-log.entity';
import { Rol } from '../entities/rol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, TokenUsuario, AuthenticationLog, Rol]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'MIS_ACADEMY_JWT_SECRET_KEY_2025_VERY_SECURE',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '7d' } as any,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, GithubStrategy],
  exports: [AuthService, AuthRepository, JwtModule, PassportModule],
})
export class AuthModule {}
