import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';

const messageRouter = Router();
const messageController = new MessageController();
messageRouter.get('/messages', messageController.getMessages);
messageRouter.get('/messages/:id', messageController.getMessage);
messageRouter.get(
  '/messages/:id/chat-sessions',
  messageController.getMessagesByChatSessionId
);
messageRouter.post('/messages', messageController.createMessage);
messageRouter.put('/messages/:id', messageController.updateMessage);
messageRouter.delete('/messages/:id', messageController.deleteMessage);
messageRouter.patch('/messages/:id', messageController.softDeleteMessage);
export default messageRouter;
