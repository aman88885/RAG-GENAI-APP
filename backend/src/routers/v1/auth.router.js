const express =  require('express');
const { SignupController, SigninController, LogoutController, GetProfileController } = require('../../controllers/auth.controller');
const { AuthMiddleware } = require('../../middlewares/auth.middleware');

const authRouter = express.Router();

authRouter.post('/signup', SignupController);
authRouter.post('/signin', SigninController);

authRouter.use(AuthMiddleware); 

authRouter.post('/logout', LogoutController);
authRouter.get('/profile', GetProfileController);

module.exports = authRouter;