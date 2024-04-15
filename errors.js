// Error Handler

exports.sendGeneric404Error = (req, res) => {
  res.status(404).send({
    errorMessage: "Oops.. We can't find that page for you",
    errorParagraph:
      "We've searched high and low, but couldn't find the page you're looking for. How about we start from home again?",
  });
};

exports.sendErrorHandled = (err, req, res, next) => {
  if (err.status && err.errorMessage) {
    res.status(err.status).send({ errorMessage: err.errorMessage });
  } else {
    if (err.code === '23502') {
      res.status(400).send({ errorMessage: 'Bad request' });
    }
  }
  return next(err);
};
