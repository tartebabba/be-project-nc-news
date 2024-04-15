const {
  fetchAllTopics,
  fetchEndpointsDescription,
} = require('../models/topics.models');

exports.getEndpointsDescription = (req, res, next) => {
  return fetchEndpointsDescription()
    .then((endpoints) => {
      res.status(200).send(endpoints);
    })
    .catch((err) => next(err));
};

exports.getTopics = (req, res, next) => {
  return fetchAllTopics()
    .then((topics) => {
      res.status(200).send(topics);
    })
    .catch((err) => next(err));
};
