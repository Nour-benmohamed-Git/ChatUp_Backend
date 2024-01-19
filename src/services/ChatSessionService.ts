import { ChatSessionDAO } from '../dao/ChatSessionDAO';
import { UserDAO } from '../dao/UserDAO';
import { ChatSessionDTO } from '../dto/ChatSessionDTO';
import { ChatSession } from '../models/ChatSession';
import { User } from '../models/User';

export class ChatSessionService {
  private chatSessionDAO: ChatSessionDAO;
  private userDAO: UserDAO;

  constructor() {
    this.chatSessionDAO = new ChatSessionDAO();
    this.userDAO = new UserDAO();
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return this.chatSessionDAO.getChatSessions();
  }

  async getChatSession(id: number): Promise<ChatSession | null> {
    return this.chatSessionDAO.getChatSession(id);
  }

  async createChatSession(chatSession: ChatSessionDTO): Promise<ChatSession> {
    const participants = await Promise.all(
      chatSession.participantIds.map((id) => this.userDAO.getUser(id))
    );

    const chatSessionData = this.mapDTOToChatSession(chatSession, participants);
    return this.chatSessionDAO.createChatSession(chatSessionData);
  }

  async updateChatSession(
    id: number,
    dto: ChatSessionDTO
  ): Promise<ChatSession | null> {
    const chatSession = await this.chatSessionDAO.getChatSession(id);
    if (!chatSession) return null;

    const participants = dto.participantIds
      ? await Promise.all(
          dto.participantIds.map((id) => this.userDAO.getUser(id))
        )
      : chatSession.participants;

    const updatedChatSession = this.mapDTOToChatSession(dto, participants);
    return this.chatSessionDAO.updateChatSession(id, updatedChatSession);
  }

  async deleteChatSession(id: number): Promise<boolean> {
    const deletedChatSession = await this.chatSessionDAO.deleteChatSession(id);
    return deletedChatSession !== null;
  }

  private mapDTOToChatSession(
    chatSession: ChatSessionDTO,
    participants: User[]
  ): Partial<ChatSession> {
    return {
      ...chatSession,
      participants,
      creationDate: chatSession.creationDate || new Date(),
      lastActiveDate: chatSession.lastActiveDate || new Date(),
    };
  }
}
