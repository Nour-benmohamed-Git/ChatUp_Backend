import { Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { Notification } from '../models/Notification';

export class NotificationDAO {
  private notificationRepository: Repository<Notification>;

  constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
  }

  async getNotifications(): Promise<Notification[]> {
    return this.notificationRepository.find();
  }

  async getNotification(id: number): Promise<Notification | null> {
    return this.notificationRepository.findOne({ where: { id: id } });
  }

  async createNotification(
    notificationData: Partial<Notification>
  ): Promise<Notification> {
    const notification = this.notificationRepository.create(notificationData);
    return this.notificationRepository.save(notification);
  }

  async updateNotification(
    id: number,
    notificationData: Partial<Notification>
  ): Promise<Notification | null> {
    await this.notificationRepository.update({ id }, notificationData);
    return this.getNotification(id);
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await this.notificationRepository.delete({ id });
    return result.affected && result.affected > 0;
  }
}
