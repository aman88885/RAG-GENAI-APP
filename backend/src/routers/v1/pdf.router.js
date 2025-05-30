const express = require('express');
const { IndexNewPDFController } = require('./../../controllers/pdf.controller');
const multerMiddleware = require('./../../middlewares/multer.middleware');
const { userLoginOrNot } = require('../../middlewares/user.middleware')

const pdfRouter = express.Router();

// POST /api/v1/pdf/indexing/new
pdfRouter.post('/new',userLoginOrNot, multerMiddleware, IndexNewPDFController);

module.exports = pdfRouter;