import type { Request, RequestHandler } from "express";
import { type Logger, type LogLevel, zario } from "zario";

declare global {
  namespace Express {
    interface Request {
      /** Request-scoped logger, available after expressLogger middleware. */
      log: Logger;
      requestId: string;
    }
  }
}

export interface ExpressLoggerOptions {
  logger?: Logger;
  level?: LogLevel;
  excludePaths?: string[];
  /** Override ID generation; incoming headers are not trusted automatically. */
  requestId?: (request: Request) => string;
}

/** Attach req.log and record completion/aborted responses with request context. */
export function expressLogger(
  options: ExpressLoggerOptions = {},
): RequestHandler {
  const logger = options.logger ?? zario();
  const excluded = new Set(options.excludePaths);
  return (req, res, next): void => {
    const start = performance.now();
    req.requestId = options.requestId?.(req) ?? crypto.randomUUID();
    req.log = logger.child({ requestId: req.requestId });
    if (excluded.has(req.path)) {
      next();
      return;
    }
    let recorded = false;
    const completed = (aborted: boolean): void => {
      if (recorded) return;
      recorded = true;
      res.off("finish", onFinish);
      res.off("close", onClose);
      const responseTimeMs = performance.now() - start;
      const level =
        options.level ??
        (aborted || res.statusCode >= 500
          ? "error"
          : res.statusCode >= 400
            ? "warn"
            : "info");
      req.log.logWithLevel(
        level,
        `${req.method} ${req.path} ${res.statusCode}`,
        {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          responseTimeMs,
          aborted,
        },
      );
    };
    const onFinish = (): void => completed(false);
    const onClose = (): void => completed(!res.writableFinished);
    res.once("finish", onFinish);
    res.once("close", onClose);
    next();
  };
}
