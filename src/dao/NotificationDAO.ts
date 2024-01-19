import { Repository } from 'typeorm';
import { Notification } from '../models/Notification';
import { AppDataSource } from '../configs/typeorm.config';

export class NotificationDAO {
  private notificationRepository: Repository<Notification>;

  constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
  }

  async getNotificationById(id: number): Promise<Notification | undefined> {
    return this.notificationRepository.findOne({ where: { id: id } });
  }

  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(notificationData);
    return this.notificationRepository.save(notification);
  }

  // Add other methods like updateNotification, deleteNotification, etc.
}