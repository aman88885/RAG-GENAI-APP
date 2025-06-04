const express = require('express');
const { IndexNewPDFController } = require('./../../controllers/pdf.controller');
const multerMiddleware = require('./../../middlewares/multer.middleware');
const { AuthMiddleware } = require('../../middlewares/auth.middleware')

const pdfRouter = express.Router();

// POST /api/v1/pdf/indexing/new
pdfRouter.post('/new',AuthMiddleware, multerMiddleware, IndexNewPDFController);

module.exports = pdfRouter;