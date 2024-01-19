import { Request, Response } from 'express';
import { MessageService } from '../services/MessageService';
import { MessageDTO } from '../dto/MessageDTO';

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  async getMessageById(req: Request, res: Response): Promise<void> {
    const messageId = Number(req.params.id);
    const message = await this.messageService.getMessageById(messageId);

    if (message) {
      res.json(message);
    } else {
      res.status(404).json({ error: 'Message not found' });
    }
  }

  async createMessage(req: Request, res: Response): Promise<void> {
    const messageDTO: MessageDTO = req.body;

    try {
      const createdMessage = await this.messageService.createMessage(messageDTO);
      res.status(201).json(createdMessage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Add other methods like updateMessage, deleteMessage, etc.
}