import { Router } from "express";
import { MessageController } from '../controllers/MessageController';

const messageRouter = Router();
const messageController = new MessageController();

messageRouter.post('/messages', messageController.createMessage);
messageRouter.get('/messages/:id', messageController.getMessageById);

export default messageRouter;