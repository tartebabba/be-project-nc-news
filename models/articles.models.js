const db = require('../db/connection');

// ERROR MESSAGES
const recordNotFound = "Sorry! That particular record was not found"
const recordsNotFound = 'Sorry! No records were found.';

exports.fetchAllArticles = () => {
  const allArticlesByQuery = `SELECT a.article_id, a.title, a.topic, a.author, a.body, a.created_at, a.votes, a.article_img_url, COUNT(c.comment_id) as comment_count
  FROM articles AS a
  LEFT JOIN comments AS c ON a.article_id = c.article_id
  GROUP BY a.article_id;`;
  return db.query(allArticlesByQuery).then(({ rows }) => {
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
