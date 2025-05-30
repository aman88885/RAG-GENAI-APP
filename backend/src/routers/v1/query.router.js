const express = require('express');
const { QueryController, GetPDFInfoController } = require('./../../controllers/query.controller');

const queryRouter = express.Router();

// POST /api/v1/pdf/query/ask/:uuid
queryRouter.post('/ask/:uuid', QueryController);

// Optional: GET PDF info by UUID
// GET /api/v1/pdf/query/info/:uuid
queryRouter.get('/info/:uuid', GetPDFInfoController);

module.exports = queryRouter;