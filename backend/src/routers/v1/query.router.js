const express = require('express');
const { QueryController } = require('./../../controllers/query.controller');


const queryRouter = express.Router();

queryRouter.get('/ask',QueryController);

module.exports = queryRouter;