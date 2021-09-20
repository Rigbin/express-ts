import { CONTENT_TYPES } from '@config/constants';
import { CustomError } from '@util/error';
import { requestDetails } from '@util/request';
import { Request, Response } from 'express';

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
    }
  });
}

function reduce(errors: Error[]): string {
  return errors.reduce((prev: string, { name, message }: Error) => {
    return `${prev}\n[${name}]: ${message}`;
  }, '').trim();
}


export class ResponseError extends CustomError {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}
