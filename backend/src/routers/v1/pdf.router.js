const express = require('express');
const { IndexNewPDFController } = require('./../../controllers/pdf.controller');
const multerMiddleware = require('./../../middlewares/multer.middleware');

const pdfRouter = express.Router();

// POST /api/v1/pdf/indexing/new
pdfRouter.post('/new', multerMiddleware, IndexNewPDFController);

module.exports = pdfRouter;