abstract class CustomError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidArgumentError extends CustomError {
  constructor(m = "Invalid arguments.") {
    super(m);
  }
}

export class UnconvergencedError extends CustomError {
  constructor(m = "Unconvergenced.") {
    super(m);
  }
}
