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
const { getPDFDownloadController} = require('../../controllers/GetPDFDownloadController.controller');

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

// GET /api/v1/pdf/user - Get all PDFs for authenticated user
pdfRouter.get('/user', AuthMiddleware, GetUserPDFsController);

// GET /api/v1/pdf/details/:uuid - Get details of a single PDF by UUID
pdfRouter.get('/details/:uuid', AuthMiddleware, GetPDFDetailsController);

// PUT /api/v1/pdf/update/:uuid - Update PDF metadata by UUID
pdfRouter.put('/update/:uuid', AuthMiddleware, UpdatePDFController);

// POST /api/v1/pdf/share/:uuid - Share PDF with another user
pdfRouter.post('/share/:uuid', AuthMiddleware, SharePDFController);

// POST /api/v1/pdf/remove-sharing/:uuid - Remove sharing of PDF with another user
pdfRouter.post('/remove-sharing/:uuid', AuthMiddleware, RemoveSharingController);

// GET /api/v1/pdf/status/:status - Get PDFs by status (e.g., "processing", "completed")
pdfRouter.get('/status/:status', AuthMiddleware, GetPDFsByStatusController);

// GET /api/v1/pdf/download/:uuid - Download PDF by UUID
pdfRouter.get('/download/:uuid', AuthMiddleware, getPDFDownloadController);


module.exports = pdfRouter;