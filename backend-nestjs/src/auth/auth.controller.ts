import { Controller, Post, Get, Body, Param, Req, Res, UseGuards, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Request, Response } from 'express';
import { Usuario } from '../entities/usuario.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  
  @Get('csrf-token')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getCsrfToken(@Req() req: Request, @Res() res: Response) {
    // Generamos un token aleatorio y lo guardamos en una cookie (no HttpOnly para que el frontend pueda leerla, o vía header)
    // O mejor: lo guardamos en la sesión/cookie y lo devolvemos en el body
    const csrfToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Guardamos en cookie para validación posterior
    res.cookie('XSRF-TOKEN', csrfToken, {
      secure: true,
      sameSite: 'none',
      path: '/',
      domain: this.configService.get<string>('COOKIE_DOMAIN'),
    });
    
    return res.json({ csrfToken });
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.authService.login(dto, req.ip || '', req.headers['user-agent'] || '');
    
    const cookieOptions = {
      secure: true,
      sameSite: 'none' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      domain: this.configService.get<string>('COOKIE_DOMAIN'),
    };

    // 1. Cookie de seguridad (Secreta, HttpOnly)
    res.cookie('auth_token', result.token, { ...cookieOptions, httpOnly: true });

    // 2. Cookie "bandera" para el frontend (No secreta, el JS puede leerla)
    res.cookie('is_logged_in', 'true', { ...cookieOptions, httpOnly: false });

    return res.status(200).json(result);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    // Forzamos las opciones exactas con las que se creó la cookie en producción
    const cookieOptions = {
      path: '/',
      secure: true,
      sameSite: 'none' as const,
      domain: this.configService.get<string>('COOKIE_DOMAIN'),
    };

    // Borramos con las opciones exactas de producción
    res.clearCookie('auth_token', { ...cookieOptions, httpOnly: true });
    res.clearCookie('is_logged_in', { ...cookieOptions, httpOnly: false });
    res.clearCookie('XSRF-TOKEN', { ...cookieOptions, httpOnly: false });
    
    // Y por si acaso estuvieras en localhost probando, un segundo intento
    res.clearCookie('auth_token', { path: '/', httpOnly: true });
    res.clearCookie('is_logged_in', { path: '/', httpOnly: false });
    
    return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
  }

  @Get('verify/:token')
  async verify(@Param('token') token: string, @Res() res: Response) {
    const result = await this.authService.verify(token);
    return res.redirect(result.redirect);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('test-email')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async testEmail(@Query('to') toEmail: string) {
      if (!toEmail) return { success: false, message: 'Falta el parámetro ?to=tu_correo@gmail.com' };
      try {
          await this.authService['mailerService'].sendMail({
              to: toEmail,
              subject: 'Test SMTP MIS Academy',
              html: `<h1>Prueba de conexión</h1><p>Si estás leyendo esto, el correo desde MIS Academy funciona perfectamente.</p>`,
          });
          return { success: true, message: `Email enviado correctamente a ${toEmail}` };
      } catch (error) {
          return { success: false, error: error.message, stack: error.stack };
      }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@CurrentUser() user: Usuario) {
    return this.authService.getProfile(user.id_usuario);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@CurrentUser() user: Usuario) {
    return this.authService.changePassword(user);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUser(@CurrentUser() user: Usuario) {
    return user;
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth(@Req() req: any) {
    // Inicia el flujo de GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.githubLogin(req);
    const frontendUrl = process.env.APP_URL_BASE || 'http://localhost:5173';
    
    const cookieOptions = {
        secure: true,
        sameSite: 'none' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: this.configService.get<string>('COOKIE_DOMAIN'),
    };

    res.cookie('auth_token', result.token, { ...cookieOptions, httpOnly: true });
    res.cookie('is_logged_in', 'true', { ...cookieOptions, httpOnly: false });

    return res.redirect(`${frontendUrl}/login?github=true`);
  }
}
