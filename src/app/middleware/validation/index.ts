import { CONTENT_TYPES, RESPONSE_CODES } from '@config/constants';
import { NextFunction, Request, Response } from 'express';
import { ValidationChain, ValidationError, validationResult } from 'express-validator';

export function Validate(validations: ValidationChain[]): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(RESPONSE_CODES.BAD_REQUEST).format({
      [CONTENT_TYPES.PLAIN]: () => {
        res.send(reduce(errors.array()));
      },
      [CONTENT_TYPES.JSON]: () => {
        res.json({ errors: errors.array() });
      },
      default: () => {
        res.send(reduce(errors.array()));
      },
    });
  };
}

function reduce(errors: ValidationError[]): string {
  return errors.reduce((prev: string, { location, msg, param }: ValidationError) => {
    return `${prev}\n${location}[${param}]: ${msg}`;
  }, '').trim();
}

export { keyExistsValidator } from './key-exists.validator';
