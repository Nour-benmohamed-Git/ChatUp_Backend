import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const authenticationRouter = Router();
const authController = new AuthController();
authenticationRouter.post('/sign-up', authController.register);
authenticationRouter.post('/sign-in', authController.login);
authenticationRouter.get('/current-user', authController.getCurrentUser);

export default authenticationRouter;
