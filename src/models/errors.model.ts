export class FanoutConstructError extends Error {
  constructor(message: Uppercase<string>) {
    super(message);
    this.message = `${message}_FANOUT_CONSTRUCT_ERROR`;
  }
}
