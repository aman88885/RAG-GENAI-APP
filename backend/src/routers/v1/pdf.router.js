const express = require('express');
const { IndexNewPDFController,
    GetUserPDFsController,
    GetPDFDetailsController,
    UpdatePDFController,
    SharePDFController,
    RemoveSharingController,
    DeletePDFController,
    GetPDFsByStatusController } = require('./../../controllers/pdf.controller');
const multerMiddleware = require('./../../middlewares/multer.middleware');
const { AuthMiddleware } = require('../../middlewares/auth.middleware')

const pdfRouter = express.Router();

// POST /api/v1/pdf/indexing/new
pdfRouter.post('/new',AuthMiddleware, multerMiddleware, IndexNewPDFController);

pdfRouter.get('/user', AuthMiddleware, GetUserPDFsController);

pdfRouter.get('/details/:uuid', AuthMiddleware, GetPDFDetailsController);

pdfRouter.put('/update/:uuid', AuthMiddleware, UpdatePDFController);

pdfRouter.post('/share/:uuid', AuthMiddleware, SharePDFController);

pdfRouter.post('/remove-sharing/:uuid', AuthMiddleware, RemoveSharingController);

pdfRouter.delete('/delete/:uuid', AuthMiddleware, DeletePDFController);

pdfRouter.get('/status/:status', AuthMiddleware, GetPDFsByStatusController);

module.exports = pdfRouter;