const db = require('../db/connection');

exports.fetchAllTopics = (id) => {
  return db
    .query(`SELECT slug, description FROM topics;`)
    .then(({ rows }) => rows);
};
