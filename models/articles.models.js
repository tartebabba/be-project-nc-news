const db = require('../db/connection');

// ERROR MESSAGES
const recordNotFound =
  "Sorry! We weren't able to find what you were looking for.";
const recordsNotFound = "Uh oh! Looks like there's nothing to see here..";
const invalidInput = 'Invalid input: incorrect data format.';

// UTILS
exports.checkArticleExists = (article_id) => {
  const checkArticleExistsQuery = `SELECT article_id FROM articles WHERE article_id = $1;`;
  return db.query(checkArticleExistsQuery, [article_id]).then(({ rows }) => {
    if (!rows.length)
      return Promise.reject({ status: 404, errorMessage: recordNotFound });
    else return rows[0];
  });
};

// FETCH MODELS
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

exports.fetchArticles = (query) => {
  const validQueries = ['author', 'topic', 'sort_by', 'order_by'];
  const isValidQuery = Object.keys(query).some((key) =>
    validQueries.includes(key)
  );
  if (!isValidQuery)
    return Promise.reject({ status: 400, errorMessage: invalidInput });
  const { topic, author, sort_by = 'created_at', order_by = 'desc' } = query;
  const validSortBys = [
    'title',
    'topic',
    'author',
    'body',
    'votes',
    'created_at',
    'comment_count',
  ];
  const validOrderBys = ['asc', 'desc'];
  if (!validSortBys.includes(sort_by))
    return Promise.reject({ status: 400, errorMessage: invalidInput });

  let filteredArticlesQuery = `SELECT a.article_id, a.title, a.topic, a.author, a.body, a.created_at, a.votes, a.article_img_url, COUNT(c.comment_id) as comment_count
  FROM articles AS a
  LEFT JOIN comments AS c ON a.article_id = c.article_id`;

  const conditions = [];
  const queryVals = [];

  if (topic) {
    conditions.push(`a.topic = $${conditions.length + 1}`);
    queryVals.push(topic.toLowerCase());
  }
  if (author) {
    conditions.push(`a.author = $${conditions.length + 1}`);
    queryVals.push(author.toLowerCase());
  }

  if (conditions.length) {
    filteredArticlesQuery += '\n WHERE ' + conditions.join(' AND ');
  }

  filteredArticlesQuery += ` GROUP BY a.article_id `;

  if (validSortBys.includes(sort_by) && validOrderBys.includes(order_by)) {
    filteredArticlesQuery += ` ORDER BY a.${sort_by} ${order_by};`;
  }
  return db.query(filteredArticlesQuery, queryVals).then(({ rows }) => {
    if (!rows.length)
      return Promise.reject({ status: 404, errorMessage: recordsNotFound });
    else return rows;
  });
};

exports.fetchArticleByID = (articleID) => {
  const articleByIdQuery = `SELECT a.article_id, a.title, a.topic, a.author, a.body, a.created_at, a.votes, a.article_img_url, COUNT(c.comment_id) AS comment_count 
  FROM articles AS a
  LEFT JOIN comments AS c ON a.article_id = c.article_id
  WHERE a.article_id = $1
  GROUP BY a.article_id;`;
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

// ADD MODELS
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

// UPDATE MODELS
exports.updateArticle = (articleID, { inc_votes: votes }) => {
  const keyToUpdate = 'votes';
  const newValue = votes;

  const updateArticleQuery = `UPDATE articles
  set ${keyToUpdate} = ${keyToUpdate} + $1
  WHERE article_id = $2
  RETURNING *;`;
  return db
    .query(updateArticleQuery, [newValue, articleID])
    .then(({ rows }) => rows[0]);
};

// DELETE MODELS
exports.removeComment = (commentID) => {
  commentID;
  const removeCommentQuery = `DELETE FROM comments
  WHERE comment_id = $1
  RETURNING *;`;
  return db.query(removeCommentQuery, [commentID]).then(({ rows }) => {
    if (!rows.length)
      return Promise.reject({ status: 404, errorMessage: recordNotFound });
    else rows[0];
  });
};
