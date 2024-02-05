import { NotificationDAO } from '../dao/NotificationDAO';
import { NotificationDTO } from '../dto/NotificationDTO';
import { Notification } from '../models/Notification';

export class NotificationService {
  private notificationDAO: NotificationDAO;

  constructor() {
    this.notificationDAO = new NotificationDAO();
  }

  async getNotifications(): Promise<NotificationDTO[]> {
    const notifications = await this.notificationDAO.getNotifications();
    return notifications.map(this.mapNotificationToDTO);
  }

  async getNotification(id: number): Promise<NotificationDTO | null> {
    const notification = await this.notificationDAO.getNotification(id);
    if (notification) {
      return this.mapNotificationToDTO(notification);
    }
    return null;
  }

  async createNotification(dto: NotificationDTO): Promise<Notification> {
    const notificationData = this.mapDTOToNotification(dto);
    return this.notificationDAO.createNotification(notificationData);
  }

  async updateNotification(id: number, dto: NotificationDTO): Promise<NotificationDTO | null> {
    const notificationData = this.mapDTOToNotification(dto);
    const updatedNotification = await this.notificationDAO.updateNotification(id, notificationData);
    if (updatedNotification) {
      return this.mapNotificationToDTO(updatedNotification);
    }
    return null;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notificationDAO.deleteNotification(id);
  }

  private mapDTOToNotification(dto: NotificationDTO): Partial<Notification> {
    return {
     
      message: dto.message,
      timestamp: dto.timestamp,
      readStatus: dto.readStatus,
    };
  }

  private mapNotificationToDTO(notification: Notification): NotificationDTO {
    return {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      timestamp: notification.timestamp,
      receiverId: notification.receiver.id,
      readStatus: notification.readStatus,
    };
  }
}