export class CustomError extends Error {
  constructor(public msg: string) {
    super(msg);
    this.name = this.constructor.name;
  }
}
