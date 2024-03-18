export class ChatSessionDTO {
  id: number;
  title?: string;
  image?: string;
  participantsData?: { [userId: string]: string };
  creationDate: number;
  lastActiveDate: number;
  lastMessage?: {
    content: string;
    timestamp: number;
  };
  deletedByCurrentUser?: boolean;
  unreadMessages?: { [userId: number]: number[] };
  seen?: boolean;
}
