/**
 * An application-specific CustomError, should be used as base for all custom errors
 * @typedef {object} CustomError
 * @property {string} msg.required - error message
 * @property {name} name.required - error name
 * @extends Error
 */
export class CustomError extends Error {
  constructor(public msg: string) {
    super(msg);
    this.name = this.constructor.name;
  }
}
