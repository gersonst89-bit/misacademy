import { Injectable, NestMiddleware, ForbiddenException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CsrfMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    const url = req.originalUrl || req.url;

    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

    // Rutas que no requieren CSRF porque no usan cookies para autenticación
    // o son endpoints de autenticación inicial (login, registro, OAuth callbacks)
    const csrfExemptRoutes = [
      'auth/login',
      'auth/register',
      'auth/refresh',
      'auth/logout',
      'auth/google',
      'auth/github',
      'auth/forgot-password',
      'auth/reset-password',
      'auth/verify',
      'chatbot',
      'contacto', 
    ];

    const isExemptRoute = csrfExemptRoutes.some((route) => url.includes(route));
    const isProd = process.env.APP_ENV === 'production';

    // 1. Generar token CSRF en peticiones seguras (GET/HEAD/OPTIONS)
    if (safeMethods.includes(method)) {
      if (!req.cookies['XSRF-TOKEN']) {
        const newToken = uuidv4();
        res.cookie('XSRF-TOKEN', newToken, {
          httpOnly: false, // El frontend necesita leerlo para enviarlo como header
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          path: '/',
          domain: process.env.COOKIE_DOMAIN || undefined,
        });
      }
      return next();
    }

    // 2. Saltar validación para rutas exentas
    if (isExemptRoute) {
      return next();
    }

    // 3. Validar token CSRF en peticiones de escritura (POST, PUT, PATCH, DELETE)
    const csrfHeader = req.headers['x-csrf-token'] as string | undefined;
    const csrfCookie = req.cookies['XSRF-TOKEN'];

    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      this.logger.warn(
        `CSRF bloqueado -> ${method} ${url} | Header: ${csrfHeader ? 'presente' : 'ausente'} | Cookie: ${csrfCookie ? 'presente' : 'ausente'}`,
      );
      throw new ForbiddenException('Token CSRF inválido o ausente.');
    }

    next();
  }
}
