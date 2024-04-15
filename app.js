const express = require('express');
const app = express();

const {
  getTopics,
  getEndpointsDescription,
} = require('./controllers/topics.controller');
const { getArticleByID } = require('./controllers/articles.controller');

const { sendGeneric404Error } = require('./errors');

app.use(express.json());

app.get('/api', getEndpointsDescription);

app.get('/api/topics', getTopics);

app.get('/api/articles/:article_id', getArticleByID);

app.all('*', sendGeneric404Error);

module.exports = app;