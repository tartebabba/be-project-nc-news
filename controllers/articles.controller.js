const {
  fetchArticleByID,
  fetchAllArticles,
} = require('../models/articles.models');

exports.getArticles = (req, res, next) => {
  return fetchAllArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => next(err));
};

exports.getArticleByID = (req, res, next) => {
  const { article_id } = req.params;
  return fetchArticleByID(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};
