import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { upload } from '../utils/middleware/uploadFileMiddleware';

const authenticationRouter = Router();
const authController = new AuthController();
authenticationRouter.post('/sign-up', authController.register);
authenticationRouter.post('/sign-in', authController.login);
authenticationRouter.get('/current-user', authController.getCurrentUser);
authenticationRouter.patch(
  '/current-user',
  upload.single('profilePicture'),
  authController.updateCurrentUser
);

export default authenticationRouter;
