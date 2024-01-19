import { Request, Response } from 'express';
import { MessageDTO } from '../dto/MessageDTO';
import { MessageService } from '../services/MessageService';

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  async getMessages(_req: Request, res: Response): Promise<void> {
    try {
      const messages = await this.messageService.getMessages();
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMessage(req: Request, res: Response): Promise<void> {
    const messageId = Number(req.params.id);
    const message = await this.messageService.getMessage(messageId);

    if (message) {
      res.json(message);
    } else {
      res.status(404).json({ error: 'Message not found' });
    }
  }

  async createMessage(req: Request, res: Response): Promise<void> {
    const messageDTO: MessageDTO = req.body;

    try {
      const createdMessage =
        await this.messageService.createMessage(messageDTO);
      res.status(201).json(createdMessage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateMessage(req: Request, res: Response): Promise<void> {
    const messageId = Number(req.params.id);
    const messageDTO: MessageDTO = req.body;

    try {
      const updatedMessage = await this.messageService.updateMessage(
        messageId,
        messageDTO
      );
      if (updatedMessage) {
        res.json(updatedMessage);
      } else {
        res.status(404).json({ error: 'Message not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    const messageId = Number(req.params.id);

    try {
      const deletedMessage = await this.messageService.deleteMessage(messageId);
      if (deletedMessage) {
        res.json(deletedMessage);
      } else {
        res.status(404).json({ error: 'Message not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
