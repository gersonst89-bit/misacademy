import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID')!,
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL')!,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const { displayName, username, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      nombre: displayName || username,
      apellido: '',
      imagen_perfil: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
