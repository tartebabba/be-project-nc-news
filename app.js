const express = require('express');
const app = express();

const {
  getTopics,
  getEndpointsDescription,
} = require('./controllers/topics.controller');
const {
  getArticleByID,
  getArticles,
} = require('./controllers/articles.controller');

const { sendGeneric404Error, sendErrorHandled } = require('./errors');

app.use(express.json());

app.get('/api', getEndpointsDescription);

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticleByID);

app.use(sendErrorHandled);

app.all('*', sendGeneric404Error);

module.exports = app;
