import { Router } from 'express';
import authenticationRouter from '../routes/authentication.routes';
import chatSessionRouter from '../routes/chatSession.routes';
import groupRouter from '../routes/group.routes';
import messageRouter from '../routes/message.routes';
import notificationRouter from '../routes/notification.routes';
import userRouter from '../routes/user.routes';

const publicRoutes = Router();

publicRoutes.use(authenticationRouter);

const privateRoutes = Router();

privateRoutes.use(userRouter);
privateRoutes.use(groupRouter);
privateRoutes.use(messageRouter);
privateRoutes.use(chatSessionRouter);
privateRoutes.use(notificationRouter);

const routes = { privateRoutes: privateRoutes, publicRoutes: publicRoutes };
export default routes;
