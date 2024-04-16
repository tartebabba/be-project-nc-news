const {
  fetchArticleByID,
  fetchAllArticles,
  fetchArticleComments,
  checkArticleExists,
  checkUserExists,
  addNewComment,
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

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  return Promise.all([
    fetchArticleComments(article_id),
    checkArticleExists(article_id),
  ])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch((err) => next(err));
};

exports.postArticleComment = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;
  return addNewComment(article_id, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => next(err));
};