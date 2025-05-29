const express = require('express');
const { IndexNewPDFController } = require('./../../controllers/pdf.controller');
const multerMiddleware = require('./../../middlewares/multer.middleware');

const pdfRouter = express.Router();

pdfRouter.post('/new',multerMiddleware,IndexNewPDFController);

module.exports = pdfRouter;
