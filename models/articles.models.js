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
exports.fetchAllArticles = (limit = 10, page = 1) => {
  const allArticlesQuery = `SELECT a.article_id, a.title, a.topic, a.author, a.body, a.created_at, a.votes, a.article_img_url, COUNT(c.comment_id) as comment_count
  FROM articles AS a
  LEFT JOIN comments AS c ON a.article_id = c.article_id
  GROUP BY a.article_id
  ORDER BY a.created_at desc
  LIMIT $1 OFFSET $2;`;
  return db
    .query(allArticlesQuery, [limit, limit * (page - 1)])
    .then(({ rows, rowCount }) => {
      if (!rows.length)
        return Promise.reject({ status: 404, errorMessage: recordsNotFound });
      else return { articles: rows, total_count: rowCount };
    });
};

exports.fetchArticles = (query) => {
  const validQueries = [
    'author',
    'topic',
    'sort_by',
    'order_by',
    'page',
    'limit',
  ];
  const isValidQuery = Object.keys(query).some((key) =>
    validQueries.includes(key)
  );
  if (!isValidQuery)
    return Promise.reject({ status: 400, errorMessage: invalidInput });
  const {
    topic,
    author,
    sort_by = 'created_at',
    order_by = 'desc',
    limit = 10,
    page = 1,
  } = query;
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
    filteredArticlesQuery += ` ORDER BY a.${sort_by} ${order_by}`;
  }
  filteredArticlesQuery += ` LIMIT ${limit} OFFSET ${limit * (page - 1)};`;
  return db
    .query(filteredArticlesQuery, queryVals)
    .then(({ rows, rowCount }) => {
      if (!rows.length)
        return Promise.reject({ status: 404, errorMessage: recordsNotFound });
      else return { articles: rows, total_count: rowCount };
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

exports.fetchArticleComments = (articleID, { page = 1, limit = 5 }) => {
  const commentsOfArticleQuery = `SELECT comment_id, votes, created_at, author, body, article_id FROM comments
  WHERE article_id = $1
  ORDER BY created_at desc
  LIMIT $2 OFFSET $3;`;
  return db
    .query(commentsOfArticleQuery, [articleID, limit, limit * (page - 1)])
    .then(({ rows, rowCount }) => {
      return { comments: rows, total_count: rowCount };
    });
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

// POST MODELS
exports.insertArticle = ({
  author,
  title,
  body,
  topic,
  article_img_url = '',
}) => {
  const insertArticleQuery = `INSERT INTO articles
    (author, title, body, topic, article_img_url, votes)
  VALUES
    ($1, $2, $3, $4, $5, $6)
  RETURNING *;`;

  return db
    .query(insertArticleQuery, [author, title, body, topic, article_img_url, 0])
    .then(({ rows }) => rows[0].article_id)
    .then((articleID) => {
      const articleByIdQuery = `SELECT a.article_id, a.title, a.topic, a.author, a.body, a.created_at, a.votes, a.article_img_url, COUNT(c.comment_id) AS comment_count 
  FROM articles AS a
  LEFT JOIN comments AS c ON a.article_id = c.article_id
  WHERE a.article_id = $1
  GROUP BY a.article_id;`;
      return db
        .query(articleByIdQuery, [articleID])
        .then(({ rows }) => rows[0]);
    });
};

