import { RESPONSE_CODES } from '@config/constants';
import { LogFactory } from '@util/logger';
import { NextFunction, Request, Response } from 'express';

const LOGGER = LogFactory.getLogger('routing-error');

export function RoutingError(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const msg = `general routing error [${err.message}]`;
  LOGGER.error(msg);
  LOGGER.debug(msg, err);
  res.status(RESPONSE_CODES.SERVER_ERROR).send('Something went wrong');
  // next(err);
}
