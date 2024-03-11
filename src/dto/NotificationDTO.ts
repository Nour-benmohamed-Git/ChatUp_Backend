import { NotificationStatus } from '../utils/constants/enums';
import { Notification } from '../models/Notification';

export class NotificationDTO {
  id?: number;
  title?: string;
  image?: string;
  timestamp?: number;
  receiverId?: number;
  senderId?: number;
  status?: NotificationStatus;

  constructor(notification: Notification) {
    this.id = notification.id;
    this.title = notification.sender.username;
    this.image = notification.sender.profilePicture;
    this.timestamp = notification.timestamp;
    this.receiverId = notification.receiver.id;
    this.senderId = notification.sender.id;
    this.status = notification.status;
  }
}
