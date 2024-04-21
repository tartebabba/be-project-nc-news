const db = require('../db/connection');

// ERROR MESSAGES
const recordNotFound =
  "Sorry! We weren't able to find what you were looking for.";
const recordsNotFound = "Uh oh! Looks like there's nothing to see here..";
const invalidInput = 'Invalid input: incorrect data format.';

// UTILS
exports.checkCommentExists = (commentID) => {
  const commentExistsQuery = `SELECT * FROM comments
  WHERE comment_id = $1`;
  return db.query(commentExistsQuery, [commentID]).then(({ rows }) => {
    if (!rows.length)
      return Promise.reject({ status: 404, errorMessage: recordNotFound });
    else return rows[0];
  });
};

// DELETE MODELS
exports.removeComment = (commentID) => {
  const removeCommentQuery = `DELETE FROM comments
  WHERE comment_id = $1
  RETURNING *;`;
  return db.query(removeCommentQuery, [commentID]).then(({ rows }) => {
    if (!rows.length)
      return Promise.reject({ status: 404, errorMessage: recordNotFound });
    else rows[0];
  });
};

// PATCH MODELS
exports.updateComment = (commentID, updateBody) => {
  const { inc_votes } = updateBody;
  if (!Number(inc_votes))
    return Promise.reject({ status: 400, errorMessage: invalidInput });
  const updateCommentQuery = `UPDATE comments
  set votes =  votes + $1
  WHERE comment_id = $2
  RETURNING *;
  `;
  return db
    .query(updateCommentQuery, [inc_votes, commentID])
    .then(({ rows }) => rows[0]);
};
