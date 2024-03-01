import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const userRouter = Router();
const userController = new UserController();
userRouter.get('/users', userController.getUsers);
userRouter.get('/users/:id', userController.getUser);
userRouter.post('/users', userController.createUser);
userRouter.put(
  '/users/:id',
  userController.updateUser
);
userRouter.delete('/users/:id', userController.deleteUser);

export default userRouter;
