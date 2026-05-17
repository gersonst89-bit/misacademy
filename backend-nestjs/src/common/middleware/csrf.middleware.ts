import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    const url = req.originalUrl || req.url;
    
    // EXCEPCIÓN TOTAL para el Chatbot
    if (url.includes('chatbot')) return next();

    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    
    const isPublicRoute = url.includes('auth/login') || 
                         url.includes('auth/register') || 
                         url.includes('auth/refresh') ||
                         url.includes('auth/logout') ||
                         url.includes('auth/google') ||
                         url.includes('auth/github') || 
                         url.includes('carrito') ||
                         url.includes('chatbot') ||
                         url.includes('pagos');

    // 1. Generar token si no existe en peticiones seguras
    if (safeMethods.includes(method)) {
      if (!req.cookies['XSRF-TOKEN']) {
        const newToken = uuidv4();
        res.cookie('XSRF-TOKEN', newToken, {
          httpOnly: false, 
          secure: true,
          sameSite: 'none',
          path: '/',
          domain: process.env.COOKIE_DOMAIN || undefined
        });
      }
      return next();
    }

    // 2. Saltar validación para rutas críticas
    if (isPublicRoute) {
      return next();
    }

    // 3. Validar token en peticiones de escritura
    const csrfHeader = req.headers['x-csrf-token'];
    const csrfCookie = req.cookies['XSRF-TOKEN'];

    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      console.warn(`[CsrfMiddleware] BLOQUEO CSRF -> Path: ${url}, Header: ${csrfHeader}, Cookie: ${csrfCookie}`);
      throw new ForbiddenException('Invalid or missing CSRF token');
    }

    next();
  }
}
