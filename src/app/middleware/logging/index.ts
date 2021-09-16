import { LogFactory } from '@util/logger';
import { NextFunction, Request, Response } from 'express';

const LOGGER = LogFactory.getLogger('request');

/** Request-Logging-Middleware, logs every request */
export const RequestLogging = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const path = req.path || req.url;
  const method = req.method;
  LOGGER.info(`${ip} called '${path}' with [${method}]`);
  next();
};
