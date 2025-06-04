const express = require('express');
const { QueryController, GetPDFInfoController, ListPDFsController } = require('./../../controllers/query.controller');
const { AuthMiddleware } = require('../../middlewares/auth.middleware');

const queryRouter = express.Router();

// POST /api/v1/pdf/query/ask/:uuid
queryRouter.post('/ask/:uuid',AuthMiddleware, QueryController);

// Optional: GET PDF info by UUID
// GET /api/v1/pdf/query/info/:uuid
queryRouter.get('/info/:uuid',AuthMiddleware, GetPDFInfoController);

queryRouter.get('/list', AuthMiddleware, ListPDFsController);

module.exports = queryRouter;