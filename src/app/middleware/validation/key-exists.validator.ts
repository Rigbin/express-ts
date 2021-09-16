import { param, ValidationChain } from 'express-validator';

/** default validation chain for `/:key` routes.
 * The `key` param will be escaped to avoid/reduce injection attacks
 */
export const keyExistsValidator: ValidationChain[] = [
  param('key')
    .trim()
    .escape()
    .not().isEmpty()
    .bail(),
];
