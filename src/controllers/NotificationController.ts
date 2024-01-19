import { Request, Response } from 'express';
import { NotificationDTO } from '../dto/NotificationDTO';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async getNotifications(_req: Request, res: Response): Promise<void> {
    try {
      const notifications = await this.notificationService.getNotifications();
      res.json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getNotification(req: Request, res: Response): Promise<void> {
    const notificationId = Number(req.params.id);
    const notification = await this.notificationService.getNotification(notificationId);

    if (notification) {
      res.json(notification);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
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

  async updateNotification(req: Request, res: Response): Promise<void> {
    const notificationId = Number(req.params.id);
    const dto = req.body as NotificationDTO;

    try {
      const updatedNotification = await this.notificationService.updateNotification(notificationId, dto);
      if (updatedNotification) {
        res.status(200).json(updatedNotification);
      } else {
        res.status(404).json({ error: 'Notification not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteNotification(req: Request, res: Response): Promise<void> {
    const notificationId = Number(req.params.id);

    try {
      const isDeleted = await this.notificationService.deleteNotification(notificationId);
      if (isDeleted) {
        res.status(200).json({ message: 'Notification deleted successfully' });
      } else {
        res.status(404).json({ error: 'Notification not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}