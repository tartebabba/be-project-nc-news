const {
  deleteCommentByID,
  patchCommentByID,
} = require('../controllers/comments.controller');

const commentsRouter = require('express').Router();

commentsRouter
  .route('/:comment_id')
  .delete(deleteCommentByID)
  .patch(patchCommentByID);

module.exports = commentsRouter;
