const express = require('express');
const pdfRouter = require('./pdf.router');
const queryRouter = require('./query.router');
const authRouter =require('./auth.router');

const v1Router = express.Router();

v1Router.use('/pdf/indexing', pdfRouter);
v1Router.use('/pdf/query', queryRouter)
v1Router.use('/auth', authRouter);

module.exports = v1Router;