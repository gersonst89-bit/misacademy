import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
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
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET env variable is required but not set');
        }

        return {
          secret,
          signOptions: {
            expiresIn: (config.get<string>('JWT_EXPIRATION', '15m') as any),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy, GithubStrategy],
  exports: [AuthService, AuthRepository, JwtModule, PassportModule],
})
export class AuthModule {}