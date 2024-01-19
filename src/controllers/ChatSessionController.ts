import { Request, Response } from 'express';
import { ChatSessionService } from '../services/ChatSessionService';
import { ChatSessionDTO } from '../dto/ChatSessionDTO';

export class ChatSessionController {
  private chatSessionService: ChatSessionService;

  constructor() {
    this.chatSessionService = new ChatSessionService();
  }

  async getChatSessionById(req: Request, res: Response): Promise<void> {
    const chatSessionId = Number(req.params.id);
    const chatSession = await this.chatSessionService.getChatSessionById(chatSessionId);

    if (chatSession) {
      res.json(chatSession);
    } else {
      res.status(404).json({ error: 'Chat session not found' });
    }
  }

  async createChatSession(req: Request, res: Response): Promise<void> {
    const chatSessionDTO: ChatSessionDTO = req.body;

    try {
      const createdChatSession = await this.chatSessionService.createChatSession(chatSessionDTO);
      res.status(201).json(createdChatSession);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Add other methods like updateChatSession, deleteChatSession, etc.
}