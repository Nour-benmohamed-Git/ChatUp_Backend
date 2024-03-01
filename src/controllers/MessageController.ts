import { Request, Response } from 'express';
import { MessageDTO } from '../dto/MessageDTO';
import { MessageService } from '../services/MessageService';

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  getMessages = async (_req: Request, res: Response): Promise<void> => {
    try {
      const messages = await this.messageService.getMessages();
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getMessage = async (req: Request, res: Response): Promise<void> => {
    const messageId = Number.parseInt(req.params.id, 10);
    const message = await this.messageService.getMessage(messageId);

    if (message) {
      res.json(message);
    } else {
      res.status(404).json({ error: 'Message not found' });
    }
  };

  getMessagesByChatSessionId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    const chatSessionId = Number.parseInt(req.params.id, 10);
    try {
      const messages = await this.messageService.getMessagesByChatSessionId(
        chatSessionId,
        token
      );
      if (messages.length === 0) {
        res.json({ data: [] });
      } else {
        res.json({ data: messages });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createMessage = async (req: Request, res: Response): Promise<void> => {
    const messageDTO: MessageDTO = req.body;

    try {
      const createdMessage =
        await this.messageService.createMessage(messageDTO);
      res.status(201).json({ data: createdMessage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateMessage = async (req: Request, res: Response): Promise<void> => {
    const messageId = Number.parseInt(req.params.id, 10);
    const messageDTO: MessageDTO = req.body;

    try {
      const updatedMessage = await this.messageService.updateMessage(
        messageId,
        messageDTO
      );
      if (updatedMessage) {
        res.json({ data: updatedMessage });
      } else {
        res.status(404).json({ error: 'Message not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  deleteMessage = async (req: Request, res: Response): Promise<void> => {
    const messageId = Number.parseInt(req.params.id, 10);
    try {
      const deletedMessage = await this.messageService.deleteMessage(messageId);
      if (deletedMessage) {
        res.json({ data: deletedMessage });
      } else {
        res.status(404).json({ error: 'Message not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  softDeleteMessage = async (req: Request, res: Response): Promise<void> => {
    const messageId = Number.parseInt(req.params.id, 10);
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const deletedMessage = await this.messageService.softDeleteMessage(
        messageId,
        token
      );
      if (deletedMessage) {
        res.json({ data: deletedMessage });
      } else {
        res.status(404).json({ error: 'Message not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
