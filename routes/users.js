const {
  getAllUsers,
  getUserDetails,
} = require('../controllers/users.controller');

const usersRouter = require('express').Router();

usersRouter.route('/').get(getAllUsers);

usersRouter.route('/:username').get(getUserDetails);

module.exports = usersRouter;
