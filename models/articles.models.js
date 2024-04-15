const db = require('../db/connection');

// ERROR MESSAGES
const recordNotFound = "Sorry! That particular record was not found"

exports.fetchArticleByID = (articleID) => {
  const articleByIdQuery = `SELECT article_id, title, topic, author, body, created_at, votes, article_img_url FROM articles
  WHERE article_id = $1;`;
  // console.log(articleID);
  return db.query(articleByIdQuery, [articleID]).then(({ rows }) => {
    if (!rows.length)
      return Promise.reject({ status: 404, errorMessage: recordNotFound });
    else return rows[0];
  });
};
