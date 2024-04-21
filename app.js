const express = require('express');
const app = express();

const { sendGeneric404Error, sendErrorHandled } = require('./errors');

const apiRouter = require('./routes/api-router');

app.use(express.json());

app.use('/api', apiRouter);

app.use(sendErrorHandled);

app.all('*', sendGeneric404Error);

module.exports = app;
