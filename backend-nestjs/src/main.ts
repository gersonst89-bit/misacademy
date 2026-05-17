import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedTiposPago } from './database/seeds/tipos-pago.seed';
import { seedMasterStructure } from './database/seeds/master-structure.seed';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as fs from 'fs';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const uploadDirs = [
    join(process.cwd(), 'uploads'),
    join(process.cwd(), 'uploads', 'comprobantes'),
  ];
  uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
  const app = await NestFactory.create(AppModule);

  // 1. Seguridad HTTP (Helmet)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Desactivar CSP para evitar bloqueos en subdominios
    }),
  );

  app.setGlobalPrefix('api');

  // Habilitar cookie-parser para HttpOnly cookies
  app.use(cookieParser());

  // CORS dinámico desde .env
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type, Accept, Authorization, X-Requested-With, X-CSRF-Token',
  });

  // Middleware global para evitar caché en el API
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // 2. Filtro de Excepciones Globales
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 3. Validación Estricta
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve parámetros que no estén en el DTO
      forbidNonWhitelisted: true, // Rechaza la petición si trae parámetros extra
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const dataSource = app.get(DataSource);
  await seedTiposPago(dataSource);
  await seedMasterStructure(dataSource);
  // await seedMain(dataSource);

  const port = process.env.APP_PORT || 8000;
  await app.listen(port);
  console.log(`🚀 MIS_ACADEMY NestJS running on http://127.0.0.1:${port}/api`);
}
bootstrap().catch(err => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
