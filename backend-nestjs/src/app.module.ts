import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { join } from 'path';

// All entities
import * as entities from './entities';

// All 16 modules
import { AuthModule } from './auth/auth.module';
import { CursosModule } from './cursos/cursos.module';
import { ModulosModule } from './modulos/modulos.module';
import { LeccionesModule } from './lecciones/lecciones.module';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module';
import { PagosModule } from './pagos/pagos.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { CarritoModule } from './carrito/carrito.module';
import { CertificacionesModule } from './certificaciones/certificaciones.module';
import { LineasAcademicasModule } from './lineas-academicas/lineas-academicas.module';
import { ResenasModule } from './resenas/resenas.module';
import { PerfilModule } from './perfil/perfil.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { VideoModule } from './video/video.module';
import { ContactoModule } from './contacto/contacto.module';
import { AdminModule } from './admin/admin.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { MaterialesModule } from './materiales/materiales.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    // Rate Limiting (Protección contra fuerza bruta)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // Máximo 100 peticiones por minuto (endpoints críticos tienen throttle propio)
      },
    ]),

    // Environment variables - load FIRST
    ConfigModule.forRoot({ isGlobal: true }),

    // Mail configuration
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST', 'misacademyonline.com'),
          port: Number(config.get('MAIL_PORT', 465)),
          secure: Number(config.get('MAIL_PORT', 465)) === 465, // True para 465, False para otros como 587
          auth: {
            user: config.get<string>('MAIL_USERNAME', ''),
            pass: config.get<string>('MAIL_PASSWORD', ''),
          },
          tls: {
            rejectUnauthorized: false, // Útil para evitar errores de certificados o de socket close inesperado
          },
        },
        defaults: {
          from: `"${config.get<string>('MAIL_FROM_NAME', 'MIS Academy')}" <${config.get<string>('MAIL_FROM_ADDRESS', 'soporte@misacademyonline.com')}>`,
        },
      }),
    }),

    // MySQL database (async to ensure .env is loaded)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'siteadmin_mis_academy'),
        entities: Object.values(entities),
        synchronize: config.get<string>('APP_ENV') === 'development', // Solo sincronizar en desarrollo
        logging: config.get<string>('APP_ENV') === 'development',
      }),
    }),

    // Feature Modules (17)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
      exclude: ['/api', '/api/*path'],
    }),
    TypeOrmModule.forFeature([entities.AuditLog]),
    AuthModule,
    CursosModule,
    ModulosModule,
    LeccionesModule,
    EvaluacionesModule,
    PagosModule,
    InscripcionesModule,
    CarritoModule,
    CertificacionesModule,
    LineasAcademicasModule,
    ResenasModule,
    PerfilModule,
    EstadisticasModule,
    VideoModule,
    ContactoModule,
    AdminModule,
    ChatbotModule,
    MaterialesModule,
    StorageModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CsrfMiddleware)
      .forRoutes('*');
  }
}
