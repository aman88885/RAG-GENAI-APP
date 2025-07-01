const express = require('express');
const multerMiddleware = require('./../../middlewares/multer.middleware');
const { AuthMiddleware } = require('../../middlewares/auth.middleware');
const { IndexNewPDFController } = require('../../controllers/IndexNewPDFController.controller');
const { DeletePDFController } = require('../../controllers/DeletePDFController.controller');
const { DeleteMultiplePDFsController } = require('../../controllers/DeleteMultiplePDFsController.controller');
const { DeleteAllUserPDFsController } = require('../../controllers/DeleteAllUserPDFsController.controller');
const { GetUserPDFsController } = require('../../controllers/GetUserPDFsController.contrller');
const { GetPDFDetailsController } = require('../../controllers/GetPDFDetailsController.controller');
const { UpdatePDFController } = require('../../controllers/UpdatePDFController.controller');
const { SharePDFController } = require('../../controllers/SharePDFController.controller');
const { RemoveSharingController } = require('../../controllers/RemoveSharingController.controller');
const { GetPDFsByStatusController } = require('../../controllers/GetPDFsByStatusController.controller');

const pdfRouter = express.Router();

// =================== UPLOAD ROUTES ===================
// POST /api/v1/pdf/upload - Upload and index new PDF
pdfRouter.post('/upload', AuthMiddleware, multerMiddleware, IndexNewPDFController);

// =================== DELETE ROUTES ===================
// DELETE /api/v1/pdf/:pdfId - Delete single PDF by ID or UUID
pdfRouter.delete('/:pdfId', AuthMiddleware, DeletePDFController);

// DELETE /api/v1/pdf/bulk/delete - Delete multiple PDFs
pdfRouter.delete('/bulk/delete', AuthMiddleware, DeleteMultiplePDFsController);

// DELETE /api/v1/pdf/user/all - Delete all PDFs for authenticated user
pdfRouter.delete('/user/all', AuthMiddleware, DeleteAllUserPDFsController);

pdfRouter.get('/user', AuthMiddleware, GetUserPDFsController);

pdfRouter.get('/details/:uuid', AuthMiddleware, GetPDFDetailsController);

pdfRouter.put('/update/:uuid', AuthMiddleware, UpdatePDFController);

pdfRouter.post('/share/:uuid', AuthMiddleware, SharePDFController);

pdfRouter.post('/remove-sharing/:uuid', AuthMiddleware, RemoveSharingController);

pdfRouter.delete('/delete/:uuid', AuthMiddleware, DeletePDFController);

pdfRouter.get('/status/:status', AuthMiddleware, GetPDFsByStatusController);

module.exports = pdfRouter;