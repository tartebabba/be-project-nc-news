const {
  removeComment,
  updateComment,
  checkCommentExists,
} = require('../models/comments.models');

exports.deleteCommentByID = (req, res, next) => {
  const { comment_id } = req.params;
  return removeComment(comment_id)
    .then((deletedComment) => {
      res.status(204).send();
    })
    .catch((err) => next(err));
};

exports.patchCommentByID = (req, res, next) => {
  const { comment_id } = req.params;
  return Promise.all([
    updateComment(comment_id, req.body),
    checkCommentExists(comment_id),
  ])
    .then(([updatedComment]) => {
      res.status(200).send({ updatedComment });
    })
    .catch((err) => next(err));
};
