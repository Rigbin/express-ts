import { RESPONSE_CODES } from '@config/constants';
import { CustomError } from '@util/error';
import { LogFactory } from '@util/logger';
import { errorResponse } from '@util/response';
import { NextFunction, Request, Response } from 'express';

const LOGGER = LogFactory.getLogger('routing-error');

/** RoutingError-Middleware to define default response when some unexpected error occurs on some route */
export async function RoutingErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction): Promise<void> {
  const msg = `general routing error [${err.message}]`;
  LOGGER.error(msg);
  LOGGER.debug(msg, err);
  return errorResponse(req, res,
    [new RoutingError(req.baseUrl + req.path, 'general routing error'), err],
    RESPONSE_CODES.SERVER_ERROR);
}

class RoutingError extends CustomError {
  constructor(public route: string, msg: string) {
    super(msg);
  }
}
