import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');

    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    console.log('GOOGLE OAUTH CONFIG:', {
      clientID: clientID ? 'OK' : 'MISSING',
      clientSecret: clientSecret ? 'OK' : 'MISSING',
      callbackURL: callbackURL || 'MISSING',
    });

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error(
        'Google OAuth environment variables are not properly configured',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['profile', 'email'],
    });
  }

  authorizationParams() {
    return {
      prompt: 'select_account',
    };
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const email = profile.emails?.find((item) => item.value)?.value ?? null;

    const nombre = profile.name?.givenName || profile.displayName || '';

    const apellido = profile.name?.familyName || '';

    const imagen_perfil = profile.photos?.[0]?.value ?? null;

    return {
      email,
      nombre,
      apellido,
      imagen_perfil,
      accessToken,
    };
  }
}
