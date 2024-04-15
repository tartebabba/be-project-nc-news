const express = require('express');
const app = express();

const { getTopics } = require('./controllers/topics.controller');
const { sendGeneric404Error } = require('./errors');

app.use(express.json());

app.get('/api/topics', getTopics);

app.all('*', sendGeneric404Error);

module.exports = app;
