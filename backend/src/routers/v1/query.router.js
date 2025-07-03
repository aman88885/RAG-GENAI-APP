const express = require('express');
const { QueryController } = require('./../../controllers/QueryController.controller');
const { GetPDFInfoController } = require('./../../controllers/GetPDFInfoController.controller');
// ListPDFsController
const { AuthMiddleware } = require('../../middlewares/auth.middleware');

const queryRouter = express.Router();

// POST /api/v1/pdf/query/ask/:uuid
queryRouter.post('/ask/:uuid',AuthMiddleware, QueryController);

// Optional: GET PDF info by UUID
// GET /api/v1/pdf/query/info/:uuid
queryRouter.get('/info/:uuid',AuthMiddleware, GetPDFInfoController);

// queryRouter.get('/list', AuthMiddleware, ListPDFsController);

module.exports = queryRouter;