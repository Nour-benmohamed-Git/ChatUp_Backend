import { Router } from "express";
import { UserController } from '../controllers/UserController';

const userRouter = Router();
const userController = new UserController();

userRouter.post('/users', userController.createUser);
userRouter.get('/users/:id', userController.getUser);


export default userRouter;