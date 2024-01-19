import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { NotificationDTO } from '../dto/NotificationDTO';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async createNotification(req: Request, res: Response): Promise<void> {
    const dto = req.body as NotificationDTO;

    try {
      const createdNotification = await this.notificationService.createNotification(dto);
      res.status(201).json(createdNotification);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getNotificationById(req: Request, res: Response): Promise<void> {
    const notificationId = Number(req.params.id);
    const notification = await this.notificationService.getNotificationById(notificationId);

    if (notification) {
      res.json(notification);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  }

  // Add other methods like updateNotification, deleteNotification, etc.
}