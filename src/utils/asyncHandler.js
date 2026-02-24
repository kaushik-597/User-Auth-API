//this advanced function is used because there are multiple places in the controllers where we need to use .then().catch or promises
//so instead of using those things we make a handler that does the things for us and it is just a wrapper that takes a fxn returns a callback
// and passes the err the middleware i.e. next
//three params are used here req, res and next and 1 more (i.e. error) can be used tho it aint much used.
//this util makes sure that whatever fxn is passed to it, gets promise-ified that means gets wrapped into the promise
//and gets resolved or if error occurs then catch part handles it automatically by sending the error to middleware

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error),
    );
  };
};

export { asyncHandler };
