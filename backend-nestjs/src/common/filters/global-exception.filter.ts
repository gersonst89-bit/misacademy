import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let extraData = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exceptionResponse;
        const { message: _m, statusCode: _s, error: _e, ...rest } = exceptionResponse as any;
        extraData = rest;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      // Registrar el error real en la consola del servidor (no enviarlo al cliente)
      console.error(`[GlobalExceptionFilter] Error no manejado en ${request.url}:`, exception);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      ...extraData,
    });
  }
}
