export interface NotificationDTO {
  id?: number;
  type: string;
  message: string;
  timestamp?: number;
  receiverId: number;
  readStatus?: boolean;
}
