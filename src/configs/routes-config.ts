import { Router } from 'express';
import authenticationRouter from '../routes/authentication.routes';
import chatSessionRouter from '../routes/chatSession.routes';
import friendRequestRouter from '../routes/friendRequest.routes';
import messageRouter from '../routes/message.routes';
import userRouter from '../routes/user.routes';

const publicRoutes = Router();

publicRoutes.use(authenticationRouter);

const privateRoutes = Router();

privateRoutes.use(userRouter);
privateRoutes.use(messageRouter);
privateRoutes.use(chatSessionRouter);
privateRoutes.use(friendRequestRouter);

const routes = { privateRoutes: privateRoutes, publicRoutes: publicRoutes };
export default routes;
