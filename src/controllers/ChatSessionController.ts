import { Request, Response } from 'express';
import { ChatSessionService } from '../services/ChatSessionService';
import { ChatSessionDTO } from '../dto/ChatSessionDTO';

export class ChatSessionController {
  private chatSessionService: ChatSessionService;

  constructor() {
    this.chatSessionService = new ChatSessionService();
  }

  async getChatSessions(req: Request, res: Response): Promise<void> {
    const chatSessions = await this.chatSessionService.getChatSessions();

    res.json(chatSessions);
  }

  async getChatSession(req: Request, res: Response): Promise<void> {
    const chatSessionId = Number(req.params.id);
    const chatSession =
      await this.chatSessionService.getChatSession(chatSessionId);

    if (chatSession) {
      res.json(chatSession);
    } else {
      res.status(404).json({ error: 'Chat session not found' });
    }
  }

  async createChatSession(req: Request, res: Response): Promise<void> {
    const chatSessionDTO: ChatSessionDTO = req.body;

    try {
      const createdChatSession =
        await this.chatSessionService.createChatSession(chatSessionDTO);
      res.status(201).json(createdChatSession);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateChatSession(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const chatSessionDTO: ChatSessionDTO = req.body;

    try {
      const updatedChatSession =
        await this.chatSessionService.updateChatSession(id, chatSessionDTO);

      if (updatedChatSession) {
        res.json(updatedChatSession);
      } else {
        res.status(404).json({ error: 'Chat session not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteChatSession(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);

    try {
      const isDeleted = await this.chatSessionService.deleteChatSession(id);

      if (isDeleted) {
        res.status(200).json({ message: 'Chat session deleted successfully' });
      } else {
        res.status(404).json({ error: 'Chat session not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
