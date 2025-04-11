const express =  require('express');
const pdfRouter = require('./pdf.router');
// const authRouter =require('./auth.router');

const v1Router = express.Router();

v1Router.use('/pdf/indexing', pdfRouter);

module.exports = v1Router;