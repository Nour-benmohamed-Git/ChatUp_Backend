import { Router } from 'express';
import { ChatSessionController } from '../controllers/ChatSessionController';

const chatSessionRouter = Router();
const chatSessionController = new ChatSessionController();
chatSessionRouter.post(
  '/chat-sessions/by-participants',
  chatSessionController.getChatSessionByParticipants
);
chatSessionRouter.get(
  '/current-user-chat-sessions',
  chatSessionController.getCurrentUserChatSessions
);
chatSessionRouter.post(
  '/chat-sessions',
  chatSessionController.createChatSession
);
chatSessionRouter.put(
  '/chat-sessions/:id',
  chatSessionController.restoreChatSession
);
chatSessionRouter.post(
  '/chat-sessions/:id',
  chatSessionController.deleteChatSession
);

export default chatSessionRouter;
