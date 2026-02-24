//since node provides already built in class for errors so we dont need to do it manually
//therefore we can extend the class of Error

class ApiError extends Error {
  constructor(
    statusCode,
    message = "ApiError says: Something went wrong",
    errors = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
