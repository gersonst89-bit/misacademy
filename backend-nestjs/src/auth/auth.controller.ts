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

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

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
    async login(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
        const result = await this.authService.login(
            dto,
            req.ip || '',
            req.headers['user-agent'] || '',
        );

        const isProd = this.configService.get<string>('NODE_ENV') === 'production';

        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
        };

        res.cookie('auth_token', result.accessToken, cookieOptions);

        res.cookie('refresh_token', result.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json(result);
    }

    // ========================
    // LOGOUT
    // ========================
    @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req.cookies['refresh_token'];

        if (refreshToken) {
            await this.authService.invalidateRefreshToken(refreshToken);
        }

        const isProd = this.configService.get<string>('NODE_ENV') === 'production';

        const clearOptions: CookieOptions = {
            path: '/',
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
        };

        res.clearCookie('auth_token', clearOptions);
        res.clearCookie('refresh_token', clearOptions);

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

    // ========================
    // GITHUB LOGIN
    // ========================
    @Get('github')
    @UseGuards(AuthGuard('github'))
    async githubAuth() { }

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubAuthRedirect(@Req() req: any, @Res() res: Response) {
        const result = await this.authService.githubLogin(req);

        const frontendUrl =
            this.configService.get<string>('APP_URL_BASE') ||
            'http://localhost:5173';

        const isProd = this.configService.get<string>('NODE_ENV') === 'production';

        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
        };

        res.cookie('auth_token', result.accessToken, cookieOptions);

        res.cookie('refresh_token', result.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.redirect(`${frontendUrl}/dashboard`);
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

        const result = await this.authService.refresh(refreshToken);

        const isProd = this.configService.get<string>('NODE_ENV') === 'production';

        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
        };

        res.cookie('auth_token', result.accessToken, cookieOptions);

        return res.json({ success: true });
    }
}