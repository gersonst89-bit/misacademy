import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';

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

import { AuditLog } from './entities/audit-log.entity';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      cache: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<number>('DB_PORT', 3306)),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        logging: true,
      }),
    }),

    TypeOrmModule.forFeature([AuditLog]),

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
    NotificacionesModule,
  ],
  controllers: [HealthController],
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
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}
