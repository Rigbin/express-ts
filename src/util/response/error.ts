import { CONTENT_TYPES } from '@config/constants';
import { CustomError } from '@util/error';
import { requestDetails } from '@util/request';
import { RequestDetails } from '@util/request/details';
import { Request, Response } from 'express';
import { ValidationError } from 'express-validator';

export async function errorResponse(req: Request, res: Response, errors: Error[], status: number): Promise<void> {
  const msg = reduce(errors);
  res.status(status).format({
    [CONTENT_TYPES.PLAIN]: () => {
      res.send(msg);
    },
    [CONTENT_TYPES.JSON]: () => {
      res.json({ errors, ...requestDetails(req) });
    },
    default: () => {
      res.send(msg);
    },
  });
}

function reduce(errors: Error[]): string {
  return errors.reduce((prev: string, { name, message }: Error) => {
    return `${prev}\n[${name}]: ${message}`;
  }, '').trim();
}

/**
 * A ResponseError
 * @typedef {CustomError} ResponseError
 * @extends {CustomError}
 * @property {number} status - status code regarding to error
 */
export class ResponseError extends CustomError {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

/**
 * An error response
 * @typedef {allOf|object|RequestDetails} ErrorResponse
 * @property {array<ResponseError|ValidationError>} errors - list of errors, according to request
 */
export interface ErrorResponse extends RequestDetails {
  errors: (ResponseError | ValidationError)[];
}
