require('reflect-metadata');
require('dotenv').config({
  path: require('path').resolve(process.cwd(), '.env'),
});

// @ts-ignore
if (typeof global !== 'undefined' && !global.crypto) {
  try {
    // @ts-ignore
    global.crypto = require('crypto').webcrypto;
  } catch (e) {}
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedTiposPago } from './database/seeds/tipos-pago.seed';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as fs from 'fs';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const requiredEnvVars = [
    'DB_HOST',
    'DB_DATABASE',
    'DB_USERNAME',
    'JWT_SECRET',
    'REFRESH_JWT_SECRET',
    'VIDEO_ENCRYPTION_KEY',
    'VIDEO_JWT_SECRET',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_USERNAME',
    'MAIL_PASSWORD',
  ];

  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
  if (missingEnvVars.length > 0) {
    throw new Error(
      `Faltan variables de entorno críticas necesarias para arrancar el servidor: ${missingEnvVars.join(', ')}`,
    );
  }

  const uploadDirs = [
    join(process.cwd(), 'uploads'),
    join(process.cwd(), 'uploads', 'comprobantes'),
  ];

  uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const corsOriginsEnv = process.env.CORS_ORIGIN;
  const allowedOrigins = corsOriginsEnv
    ? corsOriginsEnv.split(',').map((o) => o.trim())
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://muebleriarivas.website',
        'https://www.muebleriarivas.website',
        'https://api.muebleriarivas.website',
      ];

  const app = await NestFactory.create(AppModule, { abortOnError: false });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin as string;

    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type,Accept,Authorization,X-Requested-With,X-CSRF-Token',
      );
      res.header('Access-Control-Max-Age', '86400');
    }

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    next();
  });

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const dataSource = app.get(DataSource);
  await seedTiposPago(dataSource);

  const port = process.env.PORT || process.env.APP_PORT || 8000;
  await app.listen(port);

  logger.log(`MIS_ACADEMY running on port ${port}`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Error during bootstrap:', err);
  process.exit(1);
});
