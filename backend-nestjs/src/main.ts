import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { appendFileSync } from 'fs';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  app.enableCors({
    origin: [
      'https://misacademyonline.com',
      'https://www.misacademyonline.com',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
  });

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = Number(process.env.APP_PORT || process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
}

const startupLog = './startup-error.log';

function writeStartupError(error: unknown) {
  const detail =
    error instanceof Error
      ? `${error.name}: ${error.message}\n${error.stack}`
      : JSON.stringify(error, null, 2);

  const message = `
===== STARTUP ERROR ${new Date().toISOString()} =====
${detail}
===============================================

`;

  try {
    appendFileSync(startupLog, message);
  } catch (fileError) {
    console.error('No se pudo escribir startup-error.log', fileError);
  }

  console.error(message);
}

process.on('uncaughtException', (error) => {
  writeStartupError(error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  writeStartupError(error);
  process.exit(1);
});

bootstrap().catch((error) => {
  writeStartupError(error);
  process.exit(1);
});




