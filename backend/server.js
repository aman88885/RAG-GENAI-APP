// ============ Imports ============
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const v1Router = require('./src/routers/v1/v1.router');
const { RequestLoggerMiddleware } = require('./src/middlewares/requestlogger.middleware.js');
const { connectToDB } = require('./src/database/db.connect.js')
// =================================


// ========== ENVIRONMENT VARIABLES ==========
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
// =========================================


// ============ Server ============
const server = express(); // instance of express
server.use(express.json()); // parse the request body
server.use(RequestLoggerMiddleware); // request logger middleware
server.use(cors()); // cors will allow cross origin requests

// ============ Routes ============
server.use('/api/v1', v1Router);
// ================================



// ============ Start Server ============
async function startServer() {
    try {
        await connectToDB(); // connect to db
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} & enviroment is ${NODE_ENV}`);
        })
    } catch (error) {
        console.error(`Error while starting the server ${error}`);
    }
}

startServer(); // start the server
// ================================