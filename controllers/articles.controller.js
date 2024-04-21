const {
  fetchArticleByID,
  fetchAllArticles,
  fetchArticleComments,
  checkArticleExists,
  checkUserExists,
  addNewComment,
  updateArticle,
  fetchArticles,
  insertArticle,
} = require('../models/articles.models');

exports.getArticles = (req, res, next) => {
  if (!Object.keys(req.query).length) {
    return fetchAllArticles()
      .then((articlesObject) => {
        const { articles, total_count } = articlesObject;
        res.status(200).send({ articles, total_count });
      })
      .catch((err) => next(err));
  } else {
    return fetchArticles(req.query)
      .then((articlesObject) => {
        const { articles, total_count } = articlesObject;
        res.status(200).send({ articles, total_count });
      })
      .catch((err) => next(err));
  }
};

exports.getArticleByID = (req, res, next) => {
  const { article_id } = req.params;
  return fetchArticleByID(article_id)
    .then((article) => {
      article.comment_count = parseInt(article.comment_count);
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

exports.patchArticleByID = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;
  return Promise.all([
    updateArticle(article_id, body),
    checkArticleExists(article_id),
  ])
    .then(([updatedArticle]) => {
      res.status(200).send({ updatedArticle });
    })
    .catch((err) => next(err));
};

exports.postArticle = (req, res, next) => {
  const { body } = req;
  return insertArticle(body)
    .then((newArticle) => {
      newArticle.comment_count = parseInt(newArticle.comment_count);
      res.status(200).send({ newArticle });
    })
    .catch((err) => next(err));
};