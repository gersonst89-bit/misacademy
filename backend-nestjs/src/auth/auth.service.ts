import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { Usuario } from '../entities/usuario.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get appUrl(): string {
    return (
      this.configService.get<string>('APP_URL_BASE', 'http://localhost:5173') ??
      'http://localhost:5173'
    );
  }

  private get apiBaseUrl(): string {
    const publicApiUrl = this.configService.get<string>('API_URL_PUBLIC');
    if (publicApiUrl) return publicApiUrl;

    const port = this.configService.get<string>('APP_PORT', '8000');
    return `http://127.0.0.1:${port}/api`;
  }

  private get refreshSecret(): string {
    const secret = this.configService.get<string>('REFRESH_JWT_SECRET');
    if (!secret) {
      throw new Error('REFRESH_JWT_SECRET env variable is required but not set');
    }
    return secret;
  }

  private get jwtExpiration(): string {
    return this.configService.get<string>('JWT_EXPIRATION', '15m');
  }

  async register(dto: RegisterDto) {
    const existing = await this.authRepo.findByEmail(dto.email);
    if (existing) {
      throw new HttpException(
        'El email ya está registrado',
        HttpStatus.CONFLICT,
      );
    }

    const user = await this.authRepo.register(dto);
    const token = await this.authRepo.createVerificationToken(user.id_usuario);

    const verifyUrl = `${this.apiBaseUrl}/auth/verify/${token}`;

    const verificationMail = {
      to: user.email,
      subject: '✅ Verifica tu cuenta — MIS Academy',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎓 MIS Academy</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Plataforma de Cursos Online</p>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #0f172a; margin-top: 0;">¡Hola ${user.nombre}! 👋</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Gracias por registrarte en <strong>MIS Academy</strong>. Para activar tu cuenta y comenzar a aprender, haz clic en el siguiente botón:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Verificar mi cuenta
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">
              Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
              <a href="${verifyUrl}" style="color: #0ea5e9; word-break: break-all;">${verifyUrl}</a>
            </p>
            <p style="color: #94a3b8; font-size: 13px;">Este enlace expira en 24 horas.</p>
          </div>
          <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 12px;">
            © ${new Date().getFullYear()} MIS Academy — Todos los derechos reservados
          </div>
        </div>
      `,
    };

    this.logger.warn(
      `Mailer desactivado temporalmente. Email de verificación preparado para: ${verificationMail.to}`,
    );

    return {
      message: 'Usuario registrado. Revisa tu correo para verificar la cuenta.',
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
      },
    };
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    const user = await this.authRepo.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      await this.authRepo.createAuthLog({
        authenticatable_type: 'Usuario',
        authenticatable_id: user?.id_usuario || undefined,
        ip_address: ip,
        user_agent: userAgent,
        login_successful: false,
        failure_reason: 'Credenciales inválidas',
        login_at: new Date(),
      });
      throw new HttpException(
        'Credenciales inválidas.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.email_verificado) {
      throw new HttpException(
        'Debes verificar tu correo antes de iniciar sesión.',
        HttpStatus.FORBIDDEN,
      );
    }

    const payload = { sub: user.id_usuario, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtExpiration as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: '7d',
    });

    await this.authRepo.saveRefreshToken(user.id_usuario, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
      },
    };
  }

  async verify(token: string) {
    const appUrl = this.appUrl;
    const tokenData = await this.authRepo.findByVerificationToken(token);

    if (!tokenData) {
      return { redirect: `${appUrl}/verificado?error=token` };
    }
    if (
      tokenData.fecha_expiracion &&
      new Date() > new Date(tokenData.fecha_expiracion)
    ) {
      return { redirect: `${appUrl}/verificado?error=expirado` };
    }

    await this.authRepo.markTokenAsUsed(token);
    await this.authRepo.markEmailVerified(tokenData.id_usuario);

    const redirectUrl = `${appUrl}/verificado?success=1`;
    this.logger.log(`✅ Usuario verificado. Redirigiendo a: ${redirectUrl}`);
    return { redirect: redirectUrl };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.authRepo.findByEmail(dto.email);
    if (user) {
      const token = await this.authRepo.createResetToken(user.id_usuario);

      const resetUrl = `${this.appUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

      const resetMail = {
        to: user.email,
        subject: '🔐 Restablecer contraseña — MIS Academy',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 32px 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🔐 MIS Academy</h1>
              <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Restablecer contraseña</p>
            </div>
            <div style="padding: 32px 24px;">
              <h2 style="color: #0f172a; margin-top: 0;">Hola ${user.nombre},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón:
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Restablecer contraseña
                </a>
              </div>
              <p style="color: #94a3b8; font-size: 13px;">
                Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no será modificada.
              </p>
              <p style="color: #94a3b8; font-size: 13px;">Este enlace expira en 2 horas.</p>
            </div>
            <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 12px;">
              © ${new Date().getFullYear()} MIS Academy — Todos los derechos reservados
            </div>
          </div>
        `,
      };

      this.logger.warn(
        `Mailer desactivado temporalmente. Email de reset preparado para: ${resetMail.to}`,
      );
    }
    return {
      message:
        'Se ha enviado un correo con instrucciones para restablecer tu contraseña.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenData = await this.authRepo.findValidResetToken(dto.token);
    if (!tokenData) {
      throw new HttpException(
        'Token inválido o expirado',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      tokenData.fecha_expiracion &&
      new Date() > new Date(tokenData.fecha_expiracion)
    ) {
      throw new HttpException('Token expirado', HttpStatus.BAD_REQUEST);
    }

    const user = await this.authRepo.findById(tokenData.id_usuario);
    if (!user || user.email !== dto.email) {
      throw new HttpException(
        'Usuario no coincide con el token',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.authRepo.updatePassword(user.id_usuario, dto.password);
    await this.authRepo.markTokenAsUsed(dto.token);

    return { success: true, message: 'Contraseña actualizada correctamente' };
  }

  async getProfile(userId: number) {
    const user = await this.authRepo.findById(userId);
    if (!user)
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    return user;
  }

  async changePassword(user: Usuario) {
    const token = await this.authRepo.createResetToken(user.id_usuario);

    const resetUrl = `${this.appUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    const changePasswordMail = {
      to: user.email,
      subject: '🔑 Cambio de contraseña — MIS Academy',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔑 MIS Academy</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Cambio de contraseña</p>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #0f172a; margin-top: 0;">Hola ${user.nombre},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Has solicitado cambiar tu contraseña. Haz clic en el siguiente botón para establecer una nueva:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Cambiar contraseña
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">Este enlace expira en 2 horas.</p>
          </div>
          <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 12px;">
            © ${new Date().getFullYear()} MIS Academy — Todos los derechos reservados
          </div>
        </div>
      `,
    };

    this.logger.warn(
      `Mailer desactivado temporalmente. Email de cambio de contraseña preparado para: ${changePasswordMail.to}`,
    );

    return {
      success: true,
      message:
        'Se ha enviado un correo con instrucciones para cambiar tu contraseña.',
    };
  }

  async githubLogin(req: any) {
    if (!req.user) {
      throw new HttpException('No user from github', HttpStatus.BAD_REQUEST);
    }

    const { email, nombre, imagen_perfil } = req.user;

    let user = await this.authRepo.findByEmail(email);

    if (!user) {
      user = await this.authRepo.register({
        email,
        nombre,
        apellido: '',
        password: Math.random().toString(36).slice(-10),
      });

      await this.authRepo.markEmailVerified(user.id_usuario);

      if (imagen_perfil) {
        await this.authRepo.updateAvatar(user.id_usuario, imagen_perfil);
      }
    }

    const payload = { sub: user.id_usuario, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtExpiration as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: '7d',
    });

    await this.authRepo.saveRefreshToken(user.id_usuario, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token signature');
    }

    const tokenInDb = await this.authRepo.findRefreshToken(refreshToken);

    if (tokenInDb && tokenInDb.usado) {
      await this.authRepo.invalidateAllUserRefreshTokens(tokenInDb.id_usuario);
      throw new UnauthorizedException('Compromised session. Please login again.');
    }

    if (
      !tokenInDb ||
      (tokenInDb.fecha_expiracion && new Date() > tokenInDb.fecha_expiracion)
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.authRepo.findById(tokenInDb.id_usuario);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    tokenInDb.usado = true;
    await this.authRepo.updateToken(tokenInDb);

    const payload = {
      sub: user.id_usuario,
      email: user.email,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtExpiration as any,
    });

    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret,
      expiresIn: '7d',
    });

    await this.authRepo.saveRefreshToken(user.id_usuario, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async invalidateRefreshToken(refreshToken: string) {
    const token = await this.authRepo.findRefreshToken(refreshToken);
    if (token) {
      token.usado = true;
      await this.authRepo.updateToken(token);
    }
  }

  async logout(userId?: number, refreshToken?: string): Promise<void> {
    let resolvedUserId = userId;

    if (refreshToken) {
      const token = await this.authRepo.findRefreshToken(refreshToken);
      if (token) {
        token.usado = true;
        await this.authRepo.updateToken(token);
        resolvedUserId = resolvedUserId || token.id_usuario;
      }
    }

    if (resolvedUserId) {
      await this.authRepo.updateLogout(resolvedUserId);
    }
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}