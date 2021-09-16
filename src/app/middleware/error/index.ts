import { CONTENT_TYPES, RESPONSE_CODES } from '@config/constants';
import { LogFactory } from '@util/logger';
import { requestDetails } from '@util/request';
import { NextFunction, Request, Response } from 'express';

const LOGGER = LogFactory.getLogger('routing-error');

/** RoutingError-Middleware to define default response when some unexpected error occurs on some route */
export function RoutingError(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const msg = `general routing error [${err.message}]`;
  LOGGER.error(msg);
  LOGGER.debug(msg, err);
  res.status(RESPONSE_CODES.SERVER_ERROR).format({
    [CONTENT_TYPES.PLAIN]: () => {
      res.send(msg);
    },
    [CONTENT_TYPES.JSON]: () => {
      res.json({
        errors: [
          { name: 'RoutingError', message: 'general routing error' },
          { ...err, message: err.message || '' },
        ], ...requestDetails(req)
      });
    },
    default: () => {
      res.send(msg);
    }
  });
  // next(err);
}
