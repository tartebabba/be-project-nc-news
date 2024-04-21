const {
  getArticleByID,
  getArticles,
  getArticleComments,
  postArticleComment,
  patchArticleByID,
  postArticle,
} = require('../controllers/articles.controller');

const articlesRouter = require('express').Router();

articlesRouter.route('/').get(getArticles).post(postArticle);

articlesRouter
  .route('/:article_id')
  .get(getArticleByID)
  .patch(patchArticleByID);

articlesRouter
  .route('/:article_id/comments')
  .get(getArticleComments)
  .post(postArticleComment);

module.exports = articlesRouter;
