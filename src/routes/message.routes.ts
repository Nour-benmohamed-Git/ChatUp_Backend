import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';

const messageRouter = Router();
const messageController = new MessageController();
messageRouter.get('/messages', messageController.getMessages);
messageRouter.get('/messages/:id', messageController.getMessage);
messageRouter.post('/messages', messageController.createMessage);
messageRouter.put('/messages/:id', messageController.updateMessage);
messageRouter.delete('/messages/:id', messageController.deleteMessage);
export default messageRouter;
