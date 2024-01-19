import { ChatSessionDAO } from '../dao/ChatSessionDAO';
import { ChatSessionDTO } from '../dto/ChatSessionDTO';
import { ChatSession } from '../models/ChatSession';
import { UserDAO } from '../dao/UserDAO';
import { User } from '../models/User';

export class ChatSessionService {
  private chatSessionDAO: ChatSessionDAO;
  private userDAO: UserDAO;

  constructor() {
    this.chatSessionDAO = new ChatSessionDAO();
    this.userDAO = new UserDAO();
  }

  async createChatSession(dto: ChatSessionDTO): Promise<ChatSession> {
    // Here you might want to validate the participant IDs, retrieve User entities, etc.
    const participants = await Promise.all(
      dto.participantIds.map(id => this.userDAO.getUserById(id))
    );

    const chatSessionData = this.mapDTOToChatSession(dto, participants);
    return this.chatSessionDAO.createChatSession(chatSessionData);
  }

  async getChatSessionById(id: number): Promise<ChatSession | undefined> {
    return this.chatSessionDAO.getChatSessionById(id);
  }

//   async updateChatSession(id: number, dto: ChatSessionDTO): Promise<ChatSession | null> {
//     const chatSession = await this.chatSessionDAO.getChatSessionById(id);
//     if (!chatSession) return null;

//     const updatedChatSession = this.mapDTOToChatSession(dto, chatSession.participants);
//     return this.chatSessionDAO.updateChatSession(id, updatedChatSession);
//   }

//   async deleteChatSession(id: number): Promise<boolean> {
//     return this.chatSessionDAO.deleteChatSession(id);
//   }

  private mapDTOToChatSession(dto: ChatSessionDTO, participants: User[]): Partial<ChatSession> {
    return {
      ...dto,
      participants,
      creationDate: dto.creationDate || new Date(),
      lastActiveDate: dto.lastActiveDate || new Date()
    };
  }
}