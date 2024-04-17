const express = require('express');
const app = express();

const {
  getTopics,
  getEndpointsDescription,
} = require('./controllers/topics.controller');
const {
  getArticleByID,
  getArticles,
  getArticleComments,
  postArticleComment,
  patchArticleByID,
  deleteCommentByID,
} = require('./controllers/articles.controller');

const { sendGeneric404Error, sendErrorHandled } = require('./errors');

app.use(express.json());

app.get('/api', getEndpointsDescription);

// TOPIC HANDLING
app.get('/api/topics', getTopics);

// ARTICLE HANDLING
app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticleByID);

app.get('/api/articles/:article_id/comments', getArticleComments);

app.post('/api/articles/:article_id/comments', postArticleComment);

app.patch('/api/articles/:article_id', patchArticleByID);

app.delete('/api/comments/:comment_id', deleteCommentByID);

// ERROR HANDLING
app.use(sendErrorHandled);


app.all('*', sendGeneric404Error);

module.exports = app;
