export class ChatSessionDTO {
  id: number;
  image?: string;
  participantsData?: { [userId: string]: string };
  creationDate: number;
  lastActiveDate: number;
  lastMessage?: {
    content: string;
    timestamp: number;
  };
  deletedByCurrentUser?: boolean;
}
