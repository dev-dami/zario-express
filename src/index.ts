import { Request, Response, NextFunction } from 'express';
import { Logger } from 'zario';

export interface ExpressLoggerOptions {
  logger?: Logger;
  level?: 'info' | 'debug' | 'warn' | 'error' | string;
  excludePaths?: string[];
}

export function expressLogger(options: ExpressLoggerOptions = {}) {
  const logger = options.logger || Logger.global;
  const level = options.level || 'info';
  const excludePaths = options.excludePaths || [];

  return (req: Request, res: Response, next: NextFunction) => {
    if (excludePaths.includes(req.path)) {
      return next();
    }

    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      
      const logData = {
        method: req.method,
        url: req.originalUrl || req.url,
        status: res.statusCode,
        responseTimeMs: parseFloat(durationMs.toFixed(2)),
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
      };

      const message = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${durationMs.toFixed(1)}ms`;
      
      if (typeof (logger as any)[level] === 'function') {
        (logger as any)[level](message, logData);
      } else {
        logger.info(message, logData);
      }
    });

    next();
  };
}
