import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        //ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['auth_token'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET env variable is required but not set');
        return secret;
      })(),
    });
  }

  async validate(payload: any) {
    const user = await this.usuarioRepo.findOne({
      where: { id_usuario: payload.sub },
      relations: ['rol'],
    });
    if (!user || user.estado !== 'Activo') {
      throw new UnauthorizedException('Usuario inactivo o eliminado');
    }
    return user;
  }
}
