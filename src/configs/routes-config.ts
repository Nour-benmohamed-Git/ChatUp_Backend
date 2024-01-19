import {Router} from 'express';
import userRouter from '../routes/user.routes';
import groupRouter from '../routes/group.routes';
import messageRouter from '../routes/message.routes';
import chatSessionRouter from '../routes/chatSession.routes';
import notificationRouter from '../routes/notification.routes';

const routes = Router();

routes.use(userRouter);
routes.use(groupRouter);
routes.use(messageRouter);
routes.use(chatSessionRouter);
routes.use(notificationRouter);

export default routes;