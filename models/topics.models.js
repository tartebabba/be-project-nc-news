const db = require('../db/connection');
const fs = require('fs').promises;

exports.fetchEndpointsDescription = () => {
  return fs
    .readFile(`${__dirname}/../endpoints.json`, 'utf-8')
    .then((data) => JSON.parse(data));
};

exports.fetchAllTopics = (id) => {
  return db
    .query(`SELECT slug, description FROM topics;`)
    .then(({ rows }) => rows);
};
