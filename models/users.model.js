const db = require('../db/connection');
const { recordNotFound, recordsNotFound, invalidInput } = require('../errors');

exports.fetchAllUsers = () => {
  const allUsers = `SELECT * FROM users;`;
  return db.query(allUsers).then(({ rows }) => rows);
};

exports.fetchUserDetails = (username) => {
  const userByID = `SELECT * FROM users
  WHERE username = $1`;
  return db.query(userByID, [username]).then(({ rows }) => {
    if (!rows.length)
      return Promise.reject({ status: 404, errorMessage: recordNotFound });
    else return rows[0];
  });
};