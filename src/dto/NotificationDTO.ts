export interface NotificationDTO {
  id?: number;
  type: string;
  message: string;
  timestamp?: Date;
  receiverId: number;
  readStatus?: boolean;
}
