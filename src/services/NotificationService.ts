import { Notification } from '../models/Notification';
import { NotificationDAO } from '../dao/NotificationDAO';
import { NotificationDTO } from '../dto/NotificationDTO';

export class NotificationService {
  private notificationDAO: NotificationDAO;

  constructor() {
    this.notificationDAO = new NotificationDAO();
  }

  async createNotification(dto: NotificationDTO): Promise<Notification> {
    const notificationData = this.mapDTOToNotification(dto);
    return this.notificationDAO.createNotification(notificationData);
  }

  async getNotificationById(id: number): Promise<NotificationDTO | undefined> {
    const notification = await this.notificationDAO.getNotificationById(id);

    if (notification) {
      return this.mapNotificationToDTO(notification);
    }

    return undefined;
  }


  private mapDTOToNotification(dto: NotificationDTO): Partial<Notification> {
    return {
      type: dto.type,
      message: dto.message,
      timestamp: dto.timestamp || new Date(),
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