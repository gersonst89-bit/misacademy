import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Request, Response, CookieOptions } from 'express';
import { Usuario } from '../entities/usuario.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto, LoginResponseDto } from './dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieOptions(): CookieOptions {
    const isProd = this.configService.get<string>('APP_ENV') === 'production';
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    };
    const domain = this.configService.get<string>('COOKIE_DOMAIN');
    if (isProd && domain) {
      cookieOptions.domain = domain;
    }
    return cookieOptions;
  }

  // ========================
  // REGISTER
  // ========================
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ========================
  // LOGIN
  // ========================
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.login(
      dto,
      req.ip || '',
      req.headers['user-agent'] || '',
    );

    const cookieOptions = this.getCookieOptions();

    // ✅ auth_token: mismo TTL que el JWT (15min) para que expiren juntos
    res.cookie('auth_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    // ✅ refresh_token: 7 días
    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const serialized = plainToInstance(LoginResponseDto, result, {
      excludeExtraneousValues: true,
    });

    return res.status(200).json(serialized);
  }

  // ========================
  // LOGOUT
  // ========================
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.['refresh_token'];
    const accessToken = req.cookies?.['auth_token'];

    let userId: number | undefined;
    if (accessToken) {
      try {
        const payload = this.authService.decodeToken(accessToken);
        if (payload && payload.sub) {
          userId = Number(payload.sub);
        }
      } catch {
        // Ignorar errores al decodificar
      }
    }

    // Invalida el refresh token y registra el logout en BD si es posible
    try {
      await this.authService.logout(userId, refreshToken);
    } catch {
      // No bloqueamos el logout si falla la BD
    }

    const baseOptions = this.getCookieOptions();

    // ✅ clearCookie debe llevar los mismos atributos + maxAge=0
    // para forzar la eliminación sin importar si la cookie tenía maxAge o no
    res.clearCookie('auth_token', {
      ...baseOptions,
      maxAge: 0,
      expires: new Date(0),
    });
    res.clearCookie('refresh_token', {
      ...baseOptions,
      maxAge: 0,
      expires: new Date(0),
    });

    return res.status(200).json({ message: 'Sesión cerrada correctamente.' });
  }

  // ========================
  // VERIFY EMAIL
  // ========================
  @Get('verify/:token')
  async verify(@Param('token') token: string, @Res() res: Response) {
    const result = await this.authService.verify(token);
    return res.redirect(result.redirect);
  }

  // ========================
  // PASSWORD
  // ========================
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ========================
  // PROFILE
  // ========================
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@CurrentUser() user: Usuario) {
    const profile = await this.authService.getProfile(user.id_usuario);
    return plainToInstance(UserResponseDto, profile, {
      excludeExtraneousValues: true,
    });
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

  // ========================
  // GITHUB LOGIN
  // ========================
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.githubLogin(req);

    const frontendUrl =
      this.configService.get<string>('APP_URL_BASE') || 'http://localhost:5173';

    const cookieOptions = this.getCookieOptions();

    // ✅ Consistencia con el login normal: auth_token con maxAge de 15min
    res.cookie('auth_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${frontendUrl}/perfil`);
  }

  // ========================
  // REFRESH (ROTACIÓN SEGURA)
  // ========================
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    try {
      const result = await this.authService.refresh(refreshToken);

      const cookieOptions = this.getCookieOptions();

      // ✅ Actualizar el access token en cookie con maxAge consistente (15m)
      res.cookie('auth_token', result.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      // ✅ Rotar y guardar el nuevo refresh token en cookie (7d)
      res.cookie('refresh_token', result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({ success: true });
    } catch (error) {
      const baseOptions = this.getCookieOptions();
      res.clearCookie('auth_token', {
        ...baseOptions,
        maxAge: 0,
        expires: new Date(0),
      });
      res.clearCookie('refresh_token', {
        ...baseOptions,
        maxAge: 0,
        expires: new Date(0),
      });
      throw error;
    }
  }
}
