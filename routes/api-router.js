const fs = require('fs').promises;
const apiRouter = require('express').Router();
const topicRouter = require('./topics');
const usersRouter = require('./users');
const articlesRouter = require('./articles');
const commentsRouter = require('./comments');

apiRouter.get('/', (req, res, next) => {
  return fs
    .readFile(`${__dirname}/../endpoints.json`, 'utf-8')
    .then((endpoints) => {
      res.status(200).send(JSON.parse(endpoints));
    })
    .catch((err) => next(err));
});

apiRouter.use('/topics', topicRouter);

apiRouter.use('/articles', articlesRouter);

apiRouter.use('/comments', commentsRouter);

apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
