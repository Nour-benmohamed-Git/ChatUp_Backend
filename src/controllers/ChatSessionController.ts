import { Request, Response } from 'express';
import { ChatSessionService } from '../services/ChatSessionService';

export class ChatSessionController {
  private chatSessionService: ChatSessionService;
  constructor() {
    this.chatSessionService = new ChatSessionService();
  }

  getCurrentUserChatSessions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    try {
      const { chatSessions, total } =
        await this.chatSessionService.getCurrentUserChatSessions(
          token,
          offset,
          Number(limit),
          String(search)
        );
      if (chatSessions.length === 0) {
        res.json({ data: [] });
      } else {
        res.json({ data: chatSessions, total: total });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getChatSessionByParticipants = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    const secondMemberId: number = req.body.secondMemberId;
    try {
      const chatSession =
        await this.chatSessionService.getChatSessionByParticipants(
          secondMemberId,
          token
        );
      if (chatSession) {
        res.json({ data: chatSession });
      } else {
        res.json({ data: null });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createChatSession = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    const secondMemberId: number = req.body.secondMemberId;
    try {
      const existingChatSession =
        await this.chatSessionService.getChatSessionByParticipants(
          secondMemberId,
          token
        );

      if (existingChatSession) {
        res.status(400).json({
          error: 'Chat session already exists between the participants',
        });
        return;
      }
      const createdChatSession =
        await this.chatSessionService.createChatSession(secondMemberId, token);
      res.status(201).json({ data: createdChatSession });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  restoreChatSession = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    const id = Number.parseInt(req.params.id, 10);

    try {
      const updatedChatSession =
        await this.chatSessionService.restoreChatSession(id, token);

      if (updatedChatSession) {
        res.json({ data: updatedChatSession });
      } else {
        res.status(404).json({ error: 'Chat session not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  deleteChatSession = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    const id = Number.parseInt(req.params.id, 10);
    try {
      const deletedChatSession =
        await this.chatSessionService.deleteChatSession(id, token);
      if (deletedChatSession) {
        res.status(200).json({ data: deletedChatSession });
      } else {
        res.status(404).json({ error: 'Chat session not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getUnseenChatSessionCount = async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const count = await this.chatSessionService.getUnseenChatSessionCount();
      res.json({ data: count });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
