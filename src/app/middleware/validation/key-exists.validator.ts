import { param, ValidationChain } from 'express-validator';

export const keyExistsValidator: ValidationChain[] = [
  param('key')
    .trim()
    .escape()
    .not().isEmpty()
    .bail(),
];
