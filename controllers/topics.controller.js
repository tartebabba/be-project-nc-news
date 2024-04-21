const { fetchAllTopics } = require('../models/topics.models');

exports.getTopics = (req, res, next) => {
  return fetchAllTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => next(err));
};
