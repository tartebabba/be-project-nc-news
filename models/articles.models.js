const db = require('../db/connection');

exports.fetchArticleByID = (articleID) => {
  const articleByIdQuery = `SELECT article_id, title, topic, author, body, created_at, votes, article_img_url FROM articles
  WHERE article_id = $1;`;
  return db.query(articleByIdQuery, [articleID]).then(({ rows }) => {
    return rows[0];
  });
};
