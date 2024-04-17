const db = require('../db/connection');

exports.fetchAllUsers = () => {
  const allUsers = `SELECT * FROM users;`;
  return db.query(allUsers).then(({ rows }) => rows);
};
