import { Like, Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { Notification } from '../models/Notification';
import { NotificationStatus } from '../utils/constants/enums';

export class NotificationDAO {
  private notificationRepository: Repository<Notification>;

  constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
  }
  async getFriendRequestsByUserId(userId: number): Promise<Notification[]> {
    const friendRequests = await this.notificationRepository.find({
      where: {
        receiver: { id: userId },
        status: Like(NotificationStatus.PENDING),
      },
    });
    return friendRequests;
  }
  async createFriendRequest(
    notificationData: Partial<Notification>
  ): Promise<Notification> {
    const newNotification =
      this.notificationRepository.create(notificationData);
    return this.notificationRepository.save(newNotification);
  }
  async updateFiendRequestStatusToAccepted(id: number): Promise<Notification> {
    const notificationToUpdate = await this.notificationRepository.findOne({
      where: { id: id },
      relations: ['receiver', 'sender'],
    });

    if (notificationToUpdate) {
      notificationToUpdate.status = NotificationStatus.ACCEPTED;
      return this.notificationRepository.save(notificationToUpdate);
    }
    return null;
  }
  async updateFiendRequestStatusToDeclined(id: number): Promise<Notification> {
    const notificationToUpdate = await this.notificationRepository.findOne({
      where: { id: id },
    });
    if (notificationToUpdate) {
      notificationToUpdate.status = NotificationStatus.DECLINED;
      return this.notificationRepository.save(notificationToUpdate);
    }
    return null;
  }
}
