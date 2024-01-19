export class MessageDTO {
  id: number;
  content: string;
  timestamp: Date;
  edited: boolean;
  readStatus: boolean;
  senderId: number;
  receiverId?: number;
  groupId?: number;
  chatSessionId: number;
}
