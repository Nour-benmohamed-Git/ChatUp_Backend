import { Router } from "express";
import { ChatSessionController } from '../controllers/ChatSessionController';

const chatSessionRouter = Router();
const chatSessionController = new ChatSessionController();

chatSessionRouter.post('/chat-sessions', chatSessionController.createChatSession);
chatSessionRouter.get('/chat-sessions/:id', chatSessionController.getChatSessionById);

export default chatSessionRouter;