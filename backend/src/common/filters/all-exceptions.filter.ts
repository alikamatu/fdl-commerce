import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = (exception as any)?.message || 'Internal server error';

    // Granular error extraction for ValidationPipe and other HttpExceptions
    if (exception instanceof HttpException) {
      const response = exception.getResponse() as any;
      if (typeof response === 'object' && response.message) {
        message = Array.isArray(response.message)
          ? response.message.join(', ')
          : response.message;
      }
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message,
    };

    // LOG THE FULL STACK TRACE FOR 500 ERRORS
    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Unhandled Exception at ${responseBody.path}:`,
        (exception as Error)?.stack || exception,
      );
    } else {
      this.logger.warn(
        `Exception at ${responseBody.path}: ${responseBody.message}`,
      );
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
