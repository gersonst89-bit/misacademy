import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip, headers, user } = request;

    // Solo loguear acciones que modifican datos o son críticas
    const criticalMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (!criticalMethods.includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const module = url.split('/')[2] || 'unknown'; // api/v1/MODULE/...

          // No loguear contraseñas o datos sensibles
          const cleanBody = { ...body };
          if (cleanBody.password) cleanBody.password = '********';
          if (cleanBody.token) cleanBody.token = '********';

          const audit = this.auditRepo.create({
            id_usuario: user?.id_usuario || null,
            action: method,
            module: module,
            details: JSON.stringify({
              url,
              body: cleanBody,
              response: data?.status || 'success',
            }),
            ip_address: ip,
            user_agent: headers['user-agent'],
          });

          await this.auditRepo.save(audit);
        } catch (error) {
          console.error('Error saving audit log:', error);
        }
      }),
    );
  }
}
