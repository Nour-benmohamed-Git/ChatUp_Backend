export class ChatSessionDTO {
  id: number;
  title: string;
  participantsData?: { [userId: string]: string };
  creationDate: number;
  lastActiveDate: number;
  lastMessage?: {
    content: string;
    timestamp: number;
  };
  deletedByCurrentUser?: boolean;
}
