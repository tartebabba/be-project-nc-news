// Error Messages
exports.recordNotFound =
  "Sorry! We weren't able to find what you were looking for.";
exports.recordsNotFound = "Uh oh! Looks like there's nothing to see here..";
exports.invalidInput = 'Invalid input: incorrect data format.';

// Error Handlers

exports.sendGeneric404Error = (req, res) => {
  res.status(404).send({
    errorMessage: "Oops.. We can't find that page for you",
    errorParagraph:
      "We've searched high and low, but couldn't find the page you're looking for. How about we start from home again?",
  });
};

exports.sendErrorHandled = (err, req, res, next) => {
  // console.log(err.code, 'errorBeingHandled'); // ! Keeping this to manage debug errors.
  // ERROR MESSAGES
  const badRequest = 'Bad request';
  const invalidInput = 'Invalid input: incorrect data format.';
  // ERROR ROUTING
  if (err.status && err.errorMessage) {
    res.status(err.status).send({ errorMessage: err.errorMessage });
  } else {
    if (err.code === '23502') {
      // ! Null Violation
      res.status(400).send({ errorMessage: badRequest });
    }
    if (err.code === '23503') {
      // ! FK Violation
      res.status(400).send({ errorMessage: badRequest });
    }
    if (err.code === '22P02') {
      // ! Invalid Text Representation
      res.status(400).send({ errorMessage: invalidInput });
    }
    if (err.code === '42702') {
      // ! Ambiguous Column
      res.status(400).send({ errorMessage: badRequest });
    }
    if (err.code === '42703') {
      // ! Undefined Column
      res.status(400).send({ errorMessage: invalidInput });
    }
    if (err.code === '42601') {
      // ! Syntax error - incorrect SQL statement
      res.status(400).send({ errorMessage: invalidInput });
    }
  }
  return next(err);
};
