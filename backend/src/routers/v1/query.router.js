const express = require('express');
const { QueryController, GetPDFInfoController } = require('./../../controllers/query.controller');
const { userLoginOrNot } = require('../../middlewares/user.middleware');

const queryRouter = express.Router();

// POST /api/v1/pdf/query/ask/:uuid
queryRouter.post('/ask/:uuid',userLoginOrNot, QueryController);

// Optional: GET PDF info by UUID
// GET /api/v1/pdf/query/info/:uuid
queryRouter.get('/info/:uuid',userLoginOrNot, GetPDFInfoController);

module.exports = queryRouter;