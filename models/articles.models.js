const db = require('../db/connection');

// ERROR MESSAGES
const recordNotFound =
  "Sorry! We weren't able to find what you were looking for.";
const recordsNotFound = "Uh oh! Looks like there's nothing to see here..";

exports.checkArticleExists = (article_id) => {
  const checkArticleExistsQuery = `SELECT article_id FROM articles WHERE article_id = $1;`;
  return db.query(checkArticleExistsQuery, [article_id]).then(({ rows }) => {
    if (!rows.length)
      return Promise.reject({ status: 404, errorMessage: recordNotFound });
    else return rows[0];
  });
};

exports.fetchAllArticles = () => {
  const allArticlesQuery = `SELECT a.article_id, a.title, a.topic, a.author, a.body, a.created_at, a.votes, a.article_img_url, COUNT(c.comment_id) as comment_count
  FROM articles AS a
  LEFT JOIN comments AS c ON a.article_id = c.article_id
  GROUP BY a.article_id
  ORDER BY a.created_at desc;`;
  return db.query(allArticlesQuery).then(({ rows }) => {
    if (!rows.length)
      return Promise.reject({ status: 404, errorMessage: recordsNotFound });
    else return rows;
  });
};

exports.fetchArticleByID = (articleID) => {
  const articleByIdQuery = `SELECT article_id, title, topic, author, body, created_at, votes, article_img_url FROM articles
  WHERE article_id = $1;`;
  return db.query(articleByIdQuery, [articleID]).then(({ rows }) => {
    if (!rows.length)
      return Promise.reject({ status: 404, errorMessage: recordNotFound });
    else return rows[0];
  });
};

exports.fetchArticleComments = (articleID) => {
  const commentsOfArticleQuery = `SELECT comment_id, votes, created_at, author, body, article_id FROM comments
  WHERE article_id = $1
  ORDER BY created_at desc`;
  return db.query(commentsOfArticleQuery, [articleID]).then(({ rows }) => rows);
};

exports.addNewComment = (articleID, { username, body }) => {
  const insertCommentQuery = `INSERT INTO comments
  (author, body, article_id)
  VALUES
    ($1, $2, $3)
  RETURNING *;`;
  return db
    .query(insertCommentQuery, [username, body, articleID])
    .then(({ rows }) => rows[0]);
};

