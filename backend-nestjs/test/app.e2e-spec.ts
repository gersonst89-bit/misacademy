import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import request from 'supertest';
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';

import { AppModule } from './../src/app.module';

describe('Auth E2E', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    app.use(cookieParser());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  it('debe rechazar login con credenciales inválidas', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'usuario-que-no-existe@test.com',
        password: 'password-invalido',
      })
      .expect(401);

    expect(response.body).toBeDefined();
  });
  it('debe rechazar acceso al perfil sin autenticación', async () => {
  await request(app.getHttpServer())
    .get('/api/auth/profile')
    .expect(401);
});

  afterEach(async () => {
    await app.close();
  });
});
