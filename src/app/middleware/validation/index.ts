import { CONTENT_TYPES, RESPONSE_CODES } from '@config/constants';
import { requestDetails } from '@util/request';
import { NextFunction, Request, Response } from 'express';
import { ValidationChain, ValidationError, validationResult } from 'express-validator';


/** Validate-middleware to validate a list of `ValidationChain`s and automatically stop routing on error */
export function Validate(validations: ValidationChain[]): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction) => {
    // run all given validators
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
        res.json({ errors: errors.array(), ...requestDetails(req) });
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
